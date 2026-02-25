import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");

interface EmailRequest {
  userId: string;
  memberNumber: string; // Now a string: 2025-LTA-1000, 2025-1000, 2025-GIFT-1000
  tier: string;
  amount: number; // In smallest unit (paise/cents)
  currency: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
}

interface SubscriptionEndedRequest {
  userId: string;
  status: "halted" | "expired" | "cancelled";
  subscriptionId: string;
  periodEndDate?: string;
}

// Detect payment type from member number format
function getPaymentType(memberNumber: string, paymentId: string): "lifetime" | "subscription" | "admin_grant" {
  if (paymentId.startsWith("ADMIN_")) {
    return "admin_grant";
  }
  if (memberNumber.includes("-LTA-")) {
    return "lifetime";
  }
  if (memberNumber.includes("-GIFT-")) {
    return "admin_grant";
  }
  // Default format like 2025-1000 is subscription
  return "subscription";
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

function getTierDescription(tier: string, paymentType: "lifetime" | "subscription" | "admin_grant"): string {
  if (paymentType === "admin_grant") {
    return "Complimentary Premium Access";
  }
  if (paymentType === "subscription") {
    return "Monthly Premium Subscription";
  }
  // Lifetime
  return tier === "tier_1_49" 
    ? "New Year Special - Tier 1 (First 50 Members)" 
    : "Launch Supporter - Tier 2 (Next 150 Members)";
}

function generateInvoiceNumber(memberNumber: string): string {
  // Extract numeric part for invoice
  const numericPart = memberNumber.replace(/[^0-9]/g, "").slice(-4);
  const year = new Date().getFullYear();
  return `CAI-${year}-${numericPart.padStart(4, '0')}`;
}

// Convert number to words for formal invoice (e.g., 4100 -> "Four Thousand One Hundred")
function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  function convertChunk(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convertChunk(n % 100) : "");
  }
  
  // Use Indian numbering: Crore, Lakh, Thousand, Hundred
  const rounded = Math.round(num);
  if (rounded >= 10000000) {
    const crore = Math.floor(rounded / 10000000);
    const remainder = rounded % 10000000;
    return convertChunk(crore) + " Crore" + (remainder ? " " + numberToWords(remainder) : "");
  }
  if (rounded >= 100000) {
    const lakh = Math.floor(rounded / 100000);
    const remainder = rounded % 100000;
    return convertChunk(lakh) + " Lakh" + (remainder ? " " + numberToWords(remainder) : "");
  }
  if (rounded >= 1000) {
    const thousand = Math.floor(rounded / 1000);
    const remainder = rounded % 1000;
    return convertChunk(thousand) + " Thousand" + (remainder ? " " + numberToWords(remainder) : "");
  }
  return convertChunk(rounded);
}

