'use client';

/**
 * INVARIANTS — Do not violate:
 * 1. Stats tab is always reachable via TabBar
 * 2. Stats are REFLECTIVE, not performative — no gamification
 * 3. No pressure language ("Don't break your streak!")
 * 4. No achievements, badges, levels, or rewards
 * 5. Copy must be calm + factual
 * 6. Data from localStorage via StatsProvider
 * See PRODUCT_GUARDRAILS.md for full documentation.
 */

import { useStats, formatFocusTime } from '@/lib/stats';

/**
 * STATISTICS PAGE — Reflective, Not Performative
 *
 * This page presents statistics as moments of reflection,
 * not achievements to chase. The tone is calm, honest, supportive.
 *
 * Three sections:
 * 1. Time in Stillness — cumulative presence
 * 2. Sessions — intentional pauses today
 * 3. Consistency — days of return
 *
 * No gamification. No charts. No progress bars.
 * Just quiet acknowledgment of time spent.
 */

export default function StatsPage() {
  const { stats } = useStats();

  // Format total time for display
  const totalTimeDisplay = formatFocusTime(stats.totalFocusSeconds);

  return (
    <div className="page flex flex-col">
      {/* ═══════════════════════════════════════════════════════════════
          CONTENT — Glass panel floating above forest
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col min-h-screen px-5 pt-16 pb-24">
        <div className="page-glass">
          {/* ─────────────────────────────────────────────────────────────
              SECTION 1: Time in Stillness
              ───────────────────────────────────────────────────────────── */}
          <section className="mb-12">
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Time in Stillness
            </p>
            <p
              className="text-5xl font-light mb-2"
              style={{ color: 'var(--text)' }}
            >
              {totalTimeDisplay || '0 min'}
            </p>
            <p
              className="text-sm font-light"
              style={{ color: 'var(--text-secondary)' }}
            >
              Time spent in stillness
            </p>
          </section>

          {/* Subtle separator */}
          <div className="mb-12" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

          {/* ─────────────────────────────────────────────────────────────
              SECTION 2: Sessions
              ───────────────────────────────────────────────────────────── */}
          <section className="mb-12">
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Sessions
            </p>
            <p
              className="text-5xl font-light mb-2"
              style={{ color: 'var(--text)' }}
            >
              {stats.sessionsToday}
            </p>
            <p
              className="text-sm font-light"
              style={{ color: 'var(--text-secondary)' }}
            >
              Intentional pauses taken today
            </p>
          </section>

          {/* Subtle separator */}
          <div className="mb-12" style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />

          {/* ─────────────────────────────────────────────────────────────
              SECTION 3: Consistency
              ───────────────────────────────────────────────────────────── */}
          <section className="mb-8">
            <p
              className="text-[10px] uppercase tracking-[0.2em] mb-3"
              style={{ color: 'var(--text-tertiary)' }}
            >
              Consistency
            </p>
            <p
              className="text-5xl font-light mb-2"
              style={{ color: 'var(--text)' }}
            >
              {stats.currentStreak}
            </p>
            <p
              className="text-sm font-light"
              style={{ color: 'var(--text-secondary)' }}
            >
              {stats.currentStreak === 1 ? 'Day' : 'Days'} you returned to stillness
            </p>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              FOOTER — Quiet encouragement
              ───────────────────────────────────────────────────────────── */}
          <p
            className="text-center text-xs font-light mt-6"
            style={{ color: 'var(--text-muted)' }}
          >
            Each return matters
          </p>
        </div>
      </div>
    </div>
  );
}
