import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-test-secret",
};

// Test secret for authorization - use environment variable
const TEST_SECRET = Deno.env.get("TEST_EMAIL_SECRET");

// Country-specific pricing for test emails
const TEST_PRICING: Record<string, { amount: number; currency: string; symbol: string }> = {
  IN: { amount: 4100, currency: "INR", symbol: "₹" },
  GB: { amount: 39, currency: "GBP", symbol: "£" },
  CA: { amount: 67, currency: "CAD", symbol: "C$" },
  AU: { amount: 75, currency: "AUD", symbol: "A$" },
  US: { amount: 49, currency: "USD", symbol: "$" },
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify test secret is configured
    if (!TEST_SECRET) {
      console.error("TEST_EMAIL_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Test endpoint not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify test secret
    const testSecret = req.headers.get("x-test-secret");
    if (testSecret !== TEST_SECRET) {
      console.error("Invalid test secret provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid test secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { userId, country = "US", tier = "tier_1_49" } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Testing premium email for user: ${userId}, country: ${country}, tier: ${tier}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile to verify user exists
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, first_name, last_name")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("User not found:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found", details: profileError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found user: ${profile.email}`);

    // Get test pricing based on country
    const pricing = TEST_PRICING[country] || TEST_PRICING.US;

    // Generate test data
    const testMemberNumber = "2025-TEST";
    const testPaymentId = `TEST_pay_${Date.now()}`;
    const testOrderId = `TEST_order_${Date.now()}`;

    console.log(`Sending test emails with member number: ${testMemberNumber}`);

    // Call send-premium-emails function
    const { error: emailError } = await supabase.functions.invoke("send-premium-emails", {
      body: {
        userId: profile.id,
        email: profile.email,
        firstName: profile.first_name || "Valued Customer",
        lastName: profile.last_name || "",
        memberNumber: testMemberNumber,
        tier: tier,
        amount: pricing.amount,
        currency: pricing.currency,
        country: country,
        razorpay_payment_id: testPaymentId,
        razorpay_order_id: testOrderId,
      },
    });

    if (emailError) {
      console.error("Error sending test emails:", emailError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send test emails", 
          details: emailError.message 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Test emails sent successfully!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test emails sent successfully",
        testData: {
          userId: profile.id,
          email: profile.email,
          memberNumber: testMemberNumber,
          tier: tier,
          amount: `${pricing.symbol}${pricing.amount}`,
          currency: pricing.currency,
          country: country,
          paymentId: testPaymentId,
          orderId: testOrderId,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in test-premium-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
