import { getScoresBySession } from "@/lib/db/queries/scores.js";
import { upsertDomainScore } from "@/lib/db/queries/domainScores.js";
import { getDomainRisk } from "./engine.js";
import { DOMAIN_MAX_POINTS, DOMAIN_WEIGHTS } from "./thresholds.js";

export const CHAPTER_TO_DOMAIN = {
  ch1_baseline: null,
  ch2_emotion: "social_communication",
  ch3_social: "social_communication",
  ch4_executive: "restricted_repetitive",
  ch5_pretend: "pretend_play",
  ch6_sensory: "sensory_processing",
  ch7_pattern: "restricted_repetitive",
  ch8_imitation: "social_communication",
  ch9_summary: null,
};

/**
 * Aggregates chapter score rows into domain scores and persists them.
 */
export function aggregateDomainScores(sessionId) {
  const rawScores = Object.fromEntries(
    Object.keys(DOMAIN_WEIGHTS).map((domain) => [domain, 0]),
  );

  for (const score of getScoresBySession(sessionId)) {
    const domain = CHAPTER_TO_DOMAIN[score.chapterKey];
    if (domain) rawScores[domain] += score.rawPoints || 0;
  }

  const domainScores = {};
  for (const [domain, rawScore] of Object.entries(rawScores)) {
    const weightedScore =
      Math.round(rawScore * DOMAIN_WEIGHTS[domain] * 10) / 10;
    domainScores[domain] = upsertDomainScore({
      sessionId,
      domain,
      rawScore,
      maxScore: DOMAIN_MAX_POINTS[domain],
      weightedScore,
      riskLevel: getDomainRisk(domain, rawScore),
    });
  }

  return { rawScores, domainScores };
}
