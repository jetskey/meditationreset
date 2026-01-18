'use client';

/**
 * INVARIANTS — Do not violate:
 * 1. Home is always reachable via TabBar navigation
 * 2. Begin button navigates to /session/run (no overlays)
 * 3. Readiness state derived from stats.sessionsToday
 * 4. Landing gate appears on first visit (localStorage persisted)
 * 5. Copy must be calm + factual; never motivational
 * 6. No gamification: streak shown without pressure language
 * See PRODUCT_GUARDRAILS.md for full documentation.
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { IdleOrb } from '@/components/IdleOrb';
import { Quote } from '@/components/Quote';
import { useStats } from '@/lib/stats';
import { useLanding } from '@/lib/landing';

/**
 * LANDING SCREEN — Readiness State Aware
 *
 * Derives visual state from existing session data:
 * - "idle": No session completed today → "Ready when you are"
 * - "completed": Session completed today → "Attention reset complete"
 *
 * Note: "paused" state is not derivable from global state
 * (pause is local to SessionPlayer, and exitSession clears everything).
 */

const QUOTES = [
  "Clarity is a resource.",
  "Clarity precedes action.",
  "Seven minutes. Full presence.",
  "Reduce noise. Return to signal.",
  "The mind clears in stillness.",  // Changed: "sharpens" implied improvement
  "Small sessions. Steady return.",  // Changed: "leverage" was productivity language
  "Do less. Notice more.",
  "Begin again.",
];

function getDefaultSession(): 'prime' | 'decompress' {
  const hour = new Date().getHours();
  return hour < 12 ? 'prime' : 'decompress';
}

// ═══════════════════════════════════════════════════════════════
// READINESS STATE — Derived from stats
// ═══════════════════════════════════════════════════════════════

type ReadinessState = 'idle' | 'completed';

// Copy and button labels per state
const STATE_COPY: Record<ReadinessState, { centerText: string; buttonLabel: string; buttonDuration: string | null }> = {
  idle: {
    centerText: 'Ready when you are',
    buttonLabel: 'Begin',
    buttonDuration: '7 min',
  },
  completed: {
    centerText: 'Reset complete',  // Changed: removed "Attention" for consistency
    buttonLabel: 'Reset again',
    buttonDuration: null,
  },
};

