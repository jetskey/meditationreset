'use client';

/**
 * SESSION RUN PAGE — Single session, no mode selection
 *
 * FONT: Arimo only
 * ORB: IdleOrb with structural rings
 */

import { useRouter } from 'next/navigation';
import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import SessionPlayer, { SessionPlayerHandle, SessionPhase } from '@/components/SessionPlayer';
import { IdleOrb } from '@/components/IdleOrb';
import { useStats } from '@/lib/stats';

// Single session configuration
const SESSION_AUDIO = '/audio/finalaudioidle.mp3';
const SESSION_TITLE = 'Session';
const SESSION_DURATION = 420; // 7 minutes

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function RunContent() {
  const router = useRouter();
  const playerRef = useRef<SessionPlayerHandle>(null);
  const { recordSession } = useStats();

  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('ready');
  const [exitVisible, setExitVisible] = useState(false);
  const exitTimeoutRef = useRef<number | null>(null);

  const showExit = useCallback(() => {
    setExitVisible(true);
    if (exitTimeoutRef.current) {
      window.clearTimeout(exitTimeoutRef.current);
    }
    exitTimeoutRef.current = window.setTimeout(() => {
      setExitVisible(false);
    }, 2500);
  }, []);

  useEffect(() => {
    const isInActiveSession = sessionPhase === 'playing' || sessionPhase === 'paused';
    if (!isInActiveSession) return;

    const handleInteraction = () => showExit();

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

  // Exit button opacity
  const isEntering = sessionPhase === 'entering';
  const isInSession = sessionPhase === 'pre-session' || sessionPhase === 'playing' || sessionPhase === 'paused' || sessionPhase === 'completing';
  const isActiveSession = sessionPhase === 'playing' || sessionPhase === 'paused';

  const exitOpacity = isEntering
    ? 0.1
    : isActiveSession
      ? (exitVisible ? 0.5 : 0.15)
      : isInSession
        ? 0.1
        : 0.35;

  const darkOverlayOpacity = isEntering ? 0.15 : 0;

  // Completion state
  if (completionState.isComplete) {
    const { seconds, endedEarly } = completionState;

    return (
      <div className="relative flex flex-col min-h-screen overflow-hidden grain">
        <div className="atmosphere" />

        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-8"
          onClick={handleGoHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleGoHome()}
        >
          <div style={{ animation: 'fadeIn 600ms ease-out' }}>
            <div className="mb-12">
              <IdleOrb size={180} mode="complete" />
            </div>

            <p
              className="text-number text-center"
              style={{ color: 'var(--text-primary)' }}
            >
              +{formatTime(seconds)}
            </p>

            <p
              className="mt-4 text-body text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {endedEarly ? 'Logged.' : 'Complete.'}
            </p>

            {endedEarly && (
              <p
                className="mt-16 text-meta text-center"
                style={{ opacity: 0.25 }}
              >
                tap to continue
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active session state
  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden grain">
      <div className="atmosphere" />

      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-400 ease-out z-10"
        style={{ opacity: darkOverlayOpacity }}
      />

      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="flex justify-start px-8 pt-16">
          <button
            onClick={handleEndEarly}
            onMouseEnter={showExit}
            className="p-2 -ml-2 transition-opacity duration-300 ease-out active:scale-[0.95]"
            style={{
              color: 'var(--text-muted)',
              opacity: exitOpacity,
            }}
            aria-label="Exit session"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center px-8">
          <SessionPlayer
            ref={playerRef}
            title={SESSION_TITLE}
            src={SESSION_AUDIO}
            secondsTotal={SESSION_DURATION}
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
    <Suspense fallback={<div className="min-h-screen" style={{ background: 'var(--bg)' }} />}>
      <RunContent />
    </Suspense>
  );
}
