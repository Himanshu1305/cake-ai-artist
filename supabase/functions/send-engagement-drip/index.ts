import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

type EmailType = "day2_welcome" | "day7_trends" | "day14_final";

const SUBJECTS: Record<EmailType, string> = {
  day2_welcome: "Did something stop you? Here's what you're missing 🎂",
  day7_trends: "See what's trending on Cake AI Artist this week ✨",
  day14_final: "A free design idea, just for you 🎁",
};

function emailLayout(inner: string, unsubscribeUrl: string): string {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f5f2;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f2;padding:40px 20px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#8B5CF6 0%,#D946EF 50%,#F97316 100%);padding:30px;text-align:center;">
        <img src="https://cakeaiartist.com/logo.png" alt="Cake AI Artist" width="48" height="48" style="border-radius:12px;margin-bottom:8px;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">Cake AI Artist</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">AI-Powered Cake Design</p>
      </td></tr>
      ${inner}
      <tr><td style="background-color:#f9fafb;padding:20px 30px;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;">
          You're receiving this because you signed up for Cake AI Artist.
        </p>
        <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;">
          <a href="${unsubscribeUrl}" style="color:#8B5CF6;text-decoration:underline;">Unsubscribe from these emails</a>
        </p>
        <p style="margin:0;color:#aaa;font-size:11px;text-align:center;">
          © ${new Date().getFullYear()} Cake AI Artist by USD Vision AI LLP | support@cakeaiartist.com
        </p>
      </td></tr>
    </table></td></tr></table></body></html>`;
}

function day2Layout(inner: string, unsubscribeUrl: string): string {
  return `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f5f2;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f2;padding:40px 20px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr><td style="background:linear-gradient(135deg,#fdf8f0 0%,#fcecc9 100%);padding:18px 24px;border-bottom:2px solid #E5B547;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td align="left" style="vertical-align:middle;">
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:middle;padding-right:12px;">
                <img src="https://cakeaiartist.com/logo.png" alt="Cake AI Artist" width="52" height="52" style="border-radius:12px;display:block;">
              </td>
              <td style="vertical-align:middle;">
                <h1 style="margin:0;color:#1a1a2e;font-size:22px;font-weight:800;font-family:Georgia,'Times New Roman',serif;">Cake AI Artist</h1>
              </td>
            </tr></table>
          </td>
          <td align="right" style="vertical-align:middle;">
            <span style="display:inline-block;background:#ffffff;color:#8a6a1a;font-size:12px;font-weight:700;padding:7px 14px;border-radius:50px;border:1px solid #E5B547;white-space:nowrap;">⭐ 4.9 · Loved in 30+ countries</span>
          </td>
        </tr></table>
      </td></tr>
      ${inner}
      <tr><td style="background-color:#fdf8f0;padding:20px 30px;border-top:1px solid #f0e3c4;">
        <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;">
          You're receiving this because you signed up for Cake AI Artist.
        </p>
        <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;">
          <a href="${unsubscribeUrl}" style="color:#2563EB;text-decoration:underline;">Unsubscribe from these emails</a>
        </p>
        <p style="margin:0;color:#aaa;font-size:11px;text-align:center;">
          © ${new Date().getFullYear()} Cake AI Artist by USD Vision AI LLP | support@cakeaiartist.com
        </p>
      </td></tr>
    </table></td></tr></table></body></html>`;
}

const LANDING_BY_COUNTRY: Record<string, string> = {
  IN: "/india", UK: "/uk", GB: "/uk", CA: "/canada", AU: "/australia",
};
function localizedHome(country?: string | null): string {
  const c = (country || "").toUpperCase();
  return `https://cakeaiartist.com${LANDING_BY_COUNTRY[c] || "/"}`;
}
function localizedPath(path: string, country?: string | null): string {
  const c = (country || "").toUpperCase();
  const sep = path.includes("?") ? "&" : "?";
  return `https://cakeaiartist.com${path}${sep}ref=email${c ? `&country=${c}` : ""}`;
}

