// ============================================================
// NUMEROLOGY CALCULATION ENGINE
// ============================================================

export function digitSum(n: number): number {
  return String(n)
    .split('')
    .reduce((s, c) => s + parseInt(c), 0);
}

export function reduceToLP(n: number): number {
  while (n > 9 && ![11, 22, 28, 33].includes(n)) {
    n = digitSum(n);
  }
  return n;
}

export interface LPResult {
  lp: number;
  raw: number;
  display: string;
  karmic13: boolean;
  pure33: boolean;
}

export function calcLP(month: number, day: number, year: number): LPResult {
  let raw = 0;
  if (month === 11) raw += 11;
  else raw += digitSum(month);
  if (day === 11 || day === 22) raw += day;
  else raw += digitSum(day);
  raw += digitSum(year);

  let lp = reduceToLP(raw);
  if (lp === 2) lp = 11;

  const karmic13 = raw === 13;
  const pure33 = lp === 33 && month <= 9 && day <= 9;

  let display: string;
  if (karmic13) {
    display = '13/4';
  } else if (lp === 28) {
    display = '28/1';
  } else if (lp === 33) {
    display = pure33 ? '33' : '33/6';
  } else if (raw !== lp) {
    display = String(lp) + '/' + String(raw);
  } else {
    display = String(lp);
  }

  return { lp, raw, display, karmic13, pure33 };
}

export function calcSLP(day: number): number {
  if (day === 2) return 2;
  if (day === 11 || day === 22 || day === 28) return day;
  let n = day;
  while (n > 9) n = digitSum(n);
  if (n === 2) return 11;
  return n;
}

export interface PersonalYearResult {
  py: number;
  raw: number;
  display: string;
}

export function calcPersonalYear(month: number, day: number): PersonalYearResult {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const cd = now.getDate();
  // Use current year if birthday has passed this year, otherwise last year
  const pyYear = cm > month || (cm === month && cd >= day) ? cy : cy - 1;

  // Sum: month (raw, keep 11 as 11) + day + individual digits of pyYear
  const mVal = month === 11 ? 11 : month;
  const yearDigitSum = String(pyYear)
    .split('')
    .reduce((s, c) => s + parseInt(c), 0);
  const raw = mVal + day + yearDigitSum;

  let py = raw;
  while (py > 9 && ![11, 22, 33].includes(py)) {
    py = digitSum(py);
  }
  if (py === 2) py = 11;

  const display = raw !== py ? String(py) + '/' + String(raw) : String(py);
  return { py, raw, display };
}

export function calcLuckyNumber(month: number, day: number, year: number): number {
  const firstDigit = parseInt(String(month)[0]);
  // Last non-zero digit of year (e.g. 2000 → 2, not 0)
  const yearStr = String(year);
  let lastDigit = 0;
  for (let i = yearStr.length - 1; i >= 0; i--) {
    if (yearStr[i] !== '0') {
      lastDigit = parseInt(yearStr[i]);
      break;
    }
  }
  const combined = parseInt(String(firstDigit) + String(lastDigit));

  // Step 1: any combined number is valid except 19
  if (combined !== 19) return combined;

  // Step 2: combined is 19 → use birth day, unless it is also 19
  if (day !== 19) return day;

  // Step 3: birth day is also 19 → reduce birth year digits
  const MASTERS = [11, 22, 28, 33];
  let n = yearStr.split('').reduce((s, c) => s + parseInt(c), 0);
  while (n > 9 && !MASTERS.includes(n)) n = digitSum(n);
  return n;
}
