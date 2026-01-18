/**
 * INVARIANTS — Do not violate:
 * 1. Session tab is always reachable via TabBar
 * 2. Only ONE session type exists — no library, no picker expansion
 * 3. Duration is fixed at 7 minutes — no customization
 * 4. Navigates to /session/run for actual playback
 * 5. Copy must be calm + factual
 * See PRODUCT_GUARDRAILS.md for full documentation.
 */

import { SessionPicker } from '@/components/SessionPicker';

export default function SessionPage() {
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

          {/* Session Picker */}
          <SessionPicker />

          {/* Hint */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Audio guided · Tap to begin
          </p>
        </div>
      </div>
    </div>
  );
}
