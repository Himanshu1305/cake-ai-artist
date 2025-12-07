import { useGeoRedirect } from '@/hooks/useGeoRedirect';

export const GeoRedirectWrapper = () => {
  // This component handles geo-detection and redirect on mount
  useGeoRedirect();
  return null;
};
