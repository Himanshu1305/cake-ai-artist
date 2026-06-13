## Deep audit results — what to fix next

A read-only audit of cake generation, sharing, saving, and the shared-link receiver found additional issues in the same families we just fixed. Below are the ones worth fixing now, grouped by severity. Each has concrete file:line evidence and a one-line fix direction.

### Priority 0 — user-facing broken flows

1. **Save to Gallery silently fails.** `src/components/CakeCreator.tsx` lines 1150–1308: `saveGeneratedImage` has an internal `try/catch` that only `console.error`s. The outer caller's catch never sees the error, so the spinner stops but no error toast is shown — the user thinks it saved.
   Fix: rethrow inside `saveGeneratedImage` so the caller surfaces the toast.

2. **Double-submit can create two parallel jobs for the same user.** `handleSubmit` (line 551) has no early return if `isLoading` is already true. Form `Enter` key or programmatic submit before React flushes the disabled state can fire it twice.
   Fix: `if (isLoading) return;` at the top of `handleSubmit`.

3. **Stale-closure bug in `handleRegenerateView`.** Lines 261–264 spread `generatedImages` captured at click-time. If a background `applyRow` updates other slots while the regenerate edge call is awaiting (25–55 s), that background update is silently overwritten.
   Fix: use the functional updater form of `setGeneratedImages`.

### Priority 1 — degraded UX / intermittent bugs

4. **Wrong jingle for non-birthday shared cakes.** `src/pages/SharedCake.tsx` line 119 treats empty/null `occasion_type` as birthday, so a Christmas/anniversary cake whose sender did not set occasion plays the birthday jingle.
   Fix: treat `""`/null as generic celebration, not birthday.

5. **Replay on shared cake does not actually replay.** `SharedCake.tsx` line 196 clears `cake_reveal_seen_${id}` but `CakeConvergeReveal` stores under `cake_reveal_seen_${cake.id}_${revealKey}`. The key never matches; reveal jumps straight to final image.
   Fix: clear the same key the reveal component uses, or expose a clear helper.

6. **Reveal animation does not refresh when images change.** `CakeConvergeReveal.tsx` preload effect deps only include `cacheKey`; if a background slot fills after mount, the new URL is never preloaded and the sequence still shows placeholder.
   Fix: include a stable image-URL hash in the effect deps.

7. **Share-target fallback can pick the wrong view.** `CakeCreator.tsx` line 2628 uses `Array.from(selectedImages)[0]`, which is insertion-order; selecting view 2 then 0 makes "share" silently use view 2.
   Fix: fall back to `Math.min(...selectedImages)`.

8. **Share/Download with a placeholder slot produces a placeholder image.** `handleShare` (lines 1525–1536) and `handleDownload` (1444+) do not guard `generatedImages[targetIndex] === '/placeholder.svg'`.
   Fix: early return with a "still rendering" toast if the target is a placeholder.

9. **Loading state stuck when generation returns `success: false`.** `CakeCreator.tsx` lines 738–744: `data?.success === false` throws but does not reset `isLoading`; spinner spins on zeroed progress until outer `finally` runs.
   Fix: reset `isLoading` and progress before throwing, or return early.

10. **Regenerate button still tappable for one slot while another is regenerating.** Line 2676 `disabled={...? false : false}` is dead code; the button is never actually disabled.
    Fix: `disabled={regeneratingView !== null}`.

11. **Realtime channel + poll timers leak when user navigates away mid-generation.** Mount effect (lines 349–371) only unsubscribes auth; it does not call `activeJobCleanupRef.current?.()`.
    Fix: invoke `activeJobCleanupRef.current?.()` in the unmount cleanup.

12. **`generation_tracking` upsert race can create duplicate rows.** Lines 1248–1271 do read-then-write; two rapid saves both see `null` and both insert.
    Fix: use Supabase `upsert` with `onConflict` on `(user_id, year, month)`.

13. **Watchdog ignores `partial_failed` jobs in failure-rate health metric.** `cake-generation-watchdog/index.ts` lines 65–66 count only `failed` and `completed`; a bad day full of `partial_failed` reads as "healthy".
    Fix: count `partial_failed` as failure (and possibly raise its own alert type).

14. **Edge fallback path swallows background-task errors.** `generate-complete-cake/index.ts` lines 774–779: `bgTask.catch(() => {})` in the non-EdgeRuntime branch never writes `failed` to the job row. Watchdog catches it eventually (now that we fixed `in_progress`) but adds up to 10 min of stuck state.
    Fix: in the fallback `.catch`, write `status='failed'` to the job row.

15. **Background task only writes terminal `status` after `Promise.all`.** `generate-complete-cake/index.ts` lines 735–769: if any view takes longer than the 2-min watchdog threshold, the watchdog auto-fails the row while the background task is still writing other slot URLs (data race).
    Fix: write `status='completed'` optimistically once all expected slot URLs are present, not only after `Promise.all`.

### Priority 2 — latent / low risk (defer unless we have spare time)

- **Tapping a placeholder tile opens an empty preview dialog.** `CakeCreator.tsx` 2543: image-tile `onClick` fires on placeholder taps too. Guard the click or stop propagation.
- **`dailyGenerations`/`totalGenerations` use non-functional setters** (lines 1304–1305) — switch to `setX(v => v+1)`.
- **`checkUser` silently swallows a failed `refreshSession`** (lines 380–386) — show a toast / route to `/auth` so user knows session expired.
- **Sculpted-mode slot↔column mapping is positional, not view-name based** (`generate-complete-cake` 719–723) — future-proof by mapping by view name.
- **SharedCake `setTimeout` chain in `handleReplay` is not cleared.**
- **`startJingleIfNeeded` closes over stale `jinglePlaying`** — use ref or check `audio.paused`.

### Proposed batches

1. Frontend correctness (issues 1, 2, 3, 8, 9, 10, 11, 12) — small targeted edits in `CakeCreator.tsx`.
2. Shared-link receiver (issues 4, 5, 6) — `SharedCake.tsx` + `CakeConvergeReveal.tsx`.
3. Backend robustness (issues 13, 14, 15) — watchdog + `generate-complete-cake`.
4. Optional P2 cleanups.

### Verification after each batch

- **Batch 1:** Generate Fast → tap "Share this view" on slots 0, 1, 2 → confirm no `specificView` requests fire and the correct view is shared. Generate again with the Save button while a slot is still rendering → confirm error toast appears on simulated failure.
- **Batch 2:** Open a shared anniversary cake link → confirm no birthday jingle. Click Replay → confirm the reveal animation actually re-plays.
- **Batch 3:** Force one view to time out > 2 min in a test job → confirm no race between watchdog and slot writes; partial_failed job correctly counts toward failure rate.

Please confirm which batches to ship (or all of them) and I will implement.