-- Email sequence log: one row per user per sequence type
-- Unique constraint prevents sending the same sequence email twice to any user

create table if not exists public.email_sequence_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence_type text not null,
  sent_at timestamptz not null default now(),
  constraint email_sequence_log_user_sequence_unique unique (user_id, sequence_type)
);

alter table public.email_sequence_log enable row level security;

-- Only service role can read/write
create policy "Service role full access" on public.email_sequence_log
  for all using (auth.role() = 'service_role');

create index if not exists email_sequence_log_user_id_idx on public.email_sequence_log (user_id);
create index if not exists email_sequence_log_sequence_type_idx on public.email_sequence_log (sequence_type);
