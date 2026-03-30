'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { calcScore, getScoreRelation } from '@/lib/compatibility';

const LP_ORDER = ['1','3','4','5','6','7','8','9','11','22','28','33','33/6'];

const EAST_TRIADS_FILTER = [
    { label: 'Rat · Dragon · Monkey', animals: ['Rat', 'Dragon', 'Monkey'] },
    { label: 'Ox · Snake · Rooster',  animals: ['Ox', 'Snake', 'Rooster']  },
    { label: 'Tiger · Horse · Dog',   animals: ['Tiger', 'Horse', 'Dog']   },
    { label: 'Cat · Goat · Pig',      animals: ['Cat', 'Goat', 'Pig']      },
];

const WEST_TRIADS_FILTER = [
    { label: 'Fire — Aries · Leo · Sagittarius',   signs: ['Aries', 'Leo', 'Sagittarius'] },
    { label: 'Earth — Taurus · Virgo · Capricorn', signs: ['Taurus', 'Virgo', 'Capricorn'] },
    { label: 'Air — Gemini · Libra · Aquarius',    signs: ['Gemini', 'Libra', 'Aquarius'] },
    { label: 'Water — Cancer · Scorpio · Pisces',  signs: ['Cancer', 'Scorpio', 'Pisces'] },
];

interface ClothingBrand {
    id: number;
    name: string;
    country: string | null;
    founded_month: number | null;
    founded_day: number | null;
    founded_year: number | null;
    life_path: string;
    eastern_zodiac: string;
    western_zodiac: string;
    image_url: string | null;
}

