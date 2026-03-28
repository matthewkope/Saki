'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { calcScore } from '@/lib/compatibility';

const monthMap: Record<string, number> = {
    January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
    July: 7, August: 8, September: 9, October: 10, November: 11, December: 12
};

function parseFBBirthday(bday: string): { m: number; d: number; y: number | null; valid: boolean } {
    const parts = bday.replace(/,/g, '').split(' ');
    if (parts.length < 2) return { m: 1, d: 1, y: null, valid: false };
    
    const mStr = parts[0];
    const dStr = parts[1];
    const yStr = parts[2];

    const m = monthMap[mStr];
    const d = parseInt(dStr, 10);
    const y = yStr ? parseInt(yStr, 10) : null;

    if (!m || isNaN(d)) return { m: 1, d: 1, y: null, valid: false };

    return { m, d, y: y && !isNaN(y) ? y : null, valid: true };
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
            .catch(() => {
                setError('Failed to load friends data from the server.');
                setLoading(false);
            });
    }, [sessionId]);

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
        setComputed(true);
    };

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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '30px' }}>
                            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.5rem', color: 'var(--accent)', fontWeight: 'normal', margin: 0 }}>Full Matrix ({fullMatches.length})</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={downloadCSV} style={{ background: 'transparent', color: 'var(--accent, #60d0c0)', border: '1px solid var(--accent, #60d0c0)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Download CSV</button>
                                <button onClick={() => setComputed(false)} style={{ background: 'transparent', color: '#888', border: '1px solid #444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Recalculate</button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                            {fullMatches.map((f, i) => (
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
                        {fullMatches.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: '40px', border: '1px dashed #333', borderRadius: '15px' }}>No friends with clear birth years were scraped. Check your Facebook list!</div>}
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
