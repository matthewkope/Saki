'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { calcScore } from '@/lib/compatibility';

const LP_ORDER = ['1','3','4','5','6','7','8','9','11','22','28','33','33/6'];
const EAST_ALL = ['Rat','Ox','Tiger','Cat','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'];
const WEST_ALL = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const TIERS = ['Friendly','Neutral','Enemy'];

function lpFilterKey(lp: { lp: number; pure33: boolean }): string {
    if (lp.lp === 33) return lp.pure33 ? '33' : '33/6';
    return String(lp.lp);
}

function toggle(arr: string[], val: string): string[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

const monthMap: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

function parseFBBirthday(bday: string): { m: number; d: number; y: number | null; valid: boolean } {
    const parts = bday.replace(/,/g, '').split(' ');
    if (parts.length < 2) return { m: 1, d: 1, y: null, valid: false };
    const m = monthMap[parts[0]];
    const d = parseInt(parts[1], 10);
    const y = parts[2] ? parseInt(parts[2], 10) : null;
    if (!m || isNaN(d)) return { m: 1, d: 1, y: null, valid: false };
    return { m, d, y: y && !isNaN(y) ? y : null, valid: true };
}

function PillGroup({ label, options, active, onToggle, color }: {
    label: string;
    options: string[];
    active: string[];
    onToggle: (v: string) => void;
    color?: string;
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
                        }}>
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function FriendsCompatibilityContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('id');

    const [userM, setUserM] = useState('');
    const [userD, setUserD] = useState('');
    const [userY, setUserY] = useState('');

    const [friends, setFriends] = useState<{name: string, birthday: string, profileUrl?: string}[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [computed, setComputed] = useState(false);
    const [fullMatches, setFullMatches] = useState<any[]>([]);
    const [partialMatches, setPartialMatches] = useState<any[]>([]);

    // Filters — empty array means "show all"
    const [filterTier, setFilterTier] = useState<string[]>([]);
    const [filterLP, setFilterLP] = useState<string[]>([]);
    const [filterEast, setFilterEast] = useState<string[]>([]);
    const [filterWest, setFilterWest] = useState<string[]>([]);
    const [sortOrder, setSortOrder] = useState<'desc'|'asc'|'chrono'>('desc');

    useEffect(() => {
        if (!sessionId) {
            setError('No session ID found. Please try running the Chrome Extension from Facebook again.');
            setLoading(false);
            return;
        }
        fetch(`/api/compatibility/session?id=${sessionId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) setError(data.error);
                else setFriends(data.friends || []);
                setLoading(false);
            })
            .catch(() => { setError('Failed to load friends data from the server.'); setLoading(false); });
    }, [sessionId]);

    const runCalculations = () => {
        const m = parseInt(userM, 10);
        const d = parseInt(userD, 10);
        const y = parseInt(userY, 10);
        if (!m || !d || !y) return alert("Please enter your complete birthday.");

        const full: any[] = [];
        const partial: any[] = [];

        friends.forEach(f => {
            const b = parseFBBirthday(f.birthday);
            if (!b.valid) {
                partial.push({ ...f, reason: 'Unrecognized date format' });
            } else if (!b.y) {
                partial.push({ ...f, parsed: b, reason: 'Missing Year - Cannot calculate Life Path' });
            } else {
                try {
                    const scoreObj = calcScore({ month: m, day: d, year: y }, { month: b.m, day: b.d, year: b.y });
                    full.push({ ...f, parsed: b, scoreObj });
                } catch {
                    partial.push({ ...f, reason: 'Calculation Engine Error' });
                }
            }
        });

        full.sort((a, b) => b.scoreObj.score - a.scoreObj.score);
        setFullMatches(full);
        setPartialMatches(partial);
        setFilterTier([]);
        setFilterLP([]);
        setFilterEast([]);
        setFilterWest([]);
        setComputed(true);
    };

    // LP options: only LPs present in results, in canonical order
    const lpOptions = useMemo(() => {
        const present = new Set(fullMatches.map(f => lpFilterKey(f.scoreObj.lp2)));
        return LP_ORDER.filter(lp => present.has(lp));
    }, [fullMatches]);

    function daysUntilNextBirthday(m: number, d: number): number {
        const now = new Date();
        const thisYear = now.getFullYear();
        let next = new Date(thisYear, m - 1, d);
        if (next <= now) next = new Date(thisYear + 1, m - 1, d);
        return Math.ceil((next.getTime() - now.getTime()) / 86400000);
    }

    const visibleMatches = useMemo(() => {
        const filtered = fullMatches.filter(f => {
            const tier = f.scoreObj.score >= 80 ? 'Friendly' : f.scoreObj.score >= 60 ? 'Neutral' : 'Enemy';
            if (filterTier.length > 0 && !filterTier.includes(tier)) return false;
            if (filterLP.length > 0 && !filterLP.includes(lpFilterKey(f.scoreObj.lp2))) return false;
            if (filterEast.length > 0 && !filterEast.includes(f.scoreObj.east2.animal)) return false;
            if (filterWest.length > 0 && !filterWest.includes(f.scoreObj.west2.sign)) return false;
            return true;
        });
        if (sortOrder === 'asc') return [...filtered].sort((a, b) => a.scoreObj.score - b.scoreObj.score);
        if (sortOrder === 'chrono') return [...filtered].sort((a, b) => daysUntilNextBirthday(a.parsed.m, a.parsed.d) - daysUntilNextBirthday(b.parsed.m, b.parsed.d));
        return filtered; // desc — already sorted by runCalculations
    }, [fullMatches, filterTier, filterLP, filterEast, filterWest, sortOrder]);

    const downloadCSV = () => {
        const header = 'Name,Birthday,Score,Tier,Life Path,Intermediary,SLP,Eastern Zodiac,Western Zodiac';
        const rows = fullMatches.map(f => {
            const tier = f.scoreObj.score >= 80 ? 'Friendly' : f.scoreObj.score >= 60 ? 'Neutral' : 'Enemy';
            return [
                `"${f.name.replace(/"/g, '""')}"`,
                `${f.parsed.m}/${f.parsed.d}/${f.parsed.y}`,
                f.scoreObj.score.toFixed(1),
                tier,
                f.scoreObj.lp2.lp,
                f.scoreObj.lp2.raw,
                f.scoreObj.slp2,
                f.scoreObj.east2.animal,
                f.scoreObj.west2.sign,
            ].join(',');
        });
        const csv = [header, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compatibility_results.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const [filterOpen, setFilterOpen] = useState(false);
    const totalActive = filterTier.length + filterLP.length + filterEast.length + filterWest.length;
    const clearAll = () => { setFilterTier([]); setFilterLP([]); setFilterEast([]); setFilterWest([]); };

    if (loading) return <div className="placeholder-msg">Loading your Facebook friends from secure session...</div>;
    if (error) return <div className="placeholder-msg" style={{color: 'var(--rose)'}}>{error}</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px', fontFamily: "'Inter', sans-serif" }}>

            {!computed && (
                <div style={{ background: 'var(--bg-card, rgba(20,20,20,0.8))', backdropFilter: 'blur(10px)', padding: '50px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
                    <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.5rem', color: 'var(--accent, #60d0c0)', marginBottom: '10px', letterSpacing: '0.02em' }}>Facebook Friend Calculator</h1>
                    <p style={{ color: '#aaa', marginBottom: '30px', fontSize: '1.1rem' }}>We successfully found <strong style={{color: 'white'}}>{friends.length}</strong> friends from Facebook.</p>
                    <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.5)', padding: '15px 20px', borderRadius: '16px', gap: '15px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
                        <span style={{ color: '#888', marginRight: '10px' }}>Your Birthday:</span>
                        <input value={userM} onChange={e => setUserM(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="MM" style={{ width: '60px', padding: '12px', background: '#000', border: '1px solid #444', color: 'white', borderRadius: '8px', textAlign: 'center', fontSize: '1.2rem' }}/>
                        <span style={{ color: '#444' }}>/</span>
                        <input value={userD} onChange={e => setUserD(e.target.value.replace(/\D/g, '').slice(0, 2))} placeholder="DD" style={{ width: '60px', padding: '12px', background: '#000', border: '1px solid #444', color: 'white', borderRadius: '8px', textAlign: 'center', fontSize: '1.2rem' }}/>
                        <span style={{ color: '#444' }}>/</span>
                        <input value={userY} onChange={e => setUserY(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="YYYY" style={{ width: '90px', padding: '12px', background: '#000', border: '1px solid #444', color: 'white', borderRadius: '8px', textAlign: 'center', fontSize: '1.2rem' }}/>
                    </div>
                    <div>
                        <button onClick={runCalculations} style={{ padding: '16px 40px', background: 'linear-gradient(135deg, var(--accent, #60d0c0), #3ab0a0)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(96,208,192,0.3)', transition: 'transform 0.2s', letterSpacing: '0.03em' }} onMouseDown={e => e.currentTarget.style.transform='scale(0.98)'} onMouseUp={e => e.currentTarget.style.transform='scale(1)'}>
                            Run Analysis
                        </button>
                    </div>
                </div>
            )}

            {computed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>

                    {/* Full Matches */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '24px' }}>
                            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'normal', margin: 0 }}>
                                Full Matrix ({visibleMatches.length}{visibleMatches.length !== fullMatches.length ? ` of ${fullMatches.length}` : ''})
                            </h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={downloadCSV} style={{ background: 'transparent', color: 'var(--accent, #60d0c0)', border: '1px solid var(--accent, #60d0c0)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Download CSV</button>
                                <button onClick={() => setComputed(false)} style={{ background: 'transparent', color: '#888', border: '1px solid #444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Recalculate</button>
                            </div>
                        </div>

                        {/* Filter panel */}
                        <div style={{ marginBottom: '28px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px' }}>
                                <div onClick={() => setFilterOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                                    <span style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        Filters {totalActive > 0 && <span style={{ color: 'var(--accent,#60d0c0)', marginLeft: '6px' }}>({totalActive} active)</span>}
                                    </span>
                                    <span style={{ color: '#555', fontSize: '0.9rem' }}>{filterOpen ? '▲' : '▼'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {totalActive > 0 && (
                                        <button onClick={clearAll} style={{ background: 'transparent', color: 'var(--rose,#ff6070)', border: '1px solid var(--rose,#ff6070)', padding: '3px 10px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.78rem' }}>
                                            Clear all
                                        </button>
                                    )}
                                    {(['desc','asc','chrono'] as const).map(s => (
                                        <button key={s} onClick={() => setSortOrder(s)} style={{
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer',
                                            border: `1px solid ${sortOrder === s ? 'var(--accent,#60d0c0)' : '#333'}`,
                                            background: sortOrder === s ? 'rgba(96,208,192,0.15)' : 'transparent',
                                            color: sortOrder === s ? 'var(--accent,#60d0c0)' : '#555',
                                        }}>
                                            {s === 'desc' ? '↓ Score' : s === 'asc' ? '↑ Score' : '📅 Next Birthday'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {filterOpen && (
                                <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ height: '12px' }} />
                                    <PillGroup label="Tier" options={TIERS} active={filterTier} onToggle={v => setFilterTier(toggle(filterTier, v))}
                                        color={filterTier.includes('Friendly') ? 'var(--accent,#60d0c0)' : filterTier.includes('Enemy') ? 'var(--rose,#ff6070)' : undefined} />
                                    <PillGroup label="Life Path" options={lpOptions} active={filterLP} onToggle={v => setFilterLP(toggle(filterLP, v))} />
                                    <PillGroup label="Eastern Zodiac" options={EAST_ALL} active={filterEast} onToggle={v => setFilterEast(toggle(filterEast, v))} color="var(--gold,#f0d080)" />
                                    <PillGroup label="Western Zodiac" options={WEST_ALL} active={filterWest} onToggle={v => setFilterWest(toggle(filterWest, v))} color="#a78bfa" />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {visibleMatches.map((f, i) => (
                                <div key={i} style={{ background: 'var(--bg-card, rgba(20,20,20,0.8))', backdropFilter: 'blur(10px)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: f.scoreObj.score >= 80 ? 'var(--accent)' : f.scoreObj.score >= 60 ? 'var(--gold)' : 'var(--rose)' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontSize: '1.3rem', fontWeight: 600 }}>
                                                {f.profileUrl
                                                    ? <a href={f.profileUrl} target="_blank" rel="noreferrer" style={{ color: '#eee', textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget.style.textDecoration='underline')} onMouseLeave={e => (e.currentTarget.style.textDecoration='none')}>{f.name}</a>
                                                    : <span style={{ color: '#eee' }}>{f.name}</span>
                                                }
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>{f.parsed.m}/{f.parsed.d}/{f.parsed.y}</div>
                                        </div>
                                        <div style={{ fontSize: '2rem', fontFamily: "'Instrument Serif', serif", color: f.scoreObj.score >= 80 ? 'var(--accent)' : f.scoreObj.score >= 60 ? 'var(--gold)' : 'var(--rose)' }}>
                                            {f.scoreObj.score.toFixed(1)}<span style={{fontSize: '1.2rem'}}>%</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px', fontSize: '0.95rem', background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '12px' }}>
                                        <div><span style={{color: '#777', fontSize:'0.8rem', display:'block', marginBottom:'2px'}}>Lifepath</span><span style={{color: '#ccc'}}>{f.scoreObj.lp2.display}</span></div>
                                        <div><span style={{color: '#777', fontSize:'0.8rem', display:'block', marginBottom:'2px'}}>SLP</span><span style={{color: '#ccc'}}>{f.scoreObj.slp2}</span></div>
                                        <div><span style={{color: '#777', fontSize:'0.8rem', display:'block', marginBottom:'2px'}}>Eastern</span><span style={{color: '#ccc'}}>{f.scoreObj.east2.animal}</span></div>
                                        <div><span style={{color: '#777', fontSize:'0.8rem', display:'block', marginBottom:'2px'}}>Western</span><span style={{color: '#ccc'}}>{f.scoreObj.west2.sign}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {visibleMatches.length === 0 && (
                            <div style={{ color: '#888', textAlign: 'center', padding: '40px', border: '1px dashed #333', borderRadius: '15px' }}>
                                {fullMatches.length === 0 ? 'No friends with clear birth years were scraped. Check your Facebook list!' : 'No results match the current filters.'}
                            </div>
                        )}
                    </div>

                    {/* Partial Matches */}
                    <div>
                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '30px' }}>
                            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2rem', color: 'var(--gold)', fontWeight: 'normal', margin: 0 }}>Excluded Friends ({partialMatches.length})</h2>
                            <p style={{ color: '#666', marginTop: '5px' }}>Friends lacking complete birthdays on Facebook.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                            {partialMatches.map((f, i) => (
                                <div key={i} style={{ background: 'rgba(10,10,10,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>
                                        {f.profileUrl
                                            ? <a href={f.profileUrl} target="_blank" rel="noreferrer" style={{ color: '#bbb', textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget.style.textDecoration='underline')} onMouseLeave={e => (e.currentTarget.style.textDecoration='none')}>{f.name}</a>
                                            : <span style={{ color: '#bbb' }}>{f.name}</span>
                                        }
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>Provided: {f.birthday}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--rose, #ff6070)', marginTop: '4px' }}>{f.reason}</div>
                                </div>
                            ))}
                            {partialMatches.length === 0 && <div style={{ color: '#555' }}>All friends had perfect data!</div>}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}

export default function FriendsCompatibilityPage() {
    return (
        <Suspense fallback={<div className="placeholder-msg">Loading secure session...</div>}>
            <FriendsCompatibilityContent />
        </Suspense>
    );
}
