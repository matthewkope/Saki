'use client';

import { useState } from 'react';
import { calcLP } from '@/lib/numerology';
import { getEasternAnimal, getWesternSign } from '@/lib/astrology';

// ============================================================
// CONSTANTS
// ============================================================
const LP_OPTIONS: (number | string)[] = [1, 3, 4, '13/4', 5, 6, 7, 8, 9, 11, 22, 28, 33, '33/6'];
const ZODIAC_OPTIONS = ['Rat','Ox','Tiger','Cat','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
const WESTERN_OPTIONS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const ANIMAL_EMOJI: Record<string, string> = {
  Rat: '🐭', Ox: '🐂', Tiger: '🐯', Cat: '🐱', Dragon: '🐉', Snake: '🐍',
  Horse: '🐴', Goat: '🐐', Monkey: '🐒', Rooster: '🐓', Dog: '🐕', Pig: '🐷',
};
const WESTERN_EMOJI: Record<string, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋', Leo: '♌', Virgo: '♍',
  Libra: '♎', Scorpio: '♏', Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ============================================================
// HELPERS
// ============================================================
function formatDistance(delta: number, dir: string): string {
  if (delta === 0) return 'Reference date';
  if (delta < 7) return delta + (delta === 1 ? ' day ' : ' days ') + dir;
  if (delta < 30) {
    const w = Math.round(delta / 7);
    return w + (w === 1 ? ' week ' : ' weeks ') + dir;
  }
  if (delta < 365) {
    const mo = Math.round(delta / 30.44);
    return mo + (mo === 1 ? ' month ' : ' months ') + dir;
  }
  const yrs = Math.floor(delta / 365);
  const rem = delta - yrs * 365;
  const mo = Math.round(rem / 30.44);
  let s = yrs + (yrs === 1 ? ' year' : ' years');
  if (mo > 0) s += ', ' + mo + (mo === 1 ? ' month' : ' months');
  return s + ' ' + dir;
}

function todayStr(): string {
  const t = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
}

// ============================================================
// TYPES
// ============================================================
interface MatchResult {
  y: number; m: number; day: number;
  lp: number; lpDisplay: string;
  east: string; west: string;
  delta: number; dir: string;
}

type FilterKey = 'numerology' | 'zodiac' | 'western';

// ============================================================
// COMPONENT
// ============================================================
export default function SearchPage() {
  const [refDate, setRefDate] = useState(todayStr);
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null);
  const [selected, setSelected] = useState<{ numerology: string | null; zodiac: string | null; western: string | null }>({
    numerology: null, zodiac: null, western: null,
  });
  const [filterIcons, setFilterIcons] = useState({
    numerology: '🔮', zodiac: '🐉', western: '♈',
  });
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  function toggleFilter(key: FilterKey) {
    setActiveFilter((prev) => prev === key ? null : key);
  }

  function selectOption(key: FilterKey, val: string) {
    setSelected((prev) => {
      const same = prev[key] === val;
      const next = { ...prev, [key]: same ? null : val };
      return next;
    });
    // Update icon for zodiac/western
    if (key === 'zodiac' && selected[key] !== val) {
      setFilterIcons((prev) => ({ ...prev, zodiac: ANIMAL_EMOJI[val] || '🐉' }));
    } else if (key === 'zodiac') {
      setFilterIcons((prev) => ({ ...prev, zodiac: '🐉' }));
    }
    if (key === 'western' && selected[key] !== val) {
      setFilterIcons((prev) => ({ ...prev, western: WESTERN_EMOJI[val] || '♈' }));
    } else if (key === 'western') {
      setFilterIcons((prev) => ({ ...prev, western: '♈' }));
    }
  }

  function clearFilter(key: FilterKey) {
    setSelected((prev) => ({ ...prev, [key]: null }));
    if (key === 'zodiac') setFilterIcons((prev) => ({ ...prev, zodiac: '🐉' }));
    if (key === 'western') setFilterIcons((prev) => ({ ...prev, western: '♈' }));
  }

  function runSearch() {
    setActiveFilter(null);
    setErrorMsg('');

    if (!refDate) {
      setErrorMsg('Please enter a reference date.');
      return;
    }
    const [refY, refM, refD] = refDate.split('-').map(Number);
    const refMs = Date.UTC(refY, refM - 1, refD);

    const hasFilter = selected.numerology !== null || selected.zodiac !== null || selected.western !== null;
    if (!hasFilter) {
      setErrorMsg('Please select at least one filter (Lifepath, Zodiac, or Western).');
      return;
    }

    const SEARCH_DAYS = 365 * 10;
    const found: MatchResult[] = [];

    for (let delta = 0; delta <= SEARCH_DAYS; delta++) {
      const deltas = delta === 0 ? [0] : [delta, -delta];
      for (const d of deltas) {
        const ms = refMs + d * 86400000;
        const dt = new Date(ms);
        const y = dt.getUTCFullYear();
        const mo = dt.getUTCMonth() + 1;
        const day = dt.getUTCDate();

        const lpData = calcLP(mo, day, y);
        const east = getEasternAnimal(mo, day, y);
        const west = getWesternSign(mo, day);

        let lpMatch = true;
        if (selected.numerology !== null) {
          const s = selected.numerology;
          if (s === '13/4') lpMatch = lpData.karmic13;
          else if (s === '33') lpMatch = lpData.lp === 33 && lpData.pure33;
          else if (s === '33/6') lpMatch = lpData.lp === 33 && !lpData.pure33;
          else lpMatch = lpData.lp === parseInt(s);
        }
        const eaMatch = selected.zodiac === null || selected.zodiac === east;
        const wsMatch = selected.western === null || selected.western === west;

        if (lpMatch && eaMatch && wsMatch) {
          found.push({ y, m: mo, day, lp: lpData.lp, lpDisplay: lpData.display, east, west, delta: Math.abs(d), dir: d >= 0 ? 'after' : 'before' });
          if (found.length >= 20) break;
        }
      }
      if (found.length >= 20) break;
    }

    setMatches(found);
  }

  const lpVal = selected.numerology ?? 'Any';
  const zodVal = selected.zodiac ?? 'Any';
  const wesVal = selected.western ?? 'Any';

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div className="app-title">Date Search</div>
        <div className="app-subtitle">Find dates by numerology &amp; astrology</div>
      </div>

      {/* Reference Date */}
      <div className="section-label">Reference Date</div>
      <div className="date-input-wrap">
        <input
          type="date"
          className="date-input"
          value={refDate}
          onChange={(e) => setRefDate(e.target.value)}
        />
      </div>

      {/* Filter Boxes */}
      <div className="section-label">Filter By</div>
      <div className="filters-row">
        <div
          className={`filter-box${activeFilter === 'numerology' ? ' active' : ''}${selected.numerology ? ' has-value' : ''}`}
          onClick={() => toggleFilter('numerology')}
        >
          <div className="filter-icon">{filterIcons.numerology}</div>
          <div className="filter-label">Lifepath</div>
          <div className="filter-value">{lpVal}</div>
        </div>
        <div
          className={`filter-box${activeFilter === 'zodiac' ? ' active' : ''}${selected.zodiac ? ' has-value' : ''}`}
          onClick={() => toggleFilter('zodiac')}
        >
          <div className="filter-icon">{filterIcons.zodiac}</div>
          <div className="filter-label">Zodiac</div>
          <div className="filter-value">{zodVal}</div>
        </div>
        <div
          className={`filter-box${activeFilter === 'western' ? ' active' : ''}${selected.western ? ' has-value' : ''}`}
          onClick={() => toggleFilter('western')}
        >
          <div className="filter-icon">{filterIcons.western}</div>
          <div className="filter-label">Western</div>
          <div className="filter-value">{wesVal}</div>
        </div>
      </div>

      {/* Numerology Dropdown */}
      {activeFilter === 'numerology' && (
        <div className="filter-dropdown open">
          <div className="dd-header">
            <span className="dd-title">Select Lifepath</span>
            <button className="dd-clear" onClick={() => clearFilter('numerology')}>Clear</button>
          </div>
          <div className="option-grid">
            {LP_OPTIONS.map((lp) => {
              const label = String(lp);
              return (
                <div
                  key={label}
                  className={`option-pill${selected.numerology === label ? ' selected' : ''}`}
                  onClick={() => selectOption('numerology', label)}
                >{label}</div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zodiac Dropdown */}
      {activeFilter === 'zodiac' && (
        <div className="filter-dropdown open">
          <div className="dd-header">
            <span className="dd-title">Select Zodiac Animal</span>
            <button className="dd-clear" onClick={() => clearFilter('zodiac')}>Clear</button>
          </div>
          <div className="option-grid">
            {ZODIAC_OPTIONS.map((animal) => (
              <div
                key={animal}
                className={`option-pill${selected.zodiac === animal ? ' selected' : ''}`}
                onClick={() => selectOption('zodiac', animal)}
              >{(ANIMAL_EMOJI[animal] || '') + ' ' + animal}</div>
            ))}
          </div>
        </div>
      )}

      {/* Western Dropdown */}
      {activeFilter === 'western' && (
        <div className="filter-dropdown open">
          <div className="dd-header">
            <span className="dd-title">Select Western Sign</span>
            <button className="dd-clear" onClick={() => clearFilter('western')}>Clear</button>
          </div>
          <div className="option-grid">
            {WESTERN_OPTIONS.map((sign) => (
              <div
                key={sign}
                className={`option-pill${selected.western === sign ? ' selected' : ''}`}
                onClick={() => selectOption('western', sign)}
              >{(WESTERN_EMOJI[sign] || '') + ' ' + sign}</div>
            ))}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="empty-state" style={{ padding: '12px 0', color: 'var(--rose)' }}>{errorMsg}</div>
      )}

      <button className="search-btn" onClick={runSearch}>Find Dates</button>

      {/* Results */}
      {matches !== null && (
        <div>
          <div className="results-header">
            {matches.length === 0 ? 'No matches found' : matches.length + ' match' + (matches.length !== 1 ? 'es' : '') + ' found'}
          </div>
          <div className="result-list">
            {matches.length === 0 ? (
              <div className="empty-state">Try widening your search by removing a filter.</div>
            ) : matches.map((r, i) => (
              <div
                key={`${r.y}-${r.m}-${r.day}`}
                className="result-card"
                style={{ animationDelay: (i * 0.04) + 's' }}
              >
                <div className="rc-date-block">
                  <div className="rc-day">{r.day}</div>
                  <div className="rc-month-year">{MONTH_SHORT[r.m - 1]} {r.y}</div>
                </div>
                <div className="rc-divider" />
                <div className="rc-details">
                  <div className="rc-distance">{formatDistance(r.delta, r.dir)}</div>
                  <div className="rc-badges">
                    <span className={`rc-badge${selected.numerology ? ' match' : ''}`}>LP {r.lpDisplay}</span>
                    <span className={`rc-badge${selected.zodiac ? ' match' : ''}`}>{ANIMAL_EMOJI[r.east] || ''} {r.east}</span>
                    <span className={`rc-badge${selected.western ? ' match' : ''}`}>{WESTERN_EMOJI[r.west] || ''} {r.west}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
