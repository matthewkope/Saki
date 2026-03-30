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
  'Steve Jobs',
  'Business',
  '28',
  'Goat',
  'Pisces',
  2,
  24,
  1955,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Steve_Jobs_%28352583094%29.jpg/960px-Steve_Jobs_%28352583094%29.jpg',
  'Apple co-founder and longtime CEO who helped define the modern personal computer, smartphone, and digital media eras through products like the Macintosh, iPod, iPhone, and iPad.'
where not exists (
  select 1 from public.celebrities where name = 'Steve Jobs'
);

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
  'John Lasseter',
  'Business',
  '8',
  'Monkey',
  'Capricorn',
  1,
  12,
  1957,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/MMG_-_John_Lasseter_-_6378884679.jpg/960px-MMG_-_John_Lasseter_-_6378884679.jpg',
  'Animator, director, and former Pixar and Walt Disney Animation Studios chief creative officer known for helping launch the Toy Story era and shaping modern computer animation.'
where not exists (
  select 1 from public.celebrities where name = 'John Lasseter'
);
