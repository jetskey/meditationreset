'use client';

import { useRouter } from 'next/navigation';

/**
 * SESSION PICKER
 *
 * Text roles:
 * - body: session name (font-light, not medium - restraint)
 * - label: session type description
 *
 * Interaction: secondary button style
 */

const sessions = [
  { id: 'prime', title: 'Prime', subtitle: 'Morning reset' },
  { id: 'decompress', title: 'Decompress', subtitle: 'Evening reset' },
];

export function SessionPicker() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3 w-full">
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => router.push(`/session/run?mode=${session.id}`)}
          className="session-card w-full text-left p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              {/* body: session name */}
              <p
                className="text-base font-light"
                style={{ color: 'var(--text)', opacity: 0.85 }}
              >
                {session.title}
              </p>
              {/* label: session type */}
              <p
                className="text-[10px] uppercase tracking-[0.15em] mt-1"
                style={{ color: 'var(--muted)', opacity: 0.5 }}
              >
                {session.subtitle}
              </p>
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: 'var(--muted)', opacity: 0.35 }}
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      ))}
    </div>
  );
}
