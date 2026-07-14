-- Tracks Google Places searches to enforce per-user rate limiting
-- and provide usage analytics for the vendor discovery feature
create table if not exists public.vendor_search_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  query       text not null,
  location    text,
  result_count int,
  created_at  timestamptz not null default now()
);

create index if not exists idx_vendor_search_usage_user_created
  on public.vendor_search_usage (user_id, created_at desc);

alter table public.vendor_search_usage enable row level security;

-- Users can only read their own search history; insert via service role only
create policy "users_read_own" on public.vendor_search_usage
  for select using (auth.uid() = user_id);
