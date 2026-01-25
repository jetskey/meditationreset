'use client';

import { useEffect, useRef } from 'react';

/**
 * IDLE ORB — Structural Geometry, Not Decoration
 *
 * Orbital rings, radial alignment, distance hierarchy
 * Feels like: instrument dial, radar sweep, aperture mechanism
 */

type OrbMode = 'idle' | 'entering' | 'active' | 'completing' | 'complete';

type IdleOrbProps = {
  mode?: OrbMode;
  progress?: number;
  timeDisplay?: string;
  size?: number;
};

type AnimationParams = {
  ringOpacity: number;
  coreGlow: number;
  rotationSpeed: number;
  pulseDepth: number;
};

const STATE_PARAMS: Record<OrbMode, AnimationParams> = {
  idle: {
    ringOpacity: 0.12,
    coreGlow: 0.7,
    rotationSpeed: 0.012,
    pulseDepth: 0.06,
  },
  entering: {
    ringOpacity: 0.18,
    coreGlow: 1.0,
    rotationSpeed: 0.025,
    pulseDepth: 0.08,
  },
  active: {
    ringOpacity: 0.15,
    coreGlow: 0.85,
    rotationSpeed: 0.018,
    pulseDepth: 0.05,
  },
  completing: {
    ringOpacity: 0.20,
    coreGlow: 1.0,
    rotationSpeed: 0.008,
    pulseDepth: 0.07,
  },
  complete: {
    ringOpacity: 0.08,
    coreGlow: 0.5,
    rotationSpeed: 0.004,
    pulseDepth: 0.02,
  },
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function IdleOrb({
  mode = 'idle',
  progress = 0,
  timeDisplay,
  size = 280,
}: IdleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const currentParamsRef = useRef<AnimationParams>({ ...STATE_PARAMS.idle });
  const targetModeRef = useRef<OrbMode>(mode);
  const transitionRef = useRef(1);
  const rotationRef = useRef(0);

  useEffect(() => {
    if (mode !== targetModeRef.current) {
      targetModeRef.current = mode;
      transitionRef.current = 0;
    }
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;

      // Interpolate parameters
      if (transitionRef.current < 1) {
        transitionRef.current = Math.min(1, transitionRef.current + dt / 1000);
        const t = transitionRef.current;
        const target = STATE_PARAMS[targetModeRef.current];
        const cur = currentParamsRef.current;
        cur.ringOpacity = lerp(cur.ringOpacity, target.ringOpacity, t);
        cur.coreGlow = lerp(cur.coreGlow, target.coreGlow, t);
        cur.rotationSpeed = lerp(cur.rotationSpeed, target.rotationSpeed, t);
        cur.pulseDepth = lerp(cur.pulseDepth, target.pulseDepth, t);
      }

      const p = currentParamsRef.current;
      rotationRef.current += p.rotationSpeed * dt * 0.001;

      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;

      // Subtle pulse
      const pulse = 1 + Math.sin(currentTime * 0.001) * p.pulseDepth;

      // ═══════════════════════════════════════════════════════════════
      // STRUCTURAL RINGS — Orbital alignment, not decoration
      // ═══════════════════════════════════════════════════════════════

      const rings = [
        { radius: 95 * pulse, segments: 60, gap: 0.15 },
        { radius: 70 * pulse, segments: 40, gap: 0.2 },
        { radius: 45 * pulse, segments: 24, gap: 0.25 },
      ];

      ctx.lineCap = 'round';

      rings.forEach((ring, ringIndex) => {
        const segmentAngle = (Math.PI * 2) / ring.segments;
        const gapAngle = segmentAngle * ring.gap;
        const drawAngle = segmentAngle - gapAngle;
        const rotation = rotationRef.current * (ringIndex % 2 === 0 ? 1 : -0.7);

        ctx.strokeStyle = `rgba(180, 165, 140, ${p.ringOpacity * (1 - ringIndex * 0.2)})`;
        ctx.lineWidth = 1;

        for (let i = 0; i < ring.segments; i++) {
          const startAngle = rotation + i * segmentAngle;
          const endAngle = startAngle + drawAngle;

          ctx.beginPath();
          ctx.arc(cx, cy, ring.radius, startAngle, endAngle);
          ctx.stroke();
        }
      });

      // ═══════════════════════════════════════════════════════════════
      // CARDINAL MARKERS — Alignment reference points
      // ═══════════════════════════════════════════════════════════════

      const markerRadius = 105 * pulse;
      const markers = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];

      ctx.fillStyle = `rgba(200, 180, 150, ${p.ringOpacity * 1.5})`;
      markers.forEach(angle => {
        const x = cx + Math.cos(angle + rotationRef.current * 0.3) * markerRadius;
        const y = cy + Math.sin(angle + rotationRef.current * 0.3) * markerRadius;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // ═══════════════════════════════════════════════════════════════
      // CORE — Warm aperture, not glowing orb
      // ═══════════════════════════════════════════════════════════════

      const coreRadius = 12 * pulse;

      // Soft glow field
      const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 4);
      glowGradient.addColorStop(0, `rgba(180, 160, 130, ${0.04 * p.coreGlow})`);
      glowGradient.addColorStop(0.5, `rgba(160, 145, 120, ${0.02 * p.coreGlow})`);
      glowGradient.addColorStop(1, 'rgba(140, 130, 110, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius * 4, 0, Math.PI * 2);
      ctx.fill();

      // Core aperture
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      coreGradient.addColorStop(0, `rgba(230, 225, 215, ${0.9 * p.coreGlow})`);
      coreGradient.addColorStop(0.6, `rgba(200, 185, 165, ${0.5 * p.coreGlow})`);
      coreGradient.addColorStop(1, `rgba(160, 150, 135, ${0.2 * p.coreGlow})`);
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [size]);

  const ringRadius = size / 2 - 18;
  const circumference = 2 * Math.PI * ringRadius;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: size, height: size }}
      />

      {/* Progress arc — structural, not decorative */}
      {(mode === 'active' || mode === 'completing') && (
        <svg
          className="absolute inset-0"
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={ringRadius}
            fill="none"
            stroke="rgba(180, 165, 140, 0.04)"
            strokeWidth="1"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={ringRadius}
            fill="none"
            stroke="rgba(200, 180, 150, 0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={(1 - progress) * circumference}
            style={{ transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.6, 1)' }}
          />
        </svg>
      )}

      {/* Time — dimmer than body text */}
      {mode === 'active' && timeDisplay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-3xl tabular-nums"
            style={{ color: 'rgba(230, 232, 235, 0.7)' }}
          >
            {timeDisplay}
          </span>
        </div>
      )}

      {mode === 'completing' && timeDisplay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-2xl tabular-nums"
            style={{ color: 'rgba(230, 232, 235, 0.4)' }}
          >
            {timeDisplay}
          </span>
        </div>
      )}

      {mode === 'complete' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-sm tracking-widest uppercase"
            style={{ color: 'rgba(230, 232, 235, 0.5)', letterSpacing: '0.2em' }}
          >
            Done
          </span>
        </div>
      )}
    </div>
  );
}

export default IdleOrb;
