import sql from '@/lib/db/index.js';

/**
 * Insert a red flag record.
 * @param {{ sessionId: string, flagType: string, description?: string, severity?: string, recordedAt: number }} data
 * @returns {Promise<object>}
 */
export async function insertRedFlag(data) {
  const [row] = await sql`
    INSERT INTO red_flags (session_id, flag_type, description, severity, recorded_at)
    VALUES (
      ${data.sessionId},
      ${data.flagType},
      ${data.description ?? null},
      ${data.severity ?? 'moderate'},
      ${data.recordedAt}
    )
    RETURNING id
  `;
  return row;
}

/**
 * Get all red flags for a session.
 * @param {string} sessionId
 * @returns {Promise<object[]>}
 */
export async function getRedFlagsBySession(sessionId) {
  return sql`
    SELECT * FROM red_flags WHERE session_id = ${sessionId} ORDER BY recorded_at ASC
  `;
}
