'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SessionsTable from '@/components/dashboard/SessionsTable.jsx';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/sessions', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setSessions(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sessions</h1>
        <p className="text-sm text-slate-500 mt-0.5">All screening sessions — filter, search, and export</p>
      </div>

      <div className="flex justify-end">
        <a
          href="/api/dashboard/export?format=csv"
          download
          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          📥 Export CSV
        </a>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-5">
          {loading ? (
            <div className="text-center text-slate-400 py-12">Loading sessions…</div>
          ) : (
            <SessionsTable
              sessions={sessions}
              onDelete={id => setSessions(prev => prev.filter(s => s.id !== id))}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
