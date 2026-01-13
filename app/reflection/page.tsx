'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReflectionPage() {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);

  const handleContinue = () => {
    router.push('/complete');
  };

  return (
    <main style={styles.container}>
      <span style={styles.label}>Quick check-in</span>
      <h1 style={styles.question}>How do you feel right now?</h1>

      {/* Minimal 1-5 scale */}
      <div style={styles.scale}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => setRating(value)}
            style={{
              ...styles.scaleButton,
              backgroundColor: rating === value ? '#1a1a1a' : 'transparent',
              color: rating === value ? '#fff' : '#666',
            }}
            aria-label={`Rate ${value}`}
          >
            {value}
          </button>
        ))}
      </div>

      {/* Minimal scale labels */}
      <div style={styles.scaleLabels}>
        <span>Low</span>
        <span>High</span>
      </div>

      <button
        style={{
          ...styles.button,
          opacity: rating === null ? 0.4 : 1,
          cursor: rating === null ? 'default' : 'pointer',
        }}
        onClick={handleContinue}
        disabled={rating === null}
      >
        Continue
      </button>
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
  label: {
    fontSize: '0.875rem',
    color: '#999',
    marginBottom: '0.75rem',
  },
  question: {
    fontSize: '1.25rem',
    fontWeight: 500,
    color: '#1a1a1a',
    marginBottom: '2rem',
  },
  scale: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  scaleButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: '1px solid #ddd',
    fontSize: '0.9375rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'none',
  },
  scaleLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '236px', // Match scale width
    fontSize: '0.75rem',
    color: '#999',
    marginBottom: '2.5rem',
  },
  button: {
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: '#1a1a1a',
    border: 'none',
    borderRadius: '6px',
  },
};
