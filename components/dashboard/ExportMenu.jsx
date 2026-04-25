'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, FileText, ChevronDown, Printer } from 'lucide-react';

export default function ExportMenu({ baseUrl = '/api/dashboard/export' }) {
  const [open, setOpen]       = useState(false);
  const [printing, setPrinting] = useState(false);
  const menuRef               = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handlePrintPDF() {
    setOpen(false);
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 120);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(v => !v)}
        disabled={printing}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors border"
        style={{
          background: '#fff',
          borderColor: '#E2E8F0',
          color: '#334155',
        }}
      >
        <Download size={15} />
        {printing ? 'Preparing…' : 'Export'}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden z-20"
          style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          }}
        >
          <div className="px-3 py-2" style={{ borderBottom: '1px solid #F1F5F9' }}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Export options</p>
          </div>

          <a
            href={`${baseUrl}?format=csv`}
            download
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText size={15} className="text-emerald-600 shrink-0" />
            <div>
              <div>Download CSV</div>
              <div className="text-xs text-slate-400 font-normal">All sessions + domain scores</div>
            </div>
          </a>

          <a
            href={`${baseUrl}?format=json`}
            download
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <FileText size={15} className="text-blue-500 shrink-0" />
            <div>
              <div>Download JSON</div>
              <div className="text-xs text-slate-400 font-normal">Full raw data</div>
            </div>
          </a>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors text-left"
            style={{ borderTop: '1px solid #F1F5F9' }}
          >
            <Printer size={15} className="text-indigo-500 shrink-0" />
            <div>
              <div>Print / Save PDF</div>
              <div className="text-xs text-slate-400 font-normal">Use browser print dialog</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
