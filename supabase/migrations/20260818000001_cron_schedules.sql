-- ============================================================================
-- Cron schedules for the NEW Supabase project (gadiwsbvbycfygsaizja, Mumbai).
--
-- STATUS: APPLIED to the live database on 2026-10-31 (jobids 8-14). This file
-- is the record of what is running. Re-running it is idempotent.
--
-- ----------------------------------------------------------------------------
-- WHERE CRON ACTUALLY LIVES (corrected 2026-10-31)
-- ----------------------------------------------------------------------------
-- An earlier version of this file said these jobs "lived in the Lovable
-- dashboard". That is half true and the distinction matters, because it was
-- read as "cron went away with Lovable" and the jobs stayed down for weeks.
--
-- Lovable's dashboard was only a UI. The jobs themselves are pg_cron rows
-- inside this Postgres database. Evidence, from this project on 2026-10-31:
--   pg_cron and pg_net are installed here
--   cron.job_run_details holds 9,663 historical runs, last one 2026-08-16
-- Those run records came across in the pg_restore, which is why they carried
-- the old project's URLs. On 2026-09-08 all 7 jobs were unscheduled to clear
-- them, and nothing rescheduled them — that, not Lovable, is why cron was dead
-- from 2026-08-16 to 2026-10-31.
--
-- ----------------------------------------------------------------------------
-- AUTH: NO service_role KEY IS NEEDED (corrected 2026-10-31)
-- ----------------------------------------------------------------------------
-- This file used to require a __SERVICE_ROLE_KEY__ placeholder. Checked
-- against supabase/config.toml: all six cron target functions are declared
-- verify_jwt = false, so the platform JWT gate is off and no Authorization
-- header is required by any of them.
--
--   cake-generation-watchdog    verify_jwt=false, no CRON_SECRET check
--                               -> needs NO credentials at all.
--                               Confirmed live: an unauthenticated
--                               net.http_post returned HTTP 200 with a full
--                               watchdog report on 2026-10-31.
--   the other five              verify_jwt=false, but each compares
--                               X-Cron-Secret against the CRON_SECRET env var
--                               -> needs ONLY the cron secret.
--
-- The cron secret is read from Vault at fire time rather than written into
-- cron.job.command, so it never appears in this file, in git, or in a chat
-- transcript. To set or rotate it, run (nothing else is required):
--
--   select vault.create_secret('<the CRON_SECRET value>', 'cron_secret');
--   -- rotating later:
--   -- select vault.update_secret(id, '<new value>') from vault.secrets
--   --   where name = 'cron_secret';
--
-- The value must match the CRON_SECRET set on the edge functions
-- (`supabase secrets set CRON_SECRET=...`). Until the Vault row exists those
-- five jobs fire and receive 401; the watchdog is unaffected.
--
-- ----------------------------------------------------------------------------
-- SCHEDULES
-- ----------------------------------------------------------------------------
-- Human-facing cadences are IST; pg_cron fires on the database timezone (UTC),
-- so every expression below is the IST time converted (IST = UTC+5:30). The
-- trailing comment on each job states the original IST intent.
--
-- Two jobs (engagement-recent-visitors, engagement-we-miss-you) both invoke
-- send-engagement-drip. pg_cron job names must be unique, so the job name is
-- the logical name while the URL points at the shared function. That function
-- branches on the POST body `campaign` field and defaults to "recent_visitors"
-- when absent, so each job MUST send its own campaign body — otherwise the
-- "we miss you" job silently sends the recent-visitors email.
--
-- send-reengagement-sequence is intentionally NOT scheduled: it is absent from
-- the authoritative schedule list and PROJECT_CONTEXT §7 records it as never
-- actually scheduled.
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotency: drop these job names before re-adding.
-- NOTE: the loop variable must not be named `job`, or the WHERE clause reads
-- `jobname = job` ambiguously against cron.job.job and aborts with 42702.
do $$
declare
  jname text;
  jobs text[] := array[
    'cake-generation-watchdog',
    'engagement-recent-visitors',
    'engagement-we-miss-you',
    'send-anniversary-reminders',
    'weekly-blog-digest',
    'weekly-blog-generation',
    'weekly-upgrade-nudge'
  ];
