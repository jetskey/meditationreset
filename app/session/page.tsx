'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Fixed 6-minute session duration
const SESSION_DURATION = 6 * 60; // 360 seconds

/**
 * Guidance array - the core meditation content.
 * Each entry has a `start` time (seconds) when it becomes active.
 * The guidance remains visible until the next entry's start time.
 *
 * 7 cues across 360 seconds = ~50 seconds per cue.
 * Mantra-style structure with psychological framing.
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

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  /**
   * Selects the active guidance based on elapsed time.
   * Iterates through the array and returns the text of the last
   * entry whose `start` time has been reached.
   */
  const getGuidanceForTime = useCallback((elapsedSeconds: number): string => {
    let activeText = GUIDANCE[0].text;
    for (const entry of GUIDANCE) {
      if (elapsedSeconds >= entry.start) {
        activeText = entry.text;
      } else {
        break; // Entries are sorted, so we can exit early
      }
    }
    return activeText;
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    endTimeRef.current = now + SESSION_DURATION * 1000;
    setTimeRemaining(SESSION_DURATION);
    setGuidanceText(GUIDANCE[0].text);
    setIsRunning(true);
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
        router.push('/reflection');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, router, getGuidanceForTime]);

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
          </div>
        )}

        {/*
          During session: guidance text is ALWAYS visible.
          This is the primary experience - large, centered, readable.
        */}
        {isRunning && (
          <>
            <p style={styles.guidance}>{guidanceText}</p>
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

  // Guidance text - THE PRIMARY ELEMENT
  // Large, centered, clearly readable, always visible during session
  guidance: {
    maxWidth: '500px',
    fontSize: '1.75rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
    margin: 0,
  },

  // Timer - secondary, smaller, positioned at bottom
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
