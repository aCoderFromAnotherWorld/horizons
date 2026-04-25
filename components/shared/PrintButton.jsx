'use client';

import { useState } from 'react';

export default function PrintButton({ label = 'Save as PDF', className = '' }) {
  const [printing, setPrinting] = useState(false);

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 80);
  }

  return (
    <button
      onClick={handlePrint}
      disabled={printing}
      className={`no-print inline-flex items-center gap-2 font-semibold rounded-xl px-5 py-2.5 text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 ${className}`}
      style={{
        background: '#2f4abf',
        color: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(47,74,191,0.28)',
      }}
    >
      {printing ? '⏳ Preparing…' : `📄 ${label}`}
    </button>
  );
}
