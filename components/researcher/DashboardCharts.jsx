"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = {
  low: "var(--success)",
  medium: "var(--warning)",
  high: "#f97316",
  very_high: "var(--destructive)",
  unknown: "var(--muted-foreground)",
};

export default function DashboardCharts({ riskDistribution }) {
  const data = Object.entries(riskDistribution).map(([risk, count]) => ({
    risk,
    count,
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="risk" outerRadius={78} label>
            {data.map((entry) => (
              <Cell key={entry.risk} fill={COLORS[entry.risk] || COLORS.unknown} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
