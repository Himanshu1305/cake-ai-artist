import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

// Verify Razorpay webhook signature
async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  
  return expectedSignature === signature;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature");
    const bodyText = await req.text();
    
    console.log("Webhook received");

    if (!signature) {
      console.error("No webhook signature");
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify webhook signature
    const isValid = await verifyWebhookSignature(bodyText, signature);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;
    
    console.log("Webhook event:", event);

    // Only process payment.captured events
    if (event !== "payment.captured") {
      console.log("Ignoring event:", event);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payment = payload.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const amount = payment.amount;
    const currency = payment.currency;
    const notes = payment.notes || {};
    const userId = notes.user_id;
    const tier = notes.tier;

    console.log("Payment captured:", { orderId, paymentId, amount, currency, userId, tier });

    if (!userId || !tier) {
      console.error("Missing user_id or tier in payment notes");
      return new Response(JSON.stringify({ error: "Missing metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for database operations
    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if already processed (idempotency)
    const { data: existingMember } = await supabaseServiceRole
      .from("founding_members")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMember) {
      console.log("User already a founding member, skipping");
      return new Response(JSON.stringify({ received: true, already_processed: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current member count
    const { count } = await supabaseServiceRole
      .from("founding_members")
      .select("*", { count: "exact", head: true });

    const memberNumber = (count || 0) + 1;
    const pricePaid = amount / 100; // Convert from paise/cents
    const specialBadge = tier === "tier_1_49" ? "gold" : "silver";

    // Insert founding member record
    const { error: insertError } = await supabaseServiceRole
      .from("founding_members")
      .insert({
        user_id: userId,
        tier: tier,
        member_number: memberNumber,
        price_paid: pricePaid,
        special_badge: specialBadge,
        display_on_wall: true,
      });

    if (insertError) {
      console.error("Failed to insert founding member:", insertError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile to premium
    const { error: profileError } = await supabaseServiceRole
      .from("profiles")
      .update({
        is_premium: true,
        is_founding_member: true,
        founding_member_number: memberNumber,
        founding_tier: tier,
        lifetime_access: true,
        purchased_date: new Date().toISOString(),
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to update profile:", profileError);
    }

    // Add activity feed entry
    await supabaseServiceRole.rpc("add_activity_feed", {
      p_activity_type: "purchase",
      p_message: `🎉 Member #${memberNumber} just joined with a Lifetime Deal!`,
    });

    console.log(`Webhook processed: user ${userId} is now member #${memberNumber}`);

    return new Response(JSON.stringify({ 
      received: true, 
      processed: true,
      member_number: memberNumber 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
