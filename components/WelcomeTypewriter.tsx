'use client';

/**
 * WELCOME TYPEWRITER — Letter-by-letter text reveal with upward scroll
 *
 * BEHAVIOR:
 * - Letters appear ONE BY ONE (not word by word)
 * - Each letter appears instantly (no fade, no easing)
 * - Text block scrolls UPWARD continuously as letters appear
 * - Creates feeling of "arriving somewhere"
 *
 * TIMING:
 * - Letters synced to audio timestamps
 * - Natural speech cadence with slight irregularity
 *
 * VISUAL:
 * - No cursor, no blinking
 * - Only vertical translation (no opacity, no scale)
 *
 * FONT: Arimo 500, 28px, line-height 1.2, left-aligned
 */

import { useEffect, useState, useMemo } from 'react';

type LetterTiming = {
  char: string;
  time: number; // milliseconds from start
};

type WelcomeTypewriterProps = {
  letters: LetterTiming[];
  isPlaying: boolean;
  currentTime: number; // current time in ms
  onComplete?: () => void;
  scrollAmount?: number; // total scroll distance in px
};

export function WelcomeTypewriter({
  letters,
  isPlaying,
  currentTime,
  onComplete,
  scrollAmount = 200,
}: WelcomeTypewriterProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Calculate visible letters based on current time
  useEffect(() => {
    if (!isPlaying) return;

    let count = 0;
    for (const letter of letters) {
      if (currentTime >= letter.time) {
        count++;
      } else {
        break;
      }
    }

    setVisibleCount(count);

    // Trigger completion when all letters shown
    if (count === letters.length && !hasCompleted) {
      setHasCompleted(true);
      onComplete?.();
    }
  }, [currentTime, letters, isPlaying, onComplete, hasCompleted]);

  // Calculate scroll progress (0 to 1)
  const scrollProgress = useMemo(() => {
    if (letters.length === 0) return 0;
    return Math.min(visibleCount / letters.length, 1);
  }, [visibleCount, letters.length]);

  // Translate upward based on progress
  const translateY = -scrollProgress * scrollAmount;

  const visibleText = letters.slice(0, visibleCount).map(l => l.char).join('');

  return (
    <div
      className="text-left"
      style={{
        maxWidth: '70%',
        transform: `translateY(${translateY}px)`,
        willChange: 'transform',
      }}
    >
      <p
        className="text-typewriter leading-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        {visibleText}
      </p>
    </div>
  );
}

// Generate letter timings from text with natural speech cadence
export function generateLetterTimings(text: string, startDelay = 0): LetterTiming[] {
  const letters: LetterTiming[] = [];
  let time = startDelay;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    letters.push({ char, time });

    // Natural speech timing with slight variation
    if (char === ' ') {
      time += 80 + Math.random() * 40; // Pause between words
    } else if (char === ',' || char === '.') {
      time += 300 + Math.random() * 100; // Longer pause for punctuation
    } else if (char === '\n') {
      time += 400 + Math.random() * 100; // Pause for line break
    } else {
      time += 55 + Math.random() * 25; // Normal letter timing (~60-80ms)
    }
  }

  return letters;
}

// Default welcome message
export const WELCOME_TEXT = "Seven minutes of stillness, once a day.";
export const WELCOME_LETTERS = generateLetterTimings(WELCOME_TEXT, 400);

export default WelcomeTypewriter;
