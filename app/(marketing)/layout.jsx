'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/survey', label: 'Survey' },
];

export default function MarketingLayout({ children }) {
  return (
    <div className="flex flex-col min-h-dvh">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-xl text-gray-900 hover:text-indigo-600 transition-colors select-none"
        >
          <span>🧠</span>
          <span>Horizons</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              {label}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-xl font-semibold">
            <Link href="/game/start">Start Assessment →</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center gap-2 text-xl font-extrabold">
                  <span>🧠</span>
                  <span>Horizons</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-base font-medium text-slate-800 hover:text-indigo-600 transition-colors py-1"
                  >
                    {label}
                  </Link>
                ))}
                <div className="pt-2">
                  <Button asChild className="w-full rounded-xl font-semibold">
                    <Link href="/game/start">Start Assessment →</Link>
                  </Button>
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
    <footer className="border-t border-slate-200 bg-slate-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 font-extrabold text-lg text-gray-900 mb-1">
              <span>🧠</span>
              <span>Horizons</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Play-based ASD screening for children aged 3–10
            </p>
          </div>
          <div className="flex gap-8 text-sm">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-slate-500 hover:text-slate-900 transition-colors font-medium"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 space-y-2 text-center">
          <p className="text-xs text-slate-400">© 2025 Horizons. All rights reserved.</p>
          <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
            ⚠️ <strong>Important:</strong> Horizons is a screening tool, not a clinical diagnosis. All results
            should be reviewed with a qualified healthcare professional. This tool does not replace a
            comprehensive evaluation by a licensed clinician.
          </p>
        </div>
      </div>
    </footer>
  );
}
