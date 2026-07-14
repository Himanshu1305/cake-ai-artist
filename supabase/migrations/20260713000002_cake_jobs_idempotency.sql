-- Add request_id to cake_generation_jobs for idempotency
-- The edge function passes a client-generated UUID per request; duplicate
-- inserts are caught by the unique index and the existing job is returned.
alter table public.cake_generation_jobs
  add column if not exists request_id text;

create unique index if not exists idx_cake_generation_jobs_request_id
  on public.cake_generation_jobs (request_id)
  where request_id is not null;
