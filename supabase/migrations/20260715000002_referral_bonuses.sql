-- Referral bonuses: tracks who referred whom and whether bonuses were granted

create table if not exists public.referral_bonuses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  referred_by uuid references auth.users(id) on delete set null,
  bonus_granted boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.referral_bonuses enable row level security;

create policy "Service role full access" on public.referral_bonuses
  for all using (auth.role() = 'service_role');

-- Allow users to read their own referral row
create policy "Users can read own referral" on public.referral_bonuses
  for select using (auth.uid() = user_id);

create index if not exists referral_bonuses_user_id_idx on public.referral_bonuses (user_id);
create index if not exists referral_bonuses_referred_by_idx on public.referral_bonuses (referred_by);

-- Add bonus_generations column to profiles
alter table public.profiles
  add column if not exists bonus_generations integer not null default 0;
