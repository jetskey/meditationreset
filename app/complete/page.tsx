'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CompletePage() {
  // Capture timestamp on mount to avoid hydration mismatch
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    setTimestamp(
      now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }) +
        ' at ' +
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
    );
  }, []);

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>Session complete.</h1>

      {timestamp && <span style={styles.timestamp}>{timestamp}</span>}

      <Link href="/session" style={styles.link}>
        Start another session
      </Link>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: '#fafafa',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: '#1a1a1a',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '2rem',
  },
  timestamp: {
    fontSize: '0.8125rem',
    color: '#999',
    marginBottom: '2rem',
  },
  link: {
    fontSize: '0.9375rem',
    color: '#666',
    textDecoration: 'none',
  },
};
