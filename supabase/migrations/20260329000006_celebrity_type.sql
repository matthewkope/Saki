alter table public.celebrities
  add column if not exists type text;

create index if not exists idx_celebrities_type on public.celebrities (type);
