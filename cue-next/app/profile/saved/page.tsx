'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { calcScore, getScoreRelation } from '@/lib/compatibility';

interface SavedItem {
  id: number;
  item_type: string;
  item_id: number;
  item_name: string | null;
  item_image_url: string | null;
  created_at: string;
}

interface ItemDetail {
  life_path: string;
  eastern_zodiac: string;
  western_zodiac: string;
  // celebrities use month/day/year; locations & clothing use founded_*
  month?: number | null;
  day?: number | null;
  year?: number | null;
  founded_month?: number | null;
  founded_day?: number | null;
  founded_year?: number | null;
}

interface UserBirth { month: number; day: number; year: number; }

const FILTERS = [
  { key: 'all',       label: 'All'         },
  { key: 'celebrity', label: 'Celebrities' },
  { key: 'location',  label: 'Locations'   },
  { key: 'clothing',  label: 'Clothing'    },
] as const;
type Filter = typeof FILTERS[number]['key'];

const DETAIL_PATH: Record<string, string> = { celebrity: 'celebrities', location: 'locations', clothing: 'clothing' };
const FALLBACK_ICON: Record<string, string> = { celebrity: '★', location: '◎', clothing: '✦' };
const SCORE_COLOR = (rel: string) => rel === 'friendly' ? 'var(--teal,#60d0c0)' : rel === 'enemy' ? 'var(--rose,#ff80a0)' : 'var(--gold,#f0d080)';

function getItemDates(d: ItemDetail): { m: number; day: number; y: number } | null {
  const m = d.month ?? d.founded_month;
  const day = d.day ?? d.founded_day;
  const y = d.year ?? d.founded_year;
  if (!m || !day || !y) return null;
  return { m, day, y };
}

