## Corrected finding

You are right to reject the previous interpretation. Based on your description and the code/database evidence, the full High Quality/Fast generation path is not the only issue, and the backend jobs that did get queued were actually completing.

The real issue appears to be a frontend/control-flow bug around the generated image tiles and retry/cancel state.

## Evidence

### 1. Full generation jobs are completing
Recent full generation requests with `specificView: null` created job rows and completed with all 3 URLs:

- High Quality + photo full jobs completed in about 20 seconds.
- Latest Fast + photo full job completed in about 27 seconds.
- Those jobs reached `9_response_sent`, inserted `cake_generation_jobs`, and ended as `completed`.

So the backend was not always failing to create cakes. In several cases, it finished successfully but the user experience still looked broken.

### 2. A hidden Regenerate button can be clicked accidentally
In the image tile UI, the Regenerate button is rendered on every image:

```tsx
className={bgFailed.has(index) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
```

`opacity-0` only makes it invisible. It does not disable pointer/touch events.

That means an invisible Regenerate button is still sitting on top of the image tile at `top-left`. On mobile/touch, a user can tap the image/share area and accidentally hit the invisible Regenerate button even though they never saw or intended to press “Regenerate”.

This matches the database evidence:

- The affected user had 3 full generation requests.
- But there were also 11 `specificView` requests for `front` / `side` afterward.
- Those `specificView` requests can only come from `handleRegenerateView()`.
- Since you did not intentionally click Regenerate, the invisible clickable button is the likely trigger.

### 3. Cancel/retry does not clean up the active job watchers
The “Cancel & try again” button only does this:

```tsx
setIsLoading(false);
setGenerationProgress(0);
setGenerationStep("");
setShowSlowRetry(false);
```

It does not cancel or invalidate:

- the active polling interval,
- the Realtime channel,
- the 4-minute frontend watchdog,
- old `fetchOnce()` calls,
- old `applyRow()` callbacks.

So after a user cancels High Quality and immediately starts Fast, the previous High Quality job can still complete and update the UI, or its old timeout/watchdog can still fire later and overwrite the new Fast generation state.

That explains why the next Fast attempt can feel like it “does not reach that stage” even when backend jobs are completing: the UI has stale background callbacks from the previous attempt.

## Why the cron job did not identify it

The cron job missed this because it is monitoring the wrong failure surface.

### 1. It only monitors `cake_generation_jobs`
The accidental hidden Regenerate calls use the `specificView` path. That path does not insert a `cake_generation_jobs` row before doing image generation.

So those failures are invisible to the cron job.

### 2. It watches `processing`, but current jobs use `in_progress`
The watchdog code auto-fails only:

```ts
.eq("status", "processing")
```

But the current generation function inserts jobs with:

```ts
status: "in_progress"
```

So even if a full job got stuck, this watchdog would not catch it.

### 3. It fails jobs; it does not recover UI state
Even when cron runs, it can only update backend rows. It cannot clean up a user’s stale frontend polling intervals or old cancelled generation callbacks.

### 4. It has alert thresholds that hide small user-impacting failures
It only alerts after at least 5 stuck jobs or a high failed-job rate. One user can have a badly broken experience without crossing that threshold.

## Fix plan

### 1. Make invisible Regenerate impossible to tap
Change the Regenerate button so it has `pointer-events-none` when hidden, and only becomes clickable when visible/failed/hovered.

Expected result: tapping a generated image or selecting it for sharing will not accidentally start single-view regeneration.

### 2. Restrict Regenerate visibility
Only show the Regenerate button when a slot has actually failed, or make it a deliberate visible action separate from the image tap/share controls.

Expected result: no accidental `specificView` calls from normal image/share interactions.

### 3. Add generation attempt isolation
Create a per-generation attempt id/ref in `CakeCreator`.

Every async callback should check that it still belongs to the latest generation before updating UI state.

Expected result: an old High Quality job cannot overwrite a new Fast retry.

### 4. Properly clean up on cancel
When the user taps “Cancel & try again”, clean up:

- active Realtime channel,
- polling interval,
- fast poll timers,
- frontend watchdog timer,
- pending job callbacks for that attempt.

Expected result: cancel really cancels the UI listeners, not just the loading spinner.

### 5. Fix watchdog status mismatch
Update the backend watchdog to check stale `in_progress` jobs as well as `processing`.

Expected result: stuck queued jobs become visible to the watchdog.

### 6. Add monitoring for request-level failures
Track requests that reach `4_body_parsed` but never reach `9_response_sent` or a terminal error stage.

Expected result: the exact failure pattern seen here would be detectable next time.

### 7. Verify the exact user scenario
Test this sequence:

1. Generate Anniversary + photo in Fast.
2. Select/click one image for sharing.
3. Switch to High Quality and generate again.
4. Cancel while waiting.
5. Switch back to Fast and generate again.

Success means:

- no accidental `specificView` requests are created,
- old cancelled jobs do not overwrite the new run,
- Fast retry starts cleanly,
- completed backend jobs always appear in the UI.