import { getCameraFramesBySession } from "@/lib/db/queries/cameraFrames.js";
import { expressionTrials } from "@/lib/gameData/chapter2.js";

const TARGET_EMOTION_BY_TASK = Object.fromEntries(
  expressionTrials.map((trial) => [trial.id, trial.emotion]),
);

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function std(values) {
  if (!values.length) return 0;
  const avg = mean(values);
  return Math.sqrt(mean(values.map((value) => (value - avg) ** 2)));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function normalizeEmotion(emotion) {
  if (emotion === "fearful") return "scared";
  return emotion;
}

function getTopExpression(expressionScores = {}) {
  let topEmotion = null;
  let topScore = -Infinity;
  for (const [emotion, score] of Object.entries(expressionScores)) {
    if (Number(score) > topScore) {
      topEmotion = normalizeEmotion(emotion);
      topScore = Number(score);
    }
  }
  return topEmotion;
}

function estimateFrameDurationMs(frames) {
  const times = frames
    .map((frame) => frame.capturedAt)
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);
  const deltas = [];
  for (let index = 1; index < times.length; index += 1) {
    const delta = times[index] - times[index - 1];
    if (delta > 0) deltas.push(delta);
  }
  if (!deltas.length) return 0;
  return deltas[Math.floor(deltas.length / 2)];
}

function isGazeNearCenter(gazeDirection) {
  if (!gazeDirection) return false;
  return Math.abs(gazeDirection.x || 0) <= 0.25 && Math.abs(gazeDirection.y || 0) <= 0.25;
}

export function computeCameraFeatures(frames = []) {
  const expressionFrames = frames.filter((frame) => frame.expressionScores);
  const expressionVariation = expressionFrames.map((frame) =>
    std(Object.values(frame.expressionScores).map(Number)),
  );
  const mirrorFrames = expressionFrames.filter(
    (frame) => TARGET_EMOTION_BY_TASK[frame.taskKey],
  );
  const mirrorMatches = mirrorFrames.filter(
    (frame) =>
      getTopExpression(frame.expressionScores) ===
      TARGET_EMOTION_BY_TASK[frame.taskKey],
  ).length;
  const gazeFrames = frames.filter((frame) => frame.gazeDirection);
  const gazeNearFaceFrames = gazeFrames.filter((frame) =>
    isGazeNearCenter(frame.gazeDirection),
  ).length;
  const headPoseValues = frames
    .flatMap((frame) =>
      frame.headPose
        ? [frame.headPose.pitch, frame.headPose.yaw, frame.headPose.roll]
        : [],
    )
    .filter((value) => Number.isFinite(value));
  const blinkRates = frames
    .map((frame) => frame.blinkRate)
    .filter((value) => Number.isFinite(value));
  const estimatedFrameDurationMs = estimateFrameDurationMs(frames);

  return {
    cameraFrameCount: frames.length,
    expressionFrameCount: expressionFrames.length,
    expressionFlatness: expressionFrames.length
      ? clamp01(1 - mean(expressionVariation))
      : 0,
    expressionMirrorAccuracy: mirrorFrames.length
      ? mirrorMatches / mirrorFrames.length
      : 0,
    gazeToFaceRatio: gazeFrames.length ? gazeNearFaceFrames / gazeFrames.length : 0,
    eyeContactDurationMs: gazeNearFaceFrames * estimatedFrameDurationMs,
    avgBlinkRate: mean(blinkRates),
    headPoseVariability: std(headPoseValues),
  };
}

export function extractCameraFeatures(sessionId) {
  return computeCameraFeatures(getCameraFramesBySession(sessionId));
}

