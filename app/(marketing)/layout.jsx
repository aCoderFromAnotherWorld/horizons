'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const NAV_LINKS = [
  { href: '/about',   label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/survey',  label: 'Survey' },
];

export default function MarketingLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh bg-[#FAFAF8]">
      <NavBar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}

function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'rgba(250,250,248,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E7E5E4',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl select-none"
          style={{ color: '#0F172A' }}
        >
          <span className="text-2xl leading-none">🧠</span>
          <span>Horizons</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium transition-colors"
              style={{ color: '#57534E' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0F172A')}
              onMouseLeave={e => (e.currentTarget.style.color = '#57534E')}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/game/start"
            className="inline-flex items-center justify-center rounded-xl font-semibold text-sm px-5 py-2.5 text-white transition-opacity hover:opacity-90"
            style={{ background: '#2f4abf' }}
          >
            Start Assessment →
          </Link>
        </div>

        {/* Mobile Start pill — always visible */}
        <div className="sm:hidden flex items-center gap-2">
          <Link
            href="/game/start"
            className="inline-flex items-center justify-center rounded-xl font-semibold text-sm px-4 py-2 text-white"
            style={{ background: '#2f4abf' }}
          >
            Start →
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" style={{ color: '#44403C' }} />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#FAFAF8]">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2 text-xl font-extrabold" style={{ color: '#0F172A' }}>
                  <span>🧠</span>
                  <span>Horizons</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-base font-medium py-3 px-2 rounded-lg transition-colors"
                    style={{ color: '#1C1917' }}
                  >
                    {label}
                  </Link>
                ))}
                <div className="pt-4">
                  <Link
                    href="/game/start"
                    className="flex items-center justify-center rounded-xl font-semibold text-base py-3 text-white"
                    style={{ background: '#2f4abf' }}
                  >
                    Start Assessment →
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ background: '#F5F3F0', borderTop: '1px solid #D6D3D1' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-extrabold text-lg mb-2" style={{ color: '#0F172A' }}>
              <span>🧠</span>
              <span>Horizons</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#78716C' }}>
              Play-based ASD screening for children aged 3–10. A research-backed tool — not a clinical diagnosis.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-medium transition-colors"
                  style={{ color: '#57534E' }}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/login" className="font-medium" style={{ color: '#57534E' }}>
                Researcher Login
              </Link>
              <Link href="/game/start" className="font-medium" style={{ color: '#2f4abf' }}>
                Start Assessment
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 space-y-2" style={{ borderTop: '1px solid #D6D3D1' }}>
          <p className="text-xs" style={{ color: '#A8A29E' }}>
            © {new Date().getFullYear()} Horizons. All rights reserved.
          </p>
          <p className="text-xs leading-relaxed max-w-2xl" style={{ color: '#78716C' }}>
            <strong style={{ color: '#44403C' }}>⚠️ Important:</strong> Horizons is a screening tool,
            not a clinical diagnosis. All results should be reviewed with a qualified healthcare
            professional. This tool does not replace a comprehensive evaluation by a licensed clinician.
          </p>
        </div>
      </div>
    </footer>
  );
}
