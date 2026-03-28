// ============================================================
// ASTROLOGY — Eastern & Western
// ============================================================

export const LUNAR_NY: Record<number, [number, number]> = {
  1920:[2,20],1921:[2,8],1922:[1,28],1923:[2,16],1924:[2,5],1925:[1,24],1926:[2,13],1927:[2,2],1928:[1,23],1929:[2,10],
  1930:[1,30],1931:[2,17],1932:[2,6],1933:[1,26],1934:[2,14],1935:[2,4],1936:[1,24],1937:[2,11],1938:[1,31],1939:[2,19],
  1940:[2,8],1941:[1,27],1942:[2,15],1943:[2,5],1944:[1,25],1945:[2,13],1946:[2,2],1947:[1,22],1948:[2,10],1949:[1,29],
  1950:[2,17],1951:[2,6],1952:[1,27],1953:[2,14],1954:[2,3],1955:[1,24],1956:[2,12],1957:[1,31],1958:[2,18],1959:[2,8],
  1960:[1,28],1961:[2,15],1962:[2,5],1963:[1,25],1964:[2,13],1965:[2,2],1966:[1,21],1967:[2,9],1968:[1,30],1969:[2,17],
  1970:[2,6],1971:[1,27],1972:[2,15],1973:[2,3],1974:[1,23],1975:[2,11],1976:[1,31],1977:[2,18],1978:[2,7],1979:[1,28],
  1980:[2,16],1981:[2,5],1982:[1,25],1983:[2,13],1984:[2,2],1985:[2,20],1986:[2,9],1987:[1,29],1988:[2,17],1989:[2,6],
  1990:[1,27],1991:[2,15],1992:[2,4],1993:[1,23],1994:[2,10],1995:[1,31],1996:[2,19],1997:[2,7],1998:[1,28],1999:[2,16],
  2000:[2,5],2001:[1,24],2002:[2,12],2003:[2,1],2004:[1,22],2005:[2,9],2006:[1,29],2007:[2,18],2008:[2,7],2009:[1,26],
  2010:[2,14],2011:[2,3],2012:[1,23],2013:[2,10],2014:[1,31],2015:[2,19],2016:[2,8],2017:[1,28],2018:[2,16],2019:[2,5],
  2020:[1,25],2021:[2,12],2022:[2,1],2023:[1,22],2024:[2,10],2025:[1,29],2026:[2,17],2027:[2,6],2028:[1,26],2029:[2,13],
  2030:[2,3],2031:[1,23],2032:[2,11],2033:[1,31],2034:[2,19],2035:[2,8],2036:[1,28],2037:[2,15],2038:[2,4],2039:[1,24],
  2040:[2,12]
};

export const EAST_ANIMALS = [
  'Rat','Ox','Tiger','Cat','Dragon','Snake',
  'Horse','Goat','Monkey','Rooster','Dog','Pig'
] as const;

export type EastAnimal = typeof EAST_ANIMALS[number];

export const ANIMAL_EMOJI: Record<string, string> = {
  Rat: '🐭', Ox: '🐂', Tiger: '🐯', Cat: '🐱', Dragon: '🐉', Snake: '🐍',
  Horse: '🐴', Goat: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐷',
};

export const WEST_EMOJI: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

export function getEasternAnimal(month: number, day: number, year: number): string {
  let effectiveYear = year;
  const lny = LUNAR_NY[year];
  if (lny) {
    const [lm, ld] = lny;
    if (month < lm || (month === lm && day < ld)) effectiveYear = year - 1;
  }
  const idx = ((effectiveYear - 1924) % 12 + 12) % 12;
  return EAST_ANIMALS[idx];
}

export function getEasternAnimalWithIndex(month: number, day: number, year: number): { animal: string; index: number } {
  let effectiveYear = year;
  const lny = LUNAR_NY[year];
  if (lny) {
    const [lm, ld] = lny;
    if (month < lm || (month === lm && day < ld)) effectiveYear = year - 1;
  }
  const idx = ((effectiveYear - 1924) % 12 + 12) % 12;
  return { animal: EAST_ANIMALS[idx], index: idx };
}

export function getWesternSign(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return 'Capricorn';
}

export function getWesternSignWithIndex(month: number, day: number): { sign: string; index: number } {
  const WEST_SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
  const ranges: [number, number, number, number, string, number][] = [
    [3,21,4,19,'Aries',0],[4,20,5,20,'Taurus',1],[5,21,6,20,'Gemini',2],
    [6,21,7,22,'Cancer',3],[7,23,8,22,'Leo',4],[8,23,9,22,'Virgo',5],
    [9,23,10,22,'Libra',6],[10,23,11,21,'Scorpio',7],[11,22,12,21,'Sagittarius',8],
    [1,20,2,18,'Aquarius',10],[2,19,3,20,'Pisces',11]
  ];
  for (const [sm, sd, em, ed, name, idx] of ranges) {
    if ((month === sm && day >= sd) || (month === em && day <= ed)) {
      return { sign: name, index: idx };
    }
  }
  return { sign: 'Capricorn', index: 9 };
}
