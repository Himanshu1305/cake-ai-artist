import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_ID = "rzp_live_Rp0dR29v14TRpM";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

const requestSchema = z.object({
  tier: z.enum(["tier_1_49", "tier_2_99"]),
  country: z.string().optional().default("US"),
});

// Pricing by country (amount in smallest currency unit)
const PRICING: Record<string, { tier_1: { amount: number; currency: string }; tier_2: { amount: number; currency: string } }> = {
  IN: { 
    tier_1: { amount: 410000, currency: "INR" },  // ₹4,100 (in paise)
    tier_2: { amount: 820000, currency: "INR" },  // ₹8,200
  },
  GB: { 
    tier_1: { amount: 3900, currency: "GBP" },    // £39 (in pence)
    tier_2: { amount: 7800, currency: "GBP" },    // £78
  },
  CA: { 
    tier_1: { amount: 6700, currency: "CAD" },    // CAD$67 (in cents)
    tier_2: { amount: 13400, currency: "CAD" },   // CAD$134
  },
  AU: { 
    tier_1: { amount: 7500, currency: "AUD" },    // AUD$75 (in cents)
    tier_2: { amount: 15000, currency: "AUD" },   // AUD$150
  },
  US: { 
    tier_1: { amount: 4900, currency: "USD" },    // $49 (in cents)
    tier_2: { amount: 9900, currency: "USD" },    // $99
  },
};

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

    // Create Supabase client
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

    const { tier, country } = parseResult.data;
    const countryCode = country.toUpperCase();
    const pricing = PRICING[countryCode] || PRICING.US;
    const tierPricing = tier === "tier_1_49" ? pricing.tier_1 : pricing.tier_2;

    // Check if user is already a founding member
    const { data: existingMember } = await supabase
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

    // Check available spots using service role
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: spots, error: spotsError } = await supabaseServiceRole.rpc("get_available_spots");
    if (spotsError) {
      console.error("Spots error:", spotsError);
      return new Response(JSON.stringify({ error: "Failed to check availability" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate tier availability
    if (tier === "tier_1_49" && spots.tier_1_available <= 0) {
      return new Response(JSON.stringify({ error: "Tier 1 is sold out. Please select Tier 2." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (tier === "tier_2_99" && spots.tier_2_available <= 0) {
      return new Response(JSON.stringify({ error: "All spots are sold out." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use country-specific pricing
    const amount = tierPricing.amount;
    const currency = tierPricing.currency;
    console.log(`Creating order for country: ${countryCode}, amount: ${amount}, currency: ${currency}`);

    // Create Razorpay order
    const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${razorpayAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount,
        currency: currency,
        receipt: `${user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          user_id: user.id,
          user_email: user.email,
          tier: tier,
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      console.error("Razorpay order error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await orderResponse.json();
    console.log("Razorpay order created:", order.id);

    return new Response(JSON.stringify({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID,
      user_email: user.email,
      user_name: user.user_metadata?.first_name || "",
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in create-razorpay-order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
