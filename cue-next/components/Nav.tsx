'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

const TABS = [
  { label: 'Personal Reading', href: '/reading' },
  { label: 'Compatibility', href: '/compatibility' },
  { label: 'Letterology', href: '/letterology' },
  { label: 'Apps', href: '/apps' },
];

export default function Nav() {
  const pathname = usePathname();
  const { session, loading } = useAuth();

  const avatarLetter = session?.user.user_metadata?.full_name?.[0] || session?.user.email?.[0]?.toUpperCase() || '?';

  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`nav-tab${pathname === tab.href || pathname.startsWith(tab.href + '/') ? ' active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}

        {/* Auth slot */}
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
            {session ? (
              <Link href="/profile" style={{ textDecoration: 'none' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'var(--surface-3)', border: '1px solid var(--border-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)',
                  cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                }}>
                  {session.user.user_metadata?.avatar_url
                    ? <img src={session.user.user_metadata.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : avatarLetter}
                </div>
              </Link>
            ) : (
              <Link href="/signin" style={{
                fontSize: '0.7rem', fontWeight: 500, letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '5px 12px',
                border: '1px solid var(--border-light)', borderRadius: 'var(--radius)',
                background: 'transparent', color: 'var(--text-dim)',
                cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap',
                transition: 'border-color 0.2s, color 0.2s',
              }}>
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
