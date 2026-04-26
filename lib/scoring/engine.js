import { DOMAIN_MAX_POINTS, DOMAIN_WEIGHTS } from './domains.js';
import { DOMAIN_THRESHOLDS, COMBINED_THRESHOLDS } from './thresholds.js';
import { RED_FLAG_MULTIPLIERS } from './redFlags.js';

const MAX_MULTIPLIER = 2.0;

/**
 * Resolve a risk level label from a threshold map.
 * @param {Record<string, [number, number]>} thresholds
 * @param {number} score
 * @returns {string}
 */
function resolveRiskLevel(thresholds, score) {
  for (const [level, [min, max]] of Object.entries(thresholds)) {
    if (score >= min && score <= max) return level;
  }
  return 'very_high';
}

/**
 * Calculate the combined weighted score, applying red-flag multipliers (stacked,
 * capped at 2.0×).
 *
 * Formula:
 * combined = Σ((rawScore[domain] / maxPoints[domain]) × 100 × weight[domain])
 *            × redFlagMultiplier
 *
 * @param {Record<string, number>} domainRawScores - Map of domain → raw points scored.
 * @param {string[]} activeRedFlags - Array of triggered flag type keys.
 * @returns {number} Combined score.
 */
export function calculateCombinedScore(domainRawScores, activeRedFlags = []) {
  let combined = 0;

  for (const [domain, weight] of Object.entries(DOMAIN_WEIGHTS)) {
    const maxPoints = DOMAIN_MAX_POINTS[domain];
    if (!maxPoints) continue;

    const rawScore = domainRawScores[domain] ?? 0;
    combined += (rawScore / maxPoints) * 100 * weight;
  }

  let multiplier = 1.0;
  for (const flag of activeRedFlags) {
    const m = RED_FLAG_MULTIPLIERS[flag];
    if (m) multiplier *= m;
  }
  multiplier = Math.min(multiplier, MAX_MULTIPLIER);

  return combined * multiplier;
}

/**
 * Map a combined score to a risk level string.
 *
 * @param {number} combinedScore
 * @returns {'low'|'medium'|'high'|'very_high'}
 */
export function getRiskLevel(combinedScore) {
  return resolveRiskLevel(COMBINED_THRESHOLDS, combinedScore);
}

/**
 * Map a domain's raw score to a risk level string.
 *
 * @param {string} domain - One of the four domain keys.
 * @param {number} rawScore
 * @returns {string} Risk level, e.g. 'low'|'medium'|'high'|'very_high'.
 */
export function getDomainRisk(domain, rawScore) {
  const thresholds = DOMAIN_THRESHOLDS[domain];
  if (!thresholds) return 'unknown';
  return resolveRiskLevel(thresholds, rawScore);
}

/**
 * Calculate accuracy for a game task set (EmoGalaxy formula).
 *
 * @param {number} correctResponses
 * @param {number} totalMoves
 * @returns {number} Accuracy as a fraction 0–1, or 0 if totalMoves is 0.
 */
export function calcGameAccuracy(correctResponses, totalMoves) {
  if (!totalMoves) return 0;
  return correctResponses / totalMoves;
}

/**
 * Calculate average attempts per question (DTT formula).
 *
 * @param {number} sumOfAttempts - Total attempts across all questions.
 * @param {number} totalQuestions
 * @returns {number} Average attempts, or 0 if totalQuestions is 0.
 */
export function calcAvgAttempts(sumOfAttempts, totalQuestions) {
  if (!totalQuestions) return 0;
  return sumOfAttempts / totalQuestions;
}

/**
 * Check whether Chapter 6 performance is >20% worse than Chapters 1–5.
 * In this penalty system, a higher score_points value means worse performance.
 *
 * @param {object[]} ch6Responses  - task_responses rows where chapter === 6
 * @param {object[]} origResponses - task_responses rows where chapter <= 5
 * @returns {boolean} true if ch6 average score > origAverage × 1.20
 */
export function checkConsistency(ch6Responses, origResponses) {
  if (ch6Responses.length === 0 || origResponses.length === 0) return false;

  const avg = (arr) => arr.reduce((s, r) => s + (r.score_points ?? 0), 0) / arr.length;
  const ch6Avg  = avg(ch6Responses);
  const origAvg = avg(origResponses);

  if (origAvg === 0) return false;
  return ch6Avg > origAvg * 1.20;
}
