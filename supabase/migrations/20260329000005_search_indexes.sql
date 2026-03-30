-- Indexes for celebrities list page
create index if not exists idx_celebrities_name on public.celebrities (name);
create index if not exists idx_celebrities_life_path on public.celebrities (life_path);
create index if not exists idx_celebrities_eastern_zodiac on public.celebrities (eastern_zodiac);
create index if not exists idx_celebrities_western_zodiac on public.celebrities (western_zodiac);

-- Indexes for locations list page
create index if not exists idx_locations_name on public.locations (name);
create index if not exists idx_locations_type on public.locations (type);
create index if not exists idx_locations_life_path on public.locations (life_path);
create index if not exists idx_locations_eastern_zodiac on public.locations (eastern_zodiac);
create index if not exists idx_locations_western_zodiac on public.locations (western_zodiac);

-- Indexes for clothing list page
create index if not exists idx_clothing_name on public.clothing (name);
create index if not exists idx_clothing_life_path on public.clothing (life_path);
create index if not exists idx_clothing_eastern_zodiac on public.clothing (eastern_zodiac);
create index if not exists idx_clothing_western_zodiac on public.clothing (western_zodiac);

-- Index for saved_items lookups
create index if not exists idx_saved_items_user_type on public.saved_items (user_id, item_type);
