create table if not exists public.cue_astrology_profiles (
    id uuid default gen_random_uuid() primary key,
    lifepath_primary integer not null,
    lifepath_secondary integer not null,
    eastern_sign text not null,
    western_sign text not null,
    profile_data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cue_astrology_profiles enable row level security;

create policy "Enable read access for all users"
on public.cue_astrology_profiles
for select
using (true);

create policy "Enable insert for authenticated users only"
on public.cue_astrology_profiles
for insert
to authenticated
with check (true);

insert into public.cue_astrology_profiles (
    lifepath_primary,
    lifepath_secondary,
    eastern_sign,
    western_sign,
    profile_data,
    created_at
)
select
    uap.lifepath_primary,
    uap.lifepath_secondary,
    uap.eastern_sign,
    uap.western_sign,
    uap.profile_data,
    uap.created_at
from public.user_astrology_profiles uap
where not exists (
    select 1
    from public.cue_astrology_profiles cap
    where cap.lifepath_primary = uap.lifepath_primary
      and cap.lifepath_secondary = uap.lifepath_secondary
      and cap.eastern_sign = uap.eastern_sign
      and cap.western_sign = uap.western_sign
      and cap.profile_data = uap.profile_data
);
