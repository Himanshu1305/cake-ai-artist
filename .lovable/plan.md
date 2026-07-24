## Root cause

`StickyMobileCTA` (the "Design Your Cake — Free" bottom bar on mobile) defaults to `href="/"`. Every country landing (`IndiaLanding`, `USALanding`, `UKLanding`, `CanadaLanding`, `AustraliaLanding`) renders `<StickyMobileCTA />` with no props, and these landings are shown at the root path `/` (either directly, or lazily rendered by `Index.tsx` based on geo).

Result: tapping the sticky CTA on mobile navigates from `/` → `/`, which React Router treats as a no-op. The button "does nothing".

The desktop hero CTA works because it explicitly calls `navigate('/free-ai-cake-designer?ref=home_hero')`.

## Fix

Point the sticky mobile CTA at the actual designer route, matching the desktop hero.

1. In `src/components/StickyMobileCTA.tsx`, change the default `href` from `"/"` to `"/free-ai-cake-designer?ref=sticky_mobile"`. This gives every consumer a working default without touching each landing page.
2. Leave the `href` prop overridable so pages like `Pricing` can still pass a custom target if needed later.
3. Sanity-check the other pages that mount `StickyMobileCTA` (`Pricing.tsx`, all 5 country landings) — none currently pass `href`, so the new default applies uniformly and correctly.

## Verification

- Load `/` on mobile viewport → tap the sticky "Design Your Cake — Free" → should route to `/free-ai-cake-designer`.
- Repeat on `/india`, `/uk`, `/usa`, `/canada`, `/australia`, `/pricing`.
- Confirm the desktop hero CTA and other in-page CTAs are untouched.

No business-logic or backend changes — presentation-only fix.