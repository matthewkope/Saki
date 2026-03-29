'use client';

import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { calcLP, calcSLP } from '@/lib/numerology';
import { getEasternAnimalWithIndex, getWesternSignWithIndex } from '@/lib/astrology';

// ============================================================
// DATA TABLES
// ============================================================
const LP_COMPAT: Record<number, Record<number, number>> = {
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

const SLP_COMPAT: Record<number, Record<number, number>> = {
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

const EAST_COMPAT: number[][] = [
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

const WEST_COMPAT: number[][] = [
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

// ============================================================
// TYPES
// ============================================================
interface PersonDate { month: number; day: number; year: number; }

interface ScoreResult {
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

// ============================================================
// CALCULATION
// ============================================================
function calcScore(d1: PersonDate, d2: PersonDate): ScoreResult {
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

function getTier(score: number): { label: string; cls: string; color: string } {
  if (score >= 80) return { label: 'Friendly', cls: 'tier-friendly', color: '#60d0c0' };
  if (score >= 60) return { label: 'Neutral', cls: 'tier-neutral', color: '#f0d080' };
  return { label: 'Enemy', cls: 'tier-enemy', color: '#ff6070' };
}

// ============================================================
// DATE INPUT GROUP
// ============================================================
interface DateInputGroupProps {
  label: string;
  mm: string; dd: string; yyyy: string;
  isP2?: boolean;
  mmRef: React.RefObject<HTMLInputElement>;
  ddRef: React.RefObject<HTMLInputElement>;
  yyyyRef: React.RefObject<HTMLInputElement>;
  onMm: (v: string) => void;
  onDd: (v: string) => void;
  onYyyy: (v: string) => void;
  onMmKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onDdKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onYyyyKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function DateInputGroup({ label, mm, dd, yyyy, isP2, mmRef, ddRef, yyyyRef, onMm, onDd, onYyyy, onMmKey, onDdKey, onYyyyKey }: DateInputGroupProps) {
  const p2cls = isP2 ? ' p2' : '';
  return (
    <div className="person-input-group">
      <div className="person-input-label">{label}</div>
      <div className="date-boxes">
        <div className="date-field">
          <label>MM</label>
          <input ref={mmRef} type="text" inputMode="numeric" maxLength={2} placeholder="MM"
            value={mm} className={(mm ? 'filled' : '') + p2cls}
            onChange={(e) => onMm(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onKeyDown={onMmKey}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)} />
        </div>
        <span className="date-sep">/</span>
        <div className="date-field">
          <label>DD</label>
          <input ref={ddRef} type="text" inputMode="numeric" maxLength={2} placeholder="DD"
            value={dd} className={(dd ? 'filled' : '') + p2cls}
            onChange={(e) => onDd(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onKeyDown={onDdKey}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)} />
        </div>
        <span className="date-sep">/</span>
        <div className="date-field year-field">
          <label>YYYY</label>
          <input ref={yyyyRef} type="text" inputMode="numeric" maxLength={4} placeholder="YYYY"
            value={yyyy} className={(yyyy ? 'filled' : '') + p2cls}
            onChange={(e) => onYyyy(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={onYyyyKey}
            onFocus={(e) => setTimeout(() => e.target.select(), 0)} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
function CompatibilityCalc() {
  const params = useSearchParams();
  const [p1mm, setP1mm] = useState(params.get('p1m') || '');
  const [p1dd, setP1dd] = useState(params.get('p1d') || '');
  const [p1yyyy, setP1yyyy] = useState(params.get('p1y') || '');
  const [p2mm, setP2mm] = useState(params.get('p2m') || '');
  const [p2dd, setP2dd] = useState(params.get('p2d') || '');
  const [p2yyyy, setP2yyyy] = useState(params.get('p2y') || '');
  const [result, setResult] = useState<ScoreResult | null>(null);

  const p1mmRef = useRef<HTMLInputElement>(null);
  const p1ddRef = useRef<HTMLInputElement>(null);
  const p1yyyyRef = useRef<HTMLInputElement>(null);
  const p2mmRef = useRef<HTMLInputElement>(null);
  const p2ddRef = useRef<HTMLInputElement>(null);
  const p2yyyyRef = useRef<HTMLInputElement>(null);

  const tryCalc = useCallback((
    mm1: string, dd1: string, yy1: string,
    mm2: string, dd2: string, yy2: string,
  ) => {
    const m1 = parseInt(mm1), d1 = parseInt(dd1), y1 = parseInt(yy1);
    const m2 = parseInt(mm2), d2 = parseInt(dd2), y2 = parseInt(yy2);
    if (isNaN(m1) || isNaN(d1) || isNaN(y1) || isNaN(m2) || isNaN(d2) || isNaN(y2)) {
      setResult(null); return;
    }
    if (m1 < 1 || m1 > 12 || d1 < 1 || d1 > 31 || y1 < 1900 || y1 > 2099) { setResult(null); return; }
    if (m2 < 1 || m2 > 12 || d2 < 1 || d2 > 31 || y2 < 1900 || y2 > 2099) { setResult(null); return; }
    setResult(calcScore({ month: m1, day: d1, year: y1 }, { month: m2, day: d2, year: y2 }));
  }, []);

  function h1mm(v: string) { setP1mm(v); if (v.length === 2) p1ddRef.current?.focus(); tryCalc(v, p1dd, p1yyyy, p2mm, p2dd, p2yyyy); }
  function h1dd(v: string) { setP1dd(v); if (v.length === 2) p1yyyyRef.current?.focus(); tryCalc(p1mm, v, p1yyyy, p2mm, p2dd, p2yyyy); }
  function h1yyyy(v: string) { setP1yyyy(v); if (v.length === 4) p2mmRef.current?.focus(); tryCalc(p1mm, p1dd, v, p2mm, p2dd, p2yyyy); }
  function h2mm(v: string) { setP2mm(v); if (v.length === 2) p2ddRef.current?.focus(); tryCalc(p1mm, p1dd, p1yyyy, v, p2dd, p2yyyy); }
  function h2dd(v: string) { setP2dd(v); if (v.length === 2) p2yyyyRef.current?.focus(); tryCalc(p1mm, p1dd, p1yyyy, p2mm, v, p2yyyy); }
  function h2yyyy(v: string) { setP2yyyy(v); tryCalc(p1mm, p1dd, p1yyyy, p2mm, p2dd, v); }

  useEffect(() => {
    if (p1mm && p1dd && p1yyyy && p2mm && p2dd && p2yyyy)
      tryCalc(p1mm, p1dd, p1yyyy, p2mm, p2dd, p2yyyy);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const circ = 2 * Math.PI * 80;
  const tier = result ? getTier(result.score) : null;
  const clamped = result ? Math.max(0, Math.min(100, result.score)) : 0;
  const offset = circ - (clamped / 100) * circ;

  return (
    <>
      {/* Sticky Input */}
      <div className="input-section">
        <div className="input-inner">
          <div className="app-title" style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.6rem', color: 'var(--accent)', textAlign: 'center', marginBottom: '18px', letterSpacing: '0.02em' }}>
            Cue <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Compatibility</span> Calculator
          </div>
          <div className="date-inputs-row">
            <DateInputGroup
              label="Person 1 — Birthday"
              mm={p1mm} dd={p1dd} yyyy={p1yyyy}
              mmRef={p1mmRef} ddRef={p1ddRef} yyyyRef={p1yyyyRef}
              onMm={h1mm} onDd={h1dd} onYyyy={h1yyyy}
              onMmKey={() => {}}
              onDdKey={(e) => { if (e.key === 'Backspace' && p1dd === '') { e.preventDefault(); p1mmRef.current?.focus(); } }}
              onYyyyKey={(e) => { if (e.key === 'Backspace' && p1yyyy === '') { e.preventDefault(); p1ddRef.current?.focus(); } }}
            />
            <div className="vs-divider"><span>&amp;</span></div>
            <DateInputGroup
              label="Person 2 — Birthday"
              mm={p2mm} dd={p2dd} yyyy={p2yyyy}
              isP2
              mmRef={p2mmRef} ddRef={p2ddRef} yyyyRef={p2yyyyRef}
              onMm={h2mm} onDd={h2dd} onYyyy={h2yyyy}
              onMmKey={(e) => { if (e.key === 'Backspace' && p2mm === '') { e.preventDefault(); p1yyyyRef.current?.focus(); } }}
              onDdKey={(e) => { if (e.key === 'Backspace' && p2dd === '') { e.preventDefault(); p2mmRef.current?.focus(); } }}
              onYyyyKey={(e) => { if (e.key === 'Backspace' && p2yyyy === '') { e.preventDefault(); p2ddRef.current?.focus(); } }}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-section">
        {!result ? (
          <div className="placeholder-msg">Enter two birth dates above to reveal your compatibility reading.</div>
        ) : (
          <>
            {/* Score Ring */}
            <div className="score-container">
              <div className="score-ring-wrap">
                <svg viewBox="0 0 180 180">
                  <circle className="score-ring-bg" cx="90" cy="90" r="80" />
                  <circle
                    className="score-ring-fill"
                    cx="90" cy="90" r="80"
                    stroke={tier!.color}
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                  />
                </svg>
                <div className="score-value">
                  <div className="score-number">{result.score.toFixed(1)}</div>
                  <div className="score-label">compatibility</div>
                </div>
              </div>
              <div className={`score-tier ${tier!.cls}`}>{tier!.label}</div>
            </div>

            {/* Person Cards */}
            <div className="persons-grid">
              {[
                { label: 'Person 1', lp: result.lp1, slp: result.slp1, east: result.east1, west: result.west1 },
                { label: 'Person 2', lp: result.lp2, slp: result.slp2, east: result.east2, west: result.west2 },
              ].map((p) => (
                <div key={p.label} className="person-card">
                  <div className="person-label">{p.label}</div>
                  <div className="person-lp">{p.lp.display}</div>
                  <div className="person-lp-label">Life Path</div>
                  <div className="person-details">
                    <div className="detail-row"><span className="detail-key">Intermediary</span><span className="detail-val">{p.lp.raw}</span></div>
                    <div className="detail-row"><span className="detail-key">SLP</span><span className="detail-val">{p.slp}</span></div>
                    <div className="detail-row"><span className="detail-key">Eastern Zodiac</span><span className="detail-val">{p.east.animal}</span></div>
                    <div className="detail-row"><span className="detail-key">Western Zodiac</span><span className="detail-val">{p.west.sign}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="breakdown">
              <div className="breakdown-title">Score Breakdown</div>
              <div className="breakdown-grid">
                <div className="breakdown-card">
                  <div className="bk-label">Life Path</div>
                  <div className="bk-pair">{result.lp1.display} ↔ {result.lp2.display}</div>
                  <div className="bk-value" style={{ color: 'var(--accent)' }}>{result.lpPct}%</div>
                  <div className="bk-contrib">× 0.618 = {result.lpContrib.toFixed(2)} pts</div>
                </div>
                <div className="breakdown-card">
                  <div className="bk-label">Eastern Zodiac</div>
                  <div className="bk-pair">{result.east1.animal} ↔ {result.east2.animal}</div>
                  <div className="bk-value" style={{ color: 'var(--gold)' }}>{result.eastPct}%</div>
                  <div className="bk-contrib">× 0.495 = {result.eastContrib.toFixed(2)} pts</div>
                </div>
                <div className="breakdown-card">
                  <div className="bk-label">Western Zodiac</div>
                  <div className="bk-pair">{result.west1.sign} ↔ {result.west2.sign}</div>
                  <div className="bk-value" style={{ color: 'var(--teal)' }}>{result.westPct}%</div>
                  <div className="bk-contrib">× 0.053 = {result.westContrib.toFixed(2)} pts</div>
                </div>
                <div className="breakdown-card">
                  <div className="bk-label">SLP Pair</div>
                  <div className="bk-pair">{result.slp1} ↔ {result.slp2}</div>
                  <div className="bk-value" style={{ color: 'var(--rose)' }}>{result.slpAdj >= 0 ? '+' : ''}{result.slpAdj.toFixed(2)}</div>
                  <div className="bk-contrib">direct adjustment</div>
                </div>
              </div>
              <div className="formula-box">
                <span className="highlight">{result.score.toFixed(2)}</span> ={' '}
                0.618 × {result.lpPct} + 0.495 × {result.eastPct} + 0.053 × {result.westPct} − 12.81 + ({result.slpAdj >= 0 ? '+' : ''}{result.slpAdj.toFixed(2)})<br />
                &nbsp;&nbsp;&nbsp;&nbsp;= {result.lpContrib.toFixed(2)} + {result.eastContrib.toFixed(2)} + {result.westContrib.toFixed(2)} − 12.81 + ({result.slpAdj >= 0 ? '+' : ''}{result.slpAdj.toFixed(2)})
              </div>
            </div>

            {/* Tier Legend */}
            <div className="tier-legend">
              <div className="tier-legend-title">Score Tiers</div>
              <div className="tier-legend-items">
                <div className="tier-legend-item">
                  <div className="tier-dot friendly" />
                  <span className="tier-legend-label">Friendly</span>
                  <span className="tier-legend-range">80 – 100%</span>
                </div>
                <div className="tier-legend-item">
                  <div className="tier-dot neutral" />
                  <span className="tier-legend-label">Neutral</span>
                  <span className="tier-legend-range">60 – 79%</span>
                </div>
                <div className="tier-legend-item">
                  <div className="tier-dot enemy" />
                  <span className="tier-legend-label">Enemy</span>
                  <span className="tier-legend-range">0 – 59%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense>
      <CompatibilityCalc />
    </Suspense>
  );
}
