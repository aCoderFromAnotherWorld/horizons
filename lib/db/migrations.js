function getColumns(db, tableName) {
  return new Set(
    db
      .query(`PRAGMA table_info(${tableName})`)
      .all()
      .map((column) => column.name),
  );
}

function addColumnIfMissing(db, tableName, columnName, definition) {
  const columns = getColumns(db, tableName);
  if (!columns.has(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`);
  }
}

/**
 * Runs additive database migrations for existing SQLite files.
 */
export function runMigrations(db) {
  addColumnIfMissing(
    db,
    "sessions",
    "camera_enabled",
    "camera_enabled INTEGER DEFAULT 0",
  );
  addColumnIfMissing(
    db,
    "sessions",
    "camera_consent_at",
    "camera_consent_at INTEGER",
  );
  addColumnIfMissing(
    db,
    "sessions",
    "camera_consent_version",
    "camera_consent_version TEXT",
  );

  console.log("DB ready");
}
