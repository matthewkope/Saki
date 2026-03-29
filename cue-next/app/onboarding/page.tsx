'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import { calculate } from '@/lib/letterology';
import type { CalcResult } from '@/lib/letterology';
import { calcLP, calcSLP, calcPersonalYear, calcPersonalMonth, calcLuckyNumber, reduceToLP, digitSum } from '@/lib/numerology';
import { getEasternAnimal, getWesternSign } from '@/lib/astrology';

interface BdayReading {
  lpDisplay: string;
  slp: number;
  animal: string;
  sign: string;
  pyDisplay: string;
  pmDisplay: string;
  pmPeriod: string;
}

interface FormData {
  name: string;
  month: string; day: string; year: string;
  streetNumber: string; streetName: string; city: string; state: string; zip: string;
}

function reduceStreetNumber(s: string): number {
  const digits = s.replace(/\D/g, '');
  if (!digits) return 0;
  let n = parseInt(digits);
  while (n > 9 && ![11, 22, 28, 33].includes(n)) n = digitSum(n);
  return n;
}

function StepDots({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '24px 0 36px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          width: i === step ? '24px' : '8px', height: '8px',
          borderRadius: '4px',
          background: i === step ? 'var(--accent)' : i < step ? 'var(--accent-dim)' : 'var(--border-light)',
          transition: 'all 0.3s',
        }} />
      ))}
    </div>
  );
}

