# Lock Down Sensitive Data Exposure

Three security findings to fix via RLS policy updates. No frontend changes needed — code already uses the safe `public_featured_images` view for the homepage.

## What's wrong today

1. **`generated_images` — "Anyone can view featured images"** policy returns ALL columns (including `message`, `recipient_name`, `prompt`, `occasion_date`) to anonymous users when `featured = true`. The safe view `public_featured_images` exists and is already used by the homepage, but the underlying base-table policy still leaks personal data to anyone querying directly.

2. **`scheduled_task_runs` — "Service role can manage task runs"** policy is bound to the `{public}` role with `USING (true)`, so any anonymous visitor can read all internal task names, schedules, errors, and run history.

3. **`upgrade_nudge_logs` — "Service role can manage nudge logs"** policy has the same flaw — `{public}` + `USING (true)` exposes every user's marketing email schedule.

## Fix (database migration only)

### a) `generated_images`
- Drop the public-facing `"Anyone can view featured images"` SELECT policy on the base table. The homepage will continue to work because it queries `public.public_featured_images` (a view that already exposes only `id, image_url, created_at, occasion_type`).
- Owner, admin, and "users can view their own images" policies remain — so creators still see all their own data; only public anonymous access to personal fields is removed.

### b) `scheduled_task_runs`
- Drop `"Service role can manage task runs"` (which is bound to `{public}`).
- Recreate it scoped strictly to the `service_role`:
  - `FOR ALL TO service_role USING (true) WITH CHECK (true)`
- Existing `"Admins can read scheduled task runs"` policy stays, so the admin dashboard widget keeps working.

### c) `upgrade_nudge_logs`
- Drop `"Service role can manage nudge logs"` (bound to `{public}`).
- Recreate scoped to `service_role` only.
- Existing admin SELECT and user-own SELECT policies remain.

## Verification after migration
- Homepage featured carousel still loads (uses the view).
- Logged-in creator still sees their own messages/recipient names in Gallery.
- Anonymous direct query of `generated_images` returns 0 rows.
- Admin dashboard `ScheduledTasksWidget` still loads task runs (admin policy intact).
- Edge functions writing to `scheduled_task_runs` and `upgrade_nudge_logs` continue to work (they use the service role key).

## Files touched
- One SQL migration. No application code changes required.
