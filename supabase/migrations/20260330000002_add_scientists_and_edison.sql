update public.celebrities
set
  type = 'Scientist',
  life_path = '33/6',
  eastern_zodiac = 'Cat',
  western_zodiac = 'Pisces',
  month = 3,
  day = 14,
  year = 1879,
  image_url = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Einstein.jpg?width=600',
  description = 'Theoretical physicist whose work transformed modern physics, especially through special relativity, general relativity, and foundational contributions to quantum theory.'
where name = 'Albert Einstein';

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
  'Albert Einstein',
  'Scientist',
  '33/6',
  'Cat',
  'Pisces',
  3,
  14,
  1879,
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/Einstein.jpg?width=600',
  'Theoretical physicist whose work transformed modern physics, especially through special relativity, general relativity, and foundational contributions to quantum theory.'
where not exists (
  select 1 from public.celebrities where name = 'Albert Einstein'
);

update public.celebrities
set
  type = 'Scientist',
  life_path = '1',
  eastern_zodiac = 'Horse',
  western_zodiac = 'Capricorn',
  month = 1,
  day = 4,
  year = 1643,
  image_url = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/GodfreyKneller-IsaacNewton-1689%20%28cropped%29.jpg?width=600',
  description = 'Mathematician, physicist, and natural philosopher whose laws of motion and universal gravitation became pillars of classical physics.'
where name = 'Isaac Newton';

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
  'Isaac Newton',
  'Scientist',
  '1',
  'Horse',
  'Capricorn',
  1,
  4,
  1643,
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/GodfreyKneller-IsaacNewton-1689%20%28cropped%29.jpg?width=600',
  'Mathematician, physicist, and natural philosopher whose laws of motion and universal gravitation became pillars of classical physics.'
where not exists (
  select 1 from public.celebrities where name = 'Isaac Newton'
);

update public.celebrities
set
  type = 'Business',
  life_path = '33/6',
  eastern_zodiac = 'Goat',
  western_zodiac = 'Aquarius',
  month = 2,
  day = 11,
  year = 1847,
  image_url = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Thomas_Edison_c1882.jpg?width=600',
  description = 'Inventor and entrepreneur who built major industrial research and electric power businesses while helping popularize technologies like the phonograph and practical electric lighting.'
where name = 'Thomas Edison';

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
  'Thomas Edison',
  'Business',
  '33/6',
  'Goat',
  'Aquarius',
  2,
  11,
  1847,
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/Thomas_Edison_c1882.jpg?width=600',
  'Inventor and entrepreneur who built major industrial research and electric power businesses while helping popularize technologies like the phonograph and practical electric lighting.'
where not exists (
  select 1 from public.celebrities where name = 'Thomas Edison'
);
