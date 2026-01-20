import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Placeholder Plan IDs - Replace with actual Razorpay Plan IDs after creating them in dashboard
const PLAN_IDS: Record<string, string> = {
  monthly_inr: "plan_Rprva8uygKTjL2", // ₹899/month - India Monthly
  monthly_gbp: "plan_RpryvSwlCKa3Od", // £7.99/month - UK Monthly
  monthly_cad: "plan_Rps8Bxz9PNFBuW", // C$13.99/month - Canada Monthly
  monthly_aud: "plan_Rps8qwoBYUgZNI", // A$14.99/month - Australia Monthly
  monthly_usd: "plan_RprxbHKmMdok6a", // $9.99/month - USA Monthly
};

const PRICING: Record<string, { amount: number; currency: string; display: string }> = {
  monthly_inr: { amount: 89900, currency: "INR", display: "₹899/month" },
  monthly_gbp: { amount: 799, currency: "GBP", display: "£7.99/month" },
  monthly_cad: { amount: 1399, currency: "CAD", display: "C$13.99/month" },
  monthly_aud: { amount: 1499, currency: "AUD", display: "A$14.99/month" },
  monthly_usd: { amount: 999, currency: "USD", display: "$9.99/month" },
};

const requestSchema = z.object({
  tier: z.enum(["monthly_inr", "monthly_gbp", "monthly_cad", "monthly_aud", "monthly_usd"]),
  country: z.string().optional(),
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT and get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);
    
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters', details: parseResult.error.issues }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tier, country } = parseResult.data;
    const planId = PLAN_IDS[tier];
    const pricing = PRICING[tier];

    if (!planId || !pricing) {
      return new Response(
        JSON.stringify({ error: 'Invalid subscription tier' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if plan ID is still placeholder
    if (planId.includes('PLACEHOLDER')) {
      console.error('Subscription plan not configured:', tier);
      return new Response(
        JSON.stringify({ 
          error: 'Subscription plans not yet configured',
          message: 'Monthly subscriptions will be available soon. Please try our Lifetime Deal instead!'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Razorpay credentials
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating subscription for user ${user.id}, tier: ${tier}, plan: ${planId}`);

    // Create subscription via Razorpay API
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: 12, // 12 billing cycles (1 year)
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
      console.error('Razorpay subscription creation failed:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create subscription',
          details: errorData.error?.description || 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscriptionData = await razorpayResponse.json();
    console.log('Subscription created:', subscriptionData.id);

    // Store subscription in database
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { error: insertError } = await adminClient
      .from('subscriptions')
      .insert({
        user_id: user.id,
        razorpay_subscription_id: subscriptionData.id,
        razorpay_plan_id: planId,
        status: subscriptionData.status || 'created',
        tier: tier,
        amount: pricing.amount,
        currency: pricing.currency,
      });

    if (insertError) {
      console.error('Failed to store subscription:', insertError);
      // Don't fail the request, subscription was created in Razorpay
    }

    return new Response(
      JSON.stringify({
        subscription_id: subscriptionData.id,
        status: subscriptionData.status,
        tier: tier,
        amount: pricing.amount,
        currency: pricing.currency,
        display_amount: pricing.display,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
