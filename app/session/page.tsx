'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Fixed 6-minute session duration
const SESSION_DURATION = 6 * 60; // 360 seconds

// Path to the guided meditation audio file (served from /public/audio/)
const AUDIO_PATH = '/audio/daily-focus-reset.mp3';

/**
 * Guidance array - visual backup for the audio experience.
 */
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

  // Intro screen - shows only on first visit
  const [showIntro, setShowIntro] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.65);
  const [audioError, setAudioError] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Audio element ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Clear audio error state
   */
  const clearAudioError = useCallback(() => {
    setAudioError(null);
  }, []);

  /**
   * Initialize audio element and attach event listeners
   */
  const initAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio(AUDIO_PATH);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    // Listen for errors
    audio.onerror = () => {
      const code = audio.error?.code;
      const message = audio.error?.message || 'Unknown error';
      setAudioError(`Audio error (code ${code}): ${message}`);
    };

    // Clear error when audio is ready
    audio.oncanplay = () => {
      clearAudioError();
    };

    // Sync playing state
    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);

    return audio;
  }, [volume, clearAudioError]);

  /**
   * Sync volume changes to audio element
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  /**
   * Selects the active guidance based on elapsed time.
   */
  const getGuidanceForTime = useCallback((elapsedSeconds: number): string => {
    let activeText = GUIDANCE[0].text;
    for (const entry of GUIDANCE) {
      if (elapsedSeconds >= entry.start) {
        activeText = entry.text;
      } else {
        break;
      }
    }
    return activeText;
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Stop audio playback and reset position.
   */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  /**
   * Start the session.
   * Audio.play() is called directly inside this click handler (user gesture)
   * to satisfy browser autoplay policies.
   */
  const handleBegin = useCallback(async () => {
    const now = Date.now();
    startTimeRef.current = now;
    endTimeRef.current = now + SESSION_DURATION * 1000;
    setTimeRemaining(SESSION_DURATION);
    setGuidanceText(GUIDANCE[0].text);
    setIsRunning(true);
    clearAudioError();

    // Create or get audio element
    const audio = initAudio();
    audio.volume = 0.65;
    audio.currentTime = 0;

    // Play audio - must be in direct response to user gesture
    try {
      const p = audio.play();
      if (p !== undefined) {
        await p;
      }
    } catch (err: unknown) {
      const error = err as Error;
      setAudioError(`${error.name}: ${error.message}`);
    }
  }, [initAudio, clearAudioError]);

  /**
   * Toggle play/pause for the audio.
   */
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
        clearAudioError();
      } catch (err: unknown) {
        const error = err as Error;
        setAudioError(`${error.name}: ${error.message}`);
      }
    }
  }, [isPlaying, clearAudioError]);

  // Main loop: updates timer and guidance text every 100ms
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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  // Check if user has seen intro on first visit
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro) {
      setShowIntro(true);
    }
  }, []);

  // Dismiss intro and remember in localStorage
  const dismissIntro = useCallback(() => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  }, []);

  return (
    <main style={styles.container}>
      {/* Background gradient for depth */}
      <div style={styles.gradient} />

      {/* Intro overlay - shows only on first visit */}
      {showIntro && (
        <div style={styles.introOverlay}>
          <div style={styles.introContent}>
            <h2 style={styles.introTitle}>Daily Focus Reset</h2>
            <p style={styles.introText}>
              This is a short guided exercise to reduce mental noise and create
              distance from thoughts and sensations.
            </p>
            <p style={styles.introSubtext}>
              There&apos;s nothing to achieve.<br />
              Just listen and follow along.
            </p>
            <button style={styles.introButton} onClick={dismissIntro}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {/* Title - small, top of screen */}
        <span style={styles.title}>Daily Focus Reset</span>

        {/* Pre-session state */}
        {!isRunning && (
          <div style={styles.startArea}>
            <button style={styles.beginButton} onClick={handleBegin}>
              Begin
            </button>
            <span style={styles.durationLabel}>6 minutes</span>

            {/* Show audio error if present */}
            {audioError && (
              <span style={styles.audioWarning}>{audioError}</span>
            )}
          </div>
        )}

        {/* During session */}
        {isRunning && (
          <>
            {/* Guidance text - visual backup for voice */}
            <p style={styles.guidance}>{guidanceText}</p>

            {/* Audio controls - minimal, centered below guidance */}
            <div style={styles.audioControls}>
              {/* Play/Pause button */}
              <button
                style={styles.playPauseButton}
                onClick={togglePlayPause}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z" />
                  </svg>
                )}
              </button>

              {/* Volume slider */}
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

            {/* Audio error during session */}
            {audioError && (
              <span style={styles.audioWarningActive}>{audioError}</span>
            )}

            {/* Timer - secondary, positioned at bottom */}
            <span style={styles.timer}>{formatTime(timeRemaining)}</span>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#0a0a0c',
    overflow: 'hidden',
  },

  gradient: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(30,32,40,0.7) 0%, rgba(10,10,12,1) 70%)',
    pointerEvents: 'none',
  },

  content: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
  },

  title: {
    position: 'absolute',
    top: '2.5rem',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },

  startArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.25rem',
  },

  beginButton: {
    padding: '1rem 3rem',
    fontSize: '1.0625rem',
    fontWeight: 500,
    color: '#0a0a0c',
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '100px',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },

  durationLabel: {
    fontSize: '0.875rem',
    color: 'rgba(255,255,255,0.4)',
  },

  audioWarning: {
    fontSize: '0.75rem',
    color: 'rgba(255,200,150,0.8)',
    maxWidth: '300px',
    textAlign: 'center',
    marginTop: '0.5rem',
  },

  guidance: {
    maxWidth: '500px',
    fontSize: '1.5rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 1.7,
    letterSpacing: '0.01em',
    margin: 0,
    marginBottom: '2.5rem',
  },

  audioControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },

  playPauseButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  volumeSlider: {
    width: '80px',
    height: '4px',
    cursor: 'pointer',
    accentColor: 'rgba(255,255,255,0.5)',
  },

  audioWarningActive: {
    fontSize: '0.75rem',
    color: 'rgba(255,200,150,0.8)',
    marginTop: '1rem',
    maxWidth: '300px',
    textAlign: 'center',
  },

  timer: {
    position: 'absolute',
    bottom: '2.5rem',
    fontSize: '0.875rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.25)',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.1em',
  },

  // Intro overlay styles
  introOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(10,10,12,0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    zIndex: 10,
  },

  introContent: {
    maxWidth: '400px',
    textAlign: 'center',
  },

  introTitle: {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '1.25rem',
    letterSpacing: '0.01em',
  },

  introText: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.7,
    marginBottom: '1.5rem',
  },

  introSubtext: {
    fontSize: '0.9375rem',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.7,
    marginBottom: '2rem',
  },

  introButton: {
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#0a0a0c',
    backgroundColor: '#fff',
    border: 'none',
    borderRadius: '100px',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
};
