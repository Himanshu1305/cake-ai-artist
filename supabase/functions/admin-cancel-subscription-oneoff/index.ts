// One-off cleanup utility. Cancels a specific Razorpay subscription using CRON_SECRET auth.
// Call: POST with header `x-cron-secret: <CRON_SECRET>` and body { subscriptionId, userId, cancelAtCycleEnd? }
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const cronSecret = Deno.env.get("CRON_SECRET");
  const provided = req.headers.get("x-cron-secret");
  if (!cronSecret || provided !== cronSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { subscriptionId, userId, cancelAtCycleEnd = true } = body;
    if (!subscriptionId) {
      return new Response(JSON.stringify({ error: "subscriptionId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const auth = btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`);
    const rzpRes = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 }),
      },
    );
    const rzpJson = await rzpRes.json().catch(() => ({}));

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (rzpRes.ok || String(rzpJson?.error?.description || "").toLowerCase().includes("already")) {
      await admin
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("razorpay_subscription_id", subscriptionId);
      if (userId) {
        await admin
          .from("profiles")
          .update({ subscription_status: "cancelled", updated_at: new Date().toISOString() })
          .eq("id", userId);
      }
    }

    return new Response(JSON.stringify({ status: rzpRes.status, razorpay: rzpJson }), {
      status: rzpRes.ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
