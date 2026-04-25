'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { calcLP } from '@/lib/numerology';
import { getEasternAnimalWithIndex, getWesternSignWithIndex, EAST_ANIMALS, ANIMAL_EMOJI, WEST_EMOJI } from '@/lib/astrology';
import { EAST_TRIADS, EAST_COMPAT, LP_COMPAT, WEST_COMPAT } from '@/lib/compatibility';
import { CONTENT } from '@/lib/content';

const CURRENT_YEAR = 2026;

const WEST_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const EROGENOUS_ZONES: Record<string, { body: string; zone: string; notes: string }> = {
  Aries:       { body: 'Head & Face',            zone: 'Scalp, temples, forehead, ears',    notes: 'Hair-pulling, head massage, kisses on the forehead' },
  Taurus:      { body: 'Neck & Throat',           zone: 'Nape of neck, collarbone, throat',  notes: 'Gentle neck kisses, throat caresses, nuzzling' },
  Gemini:      { body: 'Hands & Arms',            zone: 'Fingers, wrists, inner arms',       notes: 'Hand-holding with intention, wrist kisses, light arm tracing' },
  Cancer:      { body: 'Chest & Breasts',         zone: 'Chest, breasts, stomach',           notes: 'Nurturing touch, chest caresses, stomach kisses' },
  Leo:         { body: 'Upper Back & Spine',      zone: 'Spine, upper back, sides',          notes: 'Back tracing, spine kisses, side caresses' },
  Virgo:       { body: 'Abdomen & Waist',         zone: 'Stomach, waist, lower abdomen',     notes: 'Belly kisses, waist grazing, slow abdominal touch' },
  Libra:       { body: 'Lower Back & Buttocks',   zone: 'Lower back, sacrum, glutes',        notes: 'Lower back massage, sacral touch' },
  Scorpio:     { body: 'Pelvis & Genitals',       zone: 'Groin, hips, genitals',             notes: 'The most intensely sexual zone of the zodiac' },
  Sagittarius: { body: 'Hips & Thighs',           zone: 'Inner thighs, hips, outer thighs',  notes: 'Thigh caresses, hip kisses, playful biting' },
  Capricorn:   { body: 'Knees & Legs',            zone: 'Knees, calves, back of knees',      notes: 'Behind-the-knee sensitivity, calf massage' },
  Aquarius:    { body: 'Ankles & Calves',         zone: 'Ankles, shins, calves',             notes: 'Ankle tracing, light calf touch' },
  Pisces:      { body: 'Feet & Toes',             zone: 'Feet, toes, arches',                notes: 'Foot massage, toe kisses, arch caresses' },
};

interface BirthProfile {
  birth_month: number | null;
  birth_day: number | null;
  birth_year: number | null;
}

function getAgeCohorts(animal: string): { year: number; age: number }[] {
  const idx = EAST_ANIMALS.indexOf(animal as typeof EAST_ANIMALS[number]);
  if (idx === -1) return [];
  const results: { year: number; age: number }[] = [];
  for (let y = 1924 + idx; y <= 2028; y += 12) {
    const age = CURRENT_YEAR - y;
    if (age >= 0 && age <= 100) results.push({ year: y, age });
  }
  return results.sort((a, b) => a.age - b.age);
}

function getFriendlyAnimals(animal: string): string[] {
  const triad = EAST_TRIADS.find(t => t.includes(animal));
  return triad ?? [animal];
}

function getLPMatches(lp: number) {
  const row = LP_COMPAT[lp] ?? {};
  return Object.entries(row)
    .map(([k, v]) => ({ lp: Number(k), score: v }))
    .filter(({ lp: other, score }) => other !== lp && score >= 80)
    .sort((a, b) => b.score - a.score);
}

function getWestMatches(westIdx: number) {
  return (WEST_COMPAT[westIdx] ?? [])
    .map((score, i) => ({ sign: WEST_SIGNS[i], score, emoji: WEST_EMOJI[WEST_SIGNS[i]] ?? '' }))
    .filter(({ score }, i) => i !== westIdx && score >= 80)
    .sort((a, b) => b.score - a.score);
}

