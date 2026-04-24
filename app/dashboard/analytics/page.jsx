'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const RISK_COLORS = { low: '#10b981', medium: '#f59e0b', high: '#f97316', very_high: '#ef4444' };
const STATUS_COLORS = { completed: '#6366f1', abandoned: '#94a3b8', active: '#3b82f6' };
const BAR_COLOR = '#6366f1';

function buildDailySessionData(sessions, days = 30) {
  const counts = {};
  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * 86400000);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    counts[key] = 0;
  }
  for (const s of sessions) {
    const d = new Date(s.startedAt);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    if (key in counts) counts[key]++;
  }
  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState([]);
  const [surveys,  setSurveys]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/dashboard/sessions', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/dashboard/survey',   { credentials: 'include' }).then(r => r.json()),
    ]).then(([sessRes, survRes]) => {
      if (sessRes.status === 'fulfilled' && Array.isArray(sessRes.value)) {
        setSessions(sessRes.value);
      }
      if (survRes.status === 'fulfilled' && Array.isArray(survRes.value?.surveys)) {
        setSurveys(survRes.value.surveys);
      }
    }).finally(() => setLoading(false));
  }, []);

  // Sessions per day (last 30)
  const dailyData = useMemo(() => buildDailySessionData(sessions), [sessions]);

  // Completion status pie
  const statusData = useMemo(() => {
    const counts = { completed: 0, abandoned: 0, active: 0 };
    for (const s of sessions) if (s.status in counts) counts[s.status]++;
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [sessions]);

  // Risk distribution bar
  const riskData = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0, very_high: 0 };
    for (const s of sessions) if (s.riskLevel && s.riskLevel in counts) counts[s.riskLevel]++;
    return [
      { name: 'Low',       count: counts.low,       fill: RISK_COLORS.low       },
      { name: 'Medium',    count: counts.medium,    fill: RISK_COLORS.medium    },
      { name: 'High',      count: counts.high,      fill: RISK_COLORS.high      },
      { name: 'Very High', count: counts.very_high, fill: RISK_COLORS.very_high },
    ];
  }, [sessions]);

  // Age distribution
  const ageData = useMemo(() => {
    const counts = {};
    for (let a = 3; a <= 10; a++) counts[a] = 0;
    for (const s of sessions) if (s.playerAge >= 3 && s.playerAge <= 10) counts[s.playerAge]++;
    return Object.entries(counts).map(([age, count]) => ({ age: `Age ${age}`, count }));
  }, [sessions]);

  // Average chapter score (proxy for completion time — use average rawPoints per chapter)
  const chapterData = useMemo(() => {
    const totals = {};
    const cnts   = {};
    for (const s of sessions) {
      for (const ds of s.domainScores ?? []) {
        const k = ds.domain;
        totals[k] = (totals[k] ?? 0) + (ds.rawScore ?? 0);
        cnts[k]   = (cnts[k] ?? 0) + 1;
      }
    }
    const DOMAIN_LABELS = {
      social_communication:  'Social',
      restricted_repetitive: 'Routines',
      pretend_play:          'Pretend Play',
      sensory_processing:    'Sensory',
    };
    return Object.entries(totals).map(([domain, total]) => ({
      name:  DOMAIN_LABELS[domain] ?? domain,
      score: +(total / cnts[domain]).toFixed(1),
    }));
  }, [sessions]);

  // Survey rating distribution
  const ratingData = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const s of surveys) if (s.rating >= 1 && s.rating <= 5) counts[s.rating]++;
    return Object.entries(counts).map(([r, count]) => ({ rating: `${r} ★`, count }));
  }, [surveys]);

  if (loading) {
    return (
      <div className="p-6 text-slate-400 text-sm">Loading analytics…</div>
    );
  }

  const chartCards = [
    {
      title: 'Sessions per Day (Last 30 days)',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Line type="monotone" dataKey="count" stroke={BAR_COLOR} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Session Status Distribution',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
              {statusData.map((entry, i) => (
                <Cell key={i} fill={STATUS_COLORS[entry.name] ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend iconType="circle" iconSize={9} formatter={v => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Risk Level Distribution',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={riskData} margin={{ top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {riskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Age Distribution (Sessions)',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ageData} margin={{ top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Average Raw Score by Domain',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chapterData} margin={{ top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="score" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
    {
      title: 'Survey Ratings Distribution',
      chart: (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ratingData} margin={{ top: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="rating" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Platform-wide screening metrics and trends</p>
      </div>

      {/* Vercel Analytics note */}
      <Card className="border-indigo-200 bg-indigo-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">📊</span>
            <div>
              <p className="text-sm font-semibold text-indigo-800">Vercel Analytics</p>
              <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
                Visitor and performance metrics are automatically tracked via Vercel Analytics — no
                extra configuration needed. View them at{' '}
                <span className="font-mono">vercel.com → your project → Analytics</span>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {chartCards.map(({ title, chart }) => (
          <Card key={title} className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-slate-700">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              {chart}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
