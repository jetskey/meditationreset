'use client';

/**
 * LANDING STATE — First-Run Gate
 *
 * Manages the landing page lifecycle:
 * - Tracks whether user has seen the landing page (localStorage)
 * - Provides methods to dismiss and revisit
 * - Handles hydration safely with client-ready guard
 *
 * Key principle: Default to showing landing, only hide if explicitly dismissed.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const STORAGE_KEY = 'idle-has-seen-landing';

interface LandingContextValue {
  isClientReady: boolean;
  showLanding: boolean;
  dismissLanding: () => void;
  revisitLanding: () => void;
}

const LandingContext = createContext<LandingContextValue | null>(null);

export function LandingProvider({ children }: { children: ReactNode }) {
  // Client-ready guard: false until useEffect runs
  const [isClientReady, setIsClientReady] = useState(false);

  // Default to showing landing — only set false if localStorage says seen
  const [showLanding, setShowLanding] = useState(true);

  // Check localStorage on client mount
  useEffect(() => {
    const hasSeenLanding = localStorage.getItem(STORAGE_KEY) === 'true';

    if (hasSeenLanding) {
      setShowLanding(false);
    }
    // else: keep showLanding = true (default)

    setIsClientReady(true);
  }, []);

  // Dismiss landing and persist
  const dismissLanding = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowLanding(false);
  }, []);

  // Revisit landing (temporary, doesn't reset persistence)
  const revisitLanding = useCallback(() => {
    setShowLanding(true);
  }, []);

  return (
    <LandingContext.Provider value={{ isClientReady, showLanding, dismissLanding, revisitLanding }}>
      {children}
    </LandingContext.Provider>
  );
}

export function useLanding(): LandingContextValue {
  const context = useContext(LandingContext);
  if (!context) {
    throw new Error('useLanding must be used within a LandingProvider');
  }
  return context;
}
