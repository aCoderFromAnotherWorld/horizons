import sql from '@/lib/db/index.js';

/**
 * Insert a chapter score record.
 * @param {{ sessionId: string, chapterKey: string, rawPoints: number, recordedAt: number }} data
 * @returns {Promise<object>}
 */
export async function insertScore(data) {
  const [row] = await sql`
    INSERT INTO chapter_scores (session_id, chapter_key, raw_points, recorded_at)
    VALUES (${data.sessionId}, ${data.chapterKey}, ${data.rawPoints}, ${data.recordedAt})
    ON CONFLICT (session_id, chapter_key)
    DO UPDATE SET
      raw_points  = chapter_scores.raw_points + EXCLUDED.raw_points,
      recorded_at = EXCLUDED.recorded_at
    RETURNING id
  `;
  return row;
}

/**
 * Get all chapter scores for a session.
 * @param {string} sessionId
 * @returns {Promise<object[]>}
 */
export async function getScoresBySession(sessionId) {
  return sql`
    SELECT * FROM chapter_scores WHERE session_id = ${sessionId} ORDER BY id ASC
  `;
}

/**
 * Get chapter scores for multiple sessions in a single query.
 * @param {string[]} sessionIds
 * @returns {Promise<object[]>}
 */
export async function getScoresBatch(sessionIds) {
  return sql`
    SELECT * FROM chapter_scores WHERE session_id = ANY(${sessionIds})
  `;
}
