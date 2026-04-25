'use client';

import { useRouter } from 'next/navigation';

const APPS = [
  {
    label: 'Celebrities',
    href: '/celebrities',
    icon: '★',
    description: 'Browse & filter famous people by numerology and zodiac',
    color: 'var(--accent)',
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: '◈',
    description: 'Explore numerological energy by date',
    color: 'var(--gold)',
  },
  {
    label: 'Date Search',
    href: '/search',
    icon: '◎',
    description: 'Look up any date for its numerological profile',
    color: 'var(--teal)',
  },
  {
    label: 'Lucky Number',
    href: '/lucky',
    icon: '✦',
    description: 'Find the lucky number for any birthday',
    color: 'var(--gold)',
  },
  {
    label: 'Locations',
    href: '/locations',
    icon: '◎',
    description: 'Explore countries, states, and cities by their founding numerology',
    color: 'var(--teal)',
  },
  {
    label: 'Clothing',
    href: '/clothing',
    icon: '✦',
    description: 'Explore fashion brands by their founding numerology',
    color: 'var(--rose)',
  },
  {
    label: 'Romance',
    href: '/romance',
    icon: '♡',
    description: 'Discover your ideal matches by numerology and zodiac',
    color: 'var(--rose)',
  },
  {
    label: 'Careers',
    href: '/careers',
    icon: '◆',
    description: 'Compare career paths across numerology and astrology systems',
    color: 'var(--accent)',
  },
  {
    label: 'Ancient Numbers',
    href: '/ancient-numbers',
    icon: '◬',
    description: 'Calculate Chaldean and Pythagorean name numbers',
    color: 'var(--gold)',
  },
];

export default function AppsPage() {
  const router = useRouter();

  return (
    <div style={{
      padding: '60px 24px',
      maxWidth: '700px',
      margin: '0 auto',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '2.8rem',
          color: 'var(--accent)',
          margin: '0 0 8px',
          letterSpacing: '0.02em',
        }}>
          Apps
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
          Tools for exploring numerology &amp; astrology
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
        gap: '16px',
      }}>
        {APPS.map(app => (
          <button
            key={app.href}
            onClick={() => router.push(app.href)}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '28px 20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-2)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = app.color;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '1.8rem', color: app.color }}>{app.icon}</span>
            <div>
              <div style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '6px',
                letterSpacing: '0.02em',
              }}>
                {app.label}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {app.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
