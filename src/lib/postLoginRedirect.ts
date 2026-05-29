import { landingPathForRegion, normalizeRegion, getExplicitRegion, SupportedRegion } from "@/utils/countryRouting";

/**
 * Country-aware home path used after sign-in / profile completion.
 * Priority: explicit user pref → live geo → US fallback.
 */
export const getCountryHomePath = (detectedCountry?: string | null): string => {
  const explicit = getExplicitRegion();
  if (explicit) return landingPathForRegion(explicit);
  const detected = normalizeRegion(detectedCountry);
  if (detected) return landingPathForRegion(detected);
  return "/";
};

export const withWelcomeFlag = (path: string): string =>
  path.includes("?") ? `${path}&welcome=true` : `${path}?welcome=true`;

export type { SupportedRegion };
