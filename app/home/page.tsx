'use client';

/**
 * HOME SCREEN — Orb-centered minimal interface
 *
 * The idle orb is the primary anchor.
 * All UI sits below the orb.
 * Nothing required of the user.
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useStats } from '@/lib/stats';
import { useLanding } from '@/lib/landing';
import { IdleOrb } from '@/components/IdleOrb';
import { VoiceoverTypewriter } from '@/components/VoiceoverTypewriter';

const SENTENCE_MARKERS = [
  { text: "Welcome to idle.\n\n", startTime: 0 },
  { text: "idle is a simple practice to create space between you and your thoughts.\n\n", startTime: 2200 },
  { text: "You're not trying to control your mind or reach a special state.\n\n", startTime: 7200 },
  { text: "You're practicing stepping back, so thoughts can be there without pulling you in.\n\n", startTime: 12200 },
  { text: "What matters most is consistency.\n\n", startTime: 19200 },
  { text: "A few minutes, done regularly, work better than occasional long sessions.\n\n", startTime: 22800 },
  { text: "Let's begin.", startTime: 27000 },
];

const WELCOME_TEXT = SENTENCE_MARKERS.map(m => m.text).join('');
const AUDIO_DURATION = 28160;

export default function HomePage() {
  const router = useRouter();
  const { stats } = useStats();
  const { isClientReady, showLanding, dismissLanding } = useLanding();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [welcomeComplete, setWelcomeComplete] = useState(false);
  const [welcomeScrolledOut, setWelcomeScrolledOut] = useState(false);
  const animationRef = useRef<number>(0);

  // Create audio immediately when landing should show
  useEffect(() => {
    if (showLanding && !audioRef.current) {
      audioRef.current = new Audio('/audio/idle-welcome.mp3');
      audioRef.current.preload = 'auto';
    }
  }, [showLanding]);

  const startPlayback = useCallback(() => {
    if (!audioRef.current || isPlaying) return;

    audioRef.current.play().then(() => {
      setIsPlaying(true);

      const trackTime = () => {
        if (audioRef.current) {
          setAudioCurrentTime(audioRef.current.currentTime * 1000);

          if (!audioRef.current.ended) {
            animationRef.current = requestAnimationFrame(trackTime);
          } else {
            handleAudioEnd();
          }
        }
      };
      animationRef.current = requestAnimationFrame(trackTime);
    }).catch(() => {});
  }, [isPlaying]);

  const handleAudioEnd = useCallback(() => {
    setWelcomeComplete(true);
    setTimeout(() => setWelcomeScrolledOut(true), 800);
  }, []);

  // Start playback immediately when client is ready
  useEffect(() => {
    if (showLanding && isClientReady && !isPlaying) {
      startPlayback();
    }
  }, [showLanding, isClientReady, isPlaying, startPlayback]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSkip = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
    if (audioRef.current) audioRef.current.pause();
    setWelcomeScrolledOut(true);
    dismissLanding();
  }, [dismissLanding]);

  useEffect(() => {
    if (welcomeScrolledOut && showLanding) dismissLanding();
  }, [welcomeScrolledOut, showLanding, dismissLanding]);

  if (!isClientReady) {
    return <div className="page" style={{ background: '#000000' }} />;
  }

  const isComplete = stats.sessionsToday > 0;

  return (
    <div className="page relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* ═══════════════════════════════════════════════════════════════
          HOME LAYER — Orb as primary anchor
          ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 flex flex-col items-center">
        {/* Top spacer with meta */}
        <div
          className="w-full px-8 pt-14 flex justify-between"
          style={{ opacity: 0.4 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-arimo), system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Idle
          </span>
          <span
            style={{
              fontFamily: 'var(--font-arimo), system-ui, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              letterSpacing: '0.5px',
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
          </span>
        </div>

        {/* Orb — primary anchor, slightly above center */}
        <div
          className="flex-1 flex items-center justify-center"
          style={{ marginTop: '-6%' }}
        >
          <IdleOrb size={240} />
        </div>

        {/* Message — below orb */}
        <div
          className="w-full px-8 text-center"
          style={{ marginTop: '-15%' }}
        >
          <p
            style={{
              fontFamily: 'var(--font-arimo), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: '22px',
              lineHeight: 1.4,
              color: 'rgba(255, 255, 255, 0.85)',
              letterSpacing: '-0.2px',
            }}
          >
            {isComplete ? 'Complete.' : 'Ready when you are.'}
          </p>
        </div>

        {/* Action — bottom */}
        <div className="w-full px-8 pb-10 pt-16 safe-bottom">
          <button
            onClick={() => router.push('/session/run')}
            style={{
              width: '100%',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              borderRadius: '28px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              fontFamily: 'var(--font-arimo), system-ui, sans-serif',
              fontWeight: 500,
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.85)',
              cursor: 'pointer',
            }}
          >
            <span>{isComplete ? 'Again' : 'Begin'}</span>
            <span style={{ opacity: 0.5 }}>7 min</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          WELCOME LAYER — Typewriter (first visit only)
          ═══════════════════════════════════════════════════════════════ */}
      {showLanding && !welcomeScrolledOut && (
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            opacity: welcomeScrolledOut ? 0 : 1,
            transition: 'opacity 600ms ease-out',
            background: '#000000',
          }}
        >
          {/* Top label */}
          <div className="w-full px-8 pt-14">
            <span
              style={{
                fontFamily: 'var(--font-arimo), system-ui, sans-serif',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '1.2px',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.4)',
              }}
            >
              Welcome
            </span>
          </div>

          {/* Typewriter — centered */}
          <div className="flex-1 flex items-center px-8">
            <div style={{ maxWidth: '90%' }}>
              <VoiceoverTypewriter
                text={WELCOME_TEXT}
                audioDuration={AUDIO_DURATION}
                audioCurrentTime={audioCurrentTime}
                isPlaying={isPlaying}
                sentenceMarkers={SENTENCE_MARKERS}
              />
            </div>
          </div>

          {/* Skip */}
          <div className="w-full px-8 pb-10 safe-bottom">
            <button
              onClick={handleSkip}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '16px 0',
                fontFamily: 'var(--font-arimo), system-ui, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                letterSpacing: '0.5px',
              }}
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
