insert into public.celebrities (
  name,
  type,
  life_path,
  eastern_zodiac,
  western_zodiac,
  month,
  day,
  year,
  image_url,
  description
)
select
  'Lana Rhoades',
  'Actor',
  '4',
  'Rat',
  'Virgo',
  9,
  6,
  1996,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Lana_Rhoades_2-2017_%28cropped%29.jpg/960px-Lana_Rhoades_2-2017_%28cropped%29.jpg',
  'American media personality and former adult film performer.'
where not exists (
  select 1 from public.celebrities where name = 'Lana Rhoades'
);
