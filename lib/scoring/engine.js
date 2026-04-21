import {
  DOMAIN_THRESHOLDS,
  DOMAIN_WEIGHTS,
  RED_FLAG_MULTIPLIERS,
} from "./thresholds.js";

/**
 * Calculates the weighted combined screening score.
 */
export function calculateCombinedScore(domainRawScores, activeRedFlags) {
  let combined = 0;
  for (const [domain, weight] of Object.entries(DOMAIN_WEIGHTS)) {
    combined += (domainRawScores[domain] || 0) * weight;
  }

  let multiplier = 1.0;
  for (const flag of activeRedFlags) {
    if (RED_FLAG_MULTIPLIERS[flag]) {
      multiplier *= RED_FLAG_MULTIPLIERS[flag];
    }
  }
  multiplier = Math.min(multiplier, 2.0);
  combined *= multiplier;

  return Math.round(combined * 10) / 10;
}

/**
 * Classifies the combined weighted score.
 */
export function getRiskLevel(combined) {
  if (combined <= 25) return "low";
  if (combined <= 45) return "medium";
  if (combined <= 65) return "high";
  return "very_high";
}

/**
 * Classifies a raw score within a domain.
 */
export function getDomainRisk(domain, rawScore) {
  const thresholds = DOMAIN_THRESHOLDS[domain];
  if (!thresholds) return "unknown";
  for (const [level, [min, max]] of Object.entries(thresholds)) {
    if (rawScore >= min && rawScore <= max) return level;
  }
  return "unknown";
}

/**
 * EmoGalaxy-style task accuracy.
 */
export function calcGameAccuracy(correctResponses, totalMoves) {
  if (!totalMoves) return 0;
  return correctResponses / totalMoves;
}

/**
 * DTT-style average attempts.
 */
export function calcAvgAttempts(sumOfAttempts, totalQuestions) {
  if (!totalQuestions) return 0;
  return sumOfAttempts / totalQuestions;
}
