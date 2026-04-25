'use client';

import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils.js';

const STATUS_STYLES = {
  new:      'bg-blue-100 text-blue-700 border-transparent',
  read:     'bg-slate-100 text-slate-500 border-transparent',
  archived: 'bg-slate-50 text-slate-400 border-transparent',
};

const STATUS_DOT = {
  new:      'bg-blue-500',
  read:     'bg-slate-300',
  archived: 'bg-slate-200',
};

const TABS = ['all', 'new', 'read', 'archived'];

function formatDate(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function MessageDetail({ item, updating, onSetStatus }) {
  if (!item) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        Select a message to read
      </div>
    );
  }

  const mailBody = `\n\n---\nOriginal message from ${item.name || item.email}:\n${item.message}`.slice(0, 500);
  const mailtoHref = [
    `mailto:${encodeURIComponent(item.email)}`,
    `?subject=${encodeURIComponent('Re: Horizons Contact')}`,
    `&body=${encodeURIComponent(mailBody)}`,
  ].join('');

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap p-5 border-b border-slate-100">
        <div>
          <p className="text-base font-bold text-slate-800">{item.name || 'Anonymous'}</p>
          <p className="text-sm text-slate-500">{item.email}</p>
          {item.role && (
            <p className="text-xs text-slate-400 mt-0.5 capitalize">Role: {item.role}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">{formatDate(item.submitted_at)}</p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={updating === item.id || item.status === 'read'}
            onClick={() => onSetStatus(item.id, 'read')}
          >
            Mark Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={updating === item.id || item.status === 'archived'}
            onClick={() => onSetStatus(item.id, 'archived')}
          >
            Archive
          </Button>
          <a
            href={mailtoHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Reply
          </a>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {item.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [isAdmin,     setIsAdmin]     = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [updating,    setUpdating]    = useState(null);
  const [activeTab,   setActiveTab]   = useState('all');
  const [sheetOpen,   setSheetOpen]   = useState(false);

  useEffect(() => {
    fetch('/api/auth/get-session', { credentials: 'include' })
      .then(r => r.json())
      .then(session => {
        const role = session?.user?.role;
        if (role !== 'admin') { setIsAdmin(false); setLoading(false); return; }
        setIsAdmin(true);
        return fetch('/api/dashboard/contact', { credentials: 'include' })
          .then(r => r.json())
          .then(data => { if (Array.isArray(data)) setItems(data); });
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

  async function setStatus(id, status) {
    setUpdating(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }));
    try {
      const res = await fetch(`/api/dashboard/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (!res.ok) {
        const prev = items.find(i => i.id === id)?.status;
        if (prev) setItems(p => p.map(i => i.id === id ? { ...i, status: prev } : i));
      }
    } finally {
      setUpdating(null);
    }
  }

  async function selectItem(item) {
    setSelected(item);
    setSheetOpen(true);
    if (item.status === 'new') {
      await setStatus(item.id, 'read');
    }
  }

  const newCount = useMemo(() => items.filter(i => i.status === 'new').length, [items]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return items;
    return items.filter(i => i.status === activeTab);
  }, [items, activeTab]);

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

  const messageList = (
    <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 p-3">
          {activeTab === 'all' ? 'No messages yet' : `No ${activeTab} messages`}
        </p>
      ) : (
        filtered.map(item => (
          <button
            key={item.id}
            onClick={() => selectItem(item)}
            className={cn(
              'w-full text-left px-4 py-3 rounded-xl border transition-colors',
              selected?.id === item.id
                ? 'bg-indigo-50 border-indigo-200'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            )}
          >
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn('w-2 h-2 rounded-full shrink-0', STATUS_DOT[item.status] ?? STATUS_DOT.new)} />
              <span className="text-sm font-medium text-slate-800 truncate flex-1">
                {item.name || item.email}
              </span>
              <span className="text-xs text-slate-400 shrink-0">
                {new Date(item.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate pl-4">
              {item.message?.slice(0, 60)}{item.message?.length > 60 ? '…' : ''}
            </p>
            <div className="pl-4 mt-1">
              <Badge className={cn('text-xs', STATUS_STYLES[item.status] ?? STATUS_STYLES.new)}>
                {item.status}
              </Badge>
            </div>
          </button>
        ))
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Inbox</h1>
        <p className="text-sm text-slate-500 mt-0.5">Contact form submissions from the public platform</p>
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSelected(null); }}>
        <TabsList className="bg-slate-100">
          {TABS.map(tab => (
            <TabsTrigger key={tab} value={tab} className="capitalize text-sm relative">
              {tab}
              {tab === 'new' && newCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-blue-500 text-white text-xs font-bold leading-none">
                  {newCount}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Desktop two-pane layout */}
      <div className="hidden md:flex gap-4 h-[600px]">
        {/* Message list — 1/3 */}
        <div className="w-80 shrink-0 flex flex-col">
          {messageList}
        </div>

        {/* Detail panel — 2/3 */}
        <Card className="flex-1 min-w-0 border-slate-200 overflow-hidden">
          <CardContent className="p-0 h-full">
            <MessageDetail
              item={selected}
              updating={updating}
              onSetStatus={setStatus}
            />
          </CardContent>
        </Card>
      </div>

      {/* Mobile: list only + Sheet on tap */}
      <div className="md:hidden flex flex-col gap-2">
        {messageList}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] p-0 flex flex-col md:hidden">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <SheetTitle className="text-base font-bold text-slate-800 text-left">
              {selected?.name || selected?.email || 'Message'}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <MessageDetail
              item={selected}
              updating={updating}
              onSetStatus={setStatus}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
