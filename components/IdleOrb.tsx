'use client';

import { useEffect, useRef } from 'react';

/**
 * IDLE ORB — State-Aware Animated Element
 *
 * Animation behavior by state:
 *
 * IDLE (ready):
 * - Very slow, ambient motion
 * - Loose orbits with significant drift
 * - Slow, deep breathing
 * - Communicates: "ready, waiting"
 *
 * ACTIVE (session in progress):
 * - Motion becomes coherent, synchronized
 * - Tighter orbits, less drift
 * - Faster, rhythmic breathing (like a heartbeat)
 * - Particles brighter, more present
 * - Communicates: "process in progress"
 *
 * COMPLETING (session ending):
 * - Particles slow and converge toward center
 * - Glow intensifies then fades
 * - Drift reduces to near-zero
 * - Communicates: "resolution, closure"
 *
 * COMPLETE (finished):
 * - Particles gathered at center
 * - Gentle pulse, then stillness
 * - Communicates: "done"
 *
 * All transitions are interpolated smoothly over ~1s.
 */

type OrbMode = 'idle' | 'entering' | 'active' | 'completing' | 'complete';

type IdleOrbProps = {
  mode?: OrbMode;
  progress?: number; // 0-1 for active mode
  timeDisplay?: string; // e.g. "5:32" for active mode
  size?: number; // px, default 280
};

// Animation parameters per state
type AnimationParams = {
  orbitSpeed: number;       // Base orbit speed multiplier
  driftAmplitude: number;   // How much particles drift in/out
  driftSpeed: number;       // How fast drift oscillates
  breatheSpeed: number;     // Core breathing rate
  breatheDepth: number;     // How much the core expands/contracts
  particleOpacity: number;  // Particle visibility
  convergence: number;      // 0 = normal orbit, 1 = all at center
  coreGlow: number;         // Core glow intensity
  coherence: number;        // 0 = loose/random, 1 = synchronized
};

const STATE_PARAMS: Record<OrbMode, AnimationParams> = {
  idle: {
    orbitSpeed: 0.3,
    driftAmplitude: 12,
    driftSpeed: 0.8,
    breatheSpeed: 0.6,
    breatheDepth: 0.2,
    particleOpacity: 0.245,  // Reduced 30%
    convergence: 0,
    coreGlow: 0.8,
    coherence: 0,
  },
  entering: {
    // Brief intensification - "crossing the threshold"
    orbitSpeed: 0.5,
    driftAmplitude: 6,
    driftSpeed: 1.0,
    breatheSpeed: 1.0,
    breatheDepth: 0.25,
    particleOpacity: 0.42,  // Reduced 30%
    convergence: 0.15,
    coreGlow: 1.4,
    coherence: 0.4,
  },
  active: {
    orbitSpeed: 1.0,
    driftAmplitude: 4,
    driftSpeed: 1.2,
    breatheSpeed: 1.5,
    breatheDepth: 0.12,
    particleOpacity: 0.385,  // Reduced 30%
    convergence: 0,
    coreGlow: 1.0,
    coherence: 0.6,
  },
  completing: {
    orbitSpeed: 0.15,
    driftAmplitude: 2,
    driftSpeed: 0.3,
    breatheSpeed: 0.4,
    breatheDepth: 0.25,
    particleOpacity: 0.49,  // Reduced 30%
    convergence: 0.7,
    coreGlow: 1.3,
    coherence: 0.9,
  },
  complete: {
    orbitSpeed: 0.05,
    driftAmplitude: 1,
    driftSpeed: 0.2,
    breatheSpeed: 0.3,
    breatheDepth: 0.1,
    particleOpacity: 0.28,  // Reduced 30%
    convergence: 0.85,
    coreGlow: 0.9,
    coherence: 1.0,
  },
};

