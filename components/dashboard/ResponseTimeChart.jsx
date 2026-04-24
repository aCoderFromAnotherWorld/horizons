'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const CHAPTER_LABELS = {
  ch1_baseline: 'Ch1 Baseline',
  ch2_emotion:  'Ch2 Emotion',
  ch3_social:   'Ch3 Social',
  ch4_routine:  'Ch4 Routine',
  ch5_pretend:  'Ch5 Pretend',
  ch5_sensory:  'Ch5 Sensory',
  ch6_summary:  'Ch6 Finale',
};

/**
 * Props:
 *   taskResponses — array of { chapter, level, response_time_ms, task_key }
 *   chapterScores — array of { chapter_key, raw_points }
 */
export default function ResponseTimeChart({ taskResponses = [], chapterScores = [] }) {
  // Compute average response_time_ms per chapter
  const byChapter = {};
  for (const r of taskResponses) {
    if (!r.response_time_ms) continue;
    const key = `ch${r.chapter}`;
    if (!byChapter[key]) byChapter[key] = { total: 0, count: 0 };
    byChapter[key].total += r.response_time_ms;
    byChapter[key].count += 1;
  }

  const data = Object.entries(byChapter).map(([key, { total, count }]) => ({
    name:  CHAPTER_LABELS[key] ?? key,
    avgMs: Math.round(total / count),
    avgS:  +(total / count / 1000).toFixed(1),
  }));

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No response time data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis
          type="number"
          dataKey="avgMs"
          tickFormatter={v => `${(v / 1000).toFixed(1)}s`}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip
          formatter={v => [`${(v / 1000).toFixed(2)}s`, 'Avg Response Time']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="avgMs" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={20}>
          <LabelList
            dataKey="avgS"
            position="right"
            formatter={v => `${v}s`}
            style={{ fontSize: 11, fill: '#64748b' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
