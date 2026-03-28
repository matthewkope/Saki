'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { calcScore, ScoreResult } from '@/lib/compatibility';

// Make sure these are typed as integers
interface Entity {
  id: string;
  name: string;
  month: number;
  day: number;
  year: number;
  type: string;
  category: string;
}

interface RankedEntity extends Entity {
  calc: ScoreResult;
}

export default function EntityMatchPage() {
  const [refMonth, setRefMonth] = useState('1');
  const [refDay, setRefDay] = useState('1');
  const [refYear, setRefYear] = useState('2000');

  const [entities, setEntities] = useState<Entity[]>([]);
  const [ranked, setRanked] = useState<RankedEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all entities once on mount
  useEffect(() => {
    async function fetchEntities() {
      setLoading(true);
      const { data, error } = await supabase.from('entities').select('*');
      if (error) {
        // If the table isn't created or URL is missing, it will error out cleanly here
        setErrorMsg('Failed to connect to database. Did you set up .env.local and run the SQL?');
        console.error(error);
      } else if (data) {
        setEntities(data);
      }
      setLoading(false);
    }
    fetchEntities();
  }, []);

  // Recalculate anytime the user clicks "Calculate" or entities load
  function handleCalculate() {
    if (!entities || entities.length === 0) return;

    const rM = parseInt(refMonth);
    const rD = parseInt(refDay);
    const rY = parseInt(refYear);

    // Filter array to map scores
    const results = entities.map(e => {
      const calc = calcScore(
        { month: rM, day: rD, year: rY },
        { month: e.month, day: e.day, year: e.year }
      );
      return { ...e, calc };
    });

    results.sort((a, b) => b.calc.score - a.calc.score);
    setRanked(results);
  }

  // Auto calculate when entities are loaded (if valid defaults)
  useEffect(() => {
    if (entities.length > 0) {
      handleCalculate();
    }
  }, [entities]);

  const daysInMonth = (m: number) => new Date(2024, m, 0).getDate(); // Safe approximation

  function getTierClass(score: number) {
    if (score >= 75) return 'tier-friendly';
    if (score >= 60) return 'tier-neutral';
    return 'tier-enemy';
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div className="app-title">Celebrity Match</div>
        <div className="app-subtitle">Compare yourself against the rich and famous</div>
      </div>

      <div className="section-label">Your Birthday</div>
      <div className="date-input-wrap">
        <select className="date-input" value={refMonth} onChange={(e) => setRefMonth(e.target.value)}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'short' })}</option>
          ))}
        </select>
        <select className="date-input" value={refDay} onChange={(e) => setRefDay(e.target.value)}>
          {[...Array(daysInMonth(parseInt(refMonth)))].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <input 
          className="date-input" 
          type="number" 
          value={refYear} 
          onChange={(e) => setRefYear(e.target.value.slice(0, 4))} 
          placeholder="YYYY"
        />
      </div>

      <button className="calc-btn" onClick={handleCalculate} disabled={loading}>
        {loading ? 'Connecting to Database...' : 'Match Me!'}
      </button>

      {errorMsg && (
        <div className="empty-state" style={{ color: 'var(--rose)', marginTop: '20px' }}>
          {errorMsg}
        </div>
      )}

      {ranked.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <div className="results-header">Displaying {ranked.length} Matches</div>
          
          <div className="result-list">
            {ranked.map((r, i) => (
              <div key={r.id} className="result-card" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="rc-date-block">
                  <div className="rc-day" style={{ fontSize: '24px' }}>{r.calc.score}%</div>
                  <div className="rc-month-year">{getTierClass(r.calc.score).split('-')[1].toUpperCase()}</div>
                </div>
                <div className="rc-divider"></div>
                <div className="rc-details">
                  <div className="rc-distance">{r.name}</div>
                  <div className="rc-badges">
                    <span className="rc-badge">{r.type} - {r.category}</span>
                    <span className="rc-badge">LP {r.calc.lp2.display}</span>
                    <span className="rc-badge">{r.calc.east2.animal} &amp; {r.calc.west2.sign}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {ranked.length === 0 && !loading && !errorMsg && (
        <div className="empty-state">No celebrities found in the database yet.</div>
      )}

    </div>
  );
}
