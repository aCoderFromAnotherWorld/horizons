'use client';

import { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SessionsTable from '@/components/dashboard/SessionsTable.jsx';
import DomainRadarChart from '@/components/dashboard/DomainRadarChart.jsx';

const RISK_COLORS = {
  low:       '#10b981',
  medium:    '#f59e0b',
  high:      '#f97316',
  very_high: '#ef4444',
};

const RISK_LABELS = {
  low: 'Low', medium: 'Medium', high: 'High', very_high: 'Very High',
};

export default function OverviewPage() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/sessions', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id) {
    setSessions(prev => prev.filter(s => s.id !== id));
  }

  // Computed stats
  const total     = sessions.length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const compRate  = total > 0 ? Math.round((completed / total) * 100) : 0;
  const validScored = sessions.filter(s => s.status === 'completed' && s.combinedScore != null);
  const avgScore    = validScored.length > 0
    ? (validScored.reduce((acc, x) => acc + x.combinedScore, 0) / validScored.length).toFixed(1)
    : '—';

  // Risk distribution for pie chart
  const riskCounts = { low: 0, medium: 0, high: 0, very_high: 0 };
  for (const s of sessions) {
    if (s.riskLevel && riskCounts[s.riskLevel] !== undefined) riskCounts[s.riskLevel]++;
  }
  const pieData = Object.entries(riskCounts)
    .filter(([, count]) => count > 0)
    .map(([level, count]) => ({ name: RISK_LABELS[level], value: count, level }));

  // Average domain scores across all completed sessions for radar
  const domainTotals = {};
  const domainCounts = {};
  for (const s of sessions.filter(s => s.status === 'completed')) {
    for (const ds of (s.domainScores ?? [])) {
      domainTotals[ds.domain] = (domainTotals[ds.domain] ?? 0) + ds.rawScore;
      domainCounts[ds.domain] = (domainCounts[ds.domain] ?? 0) + 1;
    }
  }
  const avgDomainScores = Object.keys(domainTotals).map(domain => ({
    domain,
    rawScore: domainTotals[domain] / domainCounts[domain],
    maxScore: { social_communication: 100, restricted_repetitive: 70, pretend_play: 40, sensory_processing: 30 }[domain] ?? 100,
  }));

  const STAT_CARDS = [
    { label: 'Total Sessions',    value: loading ? '…' : total,     icon: '📋', color: 'text-indigo-600' },
    { label: 'Completed',         value: loading ? '…' : completed,  icon: '✅', color: 'text-emerald-600' },
    { label: 'Completion Rate',   value: loading ? '…' : `${compRate}%`, icon: '📈', color: 'text-blue-600' },
    { label: 'Avg Combined Score',value: loading ? '…' : avgScore,   icon: '🎯', color: 'text-amber-600' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform-wide session statistics and screening data</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <Card key={card.label} className="border-slate-200">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-700">
              Average Domain Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DomainRadarChart domainScores={avgDomainScores} />
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-slate-700">
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={RISK_COLORS[entry.level]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [v, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span style={{ fontSize: 12, color: '#64748b' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessions table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-700">All Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <SessionsTable sessions={sessions} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </div>
  );
}
