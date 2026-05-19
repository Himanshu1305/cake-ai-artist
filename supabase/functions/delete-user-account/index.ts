import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cakeaiartist.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to extract user ID
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a client with the user's token to get their ID
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error("Failed to get user");
    }

    const userId = user.id;
    console.log(`Deleting user account: ${userId}`);

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Cancel any active Razorpay subscription before deleting the user
    const { data: subscription } = await supabaseAdmin
      .from("subscriptions")
      .select("razorpay_subscription_id, status")
      .eq("user_id", userId)
      .in("status", ["active", "created", "authenticated"])
      .maybeSingle();

    if (subscription?.razorpay_subscription_id) {
      const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
      const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

      if (razorpayKeyId && razorpayKeySecret) {
        const credentials = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
        try {
          const cancelResp = await fetch(
            `https://api.razorpay.com/v1/subscriptions/${subscription.razorpay_subscription_id}/cancel`,
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cancel_at_cycle_end: 0 }),
            }
          );
          if (!cancelResp.ok) {
            const errText = await cancelResp.text();
            console.error(`Razorpay subscription cancellation failed (${cancelResp.status}):`, errText);
          } else {
            console.log(`Cancelled Razorpay subscription: ${subscription.razorpay_subscription_id}`);
          }
        } catch (cancelErr) {
          console.error("Error cancelling Razorpay subscription:", cancelErr);
        }
      } else {
        console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set; skipping subscription cancellation");
      }
    }

    // Delete from auth.users - this cascades to profiles table
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw deleteError;
    }

    console.log(`Successfully deleted user: ${userId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in delete-user-account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
