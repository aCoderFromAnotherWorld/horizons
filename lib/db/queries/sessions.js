import { getDb } from "@/lib/db/index.js";

function parseJson(value) {
  if (!value) return null;
  return JSON.parse(value);
}

function serializeJson(value) {
  if (value === undefined || value === null) return null;
  return JSON.stringify(value);
}

function mapSession(row) {
  if (!row) return null;
  return {
    id: row.id,
    playerAge: row.player_age,
    playerName: row.player_name,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    currentChapter: row.current_chapter,
    currentLevel: row.current_level,
    status: row.status,
    avatarData: parseJson(row.avatar_data),
    cameraEnabled: Boolean(row.camera_enabled),
    cameraConsentAt: row.camera_consent_at,
    cameraConsentVersion: row.camera_consent_version,
  };
}

/**
 * Creates a session row and returns the inserted session.
 */
export function createSession(data = {}) {
  const id = data.id || crypto.randomUUID();
  const startedAt = data.startedAt || Date.now();
  getDb()
    .query(
      `INSERT INTO sessions (
        id, player_age, player_name, started_at, completed_at,
        current_chapter, current_level, status, avatar_data,
        camera_enabled, camera_consent_at, camera_consent_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      data.playerAge ?? null,
      data.playerName ?? null,
      startedAt,
      data.completedAt ?? null,
      data.currentChapter ?? 1,
      data.currentLevel ?? 1,
      data.status ?? "active",
      serializeJson(data.avatarData),
      data.cameraEnabled ? 1 : 0,
      data.cameraConsentAt ?? null,
      data.cameraConsentVersion ?? null,
    );
  return getSession(id);
}

/**
 * Gets a single session by id.
 */
export function getSession(id) {
  const row = getDb().query("SELECT * FROM sessions WHERE id = ?").get(id);
  return mapSession(row);
}

/**
 * Updates known session fields and returns the updated session.
 */
export function updateSession(id, data = {}) {
  const fields = [];
  const values = [];
  const fieldMap = {
    playerAge: "player_age",
    playerName: "player_name",
    completedAt: "completed_at",
    currentChapter: "current_chapter",
    currentLevel: "current_level",
    status: "status",
    cameraConsentAt: "camera_consent_at",
    cameraConsentVersion: "camera_consent_version",
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(data[key]);
    }
  }

  if (data.avatarData !== undefined) {
    fields.push("avatar_data = ?");
    values.push(serializeJson(data.avatarData));
  }

  if (data.cameraEnabled !== undefined) {
    fields.push("camera_enabled = ?");
    values.push(data.cameraEnabled ? 1 : 0);
  }

  if (!fields.length) return getSession(id);

  values.push(id);
  getDb()
    .query(`UPDATE sessions SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
  return getSession(id);
}

/**
 * Lists all sessions ordered by newest first.
 */
export function listSessions() {
  return getDb()
    .query("SELECT * FROM sessions ORDER BY started_at DESC")
    .all()
    .map(mapSession);
}

/**
 * Deletes a session by id.
 */
export function deleteSession(id) {
  return getDb().query("DELETE FROM sessions WHERE id = ?").run(id).changes;
}
