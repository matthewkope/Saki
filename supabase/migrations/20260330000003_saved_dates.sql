create table if not exists public.saved_dates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  month text not null,
  day text not null,
  year text not null,
  created_at timestamptz default now()
);

alter table public.saved_dates enable row level security;

create policy "Users manage own saved dates"
  on public.saved_dates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
