-- Tracks React ErrorBoundary catches for client-side error observability
create table if not exists public.client_errors (
  id           uuid primary key default gen_random_uuid(),
  component    text,
  error_name   text,
  error_message text,
  stack        text,
  component_stack text,
  user_agent   text,
  created_at   timestamptz not null default now()
);

-- Anyone (anon or auth) may insert; no reads via anon
alter table public.client_errors enable row level security;
create policy "insert_only" on public.client_errors
  for insert with check (true);
