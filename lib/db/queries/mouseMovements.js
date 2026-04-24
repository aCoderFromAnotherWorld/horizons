import sql from '@/lib/db/index.js';

/**
 * Insert a batch of mouse/touch movement records.
 * @param {string} sessionId
 * @param {string} taskKey
 * @param {{ x: number, y: number, t: number }[]} movements
 * @returns {Promise<void>}
 */
export async function insertMouseBatch(sessionId, taskKey, movements) {
  if (movements.length === 0) return;
  const rows = movements.map((m) => ({
    session_id:  sessionId,
    task_key:    taskKey,
    x:           m.x,
    y:           m.y,
    recorded_at: m.t,
  }));
  await sql`INSERT INTO mouse_movements ${sql(rows)}`;
}

/**
 * Get all mouse movements for a session.
 * @param {string} sessionId
 * @returns {Promise<object[]>}
 */
export async function getMouseBySession(sessionId) {
  return sql`
    SELECT * FROM mouse_movements WHERE session_id = ${sessionId} ORDER BY recorded_at ASC
  `;
}
