import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") || "rzp_live_Rp0dR29v14TRpM";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");

const requestSchema = z.object({
  order_id: z.string().min(1),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate request
    const body = await req.json();
    const parseResult = requestSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { order_id } = parseResult.data;

    // Check if user is already a founding member (payment was processed)
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: member } = await supabaseServiceRole
      .from("founding_members")
      .select("member_number, tier, special_badge")
      .eq("user_id", user.id)
      .maybeSingle();

    if (member) {
      console.log("User is already a member:", member);
      return new Response(JSON.stringify({
        status: "paid",
        is_member: true,
        member_number: member.member_number,
        tier: member.tier,
        badge: member.special_badge,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check Razorpay order status via API
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${order_id}`, {
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!orderResponse.ok) {
      console.error("Failed to fetch order:", await orderResponse.text());
      return new Response(JSON.stringify({ status: "unknown", error: "Failed to check order" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = await orderResponse.json();
    console.log("Order status:", order.status);

    // If order is paid but member not created, try to get payment and process
    if (order.status === "paid") {
      // Fetch payments for this order
      const paymentsResponse = await fetch(`https://api.razorpay.com/v1/orders/${order_id}/payments`, {
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      });

      if (paymentsResponse.ok) {
        const payments = await paymentsResponse.json();
        const capturedPayment = payments.items?.find((p: any) => p.status === "captured");
        
        if (capturedPayment) {
          const tier = capturedPayment.notes?.tier || "tier_1_49";
          const amount = capturedPayment.amount;

          // Generate year-based member number (e.g., 2025-1001)
          const currentYear = new Date().getFullYear();
          
          const { count } = await supabaseServiceRole
            .from("founding_members")
            .select("*", { count: "exact", head: true })
            .like("member_number", `${currentYear}-%`);

          const sequenceNumber = 1001 + (count || 0);
          const memberNumber = `${currentYear}-${sequenceNumber}`;
          const pricePaid = amount / 100;
          const specialBadge = tier === "tier_1_49" ? "gold" : "silver";

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

          if (!insertError) {
            // Update profile
            await supabaseServiceRole
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

            // Add activity
            await supabaseServiceRole.rpc("add_activity_feed", {
              p_activity_type: "purchase",
              p_message: `🎉 Member #${memberNumber} just joined with a Lifetime Deal!`,
            });

            console.log(`Recovered payment: user ${user.id} is now member #${memberNumber}`);

            return new Response(JSON.stringify({
              status: "paid",
              is_member: true,
              member_number: memberNumber,
              tier: tier,
              badge: specialBadge,
              recovered: true,
            }), {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({
      status: order.status,
      is_member: false,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error checking payment status:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
