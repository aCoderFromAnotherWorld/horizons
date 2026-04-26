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
  const extra = (r) => r.extra_data ?? r.extraData ?? {};

  // Include any flags already explicitly recorded (e.g. written by level logic).
  for (const f of redFlags) {
    const key = typeof f === 'string' ? f : f.flag_type;
    if (key && key in RED_FLAG_MULTIPLIERS) triggered.add(key);
  }

  // --- Ch2 L1: negative emotion recognition under 50% ---
  // correctEmotion is stored in extra_data by the level page.
  const negativeEmotionTasks = taskResponses.filter(
    (r) => {
      if (r.chapter !== 2 || r.level !== 1) return false;
      const correctEmotion = extra(r).correctEmotion;
      if (correctEmotion === 'sad' || correctEmotion === 'scared') return true;
      return /_(sad|scared|fear|angry)_/i.test(r.task_key ?? r.taskKey ?? '');
    }
  );
  if (negativeEmotionTasks.length > 0) {
    const correct = negativeEmotionTasks.filter((r) => r.is_correct).length;
    const accuracy = correct / negativeEmotionTasks.length;
    if (accuracy < 0.5) triggered.add('negative_emotion_recognition_under_50');
  }

  // --- Ch5 L1: all pretend scenarios answered as real/literal ---
  const pretendTasks = taskResponses.filter(
    (r) => r.chapter === 5 && r.level === 1
  );
  const pretendRecognitionTasks = pretendTasks.filter(
    (r) => !extra(r).expectedType || extra(r).expectedType === 'pretend'
  );
  if (pretendRecognitionTasks.length >= 5 && pretendRecognitionTasks.every((r) => !r.is_correct)) {
    triggered.add('complete_absence_pretend_play');
  }

  // --- Ch5 L3: 4+ stimuli rated distressing ---
  const sensoryTasks = taskResponses.filter(
    (r) => r.chapter === 5 && r.level === 3 && extra(r).sub_scene === 'sounds'
  );
  const distressingCount = sensoryTasks.filter(
    (r) => extra(r).distressing === true
  ).length;
  if (distressingCount >= 4) triggered.add('extreme_sensory_distress');

  // --- Ch4 L3: meltdown + returns to pattern ---
  // insistTaps is stored in extra_data by the level page after each forced-error phase.
  const patternTasks = taskResponses.filter(
    (r) => r.chapter === 4 && r.level === 3
  );
  const rigidPatternDistress = patternTasks.some(
    (r) => (extra(r).insistTaps ?? 0) >= 2 || (extra(r).meltdown === true && extra(r).returns_to_pattern === true)
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

