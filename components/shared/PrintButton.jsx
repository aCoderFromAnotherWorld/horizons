'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-8 py-3 text-base transition-colors shadow-md"
    >
      🖨️ Print Report
    </button>
  );
}
