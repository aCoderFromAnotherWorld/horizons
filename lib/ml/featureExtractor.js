import { getMovementsBySession } from "@/lib/db/queries/mouseMovements.js";
import { getRedFlagsBySession } from "@/lib/db/queries/redFlags.js";
import { getResponsesBySession } from "@/lib/db/queries/responses.js";
import { getSession } from "@/lib/db/queries/sessions.js";
import { aggregateDomainScores } from "@/lib/scoring/domains.js";
import { computeCameraFeatures } from "@/lib/ml/cameraFeatureExtractor.js";
import { getCameraFramesBySession } from "@/lib/db/queries/cameraFrames.js";

export const BEHAVIORAL_FEATURE_NAMES = [
  "social_communication_raw_score",
  "restricted_repetitive_raw_score",
  "sensory_processing_raw_score",
  "pretend_play_raw_score",
  "avg_response_time_ms",
  "median_response_time_ms",
  "response_time_std_dev",
  "avg_response_time_ch2",
  "avg_response_time_ch3",
  "avg_response_time_ch8",
  "timeout_rate",
  "slow_response_rate",
  "fast_response_rate",
  "response_time_trend",
  "overall_accuracy",
  "negative_emotion_accuracy",
  "pretend_play_recognition_accuracy",
  "imitation_accuracy",
  "avg_attempts_per_task",
  "multi_attempt_rate",
  "emotion_confusion_matrix_entropy",
  "rigid_response_rate",
  "avg_cursor_speed",
  "cursor_directionality",
  "hover_switching_rate",
  "repetitive_cursor_pattern_score",
  "avg_dwell_time_before_select",
  "spatial_concentration_score",
  "preferred_screen_quadrant",
  "red_flag_count",
  "flag_name_response",
  "flag_pretend_play_absent",
  "flag_sensory_distress",
  "flag_imitation_deficit",
  "player_age",
  "session_completion_rate",
];

export const CAMERA_FEATURE_NAMES = [
  "camera_frame_count",
  "expression_frame_count",
  "expression_flatness",
  "expression_mirror_accuracy",
  "gaze_to_face_ratio",
  "eye_contact_duration_ms",
  "avg_blink_rate",
  "head_pose_variability",
];

export const FEATURE_NAMES = [
  ...BEHAVIORAL_FEATURE_NAMES,
  ...CAMERA_FEATURE_NAMES,
];

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function std(values) {
  if (!values.length) return 0;
  const avg = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - avg) ** 2)));
}

function slope(values) {
  if (values.length < 2) return 0;
  const xs = values.map((_, index) => index);
  const xMean = mean(xs);
  const yMean = mean(values);
  const numerator = values.reduce(
    (sum, value, index) => sum + (xs[index] - xMean) * (value - yMean),
    0,
  );
  const denominator = xs.reduce((sum, value) => sum + (value - xMean) ** 2, 0);
  return denominator ? numerator / denominator : 0;
}

function safeRatio(numerator, denominator) {
  return denominator ? numerator / denominator : 0;
}

function getResponseTimes(responses) {
  return responses
    .map((response) => response.responseTimeMs)
    .filter((time) => Number.isFinite(time));
}

function entropy(values) {
  const total = values.length;
  if (!total) return 0;
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return Array.from(counts.values()).reduce((sum, count) => {
    const probability = count / total;
    return sum - probability * Math.log2(probability);
  }, 0);
}

function computeEmotionEntropy(responses) {
  const wrongEmotionSelections = responses
    .filter((response) => response.chapter === 2 && !response.isCorrect)
    .map((response) =>
      typeof response.selection === "string"
        ? response.selection
        : response.selection?.emotion,
    )
    .filter(Boolean);
  return entropy(wrongEmotionSelections);
}

function computeMouseFeatures(movements) {
  if (movements.length < 2) {
    return {
      avgCursorSpeed: 0,
      cursorDirectionality: 0,
      repetitiveCursorPatternScore: 0,
      spatialConcentrationScore: 0,
      preferredScreenQuadrant: 0,
    };
  }

  let totalDistance = 0;
  let totalTime = 0;
  let reversals = 0;
  for (let index = 1; index < movements.length; index += 1) {
    const previous = movements[index - 1];
    const current = movements[index];
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    totalDistance += Math.hypot(dx, dy);
    totalTime += Math.max(0, current.recordedAt - previous.recordedAt);
    if (index > 1) {
      const before = movements[index - 2];
      const prevDx = previous.x - before.x;
      const prevDy = previous.y - before.y;
      if (dx * prevDx + dy * prevDy < 0) reversals += 1;
    }
  }

  const first = movements[0];
  const last = movements[movements.length - 1];
  const directDistance = Math.hypot(last.x - first.x, last.y - first.y);
  const xs = movements.map((movement) => movement.x);
  const ys = movements.map((movement) => movement.y);
  const xSpread = std(xs);
  const ySpread = std(ys);
  const centerX = mean(xs);
  const centerY = mean(ys);

  return {
    avgCursorSpeed: safeRatio(totalDistance, totalTime),
    cursorDirectionality: totalDistance ? directDistance / totalDistance : 0,
    repetitiveCursorPatternScore: safeRatio(reversals, movements.length - 2),
    spatialConcentrationScore: 1 / (1 + xSpread + ySpread),
    preferredScreenQuadrant:
      xSpread + ySpread < 1
        ? 0
        : centerY < 384
          ? centerX < 640
            ? 1
            : 2
          : centerX < 640
            ? 3
            : 4,
  };
}

