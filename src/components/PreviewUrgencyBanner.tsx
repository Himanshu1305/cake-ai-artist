// Preview urgency banner removed with the 3-tier pricing migration.
import { useEffect } from "react";

interface Props {
  onVisibilityChange?: (visible: boolean) => void;
  onHeightChange?: (h: number) => void;
  countryCode?: string;
}

export const PreviewUrgencyBanner = ({ onVisibilityChange, onHeightChange }: Props) => {
  useEffect(() => {
    onVisibilityChange?.(false);
    onHeightChange?.(0);
  }, [onVisibilityChange, onHeightChange]);
  return null;
};

export default PreviewUrgencyBanner;
