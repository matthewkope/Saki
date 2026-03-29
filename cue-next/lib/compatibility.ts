import { calcLP, calcSLP } from '@/lib/numerology';
import { getEasternAnimalWithIndex, getWesternSignWithIndex } from '@/lib/astrology';

export const LP_COMPAT: Record<number, Record<number, number>> = {
  1:{1:76,3:53,4:48,5:51,6:53,7:79,8:65,9:14,11:79,22:59,28:66,33:50},
  3:{1:53,3:66,4:17,5:83,6:66,7:51,8:80,9:52,11:66,22:17,28:53,33:66},
  4:{1:48,3:17,4:69,5:25,6:65,7:68,8:75,9:48,11:57,22:70,28:62,33:76},
  5:{1:51,3:83,4:25,5:52,6:80,7:81,8:66,9:66,11:52,22:24,28:55,33:17},
  6:{1:53,3:66,4:65,5:80,6:59,7:36,8:80,9:10,11:59,22:65,28:53,33:59},
  7:{1:79,3:51,4:68,5:81,6:36,7:60,8:18,9:43,11:81,22:69,28:83,33:24},
  8:{1:65,3:80,4:75,5:66,6:80,7:18,8:31,9:52,11:52,22:66,28:69,33:66},
  9:{1:14,3:52,4:48,5:66,6:10,7:43,8:52,9:45,11:17,22:66,28:18,33:66},
  11:{1:79,3:66,4:57,5:52,6:59,7:81,8:52,9:17,11:59,22:59,28:83,33:52},
  22:{1:59,3:17,4:70,5:24,6:65,7:69,8:66,9:66,11:59,22:70,28:63,33:80},
  28:{1:66,3:53,4:62,5:55,6:53,7:83,8:69,9:18,11:83,22:63,28:70,33:53},
  33:{1:50,3:66,4:76,5:17,6:59,7:24,8:66,9:66,11:52,22:80,28:53,33:52},
};

export const SLP_COMPAT: Record<number, Record<number, number>> = {
  1:{1:1.85,2:0.49,3:0.13,4:-1.10,5:-4.28,6:-4.81,7:2.08,8:0.49,9:-2.60,11:3.31,22:1.37,28:3.92},
  2:{1:0.49,2:0.87,3:1.72,4:-1.10,5:-1.10,6:3.93,7:2.08,8:-1.10,9:-3.22,11:0.75,22:0.76,28:3.92},
  3:{1:0.13,2:1.72,3:2.38,4:-3.18,5:3.93,6:2.38,7:0.79,8:0.75,9:0.95,11:2.34,22:0.75,28:0.79},
  4:{1:-1.10,2:-1.10,3:-3.18,4:2.38,5:1.73,6:3.97,7:0.79,8:3.31,9:2.44,11:-6.65,22:0.75,28:0.79},
  5:{1:-4.28,2:-1.10,3:3.93,4:1.73,5:0.87,6:-3.22,7:1.73,8:1.73,9:2.35,11:0.75,22:-2.42,28:-1.81},
  6:{1:-4.81,2:3.93,3:2.38,4:3.97,5:-3.22,6:0.79,7:-2.39,8:2.34,9:2.22,11:0.75,22:2.34,28:0.79},
  7:{1:2.08,2:2.08,3:0.79,4:0.79,5:1.73,6:-2.39,7:1.59,8:-5.69,9:-2.39,11:3.93,22:2.34,28:0.79},
  8:{1:0.49,2:-1.10,3:0.75,4:3.31,5:1.73,6:2.34,7:-5.69,8:-2.31,9:0.76,11:0.76,22:3.94,28:0.14},
  9:{1:-2.60,2:-3.22,3:0.95,4:2.44,5:2.35,6:2.22,7:-2.39,8:0.76,9:0.00,11:-3.22,22:0.75,28:-3.02},
  11:{1:3.31,2:0.75,3:2.34,4:-6.65,5:0.75,6:0.75,7:3.93,8:0.76,9:-3.22,11:1.66,22:1.55,28:4.25},
  22:{1:1.37,2:0.76,3:0.75,4:0.75,5:-2.42,6:2.34,7:2.34,8:3.94,9:0.75,11:1.55,22:1.55,28:0.75},
  28:{1:3.92,2:3.92,3:0.79,4:0.79,5:-1.81,6:0.79,7:0.79,8:0.14,9:-3.02,11:4.25,22:0.75,28:2.38},
};

export const EAST_TRIADS: string[][] = [
  ['Rat', 'Dragon', 'Monkey'],
  ['Ox', 'Snake', 'Rooster'],
  ['Tiger', 'Horse', 'Dog'],
  ['Cat', 'Goat', 'Pig'],
];

