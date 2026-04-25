import sql from '@/lib/db/index.js';

/**
 * Create a new game session.
 * @param {{ id: string, playerAge: number, playerName?: string, guideChoice?: string, sensoryLevel: string, startedAt: number, avatarData?: object }} data
 * @returns {Promise<object>}
 */
export async function createSession(data) {
  const [row] = await sql`
    INSERT INTO game_sessions (id, player_age, player_name, guide_choice, sensory_level, started_at, avatar_data)
    VALUES (
      ${data.id},
      ${data.playerAge},
      ${data.playerName ?? null},
      ${data.guideChoice ?? null},
      ${data.sensoryLevel},
      ${data.startedAt},
      ${data.avatarData ? sql.json(data.avatarData) : null}
    )
    RETURNING *
  `;
  return row;
}

/**
 * Fetch a single game session by id.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function getSession(id) {
  const [row] = await sql`SELECT * FROM game_sessions WHERE id = ${id}`;
  return row ?? null;
}

/**
 * Update mutable fields on a game session.
 * @param {string} id
 * @param {{ currentChapter?: number, currentLevel?: number, status?: string, completedAt?: number, avatarData?: object, reportToken?: string }} updates
 * @returns {Promise<object>}
 */
export async function updateSession(id, updates) {
  const patch = {};
  if (updates.currentChapter !== undefined) patch.current_chapter = updates.currentChapter;
  if (updates.currentLevel !== undefined)   patch.current_level   = updates.currentLevel;
  if (updates.status !== undefined)         patch.status          = updates.status;
  if (updates.completedAt !== undefined)    patch.completed_at    = updates.completedAt;
  if (updates.reportToken !== undefined)    patch.report_token    = updates.reportToken;
  if (updates.avatarData !== undefined)     patch.avatar_data     = sql.json(updates.avatarData);
  if (updates.breakCount !== undefined)     patch.break_count     = updates.breakCount;

  if (Object.keys(patch).length === 0) return getSession(id);

  const [row] = await sql`
    UPDATE game_sessions SET ${sql(patch)} WHERE id = ${id} RETURNING *
  `;
  return row;
}

/**
 * List all game sessions, newest first.
 * @returns {Promise<object[]>}
 */
export async function listAllSessions() {
  return sql`SELECT * FROM game_sessions ORDER BY started_at DESC`;
}

/**
 * Delete a game session and cascade-delete all related rows.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteSession(id) {
  await sql`DELETE FROM game_sessions WHERE id = ${id}`;
}
