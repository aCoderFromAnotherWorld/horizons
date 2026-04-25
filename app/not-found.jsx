'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center bg-slate-50">
      <div className="text-8xl mb-6 select-none" aria-hidden="true">🗺️</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Page not found</h1>
      <p className="text-slate-500 text-base mb-8 max-w-xs leading-relaxed">
        Looks like this page wandered off on its own adventure. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-200 text-slate-700 font-bold text-base px-8 py-4 hover:bg-slate-300 transition-colors min-h-[56px]"
        >
          ← Go Back
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-base px-8 py-4 hover:bg-indigo-700 transition-colors min-h-[56px] shadow-lg"
        >
          Go Home 🏠
        </Link>
      </div>
    </div>
  );
}