begin
  foreach jname in array jobs loop
    if exists (select 1 from cron.job c where c.jobname = jname) then
      perform cron.unschedule(jname);
    end if;
  end loop;
end $$;

-- 1) cake-generation-watchdog — every 10 minutes.
--    Auto-fails cake_generation_jobs stuck in 'processing' and alerts on
--    credit exhaustion, consecutive failures and blocked signups.
--    No credentials: verify_jwt=false and the function has no secret check.
select cron.schedule('cake-generation-watchdog', '*/10 * * * *', $$
  select net.http_post(
    url := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/cake-generation-watchdog',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb);
$$);

-- 2) engagement-recent-visitors — Mon 09:00 IST (03:30 UTC)
select cron.schedule('engagement-recent-visitors', '30 3 * * 1', $$
  select net.http_post(
    url := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-engagement-drip',
    headers := jsonb_build_object('Content-Type','application/json',
      'X-Cron-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name='cron_secret'),'')),
    body := '{"campaign":"recent_visitors"}'::jsonb);
$$);

-- 3) engagement-we-miss-you — Wed 09:00 IST (03:30 UTC)
select cron.schedule('engagement-we-miss-you', '30 3 * * 3', $$
  select net.http_post(
    url := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-engagement-drip',
    headers := jsonb_build_object('Content-Type','application/json',
      'X-Cron-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name='cron_secret'),'')),
    body := '{"campaign":"we_miss_you"}'::jsonb);
$$);

-- 4) send-anniversary-reminders — daily 09:00 IST (03:30 UTC)
select cron.schedule('send-anniversary-reminders', '30 3 * * *', $$
  select net.http_post(
    url := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-anniversary-reminders',
    headers := jsonb_build_object('Content-Type','application/json',
      'X-Cron-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name='cron_secret'),'')),
    body := '{}'::jsonb);
$$);

-- 5) weekly-blog-digest — Sun 02:30 IST = Sat 21:00 UTC
select cron.schedule('weekly-blog-digest', '0 21 * * 6', $$
  select net.http_post(
    url := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-weekly-blog-digest',
    headers := jsonb_build_object('Content-Type','application/json',
      'X-Cron-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name='cron_secret'),'')),
    body := '{}'::jsonb);
$$);

-- 6) weekly-blog-generation — Sat 00:00 IST = Fri 18:30 UTC
select cron.schedule('weekly-blog-generation', '30 18 * * 5', $$
  select net.http_post(
    url := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/generate-blog-post',
    headers := jsonb_build_object('Content-Type','application/json',
      'X-Cron-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name='cron_secret'),'')),
    body := '{}'::jsonb);
$$);

-- 7) weekly-upgrade-nudge — Thu 09:00 IST (03:30 UTC)
select cron.schedule('weekly-upgrade-nudge', '30 3 * * 4', $$
  select net.http_post(
    url := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-weekly-upgrade-nudge',
    headers := jsonb_build_object('Content-Type','application/json',
      'X-Cron-Secret', coalesce((select decrypted_secret from vault.decrypted_secrets where name='cron_secret'),'')),
    body := '{}'::jsonb);
$$);

-- ============================================================================
-- VERIFY
--   select jobid, jobname, schedule, active from cron.job order by jobid;
--   -- after ~10 minutes, the watchdog should have run:
--   select jobid, status, return_message, start_time
--     from cron.job_run_details order by start_time desc limit 5;
--   -- and the function should have answered 200:
--   select status_code, left(content,200), created
--     from net._http_response order by id desc limit 5;
-- ============================================================================
