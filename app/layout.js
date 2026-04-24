import { Nunito } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Horizons — Play-Based ASD Screening',
  description:
    'Research-based behavioral screening tool for children aged 3–10. Engaging emoji games analyze social communication, repetitive behaviors, pretend play, and sensory processing.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
