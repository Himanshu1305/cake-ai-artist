-- User occasions: upcoming celebrations to remember

create table if not exists public.user_occasions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_name text not null,
  occasion_type text not null default 'birthday',
  occasion_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.user_occasions enable row level security;

create policy "Users can manage own occasions" on public.user_occasions
  for all using (auth.uid() = user_id);

create index if not exists user_occasions_user_id_idx on public.user_occasions (user_id);
create index if not exists user_occasions_date_idx on public.user_occasions (occasion_date);
