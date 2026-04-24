'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StarRating from '@/components/shared/StarRating.jsx';
import Link from 'next/link';
import { cn } from '@/lib/utils.js';

function formatDate(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function truncate(text, max = 100) {
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function FeedbackPage() {
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [isAdmin,    setIsAdmin]    = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('/api/auth/get-session', { credentials: 'include' })
      .then(r => r.json())
      .then(session => {
        const role = session?.session?.user?.role;
        if (role !== 'admin') { setIsAdmin(false); setLoading(false); return; }
        setIsAdmin(true);
        return fetch('/api/dashboard/survey', { credentials: 'include' })
          .then(r => r.json())
          .then(d => setData(d));
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

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

  const surveys = data?.surveys ?? [];

  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const s of surveys) if (s.rating >= 1 && s.rating <= 5) ratingCounts[s.rating]++;

  const chartData = [5, 4, 3, 2, 1].map(star => ({
    name:  `${star} ★`,
    count: ratingCounts[star],
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Feedback</h1>
        <p className="text-sm text-slate-500 mt-0.5">Survey responses from caregivers and researchers</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-slate-500 font-medium">Total Responses</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{surveys.length}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-slate-500 font-medium">Average Rating</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">
              {data?.averageRating != null ? `${data.averageRating.toFixed(1)} ⭐` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-slate-500 font-medium">With Feedback Text</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {surveys.filter(s => s.feedback).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts rating distribution */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {surveys.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              No responses yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={v => [v, 'Responses']}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Responses table with expandable rows */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">All Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500">Date</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Role</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Rating</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500">Feedback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-400 text-sm py-10">
                    No responses yet
                  </TableCell>
                </TableRow>
              ) : (
                surveys.map(s => {
                  const isExpanded = expandedId === s.id;
                  return (
                    <>
                      <TableRow
                        key={s.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          isExpanded ? 'bg-indigo-50' : 'hover:bg-slate-50'
                        )}
                        onClick={() => setExpandedId(isExpanded ? null : s.id)}
                      >
                        <TableCell className="text-sm text-slate-600 align-top pt-3">
                          {formatDate(s.submitted_at)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 capitalize align-top pt-3">
                          {s.role || '—'}
                        </TableCell>
                        <TableCell className="align-top pt-2.5">
                          {s.rating ? (
                            <StarRating value={s.rating} max={5} />
                          ) : (
                            <span className="text-slate-300 text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 max-w-xs align-top pt-3">
                          {s.feedback
                            ? <span className="text-slate-600">{truncate(s.feedback)}</span>
                            : <span className="text-slate-300 italic text-xs">No comment</span>
                          }
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <TableRow key={`${s.id}-expanded`} className="bg-indigo-50/60">
                          <TableCell colSpan={4} className="py-4 px-6">
                            <div className="space-y-3">
                              {s.feedback && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Full feedback</p>
                                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {s.feedback}
                                  </p>
                                </div>
                              )}
                              {s.game_session_id && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-500 mb-1">Linked session</p>
                                  <Link
                                    href={`/dashboard/sessions/${s.game_session_id}`}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline font-mono"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    {s.game_session_id}
                                  </Link>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
