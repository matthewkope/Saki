'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function SignInPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!loading && session) router.replace('/onboarding');
  }, [session, loading, router]);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
  }

  async function handleEmail() {
    setError('');
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    if (mode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else if (data.session) router.push('/onboarding');
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (data.session) router.push('/onboarding');
      else setEmailSent(true); // confirmation email sent
    }
    setBusy(false);
  }

  if (loading) return null;

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '40px 36px',
      }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif", fontSize: '2rem',
          color: 'var(--accent)', margin: '0 0 8px', textAlign: 'center',
        }}>
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: '0 0 32px' }}>
          {mode === 'login' ? 'Sign in to your Cue profile' : 'Start your numerology journey'}
        </p>

        {emailSent ? (
          <div style={{ textAlign: 'center', color: 'var(--teal)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Check your email to confirm your account, then sign in.
          </div>
        ) : (
          <>
            {/* Google */}
            <button onClick={signInWithGoogle} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              border: '1px solid var(--border-light)', background: 'var(--surface-2)',
              color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              marginBottom: '20px', transition: 'border-color 0.15s',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>or</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            </div>

            {/* Email / password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <input
                type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
              />
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && mode === 'login' && handleEmail()}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {mode === 'register' && (
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleEmail()}
                    style={{ ...inputStyle, paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(s => !s)}
                    style={eyeBtn}
                    tabIndex={-1}
                  >
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div style={{ color: 'var(--rose)', fontSize: '0.82rem', marginBottom: '12px' }}>{error}</div>
            )}

            <button onClick={handleEmail} disabled={busy} style={{
              width: '100%', padding: '12px', borderRadius: '12px',
              background: 'var(--accent)', border: 'none', color: '#0a0a0f',
              fontWeight: 700, fontSize: '0.9rem', cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.7 : 1, transition: 'opacity 0.15s', marginBottom: '20px',
            }}>
              {busy ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setConfirmPassword(''); }} style={{
                background: 'none', border: 'none', color: 'var(--accent)',
                cursor: 'pointer', fontSize: '0.82rem', padding: 0,
              }}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '11px 14px', background: 'var(--surface-2)',
  border: '1px solid var(--border)', borderRadius: '10px',
  color: 'var(--text)', fontSize: '0.9rem', outline: 'none', width: '100%',
  boxSizing: 'border-box',
};

const eyeBtn: React.CSSProperties = {
  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
  padding: '0', lineHeight: 1, opacity: 0.6,
};
