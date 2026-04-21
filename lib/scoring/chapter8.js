export const SIMPLE_ACTION_TIMEOUT_MS = 8000;
export const SIMPLE_IMITATION_ERROR_FLAG_THRESHOLD = 6;
export const PERSEVERATION_THRESHOLD = 3;

/**
 * Scores a simple imitation response by category and timeout status.
 */
export function scoreSimpleImitation({ category, isCorrect, timedOut = false }) {
  if (timedOut) return 2;
  if (isCorrect) return 0;
  return category === "facial" ? 2 : 1;
}

/**
 * Counts total and category-specific errors for simple imitation trials.
 */
export function summarizeSimpleImitation(responses) {
  return responses.reduce(
    (summary, response) => {
      if (!response.isCorrect) {
        summary.totalErrors += 1;
        if (response.category === "facial") summary.facialErrors += 1;
        if (response.category === "body") summary.bodyErrors += 1;
        if (response.category === "object") summary.objectErrors += 1;
      }
      summary.points += response.scorePoints || 0;
      return summary;
    },
    { totalErrors: 0, facialErrors: 0, bodyErrors: 0, objectErrors: 0, points: 0 },
  );
}

/**
 * Determines whether Chapter 8 should add the poor-imitation red flag.
 */
export function shouldFlagPoorImitation(totalErrors) {
  return totalErrors >= SIMPLE_IMITATION_ERROR_FLAG_THRESHOLD;
}

/**
 * Scores one sequential imitation attempt.
 */
export function scoreSequenceAttempt(sequence, selectedSteps) {
  const expectedSteps = sequence.steps;
  const perStepErrors = expectedSteps.reduce((errors, expected, index) => {
    return errors + (selectedSteps[index] === expected ? 0 : 1);
  }, 0);
  const extraSteps = Math.max(0, selectedSteps.length - expectedSteps.length);
  const totalErrors = perStepErrors + extraSteps;
  const pointsPerError = sequence.type === "3-action" ? 2 : 1;
  return {
    totalErrors,
    isComplete: totalErrors === 0,
    points: totalErrors * pointsPerError,
  };
}

/**
 * Detects perseveration when the same wrong action is chosen repeatedly.
 */
export function detectPerseveration(wrongSelections) {
  const counts = wrongSelections.reduce((map, actionId) => {
    map[actionId] = (map[actionId] || 0) + 1;
    return map;
  }, {});
  return Object.values(counts).some((count) => count >= PERSEVERATION_THRESHOLD);
}

/**
 * Summarizes sequential imitation results across all sequences.
 */
export function summarizeSequentialImitation(sequenceResults) {
  const threeActionResults = sequenceResults.filter(
    (result) => result.type === "3-action",
  );
  const completedThreeActionCount = threeActionResults.filter(
    (result) => result.isComplete,
  ).length;
  const cannotCompleteAnyThreeAction =
    threeActionResults.length > 0 && completedThreeActionCount === 0;
  const perseverationCount = sequenceResults.filter(
    (result) => result.perseveration,
  ).length;
  const basePoints = sequenceResults.reduce(
    (sum, result) => sum + result.points,
    0,
  );

  return {
    completedThreeActionCount,
    cannotCompleteAnyThreeAction,
    perseverationCount,
    points:
      basePoints +
      perseverationCount * 2 +
      (cannotCompleteAnyThreeAction ? 3 : 0),
  };
}
