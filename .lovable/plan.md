I did a deeper investigation before planning the fix. The audio recorder itself is not calling the cake generation function, but the rollout coincided with changes that made the generator fragile again.

Findings

1. The backend is healthy
- Lovable Cloud is responding normally.
- I tested `generate-complete-cake` directly for both Fast and High Quality and it returned successfully.
- That means the API key, backend, and AI gateway are not globally down.

2. The “98% stuck” symptom is a frontend wait-state problem
- `CakeCreator.tsx` uses simulated progress and intentionally caps at 98% until the edge function returns.
- If the function call hangs, stalls, or takes too long, the UI stays at 98% with no recovery.
- The client currently has no real hard timeout for the main generation request.

3. The current frontend assumption is wrong
- The frontend comment says the backend returns the hero view quickly for “HQ + Standard”.
- Current backend code does not do that for Fast mode.
- Fast mode still waits for all views inline:
  - front
  - side
  - top
  - greeting message
- If any one image call is slow, the whole request remains pending and the UI stays at 98%.

4. High Quality was made risky again
- The earlier fix from 2 days ago was based on “return hero first, then background the remaining views”.
- Later backend code changed High Quality to start all 3 image calls at the same instant and only await the hero.
- That can still delay the hero because the hero competes with side/top calls for gateway/model capacity.
- The safe pattern should be: generate hero first, return it, then start remaining views in the background.

5. Audio rollout likely exposed the issue, but is not the direct cause
- Audio changes added:
  - audio columns on saved images
  - `cake-audio` storage bucket
  - `AudioRecorder`
  - `/cake/:id` share route
- None of those should block `generate-complete-cake` directly.
- But the audio rollout redeployed/changed the main cake page and removed confidence in the previous generation behavior. The generator now needs to be protected so future feature work cannot break the main USP again.

6. There is also one unrelated runtime error
- The AdSense `No slot size for availableWidth=0` error is visible in runtime logs.
- It is not the cause of cake generation being stuck, but it can add noise and should be handled separately if it starts breaking page interactions.

Fix plan

1. Make Fast and High Quality use the same safe progressive generation architecture
- Change `generate-complete-cake` so both modes return the first real cake image as soon as the hero view is ready.
- Do not make Fast mode wait for all 3 views before returning.
- Do not start side/top before the hero is finished.
- After the hero returns, start side/top in `EdgeRuntime.waitUntil` and update `cake_generation_jobs` as each view finishes.

2. Reuse the existing `cake_generation_jobs` table
- No new database table should be needed.
- Use the existing fields:
  - `hero_url`
  - `side_url`
  - `top_url`
  - `hero_error`
  - `side_error`
  - `top_error`
  - `status`
  - `view_count`
- Fast mode will now also create a job row, just like High Quality.

3. Update the frontend to subscribe/poll for both Fast and High Quality jobs
- Currently `CakeCreator.tsx` only attaches realtime/polling behavior when `generationQuality === 'high'`.
- Change it to attach whenever the backend returns `jobId`, `viewOrder`, and pending views.
- This makes the UI consistent:
  - first cake view appears quickly
  - missing views show “rendering” placeholders
  - side/top fill automatically
  - failed slots show a clear “Regenerate” action

4. Add a true UI recovery timeout
- Add a hard watchdog around the initial hero request.
- If no hero view returns within a safe time, stop the loading state and show a clear retry message.
- Do not let the progress bar remain at 98% forever.
- Keep errors specific:
  - session expired
  - rate limit
  - credits exhausted
  - network interruption
  - generation service slow/unavailable

5. Prevent placeholders from being treated as finished cakes
- Ensure `/placeholder.svg` is never selected by default.
- Ensure placeholder URLs are never sent to “Save to Gallery”.
- If only the hero is ready, select only the hero.
- When background views arrive, they can be selected normally.

6. Add defensive backend logging
- Add logs for:
  - request received
  - mode/quality
  - hero generation started
  - hero generated
  - job row created
  - each background view started/completed/failed
  - final job status
- This gives us immediate future diagnostics if generation slows or breaks again.

7. Verify after implementation
- Deploy/test `generate-complete-cake` directly for Fast mode.
- Deploy/test `generate-complete-cake` directly for High Quality mode.
- Verify in browser preview that:
  - progress no longer gets stuck at 98%
  - a first cake appears quickly
  - side/top placeholders update or become retryable
  - save does not accept placeholders
- Check edge function logs after both test runs.

Why this is the right fix

- It protects the main USP by making the first generated cake image the success threshold, not all views.
- It avoids edge-function timeout risk.
- It avoids model concurrency starving the hero view.
- It makes future features like audio, GIF, sharing, gallery, or admin tracking less likely to break generation because the generator becomes a resilient progressive job flow.

Files expected to change

- `supabase/functions/generate-complete-cake/index.ts`
- `src/components/CakeCreator.tsx`

Possible optional follow-up

- Add a small admin-only generation health panel showing recent job success/failure rates from `cake_generation_jobs`, so you can spot generation issues before users report them.