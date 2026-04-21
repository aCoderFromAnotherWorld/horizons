import { getDb } from "@/lib/db/index.js";

function mapScore(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    chapterKey: row.chapter_key,
    rawPoints: row.raw_points,
    recordedAt: row.recorded_at,
  };
}

/**
 * Adds a chapter score row and returns the inserted score.
 */
export function addChapterScore(data) {
  const result = getDb()
    .query(
      `INSERT INTO chapter_scores (
        session_id, chapter_key, raw_points, recorded_at
      ) VALUES (?, ?, ?, ?)`,
    )
    .run(
      data.sessionId,
      data.chapterKey,
      data.rawPoints ?? 0,
      data.recordedAt || Date.now(),
    );
  const row = getDb()
    .query("SELECT * FROM chapter_scores WHERE id = ?")
    .get(result.lastInsertRowid);
  return mapScore(row);
}

/**
 * Gets all chapter scores for a session.
 */
export function getScoresBySession(sessionId) {
  return getDb()
    .query("SELECT * FROM chapter_scores WHERE session_id = ? ORDER BY id ASC")
    .all(sessionId)
    .map(mapScore);
}

/**
 * Returns the total raw score for a session/chapter pair.
 */
export function getTotalScoreByChapter(sessionId, chapterKey) {
  const row = getDb()
    .query(
      "SELECT COALESCE(SUM(raw_points), 0) AS total FROM chapter_scores WHERE session_id = ? AND chapter_key = ?",
    )
    .get(sessionId, chapterKey);
  return row.total;
}
