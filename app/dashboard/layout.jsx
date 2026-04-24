'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Database,
  BarChart2,
  Users,
  Inbox,
  MessageSquare,
  LogOut,
  Menu,
  Brain,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { fadeSlide } from '@/lib/visual/animations.js';

const NAV_ITEMS = [
  { href: '/dashboard',           label: 'Overview',  Icon: LayoutDashboard, exact: true },
  { href: '/dashboard/sessions',  label: 'Sessions',  Icon: Database },
  { href: '/dashboard/analytics', label: 'Analytics', Icon: BarChart2 },
  { href: '/dashboard/accounts',  label: 'Accounts',  Icon: Users,          adminOnly: true },
  { href: '/dashboard/inbox',     label: 'Inbox',     Icon: Inbox,          adminOnly: true },
  { href: '/dashboard/feedback',  label: 'Feedback',  Icon: MessageSquare,  adminOnly: true },
];

function NavLink({ item, active, onClick }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={[
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors select-none',
        active
          ? 'text-indigo-700'
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
      ].join(' ')}
    >
      {active && (
        <motion.span
          layoutId="nav-active-pill"
          className="absolute inset-0 rounded-xl bg-indigo-50"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
      <item.Icon size={18} className="relative z-10 shrink-0" />
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
}

function SidebarContent({ user, pathname, onNav, onSignOut }) {
  function isActive(item) {
    return item.exact ? pathname === item.href : pathname.startsWith(item.href);
  }

  const visible = NAV_ITEMS.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <Brain size={22} className="text-indigo-600" />
          <span className="font-extrabold text-slate-800 text-lg">Horizons</span>
        </div>
        {user && (
          <p className="text-xs text-slate-400 mt-1 truncate">{user.email}</p>
        )}
        {user?.role === 'admin' && (
          <span className="inline-block mt-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            Admin
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visible.map(item => (
          <NavLink
            key={item.href}
            item={item}
            active={isActive(item)}
            onClick={onNav}
          />
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-100 shrink-0">
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser]         = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [ready, setReady]       = useState(false);

  useEffect(() => {
    fetch('/api/auth/get-session', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data?.session?.user) {
          router.replace('/dashboard/login');
        } else {
          setUser(data.session.user);
          setReady(true);
        }
      })
      .catch(() => router.replace('/dashboard/login'));
  }, []);

  async function handleSignOut() {
    await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'include' }).catch(() => {});
    router.replace('/dashboard/login');
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Brain size={28} className="text-indigo-500" />
          </motion.div>
          <span className="text-sm font-medium">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const sidebarProps = {
    user,
    pathname,
    onNav:     () => setSheetOpen(false),
    onSignOut: handleSignOut,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-200 sticky top-0 h-screen">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SidebarContent {...sidebarProps} />
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-1.5">
            <Brain size={18} className="text-indigo-600" />
            <span className="font-bold text-slate-800">Horizons</span>
          </div>
        </header>

        {/* Page area with fade transition */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={fadeSlide.initial}
              animate={fadeSlide.animate}
              exit={fadeSlide.exit}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
