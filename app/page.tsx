import Link from 'next/link';

export default function Home() {
  return (
    <main style={styles.container}>
      <h1 style={styles.title}>MindReset</h1>
      <p style={styles.description}>
        A daily exercise for mental clarity.
      </p>
      <Link href="/session" style={styles.button}>
        Start session
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
    fontSize: '1.5rem',
    fontWeight: 500,
    color: '#1a1a1a',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01em',
  },
  description: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '2rem',
  },
  button: {
    display: 'inline-block',
    padding: '0.875rem 2rem',
    fontSize: '1rem',
    fontWeight: 500,
    color: '#fff',
    backgroundColor: '#1a1a1a',
    borderRadius: '6px',
    textDecoration: 'none',
  },
};
