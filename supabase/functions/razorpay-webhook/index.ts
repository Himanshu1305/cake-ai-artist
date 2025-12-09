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

// Handle one-time payment captured
async function handlePaymentCaptured(payment: any, supabase: any): Promise<{ success: boolean; message: string }> {
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
    return { success: false, message: "Missing metadata" };
  }

  // Check if already processed (idempotency)
  const { data: existingMember } = await supabase
    .from("founding_members")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingMember) {
    console.log("User already a founding member, skipping");
    return { success: true, message: "Already processed" };
  }

  // Get current member count
  const { count } = await supabase
    .from("founding_members")
    .select("*", { count: "exact", head: true });

  const memberNumber = (count || 0) + 1;
  const pricePaid = amount / 100; // Convert from paise/cents
  const specialBadge = tier === "tier_1_49" ? "gold" : "silver";

  // Insert founding member record
  const { error: insertError } = await supabase
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
    return { success: false, message: "Database error" };
  }

  // Update profile to premium
  const { error: profileError } = await supabase
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
  await supabase.rpc("add_activity_feed", {
    p_activity_type: "purchase",
    p_message: `🎉 Member #${memberNumber} just joined with a Lifetime Deal!`,
  });

  console.log(`Payment processed: user ${userId} is now member #${memberNumber}`);
  return { success: true, message: `Member #${memberNumber}` };
}

// Handle subscription activated
async function handleSubscriptionActivated(subscription: any, supabase: any): Promise<{ success: boolean; message: string }> {
  const subscriptionId = subscription.id;
  const planId = subscription.plan_id;
  const notes = subscription.notes || {};
  const userId = notes.user_id;
  const tier = notes.tier;

  console.log("Subscription activated:", { subscriptionId, planId, userId, tier });

  if (!userId) {
    console.error("Missing user_id in subscription notes");
    return { success: false, message: "Missing user_id" };
  }

  // Update subscription record
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_subscription_id", subscriptionId);

  if (subError) {
    console.error("Failed to update subscription:", subError);
  }

  // Update profile to premium with subscription info
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      is_premium: true,
      subscription_id: subscriptionId,
      subscription_status: "active",
      premium_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Failed to update profile:", profileError);
    return { success: false, message: "Profile update failed" };
  }

  // Add activity feed entry
  await supabase.rpc("add_activity_feed", {
    p_activity_type: "subscription",
    p_message: `🌟 New monthly subscriber joined!`,
  });

  console.log(`Subscription activated for user ${userId}`);
  return { success: true, message: "Subscription activated" };
}

// Handle subscription charged (renewal)
async function handleSubscriptionCharged(payment: any, subscription: any, supabase: any): Promise<{ success: boolean; message: string }> {
  const subscriptionId = subscription.id;
  const notes = subscription.notes || {};
  const userId = notes.user_id;

  console.log("Subscription charged:", { subscriptionId, userId });

  if (!userId) {
    return { success: false, message: "Missing user_id" };
  }

  // Extend subscription period
  const newPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: subError } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: newPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_subscription_id", subscriptionId);

  if (subError) {
    console.error("Failed to update subscription:", subError);
  }

  // Extend premium_until
  await supabase
    .from("profiles")
    .update({
      is_premium: true,
      premium_until: newPeriodEnd,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  console.log(`Subscription renewed for user ${userId}`);
  return { success: true, message: "Subscription renewed" };
}

// Handle subscription cancelled/halted/expired
async function handleSubscriptionEnded(subscription: any, status: string, supabase: any): Promise<{ success: boolean; message: string }> {
  const subscriptionId = subscription.id;
  const notes = subscription.notes || {};
  const userId = notes.user_id;

  console.log(`Subscription ${status}:`, { subscriptionId, userId });

  if (!userId) {
    return { success: false, message: "Missing user_id" };
  }

  // Update subscription status
  const { error: subError } = await supabase
    .from("subscriptions")
    .update({
      status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("razorpay_subscription_id", subscriptionId);

  if (subError) {
    console.error("Failed to update subscription:", subError);
  }

  // For cancelled, keep premium until period ends
  // For halted/expired, remove premium immediately
  const updates: any = {
    subscription_status: status,
    updated_at: new Date().toISOString(),
  };

  if (status === "halted" || status === "expired") {
    updates.is_premium = false;
  }

  await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  console.log(`Subscription ${status} for user ${userId}`);
  return { success: true, message: `Subscription ${status}` };
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

    // Use service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result: { success: boolean; message: string };

    switch (event) {
      case "payment.captured":
        // One-time payment (lifetime deal)
        const payment = payload.payload.payment.entity;
        result = await handlePaymentCaptured(payment, supabase);
        break;

      case "subscription.activated":
        // New subscription activated
        const activatedSub = payload.payload.subscription.entity;
        result = await handleSubscriptionActivated(activatedSub, supabase);
        break;

      case "subscription.charged":
        // Monthly renewal successful
        const chargedPayment = payload.payload.payment?.entity;
        const chargedSub = payload.payload.subscription.entity;
        result = await handleSubscriptionCharged(chargedPayment, chargedSub, supabase);
        break;

      case "subscription.cancelled":
        const cancelledSub = payload.payload.subscription.entity;
        result = await handleSubscriptionEnded(cancelledSub, "cancelled", supabase);
        break;

      case "subscription.halted":
        const haltedSub = payload.payload.subscription.entity;
        result = await handleSubscriptionEnded(haltedSub, "halted", supabase);
        break;

      case "subscription.expired":
        const expiredSub = payload.payload.subscription.entity;
        result = await handleSubscriptionEnded(expiredSub, "expired", supabase);
        break;

      default:
        console.log("Ignoring event:", event);
        return new Response(JSON.stringify({ received: true, ignored: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ 
      received: true, 
      processed: result.success,
      message: result.message 
    }), {
      status: result.success ? 200 : 500,
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
