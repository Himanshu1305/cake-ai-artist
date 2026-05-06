## Goal

High Quality should deliver all 3 views like Standard does — without the 150s frontend timeout killing the request. The current "front only" behavior is unacceptable for a future paid feature.

## Why the old "all 3 in parallel" approach failed

- Edge function returned only after all 3 HQ images finished.
- If any single view hit the slow fallback model, total time exceeded the 150s client budget.
- One slow view = entire response lost, including the 2 that already succeeded.

## Recommended fix: stream views back as they finish (background continuation)

Switch from "one big request returns everything" to "first view returns fast, remaining views finish in the background and the client picks them up." This gives the user the perceived speed of Standard while still producing all 3 HQ images.

### How it works

```text
Client clicks Generate (HQ)
   │
   ▼
Edge function: generate-complete-cake
   • Creates a job row in `cake_generation_jobs` (status=pending, 3 view slots)
   • Generates the HERO view inline (front/main), ~15–30s
   • Kicks off the remaining 2 views via EdgeRuntime.waitUntil(...)
   • Returns hero image + jobId immediately
   │
   ▼
Client shows hero image + 2 "generating…" placeholders
   │
   ▼
Client subscribes to Realtime on `cake_generation_jobs` (or polls every 3s)
   • Side view row updates → swap placeholder for image
   • Top view row updates → swap placeholder for image
   • All done → toast "All 3 high-quality views ready"
```

`EdgeRuntime.waitUntil()` keeps the worker alive after the HTTP response is sent, so the remaining views are not bound by the client's 150s budget. Each background view gets its own generous timeout (e.g. 90s primary + 60s fallback) without blocking anyone.

### Backend changes

`supabase/functions/generate-complete-cake/index.ts`
- For HQ:
  1. Insert a row into a new `cake_generation_jobs` table with columns: `id, user_id, status, hero_url, side_url, top_url, error, created_at, updated_at, prompt_payload jsonb`.
  2. Generate hero view inline; update row with `hero_url`.
  3. `EdgeRuntime.waitUntil(generateRemaining(jobId, payload))` — generates side + top, updates the row column-by-column as each finishes.
  4. Return `{ jobId, heroUrl, message }` immediately.
- Standard mode unchanged (still parallel-in-one-response).
- Fallback model only used after primary fails on a per-view basis; never auto-uses the slowest premium model unless user manually regenerates a specific view.

### New table + RLS

`cake_generation_jobs`
- Row owned by `user_id`.
- RLS: user can `select` their own rows; only the function (service role) writes.
- Realtime enabled: `ALTER PUBLICATION supabase_realtime ADD TABLE public.cake_generation_jobs;`

### Frontend changes — `src/components/CakeCreator.tsx`

- On HQ generate response:
  - Render `[heroUrl, '/placeholder-loading.svg', '/placeholder-loading.svg']` with a small "Generating high-quality view…" spinner overlay on slots 2 & 3.
  - Open a Supabase Realtime channel filtered on `id=eq.{jobId}`.
  - On each update, replace the matching placeholder; clear spinner when both finish.
  - Safety net: 3-minute client watchdog. If side/top still missing, show a "Regenerate this view" button on the empty slots (existing flow).
- Remove the current "front-only + manual regenerate" UX.

### Why not fully async (queue + worker)?

A full job-queue + cron worker (as suggested in the stack-overflow snippet) would also work, but is heavier: needs a scheduler, separate worker function, and longer perceived wait for the first image. `EdgeRuntime.waitUntil` is the lightest correct solution and fits Supabase Edge Functions natively.

## Files to change

- `supabase/functions/generate-complete-cake/index.ts` — split into "hero inline + waitUntil(remaining)"; update job row per view.
- `src/components/CakeCreator.tsx` — handle jobId, render loading placeholders, subscribe to Realtime, swap images as they arrive.
- New migration:
  - Create `public.cake_generation_jobs` table + RLS policies.
  - Add it to `supabase_realtime` publication.

No changes to Standard mode, pricing, or other components.

## Verification

1. Run HQ generation; confirm hero image appears within ~30s and `jobId` returned.
2. Watch Realtime updates land for side/top within ~60–90s each.
3. Confirm all 3 final images render without manual regeneration.
4. Confirm Standard mode is unchanged.
5. Edge function logs show `waitUntil` completion entries after the HTTP response was already sent.
