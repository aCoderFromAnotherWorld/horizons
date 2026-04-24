'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const DOMAIN_SHORT = {
  social_communication:  'Social',
  restricted_repetitive: 'Routines',
  pretend_play:          'Pretend',
  sensory_processing:    'Sensory',
};

const RISK_COLOR = {
  low:       '#10b981',
  medium:    '#f59e0b',
  high:      '#f97316',
  very_high: '#ef4444',
};

/**
 * Props:
 *   domainScores — array of { domain, rawScore, maxScore, riskLevel }
 */
export default function DomainRadarChart({ domainScores = [] }) {
  if (!domainScores.length) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        No domain data available
      </div>
    );
  }

  const data = domainScores.map(ds => ({
    subject: DOMAIN_SHORT[ds.domain] ?? ds.domain,
    score:   ds.maxScore > 0 ? Math.round((ds.rawScore / ds.maxScore) * 100) : 0,
    risk:    ds.riskLevel,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: '#94a3b8' }}
          axisLine={false}
          tickCount={4}
        />
        <Tooltip
          formatter={(value, name) => [`${value}%`, 'Normalised Score']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Radar
          name="Domain Score"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
