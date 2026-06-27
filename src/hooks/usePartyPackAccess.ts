import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Returns whether the current user can use the Party Pack Generator.
 * Access is granted to:
 *   - Premium / lifetime members (profiles.is_premium or profiles.lifetime_access)
 *   - One-time Party Pack purchasers (rows in party_pack_purchases)
 */
export function usePartyPackAccess() {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [hasPartyPackPurchase, setHasPartyPackPurchase] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) {
          setHasAccess(false);
          setIsPremium(false);
          setHasPartyPackPurchase(false);
          setLoading(false);
        }
        return;
      }

      const [{ data: profile }, { data: pp }] = await Promise.all([
        supabase
          .from("profiles")
          .select("is_premium, lifetime_access")
          .eq("id", session.user.id)
          .maybeSingle(),
        supabase
          .from("party_pack_purchases")
          .select("id")
          .eq("user_id", session.user.id)
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;
      const premium = !!profile?.is_premium || !!profile?.lifetime_access;
      const purchased = !!pp;
      setIsPremium(premium);
      setHasPartyPackPurchase(purchased);
      setHasAccess(premium || purchased);
      setLoading(false);
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { loading, hasAccess, isPremium, hasPartyPackPurchase };
}
