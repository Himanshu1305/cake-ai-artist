// Urgency/scarcity banner removed with the 3-tier pricing migration.
// Stub kept so existing imports compile; renders nothing and reports zero height.
import { useEffect } from "react";

interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void;
  onHeightChange?: (h: number) => void;
  countryCode?: string;
}

export const UrgencyBanner = ({ onVisibilityChange, onHeightChange }: UrgencyBannerProps) => {
  useEffect(() => {
    onVisibilityChange?.(false);
    onHeightChange?.(0);
  }, [onVisibilityChange, onHeightChange]);
  return null;
};

export default UrgencyBanner;