function ReadingChip({ label, value, color }: { label: string; value: string; color: string }) {
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
    <div style={{ marginTop: '16px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {result.letterData.map((d, i) => (
          <div key={i} style={{
            background: 'var(--surface-3)', borderRadius: '8px',
            padding: '6px 10px', textAlign: 'center', minWidth: '36px',
          }}>
            <div style={{ fontSize: '0.95rem', color: d.isVowel ? 'var(--gold)' : 'var(--text)', fontWeight: 600 }}>{d.ch}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{d.red}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <ReadingChip label="Final" value={String(result.finalVal)} color="var(--accent)" />
        <ReadingChip label="Total" value={String(result.totalReduced)} color="var(--text-dim)" />
        {result.firstLetter && <ReadingChip label="First Letter" value={`${result.firstLetter.ch} · ${result.firstLetter.red}`} color="var(--teal)" />}
        {result.firstVowel && <ReadingChip label="First Vowel" value={`${result.firstVowel.ch} · ${result.firstVowel.red}`} color="var(--gold)" />}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<FormData>({
    name: '', month: '', day: '', year: '',
    streetNumber: '', streetName: '', city: '', state: '', zip: '',
  });

  const [nameReading, setNameReading] = useState<CalcResult | null>(null);
  const [bdayReading, setBdayReading] = useState<BdayReading | null>(null);
  const [streetNumVal, setStreetNumVal] = useState<number | null>(null);
  const [streetNameReading, setStreetNameReading] = useState<CalcResult | null>(null);
  const [cityReading, setCityReading] = useState<CalcResult | null>(null);
  const [saving, setSaving] = useState(false);

  const monthRef = useRef<HTMLInputElement>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!session) { router.replace('/signin'); return; }
    supabase.from('profiles').select('onboarding_complete').eq('id', session.user.id).single()
      .then(async ({ data, error }) => {
        if (data?.onboarding_complete) {
          router.replace('/profile');
        } else {
          // Create profile row if the trigger didn't fire
          if (error?.code === 'PGRST116') {
            await supabase.from('profiles').insert({ id: session.user.id });
          }
          setReady(true);
        }
      });
  }, [session, loading, router]);

  function setField(key: keyof FormData, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleNameChange(val: string) {
    setField('name', val);
    if (val.trim().length > 0) setNameReading(calculate(val, false, 'lower'));
    else setNameReading(null);
  }

  function handleBdayField(key: 'month' | 'day' | 'year', val: string) {
    const next = { ...form, [key]: val };
    setForm(next);
    const m = parseInt(next.month), d = parseInt(next.day), y = parseInt(next.year);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && next.year.length === 4 && y > 1900) {
      const lp = calcLP(m, d, y);
      const slp = calcSLP(d);
      const py = calcPersonalYear(m, d);
      const pm = calcPersonalMonth(m, d);
      const animal = getEasternAnimal(m, d, y);
      const sign = getWesternSign(m, d);
      const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const pmPeriod = `${MONTHS[pm.startMonth-1]} ${pm.startDay} – ${MONTHS[pm.endMonth-1]} ${pm.endDay}`;
      setBdayReading({ lpDisplay: lp.display, slp, animal, sign, pyDisplay: py.display, pmDisplay: pm.display, pmPeriod });
    } else {
      setBdayReading(null);
    }
    // auto-advance
    if (key === 'month' && val.length === 2) dayRef.current?.focus();
    if (key === 'day' && val.length === 2) yearRef.current?.focus();
  }

  function handleAddressField(key: keyof FormData, val: string) {
    setField(key, val);
    if (key === 'streetNumber' && val.trim()) setStreetNumVal(reduceStreetNumber(val));
    if (key === 'streetName') setStreetNameReading(val.trim() ? calculate(val, false, 'lower') : null);
    if (key === 'city') setCityReading(val.trim() ? calculate(val, false, 'lower') : null);
  }

  async function handleFinish() {
    if (!session) { alert('No session — please sign in again.'); return; }
    setSaving(true);
    const m = parseInt(form.month), d = parseInt(form.day), y = parseInt(form.year);
    const lp = calcLP(m, d, y);
    const slp = calcSLP(d);
    const py = calcPersonalYear(m, d);
    const pm = calcPersonalMonth(m, d);
    const animal = getEasternAnimal(m, d, y);
    const sign = getWesternSign(m, d);

    const { error } = await supabase.from('profiles').update({
      name: form.name,
      birth_month: m, birth_day: d, birth_year: y,
      street_number: form.streetNumber,
      street_name: form.streetName,
      city: form.city,
      state: form.state,
      zip: form.zip,
      reading_name: nameReading,
      reading_bday: { lpDisplay: lp.display, slp, animal, sign, pyDisplay: py.display, pmDisplay: pm.display, pmStartMonth: pm.startMonth, pmStartDay: pm.startDay, pmEndMonth: pm.endMonth, pmEndDay: pm.endDay },
      reading_street_number: { value: streetNumVal },
      reading_street_name: streetNameReading,
      reading_city: cityReading,
      onboarding_complete: true,
    }).eq('id', session.user.id);

    if (error) {
      console.error('Save error:', error);
      alert('Error saving: ' + error.message);
      setSaving(false);
      return;
    }

    router.push('/profile');
  }

  if (!ready) return null;

  return (
    <div style={{ padding: '40px 24px', maxWidth: '520px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.5rem', color: 'var(--accent)' }}>Cue</span>
      </div>
      <StepDots step={step} />

      {/* ── Step 1: Name ── */}
      {step === 1 && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.8rem', textAlign: 'center', color: 'var(--text)', marginBottom: '28px' }}>
            What is your name?
          </h2>
          <input
            autoFocus value={form.name} onChange={e => handleNameChange(e.target.value)}
            placeholder="Full name"
            style={inputStyle}
          />
          {nameReading && (
            <div style={previewCard}>
              <div style={previewTitle}>Your Name Reading</div>
              <LetterRow result={nameReading} />
            </div>
          )}
          <button
            onClick={() => setStep(2)}
            disabled={!form.name.trim()}
            style={nextBtn(!form.name.trim())}
          >
            Continue →
          </button>
        </div>
      )}

      {/* ── Step 2: Birthday ── */}
      {step === 2 && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.8rem', textAlign: 'center', color: 'var(--text)', marginBottom: '28px' }}>
            When is your birthday?
          </h2>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {([
              { key: 'month', placeholder: 'MM', max: 2, ref: monthRef },
              { key: 'day', placeholder: 'DD', max: 2, ref: dayRef },
              { key: 'year', placeholder: 'YYYY', max: 4, ref: yearRef },
            ] as const).map(({ key, placeholder, max, ref }) => (
              <input
                key={key} ref={ref} value={form[key]}
                onChange={e => handleBdayField(key, e.target.value.replace(/\D/g, '').slice(0, max))}
                placeholder={placeholder} maxLength={max} inputMode="numeric"
                style={{ ...inputStyle, width: max === 4 ? '90px' : '60px', textAlign: 'center' }}
              />
            ))}
          </div>
          {bdayReading && (
            <div style={previewCard}>
              <div style={previewTitle}>Your Personal Reading</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                <ReadingChip label="Life Path" value={bdayReading.lpDisplay} color="var(--accent)" />
                <ReadingChip label="Sub LP" value={String(bdayReading.slp)} color="var(--accent-dim)" />
                <ReadingChip label="Eastern" value={bdayReading.animal} color="var(--gold)" />
                <ReadingChip label="Western" value={bdayReading.sign} color="#a78bfa" />
                <ReadingChip label="PY" value={bdayReading.pyDisplay} color="var(--teal)" />
                <ReadingChip label="PM" value={bdayReading.pmDisplay} color="var(--rose)" />
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button onClick={() => setStep(1)} style={backBtn}>← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!bdayReading}
              style={nextBtn(!bdayReading)}
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Address ── */}
      {step === 3 && (
        <div style={{ animation: 'fadeUp 0.3s ease both' }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: '1.8rem', textAlign: 'center', color: 'var(--text)', marginBottom: '28px' }}>
            What is your address?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={form.streetNumber} onChange={e => handleAddressField('streetNumber', e.target.value)}
                placeholder="Number" style={{ ...inputStyle, width: '100px' }} />
              <input value={form.streetName} onChange={e => handleAddressField('streetName', e.target.value)}
                placeholder="Street name" style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input value={form.city} onChange={e => handleAddressField('city', e.target.value)}
              placeholder="City" style={inputStyle} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input value={form.state} onChange={e => setField('state', e.target.value)}
                placeholder="State" style={{ ...inputStyle, flex: 1 }} />
              <input value={form.zip} onChange={e => setField('zip', e.target.value)}
                placeholder="ZIP" style={{ ...inputStyle, width: '90px' }} />
            </div>
          </div>

          {(streetNumVal !== null || streetNameReading || cityReading) && (
            <div style={previewCard}>
              <div style={previewTitle}>Your Address Readings</div>
              {streetNumVal !== null && form.streetNumber.trim() && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Street Number · {form.streetNumber}
                  </div>
                  <ReadingChip label="Numerology" value={String(streetNumVal)} color="var(--accent)" />
                </div>
              )}
              {streetNameReading && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Street Name · {form.streetName}
                  </div>
                  <LetterRow result={streetNameReading} />
                </div>
              )}
              {cityReading && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    City · {form.city}
                  </div>
                  <LetterRow result={cityReading} />
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button onClick={() => setStep(2)} style={backBtn}>← Back</button>
            <button
              onClick={handleFinish}
              disabled={saving || !form.streetNumber.trim() || !form.streetName.trim() || !form.city.trim()}
              style={nextBtn(saving || !form.streetNumber.trim() || !form.streetName.trim() || !form.city.trim())}
            >
              {saving ? 'Saving...' : 'Finish →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '11px 14px', background: 'var(--surface-2)',
  border: '1px solid var(--border)', borderRadius: '10px',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none',
  width: '100%', boxSizing: 'border-box',
};

const previewCard: React.CSSProperties = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '14px', padding: '20px', marginTop: '20px',
  animation: 'fadeUp 0.25s ease both',
};

const previewTitle: React.CSSProperties = {
  fontSize: '0.65rem', textTransform: 'uppercase',
  letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '4px',
};

function nextBtn(disabled: boolean): React.CSSProperties {
  return {
    flex: 1, padding: '12px', borderRadius: '12px',
    background: disabled ? 'var(--surface-3)' : 'var(--accent)',
    border: 'none', color: disabled ? 'var(--text-muted)' : '#0a0a0f',
    fontWeight: 700, fontSize: '0.9rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
  };
}

const backBtn: React.CSSProperties = {
  padding: '12px 20px', borderRadius: '12px',
  background: 'transparent', border: '1px solid var(--border)',
  color: 'var(--text-dim)', fontSize: '0.9rem', cursor: 'pointer',
};
