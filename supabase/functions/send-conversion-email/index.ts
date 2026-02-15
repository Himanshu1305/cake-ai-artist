import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function getConversionEmailHtml(firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unlock Your Full Creative Potential</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f5f2;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f5f2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header with gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 50%, #F97316 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 28px; font-weight: 800;">
                🎂 Cake AI Artist
              </h1>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Unlock Your Full Creative Potential
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 35px 30px 15px;">
              <h2 style="margin: 0 0 12px; color: #1a1a2e; font-size: 22px;">
                Hey ${firstName || "there"}! 👋
              </h2>
              <p style="margin: 0; color: #555; font-size: 15px; line-height: 1.6;">
                You've been creating amazing cakes with Cake AI Artist — and we love seeing your creativity! But did you know you're only scratching the surface?
              </p>
            </td>
          </tr>

          <!-- Comparison Table -->
          <tr>
            <td style="padding: 20px 30px;">
              <h3 style="margin: 0 0 15px; color: #1a1a2e; font-size: 18px; text-align: center;">
                Free vs Premium — See What You're Missing
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
                <!-- Table Header -->
                <tr>
                  <td style="padding: 12px 15px; background-color: #f9fafb; font-size: 13px; font-weight: 700; color: #6b7280; border-bottom: 2px solid #e5e7eb;">Feature</td>
                  <td style="padding: 12px 15px; background-color: #f9fafb; font-size: 13px; font-weight: 700; color: #6b7280; border-bottom: 2px solid #e5e7eb; text-align: center;">Free</td>
                  <td style="padding: 12px 15px; background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%); font-size: 13px; font-weight: 700; color: #ffffff; border-bottom: 2px solid #e5e7eb; text-align: center;">Premium ✨</td>
                </tr>
                <!-- Rows -->
                <tr>
                  <td style="padding: 12px 15px; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0;">Cake Generations</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #ef4444; text-align: center; border-bottom: 1px solid #f0f0f0;">5 per day</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #8B5CF6; font-weight: 600; text-align: center; border-bottom: 1px solid #f0f0f0;">150 per year</td>
                </tr>
                <tr style="background-color: #fafafa;">
                  <td style="padding: 12px 15px; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0;">Gallery Slots</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #ef4444; text-align: center; border-bottom: 1px solid #f0f0f0;">20 images</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #8B5CF6; font-weight: 600; text-align: center; border-bottom: 1px solid #f0f0f0;">30 images</td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0;">Party Pack Generator</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #ef4444; text-align: center; border-bottom: 1px solid #f0f0f0;">❌</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #8B5CF6; font-weight: 600; text-align: center; border-bottom: 1px solid #f0f0f0;">✅ Full Access</td>
                </tr>
                <tr style="background-color: #fafafa;">
                  <td style="padding: 12px 15px; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0;">AI Message Variations</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #ef4444; text-align: center; border-bottom: 1px solid #f0f0f0;">1</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #8B5CF6; font-weight: 600; text-align: center; border-bottom: 1px solid #f0f0f0;">10 variations</td>
                </tr>
                <tr>
                  <td style="padding: 12px 15px; font-size: 14px; color: #333; border-bottom: 1px solid #f0f0f0;">Priority Support</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #ef4444; text-align: center; border-bottom: 1px solid #f0f0f0;">❌</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #8B5CF6; font-weight: 600; text-align: center; border-bottom: 1px solid #f0f0f0;">✅ VIP</td>
                </tr>
                <tr style="background-color: #fafafa;">
                  <td style="padding: 12px 15px; font-size: 14px; color: #333;">Occasion Reminders</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #ef4444; text-align: center;">❌</td>
                  <td style="padding: 12px 15px; font-size: 14px; color: #8B5CF6; font-weight: 600; text-align: center;">✅ Smart Alerts</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Lifetime Deal Badge -->
          <tr>
            <td style="padding: 10px 30px 25px;">
              <div style="background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%); border-radius: 16px; padding: 25px; text-align: center;">
                <p style="margin: 0 0 5px; color: rgba(255,255,255,0.85); font-size: 13px; text-transform: uppercase; letter-spacing: 2px;">Limited Time Lifetime Deal</p>
                <p style="margin: 0 0 8px; color: #ffffff; font-size: 36px; font-weight: 800;">
                  Starting at $49
                </p>
                <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                  One-time payment • Lifetime access • No monthly fees ever
                </p>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="https://cakeaiartist.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 50px; font-size: 18px; font-weight: 700; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);">
                🚀 Upgrade to Premium Now
              </a>
              <p style="margin: 12px 0 0; color: #999; font-size: 12px;">
                Limited spots remaining — once they fill, price becomes monthly
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 25px 30px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #888; font-size: 12px; text-align: center;">
                You're receiving this because you signed up for Cake AI Artist. 
                We only send occasional updates about your account.
              </p>
              <p style="margin: 0; color: #aaa; font-size: 11px; text-align: center;">
                © ${new Date().getFullYear()} Cake AI Artist by USD Vision AI LLP | support@cakeaiartist.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify caller is admin via auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { sendToAll, userId } = body;

    // Log task start
    const { data: taskRun } = await supabaseAdmin
      .from("scheduled_task_runs")
      .insert({
        task_name: "conversion-email",
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    let freeUsers: { id: string; email: string; first_name: string | null }[] = [];

    if (sendToAll) {
      // Get all free users who have marketing_emails enabled (or no settings row = default opt-in)
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("id, email, first_name")
        .or("is_premium.is.null,is_premium.eq.false");

      if (profilesError) throw profilesError;

      // Check user_settings for marketing_emails opt-out
      const userIds = (profiles || []).map(p => p.id);
      const { data: settings } = await supabaseAdmin
        .from("user_settings")
        .select("user_id, marketing_emails")
        .in("user_id", userIds);

      const optedOut = new Set(
        (settings || [])
          .filter(s => s.marketing_emails === false)
          .map(s => s.user_id)
      );

      freeUsers = (profiles || []).filter(p => !optedOut.has(p.id));
    } else if (userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id, email, first_name")
        .eq("id", userId)
        .single();

      if (profile) freeUsers = [profile];
    }

    console.log(`Sending conversion emails to ${freeUsers.length} free users`);

    let sentCount = 0;
    let failCount = 0;

    for (const user of freeUsers) {
      try {
        const emailHtml = getConversionEmailHtml(user.first_name || "");

        const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": BREVO_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "Cake AI Artist", email: "welcome@cakeaiartist.com" },
            to: [{ email: user.email, name: user.first_name || "" }],
            subject: "🎂 You're Missing Out — See What Premium Can Do!",
            htmlContent: emailHtml,
          }),
        });

        if (brevoResponse.ok) {
          sentCount++;
        } else {
          const errBody = await brevoResponse.text();
          console.error(`Failed to send to ${user.email}:`, errBody);
          failCount++;
        }
      } catch (emailErr) {
        console.error(`Error sending to ${user.email}:`, emailErr);
        failCount++;
      }
    }

    // Update task run
    if (taskRun) {
      await supabaseAdmin
        .from("scheduled_task_runs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          records_processed: sentCount,
          result_message: `Sent ${sentCount} conversion emails, ${failCount} failed`,
        })
        .eq("id", taskRun.id);
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, failed: failCount, total: freeUsers.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-conversion-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
