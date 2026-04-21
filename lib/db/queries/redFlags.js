import { getDb } from "@/lib/db/index.js";

function mapRedFlag(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    flagType: row.flag_type,
    description: row.description,
    severity: row.severity,
    recordedAt: row.recorded_at,
  };
}

/**
 * Adds a red flag row and returns the inserted flag.
 */
export function addRedFlag(data) {
  const result = getDb()
    .query(
      `INSERT INTO red_flags (
        session_id, flag_type, description, severity, recorded_at
      ) VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      data.sessionId,
      data.flagType,
      data.description ?? null,
      data.severity ?? "moderate",
      data.recordedAt || Date.now(),
    );
  const row = getDb()
    .query("SELECT * FROM red_flags WHERE id = ?")
    .get(result.lastInsertRowid);
  return mapRedFlag(row);
}

/**
 * Gets all red flags for a session.
 */
export function getRedFlagsBySession(sessionId) {
  return getDb()
    .query("SELECT * FROM red_flags WHERE session_id = ? ORDER BY id ASC")
    .all(sessionId)
    .map(mapRedFlag);
}
