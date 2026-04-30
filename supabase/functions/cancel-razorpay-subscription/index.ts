import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError("Unauthorized", 401);
    }

    // Identify caller
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return jsonError("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const targetUserId: string = body?.userId || user.id;
    const cancelAtCycleEnd: boolean = body?.cancelAtCycleEnd !== false; // default true

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Authorization: caller must be the subscription owner OR an admin
    if (targetUserId !== user.id) {
      const { data: isAdmin } = await admin.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!isAdmin) return jsonError("Forbidden", 403);
    }

    // Find the active subscription for the target user
    const { data: subRow } = await admin
      .from("subscriptions")
      .select("id, razorpay_subscription_id, status")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let subscriptionId = subRow?.razorpay_subscription_id as string | undefined;

    // Fallback to profiles.subscription_id if no row in subscriptions
    if (!subscriptionId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("subscription_id")
        .eq("id", targetUserId)
        .maybeSingle();
      subscriptionId = profile?.subscription_id || undefined;
    }

    if (!subscriptionId) {
      return jsonOk({ success: true, message: "No active subscription found" });
    }

    // Already cancelled?
    if (subRow && ["cancelled", "expired", "halted"].includes((subRow.status || "").toLowerCase())) {
      return jsonOk({ success: true, message: `Subscription already ${subRow.status}` });
    }

    // Call Razorpay API
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const rzpRes = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0 }),
      },
    );

    const rzpJson = await rzpRes.json().catch(() => ({}));
    if (!rzpRes.ok) {
      console.error("Razorpay cancel failed:", rzpRes.status, rzpJson);
      // If Razorpay says it's already cancelled, treat as success
      const desc = String(rzpJson?.error?.description || "").toLowerCase();
      if (rzpRes.status === 400 && (desc.includes("already") || desc.includes("cancel"))) {
        // fall through to local update
      } else {
        return jsonError(
          rzpJson?.error?.description || "Failed to cancel subscription with Razorpay",
          502,
        );
      }
    }

    console.log("Razorpay cancel response:", rzpJson);

    // Update local DB
    await admin
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("razorpay_subscription_id", subscriptionId);

    await admin
      .from("profiles")
      .update({
        subscription_status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    return jsonOk({
      success: true,
      message: cancelAtCycleEnd
        ? "Subscription will end at current period close"
        : "Subscription cancelled immediately",
      subscription_id: subscriptionId,
    });
  } catch (e: any) {
    console.error("cancel-razorpay-subscription error:", e);
    return jsonError(e?.message || "Internal error", 500);
  }
});

function jsonOk(data: unknown) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
