update public.celebrities
set
  type = 'Musician',
  life_path = '5',
  eastern_zodiac = 'Tiger',
  western_zodiac = 'Sagittarius',
  month = 12,
  day = 2,
  year = 1998,
  image_url = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Juice_WRLD_-_Les_Ardentes_2019_%28cropped_2%29_%28cropped%29.jpg?width=600',
  description = 'American rapper, singer, and songwriter whose melodic style helped bring emo rap and SoundCloud rap into the mainstream, with breakout hits like "Lucid Dreams" and "All Girls Are the Same."'
where name = 'Juice WRLD';

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
  'Juice WRLD',
  'Musician',
  '5',
  'Tiger',
  'Sagittarius',
  12,
  2,
  1998,
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/Juice_WRLD_-_Les_Ardentes_2019_%28cropped_2%29_%28cropped%29.jpg?width=600',
  'American rapper, singer, and songwriter whose melodic style helped bring emo rap and SoundCloud rap into the mainstream, with breakout hits like "Lucid Dreams" and "All Girls Are the Same."'
where not exists (
  select 1 from public.celebrities where name = 'Juice WRLD'
);
