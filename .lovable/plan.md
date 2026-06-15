## Goal
Stop the "stuck at 75% / taking too long / retry doesn't work" failure mode for cake generation, permanently. The GRANT migration already shipped — this plan layers the four remaining fixes on top so healthy jobs finish cleanly and unhealthy ones surface a real error.

## Changes

### 1. `src/components/CakeCreator.tsx` — robust progress + retry
- Track a `generationAttemptId` ref. Every new generation (initial + retry) bumps it; all async callbacks (realtime, polling, timers, image-load handlers, `bgPending` resolves) check the current id and bail if stale.
- On retry, before kicking off a new job:
  - `supabase.removeChannel(channel)` for any existing realtime channel and null the ref
  - `clearTimeout` / `clearInterval` for all progress, watchdog, and poll timers
  - reset `bgPending`, `bgFailed`, `savedImageIds`, partial image URLs, error state
  - bump `generationAttemptId`
- Treat the job row as the source of truth:
  - While `cake_generation_jobs.status = 'in_progress'`, keep showing "Polishing your cake views… almost done" — never show a failure/timeout copy.
  - Only show the "taking longer than usual" CTA after a soft threshold (e.g. 90s) AND status is still `in_progress`; offer "Keep waiting" (default) and "Cancel & retry" (explicit).
  - Only show a true error when the job row flips to `status = 'failed'` — surface `error_message` if present.
- Add a 1-shot fallback poll: if realtime hasn't delivered an update in 10s, `select * from cake_generation_jobs where id = ?` directly; this also makes us resilient to dropped sockets.

### 2. `supabase/functions/cake-generation-watchdog/index.ts` — stop killing healthy jobs
- Raise the auto-fail threshold from 2 min to 5 min for `quality = 'high'` and keep 3 min for `fast`.
- Only mark a job `failed` if **zero** image URLs have landed AND it's past threshold. If 1–2 slots filled, mark it `partial` with the slots that are still missing flagged for retry, instead of failing the whole job.
- Log a clear `error_message` ("watchdog timeout after Xs, missing: top/side/angle") so the UI can show it.

### 3. `src/components/CakeCreator.tsx` — partial-result handling
- If a job ends `partial`, render the slots we have and offer "Retry missing views" that only re-requests the missing view_types, not the whole cake. Re-uses the same `share_group_id` so the gallery/share flow stays intact.

### 4. Verification
- Run Fast and High Quality from preview end-to-end; confirm `cake_generation_jobs` rows move `in_progress → completed` with 3 URLs.
- Force a failure (temporarily throw in `generate-complete-cake`) and confirm the UI shows the real error message, retry cleans state, and a second attempt succeeds.
- Confirm no duplicate realtime channels in console after 3 back-to-back retries.

## Files touched
- `src/components/CakeCreator.tsx` (retry cleanup, attempt-id guard, status-driven UI, fallback poll, partial retry)
- `supabase/functions/cake-generation-watchdog/index.ts` (thresholds, partial status, error_message)
- No DB migration needed — `cake_generation_jobs` already has a `status` column and the GRANTs from the previous migration.

## Out of scope
- Changing the image-generation provider or prompts.
- Any pricing/quota changes.
