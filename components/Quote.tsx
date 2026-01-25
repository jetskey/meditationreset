'use client';

import { useState, useEffect } from 'react';

/**
 * QUOTE — Client-Side Random Selection
 *
 * Fixes hydration mismatch by:
 * 1. Server renders empty string (deterministic)
 * 2. Client initial render matches server (empty)
 * 3. useEffect picks random quote after mount
 * 4. Quote fades in via CSS transition
 *
 * This ensures SSR and CSR produce identical initial HTML.
 */

type QuoteProps = {
  quotes: string[];
  className?: string;
  style?: React.CSSProperties;
};

export function Quote({ quotes, className = '', style }: QuoteProps) {
  // Start empty — matches server render
  const [quote, setQuote] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pick random quote only on client, after mount
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);

    // Trigger fade-in on next frame
    requestAnimationFrame(() => {
      setVisible(true);
    });
  }, [quotes]);

  return (
    <p
      className={`quote-text ${className}`}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.98)',
        transition: 'opacity 800ms cubic-bezier(0.4, 0, 0.6, 1), transform 800ms cubic-bezier(0.4, 0, 0.6, 1)',
      }}
    >
      {quote}
    </p>
  );
}
