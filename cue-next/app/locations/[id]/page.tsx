'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { calcScore, getScoreRelation } from '@/lib/compatibility';

interface Location {
    id: number;
    name: string;
    type: string;
    region: string | null;
    founded_month: number | null;
    founded_day: number | null;
    founded_year: number | null;
    life_path: string;
    eastern_zodiac: string;
    western_zodiac: string;
    image_url: string | null;
    description: string | null;
}

interface Profile {
    birth_month: number;
    birth_day: number;
    birth_year: number;
}

const RELATION_STYLES: Record<string, { color: string; bg: string; label: string }> = {
    friendly: { color: 'var(--teal, #60d0c0)', bg: 'rgba(96,208,192,0.08)', label: 'Friendly' },
    neutral:  { color: 'var(--gold, #f0d080)', bg: 'rgba(240,208,128,0.08)', label: 'Neutral'  },
    enemy:    { color: 'var(--rose, #ff80a0)', bg: 'rgba(255,128,160,0.08)', label: 'Enemy'    },
};

export default function LocationPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { session, loading: authLoading } = useAuth();

    const [location, setLocation] = useState<Location | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        supabase.from('locations').select('*').eq('id', id).single().then(({ data, error }) => {
            if (error || !data) setError('Location not found.');
            else setLocation(data);
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        if (authLoading || !session) return;
        supabase.from('profiles')
            .select('birth_month, birth_day, birth_year')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
                if (data?.birth_month) setProfile(data as Profile);
            });
        supabase.from('saved_items')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('item_type', 'location')
            .eq('item_id', id)
            .maybeSingle()
            .then(({ data }) => setSaved(!!data));
    }, [session, authLoading, id]);

    async function toggleSave() {
        if (!session || !location) return;
        if (saved) {
            await supabase.from('saved_items').delete()
                .eq('user_id', session.user.id).eq('item_type', 'location').eq('item_id', id);
            setSaved(false);
        } else {
            await supabase.from('saved_items').insert({
                user_id: session.user.id, item_type: 'location',
                item_id: Number(id), item_name: location.name, item_image_url: location.image_url,
            });
            setSaved(true);
        }
    }

    if (loading) return <div className="placeholder-msg">Loading...</div>;
    if (error || !location) return <div className="placeholder-msg" style={{ color: 'var(--rose)' }}>{error}</div>;

    const compatResult = (profile && location.founded_month && location.founded_day && location.founded_year)
        ? calcScore(
            { month: profile.birth_month, day: profile.birth_day, year: profile.birth_year },
            { month: location.founded_month, day: location.founded_day, year: location.founded_year }
          )
        : null;

    const relation = compatResult ? getScoreRelation(compatResult.score) : null;
    const relStyle = relation ? RELATION_STYLES[relation] : null;

    const baseBubbles = [
        { label: 'Life Path', val: `LP ${location.life_path}`, color: 'var(--accent, #c4a0ff)', bg: 'rgba(196,160,255,0.08)' },
        { label: 'Eastern',   val: location.eastern_zodiac,    color: 'var(--gold, #f0d080)',   bg: 'rgba(240,208,128,0.08)' },
        { label: 'Western',   val: location.western_zodiac,    color: '#a78bfa',                bg: 'rgba(167,139,250,0.08)' },
    ];

    return (
        <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif", display: 'flex', flexDirection: 'column', gap: '40px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={() => router.push('/locations')} style={{ background: 'transparent', color: '#666', border: '1px solid #333', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    ← All Locations
                </button>
                {session && (
                    <button onClick={toggleSave} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.4rem', color: saved ? 'var(--rose, #ff80a0)' : '#444', lineHeight: 1 }} title={saved ? 'Unsave' : 'Save'}>
                        {saved ? '♥' : '♡'}
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: '220px', height: '220px', borderRadius: '16px', overflow: 'hidden', background: '#111', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }}>
                    {location.image_url
                        ? <img src={location.image_url} alt={location.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#333' }}>◎</div>
                    }
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '2.6rem', color: '#eee', margin: 0, letterSpacing: '0.02em' }}>{location.name}</h1>
                        <span style={{ color: 'var(--teal)', fontSize: '0.8rem', textTransform: 'capitalize', background: 'rgba(96,208,192,0.08)', border: '1px solid rgba(96,208,192,0.2)', borderRadius: '6px', padding: '3px 10px' }}>{location.type}</span>
                    </div>
                    {location.region && (
                        <div style={{ color: '#555', fontSize: '0.85rem', marginBottom: '6px' }}>{location.region}</div>
                    )}
                    {location.founded_month && location.founded_day && location.founded_year && (
                        <div style={{ color: '#555', marginBottom: '24px', fontSize: '0.95rem' }}>
                            Founded {location.founded_month}/{location.founded_day}/{location.founded_year}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {baseBubbles.map(b => (
                            <div key={b.label} style={{ background: b.bg, border: `1px solid ${b.color}33`, borderRadius: '14px', padding: '14px 20px', textAlign: 'center', minWidth: '110px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>{b.label}</div>
                                <div style={{ fontSize: '1.1rem', color: b.color, fontWeight: 600 }}>{b.val}</div>
                            </div>
                        ))}

                        {compatResult && relStyle && profile && location.founded_month && location.founded_day && location.founded_year && (
                            <div
                                onClick={() => router.push(`/compatibility?p1m=${profile.birth_month}&p1d=${profile.birth_day}&p1y=${profile.birth_year}&p2m=${location.founded_month}&p2d=${location.founded_day}&p2y=${location.founded_year}`)}
                                style={{ background: relStyle.bg, border: `1px solid ${relStyle.color}33`, borderRadius: '14px', padding: '14px 20px', textAlign: 'center', minWidth: '110px', cursor: 'pointer' }}
                                title="Open in compatibility calculator"
                            >
                                <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Compatibility</div>
                                <div style={{ fontSize: '1.1rem', color: relStyle.color, fontWeight: 700 }}>{Math.round(compatResult.score)}</div>
                                <div style={{ fontSize: '0.72rem', color: relStyle.color, marginTop: '2px', opacity: 0.8 }}>{relStyle.label}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {location.description && (
                <div style={{ background: 'var(--surface, #12121a)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '28px 32px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px' }}>About</div>
                    <p style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: 1.75, margin: 0 }}>{location.description}</p>
                </div>
            )}
        </div>
    );
}
