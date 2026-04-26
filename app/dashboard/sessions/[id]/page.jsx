'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import DomainRadarChart from '@/components/dashboard/DomainRadarChart.jsx';
import ResponseTimeChart from '@/components/dashboard/ResponseTimeChart.jsx';
import RedFlagList from '@/components/dashboard/RedFlagList.jsx';
import MouseHeatmap from '@/components/dashboard/MouseHeatmap.jsx';
import { calculateCombinedScore } from '@/lib/scoring/engine.js';
import { cn } from '@/lib/utils.js';

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

const RISK_LABELS = { low: 'Low', medium: 'Medium', high: 'High', very_high: 'Very High' };

function formatDate(ms) {
  if (!ms) return '—';
  return new Date(ms).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatMs(ms) {
  if (!ms) return '—';
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

export default function SessionDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const [data,          setData]          = useState(null);
  const [mouseMovements, setMouseMovements] = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [deleteDialog,   setDeleteDialog]  = useState(false);
  const [deleting,       setDeleting]      = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/dashboard/sessions/${id}`, { credentials: 'include' }).then(r => r.json()),
      fetch(`/api/game/mouse?session=${id}`,  { credentials: 'include' }).then(r => r.json()).catch(() => ({ movements: [] })),
    ])
      .then(([sessionData, mouseData]) => {
        setData(sessionData);
        setMouseMovements(mouseData?.movements ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) router.replace('/dashboard/sessions');
    } finally {
      setDeleting(false);
      setDeleteDialog(false);
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: `horizons-session-${id.slice(0, 8)}.json`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-3 text-slate-400">
        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          ⭐
        </motion.span>
        Loading session…
      </div>
    );
  }

  if (!data?.session) {
    return (
      <div className="p-6 text-slate-500">Session not found.</div>
    );
  }

  const { session, taskResponses = [], chapterScores = [], redFlags = [], domainScores = [] } = data;

  const combinedScore = domainScores.length
    ? (() => {
        const domainRaw = {};
        for (const ds of domainScores) domainRaw[ds.domain] = ds.raw_score;
        const activeRedFlags = redFlags.map(f => f.flag_type).filter(Boolean);
        return calculateCombinedScore(domainRaw, activeRedFlags);
      })()
    : null;

  const domainScoresMapped = domainScores.map(ds => ({
    domain:    ds.domain,
    rawScore:  ds.raw_score,
    maxScore:  ds.max_score,
    riskLevel: ds.risk_level,
  }));

  const redFlagsMapped = redFlags.map(f => ({
    flagType:    f.flag_type,
    description: f.description,
    severity:    f.severity,
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-slate-800">
              {session.player_name || <span className="text-slate-400 italic font-normal">Anonymous</span>}
            </h1>
            <Badge className={cn('text-xs capitalize', STATUS_STYLES[session.status] ?? STATUS_STYLES.abandoned)}>
              {session.status}
            </Badge>
          </div>
          <p className="text-sm text-slate-500">
            Age {session.player_age} &middot; Started {formatDate(session.started_at)}
            {session.completed_at && ` · Completed ${formatDate(session.completed_at)}`}
          </p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{session.id}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}>
            📥 Export JSON
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteDialog(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Combined Score', value: combinedScore != null ? combinedScore.toFixed(1) : '—' },
          { label: 'Tasks Responded', value: taskResponses.length },
          { label: 'Red Flags', value: redFlags.length },
          { label: 'Guide', value: session.guide_choice || '—' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="mouse">Mouse Data</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Domain Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <DomainRadarChart domainScores={domainScoresMapped} />
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Avg Response Time by Chapter</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseTimeChart taskResponses={taskResponses} chapterScores={chapterScores} />
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">Red Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <RedFlagList redFlags={redFlagsMapped} />
            </CardContent>
          </Card>

          {/* Domain risk summary */}
          {domainScoresMapped.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-700">Domain Risk Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {domainScoresMapped.map(ds => (
                    <div key={ds.domain} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-xs text-slate-500 capitalize">{ds.domain.replace(/_/g, ' ')}</p>
                      <p className="text-base font-bold text-slate-800 mt-1">
                        {ds.rawScore != null ? ds.rawScore.toFixed(0) : '—'}
                        <span className="text-xs text-slate-400 font-normal">/{ds.maxScore}</span>
                      </p>
                      {ds.riskLevel && (
                        <Badge className={cn('text-xs mt-1', RISK_STYLES[ds.riskLevel] ?? RISK_STYLES.low)}>
                          {RISK_LABELS[ds.riskLevel]}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tasks tab */}
        <TabsContent value="tasks" className="mt-4">
          <Card className="border-slate-200">
            <CardContent className="pt-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-xs">Ch</TableHead>
                      <TableHead className="text-xs">Lv</TableHead>
                      <TableHead className="text-xs">Task Key</TableHead>
                      <TableHead className="text-xs">Correct</TableHead>
                      <TableHead className="text-xs">Attempts</TableHead>
                      <TableHead className="text-xs">Response Time</TableHead>
                      <TableHead className="text-xs">Score Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taskResponses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-slate-400 text-sm py-8">
                          No task responses recorded
                        </TableCell>
                      </TableRow>
                    ) : (
                      taskResponses.map(r => (
                        <TableRow key={r.id} className="hover:bg-slate-50">
                          <TableCell className="text-sm text-slate-600">{r.chapter}</TableCell>
                          <TableCell className="text-sm text-slate-600">{r.level}</TableCell>
                          <TableCell className="text-xs font-mono text-slate-600 max-w-[180px] truncate">
                            {r.task_key}
                          </TableCell>
                          <TableCell>
                            <span className={r.is_correct ? 'text-emerald-600' : 'text-slate-400'}>
                              {r.is_correct ? '✓' : '✗'}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 tabular-nums">
                            {r.attempt_number}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 tabular-nums">
                            {formatMs(r.response_time_ms)}
                          </TableCell>
                          <TableCell className="text-sm text-slate-600 tabular-nums">
                            {r.score_points}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mouse data tab */}
        <TabsContent value="mouse" className="mt-4">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">
                Pointer Movement Heatmap
                <span className="font-normal text-slate-400 ml-2">({mouseMovements.length} points)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MouseHeatmap movements={mouseMovements} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete confirm */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              This permanently deletes this session and all associated data. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
              {deleting ? 'Deleting…' : 'Delete Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
