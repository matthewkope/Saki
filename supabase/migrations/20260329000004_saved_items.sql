create table public.saved_items (
  id          serial primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  item_type   text not null check (item_type in ('celebrity','location','clothing')),
  item_id     integer not null,
  item_name   text,
  item_image_url text,
  created_at  timestamptz default now(),
  unique(user_id, item_type, item_id)
);

alter table public.saved_items enable row level security;

create policy "Users manage their own saved items"
  on public.saved_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
