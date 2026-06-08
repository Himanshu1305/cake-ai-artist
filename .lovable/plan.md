## What's happening

The progress bar in `CakeCreator.tsx` is a simulated timeline that climbs to **75% over ~36 seconds** and then sits there until one of two real signals arrives:

1. The `generate-complete-cake` edge function returns with a `jobId` (then bar bumps to 76%), or
2. A Realtime/poll event reports a filled image slot (then bar bumps to 80–100%).

In the backend, **every generation (Fast and High)** is now job-first: the function inserts a `cake_generation_jobs` row, kicks off image generation in `EdgeRuntime.waitUntil`, and returns 202 with `images: [null, null, null]` + `jobId`. The hero image is **not** in the response — it lands later via the job row.

Failure modes that all surface as "stuck at 75%":
- The HTTP invoke takes longer than 36s (cold start, slow network, India route) — the bar parks at 75 with no further status until the response comes back.
- The invoke fails silently or the realtime subscription drops, so the job finishes server-side but the client never gets the UPDATE event and never polls again past the initial fetch.
- The background `Promise.all` of view generations hits a model timeout — the row eventually flips to `partial_failed`, but if the realtime channel is gone the client doesn't see it.

There's currently **no client-side watchdog**: no rotating reassurance message after 36s, no fallback poll on a timer if no event has arrived in N seconds, and no "this is taking longer than usual — retry?" affordance.

## Plan

All changes are frontend-only in `src/components/CakeCreator.tsx`:

1. **Keep the 75% cap, but stop it feeling frozen**
   Add a 9th and 10th simulator entry that rotates the *step text* (not the percentage) every ~15s after 36s: "Still rendering — heavy traffic right now…", then "Almost done — wrapping up final touches…". Bar stays at 75 (honest) but the line of copy keeps moving.

2. **Watchdog poll on the job row**
   When the invoke returns with a `jobId`, start a background `setInterval` (every 4s) that does a `select` on `cake_generation_jobs` and calls the existing `applyRow` if anything new came in. This already exists for the *initial* fetch but does not repeat. Stop the interval when `finished` flips true or after 3 minutes. This makes the UI self-heal even if Realtime drops.

3. **Hard timeout + recovery affordance**
   If 90 seconds have passed since `isLoading` started and `bgPending` still has all slots and no image has been filled, surface a small inline action under the loader: "Taking longer than usual — Try again" button that cancels and re-invokes `generate-complete-cake`. Do not auto-reload.

4. **Surface invoke failure**
   If the `supabase.functions.invoke('generate-complete-cake', …)` call itself rejects or returns an error before we ever get a `jobId`, today we throw and the catch shows a toast — but the bar can remain at 75 because cleanup of `isLoading` isn't guaranteed in every branch. Audit the catch block to ensure `setIsLoading(false)` and `setGenerationProgress(0)` always run on error.

5. **No backend changes.** Job rows are completing fine (verified recent rows: `completed` with hero/side/top all filled). The fix is making the client honest and recoverable when the network or realtime layer hiccups.

## Out of scope (separate)

The console error `permission denied for function has_role` on the India landing page is a different bug (featured cakes loader). Not touching it in this fix.

## Files

- `src/components/CakeCreator.tsx` — simulator extension, watchdog poll, 90s recovery button, error-path cleanup audit.