export default function HomePage() {
  const router = useRouter();
  const { stats } = useStats();
  const { isClientReady, showLanding, dismissLanding, revisitLanding } = useLanding();
  const defaultSession = getDefaultSession();

  // ─────────────────────────────────────────────────────────────
  // PROGRESSIVE REVEAL — Landing page text stages
  // Timers start only when landing is shown and client is ready
  // ─────────────────────────────────────────────────────────────
  const [revealStage, setRevealStage] = useState(0);

  useEffect(() => {
    // Only run reveal when landing is actually visible
    if (!isClientReady || !showLanding) {
      setRevealStage(0);
      return;
    }

    // Stage 1: First reassurance after 2s
    const t1 = setTimeout(() => setRevealStage(1), 2000);
    // Stage 2: Second reassurance after 3.5s
    const t2 = setTimeout(() => setRevealStage(2), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isClientReady, showLanding]);

  // ─────────────────────────────────────────────────────────────
  // CLIENT NOT READY — Render nothing until localStorage checked
  // ─────────────────────────────────────────────────────────────
  if (!isClientReady) {
    return (
      <div className="page flex flex-col">
        <div className="absolute inset-0" style={{ background: 'var(--bg0)' }} />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // LANDING STATE — First-time welcome gate (progressive reveal)
  // ─────────────────────────────────────────────────────────────
  if (showLanding) {
    return (
      <div className="page flex flex-col items-center justify-center px-6">
        {/* Depth vignette over global forest */}
        <div className="landing-veil" />

        {/* Glass card container */}
        <div className="relative z-10 w-full max-w-[340px] page-entrance">
          <div
            className="glass-card px-8 py-10 text-center"
          >
            {/* Orienting line — small, subtle */}
            <p
              className="text-[11px] font-light tracking-[0.18em] uppercase mb-6"
              style={{ color: 'var(--muted)', opacity: 0.5 }}
            >
              A daily pause for the mind
            </p>

            {/* Primary headline */}
            <h1
              className="text-[24px] font-light tracking-wide leading-snug mb-10"
              style={{ color: 'var(--text)', opacity: 0.95 }}
            >
              Seven minutes.
              <br />
              Once a day.
            </h1>

            {/* CTA Button — glass tactile */}
            <button
              onClick={dismissLanding}
              className="glass-button px-10 py-3.5 rounded-full mb-10"
              style={{ color: 'var(--text)' }}
            >
              <span className="text-[15px] font-medium tracking-wide">Begin</span>
            </button>

            {/* Progressive reveal — appears below button */}
            <div className="min-h-[52px]">
              {/* First reassurance — reveals at stage 1 */}
              <p
                className="text-[13px] font-light leading-relaxed mb-2 transition-opacity duration-700"
                style={{
                  color: 'var(--text)',
                  opacity: revealStage >= 1 ? 0.5 : 0,
                }}
              >
                There's nothing to learn and nothing to get right.
              </p>

              {/* Second reassurance — reveals at stage 2 */}
              <p
                className="text-[13px] font-light leading-relaxed transition-opacity duration-700"
                style={{
                  color: 'var(--text)',
                  opacity: revealStage >= 2 ? 0.5 : 0,
                }}
              >
                You simply begin — and return.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // HOME STATE — Normal app experience
  // ─────────────────────────────────────────────────────────────
  const readiness: ReadinessState = stats.sessionsToday > 0 ? 'completed' : 'idle';
  const copy = STATE_COPY[readiness];

  // Breathing animation only in idle state
  const isBreathing = readiness === 'idle';

  return (
    <div className="page flex flex-col pb-24">

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 0: Depth vignette over global forest
          ═══════════════════════════════════════════════════════════════ */}
      <div className="landing-veil" />

      {/* ═══════════════════════════════════════════════════════════════
          LAYER 1: UI Chrome
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex flex-col min-h-screen">

        <header className="flex items-start justify-between px-6 pt-16">
          <button
            onClick={revisitLanding}
            className="text-[11px] uppercase tracking-[0.25em] font-medium transition-opacity duration-200 active:opacity-60"
            style={{ color: 'var(--muted)', opacity: 0.35 }}
            aria-label="About IDLE"
          >
            Idle
          </button>

          <div className="text-right">
            <p
              className="text-xl font-light tabular-nums"
              style={{ color: 'var(--text)', opacity: 0.8 }}
            >
              {stats.currentStreak}
            </p>
            <p
              className="text-[9px] uppercase tracking-[0.15em] mt-0.5"
              style={{ color: 'var(--muted)', opacity: 0.3 }}
            >
              Day streak
            </p>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════
            LAYER 2: Central Focus
            ═══════════════════════════════════════════════════════════════ */}
        <main className="flex-1 flex flex-col items-center justify-center px-6">

          {/* The Orb — with breathing animation in idle state */}
          <div className={`relative ${isBreathing ? 'home-breathing' : ''}`}>
            <IdleOrb mode="idle" size={280} />
          </div>

          {/* State-aware center text */}
          <p
            className="mt-6 text-[15px] font-light tracking-wide text-center"
            style={{ color: 'var(--text)', opacity: 0.6 }}
          >
            {copy.centerText}
          </p>

          {/* Grounding quote — only in idle state */}
          {readiness === 'idle' && (
            <Quote
              quotes={QUOTES}
              className="mt-4 text-[12px] font-light tracking-wide text-center max-w-[220px]"
              style={{ color: 'var(--muted)', opacity: 0.35 }}
            />
          )}
        </main>

        {/* ═══════════════════════════════════════════════════════════════
            LAYER 3: Primary Action — Glass CTA bar
            ═══════════════════════════════════════════════════════════════ */}
        <footer className="px-6 pb-6">
          <button
            onClick={() => router.push(`/session/run?mode=${defaultSession}`)}
            className="glass w-full py-4 transition-all duration-200 active:scale-[0.97]"
          >
            <div className="flex items-center justify-center gap-3">
              <span
                className="text-[15px] font-medium"
                style={{ color: 'rgba(255,255,255,0.9)' }}
              >
                {copy.buttonLabel}
              </span>
              {copy.buttonDuration && (
                <span
                  className="text-sm font-normal"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {copy.buttonDuration}
                </span>
              )}
            </div>
          </button>

          <p
            className="mt-4 text-center text-[10px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--muted)', opacity: 0.3 }}
          >
            {defaultSession === 'prime' ? 'Morning reset' : 'Evening reset'}
          </p>
        </footer>
      </div>
    </div>
  );
}
