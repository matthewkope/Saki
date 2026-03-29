'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { calculate } from '@/lib/letterology';
import type { CalcResult } from '@/lib/letterology';
import { calcLP, calcSLP, calcPersonalYear, calcPersonalMonth, calcLuckyNumber, digitSum } from '@/lib/numerology';
import { getEasternAnimal, getWesternSign } from '@/lib/astrology';

interface Profile {
  name: string | null;
  birth_month: number | null; birth_day: number | null; birth_year: number | null;
  street_number: string | null; street_name: string | null;
  city: string | null; state: string | null; zip: string | null;
  reading_name: CalcResult | null;
  reading_bday: any;
  reading_street_number: any;
  reading_street_name: CalcResult | null;
  reading_city: CalcResult | null;
}

function reduceStreetNumber(s: string): number {
  const digits = s.replace(/\D/g, '');
  if (!digits) return 0;
  let n = parseInt(digits);
  while (n > 9 && ![11, 22, 28, 33].includes(n)) n = digitSum(n);
  return n;
}

function Chip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      background: `${color}14`, border: `1px solid ${color}33`,
      borderRadius: '12px', padding: '12px 18px', textAlign: 'center', minWidth: '90px',
    }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function LetterRow({ result }: { result: CalcResult }) {
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {result.letterData.map((d, i) => (
          <div key={i} style={{ background: 'var(--surface-3)', borderRadius: '8px', padding: '6px 10px', textAlign: 'center', minWidth: '36px' }}>
            <div style={{ fontSize: '0.95rem', color: d.isVowel ? 'var(--gold)' : 'var(--text)', fontWeight: 600 }}>{d.ch}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.red}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Chip label="Final" value={String(result.finalVal)} color="var(--accent)" />
        <Chip label="Total" value={String(result.totalReduced)} color="var(--text-dim)" />
        {result.firstLetter && <Chip label="First Letter" value={`${result.firstLetter.ch} · ${result.firstLetter.red}`} color="var(--teal)" />}
        {result.firstVowel && <Chip label="First Vowel" value={`${result.firstVowel.ch} · ${result.firstVowel.red}`} color="var(--gold)" />}
      </div>
    </div>
  );
}

function SectionCard({ title, children, onEdit }: { title: string; children: React.ReactNode; onEdit: () => void }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', color: 'var(--text)' }}>{title}</span>
        <button onClick={onEdit} style={{
          fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          background: 'transparent', border: '1px solid var(--border-light)',
          color: 'var(--text-dim)', padding: '5px 12px', borderRadius: '8px',
          cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent-dim)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-light)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'; }}
        >Edit</button>
      </div>
      {children}
    </div>
  );
}

