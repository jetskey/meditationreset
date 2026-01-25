'use client';

/**
 * GLASS CARD — Orbital UI material
 *
 * Floating glass cards that hover over planetary imagery.
 * Based on reference: translucent, blurred, subtle border.
 */

import { ReactNode, CSSProperties } from 'react';

type GlassCardProps = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function GlassCard({ children, style, className }: GlassCardProps) {
  return (
    <div
      className={className}
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.10)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default GlassCard;