function day2Email(firstName: string, unsubscribeUrl: string, country?: string | null): string {
  const featureCard = (emoji: string, title: string, desc: string, href: string, cta: string) => `
    <tr><td style="padding:0 0 14px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;border-left:4px solid #E5B547;border-radius:8px;">
        <tr><td style="padding:16px 18px;">
          <p style="margin:0 0 4px;color:#1a1a2e;font-size:16px;font-weight:700;">${emoji} ${title}</p>
          <p style="margin:0 0 10px;color:#555;font-size:14px;line-height:1.5;">${desc}</p>
          <a href="${href}" style="color:#2563EB;font-size:14px;font-weight:600;text-decoration:none;">${cta} →</a>
        </td></tr>
      </table>
    </td></tr>`;

  const inner = `
    <tr><td style="padding:30px 30px 8px;">
      <p style="margin:0 0 14px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"} 👋</p>
      <p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.6;">
        Thanks again for joining Cake AI Artist — it really means a lot. 💛
      </p>
      <p style="margin:0 0 22px;color:#333;font-size:15px;line-height:1.6;">
        We noticed you haven't had a chance to try anything out yet. No worries — life gets busy! Here's a quick peek at a few things you can explore whenever you're ready:
      </p>
      <h2 style="margin:0 0 14px;color:#1a1a2e;font-size:18px;">Pick where to start ✨</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${featureCard("🎂", "Design your first cake", "Type a name and an occasion — get a beautiful AI cake in under 30 seconds.", localizedPath("/free-cake-designer", country), "Open the designer")}
        ${featureCard("🖼️", "Browse the community gallery", "See what other creators are making this week and grab some inspiration.", localizedPath("/gallery", country), "Explore the gallery")}
        ${featureCard("📖", "Read the blog", "Cake trends, ideas, and tips for every kind of celebration.", localizedPath("/blog", country), "Read latest posts")}
        ${featureCard("🎁", "Try the Party Pack generator", "Matching invites, thank-you cards & printables — all from one design.", localizedPath("/party-planner", country), "Plan a party")}
      </table>
      <div style="margin:18px 0 22px;padding:14px 16px;background:#fdf6e3;border:1px solid #f0e3c4;border-radius:8px;text-align:center;">
        <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;">⭐⭐⭐⭐⭐ Loved by thousands of creators worldwide</p>
        <p style="margin:6px 0 0;font-size:13px;"><a href="${localizedPath("/gallery", country)}" style="color:#2563EB;text-decoration:underline;">See real reviews & creations →</a></p>
      </div>
      <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">
        Something not working, or stuck on what to make? Just hit reply — we read every email and we'd love to help. You can also browse our <a href="${localizedPath("/faq", country)}" style="color:#2563EB;">FAQ</a> or <a href="${localizedPath("/contact", country)}" style="color:#2563EB;">contact us</a>.
      </p>
    </td></tr>
    <tr><td style="padding:8px 30px 30px;text-align:center;">
      <a href="${localizedHome(country)}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#E5B547 100%);color:#1a1a2e;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(229,181,71,0.35);">
        🎂 Start with a cake
      </a>
    </td></tr>`;
  return day2Layout(inner, unsubscribeUrl);
}

function day7Email(firstName: string, unsubscribeUrl: string, country?: string | null): string {
  const inner = `
    <tr><td style="padding:30px 30px 10px;">
      <p style="margin:0 0 16px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"}! ✨</p>
      <p style="margin:0 0 18px;color:#333;font-size:15px;line-height:1.6;">
        We noticed you haven't designed your first cake yet — totally fine! Sometimes a little inspiration is all it takes. Here's what other creators have been making this week:
      </p>
      <h2 style="margin:0 0 14px;color:#1a1a2e;font-size:20px;">🔥 Trending right now</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
        <tr><td style="padding:8px 0;font-size:15px;color:#333;">🎂 Birthday cakes with names spelled in icing</td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#333;">💍 Elegant anniversary cakes with floral details</td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#333;">🦄 Kids' party cakes with favourite characters</td></tr>
        <tr><td style="padding:8px 0;font-size:15px;color:#333;">🌸 Cute mini-cakes for "just because" moments</td></tr>
      </table>
      <p style="margin:0 0 18px;color:#555;font-size:15px;line-height:1.6;">
        Browse hundreds of fresh designs from our community for ideas:
      </p>
      <p style="margin:0 0 18px;text-align:center;">
        <a href="${localizedPath("/gallery", country)}" style="color:#2563EB;font-weight:600;text-decoration:underline;">→ Visit the Community Gallery</a>
      </p>
      <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">
        Want more cake ideas, tips, and trends? Our <a href="${localizedPath("/blog", country)}" style="color:#2563EB;">blog</a> is full of inspiration for every occasion.
      </p>
    </td></tr>
    <tr><td style="padding:18px 30px 30px;text-align:center;">
      <a href="${localizedHome(country)}" style="display:inline-block;background:linear-gradient(135deg,#8B5CF6 0%,#D946EF 100%);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 15px rgba(139,92,246,0.4);">
        🎨 Design My Cake Now
      </a>
    </td></tr>`;
  return emailLayout(inner, unsubscribeUrl);
}

