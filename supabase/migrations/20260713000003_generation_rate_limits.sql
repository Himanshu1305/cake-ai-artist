-- Per-user rolling-window rate limit table for cake generation
-- The edge function enforces: max 10 requests per user per 5 minutes
create table if not exists public.generation_rate_limits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  window_start timestamptz not null default now(),
  request_count int not null default 1
);

create index if not exists idx_generation_rate_limits_user_window
  on public.generation_rate_limits (user_id, window_start);

alter table public.generation_rate_limits enable row level security;

-- Only service role (edge functions) may access this table
create policy "service_role_only" on public.generation_rate_limits
  using (false)
  with check (false);
