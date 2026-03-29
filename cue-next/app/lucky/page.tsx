'use client';

import { useState, useRef } from 'react';
import { digitSum } from '@/lib/numerology';

interface CalcBreakdown {
  lucky: number;
  firstMonthDigit: number;
  lastYearDigit: number;
  combined: number;
  usedFallback: 'day' | 'year' | null;
  day: number;
  yearReduced: number | null;
}

function getLuckyBreakdown(month: number, day: number, year: number): CalcBreakdown {
  const firstMonthDigit = parseInt(String(month)[0]);
  const yearStr = String(year);
  let lastYearDigit = 0;
  for (let i = yearStr.length - 1; i >= 0; i--) {
    if (yearStr[i] !== '0') { lastYearDigit = parseInt(yearStr[i]); break; }
  }
  const combined = parseInt(String(firstMonthDigit) + String(lastYearDigit));

  if (combined !== 19) {
    return { lucky: combined, firstMonthDigit, lastYearDigit, combined, usedFallback: null, day, yearReduced: null };
  }
  if (day !== 19) {
    return { lucky: day, firstMonthDigit, lastYearDigit, combined, usedFallback: 'day', day, yearReduced: null };
  }
  const MASTERS = [11, 22, 28, 33];
  let n = yearStr.split('').reduce((s, c) => s + parseInt(c), 0);
  while (n > 9 && !MASTERS.includes(n)) n = digitSum(n);
  return { lucky: n, firstMonthDigit, lastYearDigit, combined, usedFallback: 'year', day, yearReduced: n };
}

function ReadingChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: `${color}14`, border: `1px solid ${color}33`,
      borderRadius: '12px', padding: '12px 18px', textAlign: 'center', minWidth: '90px',
    }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

export default function LuckyNumberPage() {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [breakdown, setBreakdown] = useState<CalcBreakdown | null>(null);

  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  function handleField(key: 'month' | 'day' | 'year', val: string) {
    const clean = val.replace(/\D/g, '');
    const maxLen = key === 'year' ? 4 : 2;
    const trimmed = clean.slice(0, maxLen);

    const next = { month, day, year, [key]: trimmed };
    if (key === 'month') setMonth(trimmed);
    if (key === 'day') setDay(trimmed);
    if (key === 'year') setYear(trimmed);

    const m = parseInt(next.month), d = parseInt(next.day), y = parseInt(next.year);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && next.year.length === 4 && y > 1900) {
      setBreakdown(getLuckyBreakdown(m, d, y));
    } else {
      setBreakdown(null);
    }

    if (key === 'month' && trimmed.length === 2) dayRef.current?.focus();
    if (key === 'day' && trimmed.length === 2) yearRef.current?.focus();
  }

  function handleKeyDown(key: 'month' | 'day' | 'year', e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      if (key === 'day' && day === '') { e.preventDefault(); monthRef.current?.focus(); }
      if (key === 'year' && year === '') { e.preventDefault(); dayRef.current?.focus(); }
    }
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: '520px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.8rem', textAlign: 'center', color: 'var(--text)', marginBottom: '28px' }}>
        What is your birthday?
      </h2>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
        <input
          ref={monthRef}
          value={month}
          onChange={e => handleField('month', e.target.value)}
          onKeyDown={e => handleKeyDown('month', e)}
          placeholder="MM" maxLength={2} inputMode="numeric"
          style={{ ...inputStyle, width: '60px', textAlign: 'center' }}
        />
        <input
          ref={dayRef}
          value={day}
          onChange={e => handleField('day', e.target.value)}
          onKeyDown={e => handleKeyDown('day', e)}
          placeholder="DD" maxLength={2} inputMode="numeric"
          style={{ ...inputStyle, width: '60px', textAlign: 'center' }}
        />
        <input
          ref={yearRef}
          value={year}
          onChange={e => handleField('year', e.target.value)}
          onKeyDown={e => handleKeyDown('year', e)}
          placeholder="YYYY" maxLength={4} inputMode="numeric"
          style={{ ...inputStyle, width: '90px', textAlign: 'center' }}
        />
        {(month || day || year) && (
          <button
            onClick={() => { setMonth(''); setDay(''); setYear(''); setBreakdown(null); setTimeout(() => monthRef.current?.focus(), 0); }}
            style={{
              background: 'transparent', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '11px 14px',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {breakdown && (
        <div style={previewCard}>
          <div style={previewTitle}>Lucky Number</div>

          {/* Lucky number hero */}
          <div style={{ textAlign: 'center', padding: '16px 0 20px' }}>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '5rem',
              color: 'var(--gold)',
              lineHeight: 1,
            }}>
              {breakdown.lucky}
            </div>
          </div>

          {/* Calculation breakdown */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              How it was calculated
            </div>

            {breakdown.usedFallback === null && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                <ReadingChip label="1st digit of month" value={String(breakdown.firstMonthDigit)} color="var(--accent)" />
                <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>+</span>
                <ReadingChip label="Last digit of year" value={String(breakdown.lastYearDigit)} color="var(--accent)" />
                <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>=</span>
                <ReadingChip label="Lucky Number" value={String(breakdown.lucky)} color="var(--gold)" />
              </div>
            )}

            {breakdown.usedFallback === 'day' && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <ReadingChip label="1st digit of month" value={String(breakdown.firstMonthDigit)} color="var(--accent)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>+</span>
                  <ReadingChip label="Last digit of year" value={String(breakdown.lastYearDigit)} color="var(--accent)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>=</span>
                  <ReadingChip label="Combined" value="19" color="var(--rose)" />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Combined is 19 — use birth day instead
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <ReadingChip label="Birth Day" value={String(breakdown.day)} color="var(--gold)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>= Lucky Number</span>
                </div>
              </>
            )}

            {breakdown.usedFallback === 'year' && (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                  <ReadingChip label="1st digit of month" value={String(breakdown.firstMonthDigit)} color="var(--accent)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>+</span>
                  <ReadingChip label="Last digit of year" value={String(breakdown.lastYearDigit)} color="var(--accent)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>=</span>
                  <ReadingChip label="Combined" value="19" color="var(--rose)" />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Combined is 19 and birth day is also 19 — reduce birth year digits
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <ReadingChip label="Year reduced" value={String(breakdown.yearReduced)} color="var(--gold)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>= Lucky Number</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '11px 14px', background: 'var(--surface-2)',
  border: '1px solid var(--border)', borderRadius: '10px',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
  boxSizing: 'border-box',
};

const previewCard: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '14px', padding: '20px', marginTop: '20px',
  animation: 'fadeUp 0.25s ease both',
};

const previewTitle: React.CSSProperties = {
  fontSize: '0.65rem', textTransform: 'uppercase',
  letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '4px',
};
