// ============================================================
// LETTEROLOGY CALCULATION ENGINE
// ============================================================

export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);
export const MASTERS = new Set([11, 22, 33]);

/**
 * Returns the numeric value of a letter.
 * caseSensitive=false + mode 'lower': a=1..z=26
 * caseSensitive=false + mode 'upper': A=27..Z=52
 * caseSensitive=true: uppercase→27-52, lowercase→1-26
 */
export function letterValue(
  ch: string,
  caseSensitive: boolean,
  currentCase: 'lower' | 'upper' = 'lower'
): number | null {
  const lower = ch.toLowerCase();
  const idx = lower.charCodeAt(0) - 97; // 0-25
  if (idx < 0 || idx > 25) return null;
  if (caseSensitive) {
    return ch === ch.toUpperCase() && ch !== ch.toLowerCase() ? idx + 27 : idx + 1;
  }
  return currentCase === 'lower' ? idx + 1 : idx + 27;
}

export function reduce(n: number): number {
  while (n > 9 && !MASTERS.has(n)) {
    n = String(n)
      .split('')
      .reduce((s, d) => s + parseInt(d), 0);
  }
  return n;
}

function digitSumLetterology(n: number): number {
  return String(n)
    .split('')
    .reduce((s, d) => s + parseInt(d), 0);
}

export interface LetterDatum {
  ch: string;
  raw: number;
  red: number;
  isVowel: boolean;
}

export interface CalcResult {
  letterData: LetterDatum[];
  reducedSum: number;
  reducedFinal: number;
  nonReducedSum: number;
  nonReducedFinal: number;
  finalVal: number;
  totalReduced: number;
  firstLetter: LetterDatum;
  firstVowel: LetterDatum | null;
  vowelRawSum: number;
  vowelSumReduced: number;
}

export function calculate(
  word: string,
  caseSensitive: boolean,
  currentCase: 'lower' | 'upper' = 'lower'
): CalcResult | null {
  const letters = word.split('').filter((c) => /[a-zA-Z]/.test(c));
  if (letters.length === 0) return null;

  const letterData: LetterDatum[] = letters.map((ch) => {
    const raw = letterValue(ch, caseSensitive, currentCase) ?? 0;
    const red = reduce(raw);
    return { ch, raw, red, isVowel: VOWELS.has(ch.toLowerCase()) };
  });

  const reducedSum = letterData.reduce((s, d) => s + d.red, 0);
  const reducedFinal = reduce(reducedSum);

  const nonReducedSum = letterData.reduce((s, d) => s + d.raw, 0);
  const nonReducedFinal = reduce(nonReducedSum);

  const finalVal = reducedFinal;
  const totalReduced = reduce(reducedSum);

  const firstLetter = letterData[0];
  const firstVowel = letterData.find((d) => d.isVowel) ?? null;

  const vowelLetters = letterData.filter((d) => d.isVowel);
  const vowelRawSum = vowelLetters.reduce((s, d) => s + d.raw, 0);
  const vowelSumReduced = reduce(vowelRawSum);

  return {
    letterData,
    reducedSum,
    reducedFinal,
    nonReducedSum,
    nonReducedFinal,
    finalVal,
    totalReduced,
    firstLetter,
    firstVowel,
    vowelRawSum,
    vowelSumReduced,
  };
}
