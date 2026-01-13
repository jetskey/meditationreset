'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Duration options in minutes
const DURATION_OPTIONS = [6, 10, 15];

// Guidance cues - psychologically framed, not spiritual
// Each cue appears at the specified second and remains until the next cue
const GUIDANCE_CUES = [
  { start: 0, text: "Sit still. Let the body settle." },
  { start: 20, text: "Close your eyes if they aren't already." },
  { start: 40, text: "Notice the body as a collection of sensations." },
  { start: 70, text: "You are observing these sensations." },
  { start: 100, text: "Notice thoughts as they arise." },
  { start: 130, text: "They are events. Not commands." },
  { start: 160, text: "You are not the body." },
  { start: 200, text: "You are not the thoughts." },
  { start: 240, text: "You are the one noticing." },
  { start: 280, text: "Rest in this noticing." },
  { start: 320, text: "You are not the body." },
  { start: 360, text: "You are not the thoughts." },
  { start: 400, text: "You are the awareness itself." },
  { start: 450, text: "Continue observing." },
  { start: 500, text: "You are not the body." },
  { start: 540, text: "You are not the thoughts." },
  { start: 580, text: "Remain here." },
  { start: 650, text: "You are not the body." },
  { start: 700, text: "You are not the thoughts." },
  { start: 750, text: "Stay with the stillness." },
  { start: 820, text: "The session is ending soon." },
  { start: 870, text: "Slowly return." },
];

export default function SessionPage() {
  const router = useRouter();

  const [duration, setDuration] = useState(6); // minutes
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentCue, setCurrentCue] = useState<string | null>(null);

  const startTimeRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Find the appropriate guidance cue for the current elapsed time
  const getCueForTime = useCallback((elapsedSeconds: number): string => {
    let activeCue = GUIDANCE_CUES[0].text;
    for (const cue of GUIDANCE_CUES) {
      if (elapsedSeconds >= cue.start) {
        activeCue = cue.text;
      } else {
        break;
      }
    }
    return activeCue;
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    const durationMs = duration * 60 * 1000;
    const now = Date.now();
    startTimeRef.current = now;
    endTimeRef.current = now + durationMs;
    setTimeRemaining(duration * 60);
    setCurrentCue(GUIDANCE_CUES[0].text);
    setIsRunning(true);
  }, [duration]);

  // Main timer and guidance loop
  useEffect(() => {
    if (!isRunning || !startTimeRef.current || !endTimeRef.current) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current!) / 1000);
      const remaining = Math.max(0, Math.ceil((endTimeRef.current! - now) / 1000));

      setTimeRemaining(remaining);
      setCurrentCue(getCueForTime(elapsed));

      if (remaining <= 0) {
        clearInterval(interval);
        router.push('/reflection');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, router, getCueForTime]);

  return (
    <main style={styles.container}>
      {/* Subtle gradient overlay for depth */}
      <div style={styles.gradientOverlay} />

      {/* Content layer */}
      <div style={styles.content}>
        {/* Title - always visible but understated */}
        <span style={styles.title}>Daily Focus Reset</span>

        {/* Pre-session: duration selector and begin button */}
        {!isRunning && (
          <div style={styles.startContainer}>
            {/* Duration selector - minimal pills */}
            <div style={styles.durationSelector}>
              {DURATION_OPTIONS.map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDuration(mins)}
                  style={{
                    ...styles.durationOption,
                    backgroundColor: duration === mins ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: duration === mins ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {mins} min
                </button>
              ))}
            </div>

            {/* Primary CTA */}
            <button style={styles.beginButton} onClick={handleStart}>
              Begin
            </button>
          </div>
        )}

        {/* During session: guidance text + timer */}
        {isRunning && (
          <>
            {/* Guidance text - the heart of the experience */}
            <p style={styles.guidance}>{currentCue}</p>

            {/* Timer - present but secondary */}
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

  // Subtle radial gradient for depth and containment
  gradientOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(30,32,40,0.8) 0%, rgba(10,10,12,1) 70%)',
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
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },

  startContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
  },

  durationSelector: {
    display: 'flex',
    gap: '0.5rem',
  },

  durationOption: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '100px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
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

  // Guidance text - large, readable, the primary focus
  guidance: {
    maxWidth: '480px',
    fontSize: '1.5rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },

  // Timer - subtle, secondary
  timer: {
    position: 'absolute',
    bottom: '2.5rem',
    fontSize: '0.9375rem',
    fontWeight: 400,
    color: 'rgba(255,255,255,0.3)',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.1em',
  },
};
