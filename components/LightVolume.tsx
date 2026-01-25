'use client';

/**
 * LIGHT VOLUME — Abby-style abstract visual element
 *
 * Replaces: Orbital rings, particles
 * Style: Soft gradient blob, warm amber, static or very slow drift
 * Like Abby's abstract gradient object
 */

type LightVolumeProps = {
  size?: number;
  intensity?: number;
};

export function LightVolume({ size = 280, intensity = 1 }: LightVolumeProps) {
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Outer glow field */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(
            circle at 50% 45%,
            rgba(180, 155, 120, ${0.12 * intensity}) 0%,
            rgba(160, 140, 110, ${0.06 * intensity}) 35%,
            rgba(140, 125, 100, ${0.02 * intensity}) 60%,
            transparent 80%
          )`,
          filter: 'blur(20px)',
        }}
      />

      {/* Inner warm core */}
      <div
        className="absolute rounded-full"
        style={{
          top: '35%',
          left: '35%',
          width: '30%',
          height: '30%',
          background: `radial-gradient(
            circle at 50% 50%,
            rgba(220, 200, 170, ${0.25 * intensity}) 0%,
            rgba(190, 170, 140, ${0.12 * intensity}) 50%,
            transparent 100%
          )`,
          filter: 'blur(15px)',
        }}
      />

      {/* Subtle accent highlight */}
      <div
        className="absolute rounded-full"
        style={{
          top: '28%',
          left: '40%',
          width: '20%',
          height: '20%',
          background: `radial-gradient(
            circle at 50% 50%,
            rgba(255, 245, 230, ${0.08 * intensity}) 0%,
            transparent 70%
          )`,
          filter: 'blur(10px)',
        }}
      />
    </div>
  );
}

export default LightVolume;
