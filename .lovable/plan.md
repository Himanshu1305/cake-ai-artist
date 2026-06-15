## Fix cake generation failures — two layers

### Layer 1: Remove the harmful 90s client-side startup timeout (proven regression)

In `src/components/CakeCreator.tsx`:
- Delete `CAKE_JOB_START_TIMEOUT_MS` and the `withTimeout()` wrapper around `supabase.functions.invoke('generate-complete-cake', ...)`.
- Restore the pre-Jun 8 behavior: let the function call resolve naturally. The backend already returns a `jobId` quickly and the rest streams in via realtime/poll — there is no need for a client-side race timer.
- Keep the existing 4-minute safety watchdog that runs after `jobId` is received; that one is harmless and only kicks in if the job row truly stalls.
- Adjust the progress UI so it does not pretend to climb to 75% during startup. Show honest status text ("Starting cake generation…", "Uploading photo…") and only advance the bar once a real `jobId` or first image arrives.

This alone eliminates the exact failure mode where slow mobile + photo + High Quality requests were being killed at 90s by the client and shown as "failed to generate cake".

### Layer 2: Durable client-side attempt log (so failures can never hide again)

New table `public.cake_generation_attempts`:
- `id` uuid pk
- `user_id` uuid (nullable for safety)
- `client_attempt_id` text (unique per click)
- `quality` text (`fast` | `high`)
- `has_photo` boolean
- `photo_bytes` integer
- `client_started_at` timestamptz default now()
- `client_finished_at` timestamptz
- `outcome` text (`started` | `function_returned` | `startup_failed` | `function_error`)
- `job_id` uuid (when returned)
- `error_message` text
- `user_agent` text
- `created_at` timestamptz default now()

Grants + RLS:
- `GRANT SELECT, INSERT, UPDATE ON public.cake_generation_attempts TO authenticated`
- `GRANT ALL ON public.cake_generation_attempts TO service_role`
- RLS: users can insert/select/update their own rows (`auth.uid() = user_id`); service role full access.

`CakeCreator.tsx` wiring:
- Generate a `client_attempt_id` on every Generate click.
- Insert an `outcome = 'started'` row **before** calling `generate-complete-cake`, with quality, `has_photo`, `photo_bytes`, and `user_agent`.
- After the call resolves: update the row to `function_returned` (with `job_id`) or `startup_failed` / `function_error` (with `error_message` truncated to ~500 chars) and `client_finished_at = now()`.
- All logging is fire-and-forget; logging failures must never block or fail generation.

This guarantees that even if a future request never reaches the edge function, we still have a permanent forensic record of exactly what happened in the browser — quality, photo size, error string, timing — so we never have to guess again.

### Verification
- Reproduce on mobile with a photo: Fast → share → High Quality → retry Fast.
- Confirm: no client-side abort at 90s; every click produces a `cake_generation_attempts` row; successful runs additionally produce a `cake_generation_jobs` row; failed runs preserve a real error message.

### Out of scope (intentionally)
- No changes to the edge function generation logic, prompts, or model.
- No changes to Razorpay, gallery, sharing, or any other unrelated flow.
- No client-side photo compression in this pass — keeping changes minimal and reversible; we can add it later if Layer 2 logs show oversized photos are a real factor.
