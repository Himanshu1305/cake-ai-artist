# Fix Geo-Routing: Server-Side + Dynamic Home + Resilient Fallbacks

Goal: Every visitor lands on country-localized content on their **first** pageview (no client redirect flicker, accurate analytics, no ipapi.co rate-limit failures).

## The 3 layers (all combined)

### Layer 1 — Server-side geo via Edge Function (source of truth)
Upgrade `supabase/functions/detect-country` so it is the **single trusted source**:
- Read `CF-IPCountry` (Cloudflare) and `X-Vercel-IP-Country` headers first.
- If absent, call `ipapi.co` server-side, then fall back to `ip-api.com` (no key, 45 req/min/IP) and `ipwho.is` (free, no key). Chained fallbacks remove the 1k/day single-provider failure.
- Cache result in-memory per IP for 1 hour to cut quota usage.
- Return `{ country_code, region, source, fallback }`.

### Layer 2 — Dynamic `/` (no redirect)
Make `src/pages/Index.tsx` render **country-specific content in place** instead of redirecting:
- On first paint, render a neutral hero skeleton (works for any country, no layout shift).
- `GeoProvider` resolves region (server function → cached session value).
- Once resolved, swap hero copy / pricing / CTAs to the localized version inline (use the existing `USALanding`/`IndiaLanding`/etc. content extracted into a shared `<LocalizedHome region={...} />` component).
- Country-specific URLs (`/india`, `/usa`, …) keep working for SEO/direct links and ads; they render the same `<LocalizedHome>` with region forced.
- **No more redirect from `/`** → analytics now correctly attributes the first hit.

### Layer 3 — Resilient client wrapper (only for `/usa`, `/india`, etc.)
Trim `GeoRedirectWrapper` down so it **only** corrects mismatches between an explicit country landing page and the user's real region (e.g. an Indian user landing on `/usa` from a stale link):
- Drop the redirect-from-`/` logic (Layer 2 handles it).
- Shorten ipapi.co timeout 3s → 1.5s.
- Use the new edge function as primary, ipapi.co as secondary, default to `US` after both fail.
- Respect explicit user choice and admin bypass (unchanged).

## Files touched
- `supabase/functions/detect-country/index.ts` — multi-provider chain + in-memory cache.
- `src/contexts/GeoContext.tsx` — call edge function first, ipapi.co as fallback, 1.5s timeout.
- `src/components/GeoRedirectWrapper.tsx` — remove `/` redirect branch, keep mismatch correction only.
- `src/pages/Index.tsx` — render `<LocalizedHome region={resolvedRegion} />` instead of static US hero.
- `src/components/LocalizedHome.tsx` *(new)* — shared region-aware home (extracts the common structure used by `USALanding`/`IndiaLanding`/`UKLanding`/`CanadaLanding`/`AustraliaLanding`).
- `src/pages/USALanding.tsx`, `IndiaLanding.tsx`, `UKLanding.tsx`, `CanadaLanding.tsx`, `AustraliaLanding.tsx` — thin wrappers passing `region` prop (preserves existing SEO meta & unique copy via per-region content map).

## SEO impact
- `/` becomes locale-adaptive but keeps a single canonical (`https://cakeaiartist.com/`) — Googlebot (US IP) sees US content (correct).
- Per-country pages keep unique titles/H1/canonicals → no cannibalization.
- No client-side redirects from `/` → bots index it without redirect chain warnings.
- Search Console "Page" report will now correctly show `/india`, `/usa`, etc. as distinct landing entries.

## Out of scope
- Cloudflare hosting migration (separate effort; CF-IPCountry header will start populating automatically once we move, no code change needed).
- Renaming/consolidating the 5 country landing pages.

Approve to implement.
