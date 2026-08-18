-- ============================================================================
-- Cron schedules for the NEW Supabase project (gadiwsbvbycfygsaizja, Mumbai).
-- Recreates the scheduled edge-function jobs that lived in the Lovable dashboard
-- and therefore did NOT travel with `supabase functions deploy`.
--
-- HOW TO RUN: paste into the new project's SQL editor and run.
--
-- BEFORE RUNNING — substitute the two placeholders below everywhere they appear:
--   __SERVICE_ROLE_KEY__  -> new project's service_role key (Settings → API)
--   __CRON_SECRET__       -> the CRON_SECRET value you set via `supabase secrets set`
-- (Do NOT commit real values. Better: store them in Supabase Vault and read via
--  vault.decrypted_secrets — see the commented alternative at the bottom.)
--
-- SCHEDULES: these are the EXACT Lovable dashboard schedules (confirmed by the
--   operator on 2026-08-18). All human-facing cadences are IST; pg_cron fires on
--   the database timezone (UTC), so every expression below is the IST time
--   converted to UTC (IST = UTC+5:30). The trailing comment on each job states
--   the original IST intent.
--
-- Auth model: every job sends BOTH headers so it works regardless of each
--   function's verify_jwt setting:
--     Authorization: Bearer <service_role>  -> satisfies the platform JWT gate
--     X-Cron-Secret: <CRON_SECRET>          -> satisfies the function's own check
--   (cake-generation-watchdog ignores X-Cron-Secret; harmless to send it.)
--
-- NOTE on job names vs function names: two jobs (engagement-recent-visitors,
--   engagement-we-miss-you) BOTH invoke the `send-engagement-drip` function.
--   pg_cron job names must be unique, so the JOB NAME is the logical Lovable name
--   while the URL points at the shared function. `send-engagement-drip` branches
--   on the POST body `campaign` field (defaults to "recent_visitors" if absent),
--   so each job MUST send its own campaign body — otherwise the "we miss you"
--   job would silently send the recent-visitors email.
--
-- NOTE: `send-reengagement-sequence` is intentionally NOT scheduled here — it is
--   absent from the authoritative Lovable schedule list and PROJECT_CONTEXT §7
--   records it as "pending, never actually scheduled". Add a job below if you
--   decide to activate it.
-- ============================================================================

-- Required extensions (no-op if already enabled).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotency: drop any existing jobs with these names before re-adding.
do $$
declare
  job text;
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
  foreach job in array jobs loop
    if exists (select 1 from cron.job where jobname = job) then
      perform cron.unschedule(job);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 1) cake-generation-watchdog — every 10 minutes
--    Critical: auto-fails cake_generation_jobs stuck in 'processing'.
-- ---------------------------------------------------------------------------
select cron.schedule(
  'cake-generation-watchdog',
  '*/10 * * * *',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/cake-generation-watchdog',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer __SERVICE_ROLE_KEY__',
      'X-Cron-Secret', '__CRON_SECRET__'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- ---------------------------------------------------------------------------
-- 2) engagement-recent-visitors — Mon 09:00 IST (03:30 UTC) -> send-engagement-drip
--    campaign = recent_visitors
-- ---------------------------------------------------------------------------
select cron.schedule(
  'engagement-recent-visitors',
  '30 3 * * 1',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-engagement-drip',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer __SERVICE_ROLE_KEY__',
      'X-Cron-Secret', '__CRON_SECRET__'
    ),
    body    := '{"campaign":"recent_visitors"}'::jsonb
  );
  $$
);

-- ---------------------------------------------------------------------------
-- 3) engagement-we-miss-you — Wed 09:00 IST (03:30 UTC) -> send-engagement-drip
--    campaign = we_miss_you
-- ---------------------------------------------------------------------------
select cron.schedule(
  'engagement-we-miss-you',
  '30 3 * * 3',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-engagement-drip',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer __SERVICE_ROLE_KEY__',
      'X-Cron-Secret', '__CRON_SECRET__'
    ),
    body    := '{"campaign":"we_miss_you"}'::jsonb
  );
  $$
);

-- ---------------------------------------------------------------------------
-- 4) send-anniversary-reminders — daily 09:00 IST (03:30 UTC)
-- ---------------------------------------------------------------------------
select cron.schedule(
  'send-anniversary-reminders',
  '30 3 * * *',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-anniversary-reminders',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer __SERVICE_ROLE_KEY__',
      'X-Cron-Secret', '__CRON_SECRET__'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- ---------------------------------------------------------------------------
-- 5) weekly-blog-digest — Sun 02:30 IST = Sat 21:00 UTC -> send-weekly-blog-digest
-- ---------------------------------------------------------------------------
select cron.schedule(
  'weekly-blog-digest',
  '0 21 * * 6',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-weekly-blog-digest',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer __SERVICE_ROLE_KEY__',
      'X-Cron-Secret', '__CRON_SECRET__'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- ---------------------------------------------------------------------------
-- 6) weekly-blog-generation — Sat 00:00 IST = Fri 18:30 UTC -> generate-blog-post
-- ---------------------------------------------------------------------------
select cron.schedule(
  'weekly-blog-generation',
  '30 18 * * 5',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/generate-blog-post',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer __SERVICE_ROLE_KEY__',
      'X-Cron-Secret', '__CRON_SECRET__'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- ---------------------------------------------------------------------------
-- 7) weekly-upgrade-nudge — Thu 09:00 IST (03:30 UTC) -> send-weekly-upgrade-nudge
-- ---------------------------------------------------------------------------
select cron.schedule(
  'weekly-upgrade-nudge',
  '30 3 * * 4',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-weekly-upgrade-nudge',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer __SERVICE_ROLE_KEY__',
      'X-Cron-Secret', '__CRON_SECRET__'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- Confirm what was scheduled:
--   select jobid, schedule, jobname, active from cron.job order by jobname;

-- ============================================================================
-- ALTERNATIVE (recommended for production): keep secrets out of cron.job.command
-- by storing them in Vault and reading at fire time. Example for one job:
--
--   -- one-time setup:
--   -- select vault.create_secret('__SERVICE_ROLE_KEY__', 'service_role_key');
--   -- select vault.create_secret('__CRON_SECRET__',      'cron_secret');
--
--   select cron.schedule('cake-generation-watchdog', '*/10 * * * *', $$
--     select net.http_post(
--       url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/cake-generation-watchdog',
--       headers := jsonb_build_object(
--         'Content-Type',  'application/json',
--         'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key'),
--         'X-Cron-Secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
--       ),
--       body := '{}'::jsonb
--     );
--   $$);
-- ============================================================================
