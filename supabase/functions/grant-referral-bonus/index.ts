import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://cakeaiartist.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { new_user_id, referrer_id } = await req.json();

    if (!new_user_id) {
      return new Response(
        JSON.stringify({ error: "new_user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate new user exists in profiles
    const { data: newUserProfile, error: newUserError } = await supabase
      .from("profiles")
      .select("id, bonus_generations")
      .eq("id", new_user_id)
      .maybeSingle();

    if (newUserError || !newUserProfile) {
      console.error("new_user_id not found in profiles:", new_user_id, newUserError);
      return new Response(
        JSON.stringify({ error: "new_user_id not found in profiles" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Idempotency check: skip if bonus already granted for this signup
    const { data: existingBonus } = await supabase
      .from("referral_bonuses")
      .select("bonus_granted")
      .eq("user_id", new_user_id)
      .maybeSingle();

    if (existingBonus?.bonus_granted === true) {
      console.log("Bonus already granted for new_user_id:", new_user_id);
      return new Response(
        JSON.stringify({ success: true, message: "Bonus already granted — skipping" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Grant 2 bonus generations to the new user
    const { error: newUserUpdateError } = await supabase
      .from("profiles")
      .update({ bonus_generations: (newUserProfile.bonus_generations ?? 0) + 2 })
      .eq("id", new_user_id);

    if (newUserUpdateError) {
      throw new Error(`Failed to update new user profile: ${newUserUpdateError.message}`);
    }

    console.log("Granted 2 bonus generations to new_user_id:", new_user_id);

    // Try to grant 2 bonus generations to the referrer (best-effort — don't fail the whole request)
    let referrerGranted = false;
    if (referrer_id && referrer_id !== new_user_id) {
      const { data: referrerProfile } = await supabase
        .from("profiles")
        .select("id, bonus_generations")
        .eq("id", referrer_id)
        .maybeSingle();

      if (referrerProfile) {
        const { error: referrerUpdateError } = await supabase
          .from("profiles")
          .update({ bonus_generations: (referrerProfile.bonus_generations ?? 0) + 2 })
          .eq("id", referrer_id);

        if (referrerUpdateError) {
          console.error("Failed to update referrer profile:", referrer_id, referrerUpdateError);
        } else {
          referrerGranted = true;
          console.log("Granted 2 bonus generations to referrer_id:", referrer_id);
        }
      } else {
        console.warn("referrer_id not found in profiles — skipping referrer bonus:", referrer_id);
      }
    }

    // Mark bonus as granted in referral_bonuses
    const { error: markError } = await supabase
      .from("referral_bonuses")
      .update({ bonus_granted: true })
      .eq("user_id", new_user_id);

    if (markError) {
      console.error("Failed to mark bonus_granted:", markError);
    }

    const message = referrerGranted
      ? "Bonus granted to both users"
      : "Bonus granted to new user only (referrer not found)";

    return new Response(
      JSON.stringify({ success: true, message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in grant-referral-bonus:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
