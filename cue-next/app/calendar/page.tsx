'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { calcLP, calcSLP } from '@/lib/numerology';
import { calcScore, getScoreRelation } from '@/lib/compatibility';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { useIntermediaryNumbers, fmtLP, fmtLPStr } from '@/lib/useIntermediaryNumbers';

// ============================================================
// CONSTANTS
// ============================================================
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const FULL_MOON_REF_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
const LUNAR_CYCLE = 29.530588853;

function isFullMoon(year: number, month: number, day: number): boolean {
  const checkMs = Date.UTC(year, month - 1, day, 12, 0, 0);
  const daysSinceRef = (checkMs - FULL_MOON_REF_MS) / 86400000;
  const phase = ((daysSinceRef % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  const diff = Math.abs(phase - 14.765);
  return diff < 0.8 || diff > (LUNAR_CYCLE - 0.8);
}

function isMasterLP(lp: number): boolean {
  return [11, 22, 28, 33].includes(lp);
}

// ============================================================
// TYPES
// ============================================================
interface SelDate { day: number; month: number; year: number; }
interface PersonDate { month: number; day: number; year: number; }

function formatShortDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================
// COMPONENT
// ============================================================
export default function CalendarPage() {
  const { session, loading: authLoading } = useAuth();
  const now = new Date();
  const todayDay = now.getDate();
  const todayMonth = now.getMonth() + 1;
  const todayYear = now.getFullYear();

  const [viewYear, setViewYear] = useState(todayYear);
  const [viewMonth, setViewMonth] = useState(todayMonth);
  const [showNumerology, setShowNumerology] = useState(true);
  const [sel, setSel] = useState<SelDate>({ day: todayDay, month: todayMonth, year: todayYear });
  const [userBirth, setUserBirth] = useState<PersonDate | null>(null);
  const [showIntermediary] = useIntermediaryNumbers();

  useEffect(() => {
    if (authLoading) return;
    if (!session) {
      setUserBirth(null);
      return;
    }
    supabase
      .from('profiles')
      .select('birth_month, birth_day, birth_year')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data?.birth_month && data?.birth_day && data?.birth_year) {
          setUserBirth({
            month: data.birth_month,
            day: data.birth_day,
            year: data.birth_year,
          });
        }
      });
  }, [session, authLoading]);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 1) { setViewYear((y) => y - 1); return 12; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 12) { setViewYear((y) => y + 1); return 1; }
      return m + 1;
    });
  }, []);

  const goToday = useCallback(() => {
    setViewYear(todayYear);
    setViewMonth(todayMonth);
    setSel({ day: todayDay, month: todayMonth, year: todayYear });
  }, [todayDay, todayMonth, todayYear]);

  // Build calendar grid
  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Detail card
  const { lp: selLp, display: selDisplay } = calcLP(sel.month, sel.day, sel.year);
  const selSlp = calcSLP(sel.day);
  const selMaster = isMasterLP(selLp);
  const selMoon = isFullMoon(sel.year, sel.month, sel.day);
  const selDow = DAY_NAMES[new Date(sel.year, sel.month - 1, sel.day).getDay()];
  const selIsToday = sel.day === todayDay && sel.month === todayMonth && sel.year === todayYear;
  const selLpColor = selIsToday ? 'accent' : selMaster ? 'gold' : 'accent';
  const forecast = useMemo(() => {
    if (!userBirth) return [];

    return Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(sel.year, sel.month - 1, sel.day + offset);
      const calendarDate = {
        month: date.getMonth() + 1,
        day: date.getDate(),
        year: date.getFullYear(),
      };
      const result = calcScore(userBirth, calendarDate);
      const relation = getScoreRelation(result.score);

      return {
        key: date.toISOString(),
        label: offset === 0 ? 'Selected Day' : `Day ${offset + 1}`,
        shortDate: formatShortDateLabel(date),
        dow: DAY_NAMES[date.getDay()],
        relation,
        score: Math.round(result.score),
        lpDisplay: result.lp2.display,
        slp: result.slp2,
      };
    });
  }, [sel.day, sel.month, sel.year, userBirth]);

  return (
    <div className="page">
      {/* Calendar header */}
      <div className="cal-header">
        <button className="cal-nav-btn" onClick={prevMonth}>&#8249;</button>
        <div style={{ textAlign: 'center' }}>
          <span className="cal-month-year">{viewYear}</span>
          <span className="cal-month-title">{MONTH_NAMES[viewMonth - 1]}</span>
        </div>
        <button className="cal-nav-btn" onClick={nextMonth}>&#8250;</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '-16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button className="today-btn" onClick={goToday}>Today</button>
        <div className="view-toggle">
          <button
            className={`toggle-opt${showNumerology ? ' active' : ''}`}
            onClick={() => setShowNumerology(true)}
          >Numerology</button>
          <button
            className={`toggle-opt${!showNumerology ? ' active' : ''}`}
            onClick={() => setShowNumerology(false)}
          >Standard</button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="cal-weekdays">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="cal-weekday">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="cal-grid">
        {/* Empty cells */}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={'e' + i} className="cal-day empty" />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
          const { lp, display } = calcLP(viewMonth, d, viewYear);
          const slp = calcSLP(d);
          const master = isMasterLP(lp);
          const moon = isFullMoon(viewYear, viewMonth, d);
          const isToday = d === todayDay && viewMonth === todayMonth && viewYear === todayYear;
          const isSelected = d === sel.day && viewMonth === sel.month && viewYear === sel.year;

          const cls = [
            'cal-day',
            !showNumerology ? 'standard-view' : '',
            isToday ? 'today' : '',
            master ? 'master' : '',
            !showNumerology && moon ? 'has-moon' : '',
            isSelected ? 'selected' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={d}
              className={cls}
              style={{ cursor: 'pointer' }}
              onClick={() => setSel({ day: d, month: viewMonth, year: viewYear })}
            >
              {showNumerology ? (
                <>
                  <div className="cell-top">
                    <span className="cell-day-num">{d}</span>
                    <span className="cell-indicators">
                      {master && <span className="cell-star">★</span>}
                      {moon && <span className="cell-moon">🌕</span>}
                    </span>
                  </div>
                  <div className="cell-lp">{fmtLP(lp, display, showIntermediary)}</div>
                  <div className="cell-slp">SLP <span>{String(slp)}</span></div>
                </>
              ) : (
                <>
                  <div className="cell-top">
                    <span className="cell-indicators">
                      {master && <span className="cell-star">★</span>}
                      {moon && <span className="cell-moon">🌕</span>}
                    </span>
                  </div>
                  <div className="cell-lp">{d}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-swatch today-swatch" />
          Today
        </div>
        <div className="legend-item">
          <div className="legend-swatch master-swatch" />
          Master number day
        </div>
        <div className="legend-item">
          <span style={{ fontSize: '0.9rem' }}>★</span>
          Master LP
        </div>
        <div className="legend-item">
          <span style={{ fontSize: '0.9rem' }}>🌕</span>
          Full moon
        </div>
        <div className="legend-item" style={{ marginLeft: 'auto' }}>
          <span style={{ color: 'var(--accent)', fontFamily: "'Instrument Serif',serif", fontSize: '1rem' }}>22</span>
          &nbsp;= Universal Day LP
        </div>
        <div className="legend-item">
          <span style={{ color: 'var(--teal)', fontSize: '0.75rem', fontWeight: 600 }}>SLP 4</span>
          &nbsp;= Secondary LP
        </div>
      </div>

      {/* Date detail card */}
      <div className="date-detail">
        <div className="detail-header">
          <span className="detail-date-label">
            {selDow}, {MONTH_NAMES[sel.month - 1]} {sel.day}, {sel.year}
          </span>
          <div className="detail-badges">
            {selMaster && <span className="detail-badge master-badge">★ Master</span>}
            {selMoon && <span className="detail-badge moon-badge">🌕 Full Moon</span>}
          </div>
        </div>
        <div className="detail-rows">
          <div className="detail-row">
            <span className="detail-key">Universal Day LP</span>
            <span className={`detail-val ${selLpColor}`}>{fmtLP(selLp, selDisplay, showIntermediary)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Secondary LP</span>
            <span className="detail-val teal">{selSlp}</span>
          </div>
        </div>
      </div>

      <div className="date-detail forecast-detail">
        <div className="detail-header forecast-header">
          <div>
            <span className="detail-date-label">Compatibility Forecast</span>
            <div className="forecast-subtitle">
              7-day outlook using your profile birthday first and the calendar date second.
            </div>
          </div>
        </div>
        {!userBirth ? (
          <div className="forecast-empty">
            Add your birthday in Profile to unlock this compatibility forecast.
          </div>
        ) : (
          <div className="forecast-list">
            {forecast.map((item) => (
              <div key={item.key} className="forecast-row">
                <div className="forecast-day">
                  <div className="forecast-label">{item.label}</div>
                  <div className="forecast-date">{item.dow}, {item.shortDate}</div>
                </div>
                <div className="forecast-meta">
                  <div className={`forecast-pill ${item.relation}`}>{item.relation}</div>
                  <div className="forecast-score">{item.score}%</div>
                  <div className="forecast-numbers">LP {fmtLPStr(item.lpDisplay, showIntermediary)} · SLP {item.slp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
