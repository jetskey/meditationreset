/**
 * ROOT LAYOUT
 *
 * Typography: Arimo
 * MOOD: Deep space, cosmic atmosphere, distant warmth
 */

import type { Metadata, Viewport } from 'next';
import { Arimo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { TabBar } from '@/components/TabBar';
import { Providers } from '@/components/Providers';
import { CosmicBackground } from '@/components/CosmicBackground';

const arimo = Arimo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arimo',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-ibm-plex-mono',
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
  themeColor: '#060608',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${arimo.variable} ${ibmPlexMono.variable}`}>
      <body>
        <CosmicBackground />

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
