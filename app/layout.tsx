/**
 * ROOT LAYOUT
 * - Global nature background with blur
 * - Inter font only
 */

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TabBar } from '@/components/TabBar';
import { Providers } from '@/components/Providers';
import WelcomeAudioOverlay from '@/components/WelcomeAudioOverlay';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

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
  themeColor: '#0a0c0a',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Global grass background - all pages share this environment */}
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
