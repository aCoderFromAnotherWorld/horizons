const CAMERA_DERIVED_FIELDS = [
  "faceLandmarks",
  "irisLandmarks",
  "poseLandmarks",
  "gazeDirection",
  "blinkRate",
  "headPose",
  "expressionScores",
  "extraData",
];

export function hasCameraDerivedData(data = {}) {
  return CAMERA_DERIVED_FIELDS.some((field) => data[field] !== undefined);
}

export function buildCameraFramePayload({
  sessionId,
  taskKey,
  chapterId,
  levelId,
  extracted,
  capturedAt = Date.now(),
}) {
  const payload = {
    sessionId,
    taskKey,
    chapter: chapterId,
    level: levelId,
    capturedAt,
  };

  for (const field of CAMERA_DERIVED_FIELDS) {
    if (extracted?.[field] !== undefined) {
      payload[field] = extracted[field];
    }
  }

  return payload;
}

