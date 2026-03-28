'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

export default function CelebrityPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        supabase.from('celebrities').select('*').eq('id', id).single().then(({ data, error }) => {
            if (error || !data) setError('Celebrity not found.');
            else setCelebrity(data);
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="placeholder-msg">Loading...</div>;
    if (error || !celebrity) return <div className="placeholder-msg" style={{ color: 'var(--rose)' }}>{error}</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: '40px' }}>

            <button onClick={() => router.push('/celebrities')} style={{ alignSelf: 'flex-start', background: 'transparent', color: '#666', border: '1px solid #333', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                ← All Celebrities
            </button>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: '220px', height: '220px', borderRadius: '16px', overflow: 'hidden', background: '#111', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
                    {celebrity.image_url
                        ? <img src={celebrity.image_url} alt={celebrity.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#333' }}>★</div>
                    }
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                    <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.6rem', color: '#eee', margin: '0 0 6px', letterSpacing: '0.02em' }}>{celebrity.name}</h1>
                    {celebrity.month && celebrity.day && celebrity.year && (
                        <div style={{ color: '#555', marginBottom: '24px', fontSize: '0.95rem' }}>{celebrity.month}/{celebrity.day}/{celebrity.year}</div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {[
                            { label: 'Life Path', val: `LP ${celebrity.life_path}`, color: 'var(--accent,#60d0c0)', bg: 'rgba(96,208,192,0.08)' },
                            { label: 'Eastern Zodiac', val: celebrity.eastern_zodiac, color: 'var(--gold,#f0d080)', bg: 'rgba(240,208,128,0.08)' },
                            { label: 'Western Zodiac', val: celebrity.western_zodiac, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
                        ].map(b => (
                            <div key={b.label} style={{ background: b.bg, border: `1px solid ${b.color}33`, borderRadius: '14px', padding: '14px 20px', textAlign: 'center', minWidth: '110px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{b.label}</div>
                                <div style={{ fontSize: '1.1rem', color: b.color, fontWeight: 600 }}>{b.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