export default function SavedPage() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [details, setDetails] = useState<Record<string, ItemDetail>>({});
  const [userBirth, setUserBirth] = useState<UserBirth | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { router.replace('/signin'); return; }

    // Load profile birth + saved items in parallel
    Promise.all([
      supabase.from('profiles').select('birth_month,birth_day,birth_year').eq('id', session.user.id).single(),
      supabase.from('saved_items').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
    ]).then(async ([profileRes, savedRes]) => {
      const p = profileRes.data;
      if (p?.birth_month) setUserBirth({ month: p.birth_month, day: p.birth_day, year: p.birth_year });

      const saved = (savedRes.data ?? []) as SavedItem[];
      setItems(saved);

      // Fetch full details for each type in one query per table
      const byType: Record<string, number[]> = { celebrity: [], location: [], clothing: [] };
      saved.forEach(s => byType[s.item_type]?.push(s.item_id));

      const fetches = await Promise.all([
        byType.celebrity.length
          ? supabase.from('celebrities').select('id,life_path,eastern_zodiac,western_zodiac,month,day,year').in('id', byType.celebrity)
          : Promise.resolve({ data: [] }),
        byType.location.length
          ? supabase.from('locations').select('id,life_path,eastern_zodiac,western_zodiac,founded_month,founded_day,founded_year').in('id', byType.location)
          : Promise.resolve({ data: [] }),
        byType.clothing.length
          ? supabase.from('clothing').select('id,life_path,eastern_zodiac,western_zodiac,founded_month,founded_day,founded_year').in('id', byType.clothing)
          : Promise.resolve({ data: [] }),
      ]);

      const map: Record<string, ItemDetail> = {};
      const types = ['celebrity', 'location', 'clothing'];
      fetches.forEach((res, i) => {
        (res.data ?? []).forEach((row: any) => {
          map[`${types[i]}-${row.id}`] = row as ItemDetail;
        });
      });
      setDetails(map);
      setLoading(false);
    });
  }, [session, authLoading, router]);

  async function remove(item: SavedItem) {
    await supabase.from('saved_items').delete().eq('id', item.id);
    setItems(prev => prev.filter(s => s.id !== item.id));
  }

  const visible = filter === 'all' ? items : items.filter(s => s.item_type === filter);

  if (authLoading || loading) return <div className="placeholder-msg">Loading...</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '680px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={() => router.push('/profile')} style={{ background: 'transparent', color: '#666', border: '1px solid #333', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
          ← Profile
        </button>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.8rem', color: 'var(--text)', margin: 0 }}>
          Saved
        </h1>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            fontSize: '0.78rem', letterSpacing: '0.06em', padding: '6px 14px',
            borderRadius: '20px', cursor: 'pointer', border: '1px solid',
            background: filter === f.key ? 'var(--accent)' : 'transparent',
            borderColor: filter === f.key ? 'var(--accent)' : 'var(--border-light)',
            color: filter === f.key ? '#0a0a0f' : 'var(--text-dim)',
            transition: 'all 0.15s',
          }}>
            {f.label}
            {f.key !== 'all' && (
              <span style={{ marginLeft: '6px', opacity: 0.7 }}>
                {items.filter(s => s.item_type === f.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          No saved {filter === 'all' ? 'items' : filter + 's'} yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {visible.map(item => {
            const detail = details[`${item.item_type}-${item.item_id}`];
            const dates = detail ? getItemDates(detail) : null;
            const compatResult = (userBirth && dates)
              ? calcScore({ month: userBirth.month, day: userBirth.day, year: userBirth.year }, { month: dates.m, day: dates.day, year: dates.y })
              : null;
            const relation = compatResult ? getScoreRelation(compatResult.score) : null;
            const lp = detail ? detail.life_path.split('/')[0] : null;

            return (
              <div key={item.id}
                onClick={() => router.push(`/${DETAIL_PATH[item.item_type]}/${item.item_id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', borderRadius: '14px', cursor: 'pointer', background: 'var(--surface)', border: '1px solid var(--border)', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-dim)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                {/* Image */}
                <div style={{
                  width: '44px', height: '44px', flexShrink: 0,
                  borderRadius: item.item_type === 'celebrity' ? '50%' : '10px',
                  overflow: 'hidden', border: '1px solid var(--border)',
                  background: item.item_type === 'clothing' ? '#fff' : '#111',
                }}>
                  {item.item_image_url
                    ? <img src={item.item_image_url} alt={item.item_name || ''} style={{ width: '100%', height: '100%', objectFit: item.item_type === 'clothing' ? 'contain' : 'cover', objectPosition: 'top', padding: item.item_type === 'clothing' ? '5px' : '0' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#444' }}>
                        {FALLBACK_ICON[item.item_type]}
                      </div>
                  }
                </div>

                {/* Name + type */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text)', fontSize: '0.95rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.item_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'capitalize', marginTop: '2px' }}>{item.item_type}</div>
                </div>

                {/* Numerology + astrology chips */}
                {detail && (
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--accent)', background: 'rgba(196,160,255,0.1)', border: '1px solid rgba(196,160,255,0.2)', borderRadius: '8px', padding: '3px 8px', whiteSpace: 'nowrap' }}>
                      LP {lp}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gold)', background: 'rgba(240,208,128,0.1)', border: '1px solid rgba(240,208,128,0.2)', borderRadius: '8px', padding: '3px 8px', whiteSpace: 'nowrap' }}>
                      {detail.eastern_zodiac}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '8px', padding: '3px 8px', whiteSpace: 'nowrap' }}>
                      {detail.western_zodiac}
                    </span>
                  </div>
                )}

                {/* Compatibility score */}
                {compatResult && relation && (
                  <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '36px' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: SCORE_COLOR(relation), lineHeight: 1 }}>{Math.round(compatResult.score)}</div>
                  </div>
                )}

                {/* Remove */}
                <button
                  onClick={async e => { e.stopPropagation(); await remove(item); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)', fontSize: '1.1rem', lineHeight: 1, padding: '6px', flexShrink: 0, opacity: 0.6, transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                  title="Remove"
                >♥</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
