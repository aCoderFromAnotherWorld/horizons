"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DOMAIN_MAX_POINTS } from "@/lib/scoring/thresholds";

const DOMAIN_LABELS = {
  social_communication: "Social",
  restricted_repetitive: "RRB",
  sensory_processing: "Sensory",
  pretend_play: "Pretend",
};

export function DomainBarChart({ domainScores }) {
  const data = domainScores.map((score) => ({
    domain: DOMAIN_LABELS[score.domain] || score.domain,
    rawScore: score.rawScore || 0,
    maxScore: score.maxScore || DOMAIN_MAX_POINTS[score.domain] || 0,
  }));

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="domain" stroke="var(--muted-foreground)" />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
          />
          <Bar dataKey="rawScore" fill="var(--primary)" name="Raw score" />
          <Bar dataKey="maxScore" fill="var(--secondary)" name="Max score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResponseTimeChart({ responses }) {
  const buckets = [
    { label: "0-2s", min: 0, max: 2000 },
    { label: "2-5s", min: 2000, max: 5000 },
    { label: "5-10s", min: 5000, max: 10000 },
    { label: "10s+", min: 10000, max: Infinity },
  ].map((bucket) => ({
    label: bucket.label,
    count: responses.filter(
      (response) =>
        response.responseTimeMs !== null &&
        response.responseTimeMs >= bucket.min &&
        response.responseTimeMs < bucket.max,
    ).length,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="var(--muted-foreground)" />
          <YAxis allowDecimals={false} stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
          />
          <Bar dataKey="count" fill="var(--accent)" name="Responses" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
