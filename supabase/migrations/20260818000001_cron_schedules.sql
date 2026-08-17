-- ============================================================================
-- Cron schedules for the NEW Supabase project (gadiwsbvbycfygsaizja, Mumbai).
-- Recreates the 7 scheduled edge-function jobs that lived in the Lovable
-- dashboard and therefore did NOT travel with `supabase functions deploy`.
--
-- HOW TO RUN: paste into the new project's SQL editor and run.
--
-- BEFORE RUNNING — substitute the two placeholders below everywhere they appear:
--   __SERVICE_ROLE_KEY__  -> new project's service_role key (Settings → API)
--   __CRON_SECRET__       -> the CRON_SECRET value you set via `supabase secrets set`
-- (Do NOT commit real values. Better: store them in Supabase Vault and read via
--  vault.decrypted_secrets — see the commented alternative at the bottom.)
--
-- ⚠️ CADENCE WARNING: the original schedules were configured in the Lovable
--   dashboard and are NOT in this repo. Only two cadences are recoverable from
--   source and are trustworthy:
--       cake-generation-watchdog  -> every 10 min  (code comment)
--       send-reengagement-sequence-> daily 09:00   (PROJECT_CONTEXT §7)
--   The other FIVE cadences below are BEST-EFFORT DEFAULTS I chose (staggered to
--   avoid a thundering herd). VERIFY each against the old project's dashboard and
--   adjust before relying on them.
--
-- ⚠️ TIMEZONE: pg_cron fires on the database timezone, which is UTC by default.
--   "daily 09:00" here means 09:00 UTC = 14:30 IST. If you want 09:00 IST, use
--   '30 3 * * *'. Decide per job; the values below are UTC.
--
-- Auth model: every job sends BOTH headers so it works regardless of each
--   function's verify_jwt setting:
--     Authorization: Bearer <service_role>  -> satisfies the platform JWT gate
--     X-Cron-Secret: <CRON_SECRET>          -> satisfies the function's own check
--   (cake-generation-watchdog ignores X-Cron-Secret; harmless to send it.)
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
    'generate-blog-post',
    'send-anniversary-reminders',
    'send-engagement-drip',
    'send-reengagement-sequence',
    'send-weekly-blog-digest',
    'send-weekly-upgrade-nudge'
  ];
begin
  foreach job in array jobs loop
    if exists (select 1 from cron.job where jobname = job) then
      perform cron.unschedule(job);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 1) cake-generation-watchdog — every 10 minutes  [CONFIRMED from code]
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
-- 2) generate-blog-post — DEFAULT: daily 06:00 UTC  [VERIFY cadence]
-- ---------------------------------------------------------------------------
select cron.schedule(
  'generate-blog-post',
  '0 6 * * *',
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
-- 3) send-anniversary-reminders — DEFAULT: daily 08:00 UTC  [VERIFY cadence]
-- ---------------------------------------------------------------------------
select cron.schedule(
  'send-anniversary-reminders',
  '0 8 * * *',
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
-- 4) send-engagement-drip — DEFAULT: daily 10:00 UTC  [VERIFY cadence]
-- ---------------------------------------------------------------------------
select cron.schedule(
  'send-engagement-drip',
  '0 10 * * *',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-engagement-drip',
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
-- 5) send-reengagement-sequence — daily 09:00 UTC  [cadence CONFIRMED, tz=UTC]
--    PROJECT_CONTEXT §7 says "daily 9am". Change to '30 3 * * *' for 09:00 IST.
-- ---------------------------------------------------------------------------
select cron.schedule(
  'send-reengagement-sequence',
  '0 9 * * *',
  $$
  select net.http_post(
    url     := 'https://gadiwsbvbycfygsaizja.supabase.co/functions/v1/send-reengagement-sequence',
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
-- 6) send-weekly-blog-digest — DEFAULT: Mondays 09:00 UTC  [VERIFY cadence]
-- ---------------------------------------------------------------------------
select cron.schedule(
  'send-weekly-blog-digest',
  '0 9 * * 1',
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
-- 7) send-weekly-upgrade-nudge — DEFAULT: Wednesdays 10:00 UTC  [VERIFY cadence]
-- ---------------------------------------------------------------------------
select cron.schedule(
  'send-weekly-upgrade-nudge',
  '0 10 * * 3',
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
