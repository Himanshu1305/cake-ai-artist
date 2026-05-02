# Remove "EXCLUSIVE DEAL ENDS IN:" Banner From All Landing Pages

## Problem
The "✨ EXCLUSIVE DEAL ENDS IN:" red pulsing banner + countdown timer was previously removed from the Pricing page, but it still appears in the **hero section** of all four country landing pages. The user is on `/` which (for India geo) auto-redirects to `IndiaLanding`, so they see it there. UK, Canada, and Australia landing pages have the identical block.

## Audit — Where the banner currently renders
Confirmed via codebase search. The banner is composed of two pieces inside the hero of each landing page:

1. A pulsing red pill containing `<DynamicSaleLabel countryCode="XX" suffix="ENDS IN:" />` — this renders the "✨ EXCLUSIVE DEAL ENDS IN:" text.
2. A `<CountdownTimer countryCode="XX" />` directly below it.

Locations:
- `src/pages/IndiaLanding.tsx` — lines ~254–271
- `src/pages/UKLanding.tsx` — lines ~254–271
- `src/pages/CanadaLanding.tsx` — lines ~234–244
- `src/pages/AustraliaLanding.tsx` — lines ~234–244

The Pricing page (`src/pages/Pricing.tsx`) is already clean (line 211 has the comment confirming removal). The main `Index.tsx` uses a different `UrgencyBanner` component which is not the banner in question and stays.

## Changes

For each of the four landing pages, remove the two motion blocks:
- The `motion.div` wrapping the destructive/red pill with `DynamicSaleLabel`.
- The `motion.div` wrapping `CountdownTimer`.

Leave the rest of the hero (headline, price, spots remaining, CTA) intact. Also remove the now-unused `CountdownTimer` and `DynamicSaleLabel` imports from each file to keep things tidy.

## Files to edit
- `src/pages/IndiaLanding.tsx`
- `src/pages/UKLanding.tsx`
- `src/pages/CanadaLanding.tsx`
- `src/pages/AustraliaLanding.tsx`

## Out of scope
- The `UrgencyBanner` on the generic `Index.tsx` (different component, not the red "EXCLUSIVE DEAL ENDS IN" pill).
- The `DynamicSaleLabel` / `CountdownTimer` components themselves — kept in the codebase in case they are used elsewhere (e.g. preview/admin tools like `SalePreviewModal`, `PreviewLandingHero`).
- "Exclusive Lifetime Deal" section headings further down each landing page — those are static section titles, not the urgency countdown banner.
