"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { IdleOrb } from "./IdleOrb";
import { hapticTransition } from "@/lib/haptics";
import { fadeIn, fadeOut } from "@/lib/audioFade";

/**
 * SESSION PLAYER — Audio Playback Component
 *
 * Phases: ready → entering → pre-session → explanation → playing → paused → completing
 *
 * First-time users hear explanation audio before guided meditation.
 * Returning users skip directly to guided meditation.
 *
 * Parent controls:
 * - isActive(): Check if session is in progress
 * - endEarly(): Gracefully end session before completion
 */

const EXPLANATION_KEY = "idle_explanation_heard";

type SessionPlayerProps = {
  title: string;
  subtitle?: string;
  src: string;
  explanationSrc?: string;
  secondsTotal?: number;
  onComplete: (completedSeconds: number, endedEarly: boolean) => void;
  onPhaseChange?: (phase: SessionPhase) => void;
};

export type SessionPhase = 'ready' | 'entering' | 'pre-session' | 'explanation' | 'playing' | 'paused' | 'completing';

export type SessionPlayerHandle = {
  isActive: () => boolean;
  endEarly: () => void;
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const SessionPlayer = forwardRef<SessionPlayerHandle, SessionPlayerProps>(function SessionPlayer(
  {
    title,
    subtitle,
    src,
    explanationSrc = '/audio/explanation.m4a',
    secondsTotal = 420,
    onComplete,
    onPhaseChange,
  },
  ref
) {
  // ═══════════════════════════════════════════════════════════════
  // LOCAL STATE
  // ═══════════════════════════════════════════════════════════════

  const [phase, setPhase] = useState<SessionPhase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [showStartPulse, setShowStartPulse] = useState(false);
  const [needsExplanation, setNeedsExplanation] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const explanationAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasStartedRef = useRef(false);
  const tickRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const audioUnlockedRef = useRef(false);
  const fadeCleanupRef = useRef<(() => void) | null>(null);

  // Check if first-time user on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const heard = localStorage.getItem(EXPLANATION_KEY);
      setNeedsExplanation(!heard);
    }
  }, []);

  // Derived values
  const remaining = Math.max(0, secondsTotal - elapsed);
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const progress = Math.min(elapsed / secondsTotal, 1);
  const timeDisplay = `${mm}:${pad2(ss)}`;

  // ═══════════════════════════════════════════════════════════════
  // PHASE CHANGE NOTIFICATION
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  // ═══════════════════════════════════════════════════════════════
  // SESSION START PULSE — Visual confirmation when session begins
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    if (phase === 'playing' && !hasStartedRef.current) {
      hasStartedRef.current = true;
      setShowStartPulse(true);

      // Remove pulse class after animation completes
      const timer = setTimeout(() => {
        setShowStartPulse(false);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [phase]);

  // ═══════════════════════════════════════════════════════════════
  // TICK — Updates elapsed time
  // ═══════════════════════════════════════════════════════════════

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    tickRef.current = window.setInterval(() => {
      const a = audioRef.current;
      if (!a || !mountedRef.current) return;

      const t = Math.floor(a.currentTime || 0);
      setElapsed(t);

      // Natural completion — gentle fade out
      if (t >= secondsTotal) {
        clearTick();
        setElapsed(secondsTotal);
        setPhase('completing');

        // Fade out, silence, then complete
        fadeCleanupRef.current = fadeOut(a, 3000, 600, () => {
          if (mountedRef.current) {
            onComplete(secondsTotal, false);
          }
        });
      }
    }, 250);
  }, [secondsTotal, clearTick, onComplete]);

  // ═══════════════════════════════════════════════════════════════
  // IMPERATIVE HANDLE
  // ═══════════════════════════════════════════════════════════════

  useImperativeHandle(ref, () => ({
    isActive: () => phase === 'playing' || phase === 'paused' || phase === 'explanation',
    endEarly: () => {
      const a = audioRef.current;
      const explA = explanationAudioRef.current;
      clearTick();

      // Cancel any ongoing fade
      if (fadeCleanupRef.current) {
        fadeCleanupRef.current();
        fadeCleanupRef.current = null;
      }

      // Stop explanation audio if playing
      if (explA) {
        explA.pause();
      }

      if (a) {
        // Gentle fade out, then silence, then complete
        setPhase('completing');
        fadeCleanupRef.current = fadeOut(a, 3000, 600, () => {
          if (mountedRef.current) {
            onComplete(elapsed, true);
          }
        });
      } else {
        setPhase('completing');
        onComplete(elapsed, true);
      }
    },
  }), [phase, elapsed, onComplete, clearTick]);

  // ═══════════════════════════════════════════════════════════════
  // AUDIO SETUP
  // ═══════════════════════════════════════════════════════════════

  useEffect(() => {
    mountedRef.current = true;

    // Main meditation audio
    const a = new Audio();
    (a as any).playsInline = true;
    (a as any).webkitPlaysInline = true;
    a.preload = "auto";
    a.src = src;
    audioRef.current = a;

    // Explanation audio (for first-time users)
    const explA = new Audio();
    (explA as any).playsInline = true;
    (explA as any).webkitPlaysInline = true;
    explA.preload = "auto";
    explA.src = explanationSrc;
    explanationAudioRef.current = explA;

    const handleCanPlay = () => {
      if (mountedRef.current) {
        setAudioReady(true);
        setError(null);
      }
    };

    const handleError = () => {
      if (mountedRef.current) {
        setError("Failed to load audio");
        setAudioReady(false);
      }
    };

    const handleEnded = () => {
      if (mountedRef.current) {
        clearTick();
        setPhase('completing');
        onComplete(Math.min(secondsTotal, Math.floor(a.currentTime)), false);
      }
    };

    a.addEventListener("canplaythrough", handleCanPlay);
    a.addEventListener("error", handleError);
    a.addEventListener("ended", handleEnded);
    a.load();
    explA.load();

    return () => {
      mountedRef.current = false;
      clearTick();

      // Cancel any ongoing fade
      if (fadeCleanupRef.current) {
        fadeCleanupRef.current();
        fadeCleanupRef.current = null;
      }

      a.removeEventListener("canplaythrough", handleCanPlay);
      a.removeEventListener("error", handleError);
      a.removeEventListener("ended", handleEnded);
      a.pause();
      explA.pause();
      audioRef.current = null;
      explanationAudioRef.current = null;
    };
  }, [src, explanationSrc, clearTick, onComplete, secondsTotal]);

  // ═══════════════════════════════════════════════════════════════
  // PLAYBACK CONTROLS
  // ═══════════════════════════════════════════════════════════════

  const unlockAudio = useCallback(async () => {
    const a = audioRef.current;
    if (!a || audioUnlockedRef.current) return;

    try {
      const vol = a.volume;
      a.volume = 0;
      await a.play();
      a.pause();
      a.currentTime = 0;
      a.volume = vol;
      audioUnlockedRef.current = true;
    } catch {
      // Will retry on actual play
    }
  }, []);

  // Start guided meditation (called after explanation or directly for returning users)
  const startMeditation = useCallback(async () => {
    const a = audioRef.current;
    if (!a || !mountedRef.current) return;

    try {
      // Start at 0 volume for gentle fade-in
      a.volume = 0;
      await a.play();
      audioUnlockedRef.current = true;

      // Gentle fade-in over 1500ms
      fadeCleanupRef.current = fadeIn(a, 0.8, 1500);

      setPhase('playing');
      startTick();
      hapticTransition();
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setError('Tap to enable audio');
        setPhase('ready');
      }
    }
  }, [startTick]);

  // Play explanation audio for first-time users
  const startExplanation = useCallback(async () => {
    const explA = explanationAudioRef.current;
    if (!explA || !mountedRef.current) return;

    // HARD LOCK: Mark as heard immediately (won't repeat even if user exits early)
    localStorage.setItem(EXPLANATION_KEY, 'true');
    setNeedsExplanation(false);

    try {
      explA.volume = 0;
      await explA.play();

      // Gentle fade-in
      fadeCleanupRef.current = fadeIn(explA, 0.9, 1000);

      setPhase('explanation');
      hapticTransition();

      // When explanation ends, gently transition to meditation
      explA.onended = () => {
        if (!mountedRef.current) return;

        // Brief pause before meditation starts
        setTimeout(() => {
          if (mountedRef.current) {
            startMeditation();
          }
        }, 800);
      };
    } catch (e: any) {
      // If explanation fails, skip to meditation
      startMeditation();
    }
  }, [startMeditation]);

  const handleTap = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;

    setError(null);

    if (phase === 'ready') {
      // Show entering animation
      setPhase('entering');

      // Unlock for iOS
      if (!audioUnlockedRef.current) {
        await unlockAudio();
      }

      // Brief delay for entering animation
      setTimeout(async () => {
        if (!mountedRef.current) return;

        setPhase('pre-session');

        // Start playback after pre-session brief moment
        setTimeout(async () => {
          if (!mountedRef.current) return;

          // First-time users hear explanation first
          if (needsExplanation) {
            startExplanation();
          } else {
            startMeditation();
          }
        }, 300);
      }, 400);

    } else if (phase === 'playing') {
      // Cancel any ongoing fade (e.g., fade-in)
      if (fadeCleanupRef.current) {
        fadeCleanupRef.current();
        fadeCleanupRef.current = null;
      }
      a.pause();
      clearTick();
      setPhase('paused');
    } else if (phase === 'paused') {
      try {
        await a.play();
        setPhase('playing');
        startTick();
      } catch {
        setError('Could not resume');
      }
    }
  }, [phase, unlockAudio, startTick, clearTick, needsExplanation, startExplanation, startMeditation]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  const orbMode = phase === 'ready' || phase === 'entering' ? 'idle' : 'active';
  const showTime = phase === 'playing' || phase === 'paused';
  const isExplanation = phase === 'explanation';

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-6">
      {/* Session context */}
      <div className="text-center mb-8">
        {subtitle && (
          <p
            className="text-[10px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--muted)', opacity: 0.35 }}
          >
            {subtitle}
          </p>
        )}
        <h1
          className="mt-1 text-xl font-light"
          style={{ color: 'var(--text)', opacity: 0.8 }}
        >
          {title}
        </h1>
      </div>

      {/* Central orb */}
      <button
        onClick={handleTap}
        disabled={(!audioReady && phase === 'ready') || phase === 'entering' || phase === 'completing' || phase === 'explanation'}
        className={`relative transition-transform duration-200 active:scale-[0.98] disabled:opacity-40 ${showStartPulse ? 'session-start-pulse' : ''}`}
        aria-label={phase === 'playing' ? "Pause" : "Play"}
      >
        <IdleOrb
          mode={orbMode}
          progress={progress}
          timeDisplay={showTime ? timeDisplay : undefined}
          size={280}
        />

        {/* Pause overlay */}
        {phase === 'paused' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-black/30" />
            <div className="relative flex gap-2">
              <span className="block h-8 w-2.5 rounded bg-white/70" />
              <span className="block h-8 w-2.5 rounded bg-white/70" />
            </div>
          </div>
        )}

        {/* Play icon when ready */}
        {phase === 'ready' && audioReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="ml-2 h-0 w-0 border-y-[14px] border-y-transparent border-l-[22px] border-l-white/50" />
          </div>
        )}
      </button>

      {/* Status hint */}
      <p
        className="mt-10 text-[11px] tracking-wide"
        style={{ color: 'var(--muted)', opacity: 0.25 }}
      >
        {phase === 'ready' && audioReady && 'tap to begin'}
        {phase === 'ready' && !audioReady && 'loading...'}
        {phase === 'entering' && ''}
        {phase === 'pre-session' && ''}
        {phase === 'explanation' && ''}
        {phase === 'paused' && 'tap to resume'}
        {phase === 'playing' && 'tap to pause'}
      </p>

      {/* Error */}
      {error && (
        <p
          className="mt-6 text-xs text-center"
          style={{ color: 'rgba(255,180,180,0.9)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default SessionPlayer;
