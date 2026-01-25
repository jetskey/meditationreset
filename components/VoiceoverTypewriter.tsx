'use client';

/**
 * VOICEOVER TYPEWRITER — Precision audio-synced text reveal
 *
 * Character-by-character reveal synced to audio master clock.
 * Supports explicit sentence timing markers for voiceover sync.
 */

import { useEffect, useState, useMemo, useRef } from 'react';

type CharTiming = {
  char: string;
  targetTime: number; // ms from audio start
};

type SentenceMarker = {
  text: string;
  startTime: number; // ms when this sentence starts in audio
};

type VoiceoverTypewriterProps = {
  text: string;
  audioDuration: number; // total audio duration in ms
  audioCurrentTime: number; // current audio position in ms
  isPlaying: boolean;
  sentenceMarkers?: SentenceMarker[]; // explicit timing for sentences
};

// Timing constants (ms)
const BASE_INTERVAL = 42;
const PAUSE_SENTENCE = 280; // . ? !
const PAUSE_CLAUSE = 160; // , : ;
const PAUSE_LINEBREAK = 420;
const FIRST_CHAR_DELAY = 50; // Reduced for immediate feel
const END_BUFFER = 80;

function calculateTimingsFromMarkers(markers: SentenceMarker[]): CharTiming[] {
  const timings: CharTiming[] = [];

  for (let m = 0; m < markers.length; m++) {
    const marker = markers[m];
    const nextMarker = markers[m + 1];
    const text = marker.text;

    // Calculate available time for this sentence
    const sentenceStart = marker.startTime + (m === 0 ? FIRST_CHAR_DELAY : 0);
    const sentenceEnd = nextMarker ? nextMarker.startTime - 100 : marker.startTime + 3000;
    const availableTime = sentenceEnd - sentenceStart;

    // Calculate base timing for characters
    let totalBaseTime = 0;
    const charDelays: number[] = [];

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      let delay = BASE_INTERVAL;

      if (char === '.' || char === '?' || char === '!') {
        delay = BASE_INTERVAL + PAUSE_SENTENCE;
      } else if (char === ',' || char === ':' || char === ';') {
        delay = BASE_INTERVAL + PAUSE_CLAUSE;
      } else if (char === '\n') {
        delay = BASE_INTERVAL + PAUSE_LINEBREAK;
      }

      charDelays.push(delay);
      totalBaseTime += delay;
    }

    // Scale to fit available time
    const scaleFactor = totalBaseTime > 0 ? availableTime / totalBaseTime : 1;

    let currentTime = sentenceStart;
    for (let i = 0; i < text.length; i++) {
      timings.push({ char: text[i], targetTime: currentTime });
      currentTime += charDelays[i] * scaleFactor;
    }
  }

  return timings;
}

function calculateBaseTimings(text: string, audioDuration: number): CharTiming[] {
  const timings: CharTiming[] = [];
  let currentTime = FIRST_CHAR_DELAY;

  // Calculate total base time needed
  let totalBaseTime = 0;
  const charDelays: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    let delay = BASE_INTERVAL;

    if (char === '.' || char === '?' || char === '!') {
      delay = BASE_INTERVAL + PAUSE_SENTENCE;
    } else if (char === ',' || char === ':' || char === ';') {
      delay = BASE_INTERVAL + PAUSE_CLAUSE;
    } else if (char === '\n') {
      delay = BASE_INTERVAL + PAUSE_LINEBREAK;
    }

    charDelays.push(delay);
    totalBaseTime += delay;
  }

  // Scale to fit audio duration
  const availableDuration = audioDuration - END_BUFFER - FIRST_CHAR_DELAY;
  const scaleFactor = totalBaseTime > 0 ? availableDuration / totalBaseTime : 1;

  for (let i = 0; i < text.length; i++) {
    timings.push({ char: text[i], targetTime: currentTime });
    currentTime += charDelays[i] * scaleFactor;
  }

  return timings;
}

export function VoiceoverTypewriter({
  text,
  audioDuration,
  audioCurrentTime,
  isPlaying,
  sentenceMarkers,
}: VoiceoverTypewriterProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const desyncAccumulatorRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);

  // Pre-calculate all timings
  const charTimings = useMemo(() => {
    if (sentenceMarkers && sentenceMarkers.length > 0) {
      return calculateTimingsFromMarkers(sentenceMarkers);
    }
    return calculateBaseTimings(text, audioDuration);
  }, [text, audioDuration, sentenceMarkers]);

  // Sync to audio current time
  useEffect(() => {
    if (!isPlaying || charTimings.length === 0) {
      if (!isPlaying) {
        setVisibleCount(0);
        desyncAccumulatorRef.current = 0;
      }
      return;
    }

    // Find how many characters should be visible at current audio time
    let targetCount = 0;
    for (let i = 0; i < charTimings.length; i++) {
      if (audioCurrentTime >= charTimings[i].targetTime) {
        targetCount = i + 1;
      } else {
        break;
      }
    }

    lastUpdateTimeRef.current = audioCurrentTime;
    setVisibleCount(targetCount);
  }, [audioCurrentTime, isPlaying, charTimings]);

  // Reset on text change
  useEffect(() => {
    setVisibleCount(0);
    desyncAccumulatorRef.current = 0;
    lastUpdateTimeRef.current = 0;
  }, [text]);

  const visibleText = charTimings.slice(0, visibleCount).map(t => t.char).join('');

  return (
    <div
      style={{
        fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
        fontWeight: 400,
        fontSize: '18px',
        lineHeight: '26px',
        letterSpacing: '0.2px',
        color: '#E8EEF5',
        background: 'transparent',
        whiteSpace: 'pre-wrap',
      }}
    >
      {visibleText}
    </div>
  );
}

export default VoiceoverTypewriter;