export const EAST_ENEMIES: Record<string, string> = {
  Rat: 'Horse', Horse: 'Rat',
  Ox: 'Goat', Goat: 'Ox',
  Tiger: 'Monkey', Monkey: 'Tiger',
  Cat: 'Rooster', Rooster: 'Cat',
  Dragon: 'Dog', Dog: 'Dragon',
  Snake: 'Pig', Pig: 'Snake',
};

export function getEastRelation(a1: string, a2: string): 'friendly' | 'neutral' | 'enemy' {
  if (a1 === a2) return 'friendly';
  if (EAST_ENEMIES[a1] === a2) return 'enemy';
  if (EAST_TRIADS.some(t => t.includes(a1) && t.includes(a2))) return 'friendly';
  return 'neutral';
}

export function getScoreRelation(score: number): 'friendly' | 'neutral' | 'enemy' {
  if (score >= 80) return 'friendly';
  if (score >= 60) return 'neutral';
  return 'enemy';
}

export const EAST_COMPAT: number[][] = [
  [70,105,60,50,80,70,10,60,80,60,60,60],
  [105,70,60,60,60,80,60,10,60,80,60,60],
  [60,60,100,70,60,60,80,60,10,60,80,80],
  [50,60,70,100,70,70,60,80,60,10,70,80],
  [80,60,60,70,80,80,60,50,100,60,10,60],
  [70,80,60,70,80,80,70,70,60,100,70,10],
  [10,60,80,60,60,70,80,100,60,60,100,60],
  [60,10,60,80,50,70,100,80,60,60,60,100],
  [80,60,10,60,100,60,60,60,80,60,60,60],
  [60,80,60,10,60,100,60,60,60,80,60,60],
  [60,60,80,70,10,70,100,60,60,60,80,60],
  [60,60,80,80,60,10,60,100,60,60,100,80],
];

export const WEST_COMPAT: number[][] = [
  [80,60,80,60,100,60,10,60,100,60,80,60],
  [60,80,60,60,60,100,60,10,60,100,60,80],
  [80,60,80,60,80,60,100,60,10,60,100,60],
  [60,60,60,80,60,60,60,100,60,10,60,100],
  [100,60,80,60,80,60,60,60,100,60,10,60],
  [60,100,60,60,60,80,60,60,60,100,60,10],
  [10,60,100,60,60,60,80,60,100,60,100,60],
  [60,10,60,100,60,60,60,80,60,100,60,100],
  [100,60,10,60,100,60,100,60,80,80,80,60],
  [60,100,60,10,60,100,60,100,80,80,80,80],
  [80,60,100,60,10,60,100,60,80,80,80,60],
  [60,80,60,100,60,10,60,100,60,80,60,80],
];

export interface PersonDate { month: number; day: number; year: number; }

export interface ScoreResult {
  score: number;
  lp1: ReturnType<typeof calcLP>;
  lp2: ReturnType<typeof calcLP>;
  slp1: number; slp2: number;
  east1: { animal: string; index: number };
  east2: { animal: string; index: number };
  west1: { sign: string; index: number };
  west2: { sign: string; index: number };
  lpPct: number; eastPct: number; westPct: number; slpAdj: number;
  lpContrib: number; eastContrib: number; westContrib: number;
}

export function calcScore(d1: PersonDate, d2: PersonDate): ScoreResult {
  const lp1 = calcLP(d1.month, d1.day, d1.year);
  const lp2 = calcLP(d2.month, d2.day, d2.year);
  const slp1 = calcSLP(d1.day);
  const slp2 = calcSLP(d2.day);
  const east1 = getEasternAnimalWithIndex(d1.month, d1.day, d1.year);
  const east2 = getEasternAnimalWithIndex(d2.month, d2.day, d2.year);
  const west1 = getWesternSignWithIndex(d1.month, d1.day);
  const west2 = getWesternSignWithIndex(d2.month, d2.day);

  const compatLP1 = lp1.lp;
  const compatLP2 = lp2.lp;
  const lpPct = LP_COMPAT[compatLP1]?.[compatLP2] ?? 50;
  const eastPct = EAST_COMPAT[east1.index][east2.index];
  const westPct = WEST_COMPAT[west1.index][west2.index];
  const slpAdj = SLP_COMPAT[slp1]?.[slp2] ?? 0;

  const lpContrib = 0.618 * lpPct;
  const eastContrib = 0.495 * eastPct;
  const westContrib = 0.053 * westPct;
  const score = lpContrib + eastContrib + westContrib - 12.81 + slpAdj;

  return {
    score: Math.round(score * 100) / 100,
    lp1, lp2, slp1, slp2, east1, east2, west1, west2,
    lpPct, eastPct, westPct, slpAdj, lpContrib, eastContrib, westContrib,
  };
}
