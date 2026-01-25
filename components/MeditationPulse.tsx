'use client';

/**
 * MEDITATION PULSE — Cosmic orbital glow
 *
 * VISUAL: Distant planetary light, soft and atmospheric
 * FORM: Single circular, soft edges, depth through layering
 * ANIMATION: Slow breathing scale (7% over 6.4s)
 * MOOD: Space, orbit, silence
 */

import { useEffect, useState } from 'react';

type MeditationPulseProps = {
  size?: number;
  active?: boolean;
};

export function MeditationPulse({
  size = 280,
  active = true,
}: MeditationPulseProps) {
  const [scale, setScale] = useState(1);

  // Slow sinusoidal breathing
  useEffect(() => {
    if (!active) {
      setScale(1);
      return;
    }

    let animationId: number;
    const startTime = Date.now();
    const cycleDuration = 6400;
    const scaleAmount = 0.07;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % cycleDuration) / cycleDuration;
      const cosValue = Math.cos(progress * Math.PI * 2);
      const normalizedScale = 1 + (scaleAmount * (1 - cosValue) / 2);

      setScale(normalizedScale);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [active]);

  const coreSize = size * 0.4;
  const glowSize = size * 0.7;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Outer atmospheric haze */}
      <div
        className="absolute"
        style={{
          width: glowSize,
          height: glowSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(200, 170, 130, 0.06) 0%, transparent 70%)',
          filter: 'blur(30px)',
          transform: `scale(${scale})`,
          willChange: 'transform',
        }}
      />

      {/* Core glow — warm distant light */}
      <div
        className="absolute"
        style={{
          width: coreSize,
          height: coreSize,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 48%, rgba(220, 190, 150, 0.18) 0%, rgba(200, 170, 130, 0.08) 50%, transparent 100%)',
          filter: 'blur(12px)',
          transform: `scale(${scale})`,
          willChange: 'transform',
        }}
      />

      {/* Inner bright point — like a distant star */}
      <div
        className="absolute"
        style={{
          width: coreSize * 0.35,
          height: coreSize * 0.35,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 245, 230, 0.12) 0%, transparent 100%)',
          filter: 'blur(6px)',
          transform: `scale(${scale})`,
          willChange: 'transform',
        }}
      />
    </div>
  );
}

export default MeditationPulse;
