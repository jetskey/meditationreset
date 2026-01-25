'use client';

/**
 * STATS SCREEN — Cosmic atmosphere
 *
 * FONT: Arimo only
 * MOOD: Deep space with distant glow
 */

import { useStats, formatFocusTime } from '@/lib/stats';

export default function StatsPage() {
  const { stats } = useStats();
  const totalTimeDisplay = formatFocusTime(stats.totalFocusSeconds);

  return (
    <div className="page px-8 pb-24 grain">
      <div className="atmosphere" style={{ opacity: 0.6 }} />

      {/* Top anchor */}
      <div className="pt-20 relative z-10">
        <p className="text-meta">Stats</p>
      </div>

      {/* Middle — Primary metric with generous spacing */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        <p
          className="text-number mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          {totalTimeDisplay || '0m'}
        </p>

        <p
          className="text-body mb-20"
          style={{ color: 'var(--text-secondary)' }}
        >
          Total focus time
        </p>

        {/* Secondary metrics — more vertical rhythm */}
        <div className="space-y-10">
          <div>
            <p className="text-meta mb-3">Today</p>
            <p
              className="text-headline"
              style={{ color: 'var(--text-primary)' }}
            >
              {stats.sessionsToday} {stats.sessionsToday === 1 ? 'session' : 'sessions'}
            </p>
          </div>

          <div>
            <p className="text-meta mb-3">Streak</p>
            <p
              className="text-headline"
              style={{ color: 'var(--text-primary)' }}
            >
              {stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>

          <div>
            <p className="text-meta mb-3">Best</p>
            <p
              className="text-headline"
              style={{ color: 'var(--text-primary)' }}
            >
              {stats.longestStreak} {stats.longestStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
