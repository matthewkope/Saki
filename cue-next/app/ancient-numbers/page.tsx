'use client';

import { useMemo, useState } from 'react';
import { calculateAncientNumbers, type AncientMetricResult } from '@/lib/ancientNumbers';
import SavedAncientNames from '@/components/SavedAncientNames';

function formulaForMetric(metric: AncientMetricResult): string {
  if (metric.letters.length === 0) return '—';
  return metric.letters.map((letter) => `${letter.ch}(${letter.value})`).join(' + ');
}

function letterTrail(metric: AncientMetricResult): string {
  if (metric.letters.length === 0) return '—';
  return metric.letters.map((letter) => letter.ch).join(' · ');
}

function NumberStat({
  label,
  metric,
  accent,
}: {
  label: string;
  metric: AncientMetricResult;
  accent: string;
}) {
  return (
    <div style={{
      background: 'var(--surface-2)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '18px',
      display: 'grid',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2rem', lineHeight: 1, color: accent }}>{metric.reduced || '—'}</span>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>raw {metric.rawTotal || 0}</span>
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>{formulaForMetric(metric)}</div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>{letterTrail(metric)}</div>
    </div>
  );
}

function SystemCard({
  title,
  accent,
  description,
  expression,
  soulUrge,
  personality,
}: {
  title: string;
  accent: string;
  description: string;
  expression: AncientMetricResult;
  soulUrge: AncientMetricResult;
  personality: AncientMetricResult;
}) {
  return (
    <section style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '22px',
      display: 'grid',
      gap: '16px',
    }}>
      <div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", color: 'var(--text)', fontSize: '1.7rem', margin: 0 }}>{title}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: '6px 0 0', lineHeight: 1.6 }}>{description}</p>
      </div>
      <NumberStat label="Expression Number" metric={expression} accent={accent} />
      <NumberStat label="Soul Urge" metric={soulUrge} accent={accent} />
      <NumberStat label="Personality Number" metric={personality} accent={accent} />
    </section>
  );
}

export default function AncientNumbersPage() {
  const [fullName, setFullName] = useState('');
  const [dailyName, setDailyName] = useState('');

  const result = useMemo(() => {
    if (!fullName.trim() || !dailyName.trim()) return null;
    return calculateAncientNumbers(fullName, dailyName);
  }, [fullName, dailyName]);

  function clearAll() {
    setFullName('');
    setDailyName('');
  }

  return (
    <>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          borderBottom: '1px solid var(--border)',
          padding: '32px 0 28px',
          background: 'var(--bg)',
        }}
      >
        <div className="input-inner" style={{ maxWidth: '720px' }}>
          <div className="app-title">Ancient Numbers</div>
          <div className="app-subtitle">Chaldean and Pythagorean name numerology</div>

          <div style={{ width: '100%', display: 'grid', gap: '18px' }}>
            <div
              style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto',
                gap: '14px',
                alignItems: 'end',
              }}
            >
              <div className="date-group" style={{ alignItems: 'stretch' }}>
                <div className="date-label">Full Name</div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name displayed on birth certificate"
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    width: '100%',
                    padding: '15px 18px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div className="date-group" style={{ alignItems: 'stretch' }}>
                <div className="date-label">Daily Name</div>
                <input
                  type="text"
                  value={dailyName}
                  onChange={(e) => setDailyName(e.target.value)}
                  placeholder="Enter what you're called on a daily basis"
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    width: '100%',
                    padding: '15px 18px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </div>

              <SavedAncientNames
                currentFullName={fullName}
                currentDailyName={dailyName}
                onSelect={(nextFullName, nextDailyName) => {
                  setFullName(nextFullName);
                  setDailyName(nextDailyName);
                }}
              />
            </div>

            {(fullName || dailyName) && (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={clearAll}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-dim)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '0.78rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 84px' }}>
        {!fullName.trim() || !dailyName.trim() ? (
          <div className="placeholder-msg">Enter a full name and the name used daily to calculate both ancient systems.</div>
        ) : !result ? (
          <div className="placeholder-msg">Enter names with letters to calculate the numbers.</div>
        ) : (
          <div style={{ display: 'grid', gap: '18px' }}>
            <section className="reading-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '6px' }}>
                    Ancient Numbers Reading
                  </div>
                  <div style={{ fontFamily: "'Instrument Serif', serif", color: 'var(--text)', fontSize: '2.3rem', lineHeight: 1.1 }}>
                    {result.fullName}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Daily Name</div>
                    <div style={{ fontSize: '0.98rem', color: 'var(--accent)', fontWeight: 600 }}>{result.dailyName}</div>
                  </div>
                </div>
              </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
              <SystemCard
                title="Pythagorean"
                accent="var(--accent)"
                description="Modern alphabet-based numerology using the full birth-certificate name."
                expression={result.pythagorean.expression}
                soulUrge={result.pythagorean.soulUrge}
                personality={result.pythagorean.personality}
              />
              <SystemCard
                title="Chaldean"
                accent="var(--gold)"
                description="Older vibrational mapping using the name you are called on a daily basis."
                expression={result.chaldean.expression}
                soulUrge={result.chaldean.soulUrge}
                personality={result.chaldean.personality}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}
