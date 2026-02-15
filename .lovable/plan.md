

## Fix Homepage Indexing: Stop Geo-Redirect from Blocking Google

### Problem

Google Search Console reports "Page with redirect" for `http://cakeaiartist.com/`. When we fetched the live homepage, it returned **UK page content** (GBP pricing, "British celebrations") instead of the US homepage. This confirms the geo-redirect is firing for non-Googlebot crawlers and potentially for Google's own rendering service in some scenarios.

The root cause: `GeoRedirectWrapper` includes `/` in `REDIRECTABLE_ROUTES`, causing the homepage to redirect visitors based on IP geolocation. Even with bot detection, this creates SEO problems because:
- Google may classify the page as a redirect even if Googlebot itself isn't redirected
- Google's various crawler types may not all be caught by bot detection
- The redirect happens client-side after React renders, which Google's systems can detect

### Solution

**Remove `/` from `REDIRECTABLE_ROUTES`** in both `GeoRedirectWrapper.tsx` and `useGeoRedirect.ts`. The homepage should always serve US content at `/` for all visitors. Country-specific pages (`/uk`, `/india`, etc.) are already linked in the footer country selector and discoverable via sitemap.

This is the standard SEO-safe approach: serve canonical content at the canonical URL, and let users discover localized versions through navigation or hreflang tags (which are already in `index.html`).

### Files to Modify

**1. `src/components/GeoRedirectWrapper.tsx` (line 14)**

Change:
```
const REDIRECTABLE_ROUTES = ['/', '/pricing'];
```
To:
```
const REDIRECTABLE_ROUTES = ['/pricing'];
```

**2. `src/hooks/useGeoRedirect.ts` (line 43)**

Change:
```
const REDIRECTABLE_ROUTES = ['/', '/pricing'];
```
To:
```
const REDIRECTABLE_ROUTES = ['/pricing'];
```

### What This Means

- The homepage `/` will always show US content (USD pricing) for everyone, including Google
- The `/pricing` page will still geo-redirect to localized pricing pages
- Country landing pages (`/uk`, `/canada`, `/australia`, `/india`) remain accessible via footer selector, direct links, and sitemap
- Hreflang tags in `index.html` already tell Google about all localized versions
- No content is lost -- users can still reach their country page through the footer country picker

### After Deployment

Request re-indexing of `https://cakeaiartist.com/` in Google Search Console to clear the "Page with redirect" classification.

