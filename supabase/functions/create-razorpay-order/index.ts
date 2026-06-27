import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cakeaiartist.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

const requestSchema = z.object({
  tier: z.enum([
    "lifetime",
    "lifetime_in", "lifetime_gb", "lifetime_ca", "lifetime_au", "lifetime_us",
    "partypack_in", "partypack_gb", "partypack_ca", "partypack_au", "partypack_us",
    "tier_1_49", "tier_2_99",
  ]),
  country: z.string().optional().default("US"),
});

// Lifetime pricing (smallest currency unit)
const LIFETIME_PRICING: Record<string, { amount: number; currency: string }> = {
  IN: { amount: 299900, currency: "INR" }, // ₹2,999
  GB: { amount: 4900,   currency: "GBP" }, // £49
  CA: { amount: 6900,   currency: "CAD" }, // C$69
  AU: { amount: 7900,   currency: "AUD" }, // A$79
  US: { amount: 4900,   currency: "USD" }, // $49
};

// Party Pack one-time pricing (smallest currency unit)
const PARTYPACK_PRICING: Record<string, { amount: number; currency: string }> = {
  IN: { amount: 29900, currency: "INR" }, // ₹299
  GB: { amount: 400,   currency: "GBP" }, // £4
  CA: { amount: 700,   currency: "CAD" }, // C$7
  AU: { amount: 800,   currency: "AUD" }, // A$8
  US: { amount: 500,   currency: "USD" }, // $5
};

const FIRST_WEEK_DISCOUNT = 0.7; // 30% off

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request", details: parseResult.error.errors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tier, country } = parseResult.data;
    const countryCode = country.toUpperCase();

    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const isPartyPack = tier.startsWith("partypack_");
    const productKind = isPartyPack ? "partypack" : "lifetime";

    let pricing = isPartyPack
      ? (PARTYPACK_PRICING[countryCode] || PARTYPACK_PRICING.US)
      : (LIFETIME_PRICING[countryCode] || LIFETIME_PRICING.US);

    const normalizedTier = `${productKind}_${countryCode.toLowerCase()}`;

    // Block re-purchase for active lifetime members (lifetime only)
    if (!isPartyPack) {
      const { data: existingMember } = await supabaseServiceRole
        .from("founding_members")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMember) {
        return new Response(JSON.stringify({ error: "You already have lifetime access" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // First-week discount: server-validated against profiles.created_at
    let firstWeekDiscountApplied = false;
    const { data: profile } = await supabaseServiceRole
      .from("profiles")
      .select("created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.created_at) {
      const ageMs = Date.now() - new Date(profile.created_at as string).getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      if (ageMs < sevenDaysMs) {
        firstWeekDiscountApplied = true;
        pricing = {
          ...pricing,
          amount: Math.round(pricing.amount * FIRST_WEEK_DISCOUNT),
        };
      }
    }

    console.log(`Creating ${productKind} order: ${countryCode} ${pricing.amount} ${pricing.currency} (discount=${firstWeekDiscountApplied})`);

    const razorpayAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${razorpayAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: pricing.amount,
        currency: pricing.currency,
        receipt: `${user.id.slice(0, 8)}_${Date.now()}`,
        notes: {
          user_id: user.id,
          user_email: user.email,
          tier: normalizedTier,
          country: countryCode,
          product_kind: productKind,
          first_week_discount: firstWeekDiscountApplied ? "yes" : "no",
        },
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.text();
      console.error("Razorpay order error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to create payment order" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await orderResponse.json();

    return new Response(JSON.stringify({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID,
      user_email: user.email,
      user_name: user.user_metadata?.first_name || "",
      tier: normalizedTier,
      product_kind: productKind,
      first_week_discount_applied: firstWeekDiscountApplied,
    }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in create-razorpay-order:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
