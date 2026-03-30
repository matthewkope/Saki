'use client';
import { useState, useEffect } from 'react';

interface SavedDate { name: string; month: string; day: string; year: string; }

interface Props {
  currentMm: string;
  currentDd: string;
  currentYyyy: string;
  onSelect: (m: string, d: string, y: string) => void;
  onSelectP2?: (m: string, d: string, y: string) => void;
}

const KEY = 'saki_saved_dates';

export default function SavedDates({ currentMm, currentDd, currentYyyy, onSelect, onSelectP2 }: Props) {
  const [saved, setSaved] = useState<SavedDate[]>([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {}
  }, []);

  function persist(list: SavedDate[]) {
    setSaved(list);
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function saveDate() {
    const name = newName.trim();
    if (!name || !currentMm || !currentDd || !currentYyyy) return;
    persist([...saved, { name, month: currentMm, day: currentDd, year: currentYyyy }]);
    setNewName('');
    setAdding(false);
  }

  function remove(i: number) {
    persist(saved.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ marginTop: '10px', textAlign: 'center' }}>
      {/* Toggle row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
        {saved.length > 0 && (
          <button onClick={() => { setOpen(o => !o); setAdding(false); }} style={ghostBtnStyle}>
            {open ? 'Hide saved dates' : `Saved dates (${saved.length})`}
          </button>
        )}
        <button onClick={() => { setAdding(a => !a); setOpen(false); }} style={addBtnStyle}>
          {adding ? '× Cancel' : '+ Save this date'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
          <input
            autoFocus
            placeholder="Name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveDate(); if (e.key === 'Escape') setAdding(false); }}
            style={nameInputStyle}
          />
          <button onClick={saveDate} style={addBtnStyle}>Save</button>
        </div>
      )}

      {/* Saved list */}
      {open && saved.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
          {saved.map((s, i) => (
            <div key={i} style={chipStyle}>
              <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.8rem' }}>{s.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginLeft: '4px' }}>
                {s.month}/{s.day}/{s.year}
              </span>
              {onSelectP2 ? (
                <>
                  <button onClick={() => onSelect(s.month, s.day, s.year)} style={slotBtnStyle}>P1</button>
                  <button onClick={() => onSelectP2(s.month, s.day, s.year)} style={slotBtnStyle}>P2</button>
                </>
              ) : (
                <button onClick={() => onSelect(s.month, s.day, s.year)} style={slotBtnStyle}>↑</button>
              )}
              <button onClick={() => remove(i)} style={removeBtnStyle}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const chipStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '4px',
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: '20px', padding: '4px 10px', fontSize: '0.8rem',
};
const slotBtnStyle: React.CSSProperties = {
  background: 'rgba(96,208,192,0.15)', border: '1px solid rgba(96,208,192,0.3)',
  color: 'var(--teal)', borderRadius: '10px', padding: '1px 6px',
  fontSize: '0.65rem', cursor: 'pointer', fontWeight: 600,
};
const removeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', fontSize: '0.9rem', padding: '0 2px', lineHeight: 1,
};
const addBtnStyle: React.CSSProperties = {
  background: 'rgba(96,208,192,0.1)', border: '1px solid rgba(96,208,192,0.25)',
  color: 'var(--teal)', borderRadius: '20px', padding: '4px 12px',
  fontSize: '0.75rem', cursor: 'pointer',
};
const ghostBtnStyle: React.CSSProperties = {
  background: 'none', border: '1px solid var(--border)',
  color: 'var(--text-muted)', borderRadius: '20px', padding: '4px 12px',
  fontSize: '0.75rem', cursor: 'pointer',
};
const nameInputStyle: React.CSSProperties = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  color: 'var(--text)', borderRadius: '12px', padding: '4px 10px',
  fontSize: '0.8rem', outline: 'none', width: '110px',
};
