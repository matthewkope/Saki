create table if not exists public.saved_ancient_names (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  full_name text not null,
  daily_name text not null,
  created_at timestamptz default now()
);

alter table public.saved_ancient_names enable row level security;

create policy "Users manage own saved ancient names"
  on public.saved_ancient_names
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

