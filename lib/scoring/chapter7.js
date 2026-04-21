export const PATTERN_DELAY_THRESHOLD_MS = 10000;
export const REPEAT_ACTION_THRESHOLD = 8;
export const TRANSITION_RESISTANCE_THRESHOLD_MS = 8000;
export const SPECIAL_INTEREST_SELECTION_THRESHOLD = 3;
export const SPECIAL_INTEREST_FACT_THRESHOLD = 15;

/**
 * Returns the expected shape for the next missing pattern slot.
 */
export function getExpectedPatternItem(pattern, placedCount) {
  const visibleCount = pattern.sequence.length - pattern.missingCount;
  return pattern.sequence[visibleCount + placedCount] || null;
}

/**
 * Scores the child's response to a forced pattern error and pattern-type change.
 */
export function scorePatternChange({
  distressAtChange = false,
  refusedNewPattern = false,
  newPatternDelayMs = 0,
  returnedToFirstPattern = false,
} = {}) {
  return (
    (distressAtChange ? 3 : 0) +
    (refusedNewPattern ? 3 : 0) +
    (newPatternDelayMs > PATTERN_DELAY_THRESHOLD_MS ? 2 : 0) +
    (returnedToFirstPattern ? 2 : 0)
  );
}

/**
 * Flags the AGENTS.md Chapter 7 red-flag condition.
 */
export function shouldFlagRigidPatternDistress({
  distressAtChange = false,
  returnedToFirstPattern = false,
} = {}) {
  return distressAtChange && returnedToFirstPattern;
}

/**
 * Finds the longest consecutive run of interactions with the same object.
 */
export function getMaxConsecutiveObjectRepeats(interactions) {
  let maxRepeats = 0;
  let currentId = null;
  let currentRepeats = 0;

  for (const interaction of interactions) {
    if (interaction.objectId === currentId) {
      currentRepeats += 1;
    } else {
      currentId = interaction.objectId;
      currentRepeats = 1;
    }
    maxRepeats = Math.max(maxRepeats, currentRepeats);
  }

  return maxRepeats;
}

/**
 * Detects same-object repetition at the configured screening threshold.
 */
export function detectSameObjectRepeated(interactions, threshold = REPEAT_ACTION_THRESHOLD) {
  return getMaxConsecutiveObjectRepeats(interactions) >= threshold;
}

/**
 * Detects a left-to-right click sequence across the full object set.
 */
export function detectLiningUpPattern(interactions, objects) {
  const orderedIds = [...objects]
    .sort((a, b) => a.lineOrder - b.lineOrder)
    .map((object) => object.id);
  if (!orderedIds.length || interactions.length < orderedIds.length) return false;

  for (let start = 0; start <= interactions.length - orderedIds.length; start += 1) {
    const window = interactions
      .slice(start, start + orderedIds.length)
      .map((interaction) => interaction.objectId);
    if (window.every((id, index) => id === orderedIds[index])) return true;
  }

  return false;
}

/**
 * Summarizes free-play restricted/repetitive behavior signals.
 */
export function analyzeFreePlayInteractions({
  interactions = [],
  objects = [],
  distressAtDisruption = false,
} = {}) {
  const sameObjectRepeated = detectSameObjectRepeated(interactions);
  const liningUpDetected = detectLiningUpPattern(interactions, objects);
  return {
    sameObjectRepeated,
    liningUpDetected,
    maxConsecutiveRepeats: getMaxConsecutiveObjectRepeats(interactions),
    points:
      (sameObjectRepeated ? 2 : 0) +
      (liningUpDetected ? 2 : 0) +
      (distressAtDisruption ? 2 : 0),
  };
}

/**
 * Counts how often each topic was selected.
 */
export function countTopicSelections(selections) {
  return selections.reduce((counts, topicId) => {
    counts[topicId] = (counts[topicId] || 0) + 1;
    return counts;
  }, {});
}

/**
 * Detects repeated selection of one topic book.
 */
export function hasTopicRepeatedThreePlus(selections) {
  return Object.values(countTopicSelections(selections)).some(
    (count) => count >= SPECIAL_INTEREST_SELECTION_THRESHOLD,
  );
}

/**
 * Detects intense fact consumption for any one topic.
 */
export function hasHighFactCount(factCountsByTopic) {
  return Object.values(factCountsByTopic).some(
    (count) => count >= SPECIAL_INTEREST_FACT_THRESHOLD,
  );
}

/**
 * Scores special-interest intensity from selections, fact counts, and transitions.
 */
export function scoreSpecialInterest({
  selections = [],
  factCountsByTopic = {},
  transitionDelaysMs = [],
  returnToSameCount = 0,
} = {}) {
  const repeatedTopic = hasTopicRepeatedThreePlus(selections);
  const highFactCount = hasHighFactCount(factCountsByTopic);
  const transitionResistanceCount = transitionDelaysMs.filter(
    (delay) => delay > TRANSITION_RESISTANCE_THRESHOLD_MS,
  ).length;

  return {
    repeatedTopic,
    highFactCount,
    transitionResistanceCount,
    returnToSameCount,
    points:
      (repeatedTopic ? 3 : 0) +
      (highFactCount ? 2 : 0) +
      transitionResistanceCount * 2 +
      returnToSameCount * 2,
  };
}
