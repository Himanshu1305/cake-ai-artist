// Cake generation watchdog — runs every 10 minutes via pg_cron.
// 1) Auto-fails any cake_generation_jobs stuck in 'processing' > 2 minutes.
// 2) If failure rate in the last hour is unhealthy, sends ONE alert email
//    to himanshu1305@gmail.com (rate-limited to 1 email per hour per alert type).
// 3) ABSENCE detection (added Sep 7): alerts when the last 5 jobs all failed
//    (volume-based, not time-based) and, independently, when any auth.users row
//    has no confirmed email — a blocked signup produces no job at all, so the
//    failure-rate check structurally cannot see it.
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
// Credit exhaustion is a billing outage, not a flaky model: it never self-heals
// and it kills 100% of generations. Longer cooldown, but it re-sends until fixed.
const CREDITS_ALERT_COOLDOWN_MINUTES = 360;
const MIN_SAMPLE_SIZE = 3;
const FAILURE_RATE_THRESHOLD = 0.5;
// ---- Absence detection (added Sep 7) ----
// Volume is ~2 generations per WEEK, so every condition below is VOLUME-based and
// never time-based: a rule like "nothing succeeded in 24h" would fire almost every
// day at this traffic level and train us to ignore it. See PROJECT_CONTEXT §5a.
const CONSECUTIVE_FAILURE_WINDOW = 5;
const CONSECUTIVE_FAILURES_COOLDOWN_MINUTES = 720;
const USERS_BLOCKED_COOLDOWN_MINUTES = 1440;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const result: Record<string, unknown> = { ranAt: new Date().toISOString() };

  try {
    // ---- 1) Auto-fail / partial-fail stuck jobs ----
    // Jobs with at least one filled slot are marked 'partial_failed' so the
    // UI can render what we have and offer a per-slot retry. Only jobs with
    // ZERO slots filled get the terminal 'failed' status.
    const stuckCutoff = new Date(Date.now() - STUCK_THRESHOLD_MINUTES * 60 * 1000).toISOString();
    const { data: stuckCandidates, error: stuckSelErr } = await supabase
      .from("cake_generation_jobs")
      .select("id, hero_url, side_url, top_url")
      .in("status", ["processing", "in_progress"])
      .lt("created_at", stuckCutoff);

    if (stuckSelErr) console.error("[watchdog] stuck select error", stuckSelErr);

    let stuckCount = 0;
    let partialCount = 0;
    for (const j of stuckCandidates ?? []) {
      const filled = [j.hero_url, j.side_url, j.top_url].filter(Boolean).length;
      const nextStatus = filled > 0 ? "partial_failed" : "failed";
      const { error: upErr } = await supabase
        .from("cake_generation_jobs")
        .update({
          status: nextStatus,
          error_message: `Auto-timeout: generation exceeded ${STUCK_THRESHOLD_MINUTES} minutes (filled ${filled}/3 views)`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", j.id);
      if (upErr) {
        console.error("[watchdog] stuck update error", j.id, upErr);
        continue;
      }
      if (nextStatus === "failed") stuckCount += 1;
      else partialCount += 1;
    }
    result.autoFailedStuckJobs = stuckCount;
    result.autoPartialStuckJobs = partialCount;

    // ---- 2) Compute last-hour health ----
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recent, error: recentErr } = await supabase
      .from("cake_generation_jobs")
      .select("status, error_message, hero_error, side_error, top_error")
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

    // ---- 3) Detect mass identical hero errors ----
    const heroErrorCounts = new Map<string, number>();
    for (const r of recent ?? []) {
      if ((r.status === "failed" || r.status === "partial_failed") && r.hero_error) {
        heroErrorCounts.set(r.hero_error, (heroErrorCounts.get(r.hero_error) ?? 0) + 1);
      }
    }
    const dominantHeroError = [...heroErrorCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const massIdenticalError =
      failed >= MIN_SAMPLE_SIZE &&
      dominantHeroError &&
      dominantHeroError[1] / failed > 0.8
        ? dominantHeroError[0]
        : null;

    // ---- 3b) Detect credit exhaustion ----
    // A single CREDITS_EXHAUSTED job is enough: it means the AI gateway is
    // refusing every request, so there is no "sample size" to wait for.
    const creditsFailures = (recent ?? []).filter((r) =>
      [r.hero_error, r.side_error, r.top_error, r.error_message]
        .some((e) => typeof e === "string" && e.includes("CREDITS_EXHAUSTED"))
    ).length;
    result.creditsFailuresLastHour = creditsFailures;

    // ---- 3c) Detect consecutive failures (ABSENCE detection) ----
    // Traffic-independent: the last N jobs regardless of age, so it fires whether
    // they accumulated over an hour or over a month. The failure-RATE check below
    // needs MIN_SAMPLE_SIZE jobs inside ONE hour, which at ~2 jobs/week is almost
    // never true — that is how a week of 2-out-of-2 failures stayed silent.
    const { data: lastJobs, error: lastJobsErr } = await supabase
      .from("cake_generation_jobs")
      .select("status")
      .order("created_at", { ascending: false })
      .limit(CONSECUTIVE_FAILURE_WINDOW);
    if (lastJobsErr) console.error("[watchdog] last-jobs query error", lastJobsErr);
    const consecutiveFailures =
      (lastJobs?.length ?? 0) === CONSECUTIVE_FAILURE_WINDOW &&
      (lastJobs ?? []).every((j) => j.status !== "completed");
    result.consecutiveFailures = consecutiveFailures;

    // ---- 3d) INDEPENDENT auth-health check ----
    // Deliberately NOT a branch in the alert chain below: auth health has nothing
    // to do with generation health, and both must be able to alert in the SAME run.
    // This is the check that would have caught Aug 14 and Sep 7 — see §3.9.
    // auth.users is not reachable through PostgREST (public schema only), so the
    // equivalent of SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL
    // is a paginated admin scan. ~470 users today = a single page.
    const checkUsersBlocked = async () => {
      let unconfirmed = 0;
      for (let page = 1; page <= 20; page++) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) {
          console.error("[watchdog] listUsers error", error);
          result.usersBlocked = { error: error.message };
          return;
        }
        const users = data?.users ?? [];
        for (const u of users) if (!u.email_confirmed_at) unconfirmed += 1;
        if (users.length < 1000) break;
      }
      if (unconfirmed === 0) {
        result.usersBlocked = { unconfirmed: 0, alertSent: false };
        return;
      }
      const cutoff = new Date(Date.now() - USERS_BLOCKED_COOLDOWN_MINUTES * 60 * 1000).toISOString();
      const { data: alreadySent } = await supabase
        .from("system_alert_log")
        .select("id")
        .eq("alert_type", "users_blocked")
        .gte("sent_at", cutoff)
        .limit(1);
      if (alreadySent && alreadySent.length > 0) {
        result.usersBlocked = { unconfirmed, alertSent: false, suppressedReason: "cooldown" };
        return;
      }
      const plural = unconfirmed === 1 ? "" : "s";
      const blockedSubject = `🔒 Cake AI Artist — ${unconfirmed} user${plural} cannot confirm their email`;
      const blockedHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fffaf3;border-radius:12px">
          <h2 style="color:#c0392b;margin-top:0">🔒 ${unconfirmed} user${plural} cannot confirm their email</h2>
          <p style="font-size:15px;color:#333"><b>New signups cannot log in.</b> ${unconfirmed} account${plural} in auth.users ${unconfirmed === 1 ? "has" : "have"} no confirmed email — either the confirmation email never arrived, or confirmation is switched on behind a low SMTP rate limit.</p>
          <p style="font-size:14px;color:#c0392b;background:#fdecea;padding:12px;border-radius:8px"><b>Fix:</b> Supabase Dashboard → Authentication → Sign In/Providers → Email → <b>Confirm email OFF</b>, and Authentication → Rate Limits → raise email sends. Then back-confirm the affected users via SQL. See PROJECT_CONTEXT §3.9.</p>
          <p style="font-size:13px;color:#555">This has happened twice: Aug 14 (72 of 117 signups) and Sep 7 (~30 users blocked for ~3 weeks). Auth settings are per-project and did not survive the migration.</p>
          <p style="margin-top:24px"><a href="https://supabase.com/dashboard/project/gadiwsbvbycfygsaizja/auth/providers" style="background:#2563EB;color:white;padding:10px 18px;text-decoration:none;border-radius:8px">Open auth settings</a></p>
          <p style="font-size:11px;color:#999;margin-top:20px">At most one of these per 24h while the issue persists. Watchdog runs every 10 min.</p>
        </div>`;
      const { ok, error: mailErr } = await sendAlertEmail(blockedSubject, blockedHtml);
      await supabase.from("system_alert_log").insert({
        alert_type: "users_blocked",
        details: { unconfirmed, emailOk: ok, emailError: mailErr },
      });
      result.usersBlocked = { unconfirmed, alertSent: ok, ...(mailErr ? { emailError: mailErr } : {}) };
    };

    // Every non-fatal exit goes through finish(), so the auth check still runs on
    // the common path where generation is healthy and nothing else alerts.
    const finish = async () => {
      await checkUsersBlocked();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    };

    // ---- 4) Decide whether to alert ----
    let alertType: string | null = null;
    let alertReason = "";

    if (creditsFailures > 0) {
      alertType = "credits_exhausted";
      alertReason = `AI credits are exhausted — ${creditsFailures} cake generation${creditsFailures === 1 ? "" : "s"} failed in the last hour because the AI gateway returned 402. EVERY generation is failing until the workspace is topped up.`;
    } else if (consecutiveFailures) {
      alertType = "consecutive_failures";
      alertReason = `The last ${CONSECUTIVE_FAILURE_WINDOW} cake generations ALL failed — none reached status 'completed', however long they took to accumulate. At current volume this is the signal that generation is broken; the hourly failure-rate check needs ${MIN_SAMPLE_SIZE} jobs within one hour and will not see it.`;
    } else if (stuckCount >= MIN_SAMPLE_SIZE) {
      alertType = "mass_stuck_jobs";
      alertReason = `${stuckCount} cake jobs got stuck in 'processing' and were auto-failed in this run.`;
    } else if (total >= MIN_SAMPLE_SIZE && failureRate > FAILURE_RATE_THRESHOLD) {
      alertType = massIdenticalError ? "high_failure_rate+mass_identical_error" : "high_failure_rate";
      alertReason = `Failure rate in the last hour is ${Math.round(failureRate * 100)}% (${failed} failed / ${total} attempts).`;
    }

    if (!alertType) {
      result.alertSent = false;
      return await finish();
    }

    // ---- 5) Rate-limit: skip if same base alert type sent recently ----
    // Cooldown is per alert type, so a credits alert is never swallowed by a
    // generic "degraded" alert that happened to fire first.
    const baseAlertType = alertType.split("+")[0];
    const COOLDOWN_BY_TYPE: Record<string, number> = {
      credits_exhausted: CREDITS_ALERT_COOLDOWN_MINUTES,
      consecutive_failures: CONSECUTIVE_FAILURES_COOLDOWN_MINUTES,
    };
    const cooldownMinutes = COOLDOWN_BY_TYPE[baseAlertType] ?? ALERT_COOLDOWN_MINUTES;
    const cooldownCutoff = new Date(Date.now() - cooldownMinutes * 60 * 1000).toISOString();
    const { data: recentAlerts } = await supabase
      .from("system_alert_log")
      .select("id")
      .like("alert_type", `${baseAlertType}%`)
      .gte("sent_at", cooldownCutoff)
      .limit(1);

    if (recentAlerts && recentAlerts.length > 0) {
      result.alertSent = false;
      result.alertSuppressedReason = "cooldown";
      return await finish();
    }

    // ---- 6) Build top error breakdown ----
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

    const isCredits = alertType === "credits_exhausted";
    const isConsecutive = alertType === "consecutive_failures";
    const subject = isCredits
      ? `💳 Cake AI Artist — AI CREDITS EXHAUSTED, all generations failing`
      : isConsecutive
        ? `⚠️ Cake AI Artist — last ${CONSECUTIVE_FAILURE_WINDOW} generations all failed`
        : massIdenticalError
          ? `🚨 Cake AI Artist — Mass identical error: ${massIdenticalError.slice(0, 80)}`
          : `🚨 Cake AI Artist — Generation degraded`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fffaf3;border-radius:12px">
        <h2 style="color:#c0392b;margin-top:0">${isCredits ? "💳 AI credits exhausted — top up now" : "⚠️ Cake generation is degraded"}</h2>
        <p style="font-size:15px;color:#333">${escapeHtml(alertReason)}</p>
        ${isCredits ? `<p style="font-size:14px;color:#c0392b;background:#fdecea;padding:12px;border-radius:8px"><b>Action:</b> add credits in Lovable → Settings → Plans &amp; credits. Nothing else is broken — generation resumes the moment credits are available. You'll get this reminder again in 6 hours if it is still failing.</p>` : ""}
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

    // ---- 7) Send email via Resend ----
    const { ok: emailOk, error: emailError } = await sendAlertEmail(subject, html);

    // ---- 8) Log the alert ----
    await supabase.from("system_alert_log").insert({
      alert_type: alertType,
      details: { reason: alertReason, total, failed, completed, stuckCount, emailOk, emailError, massIdenticalError },
    });

    result.alertSent = emailOk;
    result.alertType = alertType;
    if (emailError) result.emailError = emailError;

    return await finish();
  } catch (e) {
    console.error("[watchdog] fatal", e);
    return new Response(JSON.stringify({ ...result, error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Shared Resend sender — used by the generation alert and by the independent
// users_blocked alert, which must be able to fire in the same run.
async function sendAlertEmail(subject: string, html: string): Promise<{ ok: boolean; error: string | null }> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return { ok: false, error: "RESEND_API_KEY not set" };
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
    return { ok: r.ok, error: r.ok ? null : `Resend ${r.status}: ${await r.text()}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
