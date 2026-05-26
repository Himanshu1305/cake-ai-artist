// Single source of truth for country resolution and pricing routing.
// Supported app-region codes used by PricingPlans: US, IN, GB, CA, AU.

export type SupportedRegion = 'US' | 'IN' | 'GB' | 'CA' | 'AU';

export const SUPPORTED_REGIONS: SupportedRegion[] = ['US', 'IN', 'GB', 'CA', 'AU'];

const ASIA_PACIFIC = ['JP','KR','CN','SG','MY','TH','VN','PH','ID','BD','PK','LK','NP','HK','TW','NZ'];
const EUROPE_MENA = ['DE','FR','IT','ES','NL','BE','PT','SE','NO','DK','FI','PL','AT','CH','IE','GR','CZ','HU','RO','UA','RU','AE','SA','EG','ZA','NG','KE','IL','TR','DZ'];

const COUNTRY_PATHS: Record<SupportedRegion, string> = {
  US: '/usa',
  IN: '/india',
  GB: '/uk',
  CA: '/canada',
  AU: '/australia',
};

const PATH_TO_REGION: Array<[string, SupportedRegion]> = [
  ['/india', 'IN'],
  ['/usa', 'US'],
  ['/uk', 'GB'],
  ['/canada', 'CA'],
  ['/australia', 'AU'],
];

const PREF_KEY = 'user_country_preference';
const PREF_EXPLICIT_KEY = 'user_country_preference_explicit';

/** Normalize any ISO/region string to one of our SupportedRegion codes, with regional fallbacks. */
export const normalizeRegion = (raw: string | null | undefined): SupportedRegion | null => {
  if (!raw) return null;
  const code = raw.toUpperCase();
  if (code === 'UK' || code === 'GB') return 'GB';
  if ((SUPPORTED_REGIONS as string[]).includes(code)) return code as SupportedRegion;
  if (ASIA_PACIFIC.includes(code)) return 'AU';
  if (EUROPE_MENA.includes(code)) return 'GB';
  return null;
};

/** Detect which country landing page the user is currently on, if any. */
export const regionFromPathname = (pathname: string): SupportedRegion | null => {
  for (const [prefix, region] of PATH_TO_REGION) {
    if (pathname.startsWith(prefix)) return region;
  }
  return null;
};

/** Get the localized landing path for a region. */
export const landingPathForRegion = (region: SupportedRegion): string => {
  return region === 'US' ? '/' : COUNTRY_PATHS[region];
};

/** Build a /pricing URL that carries the intended region. */
export const pricingPathForRegion = (region: SupportedRegion): string => {
  return `/pricing?country=${region}`;
};

/** Read explicit user-selected region (set via the manual country picker). */
export const getExplicitRegion = (): SupportedRegion | null => {
  try {
    const explicit = localStorage.getItem(PREF_EXPLICIT_KEY) === '1';
    if (!explicit) return null;
    return normalizeRegion(localStorage.getItem(PREF_KEY));
  } catch {
    return null;
  }
};

interface ResolveOpts {
  pathname?: string;
  urlCountry?: string | null;
  detectedCountry?: string | null;
  profileCountry?: string | null;
}

/**
 * Resolve the region to use for content/pricing.
 * Priority:
 *   1. URL ?country= override
 *   2. Current pathname (e.g. /india)
 *   3. Live geo detection
 *   4. Explicit manual user selection
 *   5. Logged-in profile country
 *   6. US fallback
 *
 * Note: stale non-explicit localStorage values are intentionally ignored.
 */
export const resolveRegion = (opts: ResolveOpts): SupportedRegion => {
  const urlRegion = normalizeRegion(opts.urlCountry);
  if (urlRegion) return urlRegion;

  if (opts.pathname) {
    const pathRegion = regionFromPathname(opts.pathname);
    if (pathRegion) return pathRegion;
  }

  const geoRegion = normalizeRegion(opts.detectedCountry);
  if (geoRegion) return geoRegion;

  const explicit = getExplicitRegion();
  if (explicit) return explicit;

  const profileRegion = normalizeRegion(opts.profileCountry);
  if (profileRegion) return profileRegion;

  return 'US';
};
