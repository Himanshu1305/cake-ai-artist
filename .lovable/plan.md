## Problem

Generated invite artwork is repetitive:
- Almost every adult image features champagne/wine flutes (because the anniversary/wedding/engagement branch in `buildPrompt` hardcodes "two delicate champagne flutes").
- Background palette is always the same warm cream/blush/gold (hardcoded across all adult variants).

So different anniversaries (and even different themes within the same occasion) all end up looking like the same photo.

## Fix

Edit `supabase/functions/generate-invite-artwork/index.ts` `buildPrompt()` to introduce variety:

1. **Theme-driven scene, not occasion-driven**
   - Build the scene primarily from the chosen `theme` (e.g. *Candlelight & Champagne*, *Garden Romance*, *Retro 90s*, *Tea & Roses*, *Starlit Evening*, *Tropical Sunset*, *Rustic Vineyard*, *Modern Minimalist*).
   - Maintain a small map of theme keyword → motif set + palette so each theme produces visually distinct artwork. Examples:
     - Garden / Floral → fresh peonies, eucalyptus, soft daylight, sage + blush palette.
     - Retro 90s → muted neon geometric shapes, cassette-tape texture, teal/magenta/cream palette (still tasteful, no clipart).
     - Tea & Roses → vintage teacup, lace, dusty rose + ivory.
     - Starlit / Evening → deep navy, gold constellations, soft candle glow.
     - Tropical → monstera leaves, sunset gradient, terracotta + coral.
     - Rustic → wood grain, dried wheat, warm amber.
     - Minimalist → single sculptural element, neutral stone palette.
   - Only fall back to the champagne-flutes scene when the theme actually implies champagne (e.g. "champagne", "toast", "celebration drinks").

2. **Randomized variation per generation**
   - Add a small randomizer that picks one of 2–3 alternative motif/palette variants per theme so re-clicking "Regenerate artwork" yields a visibly different image instead of essentially the same scene.
   - Pass a short random `variationSeed` phrase into the prompt (e.g. "variation A: overhead flat-lay" / "variation B: angled close-up" / "variation C: wide soft-focus") to nudge composition diversity.

3. **Decouple palette from occasion**
   - Replace the single hardcoded "soft cream/blush/gold palette" instruction with a palette derived from the matched theme entry. Adult vs kids logic still gates tone (elegant vs playful), but no longer dictates colour.

4. **Kids branch unchanged in spirit, but also gets theme-driven palette**
   - Same idea: pull palette + motifs from the theme map first, then layer the age-band style instruction on top.

5. **Persist variation in meta**
   - Include the chosen `variationSeed` in `invite_artwork_meta` so the auto-regenerate-on-stale-meta logic in `PartyPlannerDetail.tsx` does not loop, and so manual "Regenerate artwork" forces a *new* random variation each time (force a new seed when `forceRegenerate` is true).

No DB schema changes. No UI changes. No email template changes — `send-party-invite` already reads the stored `invite_artwork_url`.

## Files

| File | Change |
|---|---|
| `supabase/functions/generate-invite-artwork/index.ts` | Rewrite `buildPrompt` with theme→(motifs, palette) map, randomized variation seed, and decoupled palette. Pass seed into stored meta. |

## Out of scope

- No new themes added to the picker.
- No changes to copy generation, RSVP, emails, or storage layout.
