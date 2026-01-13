'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Fixed 6-minute session duration
const SESSION_DURATION = 6 * 60; // 360 seconds

// Path to the guided meditation audio file
const AUDIO_PATH = '/audio/daily-focus-reset.mp3';

/**
 * Guidance array - visual backup for the audio experience.
 * Each entry has a `start` time (seconds) when it becomes active.
 * The guidance remains visible until the next entry's start time.
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

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [audioError, setAudioError] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element on mount
  useEffect(() => {
    const audio = new Audio(AUDIO_PATH);
    audio.loop = true; // Loop in case audio is shorter than session
    audio.volume = volume;
    audioRef.current = audio;

    // Handle audio errors (e.g., file not found)
    audio.addEventListener('error', () => {
      setAudioError('Add /public/audio/daily-focus-reset.mp3 to enable voice guidance.');
    });

    // Cleanup on unmount: stop audio
    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  // Sync volume changes to audio element
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
   * Start the session.
   * Audio must be started in direct response to user interaction
   * to satisfy browser autoplay policies.
   */
  const handleStart = useCallback(async () => {
    const now = Date.now();
    startTimeRef.current = now;
    endTimeRef.current = now + SESSION_DURATION * 1000;
    setTimeRemaining(SESSION_DURATION);
    setGuidanceText(GUIDANCE[0].text);
    setIsRunning(true);

    // Attempt to play audio
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        // Autoplay blocked or other error
        setAudioError('Tap play to start audio guidance.');
      }
    }
  }, []);

  /**
   * Toggle play/pause for the audio.
   */
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setAudioError(null); // Clear any previous error
      } catch {
        setAudioError('Unable to play audio.');
      }
    }
  }, [isPlaying]);

  /**
   * Stop audio playback completely.
   */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

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

  // Cleanup audio on unmount (safety net)
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return (
    <main style={styles.container}>
      {/* Background gradient for depth */}
      <div style={styles.gradient} />

      {/* Content */}
      <div style={styles.content}>
        {/* Title - small, top of screen */}
        <span style={styles.title}>Daily Focus Reset</span>

        {/* Pre-session state */}
        {!isRunning && (
          <div style={styles.startArea}>
            <button style={styles.beginButton} onClick={handleStart}>
              Begin
            </button>
            <span style={styles.durationLabel}>6 minutes</span>
            {/* Show audio error/warning if file is missing */}
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
                  // Pause icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  // Play icon
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

            {/* Audio warning if playback failed */}
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
    color: 'rgba(255,200,150,0.7)',
    maxWidth: '280px',
    textAlign: 'center',
    marginTop: '0.5rem',
  },

  // Guidance text - secondary to voice, but still visible
  guidance: {
    maxWidth: '500px',
    fontSize: '1.5rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
    margin: 0,
    marginBottom: '2rem',
  },

  // Audio controls container
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
  },

  // Timer - subtle, secondary
  timer: {
    position: 'absolute',
    bottom: '2.5rem',
    fontSize: '0.875rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.25)',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.1em',
  },
};
