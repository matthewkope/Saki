'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

interface SavedDate { id?: string; name: string; month: string; day: string; year: string; }

interface Props {
  currentMm: string;
  currentDd: string;
  currentYyyy: string;
  onSelect: (m: string, d: string, y: string) => void;
}

const LS_KEY = 'saki_saved_dates';

export default function SavedDates({ currentMm, currentDd, currentYyyy, onSelect }: Props) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [saved, setSaved] = useState<SavedDate[]>([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Load saved dates — from Supabase if logged in, localStorage otherwise
  useEffect(() => {
    if (userId) {
      loadFromSupabase(userId);
    } else {
      try { setSaved(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); } catch {}
    }
  }, [userId]);

  async function loadFromSupabase(uid: string) {
    const { data } = await supabase
      .from('saved_dates')
      .select('id, name, month, day, year')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });

    if (!data) return;

    // Migrate any localStorage dates up to Supabase on first login
    const local: SavedDate[] = (() => {
      try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
    })();

    if (local.length > 0) {
      const existing = new Set(data.map((d: SavedDate) => `${d.name}|${d.month}|${d.day}|${d.year}`));
      const toUpload = local.filter(l => !existing.has(`${l.name}|${l.month}|${l.day}|${l.year}`));
      if (toUpload.length > 0) {
        await supabase.from('saved_dates').insert(
          toUpload.map(l => ({ user_id: uid, name: l.name, month: l.month, day: l.day, year: l.year }))
        );
        localStorage.removeItem(LS_KEY);
        // Reload after migration
        const { data: fresh } = await supabase
          .from('saved_dates')
          .select('id, name, month, day, year')
          .eq('user_id', uid)
          .order('created_at', { ascending: true });
        setSaved(fresh ?? []);
        return;
      }
      localStorage.removeItem(LS_KEY);
    }

    setSaved(data);
  }

  async function saveDate() {
    const name = newName.trim();
    if (!name || !currentMm || !currentDd || !currentYyyy) return;
    const entry: SavedDate = { name, month: currentMm, day: currentDd, year: currentYyyy };

    if (userId) {
      const { data } = await supabase
        .from('saved_dates')
        .insert({ user_id: userId, ...entry })
        .select('id, name, month, day, year')
        .single();
      if (data) setSaved(prev => [...prev, data]);
    } else {
      const next = [...saved, entry];
      setSaved(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }

    setNewName('');
    setAdding(false);
  }

  async function remove(i: number) {
    const entry = saved[i];
    if (userId && entry.id) {
      await supabase.from('saved_dates').delete().eq('id', entry.id);
    } else {
      const next = saved.filter((_, idx) => idx !== i);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
    setSaved(prev => prev.filter((_, idx) => idx !== i));
  }

  function openPopover() {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: r.left });
    setOpen(o => !o);
    setAdding(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); setAdding(false); } }
    function onClickOutside(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) { setOpen(false); setAdding(false); }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClickOutside); };
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={openPopover} style={iconBtnStyle} title="Saved dates">
        🔖
      </button>

      {open && (
        <div ref={popoverRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1000, ...popoverStyle }}>
          {saved.map((s, i) => (
            <div
              key={s.id ?? i}
              style={rowStyle}
              onClick={() => { onSelect(s.month, s.day, s.year); setOpen(false); setAdding(false); }}
            >
              <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '0.85rem' }}>{s.name}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '6px' }}>
                {s.month}/{s.day}/{s.year}
              </span>
              <button onClick={(e) => { e.stopPropagation(); remove(i); }} style={xBtnStyle}>×</button>
            </div>
          ))}

          {saved.length > 0 && <div style={dividerStyle} />}

          {adding ? (
            <div style={{ display: 'flex', gap: '6px', padding: '8px 12px', alignItems: 'center' }}>
              <input
                autoFocus
                placeholder="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveDate(); if (e.key === 'Escape') setAdding(false); }}
                style={nameInputStyle}
              />
              <button onClick={saveDate} style={saveBtnStyle}>Save</button>
            </div>
          ) : (
            <div style={saveRowStyle} onClick={() => setAdding(true)}>
              + Save current date
            </div>
          )}
        </div>
      )}
    </>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.9rem', opacity: 0.5, padding: '4px',
  lineHeight: 1, transition: 'opacity 0.15s',
};
const popoverStyle: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '12px', minWidth: '200px', maxWidth: '280px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  overflow: 'hidden',
};
const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', padding: '8px 12px',
  cursor: 'pointer', gap: '4px',
  transition: 'background 0.1s',
};
const xBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', fontSize: '0.9rem', marginLeft: 'auto',
  padding: '0 2px', lineHeight: 1,
};
const dividerStyle: React.CSSProperties = {
  height: '1px', background: 'var(--border)', margin: '0 12px',
};
const saveRowStyle: React.CSSProperties = {
  padding: '8px 12px', color: 'var(--teal)', fontSize: '0.82rem',
  cursor: 'pointer',
};
const saveBtnStyle: React.CSSProperties = {
  background: 'rgba(96,208,192,0.1)', border: '1px solid rgba(96,208,192,0.25)',
  color: 'var(--teal)', borderRadius: '8px', padding: '3px 10px',
  fontSize: '0.75rem', cursor: 'pointer',
};
const nameInputStyle: React.CSSProperties = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  color: 'var(--text)', borderRadius: '8px', padding: '4px 8px',
  fontSize: '0.8rem', outline: 'none', flex: 1,
};
