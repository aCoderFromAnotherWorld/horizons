'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch.jsx';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils.js';

const ROLE_STYLES = {
  admin:      'bg-indigo-100 text-indigo-700 border-transparent',
  researcher: 'bg-slate-100 text-slate-600 border-transparent',
};

function formatDate(val) {
  if (!val) return '—';
  const d = typeof val === 'number' ? new Date(val) : new Date(val);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Props:
 *   accounts   — array of account objects
 *   onUpdate   — (id, updates) => void  called after successful PATCH
 *   onCreated  — (account) => void      called after successful POST (optimistic)
 */
export default function AccountsTable({ accounts = [], onUpdate, onCreated }) {
  const [creating,  setCreating]  = useState(false);
  const [form,      setForm]      = useState({ email: '', password: '', role: 'researcher' });
  const [formError, setFormError] = useState('');
  const [saving,    setSaving]    = useState(false);
  const [updating,  setUpdating]  = useState(null);

  async function handleToggleActive(acc) {
    setUpdating(acc.id);
    const newValue = !acc.is_active;
    onUpdate?.(acc.id, { is_active: newValue });
    try {
      const res = await fetch(`/api/dashboard/accounts/${acc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newValue }),
        credentials: 'include',
      });
      if (!res.ok) {
        onUpdate?.(acc.id, { is_active: !newValue });
      }
    } catch {
      onUpdate?.(acc.id, { is_active: !newValue });
    } finally {
      setUpdating(null);
    }
  }

  async function handleToggleRole(acc) {
    setUpdating(acc.id);
    const newRole = acc.role === 'admin' ? 'researcher' : 'admin';
    onUpdate?.(acc.id, { role: newRole });
    try {
      const res = await fetch(`/api/dashboard/accounts/${acc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include',
      });
      if (!res.ok) {
        onUpdate?.(acc.id, { role: acc.role });
      }
    } catch {
      onUpdate?.(acc.id, { role: acc.role });
    } finally {
      setUpdating(null);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    const optimisticId = `pending-${Date.now()}`;
    const optimistic = {
      id:         optimisticId,
      email:      form.email,
      role:       form.role,
      is_active:  true,
      created_at: new Date().toISOString(),
      pending:    true,
    };
    onCreated?.(optimistic);
    setCreating(false);
    setForm({ email: '', password: '', role: 'researcher' });

    try {
      const res  = await fetch('/api/dashboard/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) {
        onCreated?.({ id: optimisticId, _remove: true });
        setFormError(data.error ?? 'Failed to create account');
        setCreating(true);
        return;
      }
      const list = await fetch('/api/dashboard/accounts', { credentials: 'include' }).then(r => r.json());
      if (Array.isArray(list.accounts)) {
        onCreated?.({ id: optimisticId, _replace: list.accounts });
      }
    } catch {
      onCreated?.({ id: optimisticId, _remove: true });
      setFormError('Network error. Please try again.');
      setCreating(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end mb-3">
        <Button size="sm" onClick={() => setCreating(true)}>+ New Account</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="text-xs font-semibold text-slate-500">Email</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500">Role</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500">Created</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500">Active</TableHead>
            <TableHead className="text-xs font-semibold text-slate-500 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400 text-sm py-10">
                No accounts found
              </TableCell>
            </TableRow>
          ) : (
            accounts.map(acc => (
              <TableRow
                key={acc.id}
                className={cn('hover:bg-slate-50 transition-colors', acc.pending && 'opacity-60')}
              >
                <TableCell className="text-sm text-slate-700 font-medium">
                  {acc.email}
                  {acc.pending && <span className="ml-2 text-xs text-slate-400 italic">saving…</span>}
                </TableCell>
                <TableCell>
                  <Badge className={cn('text-xs capitalize', ROLE_STYLES[acc.role] ?? ROLE_STYLES.researcher)}>
                    {acc.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {formatDate(acc.created_at)}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={!!acc.is_active}
                    onCheckedChange={() => handleToggleActive(acc)}
                    disabled={!!acc.pending || updating === acc.id}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <button
                    disabled={!!acc.pending || updating === acc.id}
                    onClick={() => handleToggleRole(acc)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {acc.role === 'admin' ? 'Make Researcher' : 'Make Admin'}
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={creating} onOpenChange={open => { setCreating(open); if (!open) setFormError(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="acc-email">Email</Label>
              <Input
                id="acc-email"
                type="email"
                required
                autoComplete="off"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acc-pw">Password</Label>
              <Input
                id="acc-pw"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setCreating(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create Account'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
