import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Confirmed Razorpay Plan IDs for Monthly + Yearly (10 plans)
const PLAN_IDS: Record<string, string> = {
  monthly_in: "plan_SkqDWR3k6qW9Q5",
  yearly_in:  "plan_SkqGE0rKbk0iyq",
  monthly_gb: "plan_SkqLPrM7Eg6sWE",
  yearly_gb:  "plan_SkqNc5BXHjqoDq",
  monthly_ca: "plan_SkqRWbOPtsu6eo",
  yearly_ca:  "plan_SkqSwN8zQyzWG6",
  monthly_au: "plan_SkqY9bAydoz1de",
  yearly_au:  "plan_SkqZ1tbePC8iJn",
  monthly_us: "plan_SkqbfAcoQjUPMo",
  yearly_us:  "plan_SkqcXaApzL7489",
};

// Pricing in smallest unit + display
const PRICING: Record<string, { amount: number; currency: string; display: string }> = {
  monthly_in: { amount: 29900,   currency: "INR", display: "₹299/month" },
  yearly_in:  { amount: 199900,  currency: "INR", display: "₹1,999/year" },
  monthly_gb: { amount: 499,     currency: "GBP", display: "£4.99/month" },
  yearly_gb:  { amount: 2900,    currency: "GBP", display: "£29/year" },
  monthly_ca: { amount: 699,     currency: "CAD", display: "C$6.99/month" },
  yearly_ca:  { amount: 3900,    currency: "CAD", display: "C$39/year" },
  monthly_au: { amount: 799,     currency: "AUD", display: "A$7.99/month" },
  yearly_au:  { amount: 4900,    currency: "AUD", display: "A$49/year" },
  monthly_us: { amount: 499,     currency: "USD", display: "$4.99/month" },
  yearly_us:  { amount: 2900,    currency: "USD", display: "$29/year" },
};

const requestSchema = z.object({
  tier: z.enum([
    "monthly_in", "monthly_gb", "monthly_ca", "monthly_au", "monthly_us",
    "yearly_in",  "yearly_gb",  "yearly_ca",  "yearly_au",  "yearly_us",
  ]),
  country: z.string().optional(),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: 'Invalid request parameters', details: parseResult.error.issues }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { tier, country } = parseResult.data;
    const planId = PLAN_IDS[tier];
    const pricing = PRICING[tier];

    if (!planId || !pricing) {
      return new Response(JSON.stringify({ error: 'Invalid subscription tier' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Monthly: 60 cycles (5 years). Yearly: 5 cycles (5 years). Razorpay requires total_count.
    const totalCount = tier.startsWith("monthly_") ? 60 : 5;

    console.log(`Creating subscription: user=${user.id} tier=${tier} plan=${planId}`);

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: totalCount,
        customer_notify: 1,
        notes: {
          user_id: user.id,
          user_email: user.email,
          tier: tier,
          country: country || 'unknown',
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error('Razorpay subscription failed:', errorData);
      return new Response(JSON.stringify({
        error: 'Failed to create subscription',
        details: errorData.error?.description || 'Unknown error'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const subscriptionData = await razorpayResponse.json();

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    await adminClient.from('subscriptions').insert({
      user_id: user.id,
      razorpay_subscription_id: subscriptionData.id,
      razorpay_plan_id: planId,
      status: subscriptionData.status || 'created',
      tier: tier,
      amount: pricing.amount,
      currency: pricing.currency,
    });

    return new Response(JSON.stringify({
      subscription_id: subscriptionData.id,
      status: subscriptionData.status,
      tier,
      amount: pricing.amount,
      currency: pricing.currency,
      display_amount: pricing.display,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', message: (error as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
