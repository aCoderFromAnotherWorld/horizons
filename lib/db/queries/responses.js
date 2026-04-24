import sql from '@/lib/db/index.js';

/**
 * Insert a task response record.
 * @param {{ sessionId: string, chapter: number, level: number, taskKey: string, startedAt: number, responseTimeMs?: number, selection?: any, isCorrect: boolean, attemptNumber: number, scorePoints: number, extraData?: any }} data
 * @returns {Promise<object>}
 */
export async function insertResponse(data) {
  const [row] = await sql`
    INSERT INTO task_responses
      (session_id, chapter, level, task_key, started_at, response_time_ms, selection, is_correct, attempt_number, score_points, extra_data)
    VALUES (
      ${data.sessionId},
      ${data.chapter},
      ${data.level},
      ${data.taskKey},
      ${data.startedAt},
      ${data.responseTimeMs ?? null},
      ${data.selection !== undefined ? sql.json(data.selection) : null},
      ${data.isCorrect},
      ${data.attemptNumber},
      ${data.scorePoints},
      ${data.extraData !== undefined ? sql.json(data.extraData) : null}
    )
    RETURNING id
  `;
  return row;
}

/**
 * Get all task responses for a session.
 * @param {string} sessionId
 * @returns {Promise<object[]>}
 */
export async function getResponsesBySession(sessionId) {
  return sql`
    SELECT * FROM task_responses WHERE session_id = ${sessionId} ORDER BY id ASC
  `;
}
