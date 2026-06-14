## Problem

Generation is now job-based, but the UI still behaves like the first function call should return images. The backend returns a job quickly with all image slots empty, then fills `cake_generation_jobs` in the background. The frontend reaches 75%, waits, and can show a slow/error state even though the job may still be running or already completed. Retry also starts a new request without reliably cleaning the previous job state.

I also found a backend access problem: `cake_generation_jobs` has policies but no explicit Data API grants, so the browser can fail to read job progress in some environments. That makes the UI think retry/progress is broken.

## Plan

1. **Fix database access for job progress**
   - Add explicit permissions for authenticated users to read their own `cake_generation_jobs` rows.
   - Keep service-role access for the background generator/watchdog.
   - Do not expose jobs publicly.

2. **Make the frontend treat 202 as “job queued”, not “failed/empty result”**
   - When `generate-complete-cake` returns a `jobId`, immediately render the 3 placeholders and start polling/subscribing.
   - Do not show “taking too long” as a failure while the job row is still `in_progress`.
   - Keep progress at a clear “rendering views” state until either images arrive or the backend records a real failure.

3. **Fix retry behavior**
   - Before retrying, cancel the old realtime subscription/timers and bump the generation attempt id.
   - Clear previous `bgPending`, `bgFailed`, saved IDs, and old images so stale callbacks cannot overwrite the retry.
   - Retry should start a fresh job and resume polling from that job only.

4. **Make timeout handling less destructive**
   - Frontend timeout should mark only missing slots as retryable, not fail the entire generation if some images are still arriving.
   - Backend watchdog should not auto-fail jobs too aggressively while image generation is still reasonably within the advertised High Quality window.

5. **Verify with backend data and preview flow**
   - Confirm recent jobs move from `in_progress` to `completed` with all 3 URLs.
   - Test Fast and High Quality from the preview: progress should move past 75%, placeholders should fill, and retry should create a fresh working job.

## Files / backend touched

- `src/components/CakeCreator.tsx`
- `supabase/functions/cake-generation-watchdog/index.ts`
- Database migration for `cake_generation_jobs` permissions

No changes to public share pages or image ordering are needed for this issue.