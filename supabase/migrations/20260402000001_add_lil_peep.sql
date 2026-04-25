update public.celebrities
set
  type = 'Musician',
  life_path = '28',
  eastern_zodiac = 'Rat',
  western_zodiac = 'Scorpio',
  month = 11,
  day = 1,
  year = 1996,
  image_url = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Lil_Peep%2C_Toronto%2C_2017.png?width=600',
  description = 'American rapper, singer, and songwriter whose blend of emo, punk, and hip-hop helped define emo rap, with influential releases including "Come Over When You''re Sober" and songs like "Star Shopping" and "Awful Things."'
where name = 'Lil Peep';

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
  'Lil Peep',
  'Musician',
  '28',
  'Rat',
  'Scorpio',
  11,
  1,
  1996,
  'https://commons.wikimedia.org/wiki/Special:Redirect/file/Lil_Peep%2C_Toronto%2C_2017.png?width=600',
  'American rapper, singer, and songwriter whose blend of emo, punk, and hip-hop helped define emo rap, with influential releases including "Come Over When You''re Sober" and songs like "Star Shopping" and "Awful Things."'
where not exists (
  select 1 from public.celebrities where name = 'Lil Peep'
);
