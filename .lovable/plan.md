## Problem

On `/india` (and other country landing pages), the "Create Your Cake Now" button links to `/`. The `GeoRedirectWrapper` detects the user is in India and immediately redirects `/` back to `/india`. The page appears to reload but the creator never shows — the India landing page does not contain `CakeCreator` at all.

This affects every country landing CTA that points to `/` (India, USA, UK, Canada, Australia).

## Fix

Point the country-landing CTAs to a route that is not in `REDIRECTABLE_ROUTES` and that renders the creator:

- Change the `Link to="/"` on each country landing's bottom CTA (and any similar buttons) to `Link to="/free-ai-cake-designer"`. That route renders `FreeCakeDesigner`, which already mounts `CakeCreator` and isn't intercepted by the geo redirect.
- Keep the button styling, icon, and label unchanged.

Files to edit:
- `src/pages/IndiaLanding.tsx` (line ~722)
- `src/pages/USALanding.tsx` (line ~655 area)
- `src/pages/UKLanding.tsx` (line ~789 area)
- `src/pages/AustraliaLanding.tsx` (line ~547)
- `src/pages/CanadaLanding.tsx` (line ~482)

## Out of scope

- No changes to `GeoRedirectWrapper`, geo detection, or routing config.
- No changes to `CakeCreator` itself or the landing page layouts beyond the CTA's `to` prop.
- Sticky mobile CTA / header buttons not touched unless you want them updated too — say the word and I'll include them.

## Verification

After build: on mobile viewport at `/india`, tap "Create Your Cake Now" → lands on `/free-ai-cake-designer` with the creator form visible, no redirect back to `/india`.
