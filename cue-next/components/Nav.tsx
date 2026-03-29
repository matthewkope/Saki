'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const APPS = [
  { label: 'Celebrities', href: '/celebrities' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Date Search', href: '/search' },
];

const TABS = [
  { label: 'Personal Reading', href: '/reading' },
  { label: 'Compatibility', href: '/compatibility' },
  { label: 'Letterology', href: '/letterology' },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const appsActive = APPS.some(a => pathname === a.href) || pathname === '/apps';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

        {/* Apps dropdown */}
        <div ref={ref} style={{ position: 'relative', flex: 1 }}>
          <Link
            href="/apps"
            className={`nav-tab${appsActive ? ' active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%' }}
            onClick={() => setOpen(false)}
          >
            Apps
            <span
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
              style={{ fontSize: '0.55rem', opacity: 0.6, cursor: 'pointer', paddingLeft: '2px' }}
            >
              {open ? '▲' : '▼'}
            </span>
          </Link>

          {open && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              minWidth: '140px',
              zIndex: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              {APPS.map(app => (
                <Link
                  key={app.href}
                  href={app.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    padding: '11px 18px',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: pathname === app.href ? 'var(--accent)' : 'var(--text-dim)',
                    textDecoration: 'none',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {app.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
