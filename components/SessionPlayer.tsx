"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { IdleOrb } from "./IdleOrb";
import { hapticTransition } from "@/lib/haptics";
import { fadeIn, fadeOut } from "@/lib/audioFade";

/**
 * SESSION PLAYER — Cosmic atmosphere
 *
 * FONT: Arimo only
 * ORB: IdleOrb with structural rings
 * MOOD: Deep space, distant light
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
  const [phase, setPhase] = useState<SessionPhase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [needsExplanation, setNeedsExplanation] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const explanationAudioRef = useRef<HTMLAudioElement | null>(null);
  const tickRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const audioUnlockedRef = useRef(false);
  const fadeCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const heard = localStorage.getItem(EXPLANATION_KEY);
      setNeedsExplanation(!heard);
    }
  }, []);

  const remaining = Math.max(0, secondsTotal - elapsed);
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeDisplay = `${mm}:${pad2(ss)}`;

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

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

      if (t >= secondsTotal) {
        clearTick();
        setElapsed(secondsTotal);
        setPhase('completing');

        fadeCleanupRef.current = fadeOut(a, 3000, 600, () => {
          if (mountedRef.current) {
            onComplete(secondsTotal, false);
          }
        });
      }
    }, 250);
  }, [secondsTotal, clearTick, onComplete]);

  useImperativeHandle(ref, () => ({
    isActive: () => phase === 'playing' || phase === 'paused' || phase === 'explanation',
    endEarly: () => {
      const a = audioRef.current;
      const explA = explanationAudioRef.current;
      clearTick();

      if (fadeCleanupRef.current) {
        fadeCleanupRef.current();
        fadeCleanupRef.current = null;
      }

      if (explA) {
        explA.pause();
      }

      if (a) {
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

  useEffect(() => {
    mountedRef.current = true;

    const a = new Audio();
    (a as any).playsInline = true;
    (a as any).webkitPlaysInline = true;
    a.preload = "auto";
    a.src = src;
    audioRef.current = a;

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

  const startMeditation = useCallback(async () => {
    const a = audioRef.current;
    if (!a || !mountedRef.current) return;

    try {
      a.volume = 0;
      await a.play();
      audioUnlockedRef.current = true;

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

  const startExplanation = useCallback(async () => {
    const explA = explanationAudioRef.current;
    if (!explA || !mountedRef.current) return;

    localStorage.setItem(EXPLANATION_KEY, 'true');
    setNeedsExplanation(false);

    try {
      explA.volume = 0;
      await explA.play();

      fadeCleanupRef.current = fadeIn(explA, 0.9, 1000);

      setPhase('explanation');
      hapticTransition();

      explA.onended = () => {
        if (!mountedRef.current) return;

        setTimeout(() => {
          if (mountedRef.current) {
            startMeditation();
          }
        }, 800);
      };
    } catch {
      startMeditation();
    }
  }, [startMeditation]);

  const handleTap = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;

    setError(null);

    if (phase === 'ready') {
      setPhase('entering');

      if (!audioUnlockedRef.current) {
        await unlockAudio();
      }

      setTimeout(async () => {
        if (!mountedRef.current) return;

        setPhase('pre-session');

        setTimeout(async () => {
          if (!mountedRef.current) return;

          if (needsExplanation) {
            startExplanation();
          } else {
            startMeditation();
          }
        }, 300);
      }, 400);

    } else if (phase === 'playing') {
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
  // RENDER — Cosmic atmosphere with distant glow
  // ═══════════════════════════════════════════════════════════════

  const showTime = phase === 'playing' || phase === 'paused';

  // Map session phases to orb modes
  const getOrbMode = () => {
    switch (phase) {
      case 'entering':
      case 'pre-session':
        return 'entering';
      case 'explanation':
      case 'playing':
        return 'active';
      case 'completing':
        return 'completing';
      case 'paused':
      case 'ready':
      default:
        return 'idle';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-8">
      {/* Session label */}
      <p className="text-meta mb-10">{title}</p>

      {/* Central pulse — tap target */}
      <button
        onClick={handleTap}
        disabled={(!audioReady && phase === 'ready') || phase === 'entering' || phase === 'completing' || phase === 'explanation'}
        className="relative disabled:opacity-40"
        style={{ transition: 'opacity 300ms ease' }}
        aria-label={phase === 'playing' ? "Pause" : "Play"}
      >
        {/* IdleOrb — structural orbital rings */}
        <IdleOrb
          size={260}
          mode={getOrbMode()}
          progress={elapsed / secondsTotal}
          timeDisplay={showTime ? timeDisplay : undefined}
        />

        {/* Pause indicator */}
        {phase === 'paused' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-2.5 mt-16">
              <span
                className="block h-5 w-1.5 rounded-sm"
                style={{ background: 'rgba(255, 255, 255, 0.35)' }}
              />
              <span
                className="block h-5 w-1.5 rounded-sm"
                style={{ background: 'rgba(255, 255, 255, 0.35)' }}
              />
            </div>
          </div>
        )}

        {/* Play icon when ready */}
        {phase === 'ready' && audioReady && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="ml-1 h-0 w-0 border-y-[8px] border-y-transparent border-l-[12px]"
              style={{ borderLeftColor: 'rgba(255, 255, 255, 0.22)' }}
            />
          </div>
        )}
      </button>

      {/* Status hint */}
      <p
        className="mt-12 text-meta"
        style={{ opacity: 0.28 }}
      >
        {phase === 'ready' && audioReady && 'Begin'}
        {phase === 'ready' && !audioReady && '...'}
        {phase === 'paused' && 'Resume'}
        {phase === 'playing' && 'Pause'}
      </p>

      {/* Error */}
      {error && (
        <p
          className="mt-8 text-body text-center"
          style={{ color: 'rgba(255, 180, 180, 0.6)' }}
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default SessionPlayer;
