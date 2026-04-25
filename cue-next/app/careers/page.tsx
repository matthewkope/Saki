'use client';

import { useCallback, useRef, useState } from 'react';
import SavedDates from '@/components/SavedDates';
import { getEasternAnimal, getWesternSign } from '@/lib/astrology';
import { CELTIC, CELTIC_SYMBOLS, getCelticSign } from '@/lib/celtic';
import { CONTENT } from '@/lib/content';
import { calcLP, calcSLP } from '@/lib/numerology';
import { getVedicSign, VEDIC } from '@/lib/vedic';
import { fmtLP, useIntermediaryNumbers } from '@/lib/useIntermediaryNumbers';

const ZODIAC_EMOJIS: Record<string, string> = {
  Rat: '🐀',
  Ox: '🐂',
  Tiger: '🐯',
  Cat: '🐱',
  Dragon: '🐉',
  Snake: '🐍',
  Horse: '🐴',
  Goat: '🐐',
  Monkey: '🐒',
  Rooster: '🐓',
  Dog: '🐶',
  Pig: '🐷',
};

const WEST_EMOJIS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

const EASTERN_CAREERS: Record<string, string> = {
  Rat: `# Rat Career Paths

## Career
Rat energy is strategic, observant, and opportunity-minded. It does best where timing, negotiation, information, and social awareness create an edge.

### Best Career Fields
- Entrepreneurship and small business
- Sales, trading, and negotiation
- Finance and investing
- Marketing and growth strategy
- Writing, media, and research`,
  Ox: `# Ox Career Paths

## Career
Ox energy is steady, disciplined, and built for long-term responsibility. It thrives in roles that reward patience, reliability, and practical execution.

### Best Career Fields
- Operations and management
- Engineering and construction
- Agriculture and land-based work
- Accounting and administration
- Government and public service`,
  Tiger: `# Tiger Career Paths

## Career
Tiger energy is bold, competitive, and courageous. It needs challenge, movement, and a path where decisive action is rewarded.

### Best Career Fields
- Entrepreneurship and leadership
- Athletics and performance
- Emergency response and protection
- Sales and competitive business
- Media, entertainment, and advocacy`,
  Cat: `# Cat Career Paths

## Career
Cat energy is diplomatic, tasteful, and socially intelligent. It works best where refinement, trust, beauty, and emotional awareness matter.

### Best Career Fields
- Design, fashion, and beauty
- Counseling and mediation
- Hospitality and client relations
- Art, writing, and creative direction
- Law, diplomacy, and partnerships`,
  Dragon: `# Dragon Career Paths

## Career
Dragon energy is visible, ambitious, and magnetic. It is suited to big goals, public influence, and work that requires confidence under pressure.

### Best Career Fields
- Executive leadership
- Entrepreneurship and brand building
- Entertainment and public speaking
- Politics and social influence
- Finance, real estate, and high-growth ventures`,
  Snake: `# Snake Career Paths

## Career
Snake energy is analytical, private, and perceptive. It excels where depth, strategy, secrecy, and precise judgment create power.

### Best Career Fields
- Psychology and therapy
- Investigation and intelligence
- Research and data analysis
- Finance, wealth strategy, and risk
- Medicine, healing, and occult studies`,
  Horse: `# Horse Career Paths

## Career
Horse energy is independent, mobile, and expressive. It needs freedom, variety, and work that lets momentum turn into opportunity.

### Best Career Fields
- Travel, events, and tourism
- Sales, marketing, and promotion
- Fitness, sports, and coaching
- Entertainment and performance
- Freelance or independent business`,
  Goat: `# Goat Career Paths

## Career
Goat energy is creative, nurturing, and aesthetically sensitive. It thrives in supportive environments where imagination and care have value.

### Best Career Fields
- Art, design, and illustration
- Wellness, therapy, and caregiving
- Culinary arts and hospitality
- Education and child development
- Music, fashion, and interiors`,
  Monkey: `# Monkey Career Paths

## Career
Monkey energy is clever, adaptive, and inventive. It needs stimulation, problem-solving, and room to experiment.

### Best Career Fields
- Technology and product design
- Comedy, entertainment, and content
- Sales, persuasion, and marketing
- Entrepreneurship and startups
- Strategy, consulting, and analytics`,
  Rooster: `# Rooster Career Paths

## Career
Rooster energy is precise, polished, and highly aware of standards. It performs well where presentation, systems, and accountability matter.

### Best Career Fields
- Fashion, beauty, and image consulting
- Project management and operations
- Accounting, auditing, and quality control
- Media, broadcasting, and performance
- Healthcare, military, and disciplined service`,
  Dog: `# Dog Career Paths

## Career
Dog energy is loyal, protective, and justice-oriented. It belongs in work where trust, service, ethics, and consistency are central.

### Best Career Fields
- Law, advocacy, and public policy
- Security, military, and emergency service
- Counseling and social work
- Human resources and team leadership
- Nonprofits and mission-driven organizations`,
  Pig: `# Pig Career Paths

## Career
Pig energy is generous, social, and abundance-oriented. It does well where warmth, community, pleasure, and timing create success.

### Best Career Fields
- Hospitality, food, and events
- Entertainment and social media
- Luxury, retail, and lifestyle brands
- Community management and partnerships
- Wellness, leisure, and client care`,
};

