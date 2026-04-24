import sql from '@/lib/db/index.js';

/**
 * Insert a survey response.
 * @param {{ gameSessionId?: string, role?: string, rating?: number, feedback?: string, submittedAt: number }} data
 * @returns {Promise<object>}
 */
export async function insertSurvey(data) {
  const [row] = await sql`
    INSERT INTO survey_responses (game_session_id, role, rating, feedback, submitted_at)
    VALUES (
      ${data.gameSessionId ?? null},
      ${data.role ?? null},
      ${data.rating ?? null},
      ${data.feedback ?? null},
      ${data.submittedAt}
    )
    RETURNING id
  `;
  return row;
}

/**
 * List all survey responses, newest first.
 * @returns {Promise<object[]>}
 */
export async function listSurveys() {
  return sql`SELECT * FROM survey_responses ORDER BY submitted_at DESC`;
}
