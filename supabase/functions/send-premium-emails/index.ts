import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

interface EmailRequest {
  userId: string;
  memberNumber: number;
  tier: string;
  amount: number; // In smallest unit (paise/cents)
  currency: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
}

function formatCurrency(amount: number, currency: string): string {
  const divisor = 100;
  const value = amount / divisor;
  
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    GBP: "£",
    CAD: "C$",
    AUD: "A$",
  };
  
  return `${symbols[currency] || currency + " "}${value.toLocaleString()}`;
}

function getTierDescription(tier: string): string {
  return tier === "tier_1_49" 
    ? "New Year Special - Tier 1 (First 50 Members)" 
    : "Launch Supporter - Tier 2 (Next 150 Members)";
}

function generateInvoiceNumber(memberNumber: number): string {
  const year = new Date().getFullYear();
  return `CAI-${year}-${String(memberNumber).padStart(4, '0')}`;
}

function getPremiumWelcomeEmailHtml(firstName: string, memberNumber: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Lifetime Club!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(232, 67, 147, 0.15);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                ✨ Welcome to the Lifetime Club!
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">
                You're officially a founding member
              </p>
            </td>
          </tr>
          
          <!-- Member Badge -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <div style="display: inline-block; background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); padding: 20px 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);">
                <p style="color: #ffffff; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                  Member Number
                </p>
                <p style="color: #ffffff; margin: 5px 0 0; font-size: 36px; font-weight: 700;">
                  #${memberNumber}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <p style="color: #333; font-size: 18px; margin: 0;">
                Hello ${firstName || 'there'}! 🎂
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 15px 0 0;">
                Thank you for becoming a lifetime member of Cake AI Artist! You now have unlimited access to create beautiful, personalized cakes for every celebration.
              </p>
            </td>
          </tr>
          
          <!-- Benefits -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef7f7; border-radius: 12px; padding: 25px;">
                <h2 style="color: #c44569; margin: 0 0 20px; font-size: 18px;">
                  🎁 Your Lifetime Benefits
                </h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #333; font-size: 15px;">✅ 150 cake generations per year</td>
                  </tr>
                  <tr>
                    <td style="color: #333; font-size: 15px;">✅ Complete Party Pack Generator</td>
                  </tr>
                  <tr>
                    <td style="color: #333; font-size: 15px;">✅ Private Gallery (30 saved images)</td>
                  </tr>
                  <tr>
                    <td style="color: #333; font-size: 15px;">✅ Smart Occasion Reminders</td>
                  </tr>
                  <tr>
                    <td style="color: #333; font-size: 15px;">✅ Priority Support</td>
                  </tr>
                  <tr>
                    <td style="color: #333; font-size: 15px;">✅ All Future Updates - Forever!</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="https://cakeaiartist.com" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(232, 67, 147, 0.4);">
                Start Creating Your First Masterpiece →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fef7f7; padding: 25px 30px; text-align: center; border-top: 1px solid #f0e0e0;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Made with 💖 by Cake AI Artist
              </p>
              <p style="color: #aaa; font-size: 12px; margin: 10px 0 0;">
                <a href="https://cakeaiartist.com" style="color: #c44569; text-decoration: none;">cakeaiartist.com</a>
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

function getPaymentConfirmationEmailHtml(
  firstName: string,
  memberNumber: number,
  tier: string,
  displayAmount: string,
  paymentId: string,
  orderId: string,
  invoiceNumber: string,
  purchaseDate: string
): string {
  const tierDescription = getTierDescription(tier);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                🧾 Payment Confirmed
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
                Invoice ${invoiceNumber}
              </p>
            </td>
          </tr>
          
          <!-- Thank You Message -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="color: #333; font-size: 16px; margin: 0;">
                Hello ${firstName || 'there'},
              </p>
              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 15px 0 0;">
                Thank you for your purchase! Your payment has been successfully processed. Here are your receipt details:
              </p>
            </td>
          </tr>
          
          <!-- Invoice Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; border: 1px solid #e9ecef;">
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e9ecef; padding-bottom: 12px;">Invoice Number</td>
                    <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e9ecef; padding-bottom: 12px;">${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e9ecef; padding: 12px 0;">Date</td>
                    <td style="color: #333; font-size: 14px; text-align: right; border-bottom: 1px solid #e9ecef; padding: 12px 0;">${purchaseDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e9ecef; padding: 12px 0;">Payment ID</td>
                    <td style="color: #333; font-size: 12px; text-align: right; border-bottom: 1px solid #e9ecef; padding: 12px 0; font-family: monospace;">${paymentId}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e9ecef; padding: 12px 0;">Order ID</td>
                    <td style="color: #333; font-size: 12px; text-align: right; border-bottom: 1px solid #e9ecef; padding: 12px 0; font-family: monospace;">${orderId}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Item Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fff8e1; border-radius: 12px; padding: 25px; border: 1px solid #ffe082;">
                <h3 style="color: #f39c12; margin: 0 0 15px; font-size: 16px;">
                  🎂 Purchase Details
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #333; font-size: 14px;">
                      <strong>${tierDescription}</strong>
                      <br>
                      <span style="color: #666; font-size: 13px;">Lifetime Access - Member #${memberNumber}</span>
                    </td>
                    <td style="color: #333; font-size: 18px; font-weight: 700; text-align: right; vertical-align: top;">
                      ${displayAmount}
                    </td>
                  </tr>
                </table>
                <div style="border-top: 2px solid #f39c12; margin-top: 15px; padding-top: 15px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color: #333; font-size: 16px; font-weight: 700;">Total Paid</td>
                      <td style="color: #27ae60; font-size: 20px; font-weight: 700; text-align: right;">${displayAmount}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
          </tr>
          
          <!-- Features Included -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #666; font-size: 13px; margin: 0 0 10px;">
                <strong>Included in your purchase:</strong>
              </p>
              <p style="color: #888; font-size: 13px; line-height: 1.8; margin: 0;">
                ✓ 150 cake generations/year &nbsp;&nbsp;
                ✓ Party Pack Generator &nbsp;&nbsp;
                ✓ Private Gallery (30 images) &nbsp;&nbsp;
                ✓ Smart Reminders &nbsp;&nbsp;
                ✓ Priority Support &nbsp;&nbsp;
                ✓ All Future Updates
              </p>
            </td>
          </tr>
          
          <!-- Support Note -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
                💬 Questions about your purchase? Contact us at 
                <a href="mailto:support@cakeaiartist.com" style="color: #c44569; text-decoration: none;">support@cakeaiartist.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Cake AI Artist
              </p>
              <p style="color: #aaa; font-size: 12px; margin: 10px 0 0;">
                This is an automated receipt. Please keep it for your records.
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

async function sendEmail(to: string, subject: string, htmlContent: string, senderEmail: string, senderName: string): Promise<void> {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": BREVO_API_KEY!,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: senderName, email: senderEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
      replyTo: { email: "support@cakeaiartist.com", name: "Cake AI Artist Support" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Brevo API error:", errorText);
    throw new Error(`Failed to send email: ${response.status}`);
  }

  console.log("Email sent successfully to:", to);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmailRequest = await req.json();
    const { userId, memberNumber, tier, amount, currency, razorpay_payment_id, razorpay_order_id } = body;

    console.log("Sending premium emails for user:", userId, "member:", memberNumber);

    // Get user profile for email and name
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile?.email) {
      console.error("Failed to get user profile:", profileError);
      throw new Error("User profile not found");
    }

    const firstName = profile.first_name || "";
    const displayAmount = formatCurrency(amount, currency);
    const invoiceNumber = generateInvoiceNumber(memberNumber);
    const purchaseDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Send Premium Welcome Email
    const welcomeHtml = getPremiumWelcomeEmailHtml(firstName, memberNumber);
    await sendEmail(
      profile.email,
      `✨ Welcome to the Lifetime Club, ${firstName || "Member"}! You're Member #${memberNumber}`,
      welcomeHtml,
      "welcome@cakeaiartist.com",
      "Cake AI Artist"
    );

    // Send Payment Confirmation Email
    const invoiceHtml = getPaymentConfirmationEmailHtml(
      firstName,
      memberNumber,
      tier,
      displayAmount,
      razorpay_payment_id,
      razorpay_order_id,
      invoiceNumber,
      purchaseDate
    );
    await sendEmail(
      profile.email,
      `🧾 Payment Confirmed - Cake AI Artist Lifetime Access (Invoice ${invoiceNumber})`,
      invoiceHtml,
      "billing@cakeaiartist.com",
      "Cake AI Artist Billing"
    );

    console.log("Both premium emails sent successfully to:", profile.email);

    return new Response(
      JSON.stringify({ success: true, invoiceNumber }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-premium-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
