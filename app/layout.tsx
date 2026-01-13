import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MindReset - Daily Focus Sessions',
  description: 'A psychology-based meditation app for daily mental clarity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
