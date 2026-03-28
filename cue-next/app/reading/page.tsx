'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { calcLP, calcSLP, calcPersonalYear, calcLuckyNumber } from '@/lib/numerology';
import { getEasternAnimal, getWesternSign } from '@/lib/astrology';
import { CONTENT } from '@/lib/content';

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

// ============================================================
// TYPES
// ============================================================
interface ReadingData {
  lp: number;
  slp: number;
  lpDisplay: string;
  animal: string;
  sign: string;
  py: number;
  pyDisplay: string;
  lucky: number;
}

type PanelType = 'numerology' | 'zodiac' | 'western' | 'careers' | 'personalYear';

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

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h3>' + esc(line.slice(4)) + '</h3>';
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h2>' + esc(line.slice(3)) + '</h2>';
    } else if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h1>' + esc(line.slice(2)) + '</h1>';
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += '<li>' + esc(line.slice(2)) + '</li>';
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p>' + esc(line) + '</p>';
    }
  }

  if (inList) html += '</ul>';
  return html;
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelEmoji, setPanelEmoji] = useState('');
  const [panelTitle, setPanelTitle] = useState('');
  const [panelHtml, setPanelHtml] = useState('');

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
    const sign = getWesternSign(m, d);
    const pyData = calcPersonalYear(m, d);
    const lucky = calcLuckyNumber(m, d, y);

    setError('');
    setReading({
      lp: lpData.lp,
      slp,
      lpDisplay: lpData.display,
      animal,
      sign,
      py: pyData.py,
      pyDisplay: pyData.display,
      lucky,
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

    if (type === 'numerology') {
      key = reading.lp;
      text = (CONTENT.numerology as Record<number, string>)[key] || ('# ' + key + ' Life Path\n\nContent coming soon.');
      em = '🔮';
      label = key + ' Life Path';
    } else if (type === 'zodiac') {
      key = reading.animal;
      text = (CONTENT.zodiac as Record<string, string>)[key] || ('# The ' + key + '\n\nContent coming soon.');
      em = ZODIAC_EMOJIS[key] || '🌙';
      label = 'The ' + key;
    } else if (type === 'western') {
      key = reading.sign;
      text = (CONTENT.western as Record<string, string>)[key] || ('# ' + key + '\n\nContent coming soon.');
      em = WEST_EMOJIS[key] || '✨';
      label = key;
    } else if (type === 'careers') {
      key = reading.lp;
      text = (CONTENT.careers as Record<number, string>)[key] || '# Careers\n\nContent coming soon.';
      em = '💼';
      label = key + ' Life Path — Careers';
    } else {
      // personalYear
      key = reading.py;
      text = (CONTENT.personalYear as Record<number, string>)[key] || '# Personal Year\n\nContent coming soon.';
      em = '🗓️';
      label = 'Personal Year ' + reading.pyDisplay;
    }

    setPanelEmoji(em);
    setPanelTitle(label as string);
    setPanelHtml(renderMarkdown(text));
    setPanelOpen(true);
    document.body.style.overflow = 'hidden';
    setTimeout(() => { if (panelRef.current) panelRef.current.scrollTop = 0; }, 50);
  }

  function closePanel() {
    setPanelOpen(false);
    document.body.style.overflow = '';
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* Sticky Input */}
      <div className="input-section">
        <div className="input-inner">
          <div className="app-title">Saki</div>
          <div className="app-subtitle">Personal Reading</div>
          <div className="date-group">
            <div className="date-label">Date of Birth</div>
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
                <div className="reading-lp">{reading.lpDisplay}</div>
                <div className="reading-lp-label">Life Path</div>
              </div>
              <div className="reading-rows">
                <div className="reading-row">
                  <span className="reading-key">Secondary Lifepath</span>
                  <span className="reading-val accent">{reading.slp}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Zodiac</span>
                  <span className="reading-val gold">{ZODIAC_EMOJIS[reading.animal]} {reading.animal}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Western Astrology</span>
                  <span className="reading-val teal">{WEST_EMOJIS[reading.sign]} {reading.sign}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Personal Year</span>
                  <span className="reading-val" style={{ color: 'var(--gold)' }}>🗓️ {reading.pyDisplay}</span>
                </div>
                <div className="reading-row">
                  <span className="reading-key">Lucky Number</span>
                  <span className="reading-val" style={{ color: 'var(--rose)' }}>🍀 {reading.lucky}</span>
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
              <div className="tile" onClick={() => openPanel('careers')}>
                <div className="tile-emoji">💼</div>
                <div className="tile-label">Careers</div>
              </div>
              <div className="tile" onClick={() => openPanel('personalYear')}>
                <div className="tile-emoji">🗓️</div>
                <div className="tile-label">Personal Year</div>
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
          <div
            className="md-content"
            dangerouslySetInnerHTML={{ __html: panelHtml }}
          />
        </div>
      </div>
    </>
  );
}
