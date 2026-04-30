import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface StickyMobileCTAProps {
  href?: string;
  label?: string;
  subLabel?: string;
}

/**
 * Mobile-only bottom-sticky call to action. Hidden on md+ screens
 * because desktop already shows the primary CTA in the hero.
 */
export const StickyMobileCTA = ({
  href = "/",
  label = "Design Your Cake — Free",
  subLabel = "30 seconds · No card required",
}: StickyMobileCTAProps) => {
  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none"
      role="region"
      aria-label="Quick start cake designer"
    >
      <Link
        to={href}
        className="pointer-events-auto block w-full text-center rounded-2xl px-5 py-3 bg-gradient-party text-white font-semibold shadow-party btn-shimmer"
      >
        <span className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          {label}
        </span>
        <span className="block text-[11px] font-normal opacity-90 mt-0.5">{subLabel}</span>
      </Link>
    </div>
  );
};