function getGSTInvoiceEmailHtml(
  firstName: string,
  memberNumber: string,
  tier: string,
  amount: number, // in paise
  paymentId: string,
  orderId: string,
  invoiceNumber: string,
  purchaseDate: string,
  paymentType: "lifetime" | "subscription"
): string {
  const totalAmount = amount / 100; // Convert paise to rupees
  const baseAmount = totalAmount / 1.18;
  const igstAmount = totalAmount - baseAmount;
  
  let itemDescription: string;
  if (paymentType === "subscription") {
    itemDescription = "Cake AI Artist - Monthly Premium Subscription";
  } else {
    itemDescription = tier === "tier_1_49"
      ? "Cake AI Artist - Lifetime Access, Tier 1 (First 50 Members)"
      : "Cake AI Artist - Lifetime Access, Tier 2 (Next 150 Members)";
  }
  
  const amountInWords = numberToWords(Math.round(totalAmount)) + " INR Only";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - ${invoiceNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #ddd;">
          
          <!-- Company Header -->
          <tr>
            <td style="padding: 30px 35px; border-bottom: 2px solid #333;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 8px; color: #222; font-size: 22px; font-weight: 700;">USD Vision AI LLP</h2>
                    <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.6;">
                      ZENITH NALLANGDALA, HCU Main Road,<br/>
                      CUC Sub Post Office, Gachibowli, Hyderabad,<br/>
                      Rangareddy, Telangana, 500046
                    </p>
                    <p style="margin: 8px 0 0; color: #333; font-size: 13px;">
                      <strong>GSTIN:</strong> 36AAJFU0315K1Z5 &nbsp;&nbsp; <strong>PAN:</strong> AAJFU0315K
                    </p>
                    <p style="margin: 4px 0 0; color: #333; font-size: 13px;">
                      <strong>State:</strong> Telangana &nbsp;&nbsp; <strong>State Code:</strong> 36
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- TAX INVOICE Title -->
          <tr>
            <td style="background-color: #1a1a2e; padding: 15px 35px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 3px;">
                TAX INVOICE
              </h1>
            </td>
          </tr>
          
          <!-- Bill To + Invoice Details -->
          <tr>
            <td style="padding: 25px 35px; border-bottom: 1px solid #eee;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" valign="top">
                    <p style="margin: 0 0 5px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Bill To</p>
                    <p style="margin: 0; color: #333; font-size: 15px; font-weight: 600;">${firstName || "Customer"}</p>
                    <p style="margin: 4px 0 0; color: #555; font-size: 13px;">Member: ${memberNumber}</p>
                  </td>
                  <td width="50%" valign="top" style="text-align: right;">
                    <p style="margin: 0 0 5px; color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Invoice Details</p>
                    <p style="margin: 0; color: #333; font-size: 13px;"><strong>Invoice No:</strong> ${invoiceNumber}</p>
                    <p style="margin: 4px 0 0; color: #333; font-size: 13px;"><strong>Date:</strong> ${purchaseDate}</p>
                    <p style="margin: 4px 0 0; color: #333; font-size: 13px;"><strong>Payment ID:</strong> <span style="font-family: monospace; font-size: 11px;">${paymentId}</span></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Item Table -->
          <tr>
            <td style="padding: 0 35px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                <!-- Table Header -->
                <tr style="background-color: #f8f8f8;">
                  <td style="padding: 12px 10px; font-size: 12px; font-weight: 700; color: #555; border-bottom: 2px solid #ddd; text-transform: uppercase; width: 5%;">Sl No.</td>
                  <td style="padding: 12px 10px; font-size: 12px; font-weight: 700; color: #555; border-bottom: 2px solid #ddd; text-transform: uppercase; width: 30%;">Description</td>
                  <td style="padding: 12px 10px; font-size: 12px; font-weight: 700; color: #555; border-bottom: 2px solid #ddd; text-transform: uppercase; text-align: center; width: 6%;">Qty</td>
                  <td style="padding: 12px 10px; font-size: 12px; font-weight: 700; color: #555; border-bottom: 2px solid #ddd; text-transform: uppercase; text-align: center; width: 12%;">SAC Code</td>
                  <td style="padding: 12px 10px; font-size: 12px; font-weight: 700; color: #555; border-bottom: 2px solid #ddd; text-transform: uppercase; text-align: right; width: 14%;">Gross Amt (INR)</td>
                  <td style="padding: 12px 10px; font-size: 12px; font-weight: 700; color: #555; border-bottom: 2px solid #ddd; text-transform: uppercase; text-align: center; width: 10%;">GST Rate</td>
                  <td style="padding: 12px 10px; font-size: 12px; font-weight: 700; color: #555; border-bottom: 2px solid #ddd; text-transform: uppercase; text-align: center; width: 9%;">Discount</td>
                  <td style="padding: 12px 10px; font-size: 12px; font-weight: 700; color: #555; border-bottom: 2px solid #ddd; text-transform: uppercase; text-align: right; width: 14%;">Net Amt (INR)</td>
                </tr>
                <!-- Item Row -->
                <tr>
                  <td style="padding: 15px 10px; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">1</td>
                  <td style="padding: 15px 10px; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">${itemDescription}</td>
                  <td style="padding: 15px 10px; font-size: 14px; color: #333; border-bottom: 1px solid #eee; text-align: center;">1</td>
                  <td style="padding: 15px 10px; font-size: 14px; color: #333; border-bottom: 1px solid #eee; text-align: center;">997331</td>
                  <td style="padding: 15px 10px; font-size: 14px; color: #333; border-bottom: 1px solid #eee; text-align: right;">₹${totalAmount.toFixed(2)}</td>
                  <td style="padding: 15px 10px; font-size: 14px; color: #333; border-bottom: 1px solid #eee; text-align: center;">18%</td>
                  <td style="padding: 15px 10px; font-size: 14px; color: #333; border-bottom: 1px solid #eee; text-align: center;">--</td>
                  <td style="padding: 15px 10px; font-size: 14px; color: #333; border-bottom: 1px solid #eee; text-align: right;">₹${totalAmount.toFixed(2)}</td>
                </tr>
                <!-- Total Row -->
                <tr style="background-color: #f8f8f8;">
                  <td colspan="4" style="padding: 12px 10px; font-size: 14px; font-weight: 700; color: #333; border-bottom: 1px solid #ddd; text-align: right;">Total</td>
                  <td style="padding: 12px 10px; font-size: 14px; font-weight: 700; color: #333; border-bottom: 1px solid #ddd; text-align: right;">₹${totalAmount.toFixed(2)}</td>
                  <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;"></td>
                  <td style="padding: 12px 10px; border-bottom: 1px solid #ddd;"></td>
                  <td style="padding: 12px 10px; font-size: 14px; font-weight: 700; color: #333; border-bottom: 1px solid #ddd; text-align: right;">₹${totalAmount.toFixed(2)}</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- IGST Breakdown -->
          <tr>
            <td style="padding: 0 35px 10px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 10px; font-size: 13px; color: #555; border-bottom: 1px solid #eee;">
                    <strong>IGST @ 18%:</strong> ₹${igstAmount.toFixed(2)}
                  </td>
                  <td style="padding: 10px; font-size: 13px; color: #555; border-bottom: 1px solid #eee; text-align: right;">
                    <em>${numberToWords(Math.round(igstAmount))} Rupees Only</em>
                  </td>
                </tr>
                <tr style="background-color: #1a1a2e;">
                  <td style="padding: 14px 10px; font-size: 15px; font-weight: 700; color: #ffffff;">
                    Grand Total: ₹${totalAmount.toFixed(2)}
                  </td>
                  <td style="padding: 14px 10px; font-size: 13px; color: #ffffff; text-align: right;">
                    <em>${amountInWords}</em>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Authorised Signatory -->
          <tr>
            <td style="padding: 20px 35px 10px; text-align: right;">
              <p style="margin: 0; color: #333; font-size: 13px; font-weight: 600;">For USD Vision AI LLP</p>
              <p style="margin: 4px 0 0; color: #555; font-size: 12px;">Authorised Signatory</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px 35px; border-top: 1px solid #ddd;">
              <p style="color: #888; font-size: 12px; margin: 0; text-align: center;">
                This is a computer-generated invoice and does not require a physical signature.
              </p>
              <p style="color: #aaa; font-size: 11px; margin: 8px 0 0; text-align: center;">
                USD Vision AI LLP | GSTIN: 36AAJFU0315K1Z5 | support@cakeaiartist.com
              </p>
              <p style="color: #aaa; font-size: 11px; margin: 6px 0 0; text-align: center;">
                E. &amp; O.E
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

function getWelcomeTitle(paymentType: "lifetime" | "subscription" | "admin_grant"): string {
  switch (paymentType) {
    case "lifetime":
      return "Welcome to the Lifetime Club!";
    case "subscription":
      return "Welcome to Monthly Premium!";
    case "admin_grant":
      return "Welcome to the Cake AI Artist Family!";
  }
}

function getWelcomeSubtitle(paymentType: "lifetime" | "subscription" | "admin_grant"): string {
  switch (paymentType) {
    case "lifetime":
      return "You're officially a founding member";
    case "subscription":
      return "Your premium subscription is now active";
    case "admin_grant":
      return "Your Premium Access is Now Active! 🎉";
  }
}

function getBenefitsTitle(paymentType: "lifetime" | "subscription" | "admin_grant"): string {
  switch (paymentType) {
    case "lifetime":
      return "🎁 Your Lifetime Benefits";
    case "subscription":
      return "🎁 Your Monthly Premium Benefits";
    case "admin_grant":
      return "🎁 Your Premium Benefits";
  }
}

function getBenefitsList(paymentType: "lifetime" | "subscription" | "admin_grant"): string {
  const benefits = [
    paymentType === "lifetime" ? "✅ 150 cake generations per year" : "✅ 100 cake generations per month",
    "✅ Complete Party Pack Generator",
    "✅ Private Gallery (30 saved images)",
    "✅ Smart Occasion Reminders",
    "✅ Priority Support",
  ];
  
  if (paymentType === "lifetime") {
    benefits.push("✅ All Future Updates - Forever!");
  } else if (paymentType === "subscription") {
    benefits.push("✅ Cancel anytime");
  } else {
    benefits.push("✅ All Premium Features Included");
  }

  return benefits.map(b => `<tr><td style="color: #333; font-size: 15px;">${b}</td></tr>`).join("");
}

function getThankYouMessage(paymentType: "lifetime" | "subscription" | "admin_grant", firstName: string): string {
  switch (paymentType) {
    case "lifetime":
      return `Thank you for becoming a lifetime member of Cake AI Artist! You now have unlimited access to create beautiful, personalized cakes for every celebration.`;
    case "subscription":
      return `Thank you for subscribing to Cake AI Artist Premium! Your monthly subscription gives you access to all premium features.`;
    case "admin_grant":
      return `We're thrilled to have you! Your premium access has been activated and you're now part of our creative community. Get ready to design stunning cakes that will make every celebration unforgettable!`;
  }
}

function getWhatToCreateSection(): string {
  return `
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <div style="background: linear-gradient(135deg, #fff5f7 0%, #fef3e8 100%); border-radius: 12px; padding: 25px; border: 1px solid #ffd6e8;">
                      <h2 style="color: #c44569; margin: 0 0 15px; font-size: 18px;">
                        🧁 What to Create First?
                      </h2>
                      <table width="100%" cellpadding="6" cellspacing="0">
                        <tr>
                          <td style="color: #555; font-size: 14px;">🎂 <strong>Birthday Cake</strong> - Personalized with name & age</td>
                        </tr>
                        <tr>
                          <td style="color: #555; font-size: 14px;">💕 <strong>Anniversary Cake</strong> - Romantic designs for couples</td>
                        </tr>
                        <tr>
                          <td style="color: #555; font-size: 14px;">🎓 <strong>Celebration Cake</strong> - Graduations, promotions & more</td>
                        </tr>
                        <tr>
                          <td style="color: #555; font-size: 14px;">🦸 <strong>Character Cake</strong> - Superhero, princess, cartoon themes</td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
  `;
}

function getPremiumWelcomeEmailHtml(
  firstName: string, 
  memberNumber: string,
  paymentType: "lifetime" | "subscription" | "admin_grant"
): string {
  const isAdminGrant = paymentType === "admin_grant";
  
  // Enhanced header gradient for admin grants
  const headerStyle = isAdminGrant
    ? "background: linear-gradient(135deg, #9b59b6 0%, #e74c9c 50%, #f39c12 100%);"
    : "background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);";
  
  // Celebration emojis for admin grants
  const headerEmojis = isAdminGrant ? "🎉🎂🍰🧁" : "✨";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getWelcomeTitle(paymentType)}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(232, 67, 147, 0.15);">
          
          <!-- Logo -->
          <tr>
            <td style="padding: 25px 30px 0; text-align: center;">
              <img src="https://ozgghjbvhveswqplzegd.supabase.co/storage/v1/object/public/cake-images/logo.png" alt="Cake AI Artist" style="width: 100px; height: 100px; border-radius: 50%;" />
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="${headerStyle} padding: 40px 30px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; margin: 0 0 10px; font-size: 32px;">
                ${headerEmojis}
              </p>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                ${getWelcomeTitle(paymentType)}
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0; font-size: 17px;">
                ${getWelcomeSubtitle(paymentType)}
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
                <p style="color: #ffffff; margin: 5px 0 0; font-size: 28px; font-weight: 700;">
                  ${memberNumber}
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <p style="color: #333; font-size: 20px; margin: 0; font-weight: 600;">
                Hello ${firstName || 'there'}! 🎂
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 15px 0 0;">
                ${getThankYouMessage(paymentType, firstName)}
              </p>
            </td>
          </tr>
          
          <!-- Benefits -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #fef7f7; border-radius: 12px; padding: 25px;">
                <h2 style="color: #c44569; margin: 0 0 20px; font-size: 18px;">
                  ${getBenefitsTitle(paymentType)}
                </h2>
                <table width="100%" cellpadding="8" cellspacing="0">
                  ${getBenefitsList(paymentType)}
                </table>
              </div>
            </td>
          </tr>
          
          <!-- What to Create Section (only for admin grants) -->
          ${isAdminGrant ? getWhatToCreateSection() : ""}
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 40px; text-align: center;">
              <a href="https://cakeaiartist.com" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 30px; font-size: 17px; font-weight: 600; box-shadow: 0 4px 15px rgba(232, 67, 147, 0.4);">
                🎂 Start Creating Your First Cake →
              </a>
            </td>
          </tr>
          
          <!-- Support Note -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0; line-height: 1.6;">
                💬 Questions? We're here to help!<br/>
                <a href="mailto:support@cakeaiartist.com" style="color: #c44569; text-decoration: none;">support@cakeaiartist.com</a>
              </p>
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
  memberNumber: string,
  tier: string,
  displayAmount: string,
  paymentId: string,
  orderId: string,
  invoiceNumber: string,
  purchaseDate: string,
  paymentType: "lifetime" | "subscription" | "admin_grant"
): string {
  const tierDescription = getTierDescription(tier, paymentType);
  
  // For admin grants, show a simplified confirmation without payment details
  if (paymentType === "admin_grant") {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Premium Access Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <!-- Logo -->
          <tr>
            <td style="padding: 25px 30px 0; text-align: center;">
              <img src="https://ozgghjbvhveswqplzegd.supabase.co/storage/v1/object/public/cake-images/logo.png" alt="Cake AI Artist" style="width: 100px; height: 100px; border-radius: 50%;" />
            </td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                🎁 Complimentary Access Granted
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
                Member ${memberNumber}
              </p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding: 30px;">
              <p style="color: #333; font-size: 16px; margin: 0;">
                Hello ${firstName || 'there'},
              </p>
              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 15px 0 0;">
                You have been granted complimentary premium access to Cake AI Artist. Your account has been upgraded and you now have full access to all premium features.
              </p>
            </td>
          </tr>
          
          <!-- Access Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f8f4ff; border-radius: 12px; padding: 25px; border: 1px solid #e8daff;">
                <h3 style="color: #8e44ad; margin: 0 0 15px; font-size: 16px;">
                  🎂 Access Details
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e8daff; padding-bottom: 12px;">Member Number</td>
                    <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e8daff; padding-bottom: 12px;">${memberNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e8daff; padding: 12px 0;">Access Type</td>
                    <td style="color: #333; font-size: 14px; text-align: right; border-bottom: 1px solid #e8daff; padding: 12px 0;">${tierDescription}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; padding: 12px 0;">Activated On</td>
                    <td style="color: #333; font-size: 14px; text-align: right; padding: 12px 0;">${purchaseDate}</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Support Note -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
                💬 Questions? Contact us at 
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
  
  // For paid users (lifetime or subscription), show full payment details
  const isSubscription = paymentType === "subscription";
  const headerColor = isSubscription 
    ? "background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);" 
    : "background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);";
  const headerTitle = isSubscription ? "🔄 Subscription Confirmed" : "🧾 Payment Confirmed";
  
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
          <!-- Logo -->
          <tr>
            <td style="padding: 25px 30px 0; text-align: center;">
              <img src="https://ozgghjbvhveswqplzegd.supabase.co/storage/v1/object/public/cake-images/logo.png" alt="Cake AI Artist" style="width: 100px; height: 100px; border-radius: 50%;" />
            </td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="${headerColor} padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                ${headerTitle}
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 14px;">
                ${isSubscription ? `Subscription ID: ${orderId}` : `Invoice ${invoiceNumber}`}
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
                ${isSubscription 
                  ? "Thank you for subscribing! Your monthly premium subscription is now active. Here are your subscription details:"
                  : "Thank you for your purchase! Your payment has been successfully processed. Here are your receipt details:"}
              </p>
            </td>
          </tr>
          
          <!-- Invoice/Subscription Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; border: 1px solid #e9ecef;">
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e9ecef; padding-bottom: 12px;">${isSubscription ? "Subscription ID" : "Invoice Number"}</td>
                    <td style="color: #333; font-size: 14px; font-weight: 600; text-align: right; border-bottom: 1px solid #e9ecef; padding-bottom: 12px;">${isSubscription ? orderId : invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e9ecef; padding: 12px 0;">Date</td>
                    <td style="color: #333; font-size: 14px; text-align: right; border-bottom: 1px solid #e9ecef; padding: 12px 0;">${purchaseDate}</td>
                  </tr>
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e9ecef; padding: 12px 0;">${isSubscription ? "Transaction ID" : "Payment ID"}</td>
                    <td style="color: #333; font-size: 12px; text-align: right; border-bottom: 1px solid #e9ecef; padding: 12px 0; font-family: monospace;">${paymentId}</td>
                  </tr>
                  ${!isSubscription ? `
                  <tr>
                    <td style="color: #666; font-size: 14px; border-bottom: 1px solid #e9ecef; padding: 12px 0;">Order ID</td>
                    <td style="color: #333; font-size: 12px; text-align: right; border-bottom: 1px solid #e9ecef; padding: 12px 0; font-family: monospace;">${orderId}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Item Details -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <div style="background-color: ${isSubscription ? "#e8f4fd" : "#fff8e1"}; border-radius: 12px; padding: 25px; border: 1px solid ${isSubscription ? "#b3d9f7" : "#ffe082"};">
                <h3 style="color: ${isSubscription ? "#2980b9" : "#f39c12"}; margin: 0 0 15px; font-size: 16px;">
                  🎂 ${isSubscription ? "Subscription Details" : "Purchase Details"}
                </h3>
                <table width="100%" cellpadding="8" cellspacing="0">
                  <tr>
                    <td style="color: #333; font-size: 14px;">
                      <strong>${tierDescription}</strong>
                      <br>
                      <span style="color: #666; font-size: 13px;">${isSubscription ? `Monthly Premium - Member ${memberNumber}` : `Lifetime Access - Member ${memberNumber}`}</span>
                    </td>
                    <td style="color: #333; font-size: 18px; font-weight: 700; text-align: right; vertical-align: top;">
                      ${displayAmount}${isSubscription ? "/mo" : ""}
                    </td>
                  </tr>
                </table>
                <div style="border-top: 2px solid ${isSubscription ? "#2980b9" : "#f39c12"}; margin-top: 15px; padding-top: 15px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="color: #333; font-size: 16px; font-weight: 700;">${isSubscription ? "Monthly Amount" : "Total Paid"}</td>
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
                <strong>Included in your ${isSubscription ? "subscription" : "purchase"}:</strong>
              </p>
              <p style="color: #888; font-size: 13px; line-height: 1.8; margin: 0;">
                ${isSubscription 
                  ? "✓ 100 cake generations/month &nbsp;&nbsp;✓ Party Pack Generator &nbsp;&nbsp;✓ Private Gallery (30 images) &nbsp;&nbsp;✓ Smart Reminders &nbsp;&nbsp;✓ Priority Support &nbsp;&nbsp;✓ Cancel anytime"
                  : "✓ 150 cake generations/year &nbsp;&nbsp;✓ Party Pack Generator &nbsp;&nbsp;✓ Private Gallery (30 images) &nbsp;&nbsp;✓ Smart Reminders &nbsp;&nbsp;✓ Priority Support &nbsp;&nbsp;✓ All Future Updates"}
              </p>
            </td>
          </tr>
          
          ${isSubscription ? `
          <!-- Next Billing -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6; background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                📅 <strong>Next billing date:</strong> Your subscription will automatically renew monthly. You can cancel anytime from your account settings.
              </p>
            </td>
          </tr>
          ` : ""}
          
          <!-- Support Note -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <p style="color: #888; font-size: 13px; margin: 0; line-height: 1.6;">
                💬 Questions about your ${isSubscription ? "subscription" : "purchase"}? Contact us at 
                <a href="mailto:support@cakeaiartist.com" style="color: #c44569; text-decoration: none;">support@cakeaiartist.com</a>
              </p>
            </td>
          </tr>
          
          <!-- GST Note -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <p style="color: #888; font-size: 12px; margin: 0; line-height: 1.6; background-color: #f8f9fa; padding: 12px 15px; border-radius: 6px; border-left: 3px solid #ccc;">
                All prices are inclusive of applicable taxes (GST). Issued by USD Vision AI LLP, GSTIN: 36AAJFU0315K1Z5
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

// ============= SUBSCRIPTION ENDED EMAIL TEMPLATES =============

function getWhatYoureMissingSection(): string {
  return `
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%); border-radius: 12px; padding: 25px; border: 1px solid #ffcdd2;">
                      <h2 style="color: #c62828; margin: 0 0 15px; font-size: 18px;">
                        😢 What You're Missing Without Premium
                      </h2>
                      <table width="100%" cellpadding="8" cellspacing="0">
                        <tr>
                          <td style="color: #555; font-size: 14px;">
                            <span style="color: #c62828;">❌</span> <strong>150 → 5</strong> cake generations (per year → per day)
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #555; font-size: 14px;">
                            <span style="color: #c62828;">❌</span> <strong>30 → 20</strong> gallery storage slots
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #555; font-size: 14px;">
                            <span style="color: #c62828;">❌</span> <strong>No access</strong> to Party Pack Generator
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #555; font-size: 14px;">
                            <span style="color: #c62828;">❌</span> <strong>No</strong> Smart Occasion Reminders
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #555; font-size: 14px;">
                            <span style="color: #c62828;">❌</span> <strong>No</strong> Priority Support
                          </td>
                        </tr>
                        <tr>
                          <td style="color: #555; font-size: 14px;">
                            <span style="color: #c62828;">❌</span> <strong>No</strong> Special Member Badge
                          </td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
  `;
}

function getSubscriptionHaltedEmailHtml(firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Premium Access Has Been Paused</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Logo -->
          <tr>
            <td style="padding: 25px 30px 0; text-align: center;">
              <img src="https://ozgghjbvhveswqplzegd.supabase.co/storage/v1/object/public/cake-images/logo.png" alt="Cake AI Artist" style="width: 100px; height: 100px; border-radius: 50%;" />
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); padding: 40px 30px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; margin: 0 0 10px; font-size: 32px;">⚠️</p>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                Payment Issue Detected
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0; font-size: 16px;">
                Your premium access has been paused
              </p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="color: #333; font-size: 20px; margin: 0; font-weight: 600;">
                Hi ${firstName || 'there'},
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 15px 0 0;">
                We tried to process your subscription payment, but it didn't go through. Your premium access is temporarily paused until we can successfully charge your payment method.
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 15px 0 0;">
                <strong>Don't worry!</strong> This is an easy fix. Just update your payment information and you'll be back to creating beautiful cakes in no time.
              </p>
            </td>
          </tr>
          
          ${getWhatYoureMissingSection()}
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="https://cakeaiartist.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 30px; font-size: 17px; font-weight: 600; box-shadow: 0 4px 15px rgba(232, 67, 147, 0.4);">
                💳 Reactivate My Premium →
              </a>
            </td>
          </tr>
          
          <!-- Alternative -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Or upgrade to <a href="https://cakeaiartist.com/pricing" style="color: #c44569; text-decoration: none; font-weight: 600;">Lifetime Access</a> - One payment, no more renewal worries!
              </p>
            </td>
          </tr>
          
          <!-- Support -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0; line-height: 1.6;">
                💬 Need help? Contact us at<br/>
                <a href="mailto:support@cakeaiartist.com" style="color: #c44569; text-decoration: none;">support@cakeaiartist.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fef7f7; padding: 25px 30px; text-align: center; border-top: 1px solid #f0e0e0;">
              <p style="color: #888; font-size: 14px; margin: 0;">Made with 💖 by Cake AI Artist</p>
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

function getSubscriptionExpiredEmailHtml(firstName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We Miss You!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Logo -->
          <tr>
            <td style="padding: 25px 30px 0; text-align: center;">
              <img src="https://ozgghjbvhveswqplzegd.supabase.co/storage/v1/object/public/cake-images/logo.png" alt="Cake AI Artist" style="width: 100px; height: 100px; border-radius: 50%;" />
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); padding: 40px 30px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; margin: 0 0 10px; font-size: 32px;">😢💔</p>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                We Miss You!
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0; font-size: 16px;">
                Your premium subscription has expired
              </p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="color: #333; font-size: 20px; margin: 0; font-weight: 600;">
                Hi ${firstName || 'there'},
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 15px 0 0;">
                Your Cake AI Artist premium subscription has expired. We've really enjoyed having you as a premium member, and we hope you'll come back soon!
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 15px 0 0;">
                All your saved cakes and gallery items are still safe and waiting for you. You can still access them with your free account, but you're missing out on the full creative experience.
              </p>
            </td>
          </tr>
          
          ${getWhatYoureMissingSection()}
          
          <!-- Special Offer -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); border-radius: 12px; padding: 20px; border: 2px solid #ff9800; text-align: center;">
                <p style="color: #e65100; font-size: 16px; font-weight: 700; margin: 0 0 5px;">
                  🎁 Welcome Back Offer
                </p>
                <p style="color: #555; font-size: 14px; margin: 0;">
                  Resubscribe now and pick up right where you left off!
                </p>
              </div>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="https://cakeaiartist.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 30px; font-size: 17px; font-weight: 600; box-shadow: 0 4px 15px rgba(156, 39, 176, 0.4);">
                🎂 Renew My Premium →
              </a>
            </td>
          </tr>
          
          <!-- Lifetime Upsell -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Tired of renewals? Get <a href="https://cakeaiartist.com/pricing" style="color: #c44569; text-decoration: none; font-weight: 600;">Lifetime Access</a> for one simple payment!
              </p>
            </td>
          </tr>
          
          <!-- Support -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0; line-height: 1.6;">
                💬 Questions? We're here at<br/>
                <a href="mailto:support@cakeaiartist.com" style="color: #c44569; text-decoration: none;">support@cakeaiartist.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fef7f7; padding: 25px 30px; text-align: center; border-top: 1px solid #f0e0e0;">
              <p style="color: #888; font-size: 14px; margin: 0;">Made with 💖 by Cake AI Artist</p>
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

function getSubscriptionCancelledEmailHtml(firstName: string, periodEndDate: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subscription Cancellation Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef7f7; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          
          <!-- Logo -->
          <tr>
            <td style="padding: 25px 30px 0; text-align: center;">
              <img src="https://ozgghjbvhveswqplzegd.supabase.co/storage/v1/object/public/cake-images/logo.png" alt="Cake AI Artist" style="width: 100px; height: 100px; border-radius: 50%;" />
            </td>
          </tr>
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #607d8b 0%, #455a64 100%); padding: 40px 30px; text-align: center; margin-top: 20px;">
              <p style="color: #ffffff; margin: 0 0 10px; font-size: 32px;">📋</p>
              <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 700;">
                Cancellation Confirmed
              </h1>
              <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0; font-size: 16px;">
                Your subscription will end on ${periodEndDate}
              </p>
            </td>
          </tr>
          
          <!-- Message -->
          <tr>
            <td style="padding: 30px 30px 20px;">
              <p style="color: #333; font-size: 20px; margin: 0; font-weight: 600;">
                Hi ${firstName || 'there'},
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 15px 0 0;">
                We've received your cancellation request. Your premium access will remain active until <strong>${periodEndDate}</strong>, so you can still enjoy all premium features until then!
              </p>
              <p style="color: #555; font-size: 16px; line-height: 1.7; margin: 15px 0 0;">
                We're sorry to see you go. If there's anything we could have done better, we'd love to hear from you.
              </p>
            </td>
          </tr>
          
          <!-- Time Remaining -->
          <tr>
            <td style="padding: 0 30px 20px;">
              <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 20px; border: 1px solid #a5d6a7; text-align: center;">
                <p style="color: #2e7d32; font-size: 16px; font-weight: 700; margin: 0 0 5px;">
                  ✅ Still Premium Until ${periodEndDate}
                </p>
                <p style="color: #555; font-size: 14px; margin: 0;">
                  Continue creating beautiful cakes until your premium period ends!
                </p>
              </div>
            </td>
          </tr>
          
          ${getWhatYoureMissingSection()}
          
          <!-- Change Mind CTA -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <a href="https://cakeaiartist.com/pricing" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 30px; font-size: 17px; font-weight: 600; box-shadow: 0 4px 15px rgba(232, 67, 147, 0.4);">
                🔄 Change My Mind - Keep Premium →
              </a>
            </td>
          </tr>
          
          <!-- Lifetime Upsell -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0;">
                Want to avoid monthly payments? Switch to <a href="https://cakeaiartist.com/pricing" style="color: #c44569; text-decoration: none; font-weight: 600;">Lifetime Access</a>!
              </p>
            </td>
          </tr>
          
          <!-- Support -->
          <tr>
            <td style="padding: 0 30px 30px; text-align: center;">
              <p style="color: #888; font-size: 14px; margin: 0; line-height: 1.6;">
                💬 Feedback or questions?<br/>
                <a href="mailto:support@cakeaiartist.com" style="color: #c44569; text-decoration: none;">support@cakeaiartist.com</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #fef7f7; padding: 25px 30px; text-align: center; border-top: 1px solid #f0e0e0;">
              <p style="color: #888; font-size: 14px; margin: 0;">Made with 💖 by Cake AI Artist</p>
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

// Handle subscription ended email sending
async function handleSubscriptionEndedEmail(
  supabase: any,
  request: SubscriptionEndedRequest
): Promise<{ success: boolean; message: string }> {
  const { userId, status, subscriptionId, periodEndDate } = request;

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("email, first_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile?.email) {
    console.error("Failed to get user profile for subscription ended email:", profileError);
    return { success: false, message: "User profile not found" };
  }

  const firstName = profile.first_name || "";
  const formattedPeriodEnd = periodEndDate 
    ? new Date(periodEndDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "soon";

  let subject: string;
  let htmlContent: string;

  switch (status) {
    case "halted":
      subject = `⚠️ ${firstName || 'Hi'}, Your Cake AI Artist Premium Access Has Been Paused`;
      htmlContent = getSubscriptionHaltedEmailHtml(firstName);
      break;
    case "expired":
      subject = `😢 We Miss You, ${firstName || 'Friend'}! Your Premium Has Expired`;
      htmlContent = getSubscriptionExpiredEmailHtml(firstName);
      break;
    case "cancelled":
      subject = `📋 Cancellation Confirmed - Premium Ends ${formattedPeriodEnd}`;
      htmlContent = getSubscriptionCancelledEmailHtml(firstName, formattedPeriodEnd);
      break;
    default:
      return { success: false, message: "Unknown status" };
  }

  try {
    await sendEmail(
      profile.email,
      subject,
      htmlContent,
      "support@cakeaiartist.com",
      "Cake AI Artist"
    );
    console.log(`Subscription ${status} email sent to:`, profile.email);
    return { success: true, message: `${status} email sent` };
  } catch (error) {
    console.error(`Failed to send subscription ${status} email:`, error);
    return { success: false, message: "Email send failed" };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Check if this is a subscription ended request
    if (body.status && (body.status === "halted" || body.status === "expired" || body.status === "cancelled")) {
      console.log("Processing subscription ended email for status:", body.status);
      
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      const result = await handleSubscriptionEndedEmail(supabase, body as SubscriptionEndedRequest);
      
      return new Response(
        JSON.stringify(result),
        { 
          status: result.success ? 200 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Original premium emails logic
    const { userId, memberNumber, tier, amount, currency, razorpay_payment_id, razorpay_order_id } = body as EmailRequest;

    console.log("Sending premium emails for user:", userId, "member:", memberNumber);

    // Detect payment type from member number format
    const paymentType = getPaymentType(memberNumber, razorpay_payment_id);
    console.log("Detected payment type:", paymentType);

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

    // Determine welcome email subject based on type
    let welcomeSubject: string;
    switch (paymentType) {
      case "lifetime":
        welcomeSubject = `✨ Welcome to the Lifetime Club, ${firstName || "Member"}! You're Member ${memberNumber}`;
        break;
      case "subscription":
        welcomeSubject = `🌟 Welcome to Premium, ${firstName || "Member"}! You're Member ${memberNumber}`;
        break;
      case "admin_grant":
        welcomeSubject = `🎉 Welcome to Cake AI Artist, ${firstName || "Member"}! Your Premium Access is Ready (Member ${memberNumber})`;
        break;
    }

    // Send Premium Welcome Email
    const welcomeHtml = getPremiumWelcomeEmailHtml(firstName, memberNumber, paymentType);
    await sendEmail(
      profile.email,
      welcomeSubject,
      welcomeHtml,
      "welcome@cakeaiartist.com",
      "Cake AI Artist"
    );

    // Only send confirmation/invoice email for paid users (lifetime or subscription)
    // Admin grants only receive the single welcome email above
    if (paymentType !== "admin_grant") {
      if (currency === "INR") {
        // Send formal GST Tax Invoice for INR payments
        const gstInvoiceSubject = `🧾 Tax Invoice - Cake AI Artist (${invoiceNumber})`;
        const gstInvoiceHtml = getGSTInvoiceEmailHtml(
          firstName,
          memberNumber,
          tier,
          amount,
          razorpay_payment_id,
          razorpay_order_id,
          invoiceNumber,
          purchaseDate,
          paymentType
        );
        await sendEmail(
          profile.email,
          gstInvoiceSubject,
          gstInvoiceHtml,
          "billing@cakeaiartist.com",
          "Cake AI Artist"
        );
      } else {
        // Send standard payment confirmation with GST note for non-INR
        let confirmSubject: string;
        switch (paymentType) {
          case "lifetime":
            confirmSubject = `🧾 Payment Confirmed - Cake AI Artist Lifetime Access (Invoice ${invoiceNumber})`;
            break;
          case "subscription":
            confirmSubject = `🔄 Subscription Confirmed - Cake AI Artist Monthly Premium`;
            break;
          default:
            confirmSubject = `🧾 Payment Confirmed - Cake AI Artist`;
        }

        const invoiceHtml = getPaymentConfirmationEmailHtml(
          firstName,
          memberNumber,
          tier,
          displayAmount,
          razorpay_payment_id,
          razorpay_order_id,
          invoiceNumber,
          purchaseDate,
          paymentType
        );
        await sendEmail(
          profile.email,
          confirmSubject,
          invoiceHtml,
          "billing@cakeaiartist.com",
          "Cake AI Artist Billing"
        );
      }
      console.log("Both premium emails sent successfully to:", profile.email);
    } else {
      console.log("Single welcome email sent for admin grant to:", profile.email);
    }

    return new Response(
      JSON.stringify({ success: true, invoiceNumber, paymentType }),
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
