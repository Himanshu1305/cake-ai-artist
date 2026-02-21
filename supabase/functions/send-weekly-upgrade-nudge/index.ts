import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getTemplateVariant(weekNumber: number): number {
  return (weekNumber % 4) + 1;
}

function getSubjectLine(variant: number): string {
  switch (variant) {
    case 1: return "🎉 Did you know? Party Packs are included with Premium!";
    case 2: return "📊 Free vs Premium — The numbers speak for themselves";
    case 3: return "⭐ See what other creators are making with Premium";
    case 4: return "⏰ Lifetime Deal won't last forever — lock in $49 today";
    default: return "🎂 Upgrade your Cake AI Artist experience";
  }
}

function getEmailHtml(firstName: string, variant: number, unsubscribeUrl: string): string {
  const header = `
    <!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f8f5f2;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f5f2;padding:40px 20px;"><tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <tr><td style="background:linear-gradient(135deg,#8B5CF6 0%,#D946EF 50%,#F97316 100%);padding:30px;text-align:center;">
      <img src="https://cakeaiartist.com/logo.png" alt="Cake AI Artist" width="48" height="48" style="border-radius:12px;margin-bottom:8px;">
      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;">Cake AI Artist</h1>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">AI-Powered Cake Design</p>
    </td></tr>
    <tr><td style="padding:30px 30px 10px;">
      <p style="margin:0;color:#333;font-size:16px;">Hey ${firstName || "there"}! 👋</p>
    </td></tr>`;

  const ctaBlock = `
    <tr><td style="padding:15px 30px 25px;text-align:center;">
      <a href="https://cakeaiartist.com/pricing" style="display:inline-block;background:linear-gradient(135deg,#8B5CF6 0%,#D946EF 100%);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:50px;font-size:16px;font-weight:700;box-shadow:0 4px 15px rgba(139,92,246,0.4);">
        🚀 Upgrade to Premium
      </a>
    </td></tr>`;

  const footer = `
    <tr><td style="background-color:#f9fafb;padding:20px 30px;border-top:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;">
        You're receiving this because you signed up for Cake AI Artist.
      </p>
      <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;">
        <a href="${unsubscribeUrl}" style="color:#8B5CF6;text-decoration:underline;">Unsubscribe from marketing emails</a>
      </p>
      <p style="margin:0;color:#aaa;font-size:11px;text-align:center;">
        © ${new Date().getFullYear()} Cake AI Artist by USD Vision AI LLP | support@cakeaiartist.com
      </p>
    </td></tr></table></td></tr></table></body></html>`;

  let body = "";

  switch (variant) {
    case 1: // Feature Spotlight — Party Pack Generator
      body = `
        <tr><td style="padding:10px 30px 20px;">
          <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">🎉 Create Complete Party Packs in Seconds</h2>
          <p style="margin:0 0 15px;color:#555;font-size:15px;line-height:1.6;">
            Premium members get access to our <strong>Party Pack Generator</strong> — turn any cake design into a full party kit:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;font-size:14px;color:#333;">✅ Custom Invitations matching your cake design</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#333;">✅ Thank You Cards with coordinated styling</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#333;">✅ Party Banners ready to print</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#333;">✅ Cake Toppers & Place Cards</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#333;">✅ Download as PDF — print at home!</td></tr>
          </table>
          <p style="margin:15px 0 0;color:#555;font-size:14px;line-height:1.6;">
            All from one cake image. It's the ultimate party planning shortcut! 🎈
          </p>
        </td></tr>`;
      break;

    case 2: // By the Numbers
      body = `
        <tr><td style="padding:10px 30px 20px;">
          <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">📊 The Numbers Don't Lie</h2>
          <p style="margin:0 0 15px;color:#555;font-size:15px;line-height:1.6;">
            Here's what you're working with on the free plan vs. what Premium unlocks:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:10px 15px;background:#f9fafb;font-weight:700;color:#6b7280;font-size:13px;border-bottom:2px solid #e5e7eb;">Feature</td>
              <td style="padding:10px 15px;background:#f9fafb;font-weight:700;color:#6b7280;font-size:13px;text-align:center;border-bottom:2px solid #e5e7eb;">Free</td>
              <td style="padding:10px 15px;background:linear-gradient(135deg,#8B5CF6,#D946EF);font-weight:700;color:#fff;font-size:13px;text-align:center;border-bottom:2px solid #e5e7eb;">Premium ✨</td>
            </tr>
            <tr>
              <td style="padding:10px 15px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0;">Cake Generations</td>
              <td style="padding:10px 15px;font-size:14px;color:#ef4444;text-align:center;border-bottom:1px solid #f0f0f0;">5/day</td>
              <td style="padding:10px 15px;font-size:14px;color:#8B5CF6;font-weight:600;text-align:center;border-bottom:1px solid #f0f0f0;">150/year</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 15px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0;">Gallery Slots</td>
              <td style="padding:10px 15px;font-size:14px;color:#ef4444;text-align:center;border-bottom:1px solid #f0f0f0;">20</td>
              <td style="padding:10px 15px;font-size:14px;color:#8B5CF6;font-weight:600;text-align:center;border-bottom:1px solid #f0f0f0;">30</td>
            </tr>
            <tr>
              <td style="padding:10px 15px;font-size:14px;color:#333;border-bottom:1px solid #f0f0f0;">AI Message Variations</td>
              <td style="padding:10px 15px;font-size:14px;color:#ef4444;text-align:center;border-bottom:1px solid #f0f0f0;">1</td>
              <td style="padding:10px 15px;font-size:14px;color:#8B5CF6;font-weight:600;text-align:center;border-bottom:1px solid #f0f0f0;">10</td>
            </tr>
            <tr style="background:#fafafa;">
              <td style="padding:10px 15px;font-size:14px;color:#333;">Party Pack Generator</td>
              <td style="padding:10px 15px;font-size:14px;color:#ef4444;text-align:center;">❌</td>
              <td style="padding:10px 15px;font-size:14px;color:#8B5CF6;font-weight:600;text-align:center;">✅</td>
            </tr>
          </table>
          <p style="margin:15px 0 0;color:#555;font-size:14px;line-height:1.6;">
            Premium members create <strong>30x more</strong> designs. Don't let limits hold back your creativity!
          </p>
        </td></tr>`;
      break;

    case 3: // Success Stories
      body = `
        <tr><td style="padding:10px 30px 20px;">
          <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">⭐ What Premium Members Are Saying</h2>
          <p style="margin:0 0 15px;color:#555;font-size:15px;line-height:1.6;">
            Don't just take our word for it — here's what creators like you are experiencing:
          </p>
          <div style="background:#f3f0ff;border-left:4px solid #8B5CF6;padding:15px;border-radius:0 8px 8px 0;margin-bottom:12px;">
            <p style="margin:0 0 5px;color:#333;font-size:14px;font-style:italic;">"The Party Pack Generator alone was worth it. I planned my daughter's entire birthday in 10 minutes!"</p>
            <p style="margin:0;color:#8B5CF6;font-size:13px;font-weight:600;">— Sarah M., Premium Member</p>
          </div>
          <div style="background:#f3f0ff;border-left:4px solid #8B5CF6;padding:15px;border-radius:0 8px 8px 0;margin-bottom:12px;">
            <p style="margin:0 0 5px;color:#333;font-size:14px;font-style:italic;">"I used to hit the free limit every day. Now I can experiment with different designs freely."</p>
            <p style="margin:0;color:#8B5CF6;font-size:13px;font-weight:600;">— Priya K., Premium Member</p>
          </div>
          <div style="background:#f3f0ff;border-left:4px solid #8B5CF6;padding:15px;border-radius:0 8px 8px 0;">
            <p style="margin:0 0 5px;color:#333;font-size:14px;font-style:italic;">"The smart reminders mean I never forget a birthday. Total game-changer for my family!"</p>
            <p style="margin:0;color:#8B5CF6;font-size:13px;font-weight:600;">— James T., Premium Member</p>
          </div>
        </td></tr>`;
      break;

    case 4: // Urgency / Limited Time
      body = `
        <tr><td style="padding:10px 30px 20px;">
          <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">⏰ The Lifetime Deal Won't Last Forever</h2>
          <p style="margin:0 0 15px;color:#555;font-size:15px;line-height:1.6;">
            Right now, you can lock in <strong>lifetime Premium access</strong> for a one-time payment. No monthly fees. No renewals. Ever.
          </p>
          <div style="background:linear-gradient(135deg,#8B5CF6 0%,#D946EF 100%);border-radius:16px;padding:25px;text-align:center;margin-bottom:15px;">
            <p style="margin:0 0 5px;color:rgba(255,255,255,0.85);font-size:13px;text-transform:uppercase;letter-spacing:2px;">Lifetime Deal</p>
            <p style="margin:0 0 8px;color:#ffffff;font-size:36px;font-weight:800;">Starting at $49</p>
            <p style="margin:0;color:rgba(255,255,255,0.9);font-size:14px;">One-time payment • Lifetime access • No monthly fees</p>
          </div>
          <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
            Once the founding member slots fill up, Premium will switch to a <strong>monthly subscription model</strong>. 
            This is your chance to get everything for a single, affordable price. 🔒
          </p>
        </td></tr>`;
      break;
  }

  return header + body + ctaBlock + footer;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Dual auth: CRON_SECRET or valid JWT
    const cronSecret = req.headers.get("X-Cron-Secret");
    const expectedSecret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");
    let isAuthorized = false;

    if (expectedSecret && cronSecret === expectedSecret) {
      isAuthorized = true;
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!isAuthorized && authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (!authError && user) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse optional body
    let testEmail: string | null = null;
    try {
      const body = await req.json();
      testEmail = body?.testEmail || null;
    } catch { /* no body = cron call */ }

    const weekNumber = getISOWeekNumber(new Date());
    const variant = getTemplateVariant(weekNumber);

    console.log(`Weekly upgrade nudge — week ${weekNumber}, variant ${variant}`);

    // Log task start
    const { data: taskRun } = await supabaseAdmin
      .from("scheduled_task_runs")
      .insert({
        task_name: "weekly-upgrade-nudge",
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Test mode
    if (testEmail) {
      const html = getEmailHtml("Admin", variant, "https://cakeaiartist.com/settings");
      const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": BREVO_API_KEY!, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: { name: "Cake AI Artist", email: "welcome@cakeaiartist.com" },
          to: [{ email: testEmail }],
          subject: `[TEST] ${getSubjectLine(variant)}`,
          htmlContent: html,
        }),
      });

      const status = brevoRes.ok ? "success" : "failed";
      if (taskRun) {
        await supabaseAdmin.from("scheduled_task_runs").update({
          status, completed_at: new Date().toISOString(),
          records_processed: brevoRes.ok ? 1 : 0,
          result_message: `Test email (variant ${variant}) sent to ${testEmail}`,
          error_message: brevoRes.ok ? null : await brevoRes.text(),
        }).eq("id", taskRun.id);
      }

      return new Response(JSON.stringify({ success: brevoRes.ok, variant, testEmail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Production: get all free users
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name")
      .or("is_premium.is.null,is_premium.eq.false");

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      if (taskRun) {
        await supabaseAdmin.from("scheduled_task_runs").update({
          status: "success", completed_at: new Date().toISOString(),
          records_processed: 0, result_message: "No free users found",
        }).eq("id", taskRun.id);
      }
      return new Response(JSON.stringify({ message: "No free users", sent: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out users who opted out of marketing emails
    const userIds = profiles.map(p => p.id);
    const { data: settings } = await supabaseAdmin
      .from("user_settings")
      .select("user_id, marketing_emails")
      .in("user_id", userIds);

    const optedOut = new Set(
      (settings || []).filter(s => s.marketing_emails === false).map(s => s.user_id)
    );

    // Filter out users already emailed this week
    const { data: existingLogs } = await supabaseAdmin
      .from("upgrade_nudge_logs")
      .select("user_id")
      .eq("week_number", weekNumber);

    const alreadySent = new Set((existingLogs || []).map(l => l.user_id));

    const eligibleUsers = profiles.filter(p => !optedOut.has(p.id) && !alreadySent.has(p.id));

    console.log(`Eligible: ${eligibleUsers.length} of ${profiles.length} free users (${optedOut.size} opted out, ${alreadySent.size} already sent)`);

    let sentCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const user of eligibleUsers) {
      try {
        const unsubscribeUrl = `https://cakeaiartist.com/settings`;
        const html = getEmailHtml(user.first_name || "", variant, unsubscribeUrl);

        const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: { "api-key": BREVO_API_KEY!, "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: { name: "Cake AI Artist", email: "welcome@cakeaiartist.com" },
            to: [{ email: user.email, name: user.first_name || "" }],
            subject: getSubjectLine(variant),
            htmlContent: html,
          }),
        });

        if (brevoRes.ok) {
          // Log to nudge logs (upsert to handle unique constraint)
          await supabaseAdmin.from("upgrade_nudge_logs").upsert({
            user_id: user.id,
            template_variant: variant,
            week_number: weekNumber,
            sent_at: new Date().toISOString(),
          }, { onConflict: "user_id,week_number" });
          sentCount++;
        } else {
          const errText = await brevoRes.text();
          console.error(`Failed for ${user.email}:`, errText);
          errors.push(`${user.email}: ${errText}`);
          failCount++;
        }
      } catch (err: any) {
        console.error(`Error for ${user.email}:`, err);
        errors.push(`${user.email}: ${err.message}`);
        failCount++;
      }
    }

    // Update task run
    if (taskRun) {
      await supabaseAdmin.from("scheduled_task_runs").update({
        status: failCount === eligibleUsers.length && eligibleUsers.length > 0 ? "failed" : "success",
        completed_at: new Date().toISOString(),
        records_processed: sentCount,
        result_message: `Variant ${variant}: Sent ${sentCount}, failed ${failCount}, skipped ${profiles.length - eligibleUsers.length}`,
        error_message: errors.length > 0 ? errors.slice(0, 5).join("; ") : null,
      }).eq("id", taskRun.id);
    }

    return new Response(JSON.stringify({
      success: true, variant, weekNumber, sent: sentCount,
      failed: failCount, skipped: profiles.length - eligibleUsers.length,
      total: profiles.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("Error in send-weekly-upgrade-nudge:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
