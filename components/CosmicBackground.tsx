'use client';

/**
 * COSMIC BACKGROUND — Deep space with minimal stars
 *
 * Infinite, silent, restrained.
 * No planets. No decoration.
 */

import { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  opacity: number;
};

function createRandom(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function generateStars(width: number, height: number): Star[] {
  const random = createRandom(42);
  const stars: Star[] = [];
  const count = 6 + Math.floor(random() * 5); // 6-10
  const centerX = width / 2;
  const centerY = height / 2;
  const exclusionRadius = Math.min(width, height) * 0.25;

  let attempts = 0;
  while (stars.length < count && attempts < 50) {
    const x = random() * width;
    const y = random() * height;
    const dx = x - centerX;
    const dy = y - centerY;

    // Avoid center of screen
    if (Math.sqrt(dx * dx + dy * dy) > exclusionRadius) {
      stars.push({
        x,
        y,
        opacity: 0.06 + random() * 0.04, // 6-10%
      });
    }
    attempts++;
  }

  return stars;
}

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const initializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    if (!initializedRef.current) {
      starsRef.current = generateStars(width, height);
      initializedRef.current = true;
    }

    // Pure black base
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Subtle radial vignette
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.7
    );
    vignette.addColorStop(0, '#050509');
    vignette.addColorStop(1, '#000000');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Minimal stars — barely noticeable
    ctx.fillStyle = '#FFFFFF';
    for (const star of starsRef.current) {
      ctx.globalAlpha = star.opacity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}

export default CosmicBackground;
