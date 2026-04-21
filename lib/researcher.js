import { getDomainScoresBySession } from "@/lib/db/queries/domainScores.js";
import { getRedFlagsBySession } from "@/lib/db/queries/redFlags.js";
import { getScoresBySession } from "@/lib/db/queries/scores.js";
import { calculateCombinedScore, getRiskLevel } from "@/lib/scoring/engine.js";
import { aggregateDomainScores } from "@/lib/scoring/domains.js";

export const RISK_BADGE_CLASSES = {
  low: "bg-green-100 text-green-800 hover:bg-green-100",
  medium: "bg-yellow-100 text-yellow-900 hover:bg-yellow-100",
  high: "bg-orange-100 text-orange-900 hover:bg-orange-100",
  very_high: "bg-red-100 text-red-800 hover:bg-red-100",
  unknown: "bg-zinc-100 text-zinc-700 hover:bg-zinc-100",
};

export const CHAPTER_LABELS = {
  ch1_baseline: "Chapter 1 Baseline",
  ch2_emotion: "Chapter 2 Emotion",
  ch3_social: "Chapter 3 Social",
  ch4_executive: "Chapter 4 Executive",
  ch5_pretend: "Chapter 5 Pretend",
  ch6_sensory: "Chapter 6 Sensory",
  ch7_pattern: "Chapter 7 Patterns",
  ch8_imitation: "Chapter 8 Imitation",
  ch9_summary: "Chapter 9 Summary",
};

export function formatDate(timestamp) {
  if (!timestamp) return "Not recorded";
  return new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDuration(startedAt, completedAt) {
  if (!startedAt || !completedAt) return "In progress";
  const minutes = Math.max(0, Math.round((completedAt - startedAt) / 60000));
  return `${minutes} min`;
}

export function getSessionResultsSummary(sessionId) {
  const { rawScores } = aggregateDomainScores(sessionId);
  const redFlags = getRedFlagsBySession(sessionId);
  const activeRedFlags = redFlags.map((flag) => flag.flagType);
  const combinedScore = calculateCombinedScore(rawScores, activeRedFlags);
  return {
    rawScores,
    redFlags,
    combinedScore,
    riskLevel: getRiskLevel(combinedScore),
    domainScores: getDomainScoresBySession(sessionId),
  };
}

export function summarizeChapterScores(sessionId) {
  const totals = new Map();
  for (const score of getScoresBySession(sessionId)) {
    totals.set(score.chapterKey, (totals.get(score.chapterKey) || 0) + score.rawPoints);
  }
  return [...totals.entries()].map(([chapterKey, rawPoints]) => ({
    chapterKey,
    label: CHAPTER_LABELS[chapterKey] || chapterKey,
    rawPoints,
  }));
}
