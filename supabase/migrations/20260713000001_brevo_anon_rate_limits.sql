-- Rate limit table for anonymous Brevo email capture (SharedCake flow)
-- Max ANON_RATE_LIMIT requests per IP per hour enforced in the edge function
create table if not exists public.brevo_anon_rate_limits (
  id          uuid primary key default gen_random_uuid(),
  ip          text not null,
  request_count int not null default 1,
  window_start  timestamptz not null default now()
);

create index if not exists idx_brevo_anon_rate_limits_ip_window
  on public.brevo_anon_rate_limits (ip, window_start);

-- Auto-purge rows older than 2 hours to keep the table small
-- (Run as a scheduled job or rely on the edge function's window filter)
alter table public.brevo_anon_rate_limits enable row level security;

-- No direct client access; only service role (edge function) may read/write
create policy "service_role_only" on public.brevo_anon_rate_limits
  using (false)
  with check (false);
