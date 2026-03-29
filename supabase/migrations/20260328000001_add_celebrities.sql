-- Add month/day/year columns if not present
ALTER TABLE public.celebrities
  ADD COLUMN IF NOT EXISTS month int,
  ADD COLUMN IF NOT EXISTS day   int,
  ADD COLUMN IF NOT EXISTS year  int;

-- Michael Jordan
INSERT INTO public.celebrities (name, life_path, eastern_zodiac, western_zodiac, month, day, year, image_url, description)
VALUES (
  'Michael Jordan',
  '28',
  'Ox',
  'Aquarius',
  2, 17, 1963,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Michael_Jordan_in_2014.jpg/440px-Michael_Jordan_in_2014.jpg',
  'Widely regarded as the greatest basketball player of all time. Six-time NBA champion with the Chicago Bulls, five-time MVP, and two-time Olympic gold medalist. Known for his fierce competitive drive and unmatched work ethic.'
)
ON CONFLICT DO NOTHING;

-- Conan O'Brien
INSERT INTO public.celebrities (name, life_path, eastern_zodiac, western_zodiac, month, day, year, image_url, description)
VALUES (
  'Conan O''Brien',
  '5',
  'Cat',
  'Aries',
  4, 18, 1963,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Conan_O%27Brien_at_the_2025_Sundance_Film_Festival_03_%28cropped%29.jpg/250px-Conan_O%27Brien_at_the_2025_Sundance_Film_Festival_03_%28cropped%29.jpg',
  'Emmy-winning late night host, writer, and comedian. Known for hosting Late Night, The Tonight Show, and Conan. Harvard graduate and former Simpsons writer. Hosts the Conan O''Brien Needs a Friend podcast.'
)
ON CONFLICT DO NOTHING;
