'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

/**
 * STATS — Persistent Session Statistics
 *
 * Tracks:
 * - totalFocusSeconds: Total time focused across all sessions
 * - sessionsToday: Number of valid sessions completed today
 * - currentStreak: Consecutive days with at least one valid session
 *
 * Rules:
 * - Session must be >= 60 seconds to count
 * - Streak increments once per day on first valid session
 * - Data persists in localStorage
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

type StatsData = {
  totalFocusSeconds: number;
  currentStreak: number;
  lastSessionDate: string | null; // ISO date string (YYYY-MM-DD)
  sessionsToday: number;
  todayDate: string | null; // Track which day "sessionsToday" refers to
};

type StatsContextValue = {
  stats: StatsData;
  recordSession: (seconds: number) => void;
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'idle-stats';
const MIN_SESSION_SECONDS = 60; // Sessions under 60s don't count

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayISO(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

function loadStats(): StatsData {
  if (typeof window === 'undefined') {
    return getDefaultStats();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StatsData;
      // Reset sessionsToday if it's a new day
      const today = getTodayISO();
      if (parsed.todayDate !== today) {
        parsed.sessionsToday = 0;
        parsed.todayDate = today;
      }
      return parsed;
    }
  } catch {
    // Ignore parse errors
  }

  return getDefaultStats();
}

function saveStats(stats: StatsData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage errors
  }
}

function getDefaultStats(): StatsData {
  return {
    totalFocusSeconds: 0,
    currentStreak: 0,
    lastSessionDate: null,
    sessionsToday: 0,
    todayDate: getTodayISO(),
  };
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════

const StatsContext = createContext<StatsContextValue | null>(null);

export function useStats(): StatsContextValue {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within StatsProvider');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsData>(getDefaultStats);
  const [loaded, setLoaded] = useState(false);

  // Load stats from localStorage on mount
  useEffect(() => {
    const stored = loadStats();
    setStats(stored);
    setLoaded(true);
  }, []);

  // Save stats whenever they change (after initial load)
  useEffect(() => {
    if (loaded) {
      saveStats(stats);
    }
  }, [stats, loaded]);

  /**
   * Record a completed session.
   * Only counts if >= 60 seconds.
   */
  const recordSession = useCallback((seconds: number) => {
    // Ignore sessions under minimum threshold
    if (seconds < MIN_SESSION_SECONDS) {
      return;
    }

    setStats((prev) => {
      const today = getTodayISO();
      const yesterday = getYesterdayISO();

      // Calculate new streak
      let newStreak = prev.currentStreak;
      const isFirstSessionToday = prev.todayDate !== today || prev.sessionsToday === 0;

      if (isFirstSessionToday) {
        // First valid session of the day
        if (prev.lastSessionDate === yesterday) {
          // Consecutive day — increment streak
          newStreak = prev.currentStreak + 1;
        } else if (prev.lastSessionDate === today) {
          // Already had a session today — keep streak
          newStreak = prev.currentStreak;
        } else {
          // Streak broken — start at 1
          newStreak = 1;
        }
      }

      // Calculate sessions today
      const newSessionsToday = prev.todayDate === today
        ? prev.sessionsToday + 1
        : 1;

      return {
        totalFocusSeconds: prev.totalFocusSeconds + seconds,
        currentStreak: newStreak,
        lastSessionDate: today,
        sessionsToday: newSessionsToday,
        todayDate: today,
      };
    });
  }, []);

  const value: StatsContextValue = {
    stats,
    recordSession,
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// UTILITY: Format seconds as display string
// ═══════════════════════════════════════════════════════════════

export function formatFocusTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}m`;
}
