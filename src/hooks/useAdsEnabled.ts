import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdsEnabledValue {
  enabled: boolean;
}

export function useAdsEnabled() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["site-settings", "ads_enabled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ads_enabled")
        .maybeSingle();

      if (error) {
        console.error("Error fetching ads_enabled setting:", error);
        return false;
      }

      const value = data?.value as unknown as AdsEnabledValue | null;
      return value?.enabled ?? false;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    adsEnabled: data ?? false,
    loading: isLoading,
    error,
  };
}

export function useUpdateAdsEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("site_settings")
        .update({ 
          value: { enabled },
          updated_by: user.id
        })
        .eq("key", "ads_enabled");

      if (error) {
        throw error;
      }

      return enabled;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings", "ads_enabled"] });
    },
  });
}