function day14Email(firstName: string, unsubscribeUrl: string, country?: string | null): string {
  const inner = `
    <tr><td style="padding:30px 30px 10px;">
      <p style="margin:0 0 16px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"} 💛</p>
      <p style="margin:0 0 18px;color:#333;font-size:15px;line-height:1.6;">
        Last little nudge from us — promise! We just wanted to share one quick idea before you go.
      </p>
      <div style="background:#fef9f5;border-left:4px solid #F97316;padding:18px 20px;border-radius:8px;margin:0 0 20px;">
        <p style="margin:0 0 8px;color:#1a1a2e;font-size:15px;font-weight:600;">🎁 A free idea, on us:</p>
        <p style="margin:0;color:#333;font-size:15px;line-height:1.6;">
          Whose birthday or anniversary is coming up? Type their name + the occasion into our designer and you'll have a beautiful, personalised cake design in under a minute. Print it, share it, or just save it as a fun keepsake.
        </p>
      </div>
      <p style="margin:0 0 18px;color:#555;font-size:15px;line-height:1.6;">
        If something's been blocking you from trying it, just hit reply — we read every email and we'd love to help.
      </p>
      <p style="margin:0 0 18px;color:#555;font-size:14px;line-height:1.6;">
        Either way, thanks so much for joining us. Whenever you're ready, we'll be here. 🎂
      </p>
    </td></tr>
    <tr><td style="padding:0 30px 30px;text-align:center;">
      <a href="${localizedHome(country)}" style="display:inline-block;background:linear-gradient(135deg,#8B5CF6 0%,#D946EF 100%);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 15px rgba(139,92,246,0.4);">
        ✨ Try It Free
      </a>
      <p style="margin:18px 0 0;color:#888;font-size:13px;">Questions? Browse the <a href="${localizedPath("/faq", country)}" style="color:#2563EB;">FAQ</a>.</p>
    </td></tr>`;
  return emailLayout(inner, unsubscribeUrl);
}

function buildEmailHtml(type: EmailType, firstName: string, unsubscribeUrl: string, country?: string | null): string {
  switch (type) {
    case "day2_welcome": return day2Email(firstName, unsubscribeUrl, country);
    case "day7_trends": return day7Email(firstName, unsubscribeUrl, country);
    case "day14_final": return day14Email(firstName, unsubscribeUrl, country);
  }
}

