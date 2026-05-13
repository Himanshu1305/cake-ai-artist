// Lightweight evergreen social-proof banner.
// Replaces the old urgency/scarcity banner; no countdowns or specific numbers.
import { useEffect, useRef } from "react";

interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
  onHeightChange?: (h: number) => void;
  countryCode?: string;
}

export const UrgencyBanner = ({ onVisibilityChange, onHeightChange }: UrgencyBannerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onVisibilityChange?.(true);
    const measure = () => {
      if (ref.current) onHeightChange?.(ref.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [onVisibilityChange, onHeightChange]);

  return (
    <div
      ref={ref}
      className="sticky top-0 z-50 bg-gradient-to-r from-party-pink/90 via-party-purple/90 to-party-pink/90 text-white shadow-sm"
    >
      <div className="container mx-auto px-4 py-2 text-center">
        <p className="text-xs md:text-sm font-medium tracking-wide">
          <span className="hidden sm:inline">Join </span>
          <span className="font-bold text-gold">hundreds of</span>
          <span className="hidden sm:inline"> creators designing AI cakes</span>
          <span className="sm:hidden"> creators</span>
          <span className="mx-2 opacity-70">·</span>
          <span className="opacity-90">Start free, no signup needed</span>
        </p>
      </div>
    </div>
  );
};

export default UrgencyBanner;
