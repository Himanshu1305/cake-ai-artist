import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGeoContext } from "@/contexts/GeoContext";

/**
 * Silently backfills profiles.country for signed-in users who never had it set
 * (typically Google OAuth signups, which skip the country picker on /auth).
 * Uses the client-side geo detection already running in GeoContext.
 * No UI, no redirect — invisible to the user.
 */
export const AuthCountrySync = () => {
  const { detectedCountry } = useGeoContext();
  const syncedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!detectedCountry) return;

    // Map GB -> UK to match our internal country picker values
    const mapped = detectedCountry.toUpperCase() === "GB" ? "UK" : detectedCountry.toUpperCase();

    const syncFor = async (userId: string) => {
      if (syncedRef.current.has(userId)) return;
      syncedRef.current.add(userId);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("country")
          .eq("id", userId)
          .maybeSingle();
        if (error) return;
        if (profile?.country && profile.country.trim() !== "") return;

        await supabase
          .from("profiles")
          .update({ country: mapped })
          .eq("id", userId);
      } catch {
        // silent — tracking backfill must never break the app
      }
    };

    // Run for any existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) syncFor(session.user.id);
    });

    // And on every future sign-in
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user?.id) {
        syncFor(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [detectedCountry]);

  return null;
};

export default AuthCountrySync;