function renderMarkdown(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let inList = false;
  function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  for (const line of lines) {
    if (line.startsWith('### ')) { if (inList) { html += '</ul>'; inList = false; } html += '<h3>' + esc(line.slice(4)) + '</h3>'; }
    else if (line.startsWith('## ')) { if (inList) { html += '</ul>'; inList = false; } html += '<h2>' + esc(line.slice(3)) + '</h2>'; }
    else if (line.startsWith('# '))  { if (inList) { html += '</ul>'; inList = false; } html += '<h1>' + esc(line.slice(2)) + '</h1>'; }
    else if (line.startsWith('- ') || line.startsWith('* ')) { if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + esc(line.slice(2)) + '</li>'; }
    else if (line.trim() === '') { if (inList) { html += '</ul>'; inList = false; } }
    else { if (inList) { html += '</ul>'; inList = false; } html += '<p>' + esc(line) + '</p>'; }
  }
  if (inList) html += '</ul>';
  return html;
}

function lpLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Fair';
}

export default function RomancePage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [hiddenAnimals, setHiddenAnimals] = useState<Set<string>>(new Set());
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTitle, setPanelTitle] = useState('');
  const [panelHtml, setPanelHtml] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) { router.replace('/signin'); return; }
    supabase
      .from('profiles')
      .select('birth_month,birth_day,birth_year')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => { setProfile(data as BirthProfile); setFetching(false); });
  }, [session, loading, router]);

  function openLPPanel(lp: number) {
    const text = CONTENT.numerology[lp];
    if (!text) return;
    setPanelTitle(`Life Path ${lp}`);
    setPanelHtml(renderMarkdown(text));
    setPanelOpen(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (panelRef.current) panelRef.current.scrollTop = 0; }, 50);
  }

  function closePanel() {
    setPanelOpen(false);
    document.body.style.overflow = '';
  }

  if (loading || fetching) return null;
  if (!profile) return null;

  const { birth_month: m, birth_day: d, birth_year: y } = profile;

  if (!m || !d || !y) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: '600px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.4rem', color: 'var(--rose)', margin: '0 0 32px' }}>
          ♡ Romance
        </h1>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🌙</div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 20px' }}>
            Add your birthday to your profile to unlock your Romance reading.
          </p>
          <Link href="/profile" style={{
            display: 'inline-block', padding: '10px 24px',
            background: 'var(--rose)', borderRadius: '10px',
            color: '#0a0a0f', fontWeight: 700, fontSize: '0.85rem',
            textDecoration: 'none',
          }}>
            Complete Your Profile
          </Link>
        </div>
      </div>
    );
  }

  const { animal, index: eastIdx } = getEasternAnimalWithIndex(m, d, y);
  const { index: westIdx } = getWesternSignWithIndex(m, d);
  const lpResult = calcLP(m, d, y);
  const lp = lpResult.lp;

  const friendlyAnimals = getFriendlyAnimals(animal);
  const lpMatches = getLPMatches(lp);
  const westMatches = getWestMatches(westIdx);

  const triadColors = ['var(--gold)', 'var(--teal)', 'var(--rose)'];

  return (
    <div style={{ padding: '48px 24px', maxWidth: '640px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '2.6rem',
          color: 'var(--rose)',
          margin: '0 0 6px',
          letterSpacing: '0.02em',
        }}>
          ♡ Romance
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Your ideal matches based on numerology &amp; zodiac
        </p>
      </div>

      {/* Life Path Matches */}
      <SectionHeader label="Life Path Matches" />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '28px' }}>
        {lpMatches.map(({ lp: otherLP, score }) => (
          <div key={otherLP} onClick={() => openLPPanel(otherLP)} style={{
            background: 'rgba(196,160,255,0.08)', border: '1px solid rgba(196,160,255,0.2)',
            borderRadius: '12px', padding: '14px 18px', minWidth: '110px', cursor: 'pointer',
          }}>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
              Life Path
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', lineHeight: 1.1 }}>
              {otherLP}
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--friendly)' }}>
              {lpLabel(score)} · {score}%
            </div>
          </div>
        ))}
      </div>

      {/* Western Zodiac Matches */}
      <SectionHeader label="Western Zodiac Matches" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {westMatches.map(({ sign, score, emoji }) => {
          const zone = EROGENOUS_ZONES[sign];
          const open = expandedZone === sign;
          return (
            <div
              key={sign}
              onClick={() => setExpandedZone(open ? null : sign)}
              style={{
                background: 'rgba(167,139,250,0.08)',
                border: `1px solid ${open ? 'rgba(167,139,250,0.45)' : 'rgba(167,139,250,0.2)'}`,
                borderRadius: '12px', padding: '14px 18px', cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a78bfa' }}>{emoji} {sign}</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--friendly)' }}>
                    {lpLabel(score)} · {score}%
                  </span>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{open ? '▾' : '▸'}</span>
              </div>
              {open && zone && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(167,139,250,0.15)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <ZoneRow label="Body Ruled" value={zone.body} />
                  <ZoneRow label="Erogenous Zone" value={zone.zone} />
                  <ZoneRow label="Notes" value={zone.notes} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Eastern Zodiac Matches */}
      <SectionHeader label="Eastern Zodiac Matches" />

      {/* Per-animal toggle filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {friendlyAnimals.map((a, ai) => {
          const color = triadColors[ai];
          const hidden = hiddenAnimals.has(a);
          const animalIdx = EAST_ANIMALS.indexOf(a as typeof EAST_ANIMALS[number]);
          const compat = EAST_COMPAT[eastIdx][animalIdx];
          return (
            <button
              key={a}
              onClick={() => setHiddenAnimals(prev => {
                const next = new Set(prev);
                next.has(a) ? next.delete(a) : next.add(a);
                return next;
              })}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.03em',
                background: hidden ? 'transparent' : `${color}18`,
                color: hidden ? 'var(--text-muted)' : color,
                border: `1px solid ${hidden ? 'var(--border)' : color}`,
                opacity: hidden ? 0.5 : 1,
              }}
            >
              <span>{ANIMAL_EMOJI[a]}</span>
              <span>{a}</span>
              <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>{compat}%</span>
            </button>
          );
        })}
      </div>

      {/* Unified vertical timeline */}
      {(() => {
        const entries: { age: number; year: number; animal: string; color: string; isMe: boolean }[] = [];
        friendlyAnimals.forEach((a, ai) => {
          if (hiddenAnimals.has(a)) return;
          getAgeCohorts(a).forEach(({ age, year }) => {
            entries.push({ age, year, animal: a, color: triadColors[ai], isMe: year === y });
          });
        });
        entries.sort((a, b) => a.age - b.age);

        return (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', overflow: 'hidden', marginBottom: '16px' }}>
            {entries.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '24px 20px' }}>No animals selected</p>
            ) : (
              <div style={{ padding: '16px 20px' }}>
                <div style={{ position: 'relative', paddingLeft: '28px' }}>
                  {/* Vertical spine */}
                  <div style={{
                    position: 'absolute', left: '7px', top: '8px', bottom: '8px',
                    width: '2px', background: 'var(--border-light)', borderRadius: '1px',
                  }} />

                  {entries.map((entry) => (
                    <div
                      key={`${entry.animal}-${entry.year}`}

                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 0', position: 'relative' }}
                    >
                      {/* Dot on spine */}
                      <div style={{
                        position: 'absolute',
                        left: entry.isMe ? '-23px' : '-21px',
                        width: entry.isMe ? '14px' : '10px',
                        height: entry.isMe ? '14px' : '10px',
                        borderRadius: '50%',
                        background: entry.color,
                        border: entry.isMe ? '2px solid var(--bg)' : 'none',
                        boxShadow: entry.isMe ? `0 0 0 2px ${entry.color}` : 'none',
                        flexShrink: 0,
                      }} />

                      <span style={{ fontSize: entry.isMe ? '1.05rem' : '0.9rem', fontWeight: 700, color: entry.isMe ? entry.color : 'var(--text)', minWidth: '32px' }}>
                        {entry.age}
                      </span>
                      <span style={{ fontSize: '1rem' }}>{ANIMAL_EMOJI[entry.animal]}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', flex: 1 }}>{entry.animal}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{entry.year}</span>
                      {entry.isMe && (
                        <span style={{
                          fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: entry.color, background: `${entry.color}18`,
                          border: `1px solid ${entry.color}40`, borderRadius: '6px', padding: '2px 7px',
                        }}>You</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* LP Panel */}
      <div className={`panel-overlay${panelOpen ? ' open' : ''}`} onClick={closePanel} />
      <div ref={panelRef} className={`panel${panelOpen ? ' open' : ''}`}>
        <div className="panel-inner">
          <div className="panel-handle"><div className="panel-handle-bar" /></div>
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="panel-title">{panelTitle}</span>
            </div>
            <div className="panel-close" onClick={closePanel}>✕</div>
          </div>
          <div className="md-content" dangerouslySetInnerHTML={{ __html: panelHtml }} />
        </div>
      </div>

    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: 'var(--rose)',
      marginBottom: '12px',
    }}>
      {label}
    </div>
  );
}

function ZoneRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '0.88rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>{value}</div>
    </div>
  );
}
