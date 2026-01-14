'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const SESSION_DURATION = 6 * 60;
const AUDIO_PATH = '/audio/daily-focus-reset.mp3';

const GUIDANCE = [
  { start: 0,   text: "Sit still. Let the body settle." },
  { start: 50,  text: "Notice the body as sensations." },
  { start: 100, text: "You are not the body." },
  { start: 155, text: "Notice thoughts as they appear." },
  { start: 210, text: "You are not the thoughts." },
  { start: 265, text: "You are the one observing." },
  { start: 320, text: "Remain here until the session ends." },
];

export default function SessionPage() {
  const router = useRouter();

  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_DURATION);
  const [guidanceText, setGuidanceText] = useState(GUIDANCE[0].text);
  const [showIntro, setShowIntro] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [audioError, setAudioError] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const clearAudioError = useCallback(() => setAudioError(null), []);

  const initAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(AUDIO_PATH);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;
    audio.onerror = () => setAudioError('Audio unavailable');
    audio.oncanplay = clearAudioError;
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    return audio;
  }, [volume, clearAudioError]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const getGuidanceForTime = useCallback((elapsed: number): string => {
    let text = GUIDANCE[0].text;
    for (const entry of GUIDANCE) {
      if (elapsed >= entry.start) text = entry.text;
      else break;
    }
    return text;
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const handleBegin = useCallback(async () => {
    const now = Date.now();
    startTimeRef.current = now;
    endTimeRef.current = now + SESSION_DURATION * 1000;
    setTimeRemaining(SESSION_DURATION);
    setGuidanceText(GUIDANCE[0].text);
    setIsRunning(true);
    clearAudioError();

    const audio = initAudio();
    audio.volume = 0.6;
    audio.currentTime = 0;
    try {
      await audio.play();
    } catch (err: unknown) {
      setAudioError((err as Error).message);
    }
  }, [initAudio, clearAudioError]);

  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
        clearAudioError();
      } catch (err: unknown) {
        setAudioError((err as Error).message);
      }
    }
  }, [isPlaying, clearAudioError]);

  useEffect(() => {
    if (!isRunning || !startTimeRef.current || !endTimeRef.current) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current!) / 1000);
      const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));
      setTimeRemaining(remaining);
      setGuidanceText(getGuidanceForTime(elapsed));
      if (remaining <= 0) {
        clearInterval(interval);
        stopAudio();
        router.push('/reflection');
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, router, getGuidanceForTime, stopAudio]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('hasSeenIntro')) setShowIntro(true);
  }, []);

  const dismissIntro = useCallback(() => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  }, []);

  return (
    <main style={styles.container}>
      {/* Atmospheric background - warm organic gradient */}
      <div style={styles.backgroundGradient} />
      <div style={styles.backgroundOverlay} />

      {/* First-time intro modal */}
      {showIntro && (
        <div style={styles.introBackdrop}>
          <div style={styles.introModal}>
            <h2 style={styles.introTitle}>Focus Reset</h2>
            <p style={styles.introBody}>
              A short guided exercise to reduce mental noise and create distance
              from thoughts and sensations.
            </p>
            <p style={styles.introNote}>
              There is nothing to achieve.<br />
              Just listen and follow along.
            </p>
            <button style={styles.introButton} onClick={dismissIntro}>
              Begin
            </button>
          </div>
        </div>
      )}

      {/* Floating app surface */}
      <div style={styles.appCard}>
        {/* Session label */}
        <span style={styles.sessionLabel}>Daily Focus Reset</span>

        {!isRunning ? (
          /* Pre-session */
          <div style={styles.preSession}>
            <button style={styles.beginButton} onClick={handleBegin}>
              Begin
            </button>
            <span style={styles.duration}>6 minutes</span>
            {audioError && <span style={styles.error}>{audioError}</span>}
          </div>
        ) : (
          /* Active session */
          <div style={styles.activeSession}>
            {/* Primary: guidance text */}
            <p style={styles.guidance}>{guidanceText}</p>

            {/* Secondary: audio controls */}
            <div style={styles.controls}>
              <button
                style={styles.playButton}
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={styles.volumeSlider}
                aria-label="Volume"
              />
            </div>

            {audioError && <span style={styles.errorActive}>{audioError}</span>}

            {/* Tertiary: timer */}
            <span style={styles.timer}>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
    </main>
  );
}

// Warm, earthy palette
const colors = {
  bg: '#1a1714',
  warm: '#2d2622',
  sand: '#c4b5a4',
  cream: '#f5f0e8',
  muted: 'rgba(196,181,164,0.5)',
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    overflow: 'hidden',
  },

  // Warm organic gradient background
  backgroundGradient: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 120% 80% at 20% 100%, rgba(139,109,76,0.25) 0%, transparent 50%),
      radial-gradient(ellipse 100% 60% at 80% 0%, rgba(87,75,60,0.3) 0%, transparent 50%),
      radial-gradient(ellipse 80% 80% at 50% 50%, rgba(45,38,34,0.8) 0%, transparent 70%),
      linear-gradient(180deg, #1a1714 0%, #0f0d0b 100%)
    `,
  },

  backgroundOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(15,13,11,0.4) 100%)',
  },

  // Floating app card
  appCard: {
    position: 'relative',
    width: '100%',
    maxWidth: '420px',
    minHeight: '400px',
    padding: '2.5rem 2rem',
    backgroundColor: 'rgba(26,23,20,0.75)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    borderRadius: '28px',
    border: '1px solid rgba(196,181,164,0.08)',
    boxShadow: `
      0 4px 24px rgba(0,0,0,0.3),
      0 1px 2px rgba(0,0,0,0.2),
      inset 0 1px 0 rgba(255,255,255,0.03)
    `,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  sessionLabel: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: colors.muted,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: '2rem',
  },

  // Pre-session state
  preSession: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },

  beginButton: {
    padding: '1rem 2.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: colors.bg,
    backgroundColor: colors.cream,
    border: 'none',
    borderRadius: '100px',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },

  duration: {
    fontSize: '0.8125rem',
    color: colors.muted,
  },

  error: {
    fontSize: '0.75rem',
    color: 'rgba(210,180,140,0.7)',
    marginTop: '0.5rem',
  },

  // Active session
  activeSession: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  // Primary element: guidance text
  guidance: {
    maxWidth: '340px',
    fontSize: '1.375rem',
    fontWeight: 400,
    color: colors.cream,
    textAlign: 'center',
    lineHeight: 1.75,
    letterSpacing: '0.01em',
    marginBottom: '2.5rem',
    opacity: 0.92,
  },

  // Audio controls
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.875rem',
    marginBottom: '1.5rem',
  },

  playButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '1px solid rgba(196,181,164,0.15)',
    backgroundColor: 'rgba(196,181,164,0.08)',
    color: colors.sand,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s ease',
  },

  volumeSlider: {
    width: '72px',
    height: '4px',
    cursor: 'pointer',
    accentColor: colors.sand,
    opacity: 0.6,
  },

  errorActive: {
    fontSize: '0.75rem',
    color: 'rgba(210,180,140,0.7)',
    marginBottom: '1rem',
  },

  // Tertiary: timer
  timer: {
    fontSize: '0.8125rem',
    fontWeight: 400,
    color: 'rgba(196,181,164,0.35)',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.08em',
  },

  // Intro modal
  introBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15,13,11,0.85)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    zIndex: 20,
  },

  introModal: {
    maxWidth: '360px',
    padding: '2.5rem 2rem',
    backgroundColor: 'rgba(26,23,20,0.9)',
    borderRadius: '24px',
    border: '1px solid rgba(196,181,164,0.1)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    textAlign: 'center',
  },

  introTitle: {
    fontSize: '1.125rem',
    fontWeight: 500,
    color: colors.cream,
    marginBottom: '1.25rem',
    letterSpacing: '0.02em',
  },

  introBody: {
    fontSize: '0.9375rem',
    color: 'rgba(196,181,164,0.8)',
    lineHeight: 1.7,
    marginBottom: '1rem',
  },

  introNote: {
    fontSize: '0.875rem',
    color: 'rgba(196,181,164,0.55)',
    lineHeight: 1.7,
    marginBottom: '2rem',
  },

  introButton: {
    padding: '0.875rem 2rem',
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: colors.bg,
    backgroundColor: colors.cream,
    border: 'none',
    borderRadius: '100px',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
};
