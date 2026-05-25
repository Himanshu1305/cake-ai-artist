## What's actually happening

The edge function `generate-complete-cake` was refactored to a **job-first** flow: it inserts a row in `cake_generation_jobs`, kicks the 3 image generations into `EdgeRuntime.waitUntil`, and **returns immediately** with `images: [null, null, null]` and the `jobId`. The browser is supposed to advance the progress bar via Realtime + polling on that job row.

The UI bug is in `src/components/CakeCreator.tsx`:

1. A timer-based simulator caps the bar at **60%** ("🌟 Finishing the main view...") and only releases when *the response sets progress ≥ 80*.
2. The new edge response now returns with `okCount === 0` (hero is no longer baked into the response). The client then runs `setGenerationProgress(12)`, which is overwritten back to 60 by the simulator.
3. From that point only the Realtime/poll handler (`applyRow`) can push past 60 — but in practice (race with subscribe, transient RLS/Realtime drop, message-only update arriving first, or the row update bumping `pct` to 80 *after* the user has already perceived a freeze) the bar visibly sticks at 60% with "Finishing the main view…" for the full ~30–40s the background task takes.

Recent DB rows confirm jobs *do* finish in ~30–50s; the images render eventually, but the user only sees "60% / Finishing the main view" the entire time.

## Fix (frontend only — no backend or schema changes)

### 1. Replace the capped simulator with a job-aware progress driver
In `src/components/CakeCreator.tsx`:
- Keep the early ramp (0 → 35%) for the "before we have a jobId" window only.
- The moment the edge response returns with `jobId`, jump the bar to **45%** and switch the step to "🎂 Queued — rendering your views…". Stop the simulator (clear its timers) so it can never push back to 60.
- While the job is in flight with zero filled slots, run a slow continuous creep from 45% → 75% over ~25s (synthetic but always advancing). This guarantees the bar is never frozen.
- When `applyRow` reports filled slots, jump to `80 + (filled/total)*20` as today. When all filled, 100%.
- Step copy ladder: "🎂 Queued…" → "🎨 Painting frosting & layers…" → "✨ First view almost ready…" → "🎉 All views ready!".

### 2. Make the "queued" state visible even when `okCount === 0`
Remove the `setGenerationProgress(okCount > 0 ? 80 : 12)` line — replace with a single `setGenerationProgress((c) => Math.max(c, 45))` when we have a `jobId`. Never set a value *lower* than current.

### 3. Tighten the realtime/poll race
- Trigger the initial `fetchOnce` *before* awaiting realtime subscribe (already done) but also run a quick poll burst at 0s, 800ms, 2s, 4s, 8s, then fall back to the existing 5s interval. This reduces the window where the bar appears stuck before the first filled slot arrives.
- If after 12s the row still has zero filled URLs, force-update step text to "✨ Still rendering — final touches…" so the user gets a visible state change.

### 4. Tiny safety nets
- If `supabase.functions.invoke` rejects or times out *after* a jobId was already received (we won't have one then — but if the response is slow), keep the simulator advancing instead of freezing.
- Log `console.info('[cake] job started', { jobId, viewOrder })` so future debugging is trivial.

### 5. Verify
After the edit, generate a cake on `/free-ai-cake-designer` (logged-in) and confirm:
- Bar never sits at 60% for more than ~1 second.
- Step text changes at least every ~6 seconds.
- Bar reaches 100% when the job row's status becomes `completed`.

## Out of scope
- No edge-function changes (the job-first backend is working correctly — proven by recent `cake_generation_jobs` rows completing in 30–50s).
- No DB / RLS / Realtime config changes.
- No new dependencies.
