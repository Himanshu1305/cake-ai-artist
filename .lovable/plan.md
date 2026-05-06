## Goal

Make cake image generation reliable in almost all scenarios. Both Standard and High Quality return the first (hero) view fast, then stream the remaining views in the background. No client race timer can kill a successful job.

## Architecture

```text
Generate clicked
  │
  ▼
Edge fn: generate-complete-cake
  • INSERT job row (status=pending, view_count=3 or 4)
  • Generate HERO inline (~15-25s) with primary→fallback per-view timeout
  • UPDATE job: hero_url, status=hero_ready
  • EdgeRuntime.waitUntil(generateRemaining(jobId))
       ↳ side, top, [fourth] in parallel, each independent try/catch
       ↳ UPDATE job per slot as each finishes
       ↳ status=completed when all done (or partial_failed if any view failed)
  • RETURN { jobId, heroUrl, message } immediately
  │
  ▼
Client (CakeCreator)
  • Render hero + N "generating…" placeholders
  • Subscribe Realtime on cake_generation_jobs id=eq.{jobId}
  • Poll fallback every 15s (in case Realtime drops)
  • 4-min watchdog → if any slot still empty, show per-slot Regenerate button
  • NO 50s race timer
```

## Backend changes — `supabase/functions/generate-complete-cake/index.ts`

1. Remove the "HQ returns front-only, Standard returns 3-in-one-response" split. Both modes use the hero-first pattern.
2. Per-view generation helper:
   - Primary model with 60s timeout
   - On timeout/error → fallback model with 60s timeout
   - On both fail → write `error` for that slot only; never throw out of `waitUntil`
3. Hero view runs inline before the HTTP response.
4. `EdgeRuntime.waitUntil(generateRemaining(...))` runs side/top/(fourth) in parallel, each updating its own column independently.
5. Final status:
   - `completed` if all slots have URLs
   - `partial_failed` if any slot ended in error (hero already returned, so user still has something)
6. Robust logging at each stage so we can debug from edge logs.

## Database migration

Add to `cake_generation_jobs`:
- `fourth_url text` — for character/sculpted cakes that need 4 views
- `view_count int not null default 3` — how many slots this job expects
- `hero_error text`, `side_error text`, `top_error text`, `fourth_error text` — per-slot error messages (so frontend can show "Regenerate this view" only on failed slots)

Add INSERT/UPDATE policies (service-role only writes; user can SELECT own rows — already in place).

Confirm `cake_generation_jobs` is in the `supabase_realtime` publication and `REPLICA IDENTITY FULL` is set so partial column updates broadcast.

## Frontend changes — `src/components/CakeCreator.tsx`

1. **Remove the 50s client race timer** entirely (this is what produced the "taking too long" toast).
2. On generate response: render hero + (view_count - 1) placeholder slots with a soft pulsing "Generating high-quality view…" overlay.
3. Subscribe to Realtime on `cake_generation_jobs` filtered by `id=eq.{jobId}`. On each UPDATE:
   - Swap placeholder → image when a `*_url` arrives
   - If a `*_error` arrives, replace placeholder with a small "Regenerate this view" button (existing manual flow)
4. Polling fallback: every 15s fetch the row directly (covers dropped Realtime connections; stops when status is terminal).
5. Watchdog: 4-minute soft timeout. If any slot still missing AND no error recorded, show the Regenerate button on it. No destructive toast — the hero is still there, the user is not blocked.
6. Replace existing "Generation timed out" toast with a non-blocking inline notice on the affected slots only.

## Standard vs HQ

Same code path. Only differences:
- Standard uses faster/cheaper primary model
- HQ uses higher-quality primary model
- Both use the same fallback chain and timeouts

This means when HQ becomes a paid feature later, the reliability story is identical to Standard — no surprises.

## Files to change

- `supabase/migrations/<new>.sql` — add columns + ensure realtime publication
- `supabase/functions/generate-complete-cake/index.ts` — unify hero-first flow, per-view error isolation, waitUntil
- `src/components/CakeCreator.tsx` — remove race timer, add Realtime + polling + per-slot regenerate, watchdog

No changes to pricing, gallery, party pack, or other components.

## Verification

1. Standard generate → hero appears <25s, side+top appear within ~60s, no toast.
2. HQ generate → same UX as Standard, all 3 (or 4) views land.
3. Force-fail one view (kill model temporarily): hero + remaining views still arrive; failed slot shows Regenerate button only.
4. Disconnect/reconnect network mid-generation: polling fallback still surfaces the completed views.
5. Edge logs show `waitUntil` entries continuing after the HTTP response was sent.
6. No "Generation timed out" toast in any normal scenario.
