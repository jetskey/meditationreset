'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f1411',
        color: '#e6e6e6',
        fontFamily: 'system-ui',
        textAlign: 'center',
      }}
    >
      <div>
        <p style={{ opacity: 0.7, marginBottom: 12 }}>
          Something went wrong.
        </p>
        <button
          onClick={reset}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '10px 18px',
            borderRadius: 999,
            color: '#e6e6e6',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    </div>
  )
}
