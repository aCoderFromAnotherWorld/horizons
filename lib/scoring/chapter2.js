export const NEGATIVE_EMOTIONS = ["sad", "scared"];

export function isNegativeEmotion(emotion) {
  return NEGATIVE_EMOTIONS.includes(emotion);
}

export function isFearSadConfusion(correctEmotion, selectedEmotion) {
  return (
    (correctEmotion === "scared" && selectedEmotion === "sad") ||
    (correctEmotion === "sad" && selectedEmotion === "scared")
  );
}

export function shouldTriggerNegativeEmotionFlag(correctNegative, totalNegative) {
  if (!totalNegative) return false;
  return correctNegative / totalNegative < 0.5;
}

export function calcEmotionMatchingPoints({
  accuracy,
  negativeAccuracy,
  fearSadConfusions,
  totalMoves,
}) {
  let points = 0;
  if (accuracy > 0.9) points = 0;
  else if (accuracy >= 0.7) points = 1;
  else if (accuracy >= 0.5) points = 2;
  else points = 3;

  if (negativeAccuracy < 0.8) points += 2;
  if (totalMoves && fearSadConfusions / totalMoves > 0.25) points += 2;
  return points;
}

export function scoreExpressionSelection({ targetEmotion, targetIntensity, selected }) {
  if (selected.emotion === targetEmotion && selected.intensity === targetIntensity) {
    return { points: 0, type: "correct" };
  }
  if (selected.emotion === targetEmotion) {
    return { points: 1, type: "intensity_error" };
  }
  if (selected.emotion === "neutral") {
    return { points: 2, type: "neutral" };
  }
  return { points: 3, type: "opposite" };
}

export function scoreRegulationSelection(type, decisionTimeMs) {
  const basePoints = {
    appropriate: 0,
    avoidant: 2,
    aggressive: 3,
  }[type];
  const slowDecisionPenalty = decisionTimeMs > 15000 ? 1 : 0;
  return (basePoints ?? 3) + slowDecisionPenalty;
}
