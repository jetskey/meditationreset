'use client';

/**
 * SESSION SCREEN — Single session
 *
 * FONT: Arimo only
 * MOOD: Deep space with distant cosmic glow
 */

import { useRouter } from 'next/navigation';

export default function SessionPage() {
  const router = useRouter();

  return (
    <div className="page px-8 pb-24 grain">
      <div className="atmosphere" />

      {/* Top anchor */}
      <div className="pt-20 relative z-10">
        <p className="text-meta">Session</p>
      </div>

      {/* Middle — Duration display with generous spacing */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <p
          className="text-number mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          7:00
        </p>

        <p
          className="text-body"
          style={{ color: 'var(--text-secondary)' }}
        >
          Audio-guided meditation
        </p>
      </div>

      {/* Bottom — more breathing room */}
      <div className="pb-8 relative z-10">
        <button
          onClick={() => router.push('/session/run')}
          className="btn-primary w-full"
        >
          Begin
        </button>
      </div>
    </div>
  );
}
