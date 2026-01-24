/**
 * ROOT LAYOUT
 * - Arimo font only
 * - Light theme (#E6E3DE)
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
    statusBarStyle: 'default',
    title: 'Idle',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E6E3DE',
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
