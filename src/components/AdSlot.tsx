import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAdsEnabled } from "@/hooks/useAdsEnabled";

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
  const config = sizeConfig[size];
  const { adsEnabled, loading } = useAdsEnabled();

  useEffect(() => {
    // Only initialize ads if enabled in database and we have a slot ID
    if (adsEnabled && slotId && adRef.current) {
      try {
        // Push ad to AdSense
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [adsEnabled, slotId]);

  // Don't render anything while loading to prevent layout shift
  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/10 rounded-lg animate-pulse",
          config.style,
          className
        )}
      />
    );
  }

  if (adsEnabled && slotId) {
    return (
      <div
        ref={adRef}
        className={cn(
          "flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden",
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
  }

  // Placeholder when ads are not enabled
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted/20 border border-dashed border-muted-foreground/20 rounded-lg",
        config.style,
        className
      )}
    >
      <div className="text-center text-muted-foreground/50 text-sm">
        <span className="px-3 py-1 bg-muted/30 rounded-full text-xs">
          Ad Space
        </span>
      </div>
    </div>
  );
};
