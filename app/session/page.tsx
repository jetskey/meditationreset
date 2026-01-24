'use client';

/**
 * INVARIANTS — Do not violate:
 * 1. Session tab is always reachable via TabBar
 * 2. Only ONE session type exists — no library, no picker
 * 3. Duration is fixed at 7 minutes — no customization
 * 4. Navigates to /session/run for actual playback
 * 5. Copy must be calm + factual
 * See PRODUCT_GUARDRAILS.md for full documentation.
 */

import { useRouter } from 'next/navigation';

export default function SessionPage() {
  const router = useRouter();

  return (
    <div className="page flex flex-col pb-20">
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen px-5 pt-16 pb-8">
        {/* Glass panel floating above forest */}
        <div className="page-glass">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1
              className="text-[10px] uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-tertiary)', letterSpacing: '0.15em' }}
            >
              Session
            </h1>
            <p
              className="text-lg font-light"
              style={{ color: 'var(--text)' }}
            >
              7 minutes
            </p>
          </div>

          {/* Single session button */}
          <button
            onClick={() => router.push('/session/run')}
            className="session-card w-full text-left p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-base font-light"
                  style={{ color: 'var(--text)', opacity: 0.85 }}
                >
                  Begin
                </p>
                <p
                  className="text-[10px] uppercase tracking-[0.15em] mt-1"
                  style={{ color: 'var(--muted)', opacity: 0.5 }}
                >
                  Daily reset
                </p>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: 'var(--muted)', opacity: 0.35 }}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </button>

          {/* Hint */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Audio guided · One session per day
          </p>
        </div>
      </div>
    </div>
  );
}
