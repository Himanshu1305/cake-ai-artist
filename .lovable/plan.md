## Diagnosis

The generation is stuck at 75% because the frontend progress simulator stops there while waiting for the backend job row to update with image URLs. The current backend already creates `cake_generation_jobs` and returns a `jobId`, but recent rows show two failure modes:

- Some jobs have all 3 URLs but remain `in_progress`, so the UI keeps waiting instead of completing.
- Some jobs become `partial_failed` with only one image, but without clear enough UI recovery at the 75% loading stage.

There is also a likely frontend race: the code only starts polling if `failedViews.length > 0`; if the backend response shape changes or `failedViews` is missing/empty, the UI can get a `jobId` but never attach polling.

## Plan

1. **Make polling unconditional for queued jobs**
   - In `CakeCreator.tsx`, start the Realtime subscription and polling whenever `jobId + viewOrder + heroView` exist.
   - Do not depend on `failedViews.length > 0` to attach polling.

2. **Fix terminal job handling**
   - Treat `completed` with all URLs as success, even if the status update was missed or delayed.
   - Treat `partial_failed` as terminal once the available URLs/errors are known.
   - If some URLs exist, show the available cake images immediately instead of leaving the user in the loading panel.

3. **Add a frontend stale-job rescue**
   - During polling, if the row has all expected URLs but status is still `in_progress`, complete the UI locally.
   - If the job has not changed for a safe window, stop showing infinite loading and surface per-slot retry buttons.

4. **Add a backend finalization safeguard**
   - Update `generate-complete-cake` so the background job always writes a terminal status after generation attempts finish.
   - If all URLs are present, mark `completed`; if any slot has an error or remains empty, mark `partial_failed` and write a readable `error_message`.
   - Avoid leaving jobs indefinitely in `in_progress`.

5. **Improve user-facing progress text**
   - Change the 75% message from “Final polish” to a transparent state like “Rendering views in the background…” once a job is queued.
   - If the job takes longer, show “Still working — this can take up to 2 minutes” rather than appearing frozen.

6. **Validate after implementation**
   - Check recent job rows after a generation attempt.
   - Confirm the UI exits loading when images arrive, even if job status is stale.
   - Confirm partial failures show image slots with Regenerate buttons instead of a stuck progress bar.

## Files expected to change

- `src/components/CakeCreator.tsx`
- `supabase/functions/generate-complete-cake/index.ts`

No database schema change is needed.