'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import SavedDates from '@/components/SavedDates';
import { calcLP, calcSLP, calcPersonalYear, calcPersonalMonth } from '@/lib/numerology';
import { getEasternAnimal, getEasternElement, getWesternSign } from '@/lib/astrology';
import { CONTENT } from '@/lib/content';
import { VEDIC, getVedicSign } from '@/lib/vedic';
import { CELTIC, getCelticSign, CELTIC_SYMBOLS } from '@/lib/celtic';
import { useIntermediaryNumbers, fmtLP } from '@/lib/useIntermediaryNumbers';

// ============================================================
// CONSTANTS
// ============================================================
const ZODIAC_EMOJIS: Record<string, string> = {
  Rat: '🐀', Ox: '🐂', Tiger: '🐯', Cat: '🐱', Dragon: '🐉', Snake: '🐍',
  Horse: '🐴', Goat: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐶', Pig: '🐷',
};

const WEST_EMOJIS: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

// Zodiac triads — friendly within group, enemy is the opposite sign
const TRIADS: string[][] = [
  ['Rat', 'Dragon', 'Monkey'],
  ['Ox', 'Snake', 'Rooster'],
  ['Tiger', 'Horse', 'Dog'],
  ['Cat', 'Goat', 'Pig'],
];
const ENEMIES: Record<string, string> = {
  Rat: 'Horse', Horse: 'Rat',
  Ox: 'Goat',  Goat: 'Ox',
  Tiger: 'Monkey', Monkey: 'Tiger',
  Cat: 'Rooster', Rooster: 'Cat',
  Dragon: 'Dog', Dog: 'Dragon',
  Snake: 'Pig',  Pig: 'Snake',
};
const ANIMALS_ORDER = ['Rat','Ox','Tiger','Cat','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];

function animalForYear(y: number): string {
  return ANIMALS_ORDER[((y - 2020) % 12 + 12) % 12];
}

function pyForYear(birthMonth: number, birthDay: number, calYear: number): number {
  const mVal = birthMonth === 11 ? 11 : birthMonth;
  const yearDigitSum = String(calYear).split('').reduce((s, c) => s + parseInt(c), 0);
  let raw = mVal + birthDay + yearDigitSum;
  while (raw > 9 && ![11, 22, 33].includes(raw)) {
    raw = String(raw).split('').reduce((s, c) => s + parseInt(c), 0);
  }
  if (raw === 2) raw = 11;
  return raw;
}

function getTriad(animal: string): string[] {
  return TRIADS.find(t => t.includes(animal)) ?? [];
}

// ============================================================
// TYPES
// ============================================================
interface ReadingData {
  lp: number;
  slp: number;
  lpDisplay: string;
  animal: string;
  animalElement: string;
  sign: string;
  vedicSign: string;
  celticSign: string;
  py: number;
  pyDisplay: string;
  pm: number;
  pmDisplay: string;
}

type PanelType = 'numerology' | 'zodiac' | 'western' | 'careers' | 'personalYear' | 'timeline' | 'vedic' | 'celtic';

// ============================================================
// MARKDOWN RENDERER
// ============================================================
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
    } else if (line.trim() === '---') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<hr style="border:none;border-top:1px solid var(--border-light);margin:20px 0">';
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

// ============================================================
// NUMEROLOGY TAB CONFIG
// ============================================================
const NUM_TABS = ['lp', 'characteristics', 'strengths', 'compatibility', 'careers'] as const;
type NumTab = typeof NUM_TABS[number];

const TAB_EMOJI: Record<NumTab, string> = {
  lp: '🔮',
  characteristics: '✨',
  strengths: '⚡',
  compatibility: '💞',
  careers: '💼',
};
const TAB_LABEL: Record<NumTab, string> = {
  lp: 'Life Path',
  characteristics: 'Characteristics',
  strengths: 'Strengths',
  compatibility: 'Compatibility',
  careers: 'Careers',
};
const TAB_KEYWORDS: Record<NumTab, string[]> = {
  lp: ['primary', 'secondary'],
  characteristics: ['characteristics'],
  strengths: ['strengths'],
  compatibility: ['friendly', 'neutral', 'enemy'],
  careers: [],
};

