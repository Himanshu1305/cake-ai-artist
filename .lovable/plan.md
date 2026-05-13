## Goal
Make all links inside the engagement drip emails (Day 2, Day 7, Day 14) point to the user's country-specific landing page when one exists, so a US user lands on the US/global homepage, an Indian user on `/india`, a UK user on `/uk`, etc. — instead of everyone hitting `/` and being geo-redirected.

## Country → Landing Page Map
Profiles store ISO codes (`IN`, `US`, `CA`, `AU`, `UK`, `PH`, etc.). Map them to existing routes:

| Country code | Landing path |
|---|---|
| IN | `/india` |
| UK / GB | `/uk` |
| CA | `/canada` |
| AU | `/australia` |
| US / other / null | `/` (default homepage) |

## What Changes (Per-Link Strategy)

The emails contain two kinds of links:

1. **Homepage / hero CTA links** (currently `https://cakeaiartist.com/`-style entry points)
   → Replace with the localized landing path from the table above.
   - In Day 2: the "Start with a cake" bottom CTA currently goes to `/free-cake-designer`. Keep the designer link as-is (no country variant exists), BUT also add a localized homepage anchor in the header/feature card "AI Cake Studio" badge so geo context is preserved.
   - In Day 7 + Day 14: the bottom "Design My Cake / Try It Free" CTAs currently point to `/free-cake-designer`. Same — keep designer link, but ensure any "homepage"-style references become localized.

2. **Universal feature pages** (`/free-cake-designer`, `/gallery`, `/blog`, `/party-planner`, `/faq`, `/contact`, `/settings`)
   → These pages are global with no country-specific variants. Leave the path unchanged, but append a `?ref=email&country=<CODE>` query parameter so the page can render localized pricing/copy if it already supports geo (most already do via `GeoContext`).

## Implementation

In `supabase/functions/send-engagement-drip/index.ts`:

1. Add a small helper:
   ```ts
   const LANDING_BY_COUNTRY: Record<string, string> = {
     IN: "/india", UK: "/uk", GB: "/uk",
     CA: "/canada", AU: "/australia",
   };
   function localizedHome(country?: string | null) {
     const c = (country || "").toUpperCase();
     return `https://cakeaiartist.com${LANDING_BY_COUNTRY[c] || "/"}`;
   }
   function localizedPath(path: string, country?: string | null) {
     const c = (country || "").toUpperCase();
     const sep = path.includes("?") ? "&" : "?";
     return `https://cakeaiartist.com${path}${sep}ref=email${c ? `&country=${c}` : ""}`;
   }
   ```

2. Pass `country` into `day2Email`, `day7Email`, `day14Email`, and `buildEmailHtml`. Source it from:
   - **Test mode**: read `country` from the test recipient's profile (already querying `profiles` for `first_name` — extend to `first_name, country`).
   - **Production mode**: already selecting profiles — just include `country` in the existing `select(...)` and pass it through the loop.

3. Replace every hard-coded `https://cakeaiartist.com/...` URL in the three template functions with `localizedHome(country)` for any "go to homepage / start" CTA, and `localizedPath('/gallery', country)` (etc.) for feature-page links. Footer unsubscribe stays unchanged (still `/settings`).

4. Redeploy `send-engagement-drip`.

## Out of Scope
- No changes to `send-weekly-upgrade-nudge` (already country-aware for pricing; link localization can be a follow-up if needed).
- No new landing pages, no changes to `GeoRedirectWrapper`, no DB migration.
- No copy changes — only URL changes.

## Test
Admin → Scheduled Tasks → "Test Day 2 / 7 / 14". Verify:
- An admin profile with `country = 'IN'` receives an email whose "Start with a cake" / homepage links resolve to `cakeaiartist.com/india` (or `?country=IN` on feature pages).
- A profile with `country = 'US'` or null gets `cakeaiartist.com/`.
- Day 7 + Day 14 buttons reflect the same.
