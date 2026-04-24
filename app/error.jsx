'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 text-center bg-slate-50">
      <div className="text-8xl mb-6 select-none" aria-hidden="true">😕</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-slate-500 text-base mb-8 max-w-xs leading-relaxed">
        An unexpected error occurred. You can try again or go back to the home page.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-base px-8 py-4 hover:bg-indigo-700 transition-colors min-h-[56px] shadow-lg"
        >
          Try Again 🔄
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 text-slate-700 font-semibold text-base px-8 py-4 hover:bg-slate-100 transition-colors min-h-[56px]"
        >
          Go Home 🏠
        </a>
      </div>
    </div>
  );
}