interface SavedItem {
  id: number;
  item_type: string;
  item_id: number;
  item_name: string | null;
  item_image_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fetching, setFetching] = useState(true);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  // Edit states
  const [editName, setEditName] = useState(false);
  const [editBday, setEditBday] = useState(false);
  const [editAddress, setEditAddress] = useState(false);

  // Edit form values
  const [eName, setEName] = useState('');
  const [eMonth, setEMonth] = useState(''); const [eDay, setEDay] = useState(''); const [eYear, setEYear] = useState('');
  const [eStreetNum, setEStreetNum] = useState(''); const [eStreetName, setEStreetName] = useState('');
  const [eCity, setECity] = useState(''); const [eState, setEState] = useState(''); const [eZip, setEZip] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!session) { router.replace('/signin'); return; }
    supabase.from('profiles').select('*').eq('id', session.user.id).single()
      .then(({ data }) => { setProfile(data as Profile); setFetching(false); });
    supabase.from('saved_items').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setSavedItems(data as SavedItem[]); });
  }, [session, loading, router]);

  async function saveName() {
    if (!session || !eName.trim()) return;
    setSaving(true);
    const reading = calculate(eName, false, 'lower');
    await supabase.from('profiles').update({ name: eName, reading_name: reading }).eq('id', session.user.id);
    setProfile(p => p ? { ...p, name: eName, reading_name: reading } : p);
    setEditName(false); setSaving(false);
  }

  async function saveBday() {
    if (!session) return;
    const m = parseInt(eMonth), d = parseInt(eDay), y = parseInt(eYear);
    if (!m || !d || !y || eYear.length !== 4) return;
    setSaving(true);
    const lp = calcLP(m, d, y);
    const slp = calcSLP(d);
    const py = calcPersonalYear(m, d);
    const lucky = calcLuckyNumber(m, d, y);
    const animal = getEasternAnimal(m, d, y);
    const sign = getWesternSign(m, d);
    const pm = calcPersonalMonth(m, d);
    const rdg = { lpDisplay: lp.display, slp, animal, sign, pyDisplay: py.display, pmDisplay: pm.display, pmStartMonth: pm.startMonth, pmStartDay: pm.startDay, pmEndMonth: pm.endMonth, pmEndDay: pm.endDay };
    await supabase.from('profiles').update({ birth_month: m, birth_day: d, birth_year: y, reading_bday: rdg }).eq('id', session.user.id);
    setProfile(p => p ? { ...p, birth_month: m, birth_day: d, birth_year: y, reading_bday: rdg } : p);
    setEditBday(false); setSaving(false);
  }

  async function saveAddress() {
    if (!session) return;
    setSaving(true);
    const snVal = reduceStreetNumber(eStreetNum);
    const snRdg = eStreetName.trim() ? calculate(eStreetName, false, 'lower') : null;
    const cityRdg = eCity.trim() ? calculate(eCity, false, 'lower') : null;
    await supabase.from('profiles').update({
      street_number: eStreetNum, street_name: eStreetName, city: eCity, state: eState, zip: eZip,
      reading_street_number: { value: snVal }, reading_street_name: snRdg, reading_city: cityRdg,
    }).eq('id', session.user.id);
    setProfile(p => p ? { ...p, street_number: eStreetNum, street_name: eStreetName, city: eCity, state: eState, zip: eZip, reading_street_number: { value: snVal }, reading_street_name: snRdg, reading_city: cityRdg } : p);
    setEditAddress(false); setSaving(false);
  }

  if (loading || fetching) return null;
  if (!profile) return null;

  const avatarLetter = session?.user.user_metadata?.full_name?.[0] || session?.user.email?.[0]?.toUpperCase() || '?';

  return (
    <div style={{ padding: '40px 24px', maxWidth: '600px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--accent-glow)', border: '2px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0,
        }}>
          {session?.user.user_metadata?.avatar_url
            ? <img src={session.user.user_metadata.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
            : avatarLetter}
        </div>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.8rem', color: 'var(--text)', margin: 0 }}>
            {profile.name || 'Your Profile'}
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>{session?.user.email}</div>
        </div>
      </div>

      {/* Name Section */}
      <SectionCard title="Name" onEdit={() => { setEName(profile.name || ''); setEditName(true); setEditBday(false); setEditAddress(false); }}>
        {editName ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input value={eName} onChange={e => setEName(e.target.value)} placeholder="Full name" style={inputStyle} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditName(false)} style={cancelBtn}>Cancel</button>
              <button onClick={saveName} disabled={saving} style={saveBtn(saving)}>Save</button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ color: 'var(--text)', fontSize: '1rem', marginBottom: '12px' }}>{profile.name}</div>
            {profile.reading_name && <LetterRow result={profile.reading_name} />}
          </>
        )}
      </SectionCard>

      {/* Birthday Section */}
      <SectionCard title="Birthday" onEdit={() => { setEMonth(String(profile.birth_month || '')); setEDay(String(profile.birth_day || '')); setEYear(String(profile.birth_year || '')); setEditBday(true); setEditName(false); setEditAddress(false); }}>
        {editBday ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {([{ val: eMonth, set: setEMonth, ph: 'MM', w: '60px' }, { val: eDay, set: setEDay, ph: 'DD', w: '60px' }, { val: eYear, set: setEYear, ph: 'YYYY', w: '90px' }] as const).map(({ val, set, ph, w }, i) => (
                <input key={i} value={val} onChange={e => (set as any)(e.target.value.replace(/\D/g, '').slice(0, ph.length))}
                  placeholder={ph} maxLength={ph.length} inputMode="numeric"
                  style={{ ...inputStyle, width: w, textAlign: 'center' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditBday(false)} style={cancelBtn}>Cancel</button>
              <button onClick={saveBday} disabled={saving} style={saveBtn(saving)}>Save</button>
            </div>
          </div>
        ) : (
          <>
            {profile.birth_month && <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '12px' }}>{profile.birth_month}/{profile.birth_day}/{profile.birth_year}</div>}
            {profile.reading_bday && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <Chip label="Life Path" value={profile.reading_bday.lpDisplay} color="var(--accent)" />
                <Chip label="Sub LP" value={String(profile.reading_bday.slp)} color="var(--accent-dim)" />
                <Chip label="Eastern" value={profile.reading_bday.animal} color="var(--gold)" />
                <Chip label="Western" value={profile.reading_bday.sign} color="#a78bfa" />
                <Chip label="PY" value={profile.reading_bday.pyDisplay} color="var(--teal)" />
                {(() => {
                  if (!profile.birth_month || !profile.birth_day) return null;
                  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  const pm = calcPersonalMonth(profile.birth_month, profile.birth_day);
                  const period = `${MONTHS[pm.startMonth-1]} ${pm.startDay} – ${MONTHS[pm.endMonth-1]} ${pm.endDay}`;
                  return <Chip label="PM" value={pm.display} color="var(--rose)" />;
                })()}
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Address Section */}
      <SectionCard title="Address" onEdit={() => { setEStreetNum(profile.street_number || ''); setEStreetName(profile.street_name || ''); setECity(profile.city || ''); setEState(profile.state || ''); setEZip(profile.zip || ''); setEditAddress(true); setEditName(false); setEditBday(false); }}>
        {editAddress ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={eStreetNum} onChange={e => setEStreetNum(e.target.value)} placeholder="Number" style={{ ...inputStyle, width: '90px' }} />
              <input value={eStreetName} onChange={e => setEStreetName(e.target.value)} placeholder="Street name" style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input value={eCity} onChange={e => setECity(e.target.value)} placeholder="City" style={inputStyle} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <input value={eState} onChange={e => setEState(e.target.value)} placeholder="State" style={{ ...inputStyle, flex: 1 }} />
              <input value={eZip} onChange={e => setEZip(e.target.value)} placeholder="ZIP" style={{ ...inputStyle, width: '80px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setEditAddress(false)} style={cancelBtn}>Cancel</button>
              <button onClick={saveAddress} disabled={saving} style={saveBtn(saving)}>Save</button>
            </div>
          </div>
        ) : (
          <>
            {profile.street_number && (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '16px' }}>
                {profile.street_number} {profile.street_name}, {profile.city}, {profile.state} {profile.zip}
              </div>
            )}
            {profile.reading_street_number?.value != null && (
              <div style={{ marginBottom: '16px' }}>
                <div style={subLabel}>Street Number · {profile.street_number}</div>
                <Chip label="Numerology" value={String(profile.reading_street_number.value)} color="var(--accent)" />
              </div>
            )}
            {profile.reading_street_name && (
              <div style={{ marginBottom: '16px' }}>
                <div style={subLabel}>Street Name · {profile.street_name}</div>
                <LetterRow result={profile.reading_street_name} />
              </div>
            )}
            {profile.reading_city && (
              <div>
                <div style={subLabel}>City · {profile.city}</div>
                <LetterRow result={profile.reading_city} />
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* Saved Items */}
      {savedItems.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', color: 'var(--text)' }}>Recently Saved</span>
            <button onClick={() => router.push('/profile/saved')} style={{ fontSize: '0.72rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em' }}>
              View all ({savedItems.length}) →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {savedItems.slice(0, 3).map(item => (
              <div key={item.id}
                onClick={() => router.push(`/${item.item_type === 'celebrity' ? 'celebrities' : item.item_type === 'location' ? 'locations' : 'clothing'}/${item.item_id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '12px', cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent-dim)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: item.item_type === 'celebrity' ? '50%' : '8px', overflow: 'hidden', background: item.item_type === 'clothing' ? '#fff' : '#111', flexShrink: 0, border: '1px solid var(--border)' }}>
                  {item.item_image_url
                    ? <img src={item.item_image_url} alt={item.item_name || ''} style={{ width: '100%', height: '100%', objectFit: item.item_type === 'clothing' ? 'contain' : 'cover', objectPosition: 'top', padding: item.item_type === 'clothing' ? '4px' : '0' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#444' }}>
                        {item.item_type === 'celebrity' ? '★' : item.item_type === 'location' ? '◎' : '✦'}
                      </div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.item_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'capitalize', marginTop: '1px' }}>{item.item_type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chrome Extension */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', marginBottom: '16px' }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.1rem', color: 'var(--text)', display: 'block', marginBottom: '12px' }}>Facebook Compatibility Extension</span>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 16px' }}>
          The Cue Chrome extension lets you check compatibility directly from Facebook profiles. To install the beta:
        </p>
        <ol style={{ color: 'var(--text-dim)', fontSize: '0.85rem', lineHeight: 1.9, margin: 0, paddingLeft: '20px' }}>
          <li>Download the extension files from the link below</li>
          <li>Open Chrome and go to <span style={{ color: 'var(--accent)', fontFamily: 'monospace' }}>chrome://extensions</span></li>
          <li>Enable <strong style={{ color: 'var(--text)' }}>Developer mode</strong> (top right toggle)</li>
          <li>Click <strong style={{ color: 'var(--text)' }}>Load unpacked</strong> and select the downloaded folder</li>
          <li>The Cue icon will appear in your toolbar — pin it for easy access</li>
        </ol>
      </div>

      {/* Sign out */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/signin'); }} style={{
          background: 'transparent', border: '1px solid var(--border)',
          color: 'var(--text-muted)', padding: '10px 28px', borderRadius: '10px',
          cursor: 'pointer', fontSize: '0.85rem', transition: 'border-color 0.2s, color 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--rose)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 13px', background: 'var(--surface-2)',
  border: '1px solid var(--border)', borderRadius: '10px',
  color: 'var(--text)', fontSize: '0.88rem', outline: 'none',
  width: '100%', boxSizing: 'border-box',
};

const subLabel: React.CSSProperties = {
  fontSize: '0.65rem', color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px',
};

const cancelBtn: React.CSSProperties = {
  padding: '9px 18px', borderRadius: '10px', background: 'transparent',
  border: '1px solid var(--border)', color: 'var(--text-dim)',
  fontSize: '0.85rem', cursor: 'pointer',
};

function saveBtn(disabled: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '9px', borderRadius: '10px',
    background: disabled ? 'var(--surface-3)' : 'var(--accent)',
    border: 'none', color: disabled ? 'var(--text-muted)' : '#0a0a0f',
    fontWeight: 700, fontSize: '0.85rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
