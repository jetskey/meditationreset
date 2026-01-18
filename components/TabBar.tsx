'use client';

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
      <div className="flex items-center justify-around h-14 max-w-md mx-auto px-6">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href ||
            (tab.href === '/session' && pathname?.startsWith('/session'));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center gap-1 py-2 px-4 transition-colors"
              style={{
                color: isActive ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)',
              }}
            >
              <tab.icon />
              <span
                className="text-[10px] tracking-wider uppercase"
                style={{ letterSpacing: '0.08em' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path d="M9 22V12h6v10" />
    </svg>
  );
}

function SessionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  );
}
