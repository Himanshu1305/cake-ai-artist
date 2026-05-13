## Why "0 records"

The last full run actually picked up **8 eligible inactive users**, but Brevo rejected 6 with `400 missing_parameter: name is missing in to`. Those 6 are users who signed up via Google OAuth (or otherwise) with no `first_name` saved on their profile — the function calls Brevo with `name: ""`, which Brevo refuses.

The 2 that succeeded had a `first_name` and were logged in `engagement_email_logs`. So the next "Run Now" skips those 2 and re-tries only the 6 broken ones — all fail again → **Processed 0 records**.

This is **not** a filter bug; the candidates are being found correctly.

## Fix

In `supabase/functions/send-engagement-drip/index.ts`:

1. **Compute a safe fallback name** before calling Brevo:
   - Use `first_name` if present and non-empty.
   - Otherwise derive from the email local-part (e.g. `vamhall898@gmail.com` → `vamhall898`), title-cased.
   - Final fallback: `"there"`.

2. **Apply this fallback in two places**:
   - The production loop where `sendBrevo(user.email, user.first_name || "", ...)` is called.
   - The test-mode branch where `sendBrevo(testEmail, firstName, ...)` is called.

3. Keep passing the original (possibly empty) `first_name` into `buildEmailHtml` so the in-body greeting still falls back to "there" as it does today — only the Brevo `to.name` field needs the safe value.

4. Redeploy the `send-engagement-drip` edge function.

## Verification

- Click **Run Now** again. Expect ~6 sends to succeed and `records_processed` to jump.
- Confirm `engagement_email_logs` gains rows for the previously-failing addresses.
- Confirm the `error_message` field on the latest `scheduled_task_runs` row is empty.

## Out of scope

- No DB schema changes.
- No template/content changes (that work was already shipped).
- No change to filter logic, age windows, opt-out, or country localization.
