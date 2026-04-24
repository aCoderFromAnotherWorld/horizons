'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import AccountsTable from '@/components/dashboard/AccountsTable.jsx';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [isAdmin,  setIsAdmin]  = useState(null);

  useEffect(() => {
    fetch('/api/auth/get-session', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        const role = data?.session?.user?.role;
        if (role !== 'admin') { setIsAdmin(false); setLoading(false); return; }
        setIsAdmin(true);
        return fetch('/api/dashboard/accounts', { credentials: 'include' })
          .then(r => r.json())
          .then(d => { if (Array.isArray(d.accounts)) setAccounts(d.accounts); });
      })
      .catch(() => { setIsAdmin(false); })
      .finally(() => setLoading(false));
  }, []);

  function handleUpdate(id, patch) {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  }

  function handleCreated(signal) {
    if (signal._remove) {
      setAccounts(prev => prev.filter(a => a.id !== signal.id));
    } else if (signal._replace) {
      setAccounts(signal._replace);
    } else {
      setAccounts(prev => [signal, ...prev]);
    }
  }

  if (loading) {
    return <div className="p-6 text-slate-400 text-sm">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-64 gap-3 text-center">
        <span className="text-4xl">🔒</span>
        <p className="text-slate-600 font-semibold">Access denied</p>
        <p className="text-sm text-slate-400">This page is only available to administrators.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Accounts</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage researcher and admin accounts</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="pt-4">
          <AccountsTable
            accounts={accounts}
            onUpdate={handleUpdate}
            onCreated={handleCreated}
          />
        </CardContent>
      </Card>
    </div>
  );
}
