import { getDb } from "@/lib/db/index.js";

function mapMovement(row) {
  if (!row) return null;
  return {
    id: row.id,
    sessionId: row.session_id,
    taskKey: row.task_key,
    x: row.x,
    y: row.y,
    recordedAt: row.recorded_at,
  };
}

/**
 * Inserts a batch of mouse movement rows.
 */
export function batchInsertMouseMovements(movements = []) {
  if (!movements.length) return 0;
  const insert = getDb().query(
    `INSERT INTO mouse_movements (
      session_id, task_key, x, y, recorded_at
    ) VALUES (?, ?, ?, ?, ?)`,
  );
  const insertMany = getDb().transaction((rows) => {
    for (const row of rows) {
      insert.run(
        row.sessionId,
        row.taskKey,
        row.x,
        row.y,
        row.recordedAt ?? row.t ?? Date.now(),
      );
    }
  });
  insertMany(movements);
  return movements.length;
}

/**
 * Gets all mouse movement rows for a session.
 */
export function getMovementsBySession(sessionId) {
  return getDb()
    .query("SELECT * FROM mouse_movements WHERE session_id = ? ORDER BY id ASC")
    .all(sessionId)
    .map(mapMovement);
}
