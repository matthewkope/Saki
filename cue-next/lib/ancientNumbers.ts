export const MASTER_NUMBERS = new Set([11, 22, 33]);

type SystemName = 'pythagorean' | 'chaldean';

const PYTHAGOREAN_VALUES: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
  J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
  S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8,
};

const CHALDEAN_VALUES: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export interface AncientLetterDatum {
  ch: string;
  value: number;
  isVowel: boolean;
}

export interface AncientMetricResult {
  rawTotal: number;
  reduced: number;
  letters: AncientLetterDatum[];
}

export interface AncientSystemResult {
  expression: AncientMetricResult;
  soulUrge: AncientMetricResult;
  personality: AncientMetricResult;
}

export interface AncientNumbersResult {
  fullName: string;
  dailyName: string;
  pythagorean: AncientSystemResult;
  chaldean: AncientSystemResult;
}

function reduceNumber(n: number): number {
  while (n > 9 && !MASTER_NUMBERS.has(n)) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return n;
}

function isLetter(ch: string): boolean {
  return /[A-Za-z]/.test(ch);
}

function isVowelLike(letters: string[], index: number): boolean {
  const ch = letters[index];
  const upper = ch.toUpperCase();

  if ('AEIOU'.includes(upper)) return true;
  if (upper !== 'Y') return false;
  if (index === 0) return false;

  const prev = letters[index - 1]?.toUpperCase() ?? '';
  const next = letters[index + 1]?.toUpperCase() ?? '';
  const prevIsClassicVowel = 'AEIOU'.includes(prev);
  const nextIsClassicVowel = 'AEIOU'.includes(next);

  return !prevIsClassicVowel && !nextIsClassicVowel;
}

function metricFromLetters(letters: AncientLetterDatum[]): AncientMetricResult {
  const rawTotal = letters.reduce((sum, letter) => sum + letter.value, 0);
  return {
    rawTotal,
    reduced: rawTotal === 0 ? 0 : reduceNumber(rawTotal),
    letters,
  };
}

function calculateForSystem(name: string, system: SystemName): AncientSystemResult {
  const source = system === 'pythagorean' ? PYTHAGOREAN_VALUES : CHALDEAN_VALUES;
  const letters = name
    .split('')
    .filter(isLetter)
    .map((ch) => ch.toUpperCase());

  const letterData: AncientLetterDatum[] = letters
    .map((ch, index) => {
      const value = source[ch];
      if (!value) return null;
      return {
        ch,
        value,
        isVowel: isVowelLike(letters, index),
      };
    })
    .filter((item): item is AncientLetterDatum => item !== null);

  return {
    expression: metricFromLetters(letterData),
    soulUrge: metricFromLetters(letterData.filter((letter) => letter.isVowel)),
    personality: metricFromLetters(letterData.filter((letter) => !letter.isVowel)),
  };
}

function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

export function calculateAncientNumbers(fullName: string, dailyName: string): AncientNumbersResult | null {
  const cleanedFullName = cleanName(fullName);
  const cleanedDailyName = cleanName(dailyName);

  const fullLetters = cleanedFullName.replace(/[^A-Za-z]/g, '');
  const dailyLetters = cleanedDailyName.replace(/[^A-Za-z]/g, '');
  if (!fullLetters || !dailyLetters) return null;

  return {
    fullName: cleanedFullName,
    dailyName: cleanedDailyName,
    pythagorean: calculateForSystem(cleanedFullName, 'pythagorean'),
    chaldean: calculateForSystem(cleanedDailyName, 'chaldean'),
  };
}
