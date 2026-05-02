# Fix Mismatched Stats on Homepage

## Problem
The homepage shows the same dynamic number (e.g. `532+`) twice with two different labels:
- **Top urgency banner**: `532+ creators designing AI cakes`
- **Hero subline** (under the CTA): `532+ cakes designed`

Same number, two meanings → reads as a copy bug. Logically, cakes designed should exceed creator count.

## Fix
Differentiate the two stats. Per follow-up direction, use "hundreds of" (not "thousands of") for the banner — keeps it grounded and avoids overclaiming, while leaving the concrete count on the hero.

1. **Banner** (`UrgencyBanner.tsx`) — drop the dynamic number. New copy:
   - Desktop: `Join hundreds of creators designing AI cakes · Start free, no signup needed`
   - Mobile: `Hundreds of creators · Start free`
   - Remove the unused `useDynamicCakeCount` import and `displayCount` variable.

2. **Hero subline** (`Index.tsx`) — leave as-is: `{N}+ cakes designed`. It stays the single source of the live number, paired with the 4.9 stars.

Result: banner = qualitative social proof, hero = concrete momentum. No clash.

## Files to edit
- `src/components/UrgencyBanner.tsx`

## Out of scope
- The `useDynamicCakeCount` hook (still consumed by the hero and `CakeWall`).
- Hero subline copy.