async function sendBrevo(toEmail: string, toName: string, subject: string, html: string) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Cake AI Artist", email: "welcome@cakeaiartist.com" },
      to: [{ email: toEmail, name: toName }],
      subject,
      htmlContent: html,
    }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth: CRON_SECRET or valid JWT
    const cronSecret = req.headers.get("X-Cron-Secret");
    const expected = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");
    let isAuthorized = expected && cronSecret === expected;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!isAuthorized && authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) isAuthorized = true;
    }
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional body: testEmail + variant for admin test
    let testEmail: string | null = null;
    let testVariant: EmailType | null = null;
    try {
      const body = await req.json();
      testEmail = body?.testEmail || null;
      testVariant = body?.variant || null;
    } catch { /* no body */ }

    const { data: taskRun } = await supabase.from("scheduled_task_runs").insert({
      task_name: "engagement-drip", status: "running", started_at: new Date().toISOString(),
    }).select().single();

    // Test mode
    if (testEmail && testVariant) {
      const { data: profile } = await supabase.from("profiles")
        .select("first_name").eq("email", testEmail).maybeSingle();
      const firstName = profile?.first_name || "there";
      const html = buildEmailHtml(testVariant, firstName, "https://cakeaiartist.com/settings");
      const result = await sendBrevo(testEmail, firstName, `[TEST] ${SUBJECTS[testVariant]}`, html);

      if (taskRun) {
        await supabase.from("scheduled_task_runs").update({
          status: result.ok ? "success" : "failed",
          completed_at: new Date().toISOString(),
          records_processed: result.ok ? 1 : 0,
          result_message: `Test ${testVariant} sent to ${testEmail}`,
          error_message: result.ok ? null : result.body,
        }).eq("id", taskRun.id);
      }
      return new Response(JSON.stringify({ success: result.ok, variant: testVariant, error: result.ok ? null : result.body }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Production: find inactive users (never generated an image)
    // Get all users who HAVE created images so we can exclude them
    const { data: activeUsers } = await supabase
      .from("generated_images")
      .select("user_id");
    const activeIds = new Set((activeUsers || []).map((r: any) => r.user_id));

    const { data: profiles, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, email, first_name, created_at, is_premium");
    if (profilesErr) throw profilesErr;

    const candidates = (profiles || []).filter((p: any) =>
      !p.is_premium && !activeIds.has(p.id) && p.email
    );

    // Settings opt-out
    const ids = candidates.map((p: any) => p.id);
    const { data: settings } = await supabase
      .from("user_settings").select("user_id, marketing_emails").in("user_id", ids);
    const optedOut = new Set((settings || []).filter((s: any) => s.marketing_emails === false).map((s: any) => s.user_id));

    // Already-sent logs
    const { data: existingLogs } = await supabase
      .from("engagement_email_logs").select("user_id, email_type").in("user_id", ids);
    const sentMap = new Map<string, Set<string>>();
    (existingLogs || []).forEach((l: any) => {
      if (!sentMap.has(l.user_id)) sentMap.set(l.user_id, new Set());
      sentMap.get(l.user_id)!.add(l.email_type);
    });

    const now = Date.now();
    let sentCount = 0;
    let failCount = 0;
    let skipCount = 0;
    const errors: string[] = [];

    for (const user of candidates) {
      if (optedOut.has(user.id)) { skipCount++; continue; }
      const ageDays = Math.floor((now - new Date(user.created_at).getTime()) / 86400000);

      let type: EmailType | null = null;
      if (ageDays >= 14) type = "day14_final";
      else if (ageDays >= 7) type = "day7_trends";
      else if (ageDays >= 2) type = "day2_welcome";

      if (!type) { skipCount++; continue; }
      if (sentMap.get(user.id)?.has(type)) { skipCount++; continue; }

      try {
        const html = buildEmailHtml(type, user.first_name || "", "https://cakeaiartist.com/settings");
        const result = await sendBrevo(user.email, user.first_name || "", SUBJECTS[type], html);

        if (result.ok) {
          await supabase.from("engagement_email_logs").insert({
            user_id: user.id, email_type: type, sent_at: new Date().toISOString(),
          });
          sentCount++;
        } else {
          errors.push(`${user.email} (${type}): ${result.status} ${result.body.substring(0, 200)}`);
          failCount++;
        }
      } catch (err: any) {
        errors.push(`${user.email}: ${err.message}`);
        failCount++;
      }
    }

    if (taskRun) {
      await supabase.from("scheduled_task_runs").update({
        status: failCount > 0 && sentCount === 0 ? "failed" : "success",
        completed_at: new Date().toISOString(),
        records_processed: sentCount,
        result_message: `Sent ${sentCount}, failed ${failCount}, skipped ${skipCount}`,
        error_message: errors.length > 0 ? errors.slice(0, 5).join(" | ") : null,
      }).eq("id", taskRun.id);
    }

    return new Response(JSON.stringify({
      success: true, sent: sentCount, failed: failCount, skipped: skipCount,
      errors: errors.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("engagement-drip error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
