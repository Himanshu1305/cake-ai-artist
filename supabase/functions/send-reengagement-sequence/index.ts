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

type SequenceType = "no_cake_day2" | "inactive_7days" | "limit_hit_14days";

// ---- HTML email layout (matches existing brand) ----
function layout(inner: string, unsubscribeUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
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
      <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;">You're receiving this because you signed up for Cake AI Artist.</p>
      <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;"><a href="${unsubscribeUrl}" style="color:#2563EB;text-decoration:underline;">Unsubscribe from these emails</a></p>
      <p style="margin:0;color:#aaa;font-size:11px;text-align:center;">© ${new Date().getFullYear()} Cake AI Artist by USD Vision AI LLP | support@cakeaiartist.com</p>
    </td></tr>
  </table></td></tr></table></body></html>`;
}

// ---- Sequence A: signed up but no cake yet (2 days old) ----
function noCakeEmail(firstName: string, unsubscribeUrl: string): { subject: string; html: string } {
  const inner = `
    <tr><td style="padding:30px 30px 8px;">
      <p style="margin:0 0 14px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"} 🎂</p>
      <p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.6;">
        Your free cake designs are still waiting — and they take less than 30 seconds to create.
      </p>
      <p style="margin:0 0 22px;color:#333;font-size:15px;line-height:1.6;">
        Just type a name, pick an occasion, and watch the AI design something beautiful. No skills needed, no credit card.
      </p>
      <div style="margin:18px 0 22px;padding:16px 18px;background:#fdf8f0;border-left:4px solid #E5B547;border-radius:8px;">
        <p style="margin:0 0 8px;color:#1a1a2e;font-size:16px;font-weight:700;">🎁 You have 5 free designs waiting</p>
        <p style="margin:0;color:#555;font-size:14px;line-height:1.5;">Each one takes about 30 seconds. Use them for birthdays, anniversaries, or any celebration coming up.</p>
      </div>
    </td></tr>
    <tr><td style="padding:8px 30px 30px;text-align:center;">
      <a href="https://cakeaiartist.com/free-ai-cake-designer?ref=email" style="display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#E5B547 100%);color:#1a1a2e;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(229,181,71,0.35);">
        🎂 Design my first cake
      </a>
    </td></tr>`;
  return {
    subject: "Your free cakes are waiting 🎂",
    html: layout(inner, unsubscribeUrl),
  };
}

// ---- Sequence B: generated at least 1 cake but gone quiet for 7 days ----
function inactiveEmail(firstName: string, unsubscribeUrl: string): { subject: string; html: string } {
  const inner = `
    <tr><td style="padding:30px 30px 8px;">
      <p style="margin:0 0 14px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"} 💛</p>
      <p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.6;">
        We've missed you! A lot has been happening at Cake AI Artist since you last visited.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:0 0 14px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;border-left:4px solid #E5B547;border-radius:8px;">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 4px;color:#1a1a2e;font-size:16px;font-weight:700;">🎂 High Quality mode</p>
              <p style="margin:0 0 10px;color:#555;font-size:14px;line-height:1.5;">Generate ultra-detailed cakes with our new High Quality mode — more intricate frosting, sharper detail.</p>
              <a href="https://cakeaiartist.com/free-ai-cake-designer?ref=email" style="color:#2563EB;font-size:14px;font-weight:600;text-decoration:none;">Try it now →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 0 14px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;border-left:4px solid #E5B547;border-radius:8px;">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 4px;color:#1a1a2e;font-size:16px;font-weight:700;">🎙️ Voice messages on cakes</p>
              <p style="margin:0 0 10px;color:#555;font-size:14px;line-height:1.5;">Record a 30-second voice message that plays when someone opens your magic share link.</p>
              <a href="https://cakeaiartist.com/free-ai-cake-designer?ref=email" style="color:#2563EB;font-size:14px;font-weight:600;text-decoration:none;">Record a message →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 0 14px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf8f0;border-left:4px solid #E5B547;border-radius:8px;">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 4px;color:#1a1a2e;font-size:16px;font-weight:700;">📸 Photo cakes</p>
              <p style="margin:0 0 10px;color:#555;font-size:14px;line-height:1.5;">Upload a photo and we'll place it on the top-down view — perfect for edible photo prints.</p>
              <a href="https://cakeaiartist.com/free-ai-cake-designer?ref=email" style="color:#2563EB;font-size:14px;font-weight:600;text-decoration:none;">Make a photo cake →</a>
            </td></tr>
          </table>
        </td></tr>
      </table>
      <p style="margin:8px 0;color:#555;font-size:14px;line-height:1.6;">
        Something not working last time? Just hit reply — we read every email. 💛
      </p>
    </td></tr>
    <tr><td style="padding:8px 30px 30px;text-align:center;">
      <a href="https://cakeaiartist.com/free-ai-cake-designer?ref=email" style="display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#E5B547 100%);color:#1a1a2e;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(229,181,71,0.35);">
        ✨ Design a new cake
      </a>
    </td></tr>`;
  return {
    subject: "We miss you — here's what's new at Cake AI Artist 💛",
    html: layout(inner, unsubscribeUrl),
  };
}

// ---- Sequence C: hit the 5-design limit, haven't upgraded in 14 days ----
function limitHitEmail(firstName: string, unsubscribeUrl: string): { subject: string; html: string } {
  const inner = `
    <tr><td style="padding:30px 30px 8px;">
      <p style="margin:0 0 14px;color:#2563EB;font-size:18px;font-weight:600;">Hey ${firstName || "there"} 🎂</p>
      <p style="margin:0 0 14px;color:#333;font-size:15px;line-height:1.6;">
        You created some beautiful cakes with us — and hit the 5-design limit a little while back.
      </p>
      <p style="margin:0 0 22px;color:#333;font-size:15px;line-height:1.6;">
        Your designs are still saved and waiting in your gallery. But I wanted to make sure you knew that upgrading is fast, affordable, and unlocks everything — including unlimited cakes, the Party Pack generator, High Quality mode, and more.
      </p>
      <div style="margin:18px 0 22px;padding:18px 20px;background:#fdf8f0;border-left:4px solid #E5B547;border-radius:8px;">
        <p style="margin:0 0 12px;color:#1a1a2e;font-size:16px;font-weight:700;">✨ What you unlock with Premium:</p>
        <p style="margin:0 0 6px;color:#333;font-size:14px;">✅ Unlimited AI cake generations</p>
        <p style="margin:0 0 6px;color:#333;font-size:14px;">✅ High Quality mode (ultra-detailed designs)</p>
        <p style="margin:0 0 6px;color:#333;font-size:14px;">✅ Party Pack Generator (invites, thank-you cards)</p>
        <p style="margin:0 0 6px;color:#333;font-size:14px;">✅ AI Party Planner with RSVP tracking</p>
        <p style="margin:0;color:#333;font-size:14px;">✅ Premium characters (Doraemon, Peppa Pig & more)</p>
      </div>
      <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.6;">
        Plans start at just a few dollars a month, or grab the Lifetime deal and never pay again.
        <a href="https://cakeaiartist.com/pricing?ref=email" style="color:#2563EB;">See all plans →</a>
      </p>
    </td></tr>
    <tr><td style="padding:8px 30px 30px;text-align:center;">
      <a href="https://cakeaiartist.com/pricing?ref=email" style="display:inline-block;background:linear-gradient(135deg,#F59E0B 0%,#E5B547 100%);color:#1a1a2e;text-decoration:none;padding:12px 32px;border-radius:50px;font-size:15px;font-weight:700;box-shadow:0 4px 15px rgba(229,181,71,0.35);">
        🔓 Unlock unlimited designs
      </a>
    </td></tr>`;
  return {
    subject: "Your designs are waiting — unlock unlimited 🎂",
    html: layout(inner, unsubscribeUrl),
  };
}

async function sendBrevo(toEmail: string, toName: string, subject: string, html: string) {
  const safeName = (toName || "").trim() || toEmail.split("@")[0];
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
    // Auth: cron secret or admin Bearer token
    const cronSecret = req.headers.get("X-Cron-Secret");
    const expected = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    let isAuthorized = expected && cronSecret === expected;

    if (!isAuthorized && authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        if (roleData) isAuthorized = true;
      }
    }
    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let testEmail: string | null = null;
    let sequence: SequenceType | "all" = "all";
    try {
      const body = await req.json();
      testEmail = body?.testEmail || null;
      if (body?.sequence) sequence = body.sequence;
    } catch { /* no body */ }

    const now = Date.now();
    const twoDaysAgo = new Date(now - 2 * 86400000).toISOString();
    const sevenDaysAgo = new Date(now - 7 * 86400000).toISOString();
    const fourteenDaysAgo = new Date(now - 14 * 86400000).toISOString();
    const threeDaysAgo = new Date(now - 3 * 86400000).toISOString();

    const results: Record<string, { sent: number; failed: number; skipped: number }> = {};

    // ======= SEQUENCE A: no_cake_day2 =======
    if (sequence === "all" || sequence === "no_cake_day2") {
      const { data: users } = await supabase
        .from("profiles")
        .select("id, email, first_name")
        .gte("created_at", twoDaysAgo) // Wait at least 2 days
        .lte("created_at", threeDaysAgo); // But not more than 3 days (window)

      const candidates = (users || []).filter((u: any) => u.email);
      const ids = candidates.map((u: any) => u.id);

      let alreadySent = new Set<string>();
      if (ids.length > 0) {
        const { data: logs } = await supabase
          .from("email_sequence_log")
          .select("user_id")
          .eq("sequence_type", "no_cake_day2")
          .in("user_id", ids);
        alreadySent = new Set((logs || []).map((l: any) => l.user_id));
      }

      // Exclude users who have already generated a cake
      let hasGeneratedCake = new Set<string>();
      if (ids.length > 0) {
        const { data: imgs } = await supabase
          .from("generated_images")
          .select("user_id")
          .in("user_id", ids);
        hasGeneratedCake = new Set((imgs || []).map((r: any) => r.user_id));
      }

      let sent = 0; let failed = 0; let skipped = 0;

      const targets = testEmail
        ? [{ id: "test", email: testEmail, first_name: "there" }]
        : candidates.filter((u: any) => !alreadySent.has(u.id) && !hasGeneratedCake.has(u.id));

      for (const user of targets) {
        try {
          const { subject, html } = noCakeEmail(
            user.first_name || "",
            "https://cakeaiartist.com/settings"
          );
          const res = await sendBrevo(user.email, user.first_name || "", subject, html);
          if (res.ok) {
            if (!testEmail) {
              await supabase.from("email_sequence_log").insert({
                user_id: user.id, sequence_type: "no_cake_day2",
              }).on("conflict", () => {}); // ignore duplicates
            }
            sent++;
          } else { failed++; }
        } catch { failed++; }
      }
      results.no_cake_day2 = { sent, failed, skipped };
    }

    // ======= SEQUENCE B: inactive_7days =======
    if (sequence === "all" || sequence === "inactive_7days") {
      // Users who generated at least 1 cake but last activity > 7 days ago
      const { data: imgs } = await supabase
        .from("generated_images")
        .select("user_id, created_at")
        .order("created_at", { ascending: false });

      // Find last generated_at per user
      const latestByUser = new Map<string, string>();
      for (const r of (imgs || [])) {
        if (!latestByUser.has(r.user_id)) latestByUser.set(r.user_id, r.created_at);
      }
      const inactiveIds = [...latestByUser.entries()]
        .filter(([, d]) => d <= sevenDaysAgo)
        .map(([id]) => id);

      let alreadySent = new Set<string>();
      if (inactiveIds.length > 0) {
        const { data: logs } = await supabase
          .from("email_sequence_log")
          .select("user_id")
          .eq("sequence_type", "inactive_7days")
          .in("user_id", inactiveIds);
        alreadySent = new Set((logs || []).map((l: any) => l.user_id));
      }

      let profiles: any[] = [];
      if (inactiveIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, email, first_name")
          .in("id", inactiveIds)
          .eq("is_premium", false);
        profiles = (data || []).filter((u: any) => u.email);
      }

      let sent = 0; let failed = 0; let skipped = 0;

      const targets = testEmail
        ? [{ id: "test", email: testEmail, first_name: "there" }]
        : profiles.filter((u: any) => !alreadySent.has(u.id));

      for (const user of targets) {
        try {
          const { subject, html } = inactiveEmail(user.first_name || "", "https://cakeaiartist.com/settings");
          const res = await sendBrevo(user.email, user.first_name || "", subject, html);
          if (res.ok) {
            if (!testEmail) {
              await supabase.from("email_sequence_log").insert({
                user_id: user.id, sequence_type: "inactive_7days",
              }).on("conflict", () => {});
            }
            sent++;
          } else { failed++; }
        } catch { failed++; }
      }
      results.inactive_7days = { sent, failed, skipped };
    }

    // ======= SEQUENCE C: limit_hit_14days =======
    if (sequence === "all" || sequence === "limit_hit_14days") {
      // Free users who have >= 5 total generation_tracking rows and haven't upgraded in 14 days
      // We approximate: find free users whose oldest generation is >= 14 days old
      const { data: trackingRows } = await supabase
        .from("generation_tracking")
        .select("user_id")
        .is("month", null)
        .order("year", { ascending: true });

      // Count yearly rows per user to find those who hit the limit
      const countByUser = new Map<string, number>();
      for (const r of (trackingRows || [])) {
        countByUser.set(r.user_id, (countByUser.get(r.user_id) || 0) + 1);
      }
      // Users with >= 5 yearly tracking entries (approximate — they hit the limit)
      const limitHitIds = [...countByUser.entries()]
        .filter(([, c]) => c >= 5)
        .map(([id]) => id);

      let alreadySent = new Set<string>();
      if (limitHitIds.length > 0) {
        const { data: logs } = await supabase
          .from("email_sequence_log")
          .select("user_id")
          .eq("sequence_type", "limit_hit_14days")
          .in("user_id", limitHitIds);
        alreadySent = new Set((logs || []).map((l: any) => l.user_id));
      }

      let profiles: any[] = [];
      if (limitHitIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, email, first_name, created_at")
          .in("id", limitHitIds)
          .eq("is_premium", false)
          .lte("created_at", fourteenDaysAgo); // Account is at least 14 days old
        profiles = (data || []).filter((u: any) => u.email);
      }

      let sent = 0; let failed = 0; let skipped = 0;

      const targets = testEmail
        ? [{ id: "test", email: testEmail, first_name: "there" }]
        : profiles.filter((u: any) => !alreadySent.has(u.id));

      for (const user of targets) {
        try {
          const { subject, html } = limitHitEmail(user.first_name || "", "https://cakeaiartist.com/settings");
          const res = await sendBrevo(user.email, user.first_name || "", subject, html);
          if (res.ok) {
            if (!testEmail) {
              await supabase.from("email_sequence_log").insert({
                user_id: user.id, sequence_type: "limit_hit_14days",
              }).on("conflict", () => {});
            }
            sent++;
          } else { failed++; }
        } catch { failed++; }
      }
      results.limit_hit_14days = { sent, failed, skipped };
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("send-reengagement-sequence error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
