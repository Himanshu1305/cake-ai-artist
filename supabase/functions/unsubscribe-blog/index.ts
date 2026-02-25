import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action } = await req.json();

    if (!token || typeof token !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate action
    const validActions = ["lookup", "unsubscribe_digest", "unsubscribe_all"];
    if (!action || !validActions.includes(action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Look up subscriber by token
    const { data: subscriber, error: lookupError } = await supabaseAdmin
      .from("blog_subscribers")
      .select("id, email, is_active, digest_frequency")
      .eq("unsubscribe_token", token)
      .maybeSingle();

    if (lookupError || !subscriber) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired unsubscribe link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mask email for privacy
    const [local, domain] = subscriber.email.split("@");
    const maskedEmail =
      local.length <= 2
        ? subscriber.email
        : `${local.substring(0, 2)}***@${domain}`;

    if (action === "lookup") {
      return new Response(
        JSON.stringify({
          maskedEmail,
          isActive: subscriber.is_active,
          digestFrequency: subscriber.digest_frequency,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Perform unsubscribe
    const updateData =
      action === "unsubscribe_all"
        ? { is_active: false, unsubscribed_at: new Date().toISOString() }
        : { digest_frequency: "none" };

    const { error: updateError } = await supabaseAdmin
      .from("blog_subscribers")
      .update(updateData)
      .eq("id", subscriber.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to process unsubscribe" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        maskedEmail,
        type: action === "unsubscribe_all" ? "all" : "digest",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
