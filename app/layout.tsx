/**
 * ROOT LAYOUT
 * - Arimo font only
 * - Dark planetary theme
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { TabBar } from '@/components/TabBar';
import { Providers } from '@/components/Providers';
import WelcomeAudioOverlay from '@/components/WelcomeAudioOverlay';

export const metadata: Metadata = {
  title: 'Idle - Daily Reset',
  description: 'A minimalist app for mental clarity',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Idle',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F0E0D',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Solid background */}
        <div id="app-background" />

        <WelcomeAudioOverlay />

        <Providers>
          <main className="app-shell">
            {children}
          </main>
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}
