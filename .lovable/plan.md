## What's actually wrong

Database confirms the symptom: the latest job has `hero_url` filled and `side_error = top_error = "No image returned"`. So during the initial **high-quality** generation, the primary image model (`gemini-3.1-flash-image-preview`) silently returned no image for the side & top views, and those views were marked failed.

Three real bugs, in order of impact:

### Bug 1 — Bulk generation has NO fallback model
`generate-complete-cake/index.ts` line 102:
```ts
const FALLBACK_MODEL = (quality === 'high' && specificView)
  ? 'google/gemini-3-pro-image-preview'
  : 'google/gemini-2.5-flash-image';
```
The strong fallback only runs on **manual single-view regenerate**. For the initial 3-view fan-out, when the flash model returns `"No image returned"` (a known intermittent failure), that view is dropped and the user only gets the hero. That is exactly what happened.

### Bug 2 — Regenerate handler drops `quality` and `cakeStyle`
`CakeCreator.tsx` lines 192–207: the regenerate body sends `cakeType, layers, theme, colors` but **not** `quality` or `cakeStyle`. So:
- `quality` defaults to `'fast'` → the regenerate runs on the fast model with the WEAK fallback (`gemini-2.5-flash-image`) instead of the strong `gemini-3-pro-image-preview`.
- `cakeStyle` defaults to `'decorated'` → for sculpted cakes the regenerate uses the wrong view set entirely (would 500 on view 'side').

So when the user clicks Regenerate on the 3rd (top) view in high-quality mode, they're not actually getting high-quality retry — they get the same weak chain that already failed.

### Bug 3 — Hardcoded view names in regenerate
`CakeCreator.tsx` line 186: `const decoratedViewNames = ['front', 'side', 'top'];`. For a **sculpted** cake (which uses names `main`, `angle`, `top`), regenerating view index 1 would send `'side'`, and the edge function throws `Invalid view name`. Currently latent because the user is on a decorated cake, but it's the same code path.

## Fix

### `supabase/functions/generate-complete-cake/index.ts`
1. Make the strong fallback available in bulk too. Change line 102 to always pick the strong fallback when `quality === 'high'` (regardless of `specificView`):
   ```ts
   const FALLBACK_MODEL = quality === 'high'
     ? 'google/gemini-3-pro-image-preview'
     : 'google/gemini-2.5-flash-image';
   ```
   `FALLBACK_TIMEOUT_MS` is already 50s for high quality, fine inside `EdgeRuntime.waitUntil` (~150s budget).

2. (Optional small hardening) If `generateView` fails with `"No image returned"` from the primary, retry once on the same primary before falling back — the flash image model has a high rate of empty responses that succeed on a second try. Low risk, contained to `generateView`.

### `src/components/CakeCreator.tsx`
1. In `handleRegenerateView` (lines 192–207), include the current `quality` (the user's `generationQuality` state) and `cakeStyle` in the request body so the edge function knows to use the strong fallback and the right view set.

2. Replace the hardcoded `decoratedViewNames` with a style-aware view name array:
   ```ts
   const viewNames = cakeStyle === 'sculpted'
     ? ['main', 'angle', 'top']
     : ['front', 'side', 'top'];
   const viewName = viewNames[viewIndex];
   ```

## Why this resolves the user's symptom
- Initial high-quality run: when the flash model returns no image for side/top, the pro fallback now runs and almost always succeeds → all 3 images appear on the first try.
- Regenerate on the 3rd view: now actually runs `quality: 'high'`, so the pro fallback fires after the flash model fails → the top view comes back instead of silently failing again.

No DB schema or UI structure changes. Frontend change is limited to the regenerate handler. Edge function change is one constant and (optionally) one tiny retry in `generateView`.
