'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

interface SavedAncientName {
  id?: string;
  name: string;
  full_name: string;
  daily_name: string;
}

interface Props {
  currentFullName: string;
  currentDailyName: string;
  onSelect: (fullName: string, dailyName: string) => void;
}

const LS_KEY = 'saki_saved_ancient_names';

function loadLocalSavedAncientNames(): SavedAncientName[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function SavedAncientNames({ currentFullName, currentDailyName, onSelect }: Props) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;

  const [saved, setSaved] = useState<SavedAncientName[]>([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) {
      loadFromSupabase(userId);
    } else {
      setSaved(loadLocalSavedAncientNames());
    }
  }, [userId]);

  async function loadFromSupabase(uid: string) {
    try {
      const { data, error } = await supabase
        .from('saved_ancient_names')
        .select('id, name, full_name, daily_name')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (!data) {
        setSaved(loadLocalSavedAncientNames());
        return;
      }

      const local = loadLocalSavedAncientNames();

      if (local.length > 0) {
        const existing = new Set(data.map((d: SavedAncientName) => `${d.name}|${d.full_name}|${d.daily_name}`));
        const toUpload = local.filter((entry) => !existing.has(`${entry.name}|${entry.full_name}|${entry.daily_name}`));

        if (toUpload.length > 0) {
          const { error: insertError } = await supabase.from('saved_ancient_names').insert(
            toUpload.map((entry) => ({
              user_id: uid,
              name: entry.name,
              full_name: entry.full_name,
              daily_name: entry.daily_name,
            }))
          );

          if (insertError) throw insertError;

          localStorage.removeItem(LS_KEY);

          const { data: fresh, error: freshError } = await supabase
            .from('saved_ancient_names')
            .select('id, name, full_name, daily_name')
            .eq('user_id', uid)
            .order('created_at', { ascending: true });

          if (freshError) throw freshError;
          setSaved(fresh ?? []);
          return;
        }

        localStorage.removeItem(LS_KEY);
      }

      setSaved(data);
    } catch {
      setSaved(loadLocalSavedAncientNames());
    }
  }

  async function saveNames() {
    const name = newName.trim();
    const fullName = currentFullName.trim();
    const dailyName = currentDailyName.trim();
    if (!name || !fullName || !dailyName) return;

    const entry: SavedAncientName = { name, full_name: fullName, daily_name: dailyName };

    if (userId) {
      try {
        const { data, error } = await supabase
          .from('saved_ancient_names')
          .insert({ user_id: userId, ...entry })
          .select('id, name, full_name, daily_name')
          .single();

        if (error || !data) throw error;
        setSaved((prev) => [...prev, data]);
      } catch {
        const next = [...saved, entry];
        setSaved(next);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      }
    } else {
      const next = [...saved, entry];
      setSaved(next);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }

    setNewName('');
    setAdding(false);
  }

  async function remove(index: number) {
    const entry = saved[index];
    if (userId && entry.id) {
      try {
        await supabase.from('saved_ancient_names').delete().eq('id', entry.id);
      } catch {}
    } else {
      const next = saved.filter((_, idx) => idx !== index);
      localStorage.setItem(LS_KEY, JSON.stringify(next));
    }
    setSaved((prev) => prev.filter((_, idx) => idx !== index));
  }

  function openPopover() {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 6, left: Math.max(12, rect.left - 180) });
    setOpen((prev) => !prev);
    setAdding(false);
  }

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setAdding(false);
      }
    }

    function onClickOutside(e: MouseEvent) {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setAdding(false);
      }
    }

    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open]);

  return (
    <>
      <button ref={btnRef} onClick={openPopover} style={iconBtnStyle} title="Saved names">
        🔖
      </button>

      {open && (
        <div ref={popoverRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 1000, ...popoverStyle }}>
          {saved.map((entry, index) => (
            <div
              key={entry.id ?? index}
              style={rowStyle}
              onClick={() => {
                onSelect(entry.full_name, entry.daily_name);
                setOpen(false);
                setAdding(false);
              }}
            >
              <div style={{ minWidth: 0, fontWeight: 600, color: 'var(--accent)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {entry.name}
              </div>
              <button onClick={(e) => { e.stopPropagation(); remove(index); }} style={xBtnStyle}>×</button>
            </div>
          ))}

          {saved.length > 0 && <div style={dividerStyle} />}

          {adding ? (
            <div style={{ display: 'flex', gap: '6px', padding: '8px 12px', alignItems: 'center' }}>
              <input
                autoFocus
                placeholder="Save as"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveNames();
                  if (e.key === 'Escape') setAdding(false);
                }}
                style={nameInputStyle}
              />
              <button onClick={saveNames} style={saveBtnStyle}>Save</button>
            </div>
          ) : (
            <div style={saveRowStyle} onClick={() => setAdding(true)}>
              + Save current names
            </div>
          )}
        </div>
      )}
    </>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  color: 'var(--text-dim)',
  padding: '12px 14px',
  lineHeight: 1,
  transition: 'opacity 0.15s',
  flexShrink: 0,
};

const popoverStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  minWidth: '240px',
  maxWidth: '320px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  overflow: 'hidden',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: '10px 12px',
  cursor: 'pointer',
  gap: '8px',
  transition: 'background 0.1s',
};

const xBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  fontSize: '0.9rem',
  marginLeft: 'auto',
  padding: '0 2px',
  lineHeight: 1,
  flexShrink: 0,
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  background: 'var(--border)',
  margin: '0 12px',
};

const saveRowStyle: React.CSSProperties = {
  padding: '8px 12px',
  color: 'var(--teal)',
  fontSize: '0.82rem',
  cursor: 'pointer',
};

const saveBtnStyle: React.CSSProperties = {
  background: 'rgba(96,208,192,0.1)',
  border: '1px solid rgba(96,208,192,0.25)',
  color: 'var(--teal)',
  borderRadius: '8px',
  padding: '3px 10px',
  fontSize: '0.75rem',
  cursor: 'pointer',
};

const nameInputStyle: React.CSSProperties = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: '8px',
  padding: '4px 8px',
  fontSize: '0.8rem',
  outline: 'none',
  flex: 1,
};
