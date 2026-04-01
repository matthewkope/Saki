create table if not exists public.user_astrology_profiles (
    id uuid default gen_random_uuid() primary key,
    lifepath_primary integer not null,
    lifepath_secondary integer not null,
    eastern_sign text not null,
    western_sign text not null,
    profile_data jsonb not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS to prevent accidental/malicious data loss
alter table public.user_astrology_profiles enable row level security;

-- Allow public read access (for your website visitors to view the descriptions)
create policy "Enable read access for all users" 
on public.user_astrology_profiles 
for select 
using (true);

-- Only allow authenticated users (like your admin panel or service key) to insert/update/delete
create policy "Enable insert for authenticated users only"
on public.user_astrology_profiles
for insert
to authenticated
with check (true);
