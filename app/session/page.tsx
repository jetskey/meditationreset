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
      {/* Organic field-like background - layered earth tones */}
      <div style={styles.fieldLayer1} />
      <div style={styles.fieldLayer2} />
      <div style={styles.fieldLayer3} />

      {/* Intro overlay */}
      {showIntro && (
        <div style={styles.introBackdrop}>
          <div style={styles.introCard}>
            <span style={styles.introLabel}>Focus Reset</span>
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

      {/* Soft organic app surface */}
      <div style={styles.surface}>
        <span style={styles.sessionLabel}>Daily Focus Reset</span>

        {!isRunning ? (
          <div style={styles.preSession}>
            <button style={styles.beginButton} onClick={handleBegin}>
              Begin
            </button>
            <span style={styles.duration}>6 minutes</span>
            {audioError && <span style={styles.error}>{audioError}</span>}
          </div>
        ) : (
          <div style={styles.activeSession}>
            <p style={styles.guidance}>{guidanceText}</p>

            <div style={styles.controls}>
              <button
                style={styles.playButton}
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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

            <span style={styles.timer}>{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
    </main>
  );
}

/*
 * Organic field palette:
 * - Deep olive/moss for depth
 * - Warm sand/wheat for highlights
 * - Muted ember for warmth
 * - Soft sage for life
 */
const palette = {
  deep: '#1c1f1a',
  moss: '#2a2f26',
  olive: '#3d4438',
  sage: '#5a6352',
  sand: '#c8bea7',
  wheat: '#e8e0d0',
  ember: '#8b7355',
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
    backgroundColor: palette.deep,
  },

  // Layered organic field background
  fieldLayer1: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 140% 70% at 30% 100%, ${palette.olive}88 0%, transparent 60%),
      radial-gradient(ellipse 120% 50% at 70% 90%, ${palette.ember}44 0%, transparent 50%),
      linear-gradient(175deg, ${palette.deep} 0%, ${palette.moss} 100%)
    `,
  },

  fieldLayer2: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 80% 40% at 80% 20%, ${palette.sage}33 0%, transparent 50%),
      radial-gradient(ellipse 100% 60% at 10% 60%, ${palette.olive}55 0%, transparent 50%)
    `,
  },

  fieldLayer3: {
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(ellipse 60% 60% at 50% 50%, transparent 30%, ${palette.deep}66 100%)
    `,
  },

  // Soft organic surface
  surface: {
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    minHeight: '380px',
    padding: '2.5rem 2rem',
    backgroundColor: `${palette.moss}cc`,
    borderRadius: '32px',
    boxShadow: `
      0 8px 40px ${palette.deep}88,
      0 2px 8px ${palette.deep}44
    `,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  sessionLabel: {
    fontSize: '0.625rem',
    fontWeight: 500,
    color: `${palette.sage}`,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: '2.5rem',
    opacity: 0.7,
  },

  preSession: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.25rem',
  },

  beginButton: {
    padding: '1rem 2.25rem',
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: palette.deep,
    backgroundColor: palette.sand,
    border: 'none',
    borderRadius: '100px',
    cursor: 'pointer',
    letterSpacing: '0.03em',
  },

  duration: {
    fontSize: '0.75rem',
    color: palette.sage,
    opacity: 0.6,
  },

  error: {
    fontSize: '0.6875rem',
    color: palette.ember,
    opacity: 0.7,
    marginTop: '0.5rem',
  },

  activeSession: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingBottom: '1rem',
  },

  // Calm, not dominant guidance text
  guidance: {
    maxWidth: '320px',
    fontSize: '1.25rem',
    fontWeight: 400,
    color: palette.wheat,
    textAlign: 'center',
    lineHeight: 1.8,
    letterSpacing: '0.01em',
    marginBottom: '3rem',
    opacity: 0.88,
  },

  // Tactile, organic controls
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
  },

  playButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: `${palette.olive}`,
    color: palette.sand,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },

  volumeSlider: {
    width: '64px',
    height: '3px',
    cursor: 'pointer',
    accentColor: palette.sage,
    opacity: 0.5,
  },

  errorActive: {
    fontSize: '0.6875rem',
    color: palette.ember,
    opacity: 0.7,
    marginBottom: '1rem',
  },

  // Extremely subtle timer
  timer: {
    fontSize: '0.75rem',
    fontWeight: 400,
    color: palette.sage,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.1em',
    opacity: 0.35,
  },

  // Soft intro overlay
  introBackdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: `${palette.deep}e6`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    zIndex: 20,
  },

  introCard: {
    maxWidth: '340px',
    padding: '2.5rem 2rem',
    backgroundColor: palette.moss,
    borderRadius: '28px',
    textAlign: 'center',
  },

  introLabel: {
    display: 'block',
    fontSize: '0.625rem',
    fontWeight: 500,
    color: palette.sage,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: '1.5rem',
    opacity: 0.7,
  },

  introBody: {
    fontSize: '0.9375rem',
    color: palette.wheat,
    lineHeight: 1.75,
    marginBottom: '1rem',
    opacity: 0.85,
  },

  introNote: {
    fontSize: '0.8125rem',
    color: palette.sand,
    lineHeight: 1.7,
    marginBottom: '2rem',
    opacity: 0.55,
  },

  introButton: {
    padding: '0.875rem 2rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: palette.deep,
    backgroundColor: palette.sand,
    border: 'none',
    borderRadius: '100px',
    cursor: 'pointer',
    letterSpacing: '0.03em',
  },
};
