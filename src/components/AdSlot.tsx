import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAdsEnabled } from "@/hooks/useAdsEnabled";
import { useCookieConsent } from "@/hooks/useCookieConsent";

interface AdSlotProps {
  size: "horizontal" | "rectangle" | "responsive" | "in-article";
  className?: string;
  slotId?: string;
}

const sizeConfig = {
  horizontal: { width: 728, height: 90, style: "min-h-[90px]" },
  rectangle: { width: 300, height: 250, style: "min-h-[250px]" },
  responsive: { width: "auto", height: "auto", style: "min-h-[100px]" },
  "in-article": { width: "auto", height: "auto", style: "min-h-[100px]" },
};

export const AdSlot = ({ size, className, slotId }: AdSlotProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const adInitialized = useRef(false);
  const config = sizeConfig[size];
  const { adsEnabled, loading } = useAdsEnabled();
  const { preferences } = useCookieConsent();

  // Check if user has consented to marketing cookies
  const hasMarketingConsent = preferences.marketing;

  useEffect(() => {
    // Only initialize ads if:
    // 1. Ads are enabled in database
    // 2. We have a valid slot ID
    // 3. User has consented to marketing cookies
    // 4. Ad hasn't been initialized yet
    if (adsEnabled && slotId && hasMarketingConsent && adRef.current && !adInitialized.current) {
      try {
        // Push ad to AdSense
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        adInitialized.current = true;
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [adsEnabled, slotId, hasMarketingConsent]);

  // Reset initialization flag if slotId changes
  useEffect(() => {
    adInitialized.current = false;
  }, [slotId]);

  // Don't render anything if no slotId is provided (policy compliance - no placeholders)
  if (!slotId) {
    return null;
  }

  // Don't render while loading
  if (loading) {
    return null;
  }

  // Don't render if ads are disabled
  if (!adsEnabled) {
    return null;
  }

  // Don't render if user hasn't consented to marketing cookies
  if (!hasMarketingConsent) {
    return null;
  }

  // Render the actual ad
  return (
    <div
      ref={adRef}
      className={cn(
        "flex items-center justify-center overflow-hidden",
        config.style,
        className
      )}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8968285405550435"
        data-ad-slot={slotId}
        data-ad-format={size === "in-article" ? "fluid" : "auto"}
        data-full-width-responsive="true"
      />
    </div>
  );
};
