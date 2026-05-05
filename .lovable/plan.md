## Goal

Restore the "3 images in ~30 seconds" USP for cake generation, without going async, without dropping image count, without lowering quality.

## Changes

### 1. `supabase/functions/generate-complete-cake/index.ts`

**Model**
- Default standard model: switch from `google/gemini-2.5-flash-image` to **`google/gemini-3.1-flash-image-preview`** (Nano Banana 2 — pro-level quality, faster).
- High-quality model unchanged: `google/gemini-3-pro-image-preview`.
- Add a fallback model constant `FALLBACK_MODEL = 'google/gemini-2.5-flash-image'` used only when a primary call times out.

**Per-image timeout + fallback**
- Wrap each AI `fetch` in an `AbortController` with a **28s** budget for standard, **90s** for high quality.
- On `AbortError` or 503, retry that single view ONCE on `FALLBACK_MODEL` with a **15s** budget. No retry storms; max one fallback attempt per view.
- Keep existing 429 / 402 handling (surface as RATE_LIMIT / CREDITS_EXHAUSTED).

**Soft-failure (2-of-3 still wins)**
- Replace the inner `Promise.all([generateView, generateView, generateView])` with `Promise.allSettled`.
- Build the response from settled results: successful slots get the image; failed slots get `null` and a `failedViews: string[]` array listing which view names failed.
- Only throw the whole request if **zero** views succeeded, or if any view returned `RATE_LIMIT` / `CREDITS_EXHAUSTED` (those still bubble up as 429/402).
- Message generation stays in the outer `Promise.all` and is best-effort: if it fails, fall back to the existing default greeting string and continue (do not fail the request).

**Drop the hidden 4th image**
- Remove the `generateBothStyles` branch that generates 4 views (3 decorated + 1 sculpted main) when a character is selected.
- New behaviour:
  - `cakeStyle === 'decorated'` → always 3 views (front, side, top), with character themed *into* the decorations (existing prompt already does this).
  - `cakeStyle === 'sculpted'` → always 2 views (main, top) — unchanged.
- Keep `generateBothStyles: false` in the response payload so the client UI keeps working.
- The "see it as a sculpted cake" option remains available on the result page via the existing `specificView='main'` regenerate flow (no new endpoint needed).

**Prompt trimming (~60% smaller per call)**
- Extract one shared `BASE_RULES` constant containing the duplicated rules currently restated in every view:
  - "Generate EXACTLY ONE CAKE / no collage / no side-by-side"
  - "Centered on a marble pedestal, complete cake visible"
  - "Soft studio lighting, shallow DOF, hyper-realistic, 8K, professional food photography, award-winning pastry art aesthetic"
  - "Do NOT repeat any text — show each text element ONCE only"
- Each view prompt becomes: `view.description` + view-specific text/photo rules + `BASE_RULES` + cake spec (style/theme/colors).
- Keep all substantive rules intact: occasion text, exact-spelling name (`name.split('').join('-')`), photo placement on top view, sculpted-cake material rules.
- Remove the `sculptedSystemPrompt` vs `standardSystemPrompt` split — fold the appetising-food-photography sentence into `BASE_RULES`. Saves a system message round-trip on tokenisation.

**Timing logs**
- At the start of each `generateView` call, capture `const t0 = Date.now()`.
- On success/failure log `console.log(\`⏱ ${view.name} ${ok ? 'ok' : 'fail'} in ${Date.now()-t0}ms (model=${modelUsed})\`)`.
- After the `allSettled` resolves, log total wall-clock and per-view summary so we can verify the 30s target in Supabase logs.

### 2. `src/components/CakeCreator.tsx`

**Tighten timeout**
- In `invokeWithRetry`, change standard `TIMEOUT_MS` from 60000 → **45000** (5s margin over the 40s server worst case). Keep 180000 for `quality === 'high'`.

**Handle partial success**
- After `invokeWithRetry` returns, if `data.failedViews?.length > 0`:
  - Filter the `images` array to drop nulls before passing to the existing image-processing pipeline.
  - Show a non-destructive toast: *"Generated {n} of {total} views — tap Regenerate on the missing one."*
- If `images.length === 0` after filtering, treat as full failure (existing error path).

**Copy update**
- In the "Creating your cake..." toast, change the high-quality description to `"High quality mode — slower (~2 min). Standard mode targets ~30s."` so users self-select correctly.

### 3. No changes to

- Database schema (no migration).
- `supabase/config.toml` (no new function).
- `specificView` regenerate flow — already supports per-view retry, which the new "Regenerate" button leans on.
- Party Pack, invites, message generation logic.

## Files

| File | Change |
|---|---|
| `supabase/functions/generate-complete-cake/index.ts` | Switch default model to `gemini-3.1-flash-image-preview`; add per-image `AbortController` timeout (28s std / 90s hi) with single fallback to `gemini-2.5-flash-image` (15s); replace `Promise.all` with `Promise.allSettled` + soft-failure response shape (`failedViews`); remove 4-image `generateBothStyles` branch; extract shared `BASE_RULES` and trim repeated rules; merge system prompts; add per-view + total timing logs. |
| `src/components/CakeCreator.tsx` | Reduce standard timeout 60s → 45s; filter null images and toast partial success when `failedViews` present; update high-quality description copy. |

## Out of scope

- No async jobs, no polling, no DB tables, no quality reduction, no UI redesign.
- High-quality mode keeps its longer budget — the 30s promise applies to Standard only.
