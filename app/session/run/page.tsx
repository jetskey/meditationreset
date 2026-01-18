'use client';

/**
 * INVARIANTS — Do not violate:
 * 1. Session can ALWAYS be exited (back button visible/revealable)
 * 2. Audio fades in (~1500ms) at start, fades out (~3000ms) at end
 * 3. ~600ms silence after fade-out before completion UI
 * 4. Completion auto-dismisses (natural) or tap-to-continue (early)
 * 5. Stats recorded on completion (>=60s counts)
 * 6. Never traps user — exit always works
 * See PRODUCT_GUARDRAILS.md for full documentation.
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import SessionPlayer, { SessionPlayerHandle, SessionPhase } from '@/components/SessionPlayer';
import { IdleOrb } from '@/components/IdleOrb';
import { useStats } from '@/lib/stats';

/**
 * SESSION RUN PAGE — Cinematic & Ceremonial
 *
 * Layered depth:
 * - Background layer (gradient + vignette)
 * - Focus layer (session player / completion state)
 * - Chrome layer (minimal exit button)
 *
 * Threshold crossing:
 * - When entering session, chrome fades and background darkens
 * - Creates ritual entry without extra UI
 */

const SESSION_CONFIG: Record<string, { src: string; title: string; subtitle: string }> = {
  prime: {
    src: '/audio/guided-session.m4a',
    title: 'Prime',
    subtitle: 'Morning Focus',
  },
  decompress: {
    src: '/audio/guided-session.m4a',
    title: 'Decompress',
    subtitle: 'Evening Reset',
  },
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function RunContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const playerRef = useRef<SessionPlayerHandle>(null);
  const { recordSession } = useStats();

  const mode = searchParams.get('mode') || 'prime';
  const config = SESSION_CONFIG[mode] || SESSION_CONFIG.prime;

  // Track session phase for threshold effects
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('ready');

  // Exit button visibility - shows on interaction, auto-hides
  const [exitVisible, setExitVisible] = useState(false);
  const exitTimeoutRef = useRef<number | null>(null);

  const showExit = useCallback(() => {
    setExitVisible(true);
    // Clear existing timeout
    if (exitTimeoutRef.current) {
      window.clearTimeout(exitTimeoutRef.current);
    }
    // Auto-hide after 2.5s of no interaction
    exitTimeoutRef.current = window.setTimeout(() => {
      setExitVisible(false);
    }, 2500);
  }, []);

  // Show exit on any screen interaction during session
  useEffect(() => {
    const isInActiveSession = sessionPhase === 'playing' || sessionPhase === 'paused';
    if (!isInActiveSession) return;

    const handleInteraction = () => showExit();

    // Listen for touch and mouse
    window.addEventListener('touchstart', handleInteraction, { passive: true });
    window.addEventListener('mousemove', handleInteraction, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      if (exitTimeoutRef.current) {
        window.clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [sessionPhase, showExit]);

  const [completionState, setCompletionState] = useState<{
    isComplete: boolean;
    seconds: number;
    endedEarly: boolean;
  }>({ isComplete: false, seconds: 0, endedEarly: false });

  const handleComplete = useCallback((completedSeconds: number, endedEarly: boolean) => {
    // Record session to stats (only counts if >= 60 seconds)
    recordSession(completedSeconds);

    setCompletionState({
      isComplete: true,
      seconds: completedSeconds,
      endedEarly,
    });
  }, [recordSession]);

  const handlePhaseChange = useCallback((phase: SessionPhase) => {
    setSessionPhase(phase);
  }, []);

  const handleEndEarly = useCallback(() => {
    const player = playerRef.current;
    if (player?.isActive()) {
      player.endEarly();
    } else {
      router.push('/home');
    }
  }, [router]);

  const handleGoHome = useCallback(() => {
    router.push('/home');
  }, [router]);

  // Auto-dismiss after 4 seconds for natural completion
  useEffect(() => {
    if (!completionState.isComplete) return;
    if (completionState.endedEarly) return;

    const timer = setTimeout(() => {
      router.push('/home');
    }, 4000);

    return () => clearTimeout(timer);
  }, [completionState.isComplete, completionState.endedEarly, router]);

  // ═══════════════════════════════════════════════════════════════
  // THRESHOLD CROSSING EFFECTS
  // Chrome and background respond to session phase
  // ═══════════════════════════════════════════════════════════════
  const isEntering = sessionPhase === 'entering';
  const isInSession = sessionPhase === 'pre-session' || sessionPhase === 'playing' || sessionPhase === 'paused' || sessionPhase === 'completing';
  const isActiveSession = sessionPhase === 'playing' || sessionPhase === 'paused';

  // Exit button opacity:
  // - Ready: visible at 0.35
  // - Entering: fading to 0.1
  // - In session: low baseline (0.15), higher when interaction reveals it (0.5)
  const exitOpacity = isEntering
    ? 0.1
    : isActiveSession
      ? (exitVisible ? 0.5 : 0.15)
      : isInSession
        ? 0.1
        : 0.35;

  // Background darkening during threshold crossing
  const darkOverlayOpacity = isEntering ? 0.15 : 0;

  // ═══════════════════════════════════════════════════════════════
  // COMPLETION STATE
  // Ceremonial, celebratory, cinematic
  // ═══════════════════════════════════════════════════════════════
  if (completionState.isComplete) {
    const { seconds, endedEarly } = completionState;

    return (
      <div className="relative flex flex-col min-h-screen overflow-hidden">
        {/* Content */}
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6"
          onClick={handleGoHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleGoHome()}
        >
          <div style={{ animation: 'fadeIn 600ms ease-out' }}>
            {/* Completion orb */}
            <div className="mb-8">
              <IdleOrb mode="complete" size={200} />
            </div>

            {/* Time logged - large, celebratory */}
            <p
              className="text-4xl font-light text-center"
              style={{ color: 'var(--text)' }}
            >
              +{formatTime(seconds)}
            </p>

            {/* Status */}
            <p
              className="mt-3 text-base font-light text-center"
              style={{ color: 'var(--text)', opacity: 0.6 }}
            >
              {endedEarly ? 'Logged.' : 'Complete.'}
            </p>

            {/* Tap hint for early end */}
            {endedEarly && (
              <p
                className="mt-12 text-[11px] text-center tracking-wide"
                style={{ color: 'var(--muted)', opacity: 0.3 }}
              >
                tap to continue
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // ACTIVE SESSION STATE
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden">
      {/* Threshold darkening overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-400 ease-out"
        style={{ opacity: darkOverlayOpacity }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Exit button - top-left, reveals on interaction */}
        <header className="flex justify-start px-6 pt-14">
          <button
            onClick={handleEndEarly}
            onMouseEnter={showExit}
            className="p-2 -ml-2 transition-opacity duration-300 ease-out active:scale-[0.95]"
            style={{
              color: 'var(--muted)',
              opacity: exitOpacity,
            }}
            aria-label="Exit session"
          >
            {/* Back chevron - gentler than X */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </header>

        {/* Session Player */}
        <main className="flex-1 flex items-center justify-center">
          <SessionPlayer
            ref={playerRef}
            title={config.title}
            subtitle={config.subtitle}
            src={config.src}
            secondsTotal={420}
            onComplete={handleComplete}
            onPhaseChange={handlePhaseChange}
          />
        </main>
      </div>
    </div>
  );
}

export default function RunPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg0)]" />}>
      <RunContent />
    </Suspense>
  );
}
