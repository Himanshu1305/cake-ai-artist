## Goal
Make cake generation self-healing and notify you the moment things break at scale, with zero recurring AI cost.

## What gets built

### 1. Auto-watchdog cron (every 10 minutes, free)
A new edge function `cake-generation-watchdog` runs on a schedule and does two things:

**a) Auto-fix stuck jobs**
- Finds any `cake_generation_jobs` row with `status = 'processing'` and `created_at` older than 2 minutes.
- Updates them to `status = 'failed'`, `error_message = 'Auto-timeout: generation exceeded 2 minutes'`.
- Result: users never see the "stuck at 75% forever" symptom again — the UI's polling sees `failed` and shows a clean retry button.

**b) Detect outages and alert**
Queries the last hour of `cake_generation_jobs`:
- If total attempts ≥ 5 **and** failure rate > 50% → trigger alert.
- If ≥ 5 jobs were just auto-timed-out in this run → trigger alert.

When an alert triggers, send **one** email to `himanshu1305@gmail.com` with:
- Subject: `🚨 Cake AI Artist — Generation degraded`
- Body: failure count, success count, failure rate %, most common error message, link to admin panel.

**Anti-spam:** A new tiny table `system_alert_log` records each alert sent. The watchdog will not send another email for the same alert type within 60 minutes. So at worst you get 1 email/hour during a real incident, not 6.

### 2. Legacy `xhr` import sweep
Remove the deprecated `https://deno.land/x/xhr@0.1.0/mod.ts` import from every edge function that still has it (this was the actual root cause of the original hang). I'll grep all functions and clean them in one pass.

### 3. Hardening summary (already shipped earlier, listed for completeness)
- Early response pattern in `generate-complete-cake` (returns jobId in ~1.7s, AI work runs in background via `EdgeRuntime.waitUntil`).
- Permanent stage tracing in `cake_generation_events` for future forensics.

## Technical details

**New table:** `system_alert_log(id, alert_type text, sent_at timestamptz, details jsonb)` — RLS: service_role only.

**New edge function:** `supabase/functions/cake-generation-watchdog/index.ts` — uses service role, no JWT (cron-invoked), uses existing Resend setup (`RESEND_API_KEY` already configured) to send the alert email to `himanshu1305@gmail.com`.

**Cron:** pg_cron schedule `*/10 * * * *` calls the watchdog via `net.http_post` with the project anon key (inserted via `supabase--insert`, not migration, since it contains the project URL).

**No frontend changes.** No changes to cake generation flow itself.

## Out of scope
- No synthetic test cakes (zero AI cost confirmed).
- No admin UI banner (you chose email only).
- No SMS / Slack / push notifications.
- No changes to user-facing UX beyond the cleaner failure message that already lands when watchdog flips a stuck job.

## What you'll experience
- 99% of the time: nothing. No emails, watchdog runs silently.
- During a real outage: one email within 10 min, then at most one per hour until fixed.
- Users during an outage: see a clean "Failed, try again" within 2 minutes instead of spinning forever.