interface CareerReading {
  lp: number;
  slp: number;
  lpDisplay: string;
  animal: string;
  sign: string;
  vedicSign: string;
  celticSign: string;
}

interface CareerSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  html: string;
  accent: string;
}

function renderMarkdown(text: string): string {
  const lines = text.split('\n');
  let html = '';
  let inList = false;

  function esc(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function fmt(str: string): string {
    return esc(str).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h3>' + fmt(line.slice(4)) + '</h3>';
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h2>' + fmt(line.slice(3)) + '</h2>';
    } else if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h1>' + fmt(line.slice(2)) + '</h1>';
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + fmt(line.slice(2)) + '</li>';
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p>' + fmt(line) + '</p>';
    }
  }

  if (inList) html += '</ul>';
  return html;
}

function pickCareerMarkdown(markdown: string, fallbackTitle: string): string {
  const blocks = markdown.split(/^(?=## )/m);
  const careerBlocks = blocks.filter((block) => {
    const header = block.match(/^## (.+)/);
    return header && header[1].toLowerCase().includes('career');
  });

  if (careerBlocks.length === 0) {
    return '# ' + fallbackTitle + '\n\nCareer guidance is coming soon.';
  }

  return '# ' + fallbackTitle + '\n\n' + careerBlocks.join('\n\n').trim();
}

function makeSections(reading: CareerReading): CareerSection[] {
  const primary = (CONTENT.careers as Record<number, string>)[reading.lp] || '# Numerology Careers\n\nContent coming soon.';
  const secondary = reading.slp !== reading.lp ? (CONTENT.careers as Record<number, string>)[reading.slp] : null;
  const numerology = secondary
    ? primary + '\n\n## Secondary Life Path ' + reading.slp + '\n\n' + secondary
    : primary;

  return [
    {
      id: 'numerology',
      title: 'Numerology',
      subtitle: 'Life Path ' + reading.lpDisplay,
      icon: '◆',
      html: renderMarkdown(numerology),
      accent: 'var(--accent)',
    },
    {
      id: 'eastern',
      title: 'Eastern Zodiac',
      subtitle: reading.animal,
      icon: ZODIAC_EMOJIS[reading.animal] || '◈',
      html: renderMarkdown(EASTERN_CAREERS[reading.animal] || '# Eastern Zodiac Careers\n\nContent coming soon.'),
      accent: 'var(--gold)',
    },
    {
      id: 'western',
      title: 'Western Zodiac',
      subtitle: reading.sign,
      icon: WEST_EMOJIS[reading.sign] || '◎',
      html: renderMarkdown(pickCareerMarkdown((CONTENT.western as Record<string, string>)[reading.sign] || '', reading.sign + ' Careers')),
      accent: 'var(--teal)',
    },
    {
      id: 'vedic',
      title: 'Vedic Astrology',
      subtitle: reading.vedicSign,
      icon: 'ॐ',
      html: renderMarkdown(pickCareerMarkdown(VEDIC[reading.vedicSign] || '', 'Vedic ' + reading.vedicSign + ' Careers')),
      accent: 'var(--rose)',
    },
    {
      id: 'celtic',
      title: 'Celtic Astrology',
      subtitle: reading.celticSign,
      icon: CELTIC_SYMBOLS[reading.celticSign] || 'ᚁ',
      html: renderMarkdown(pickCareerMarkdown(CELTIC[reading.celticSign] || '', 'Celtic ' + reading.celticSign + ' Careers')),
      accent: 'var(--friendly)',
    },
  ];
}

export default function CareersPage() {
  const [mm, setMm] = useState('');
  const [dd, setDd] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [reading, setReading] = useState<CareerReading | null>(null);
  const [error, setError] = useState('');
  const [showIntermediary] = useIntermediaryNumbers();

  const mmRef = useRef<HTMLInputElement>(null);
  const ddRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);

  const tryCalculate = useCallback((mStr: string, dStr: string, yStr: string) => {
    const m = parseInt(mStr);
    const d = parseInt(dStr);
    const y = parseInt(yStr);

    if (isNaN(m) || isNaN(d) || isNaN(y)) {
      setReading(null);
      setError('');
      return;
    }

    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2099) {
      setReading(null);
      setError('Please enter a valid birth date.');
      return;
    }

    const lpData = calcLP(m, d, y);
    setError('');
    setReading({
      lp: lpData.lp,
      slp: calcSLP(d),
      lpDisplay: lpData.display,
      animal: getEasternAnimal(m, d, y),
      sign: getWesternSign(m, d),
      vedicSign: getVedicSign(m, d),
      celticSign: getCelticSign(m, d),
    });
  }, []);

  function handleMm(val: string) {
    const v = val.replace(/\D/g, '').slice(0, 2);
    setMm(v);
    if (v.length === 2) ddRef.current?.focus();
    tryCalculate(v, dd, yyyy);
  }

  function handleDd(val: string) {
    const v = val.replace(/\D/g, '').slice(0, 2);
    setDd(v);
    if (v.length === 2) yyyyRef.current?.focus();
    tryCalculate(mm, v, yyyy);
  }

  function handleYyyy(val: string) {
    const v = val.replace(/\D/g, '').slice(0, 4);
    setYyyy(v);
    tryCalculate(mm, dd, v);
  }

  function focusSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const sections = reading ? makeSections(reading) : [];

  return (
    <>
      <div className="input-section">
        <div className="input-inner">
          <div className="app-title">Careers</div>
          <div className="app-subtitle">Career paths from your profile reading</div>
          <div className="date-group">
            <div className="date-label">Date of Birth</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="date-boxes">
                <div className="date-field">
                  <label>MM</label>
                  <input
                    ref={mmRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="MM"
                    value={mm}
                    className={mm ? 'filled' : ''}
                    onChange={(e) => handleMm(e.target.value)}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                  />
                </div>
                <span className="date-sep">/</span>
                <div className="date-field">
                  <label>DD</label>
                  <input
                    ref={ddRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    placeholder="DD"
                    value={dd}
                    className={dd ? 'filled' : ''}
                    onChange={(e) => handleDd(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && dd === '') {
                        e.preventDefault();
                        mmRef.current?.focus();
                      }
                    }}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                  />
                </div>
                <span className="date-sep">/</span>
                <div className="date-field year-field">
                  <label>YYYY</label>
                  <input
                    ref={yyyyRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="YYYY"
                    value={yyyy}
                    className={yyyy ? 'filled' : ''}
                    onChange={(e) => handleYyyy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && yyyy === '') {
                        e.preventDefault();
                        ddRef.current?.focus();
                      }
                    }}
                    onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                  />
                </div>
              </div>
              <SavedDates
                currentMm={mm}
                currentDd={dd}
                currentYyyy={yyyy}
                onSelect={(m, d, y) => {
                  setMm(m);
                  setDd(d);
                  setYyyy(y);
                  tryCalculate(m, d, y);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '34px 24px 80px' }}>
        {error ? (
          <div className="placeholder-msg">{error}</div>
        ) : !reading ? (
          <div className="placeholder-msg">Enter your birth date to see career paths across each system.</div>
        ) : (
          <>
            <section className="reading-card" style={{ marginBottom: '18px' }}>
              <div className="reading-name-row">
                <div className="reading-lp">{fmtLP(reading.lp, reading.lpDisplay, showIntermediary)}</div>
                <div className="reading-lp-label">Career Profile</div>
              </div>
              <div className="reading-rows">
                <div className="reading-row">
                  <span className="reading-key">Eastern Zodiac</span>
                  <span className="reading-val gold">{ZODIAC_EMOJIS[reading.animal]} {reading.animal}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Western Zodiac</span>
                  <span className="reading-val teal">{WEST_EMOJIS[reading.sign]} {reading.sign}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Vedic Astrology</span>
                  <span className="reading-val" style={{ color: 'var(--rose)' }}>ॐ {reading.vedicSign}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Celtic Astrology</span>
                  <span className="reading-val" style={{ color: 'var(--friendly)' }}>{CELTIC_SYMBOLS[reading.celticSign]} {reading.celticSign}</span>
                </div>
              </div>
            </section>

            <nav
              aria-label="Career categories"
              style={{
                position: 'sticky',
                top: '174px',
                zIndex: 90,
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '10px 0 16px',
                background: 'var(--bg)',
                scrollbarWidth: 'none',
              }}
            >
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => focusSection(section.id)}
                  title={section.title}
                  style={{
                    flex: '0 0 auto',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: section.accent,
                    fontSize: section.id === 'vedic' ? '1.25rem' : '1.1rem',
                    cursor: 'pointer',
                  }}
                >
                  {section.icon}
                </button>
              ))}
            </nav>

            <div style={{ display: 'grid', gap: '18px' }}>
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  style={{
                    scrollMarginTop: '238px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: section.accent,
                        background: 'var(--surface-2)',
                        fontSize: section.id === 'vedic' ? '1.35rem' : '1.2rem',
                        flexShrink: 0,
                      }}
                    >
                      {section.icon}
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "'Instrument Serif', serif", color: 'var(--text)', fontSize: '1.5rem', lineHeight: 1.1, margin: 0 }}>
                        {section.title}
                      </h2>
                      <div style={{ color: section.accent, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: '4px' }}>
                        {section.subtitle}
                      </div>
                    </div>
                  </div>
                  <div className="md-content" dangerouslySetInnerHTML={{ __html: section.html }} />
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
