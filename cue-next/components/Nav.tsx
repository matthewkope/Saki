'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Personal Reading', href: '/reading' },
  { label: 'Compatibility', href: '/compatibility' },
  { label: 'Celebrities', href: '/celebrities' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Letterology', href: '/letterology' },
  { label: 'Search', href: '/search' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="top-nav">
      <div className="top-nav-inner">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`nav-tab${pathname === tab.href ? ' active' : ''}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