function pickSections(markdown: string, keywords: string[]): string {
  const blocks = markdown.split(/^(?=## )/m);
  const result: string[] = [];
  for (const block of blocks) {
    const h2 = block.match(/^## (.+)/);
    if (!h2) {
      if (keywords.length === 0) result.push(block.trim());
    } else {
      const header = h2[1].toLowerCase();
      if (keywords.some(k => header.includes(k))) result.push(block.trim());
    }
  }
  return result.join('\n\n') || '# Coming Soon\n\nThis section is on its way.';
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function ReadingPage() {
  const [mm, setMm] = useState('');
  const [dd, setDd] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [reading, setReading] = useState<ReadingData | null>(null);
  const [error, setError] = useState('');
  const [showIntermediary] = useIntermediaryNumbers();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelEmoji, setPanelEmoji] = useState('');
  const [panelTitle, setPanelTitle] = useState('');
  const [panelHtml, setPanelHtml] = useState('');
  const [isNumPanel, setIsNumPanel] = useState(false);
  const [numTab, setNumTab] = useState<NumTab>('lp');
  const [numTabHtml, setNumTabHtml] = useState<Record<string, string>>({});
  const [numLpKey, setNumLpKey] = useState<number>(1);

  const mmRef = useRef<HTMLInputElement>(null);
  const ddRef = useRef<HTMLInputElement>(null);
  const yyyyRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
    const slp = calcSLP(d);
    const animal = getEasternAnimal(m, d, y);
    const animalElement = getEasternElement(m, d, y);
    const sign = getWesternSign(m, d);
    const vedicSign = getVedicSign(m, d);
    const celticSign = getCelticSign(m, d);
    const pyData = calcPersonalYear(m, d);
    const pmData = calcPersonalMonth(m, d);

    setError('');
    setReading({
      lp: lpData.lp,
      slp,
      lpDisplay: lpData.display,
      animal,
      animalElement,
      sign,
      vedicSign,
      celticSign,
      py: pyData.py,
      pyDisplay: pyData.display,
      pm: pmData.pm,
      pmDisplay: pmData.display,
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

  function handleMmKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && mm === '') {
      // nothing to go back to
    }
  }

  function handleDdKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && dd === '') {
      e.preventDefault();
      mmRef.current?.focus();
    }
  }

  function handleYyyyKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && yyyy === '') {
      e.preventDefault();
      ddRef.current?.focus();
    }
  }

  function openPanel(type: PanelType) {
    if (!reading) return;

    let key: string | number;
    let text: string;
    let em: string;
    let label: string;

    if (type === 'numerology' || type === 'careers') {
      const lpKey = reading.lp;
      const fullText = (CONTENT.numerology as Record<number, string>)[lpKey] || '';
      const careersText = (CONTENT.careers as Record<number, string>)[lpKey] || '# Careers\n\nContent coming soon.';
      const slpKey = reading.slp;
      const secondaryCareersText = slpKey !== lpKey ? (CONTENT.careers as Record<number, string>)[slpKey] : null;
      const fullCareersText = secondaryCareersText
        ? careersText + '\n\n---\n\n## Secondary Life Path — ' + slpKey + '\n\n' + secondaryCareersText
        : careersText;
      const html: Record<string, string> = {
        lp:             renderMarkdown(pickSections(fullText, TAB_KEYWORDS.lp)),
        characteristics: renderMarkdown(pickSections(fullText, TAB_KEYWORDS.characteristics)),
        strengths:      renderMarkdown(pickSections(fullText, TAB_KEYWORDS.strengths)),
        compatibility:  renderMarkdown(pickSections(fullText, TAB_KEYWORDS.compatibility)),
        careers:        renderMarkdown(fullCareersText),
      };
      const activeTab: NumTab = type === 'careers' ? 'careers' : 'lp';
      setNumTabHtml(html);
      setNumLpKey(lpKey);
      setNumTab(activeTab);
      setIsNumPanel(true);
      setPanelEmoji(TAB_EMOJI[activeTab]);
      setPanelTitle(String(lpKey) + ' · ' + TAB_LABEL[activeTab]);
      setPanelOpen(true);
      document.body.style.overflow = 'hidden';
      setTimeout(() => { if (panelRef.current) panelRef.current.scrollTop = 0; }, 50);
      return;
    } else if (type === 'zodiac') {
      key = reading.animal;
      text = (CONTENT.zodiac as Record<string, string>)[key] || ('# The ' + key + '\n\nContent coming soon.');
      em = ZODIAC_EMOJIS[key] || '🌙';
      label = 'The ' + reading.animalElement + ' ' + key;
    } else if (type === 'western') {
      key = reading.sign;
      text = (CONTENT.western as Record<string, string>)[key] || ('# ' + key + '\n\nContent coming soon.');
      em = WEST_EMOJIS[key] || '✨';
      label = key;
    } else if (type === 'personalYear') {
      key = reading.py;
      text = (CONTENT.personalYear as Record<number, string>)[key] || '# Personal Year\n\nContent coming soon.';
      em = '🗓️';
      label = 'Personal Year ' + reading.pyDisplay;
    } else if (type === 'vedic') {
      key = reading.vedicSign;
      text = VEDIC[key] || '# Vedic Profile\n\nContent coming soon.';
      em = 'ॐ';
      label = 'Vedic · ' + key;
    } else if (type === 'celtic') {
      key = reading.celticSign;
      text = CELTIC[key] || '# Celtic Profile\n\nContent coming soon.';
      em = CELTIC_SYMBOLS[key] || 'ᚁ';
      label = 'Celtic · ' + key;
    } else {
      // timeline
      const birthYear = parseInt(yyyy);
      const currentYear = new Date().getFullYear();
      const userAnimal = reading.animal;
      const userTriad = getTriad(userAnimal);
      const enemy = ENEMIES[userAnimal];

      let rows = '';
      for (let yr = birthYear; yr <= currentYear + 10; yr++) {
        const yrAnimal = animalForYear(yr);
        const yrPy = pyForYear(parseInt(mm), parseInt(dd), yr);

        let relation: 'self' | 'friendly' | 'enemy' | 'neutral';
        if (yrAnimal === userAnimal) relation = 'self';
        else if (userTriad.includes(yrAnimal)) relation = 'friendly';
        else if (yrAnimal === enemy) relation = 'enemy';
        else relation = 'neutral';

        const color = relation === 'self' ? '#f0d080' : relation === 'friendly' ? '#60d0c0' : relation === 'enemy' ? '#ff80a0' : '#c0c0c0';
        const badge = relation === 'self' ? '★' : relation === 'friendly' ? '♥' : relation === 'enemy' ? '✕' : '·';
        const isBirth = yr === birthYear;
        const isCurrent = yr === currentYear;
        const rowBg = isBirth ? 'background:#1a1a2e;' : isCurrent ? 'background:#1a1a1a;' : '';
        const yearLabel = yr + (isBirth ? ' ★' : isCurrent ? ' ←' : '');

        rows += `<tr id="${isCurrent ? 'tl-current' : ''}" style="${rowBg}">` +
          `<td style="padding:6px 10px;color:${isBirth || isCurrent ? '#fff' : '#aaa'};font-weight:${isBirth || isCurrent ? '600' : '400'}">${yearLabel}</td>` +
          `<td style="padding:6px 10px;color:${color}">${ZODIAC_EMOJIS[yrAnimal] || ''} ${yrAnimal}</td>` +
          `<td style="padding:6px 10px;color:#c4a0ff;text-align:center">PY ${yrPy}</td>` +
          `<td style="padding:6px 10px;color:${color};text-align:center;font-size:1rem">${badge}</td>` +
          `</tr>`;
      }

      const timelineHtml =
        `<div style="margin-bottom:16px;font-size:0.85rem;color:#888">Your zodiac is <strong style="color:#f0d080">${userAnimal}</strong>. ` +
        `Friendly years: <span style="color:#60d0c0">${userTriad.join(', ')}</span>. ` +
        `Enemy years: <span style="color:#ff80a0">${enemy}</span>.</div>` +
        `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:0.88rem">` +
        `<thead><tr style="border-bottom:1px solid #333">` +
        `<th style="padding:6px 10px;text-align:left;color:#666;font-weight:500">Year</th>` +
        `<th style="padding:6px 10px;text-align:left;color:#666;font-weight:500">Animal</th>` +
        `<th style="padding:6px 10px;text-align:center;color:#666;font-weight:500">Personal Year</th>` +
        `<th style="padding:6px 10px;text-align:center;color:#666;font-weight:500">Energy</th>` +
        `</tr></thead><tbody>${rows}</tbody></table></div>`;

      em = '📆';
      label = 'Your Timeline';
      text = '';
      key = 0;
      setPanelEmoji(em);
      setPanelTitle(label);
      setPanelHtml(timelineHtml);
      setPanelOpen(true);
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        const el = document.getElementById('tl-current');
        if (el) el.scrollIntoView({ block: 'center' });
        else if (panelRef.current) panelRef.current.scrollTop = 0;
      }, 80);
      return;
    }

    setIsNumPanel(false);
    setPanelEmoji(em);
    setPanelTitle(label as string);
    setPanelHtml(renderMarkdown(text));
    setPanelOpen(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (panelRef.current) panelRef.current.scrollTop = 0; }, 50);
  }

  function switchNumTab(tab: NumTab) {
    setNumTab(tab);
    setPanelEmoji(TAB_EMOJI[tab]);
    setPanelTitle(String(numLpKey) + ' · ' + TAB_LABEL[tab]);
    if (panelRef.current) panelRef.current.scrollTop = 0;
  }

  function closePanel() {
    setPanelOpen(false);
    document.body.style.overflow = '';
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closePanel(); return; }
      if (panelOpen && isNumPanel) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          const idx = NUM_TABS.indexOf(numTab);
          const next = e.key === 'ArrowRight'
            ? (idx + 1) % NUM_TABS.length
            : (idx - 1 + NUM_TABS.length) % NUM_TABS.length;
          switchNumTab(NUM_TABS[next]);
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [panelOpen, isNumPanel, numTab]);

  return (
    <>
      {/* Sticky Input */}
      <div className="input-section">
        <div className="input-inner">
          <div className="app-title">Personal Reading</div>
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
                  onKeyDown={handleMmKeyDown}
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
                  onKeyDown={handleDdKeyDown}
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
                  onKeyDown={handleYyyyKeyDown}
                  onFocus={(e) => setTimeout(() => e.target.select(), 0)}
                />
              </div>
            </div>
            <SavedDates
              currentMm={mm}
              currentDd={dd}
              currentYyyy={yyyy}
              onSelect={(m, d, y) => { setMm(m); setDd(d); setYyyy(y); tryCalculate(m, d, y); }}
            />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="results-section">
        {error ? (
          <div className="placeholder-msg">{error}</div>
        ) : !reading ? (
          <div className="placeholder-msg">Enter your birth date above to reveal your reading.</div>
        ) : (
          <>
            <div className="reading-card">
              <div className="reading-name-row">
                <div className="reading-lp">{fmtLP(reading.lp, reading.lpDisplay, showIntermediary)}</div>
                <div className="reading-lp-label">Life Path</div>
              </div>
              <div className="reading-rows">
                <div className="reading-row">
                  <span className="reading-key">Secondary Lifepath</span>
                  <span className="reading-val accent">{reading.slp}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Zodiac</span>
                  <span className="reading-val gold">{ZODIAC_EMOJIS[reading.animal]} {reading.animalElement} {reading.animal}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Western Astrology</span>
                  <span className="reading-val teal">{WEST_EMOJIS[reading.sign]} {reading.sign}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Personal Year</span>
                  <button
                    type="button"
                    onClick={() => openPanel('personalYear')}
                    title="Open Personal Year reading"
                    className="reading-val"
                    style={{
                      color: 'var(--gold)',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    🗓️ {fmtLP(reading.py, reading.pyDisplay, showIntermediary)}
                  </button>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Personal Month</span>
                  <span className="reading-val" style={{ color: 'var(--rose)' }}>📅 {reading.pmDisplay}</span>
                </div>
              </div>
            </div>

            <div className="tiles-row">
              <div className="tile" onClick={() => openPanel('numerology')}>
                <div className="tile-emoji">🔮</div>
                <div className="tile-label">Numerology</div>
              </div>
              <div className="tile" onClick={() => openPanel('zodiac')}>
                <div className="tile-emoji">{ZODIAC_EMOJIS[reading.animal]}</div>
                <div className="tile-label">Zodiac</div>
              </div>
              <div className="tile" onClick={() => openPanel('western')}>
                <div className="tile-emoji">{WEST_EMOJIS[reading.sign]}</div>
                <div className="tile-label">Western</div>
              </div>
            </div>
            <div className="tiles-row-2">
              <div className="tile" onClick={() => openPanel('celtic')}>
                <div className="tile-emoji">🌳</div>
                <div className="tile-label">Celtic</div>
              </div>
              <div className="tile" onClick={() => openPanel('vedic')}>
                <div className="tile-emoji" style={{ fontFamily: 'serif', fontSize: '1.5rem' }}>ॐ</div>
                <div className="tile-label">Vedic</div>
              </div>
              <div className="tile" onClick={() => openPanel('timeline')}>
                <div className="tile-emoji">📆</div>
                <div className="tile-label">Timeline</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Panel Overlay */}
      <div
        className={`panel-overlay${panelOpen ? ' open' : ''}`}
        onClick={closePanel}
      />

      {/* Detail Panel */}
      <div ref={panelRef} className={`panel${panelOpen ? ' open' : ''}`}>
        <div className="panel-inner">
          <div className="panel-handle">
            <div className="panel-handle-bar" />
          </div>
          <div className="panel-header">
            <div className="panel-title-wrap">
              <span className="panel-title-emoji">{panelEmoji}</span>
              <span className="panel-title">{panelTitle}</span>
            </div>
            <div className="panel-close" onClick={closePanel}>✕</div>
          </div>
          {isNumPanel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px 14px', borderBottom: '1px solid var(--border-light)' }}>
              <button
                onClick={() => { const i = NUM_TABS.indexOf(numTab); switchNumTab(NUM_TABS[(i - 1 + NUM_TABS.length) % NUM_TABS.length]); }}
                style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem', padding: '5px 9px', lineHeight: 1, flexShrink: 0 }}
              >‹</button>
              {NUM_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => switchNumTab(tab)}
                  title={TAB_LABEL[tab]}
                  style={{ flex: 1, background: numTab === tab ? 'var(--gold)' : 'transparent', border: '1px solid ' + (numTab === tab ? 'var(--gold)' : 'var(--border-light)'), borderRadius: '6px', color: numTab === tab ? '#111' : 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem', padding: '5px 0', lineHeight: 1 }}
                >{TAB_EMOJI[tab]}</button>
              ))}
              <button
                onClick={() => { const i = NUM_TABS.indexOf(numTab); switchNumTab(NUM_TABS[(i + 1) % NUM_TABS.length]); }}
                style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '6px', color: 'var(--text-dim)', cursor: 'pointer', fontSize: '1rem', padding: '5px 9px', lineHeight: 1, flexShrink: 0 }}
              >›</button>
            </div>
          )}
          <div
            className="md-content"
            dangerouslySetInnerHTML={{ __html: isNumPanel ? (numTabHtml[numTab] || '') : panelHtml }}
          />
        </div>
      </div>
    </>
  );
}
