
# Cake generation reliability — full audit

I traced the entire flow end-to-end (edge function → DB job row → realtime → polling → UI). Here is what I confirmed and the (small) residual risks.

## What is now correct

**1. The browser no longer waits on AI image generation.**
`generate-complete-cake` inserts a row into `cake_generation_jobs`, returns within ~1s with `jobId + null image slots + failedViews=[all view names]`, then runs every view (including hero) inside `EdgeRuntime.waitUntil`. The old "stuck at 60% / 98%" path is structurally removed — the browser cannot get stuck on a request that already returned.

**2. DB schema, RLS, and realtime are aligned with the code.**
- Table has all columns the edge function writes (`hero_url/side_url/top_url`, matching `*_error`, `status`, `view_count`, `greeting_message`).
- RLS: owner-only SELECT — required for realtime.
- Table is in `supabase_realtime` publication — UPDATE events will fire.
- Edge function uses the service role key to write, so RLS does not block background updates.

**3. Realtime miss is covered by polling.**
Even if the row finishes BEFORE the client subscribes (very common — bg can finish in 9s while the response itself returns in ~1s), the client immediately calls `fetchOnce()`, again at 1s and 3s, then every 5s, plus a 4-minute watchdog that converts any still-pending slots into a "Regenerate" prompt. There is no path where the UI can sit forever.

**4. Per-view failures are isolated.**
Each view writes to its own slot. If hero succeeds but side fails, the user keeps the hero and gets a Regenerate button on side — no whole-batch failure.

**5. Gateway error handling is correct.**
Primary model has a per-view abort timeout; on AbortError / 503 / "No image returned" / 5xx → falls back to a second model. 429 → `RATE_LIMIT`, 402 → `CREDITS_EXHAUSTED`, surfaced as proper HTTP statuses with user-readable messages.

**6. Frontend success/error gating is sane.**
`data.success === false` short-circuits with a real error toast (no blank screen). The polling block is correctly gated on `jobId && viewOrder && heroView && failedViews.length > 0`, which is always true under the new flow because the backend marks every slot as initially "pending" via `failedViews = allViewNames`.

## Residual risks (small, worth fixing)

**A. TDZ-safe but fragile ordering in CakeCreator.tsx (~lines 850–893).**
`fetchOnce()` is invoked at line 863 and its `applyRow` callback references `cleanup`, which is declared as `const` at line 887. Today this works because `fetchOnce` is async and `cleanup` is defined before the awaited query resolves. If anyone later makes `fetchOnce` synchronous or moves code, this becomes a TDZ ReferenceError. Move the `const cleanup = …` declaration ABOVE the first `fetchOnce()` call.

**B. The "all 3 views in parallel + fallback" worst case is ~43s.**
Per view: 28s primary + 15s fallback. Three in parallel = ~43s background time. Comfortably inside the edge function's `waitUntil` budget (~150s), so no action required, but worth noting if we ever add a 4th view or the gateway gets slower — we should reduce parallel fan-out or shrink the per-view fallback window.

**C. Unrelated noise in console: repeated `NetworkError when attempting to fetch resource` from `ads_enabled` etc.**
Not part of cake generation. Mentioning so we don't confuse them with generation failures during future debugging.

## Verdict

The cake generation flow is now correct by construction:
- Browser request never waits on AI.
- Job row is the single source of truth.
- Realtime + polling + watchdog cover every drop scenario.
- Per-slot failures degrade to Regenerate buttons instead of blocking the whole cake.
- Real errors (rate limit, credits, hero failure) surface as readable toasts, not blank screens.

The only change I'd recommend before declaring it bulletproof is the small ordering fix in (A). After that I am confident this will not regress to the old "stuck at X%" symptom.

If you want, I can switch to build mode and apply fix (A).
