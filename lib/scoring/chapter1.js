export const NAME_RESPONSE_THRESHOLDS_MS = {
  fast: 2000,
  slow: 5000,
};

/**
 * Scores response-to-name timing.
 */
export function scoreNameResponse(responseTimeMs, attemptNumber = 1) {
  const attemptPenalty = Math.max(0, attemptNumber - 1);
  if (responseTimeMs === null || responseTimeMs === undefined) {
    return 2 + attemptPenalty;
  }
  if (responseTimeMs < NAME_RESPONSE_THRESHOLDS_MS.fast) {
    return attemptPenalty;
  }
  if (responseTimeMs <= NAME_RESPONSE_THRESHOLDS_MS.slow) {
    return 1 + attemptPenalty;
  }
  return 2 + attemptPenalty;
}

export function getNextNameCallDelayMs(hasMoreCalls, intervalMs) {
  return hasMoreCalls ? intervalMs : 0;
}

/**
 * Scores a guide-following click result.
 */
export function scoreGuideFollowing({ clickedTarget, clickedPointer, promptUsed }) {
  if (clickedTarget) return promptUsed ? 1 : 0;
  if (clickedPointer) return 2;
  return 3;
}
