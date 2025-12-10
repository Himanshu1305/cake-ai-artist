import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

const requestSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  tier: z.enum(["tier_1_49", "tier_2_99"]),
  amount: z.number(),
  currency: z.string(),
});

// HMAC SHA256 signature verification
async function verifySignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const message = `${orderId}|${paymentId}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(RAZORPAY_KEY_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const expectedSignature = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  
  return expectedSignature === signature;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with user context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request body
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      console.error("Validation error:", parseResult.error);
      return new Response(JSON.stringify({ error: "Invalid request", details: parseResult.error.errors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tier, amount, currency } = parseResult.data;

    // Verify payment signature
    const isValid = await verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      console.error("Invalid payment signature");
      return new Response(JSON.stringify({ error: "Payment verification failed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Payment signature verified successfully");

    // Use service role for database operations
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if user is already a founding member
    const { data: existingMember } = await supabaseServiceRole
      .from("founding_members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      return new Response(JSON.stringify({ error: "You are already a lifetime member" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate year-based member number (e.g., 2025-1001)
    const currentYear = new Date().getFullYear();
    
    // Count members for current year to determine sequence
    const { count } = await supabaseServiceRole
      .from("founding_members")
      .select("*", { count: "exact", head: true })
      .like("member_number", `${currentYear}-%`);

    // Start from 1001 for first member of each year
    const sequenceNumber = 1001 + (count || 0);
    const memberNumber = `${currentYear}-${sequenceNumber}`;
    
    const pricePaid = amount / 100; // Convert from smallest unit to display value
    const specialBadge = tier === "tier_1_49" ? "gold" : "silver";

    // Insert founding member record
    const { error: insertError } = await supabaseServiceRole
      .from("founding_members")
      .insert({
        user_id: user.id,
        tier: tier,
        member_number: memberNumber,
        price_paid: pricePaid,
        special_badge: specialBadge,
        display_on_wall: true,
      });

    if (insertError) {
      console.error("Failed to insert founding member:", insertError);
      return new Response(JSON.stringify({ error: "Failed to activate membership" }), {
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
      .eq("id", user.id);

    if (profileError) {
      console.error("Failed to update profile:", profileError);
      // Don't fail the request, member is already created
    }

    // Add activity feed entry
    await supabaseServiceRole.rpc("add_activity_feed", {
      p_activity_type: "purchase",
      p_message: `🎉 Member #${memberNumber} just joined with a Lifetime Deal!`,
    });

    // Send premium emails (welcome + payment confirmation) via Brevo Transactional API
    try {
      await supabaseServiceRole.functions.invoke("send-premium-emails", {
        body: {
          userId: user.id,
          memberNumber,
          tier,
          amount,
          currency,
          razorpay_payment_id,
          razorpay_order_id,
        },
      });
    } catch (emailError) {
      console.error("Failed to send premium emails:", emailError);
      // Don't fail the request
    }

    console.log(`Successfully processed payment for user ${user.id}, member #${memberNumber}`);

    return new Response(JSON.stringify({
      success: true,
      member_number: memberNumber,
      tier: tier,
      badge: specialBadge,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in verify-razorpay-payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
