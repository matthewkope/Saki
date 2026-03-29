create table if not exists public.locations (
  id              serial primary key,
  name            text not null,
  type            text not null check (type in ('country', 'state', 'city')),
  region          text,
  founded_month   int,
  founded_day     int,
  founded_year    int,
  life_path       text,
  eastern_zodiac  text,
  western_zodiac  text,
  image_url       text,
  description     text,
  created_at      timestamptz default now()
);
