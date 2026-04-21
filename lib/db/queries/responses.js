import { getDb } from "@/lib/db/index.js";

function parseJson(value) {
  if (!value) return null;
  return JSON.parse(value);
}

function serializeJson(value) {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function mapResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    chapter: row.chapter,
    level: row.level,
    taskKey: row.task_key,
    startedAt: row.started_at,
    responseTimeMs: row.response_time_ms,
    selection: parseJson(row.selection),
    isCorrect: Boolean(row.is_correct),
    attemptNumber: row.attempt_number,
    scorePoints: row.score_points,
    extraData: parseJson(row.extra_data),
  };
}

/**
 * Creates a task response and returns the inserted row.
 */
export function createResponse(data) {
  const result = getDb()
    .query(
      `INSERT INTO task_responses (
        session_id, chapter, level, task_key, started_at, response_time_ms,
        selection, is_correct, attempt_number, score_points, extra_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      data.sessionId,
      data.chapter,
      data.level,
      data.taskKey,
      data.startedAt,
      data.responseTimeMs ?? null,
      serializeJson(data.selection),
      data.isCorrect ? 1 : 0,
      data.attemptNumber ?? 1,
      data.scorePoints ?? 0,
      serializeJson(data.extraData),
    );
  const row = getDb()
    .query("SELECT * FROM task_responses WHERE id = ?")
    .get(result.lastInsertRowid);
  return mapResponse(row);
}

/**
 * Gets all task responses for a session.
 */
export function getResponsesBySession(sessionId) {
  return getDb()
    .query("SELECT * FROM task_responses WHERE session_id = ? ORDER BY id ASC")
    .all(sessionId)
    .map(mapResponse);
}

/**
 * Gets all task responses for a session and task key.
 */
export function getResponsesByTask(sessionId, taskKey) {
  return getDb()
    .query(
      "SELECT * FROM task_responses WHERE session_id = ? AND task_key = ? ORDER BY id ASC",
    )
    .all(sessionId, taskKey)
    .map(mapResponse);
}
