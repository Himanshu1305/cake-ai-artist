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

type Campaign = "recent_visitors" | "we_miss_you";
type EmailType = "recent_visitor_no_cake" | "we_miss_you";

const TASK_NAME: Record<Campaign, string> = {
  recent_visitors: "engagement-recent-visitors",
  we_miss_you: "engagement-we-miss-you",
};

const EMAIL_TYPE: Record<Campaign, EmailType> = {
  recent_visitors: "recent_visitor_no_cake",
  we_miss_you: "we_miss_you",
};

// ---------------- Layout (Day-2 finalized template) ----------------
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

// ---------------- Email A: Recent visitor, no cake yet ----------------
function recentVisitorEmail(firstName: string, unsubscribeUrl: string, country?: string | null): { subject: string; html: string } {
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
  return {
    subject: "Did something stop you? Here's what you're missing 🎂",
    html: day2Layout(inner, unsubscribeUrl),
  };
}

// ---------------- Email B: We Miss You (3 random variants) ----------------
function weMissYouVariant1(firstName: string, country?: string | null): { subject: string; inner: string } {
  // Warm + features recap
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
      <p style="margin:0 0 14px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"} 💛</p>
      <p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.6;">
        It's been a little while — we've genuinely missed you around here. ✨
      </p>
      <p style="margin:0 0 22px;color:#333;font-size:15px;line-height:1.6;">
        Quite a bit has been happening at Cake AI Artist since you last popped in. Here's a quick look at what's waiting for you:
      </p>
      <h2 style="margin:0 0 14px;color:#1a1a2e;font-size:18px;">What's new and worth a peek ✨</h2>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${featureCard("🎂", "Free Cake Designer", "Type a name and an occasion — and watch a beautiful AI cake appear in seconds.", localizedPath("/free-cake-designer", country), "Try a fresh design")}
        ${featureCard("🖼️", "Community Gallery", "Hundreds of brand-new creations from people all over the world this month.", localizedPath("/gallery", country), "Get inspired")}
        ${featureCard("🎁", "Party Pack Generator", "Turn a single cake design into matching invites, thank-you cards & printables.", localizedPath("/party-planner", country), "Plan a party")}
        ${featureCard("📖", "Blog & Trends", "Fresh ideas for birthdays, anniversaries, baby showers and more.", localizedPath("/blog", country), "Read what's new")}
      </table>
      <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">
        Whenever you're ready, we'd love to have you back. And if anything was confusing or frustrating last time — just hit reply, we read every email.
      </p>
    </td></tr>
    <tr><td style="padding:8px 30px 30px;text-align:center;">
      <a href="${localizedHome(country)}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#E5B547 100%);color:#1a1a2e;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(229,181,71,0.35);">
        ✨ Take a look around
      </a>
    </td></tr>`;
  return { subject: "We've missed you at Cake AI Artist 💛", inner };
}

function weMissYouVariant2(firstName: string, country?: string | null): { subject: string; inner: string } {
  // Single big idea / inspiration
  const inner = `
    <tr><td style="padding:30px 30px 8px;">
      <p style="margin:0 0 14px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"} 🎂</p>
      <p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.6;">
        Quick thought before you go about your day — whose birthday or anniversary is coming up next?
      </p>
      <div style="margin:18px 0 22px;padding:18px 20px;background:#fdf8f0;border-left:4px solid #E5B547;border-radius:8px;">
        <p style="margin:0 0 8px;color:#1a1a2e;font-size:16px;font-weight:700;">🎯 One small idea:</p>
        <p style="margin:0;color:#333;font-size:15px;line-height:1.6;">
          Pop their name + the occasion into our designer — and in about 30 seconds you'll have a beautiful, personalised cake design ready to share, print, or save as a keepsake. No baking required. 😄
        </p>
      </div>
      <p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.6;">
        It's the kind of thing that makes someone smile, and you can do it on a coffee break.
      </p>
      <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">
        Need a little nudge for inspiration? Have a quick browse of the <a href="${localizedPath("/gallery", country)}" style="color:#2563EB;">community gallery</a> — there's something for every kind of celebration.
      </p>
    </td></tr>
    <tr><td style="padding:8px 30px 30px;text-align:center;">
      <a href="${localizedPath("/free-cake-designer", country)}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#E5B547 100%);color:#1a1a2e;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(229,181,71,0.35);">
        🎂 Design a cake now
      </a>
    </td></tr>`;
  return { subject: "Your next cake idea is one click away ✨", inner };
}

function weMissYouVariant3(firstName: string, country?: string | null): { subject: string; inner: string } {
  // Gift / freebie framing
  const inner = `
    <tr><td style="padding:30px 30px 8px;">
      <p style="margin:0 0 14px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"} 🎁</p>
      <p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.6;">
        Just a tiny, friendly nudge — there's a free cake design idea waiting for you. ✨
      </p>
      <div style="margin:18px 0 22px;padding:18px 20px;background:#fef9f5;border-left:4px solid #F97316;border-radius:8px;">
        <p style="margin:0 0 8px;color:#1a1a2e;font-size:16px;font-weight:700;">🎁 Here's our little gift:</p>
        <p style="margin:0 0 10px;color:#333;font-size:15px;line-height:1.6;">
          Come back, type any name + occasion, and we'll create a personalised cake design for you — completely free. No card, no catch, just a fun creative moment.
        </p>
        <p style="margin:0;color:#333;font-size:14px;line-height:1.6;">
          It usually takes less than a minute, and the result is the kind of thing people love receiving on WhatsApp. 💬
        </p>
      </div>
      <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">
        If something stopped you last time, just hit reply and tell us — we read every email and we're happy to help. Or peek at the <a href="${localizedPath("/faq", country)}" style="color:#2563EB;">FAQ</a> if you have a quick question.
      </p>
    </td></tr>
    <tr><td style="padding:8px 30px 30px;text-align:center;">
      <a href="${localizedPath("/free-cake-designer", country)}" style="display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#E5B547 100%);color:#1a1a2e;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(229,181,71,0.35);">
        🎁 Claim my free design
      </a>
    </td></tr>`;
  return { subject: "A little gift waiting for you 🎁", inner };
}

function weMissYouEmail(firstName: string, unsubscribeUrl: string, country?: string | null): { subject: string; html: string; variant: number } {
  const variant = Math.floor(Math.random() * 3); // 0, 1, 2
  const builders = [weMissYouVariant1, weMissYouVariant2, weMissYouVariant3];
  const { subject, inner } = builders[variant](firstName, country);
  return { subject, html: day2Layout(inner, unsubscribeUrl), variant };
}

function safeRecipientName(firstName: string | null | undefined, email: string): string {
  const fn = (firstName || "").trim();
  if (fn) return fn;
  const local = (email.split("@")[0] || "there").replace(/[._-]+/g, " ").trim();
  if (!local) return "there";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

async function sendBrevo(toEmail: string, toName: string, subject: string, html: string) {
  const safeName = toName && toName.trim() ? toName.trim() : safeRecipientName(null, toEmail);
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": BREVO_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({
      sender: { name: "Cake AI Artist", email: "welcome@cakeaiartist.com" },
      to: [{ email: toEmail, name: safeName }],
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

    let campaign: Campaign = "recent_visitors";
    let testEmail: string | null = null;
    try {
      const body = await req.json();
      if (body?.campaign === "we_miss_you" || body?.campaign === "recent_visitors") {
        campaign = body.campaign;
      }
      testEmail = body?.testEmail || null;
    } catch { /* no body */ }

    const taskName = TASK_NAME[campaign];
    const emailType = EMAIL_TYPE[campaign];

    const { data: taskRun } = await supabase.from("scheduled_task_runs").insert({
      task_name: taskName, status: "running", started_at: new Date().toISOString(),
    }).select().single();

    // -------- Test mode: send a single preview to one email --------
    if (testEmail) {
      const { data: profile } = await supabase.from("profiles")
        .select("first_name, country").eq("email", testEmail).maybeSingle();
      const firstName = profile?.first_name || "there";
      const country = profile?.country || null;
      const built = campaign === "recent_visitors"
        ? recentVisitorEmail(firstName, "https://cakeaiartist.com/settings", country)
        : weMissYouEmail(firstName, "https://cakeaiartist.com/settings", country);
      const result = await sendBrevo(testEmail, firstName, `[TEST] ${built.subject}`, built.html);
      if (taskRun) {
        await supabase.from("scheduled_task_runs").update({
          status: result.ok ? "success" : "failed",
          completed_at: new Date().toISOString(),
          records_processed: result.ok ? 1 : 0,
          result_message: `Test ${campaign} sent to ${testEmail}`,
          error_message: result.ok ? null : result.body,
        }).eq("id", taskRun.id);
      }
      return new Response(JSON.stringify({ success: result.ok, campaign, error: result.ok ? null : result.body }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // -------- Build candidate set --------
    const { data: profiles, error: profilesErr } = await supabase
      .from("profiles")
      .select("id, email, first_name, country");
    if (profilesErr) throw profilesErr;
    const allUsers = (profiles || []).filter((p: any) => p.email);
    const idSet = new Set(allUsers.map((p: any) => p.id));

    let eligible: any[] = [];

    if (campaign === "recent_visitors") {
      // visited in last 7 days (incl today)
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: recentVisits } = await supabase
        .from("page_visits")
        .select("user_id")
        .gte("visited_at", sevenDaysAgo)
        .not("user_id", "is", null);
      const recentIds = new Set((recentVisits || []).map((r: any) => r.user_id).filter((id: any) => id && idSet.has(id)));

      // exclude users with any generated_images
      const { data: imgRows } = await supabase.from("generated_images").select("user_id");
      const creatorIds = new Set((imgRows || []).map((r: any) => r.user_id));

      eligible = allUsers.filter((u: any) => recentIds.has(u.id) && !creatorIds.has(u.id));
    } else {
      // we_miss_you: max page_visits per user is >= 30 days ago, AND user has at least one historical visit
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).getTime();
      // Get latest visit per user (paginate guard at 1000 default; bump limit)
      const { data: visits } = await supabase
        .from("page_visits")
        .select("user_id, visited_at")
        .not("user_id", "is", null)
        .order("visited_at", { ascending: false })
        .limit(50000);
      const latestByUser = new Map<string, number>();
      (visits || []).forEach((v: any) => {
        if (!v.user_id || !idSet.has(v.user_id)) return;
        const t = new Date(v.visited_at).getTime();
        if (!latestByUser.has(v.user_id)) latestByUser.set(v.user_id, t);
      });
      eligible = allUsers.filter((u: any) => {
        const last = latestByUser.get(u.id);
        return typeof last === "number" && last <= thirtyDaysAgo;
      });
    }

    const ids = eligible.map((u: any) => u.id);

    // opt-out
    let optedOut = new Set<string>();
    if (ids.length > 0) {
      const { data: settings } = await supabase
        .from("user_settings").select("user_id, marketing_emails").in("user_id", ids);
      optedOut = new Set((settings || []).filter((s: any) => s.marketing_emails === false).map((s: any) => s.user_id));
    }

    // already-sent dedupe
    let alreadySent = new Set<string>();
    if (ids.length > 0) {
      const { data: logs } = await supabase
        .from("engagement_email_logs")
        .select("user_id")
        .eq("email_type", emailType)
        .in("user_id", ids);
      alreadySent = new Set((logs || []).map((l: any) => l.user_id));
    }

    let sentCount = 0;
    let failCount = 0;
    let skipCount = 0;
    const errors: string[] = [];

    for (const user of eligible) {
      if (optedOut.has(user.id)) { skipCount++; continue; }
      if (alreadySent.has(user.id)) { skipCount++; continue; }

      try {
        const built = campaign === "recent_visitors"
          ? recentVisitorEmail(user.first_name || "", "https://cakeaiartist.com/settings", user.country)
          : weMissYouEmail(user.first_name || "", "https://cakeaiartist.com/settings", user.country);
        const result = await sendBrevo(user.email, user.first_name || "", built.subject, built.html);

        if (result.ok) {
          await supabase.from("engagement_email_logs").insert({
            user_id: user.id, email_type: emailType, sent_at: new Date().toISOString(),
          });
          sentCount++;
        } else {
          errors.push(`${user.email}: ${result.status} ${result.body.substring(0, 200)}`);
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
        result_message: `Sent ${sentCount}, failed ${failCount}, skipped ${skipCount} (eligible ${eligible.length})`,
        error_message: errors.length > 0 ? errors.slice(0, 5).join(" | ") : null,
      }).eq("id", taskRun.id);
    }

    return new Response(JSON.stringify({
      success: true,
      campaign,
      sent: sentCount, failed: failCount, skipped: skipCount,
      eligible: eligible.length,
      records_processed: sentCount,
      message: `Sent ${sentCount}, failed ${failCount}, skipped ${skipCount} (eligible ${eligible.length})`,
      errors: errors.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("engagement-drip error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
