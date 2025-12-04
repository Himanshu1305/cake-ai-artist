import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName?: string;
  isPremium?: boolean;
}

const getPremiumWelcomeEmail = (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cake AI Artist Premium</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); border-radius: 20px 20px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px;">✨ Welcome to Premium!</h1>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
      <p style="font-size: 18px; color: #333; margin-top: 0;">Hello ${firstName},</p>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        Welcome to <strong>Cake AI Artist Premium</strong> — where every celebration becomes a personalized piece of art.
      </p>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        You now have full access to a suite of creative tools designed to help you craft unforgettable digital cakes, invitations, and party themes with effortless elegance.
      </p>
      
      <div style="background: #fef7f7; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #c44569; margin-top: 0;">Your premium benefits include:</h3>
        
        <div style="margin: 16px 0;">
          <p style="margin: 12px 0; color: #333;">
            <strong>🍰 Bespoke AI Cake Designer</strong><br>
            <span style="color: #666; font-size: 14px;">Create stunning cakes with photos, names and custom themes in seconds.</span>
          </p>
        </div>
        
        <div style="margin: 16px 0;">
          <p style="margin: 12px 0; color: #333;">
            <strong>🎨 Complete Party Suite</strong><br>
            <span style="color: #666; font-size: 14px;">Generate invitations, banners, thank-you cards, and themed assets instantly.</span>
          </p>
        </div>
        
        <div style="margin: 16px 0;">
          <p style="margin: 12px 0; color: #333;">
            <strong>🖼️ Private Creative Gallery</strong><br>
            <span style="color: #666; font-size: 14px;">Your personal space to save, organize and revisit every creation.</span>
          </p>
        </div>
        
        <div style="margin: 16px 0;">
          <p style="margin: 12px 0; color: #333;">
            <strong>⏰ Smart Occasion Alerts</strong><br>
            <span style="color: #666; font-size: 14px;">Stay prepared for every special moment with timely reminders.</span>
          </p>
        </div>
      </div>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        Your first masterpiece is just a click away. Dive in and let the fun begin!
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://cakeaiartist.com" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 30px; font-weight: bold; font-size: 16px;">
          👉 Start Crafting Your Cake
        </a>
      </div>
      
      <p style="font-size: 14px; color: #888; line-height: 1.6;">
        Should you need support or creative guidance, just reply — we're here to make every celebration extraordinary.
      </p>
      
      <p style="font-size: 16px; color: #555; margin-bottom: 0;">
        Warm regards,<br>
        <strong>The Cake AI Artist Team</strong>
      </p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
      <p>© 2025 Cake AI Artist. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const getFreeWelcomeEmail = (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cake AI Artist</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fef7f7;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); border-radius: 20px 20px 0 0; padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px;">🎂 Welcome to Cake AI Artist!</h1>
    </div>
    
    <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
      <p style="font-size: 18px; color: #333; margin-top: 0;">Hello ${firstName},</p>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        Welcome to <strong>Cake AI Artist</strong> — where celebrations come to life through AI creativity!
      </p>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        You now have access to our creative tools to craft stunning digital cakes.
      </p>
      
      <div style="background: #fef7f7; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="color: #c44569; margin-top: 0;">What you can do right now:</h3>
        
        <div style="margin: 16px 0;">
          <p style="margin: 12px 0; color: #333;">
            <strong>🍰 Create AI-Designed Cakes</strong><br>
            <span style="color: #666; font-size: 14px;">5 free cake generations per day to explore your creativity.</span>
          </p>
        </div>
        
        <div style="margin: 16px 0;">
          <p style="margin: 12px 0; color: #333;">
            <strong>🎨 Preview Personalized Messages</strong><br>
            <span style="color: #666; font-size: 14px;">AI-generated heartfelt messages for your loved ones.</span>
          </p>
        </div>
        
        <div style="margin: 16px 0;">
          <p style="margin: 12px 0; color: #333;">
            <strong>🖼️ Save to Your Gallery</strong><br>
            <span style="color: #666; font-size: 14px;">Keep your favorite creations safe and accessible.</span>
          </p>
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #f39c12;">
        <p style="margin: 0; color: #856404; font-size: 14px;">
          <strong>💎 Ready for unlimited creativity?</strong><br>
          Upgrade to Premium for full access to all features including Party Pack Generator, unlimited creations, and smart occasion alerts!
        </p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="https://cakeaiartist.com" style="display: inline-block; background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 30px; font-weight: bold; font-size: 16px;">
          👉 Create Your First Cake
        </a>
      </div>
      
      <p style="font-size: 16px; color: #555; margin-bottom: 0;">
        Happy creating!<br>
        <strong>The Cake AI Artist Team</strong>
      </p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
      <p>© 2025 Cake AI Artist. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, isPremium }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const greeting = firstName || "there";
    const subject = isPremium 
      ? "✨ Your Premium Access to Cake AI Artist Has Begun"
      : "🎂 Welcome to Cake AI Artist!";
    const htmlContent = isPremium 
      ? getPremiumWelcomeEmail(greeting)
      : getFreeWelcomeEmail(greeting);

    console.log(`Sending ${isPremium ? 'premium' : 'free'} welcome email to ${email}`);

    const emailResponse = await resend.emails.send({
      from: "Cake AI Artist <welcome@cakeaiartist.com>",
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
