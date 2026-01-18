'use client';

import { ReactNode } from 'react';
import { StatsProvider } from '@/lib/stats';
import { LandingProvider } from '@/lib/landing';

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Client-side providers.
 *
 * NO global overlays or session components here.
 * Session UI lives ONLY on /session routes.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <StatsProvider>
      <LandingProvider>
        {children}
      </LandingProvider>
    </StatsProvider>
  );
}