export function buildFeatureVector({
  session,
  responses,
  movements,
  flags,
  rawScores,
  cameraFeatures,
}) {
  const responseTimes = getResponseTimes(responses);
  const chapterTimes = (chapter) =>
    getResponseTimes(responses.filter((response) => response.chapter === chapter));
  const negativeEmotionResponses = responses.filter(
    (response) =>
      response.chapter === 2 &&
      ["sad", "scared"].includes(response.extraData?.correctEmotion || response.extraData?.targetEmotion),
  );
  const pretendResponses = responses.filter(
    (response) => response.chapter === 5 && response.level === 1,
  );
  const imitationResponses = responses.filter(
    (response) => response.chapter === 8 && response.level === 1,
  );
  const chapter4Responses = responses.filter((response) => response.chapter === 4);
  const flagTypes = new Set(flags.map((flag) => flag.flagType));
  const mouseFeatures = computeMouseFeatures(movements);

  const valuesByName = {
    social_communication_raw_score: rawScores.social_communication || 0,
    restricted_repetitive_raw_score: rawScores.restricted_repetitive || 0,
    sensory_processing_raw_score: rawScores.sensory_processing || 0,
    pretend_play_raw_score: rawScores.pretend_play || 0,
    avg_response_time_ms: mean(responseTimes),
    median_response_time_ms: median(responseTimes),
    response_time_std_dev: std(responseTimes),
    avg_response_time_ch2: mean(chapterTimes(2)),
    avg_response_time_ch3: mean(chapterTimes(3)),
    avg_response_time_ch8: mean(chapterTimes(8)),
    timeout_rate: safeRatio(
      responses.filter((response) => response.responseTimeMs === null).length,
      responses.length,
    ),
    slow_response_rate: safeRatio(
      responses.filter((response) => response.responseTimeMs > 10000).length,
      responses.length,
    ),
    fast_response_rate: safeRatio(
      responses.filter(
        (response) =>
          Number.isFinite(response.responseTimeMs) && response.responseTimeMs < 500,
      ).length,
      responses.length,
    ),
    response_time_trend: slope(responseTimes),
    overall_accuracy: safeRatio(
      responses.filter((response) => response.isCorrect).length,
      responses.length,
    ),
    negative_emotion_accuracy: safeRatio(
      negativeEmotionResponses.filter((response) => response.isCorrect).length,
      negativeEmotionResponses.length,
    ),
    pretend_play_recognition_accuracy: safeRatio(
      pretendResponses.filter((response) => response.isCorrect).length,
      pretendResponses.length,
    ),
    imitation_accuracy: safeRatio(
      imitationResponses.filter((response) => response.isCorrect).length,
      imitationResponses.length,
    ),
    avg_attempts_per_task: mean(responses.map((response) => response.attemptNumber || 1)),
    multi_attempt_rate: safeRatio(
      responses.filter((response) => response.attemptNumber > 1).length,
      responses.length,
    ),
    emotion_confusion_matrix_entropy: computeEmotionEntropy(responses),
    rigid_response_rate: safeRatio(
      chapter4Responses.filter(
        (response) => response.extraData?.responseFlexibility === "rigid",
      ).length,
      chapter4Responses.length,
    ),
    avg_cursor_speed: mouseFeatures.avgCursorSpeed,
    cursor_directionality: mouseFeatures.cursorDirectionality,
    hover_switching_rate: 0,
    repetitive_cursor_pattern_score: mouseFeatures.repetitiveCursorPatternScore,
    avg_dwell_time_before_select: mean(
      responses.map((response) => response.extraData?.hoverDwellMs?.total || 0),
    ),
    spatial_concentration_score: mouseFeatures.spatialConcentrationScore,
    preferred_screen_quadrant: mouseFeatures.preferredScreenQuadrant,
    red_flag_count: flags.length,
    flag_name_response: flagTypes.has("no_name_response") ? 1 : 0,
    flag_pretend_play_absent: flagTypes.has("complete_absence_pretend_play") ? 1 : 0,
    flag_sensory_distress: flagTypes.has("extreme_sensory_4plus_distressing_sounds")
      ? 1
      : 0,
    flag_imitation_deficit: flagTypes.has("poor_imitation_all_modalities") ? 1 : 0,
    player_age: session?.playerAge || 0,
    session_completion_rate: safeRatio(
      new Set(responses.map((response) => response.chapter)).size,
      9,
    ),
    camera_frame_count: cameraFeatures.cameraFrameCount,
    expression_frame_count: cameraFeatures.expressionFrameCount,
    expression_flatness: cameraFeatures.expressionFlatness,
    expression_mirror_accuracy: cameraFeatures.expressionMirrorAccuracy,
    gaze_to_face_ratio: cameraFeatures.gazeToFaceRatio,
    eye_contact_duration_ms: cameraFeatures.eyeContactDurationMs,
    avg_blink_rate: cameraFeatures.avgBlinkRate,
    head_pose_variability: cameraFeatures.headPoseVariability,
  };

  return FEATURE_NAMES.map((name) => valuesByName[name] ?? 0);
}

export function extractFeatureVector(sessionId) {
  const session = getSession(sessionId);
  const responses = getResponsesBySession(sessionId);
  const movements = getMovementsBySession(sessionId);
  const flags = getRedFlagsBySession(sessionId);
  const { rawScores } = aggregateDomainScores(sessionId);
  const cameraFeatures = computeCameraFeatures(getCameraFramesBySession(sessionId));

  return {
    featureNames: FEATURE_NAMES,
    featureVector: buildFeatureVector({
      session,
      responses,
      movements,
      flags,
      rawScores,
      cameraFeatures,
    }),
  };
}
