import { getDb } from "@/lib/db/index.js";

function parseJson(value) {
  if (!value) return null;
  return JSON.parse(value);
}

function serializeJson(value) {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function mapCameraFrame(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    taskKey: row.task_key,
    chapter: row.chapter,
    level: row.level,
    capturedAt: row.captured_at,
    faceLandmarks: parseJson(row.face_landmarks),
    irisLandmarks: parseJson(row.iris_landmarks),
    poseLandmarks: parseJson(row.pose_landmarks),
    gazeDirection: parseJson(row.gaze_direction),
    blinkRate: row.blink_rate,
    headPose: parseJson(row.head_pose),
    expressionScores: parseJson(row.expression_scores),
    extraData: parseJson(row.extra_data),
  };
}

/**
 * Saves one camera-derived metadata frame. Raw images or video frames are never
 * accepted here; callers should only pass landmarks, scores, and measurements.
 */
export function saveCameraFrame(frame) {
  const result = getDb()
    .query(
      `INSERT INTO camera_frames (
        session_id, task_key, chapter, level, captured_at,
        face_landmarks, iris_landmarks, pose_landmarks, gaze_direction,
        blink_rate, head_pose, expression_scores, extra_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      frame.sessionId,
      frame.taskKey,
      frame.chapter ?? frame.chapterId ?? null,
      frame.level ?? frame.levelId ?? null,
      frame.capturedAt ?? Date.now(),
      serializeJson(frame.faceLandmarks),
      serializeJson(frame.irisLandmarks),
      serializeJson(frame.poseLandmarks),
      serializeJson(frame.gazeDirection),
      frame.blinkRate ?? null,
      serializeJson(frame.headPose),
      serializeJson(frame.expressionScores),
      serializeJson(frame.extraData),
    );

  return mapCameraFrame(
    getDb()
      .query("SELECT * FROM camera_frames WHERE id = ?")
      .get(result.lastInsertRowid),
  );
}

/**
 * Gets all camera-derived frames for a session.
 */
export function getCameraFramesBySession(sessionId) {
  return getDb()
    .query("SELECT * FROM camera_frames WHERE session_id = ? ORDER BY id ASC")
    .all(sessionId)
    .map(mapCameraFrame);
}

/**
 * Gets all camera-derived frames for a session/task pair.
 */
export function getCameraFramesByTask(sessionId, taskKey) {
  return getDb()
    .query(
      "SELECT * FROM camera_frames WHERE session_id = ? AND task_key = ? ORDER BY id ASC",
    )
    .all(sessionId, taskKey)
    .map(mapCameraFrame);
}
