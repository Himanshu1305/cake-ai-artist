// Cake generation watchdog — runs every 10 minutes via pg_cron.
// 1) Auto-fails any cake_generation_jobs stuck in 'processing' > 2 minutes.
// 2) If failure rate in the last hour is unhealthy, sends ONE alert email
//    to himanshu1305@gmail.com (rate-limited to 1 email per hour per alert type).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALERT_EMAIL = "himanshu1305@gmail.com";
// 5 min covers High Quality jobs that legitimately take 60-90s. We previously
// killed healthy jobs at 2 min which surfaced as "stuck at 75%" in the UI.
const STUCK_THRESHOLD_MINUTES = 5;
const ALERT_COOLDOWN_MINUTES = 60;
const MIN_SAMPLE_SIZE = 5;
const FAILURE_RATE_THRESHOLD = 0.5;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const result: Record<string, unknown> = { ranAt: new Date().toISOString() };

  try {
    // ---- 1) Auto-fail stuck jobs ----
    const stuckCutoff = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000).toISOString();
    const { data: stuckJobs, error: stuckErr } = await supabase
      .from("cake_generation_jobs")
      .update({
        status: "failed",
        error_message: `Auto-timeout: generation exceeded ${STUCK_THRESHOLD_MINUTES} minutes`,
        updated_at: new Date().toISOString(),
      })
      // Cover both legacy "processing" and the current "in_progress" status
      // the generate-complete-cake edge function inserts jobs with.
      .in("status", ["processing", "in_progress"])
      .lt("created_at", stuckCutoff)
      .select("id");

    if (stuckErr) console.error("[watchdog] stuck update error", stuckErr);
    const stuckCount = stuckJobs?.length ?? 0;
    result.autoFailedStuckJobs = stuckCount;

    // ---- 2) Compute last-hour health ----
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent, error: recentErr } = await supabase
      .from("cake_generation_jobs")
      .select("status, error_message")
      .gte("created_at", hourAgo);

    if (recentErr) {
      console.error("[watchdog] recent query error", recentErr);
      return new Response(JSON.stringify({ ...result, error: recentErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const total = recent?.length ?? 0;
    // Count partial_failed as a degraded outcome alongside failed — a day full
    // of partial_failed jobs is unhealthy even if no row was outright "failed".
    const failed = (recent ?? []).filter((r) => r.status === "failed" || r.status === "partial_failed").length;
    const completed = (recent ?? []).filter((r) => r.status === "completed").length;
    const failureRate = total > 0 ? failed / total : 0;

    result.lastHour = { total, failed, completed, failureRate: Math.round(failureRate * 100) / 100 };

    // ---- 3) Decide whether to alert ----
    let alertType: string | null = null;
    let alertReason = "";

    if (stuckCount >= MIN_SAMPLE_SIZE) {
      alertType = "mass_stuck_jobs";
      alertReason = `${stuckCount} cake jobs got stuck in 'processing' and were auto-failed in this run.`;
    } else if (total >= MIN_SAMPLE_SIZE && failureRate > FAILURE_RATE_THRESHOLD) {
      alertType = "high_failure_rate";
      alertReason = `Failure rate in the last hour is ${Math.round(failureRate * 100)}% (${failed} failed / ${total} attempts).`;
    }

    if (!alertType) {
      result.alertSent = false;
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- 4) Rate-limit: skip if same alert sent in last hour ----
    const cooldownCutoff = new Date(Date.now() - ALERT_COOLDOWN_MINUTES * 60 * 1000).toISOString();
    const { data: recentAlerts } = await supabase
      .from("system_alert_log")
      .select("id")
      .eq("alert_type", alertType)
      .gte("sent_at", cooldownCutoff)
      .limit(1);

    if (recentAlerts && recentAlerts.length > 0) {
      result.alertSent = false;
      result.alertSuppressedReason = "cooldown";
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- 5) Build top error breakdown ----
    const errorCounts = new Map<string, number>();
    for (const r of recent ?? []) {
      if (r.status === "failed" && r.error_message) {
        errorCounts.set(r.error_message, (errorCounts.get(r.error_message) ?? 0) + 1);
      }
    }
    const topErrors = [...errorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([msg, n]) => `<li><b>${n}×</b> ${escapeHtml(msg).slice(0, 200)}</li>`)
      .join("");

    const subject = `🚨 Cake AI Artist — Generation degraded`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fffaf3;border-radius:12px">
        <h2 style="color:#c0392b;margin-top:0">⚠️ Cake generation is degraded</h2>
        <p style="font-size:15px;color:#333">${escapeHtml(alertReason)}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
          <tr><td style="padding:6px;border-bottom:1px solid #eee"><b>Total attempts (1h)</b></td><td style="padding:6px;border-bottom:1px solid #eee">${total}</td></tr>
          <tr><td style="padding:6px;border-bottom:1px solid #eee"><b>Completed</b></td><td style="padding:6px;border-bottom:1px solid #eee;color:#27ae60">${completed}</td></tr>
          <tr><td style="padding:6px;border-bottom:1px solid #eee"><b>Failed</b></td><td style="padding:6px;border-bottom:1px solid #eee;color:#c0392b">${failed}</td></tr>
          <tr><td style="padding:6px;border-bottom:1px solid #eee"><b>Failure rate</b></td><td style="padding:6px;border-bottom:1px solid #eee">${Math.round(failureRate * 100)}%</td></tr>
          <tr><td style="padding:6px"><b>Auto-failed stuck jobs this run</b></td><td style="padding:6px">${stuckCount}</td></tr>
        </table>
        ${topErrors ? `<h3 style="font-size:14px;color:#555">Top errors</h3><ul style="font-size:13px;color:#555">${topErrors}</ul>` : ""}
        <p style="margin-top:24px"><a href="https://cakeaiartist.com/admin" style="background:#2563EB;color:white;padding:10px 18px;text-decoration:none;border-radius:8px">Open admin panel</a></p>
        <p style="font-size:11px;color:#999;margin-top:20px">You'll receive at most one alert per hour while the issue persists. Watchdog runs every 10 min.</p>
      </div>`;

    // ---- 6) Send email via Resend ----
    const resendKey = Deno.env.get("RESEND_API_KEY");
    let emailOk = false;
    let emailError: string | null = null;
    if (resendKey) {
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "Cake AI Artist Alerts <alerts@cakeaiartist.com>",
            to: [ALERT_EMAIL],
            subject,
            html,
          }),
        });
        emailOk = r.ok;
        if (!r.ok) emailError = `Resend ${r.status}: ${await r.text()}`;
      } catch (e) {
        emailError = e instanceof Error ? e.message : String(e);
      }
    } else {
      emailError = "RESEND_API_KEY not set";
    }

    // ---- 7) Log the alert ----
    await supabase.from("system_alert_log").insert({
      alert_type: alertType,
      details: { reason: alertReason, total, failed, completed, stuckCount, emailOk, emailError },
    });

    result.alertSent = emailOk;
    result.alertType = alertType;
    if (emailError) result.emailError = emailError;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[watchdog] fatal", e);
    return new Response(JSON.stringify({ ...result, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
