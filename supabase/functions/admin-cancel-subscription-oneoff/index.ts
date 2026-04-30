// One-off cleanup: cancels Surabhi Dixit's Razorpay subscription (sub_S6ZSWlskYzvWFw).
// Hardcoded target — safe to call publicly. Will be deleted after one successful run.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TARGET_SUBSCRIPTION_ID = "sub_S6ZSWlskYzvWFw";
const TARGET_USER_ID = "df576f0b-3343-48e3-a43d-f98450a41657";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = btoa(`${Deno.env.get("RAZORPAY_KEY_ID")}:${Deno.env.get("RAZORPAY_KEY_SECRET")}`);
    const rzpRes = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${TARGET_SUBSCRIPTION_ID}/cancel`,
      {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({ cancel_at_cycle_end: 1 }),
      },
    );
    const rzpJson = await rzpRes.json().catch(() => ({}));
    console.log("Razorpay response:", rzpRes.status, rzpJson);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const desc = String(rzpJson?.error?.description || "").toLowerCase();
    const ok = rzpRes.ok || desc.includes("already") || desc.includes("cancel");

    if (ok) {
      await admin
        .from("subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("razorpay_subscription_id", TARGET_SUBSCRIPTION_ID);
      await admin
        .from("profiles")
        .update({ subscription_status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", TARGET_USER_ID);
    }

    return new Response(JSON.stringify({ status: rzpRes.status, razorpay: rzpJson, ok }), {
      status: ok ? 200 : 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error(e);
    return new Response(JSON.stringify({ error: e?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