function toggle(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

function PillGroup({ label, options, active, onToggle, color }: {
    label: string; options: string[]; active: string[];
    onToggle: (v: string) => void; color?: string;
}) {
    const accent = color || 'var(--accent)';
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

const RELATION_DOT: Record<string, string> = {
    friendly: 'var(--teal)',
    neutral:  'var(--gold)',
    enemy:    'var(--rose)',
};

export default function ClothingPage() {
    const router = useRouter();
    const { session, loading: authLoading } = useAuth();
    const [brands, setBrands] = useState<ClothingBrand[]>([]);
    const [userBirth, setUserBirth] = useState<{ month: number; day: number; year: number } | null>(null);
    const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [filterLP, setFilterLP] = useState<string[]>([]);
    const [filterEast, setFilterEast] = useState<string[]>([]);
    const [filterWest, setFilterWest] = useState<string[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [scoreSort, setScoreSort] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput), 200);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        if (authLoading || !session) return;
        supabase.from('profiles').select('birth_month, birth_day, birth_year').eq('id', session.user.id).single()
            .then(({ data }) => {
                if (data?.birth_month) setUserBirth({ month: data.birth_month, day: data.birth_day, year: data.birth_year });
            });
        supabase.from('saved_items').select('item_id').eq('user_id', session.user.id).eq('item_type', 'clothing')
            .then(({ data }) => { if (data) setSavedIds(new Set(data.map(d => d.item_id))); });
    }, [session, authLoading]);

    useEffect(() => {
        supabase.from('clothing').select('id,name,country,founded_month,founded_day,founded_year,life_path,eastern_zodiac,western_zodiac,image_url').order('name').then(({ data, error }) => {
            if (error) setError('Failed to load brands.');
            else setBrands(data || []);
            setLoading(false);
        });
    }, []);

    const scores = useMemo(() => {
        const map = new Map<number, number>();
        if (!userBirth) return map;
        for (const b of brands) {
            if (b.founded_month && b.founded_day && b.founded_year) {
                map.set(b.id, calcScore(
                    { month: userBirth.month, day: userBirth.day, year: userBirth.year },
                    { month: b.founded_month, day: b.founded_day, year: b.founded_year }
                ).score);
            }
        }
        return map;
    }, [brands, userBirth]);

    const visible = useMemo(() => {
        const sq = search.toLowerCase();
        const filtered = brands.filter(b => {
            if (sq && !b.name.toLowerCase().startsWith(sq)) return false;
            if (filterLP.length > 0 && !filterLP.includes(b.life_path.split('/')[0])) return false;
            if (filterEast.length > 0 && !filterEast.includes(b.eastern_zodiac)) return false;
            if (filterWest.length > 0 && !filterWest.includes(b.western_zodiac)) return false;
            return true;
        });
        if (!userBirth) return filtered;
        return [...filtered].sort((a, b) => {
            const sa = scores.get(a.id) ?? -1;
            const sb = scores.get(b.id) ?? -1;
            if (sa === -1 && sb === -1) return 0;
            if (sa === -1) return 1;
            if (sb === -1) return -1;
            return scoreSort === 'desc' ? sb - sa : sa - sb;
        });
    }, [brands, search, filterLP, filterEast, filterWest, scores, scoreSort]);

    const [rowLimit, setRowLimit] = useState(25);
    const sentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => { setRowLimit(50); }, [visible]);
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            entries => { if (entries[0].isIntersecting) setRowLimit(r => r + 50); },
            { rootMargin: '200px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [visible]);

    const totalActive = filterLP.length + filterEast.length + filterWest.length;
    const clearAll = () => { setFilterLP([]); setFilterEast([]); setFilterWest([]); };

    async function toggleSave(e: React.MouseEvent, b: ClothingBrand) {
        e.stopPropagation();
        if (!session) return;
        if (savedIds.has(b.id)) {
            await supabase.from('saved_items').delete().eq('user_id', session.user.id).eq('item_type', 'clothing').eq('item_id', b.id);
            setSavedIds(prev => { const s = new Set(prev); s.delete(b.id); return s; });
        } else {
            await supabase.from('saved_items').insert({ user_id: session.user.id, item_type: 'clothing', item_id: b.id, item_name: b.name, item_image_url: b.image_url });
            setSavedIds(prev => new Set(prev).add(b.id));
        }
    }

    if (loading) return <div className="placeholder-msg">Loading brands...</div>;
    if (error) return <div className="placeholder-msg" style={{ color: 'var(--rose)' }}>{error}</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>

            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.6rem', color: 'var(--rose)', margin: '0 0 6px', letterSpacing: '0.02em' }}>
                    Clothing
                </h1>
                <p style={{ color: '#555', margin: 0, fontSize: '0.95rem' }}>
                    {visible.length}{visible.length !== brands.length ? ` of ${brands.length}` : ''} entries
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <input
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search by brand name..."
                    style={{ padding: '12px 16px', background: '#0a0a0a', border: '1px solid #2a2a2a', color: '#ccc', borderRadius: '10px', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                />

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px' }}>
                        <div onClick={() => setFilterOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                            <span style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                Filters {totalActive > 0 && <span style={{ color: 'var(--rose)', marginLeft: '6px' }}>({totalActive} active)</span>}
                            </span>
                            <span style={{ color: '#555', fontSize: '0.85rem' }}>{filterOpen ? '▲' : '▼'}</span>
                        </div>
                        {totalActive > 0 && (
                            <button onClick={clearAll} style={{ background: 'transparent', color: 'var(--rose)', border: '1px solid var(--rose)', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem' }}>
                                Clear all
                            </button>
                        )}
                    </div>
                    {filterOpen && (
                        <div style={{ padding: '4px 18px 18px', display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ height: '2px' }} />

                            <PillGroup label="Life Path" options={LP_ORDER} active={filterLP} onToggle={v => setFilterLP(toggle(filterLP, v))} color="var(--rose)" />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Eastern Zodiac</span>
                                {EAST_TRIADS_FILTER.map(triad => (
                                    <div key={triad.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ color: '#3a3a3a', fontSize: '0.68rem', letterSpacing: '0.06em' }}>{triad.label}</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {triad.animals.map(a => {
                                                const on = filterEast.includes(a);
                                                return (
                                                    <button key={a} onClick={() => setFilterEast(toggle(filterEast, a))} style={{
                                                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
                                                        border: `1px solid ${on ? 'var(--gold)' : '#333'}`,
                                                        background: on ? 'rgba(240,208,128,0.15)' : 'transparent',
                                                        color: on ? 'var(--gold)' : '#666',
                                                        transition: 'all 0.15s',
                                                    }}>{a}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Western Zodiac</span>
                                {WEST_TRIADS_FILTER.map(elem => (
                                    <div key={elem.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <span style={{ color: '#3a3a3a', fontSize: '0.68rem', letterSpacing: '0.06em' }}>{elem.label}</span>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {elem.signs.map(s => {
                                                const on = filterWest.includes(s);
                                                return (
                                                    <button key={s} onClick={() => setFilterWest(toggle(filterWest, s))} style={{
                                                        padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer',
                                                        border: `1px solid ${on ? '#a78bfa' : '#333'}`,
                                                        background: on ? 'rgba(167,139,250,0.15)' : 'transparent',
                                                        color: on ? '#a78bfa' : '#666',
                                                        transition: 'all 0.15s',
                                                    }}>{s}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {visible.length > 0 ? (
                <div style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: `2fr 1fr 1fr 1fr${userBirth ? ' 0.6fr' : ''}${session ? ' 32px' : ''}`, padding: '12px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {['Brand', 'Life Path', 'Eastern', 'Western', ...(userBirth ? ['Score'] : []), ...(session ? [''] : [])].map(h => (
                            h === 'Score' ? (
                                <button key={h} onClick={() => setScoreSort(s => s === 'desc' ? 'asc' : 'desc')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Score <span style={{ fontSize: '0.65rem' }}>{scoreSort === 'desc' ? '↓' : '↑'}</span>
                                </button>
                            ) : (
                                <span key={h} style={{ fontSize: '0.72rem', color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</span>
                            )
                        ))}
                    </div>

                    {visible.slice(0, rowLimit).map((b, i) => (
                        <div key={b.id}
                            onClick={() => router.push(`/clothing/${b.id}`)}
                            style={{
                                display: 'grid', gridTemplateColumns: `2fr 1fr 1fr 1fr${userBirth ? ' 0.6fr' : ''}${session ? ' 32px' : ''}`,
                                padding: '16px 20px', cursor: 'pointer',
                                borderBottom: i < Math.min(rowLimit, visible.length) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                background: 'rgba(10,10,10,0.5)', transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,128,160,0.05)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(10,10,10,0.5)')}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', background: '#fff', flexShrink: 0, border: '1px solid #222' }}>
                                    {b.image_url
                                        ? <img src={b.image_url} alt={b.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '1rem' }}>✦</div>
                                    }
                                </div>
                                <div>
                                    <div style={{ color: '#eee', fontWeight: 500, fontSize: '0.95rem' }}>{b.name}</div>
                                    <div style={{ color: '#555', fontSize: '0.78rem', marginTop: '2px' }}>
                                        {b.country && <span>{b.country}</span>}
                                        {b.country && b.founded_year && <span> · </span>}
                                        {b.founded_year && <span>Est. {b.founded_year}</span>}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: 'var(--rose)', fontSize: '0.9rem', fontWeight: 500 }}>LP {b.life_path.split('/')[0]}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>{b.eastern_zodiac}</span>
                                {userBirth && scores.has(b.id) && (() => {
                                    const rel = getScoreRelation(scores.get(b.id)!);
                                    return <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: RELATION_DOT[rel], flexShrink: 0, display: 'inline-block' }} title={rel} />;
                                })()}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#a78bfa', fontSize: '0.9rem' }}>{b.western_zodiac}</span>
                            </div>

                            {userBirth && scores.has(b.id) && (() => {
                                const sc = scores.get(b.id)!;
                                const rel = getScoreRelation(sc);
                                const color = rel === 'friendly' ? 'var(--teal)' : rel === 'enemy' ? 'var(--rose)' : 'var(--gold)';
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ color, fontSize: '0.9rem', fontWeight: 600 }}>{Math.round(sc)}</span>
                                    </div>
                                );
                            })()}
                            {session && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <button onClick={e => toggleSave(e, b)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: savedIds.has(b.id) ? 'var(--rose)' : '#444', lineHeight: 1, padding: 0 }}>
                                        {savedIds.has(b.id) ? '♥' : '♡'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                    {visible.length > rowLimit && <div ref={sentinelRef} style={{ height: '1px' }} />}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#555', border: '1px dashed #2a2a2a', borderRadius: '14px' }}>
                    No brands match the current filters.
                </div>
            )}
        </div>
    );
}
