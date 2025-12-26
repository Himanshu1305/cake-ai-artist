import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdSlotProps {
  size: "horizontal" | "rectangle" | "responsive" | "in-article";
  className?: string;
  slotId?: string;
}

// Set to true once AdSense is approved and you have real slot IDs
const ADSENSE_ENABLED = false;

const sizeConfig = {
  horizontal: { width: 728, height: 90, style: "min-h-[90px]" },
  rectangle: { width: 300, height: 250, style: "min-h-[250px]" },
  responsive: { width: "auto", height: "auto", style: "min-h-[100px]" },
  "in-article": { width: "auto", height: "auto", style: "min-h-[100px]" },
};

export const AdSlot = ({ size, className, slotId }: AdSlotProps) => {
  const adRef = useRef<HTMLDivElement>(null);
  const config = sizeConfig[size];

  useEffect(() => {
    // Only initialize ads if AdSense is enabled and we have a slot ID
    if (ADSENSE_ENABLED && slotId && adRef.current) {
      try {
        // Push ad to AdSense
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }
  }, [slotId]);

  if (ADSENSE_ENABLED && slotId) {
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

  // Placeholder when ads are not enabled yet
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