// Smooth interpolation helper
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Ease-out cubic for smooth transitions
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function IdleOrb({
  mode = 'idle',
  progress = 0,
  timeDisplay,
  size = 280,
}: IdleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  // Current interpolated animation params (for smooth transitions)
  const currentParamsRef = useRef<AnimationParams>({ ...STATE_PARAMS.idle });
  const targetModeRef = useRef<OrbMode>(mode);
  const transitionProgressRef = useRef(1); // 1 = fully transitioned

  // Update target when mode changes
  useEffect(() => {
    if (mode !== targetModeRef.current) {
      targetModeRef.current = mode;
      transitionProgressRef.current = 0; // Start new transition
    }
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    // Initialize particles with individual properties
    const particleCount = 28;
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      // Position
      angle: (i / particleCount) * Math.PI * 2,
      baseRadius: 55 + Math.random() * 55,

      // Individual variation (makes motion feel organic)
      speedVariation: 0.7 + Math.random() * 0.6,
      sizeBase: 1 + Math.random() * 1.5,
      opacityBase: 0.6 + Math.random() * 0.4,

      // Drift state
      driftPhase: Math.random() * Math.PI * 2,
      driftVariation: 0.5 + Math.random() * 1.0,

      // For coherence effect (synchronized motion)
      coherenceOffset: Math.random() * Math.PI * 2,
    }));

    let time = 0;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      time += deltaTime;

      // ─────────────────────────────────────────────────────────────
      // INTERPOLATE ANIMATION PARAMETERS
      // Smooth transition between states over ~800ms
      // ─────────────────────────────────────────────────────────────
      if (transitionProgressRef.current < 1) {
        transitionProgressRef.current = Math.min(1, transitionProgressRef.current + deltaTime / 800);
        const t = easeOutCubic(transitionProgressRef.current);
        const target = STATE_PARAMS[targetModeRef.current];
        const current = currentParamsRef.current;

        current.orbitSpeed = lerp(current.orbitSpeed, target.orbitSpeed, t);
        current.driftAmplitude = lerp(current.driftAmplitude, target.driftAmplitude, t);
        current.driftSpeed = lerp(current.driftSpeed, target.driftSpeed, t);
        current.breatheSpeed = lerp(current.breatheSpeed, target.breatheSpeed, t);
        current.breatheDepth = lerp(current.breatheDepth, target.breatheDepth, t);
        current.particleOpacity = lerp(current.particleOpacity, target.particleOpacity, t);
        current.convergence = lerp(current.convergence, target.convergence, t);
        current.coreGlow = lerp(current.coreGlow, target.coreGlow, t);
        current.coherence = lerp(current.coherence, target.coherence, t);
      }

      const params = currentParamsRef.current;

      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;

      // ─────────────────────────────────────────────────────────────
      // CORE BREATHING
      // Idle: slow, deep breaths
      // Active: faster, rhythmic (heartbeat-like)
      // ─────────────────────────────────────────────────────────────
      const breathePhase = time * 0.001 * params.breatheSpeed;
      const breathe = 1 + Math.sin(breathePhase) * params.breatheDepth;

      // Secondary breath for more organic feel (only in idle)
      const secondaryBreathe = 1 + Math.sin(breathePhase * 0.7 + 1) * params.breatheDepth * 0.3 * (1 - params.coherence);

      const coreRadius = 10 * breathe * secondaryBreathe;

      // ─────────────────────────────────────────────────────────────
      // CORE GLOW LAYERS
      // ─────────────────────────────────────────────────────────────
      const glowIntensity = params.coreGlow * breathe;

      for (let i = 5; i >= 0; i--) {
        const glowRadius = coreRadius + i * 12 * breathe;
        const alpha = (0.12 - i * 0.018) * glowIntensity;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
        gradient.addColorStop(0, `rgba(157, 170, 149, ${alpha})`);
        gradient.addColorStop(0.6, `rgba(157, 170, 149, ${alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(157, 170, 149, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Core orb
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      coreGradient.addColorStop(0, `rgba(235, 245, 230, ${0.95 * glowIntensity})`);
      coreGradient.addColorStop(0.4, `rgba(200, 215, 195, ${0.8 * glowIntensity})`);
      coreGradient.addColorStop(1, `rgba(157, 170, 149, ${0.5 * glowIntensity})`);
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // ─────────────────────────────────────────────────────────────
      // ORBITING PARTICLES
      // Idle: loose, wandering orbits
      // Active: tighter, synchronized
      // Completing: converging toward center
      // ─────────────────────────────────────────────────────────────

      // Global coherence phase (all particles sync to this in active mode)
      const coherencePhase = time * 0.002;

      particlesRef.current.forEach((p, i) => {
        // Update angle (orbit)
        const individualSpeed = p.speedVariation * params.orbitSpeed * 0.0008;
        p.angle += individualSpeed * deltaTime;

        // Drift: how much the particle moves in/out
        p.driftPhase += params.driftSpeed * 0.0015 * p.driftVariation * deltaTime;

        // Blend between individual drift and coherent drift
        const individualDrift = Math.sin(p.driftPhase) * params.driftAmplitude * p.driftVariation;
        const coherentDrift = Math.sin(coherencePhase + p.coherenceOffset * 0.3) * params.driftAmplitude * 0.5;
        const drift = lerp(individualDrift, coherentDrift, params.coherence);

        // Calculate radius with convergence
        const normalRadius = p.baseRadius + drift;
        const convergedRadius = 20 + drift * 0.3; // All particles near center
        const currentRadius = lerp(normalRadius, convergedRadius, params.convergence);

        // Position
        const x = cx + Math.cos(p.angle) * currentRadius;
        const y = cy + Math.sin(p.angle) * currentRadius;

        // Size pulses with coherence in active mode
        const sizePulse = 1 + Math.sin(coherencePhase * 2 + i * 0.2) * 0.15 * params.coherence;
        const particleSize = p.sizeBase * sizePulse;

        // Opacity
        const baseOpacity = p.opacityBase * params.particleOpacity;
        const opacityPulse = 1 + Math.sin(coherencePhase + i * 0.1) * 0.2 * params.coherence;
        const opacity = baseOpacity * opacityPulse * breathe;

        // Particle glow
        const glowSize = particleSize * (3 + params.coherence);
        const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        particleGlow.addColorStop(0, `rgba(200, 220, 195, ${opacity * 0.8})`);
        particleGlow.addColorStop(0.5, `rgba(180, 200, 175, ${opacity * 0.3})`);
        particleGlow.addColorStop(1, 'rgba(180, 200, 175, 0)');
        ctx.fillStyle = particleGlow;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Particle core
        ctx.fillStyle = `rgba(240, 250, 235, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [size]); // Note: mode changes are handled via refs, not dependency

  const ringRadius = size / 2 - 20;
  const circumference = 2 * Math.PI * ringRadius;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Canvas for particle system - softened edges */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: size, height: size, filter: 'blur(1.5px)' }}
      />

      {/* Progress ring (active mode only) */}
      {(mode === 'active' || mode === 'completing') && (
        <svg
          className="absolute inset-0"
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={ringRadius}
            fill="none"
            stroke="rgba(157, 170, 149, 0.08)"
            strokeWidth="2"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={ringRadius}
            fill="none"
            stroke="rgba(157, 170, 149, 0.5)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={(1 - progress) * circumference}
            style={{ transition: 'stroke-dashoffset 0.3s ease-out' }}
          />
        </svg>
      )}

      {/* Time display (active mode only) */}
      {mode === 'active' && timeDisplay && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: 'fadeIn 300ms ease-out' }}
        >
          <span
            className="text-4xl font-light tabular-nums"
            style={{ color: 'var(--text)', opacity: 0.9 }}
          >
            {timeDisplay}
          </span>
        </div>
      )}

      {/* Completing state - shows time fading */}
      {mode === 'completing' && timeDisplay && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            animation: 'fadeIn 300ms ease-out',
            opacity: 0.6,
          }}
        >
          <span
            className="text-3xl font-light tabular-nums"
            style={{ color: 'var(--text)' }}
          >
            {timeDisplay}
          </span>
        </div>
      )}

      {/* Complete state */}
      {mode === 'complete' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: 'fadeIn 600ms ease-out' }}
        >
          <span
            className="text-2xl font-light"
            style={{ color: 'var(--text)', opacity: 0.85 }}
          >
            Complete
          </span>
        </div>
      )}
    </div>
  );
}

type Particle = {
  angle: number;
  baseRadius: number;
  speedVariation: number;
  sizeBase: number;
  opacityBase: number;
  driftPhase: number;
  driftVariation: number;
  coherenceOffset: number;
};

export default IdleOrb;
