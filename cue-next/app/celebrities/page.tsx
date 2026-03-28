'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const LP_ORDER = ['1','3','4','5','6','7','8','9','11','22','28','33','33/6'];
const EAST_ALL = ['Rat','Ox','Tiger','Cat','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
const WEST_ALL = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

interface Celebrity {
    id: number;
    name: string;
    life_path: string;
    eastern_zodiac: string;
    western_zodiac: string;
    image_url: string | null;
    month: number | null;
    day: number | null;
    year: number | null;
}

function toggle(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function PillGroup({ label, options, active, onToggle, color }: {
    label: string; options: string[]; active: string[];
    onToggle: (v: string) => void; color?: string;
}) {
    const accent = color || 'var(--accent, #60d0c0)';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {options.map(opt => {
                    const on = active.includes(opt);
                    return (
                        <button key={opt} onClick={() => onToggle(opt)} style={{
                            padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
                            border: `1px solid ${on ? accent : '#333'}`,
                            background: on ? `${accent}22` : 'transparent',
                            color: on ? accent : '#666',
                            transition: 'all 0.15s',
                        }}>{opt}</button>
                    );
                })}
            </div>
        </div>
    );
}

export default function CelebritiesPage() {
    const router = useRouter();
    const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filterLP, setFilterLP] = useState<string[]>([]);
    const [filterEast, setFilterEast] = useState<string[]>([]);
    const [filterWest, setFilterWest] = useState<string[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        supabase.from('celebrities').select('*').order('name').then(({ data, error }) => {
            if (error) setError('Failed to load celebrities.');
            else setCelebrities(data || []);
            setLoading(false);
        });
    }, []);

    const lpOptions = useMemo(() => {
        const present = new Set(celebrities.map(c => c.life_path));
        return LP_ORDER.filter(lp => present.has(lp));
    }, [celebrities]);

    const visible = useMemo(() => celebrities.filter(c => {
        if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterLP.length > 0 && !filterLP.includes(c.life_path)) return false;
        if (filterEast.length > 0 && !filterEast.includes(c.eastern_zodiac)) return false;
        if (filterWest.length > 0 && !filterWest.includes(c.western_zodiac)) return false;
        return true;
    }), [celebrities, search, filterLP, filterEast, filterWest]);

    const totalActive = filterLP.length + filterEast.length + filterWest.length;
    const clearAll = () => { setFilterLP([]); setFilterEast([]); setFilterWest([]); };

    if (loading) return <div className="placeholder-msg">Loading celebrities...</div>;
    if (error) return <div className="placeholder-msg" style={{ color: 'var(--rose)' }}>{error}</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.6rem', color: 'var(--accent,#60d0c0)', margin: '0 0 6px', letterSpacing: '0.02em' }}>
                    Celebrities
                </h1>
                <p style={{ color: '#555', margin: 0, fontSize: '0.95rem' }}>
                    {visible.length}{visible.length !== celebrities.length ? ` of ${celebrities.length}` : ''} entries
                </p>
            </div>

            {/* Search + Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>

                {/* Search bar */}
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by name..."
                    style={{ padding: '12px 16px', background: '#0a0a0a', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                />

                {/* Filter panel */}
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px' }}>
                        <div onClick={() => setFilterOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                            <span style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Filters {totalActive > 0 && <span style={{ color: 'var(--accent,#60d0c0)', marginLeft: '6px' }}>({totalActive} active)</span>}
                            </span>
                            <span style={{ color: '#555', fontSize: '0.85rem' }}>{filterOpen ? '▲' : '▼'}</span>
                        </div>
                        {totalActive > 0 && (
                            <button onClick={clearAll} style={{ background: 'transparent', color: 'var(--rose,#ff6070)', border: '1px solid var(--rose,#ff6070)', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem' }}>
                                Clear all
                            </button>
                        )}
                    </div>
                    {filterOpen && (
                        <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '2px' }} />
                            <PillGroup label="Life Path" options={lpOptions} active={filterLP} onToggle={v => setFilterLP(toggle(filterLP, v))} />
                            <PillGroup label="Eastern Zodiac" options={EAST_ALL} active={filterEast} onToggle={v => setFilterEast(toggle(filterEast, v))} color="var(--gold,#f0d080)" />
                            <PillGroup label="Western Zodiac" options={WEST_ALL} active={filterWest} onToggle={v => setFilterWest(toggle(filterWest, v))} color="#a78bfa" />
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            {visible.length > 0 ? (
                <div style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Name', 'Life Path', 'Eastern', 'Western'].map(h => (
                            <span key={h} style={{ fontSize: '0.72rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                        ))}
                    </div>

                    {/* Rows */}
                    {visible.map((c, i) => (
                        <div key={c.id}
                            onClick={() => router.push(`/compatibility/celebrities/${c.id}`)}
                            style={{
                                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
                                padding: '16px 20px', cursor: 'pointer',
                                borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                background: 'rgba(10,10,10,0.5)', transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(96,208,192,0.05)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(10,10,10,0.5)')}
                        >
                            {/* Name + photo */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', background: '#111', flexShrink: 0, border: '1px solid #222' }}>
                                    {c.image_url
                                        ? <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '1rem' }}>★</div>
                                    }
                                </div>
                                <div>
                                    <div style={{ color: '#eee', fontWeight: 500, fontSize: '0.95rem' }}>{c.name}</div>
                                    {c.month && c.day && c.year && (
                                        <div style={{ color: '#555', fontSize: '0.78rem', marginTop: '2px' }}>{c.month}/{c.day}/{c.year}</div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: 'var(--accent,#60d0c0)', fontSize: '0.9rem', fontWeight: 500 }}>LP {c.life_path}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: 'var(--gold,#f0d080)', fontSize: '0.9rem' }}>{c.eastern_zodiac}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#a78bfa', fontSize: '0.9rem' }}>{c.western_zodiac}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#555', border: '1px dashed #2a2a2a', borderRadius: '14px' }}>
                    No celebrities match the current filters.
                </div>
            )}
        </div>
    );
}
