'use client';

/**
 * TAB BAR — Barely visible navigation
 *
 * Cosmic atmosphere: minimal, quiet, restrained
 * Thin strokes, subtle presence
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/home', label: 'Home', icon: HomeIcon },
  { href: '/session', label: 'Session', icon: SessionIcon },
  { href: '/stats', label: 'Stats', icon: StatsIcon },
];

export function TabBar() {
  const pathname = usePathname();

  // Hide tab bar on /session/run
  if (pathname?.startsWith('/session/run')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom bottom-nav">
      <div className="flex items-center justify-around h-12 max-w-md mx-auto px-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href ||
            (tab.href === '/session' && pathname?.startsWith('/session'));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center py-3 px-6"
              style={{
                color: isActive
                  ? 'rgba(255, 255, 255, 0.55)'
                  : 'rgba(255, 255, 255, 0.18)',
                transition: 'color 200ms ease',
              }}
            >
              <tab.icon />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function SessionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M12 7v5l3 1.5" />
      <circle cx="12" cy="12" r="8" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M5 18h14" />
      <path d="M5 13h7" />
      <path d="M5 8h10" />
    </svg>
  );
}
