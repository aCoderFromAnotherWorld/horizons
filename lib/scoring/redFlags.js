/**
 * Multiplier applied to the combined score when each red flag is triggered.
 * Multipliers stack multiplicatively and are capped at 2.0×.
 */
export const RED_FLAG_MULTIPLIERS = {
  negative_emotion_recognition_under_50: 1.20,
  complete_absence_pretend_play:         1.30,
  extreme_sensory_distress:              1.15,
  rigid_pattern_distress:                1.20,
  poor_imitation_all_modalities:         1.25,
};

/**
 * Evaluate which red flags are triggered from a session's task response data.
 *
 * @param {Object} sessionData
 * @param {Array}  sessionData.taskResponses - All task_responses rows for the session.
 * @param {Array}  [sessionData.redFlags]    - Already-recorded red_flags rows (flag_type strings).
 * @returns {string[]} Array of triggered flag type strings.
 */
export function detectRedFlags(sessionData) {
  const triggered = new Set();

  const { taskResponses = [], redFlags = [] } = sessionData;

  // Include any flags already explicitly recorded (e.g. written by level logic).
  for (const f of redFlags) {
    const key = typeof f === 'string' ? f : f.flag_type;
    if (key && key in RED_FLAG_MULTIPLIERS) triggered.add(key);
  }

  // --- Ch2 L1: negative emotion recognition under 50% ---
  const negativeEmotionTasks = taskResponses.filter(
    (r) => r.chapter === 2 && r.level === 1 && isNegativeEmotion(r.task_key)
  );
  if (negativeEmotionTasks.length > 0) {
    const correct = negativeEmotionTasks.filter((r) => r.is_correct).length;
    const accuracy = correct / negativeEmotionTasks.length;
    if (accuracy < 0.5) triggered.add('negative_emotion_recognition_under_50');
  }

  // --- Ch5 L1: all 5 pretend scenarios answered literally ---
  const pretendTasks = taskResponses.filter(
    (r) => r.chapter === 5 && r.level === 1
  );
  if (pretendTasks.length >= 5 && pretendTasks.every((r) => !r.is_correct)) {
    triggered.add('complete_absence_pretend_play');
  }

  // --- Ch5 L3: 4+ stimuli rated distressing ---
  const sensoryTasks = taskResponses.filter(
    (r) => r.chapter === 5 && r.level === 3 && r.extra_data?.sub_scene === 'sounds'
  );
  const distressingCount = sensoryTasks.filter(
    (r) => r.extra_data?.distressing === true
  ).length;
  if (distressingCount >= 4) triggered.add('extreme_sensory_distress');

  // --- Ch4 L3: meltdown + returns to pattern ---
  const patternTasks = taskResponses.filter(
    (r) => r.chapter === 4 && r.level === 3
  );
  const rigidPatternDistress = patternTasks.some(
    (r) => r.extra_data?.meltdown === true && r.extra_data?.returns_to_pattern === true
  );
  if (rigidPatternDistress) triggered.add('rigid_pattern_distress');

  // --- Ch3 L4: 5+ imitation errors across modalities ---
  const imitationTasks = taskResponses.filter(
    (r) => r.chapter === 3 && r.level === 4
  );
  const imitationErrors = imitationTasks.filter((r) => !r.is_correct).length;
  if (imitationErrors >= 5) triggered.add('poor_imitation_all_modalities');

  return Array.from(triggered);
}

/** Returns true if a task key corresponds to a negative emotion (Sad or Scared). */
function isNegativeEmotion(taskKey) {
  return (
    taskKey.includes('sad') ||
    taskKey.includes('scared') ||
    taskKey.includes('fear') ||
    taskKey.includes('angry') // angry is included in negative per research
  );
}
