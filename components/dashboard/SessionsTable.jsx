'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils.js';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

const STATUS_STYLES = {
  active:    'bg-blue-100 text-blue-700 border-transparent',
  completed: 'bg-emerald-100 text-emerald-700 border-transparent',
  abandoned: 'bg-slate-100 text-slate-600 border-transparent',
};

const RISK_STYLES = {
  low:       'bg-emerald-100 text-emerald-700 border-transparent',
  medium:    'bg-amber-100 text-amber-700 border-transparent',
  high:      'bg-orange-100 text-orange-700 border-transparent',
  very_high: 'bg-red-100 text-red-700 border-transparent',
};

const RISK_LABELS = {
  low: 'Low', medium: 'Medium', high: 'High', very_high: 'Very High',
};

function formatDate(epochMs) {
  if (!epochMs) return '—';
  return new Date(epochMs).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/**
 * Props:
 *   sessions — array of session objects from /api/dashboard/sessions
 *   onDelete — (id) => void   called after successful deletion
 */
export default function SessionsTable({ sessions = [], onDelete }) {
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState('all');
  const [risk,      setRisk]      = useState('all');
  const [page,      setPage]      = useState(1);
  const [deleting,  setDeleting]  = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const filtered = sessions.filter(s => {
    if (status !== 'all' && s.status !== status) return false;
    if (risk   !== 'all' && s.riskLevel !== risk)  return false;
    if (search) {
      const q = search.toLowerCase();
      if (!s.id.toLowerCase().includes(q) && !(s.playerName ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleFilterChange(setter) {
    return (v) => { setter(v); setPage(1); };
  }

  async function confirmDelete() {
    if (!confirmId) return;
    setDeleting(confirmId);
    try {
      const res = await fetch(`/api/dashboard/sessions/${confirmId}`, { method: 'DELETE' });
      if (res.ok) {
        onDelete?.(confirmId);
        toast.success('Session deleted');
      } else {
        toast.error('Failed to delete session');
      }
    } catch {
      toast.error('Failed to delete session');
    } finally {
      setDeleting(null);
      setConfirmId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search name or ID…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-52 h-9 text-sm"
        />

        <Select value={status} onValueChange={handleFilterChange(setStatus)}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="abandoned">Abandoned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={risk} onValueChange={handleFilterChange(setRisk)}>
          <SelectTrigger className="w-36 h-9 text-sm">
            <SelectValue placeholder="All risk levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All risk levels</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="very_high">Very High</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-slate-500 ml-auto">
          {filtered.length} session{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs text-slate-500 font-semibold">Date</TableHead>
              <TableHead className="text-xs text-slate-500 font-semibold">Name</TableHead>
              <TableHead className="text-xs text-slate-500 font-semibold">Age</TableHead>
              <TableHead className="text-xs text-slate-500 font-semibold">Status</TableHead>
              <TableHead className="text-xs text-slate-500 font-semibold">Risk</TableHead>
              <TableHead className="text-xs text-slate-500 font-semibold">Score</TableHead>
              <TableHead className="text-xs text-slate-500 font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-400 text-sm py-10">
                  No sessions match your filters
                </TableCell>
              </TableRow>
            ) : (
              slice.map(s => (
                <TableRow key={s.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="text-sm text-slate-600">
                    {formatDate(s.startedAt)}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-800 max-w-[140px] truncate">
                    {s.playerName || <span className="text-slate-400 italic">Anonymous</span>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{s.playerAge}</TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs capitalize', STATUS_STYLES[s.status] ?? STATUS_STYLES.abandoned)}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {s.riskLevel ? (
                      <Badge className={cn('text-xs', RISK_STYLES[s.riskLevel] ?? RISK_STYLES.low)}>
                        {RISK_LABELS[s.riskLevel] ?? s.riskLevel}
                      </Badge>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 tabular-nums">
                    {s.combinedScore != null ? s.combinedScore.toFixed(1) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/sessions/${s.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => setConfirmId(s.id)}
                        className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!confirmId} onOpenChange={open => !open && setConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              This will permanently delete this session and all associated responses, scores, and
              flag data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!!deleting}
              onClick={confirmDelete}
            >
              {deleting ? 'Deleting…' : 'Delete Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
