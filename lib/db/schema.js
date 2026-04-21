// ALL table definitions as SQL strings
export const SCHEMA = `

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,
  player_age  INTEGER,
  player_name TEXT,
  started_at  INTEGER NOT NULL,
  completed_at INTEGER,
  current_chapter INTEGER DEFAULT 1,
  current_level   INTEGER DEFAULT 1,
  status      TEXT DEFAULT 'active',  -- active | completed | abandoned
  avatar_data TEXT                    -- JSON blob: hair, clothes, colors
);

CREATE TABLE IF NOT EXISTS task_responses (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id      TEXT    NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  chapter         INTEGER NOT NULL,
  level           INTEGER NOT NULL,
  task_key        TEXT    NOT NULL,
  started_at      INTEGER NOT NULL,
  response_time_ms INTEGER,
  selection       TEXT,               -- JSON: what was clicked/selected
  is_correct      INTEGER DEFAULT 0,  -- 0 or 1
  attempt_number  INTEGER DEFAULT 1,
  score_points    INTEGER DEFAULT 0,
  extra_data      TEXT                -- JSON: any task-specific metadata
);

CREATE TABLE IF NOT EXISTS mouse_movements (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT    NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  task_key    TEXT    NOT NULL,
  x           REAL    NOT NULL,
  y           REAL    NOT NULL,
  recorded_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS chapter_scores (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT    NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  chapter_key TEXT    NOT NULL,  -- e.g., 'ch2_emotion'
  raw_points  INTEGER DEFAULT 0,
  recorded_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS red_flags (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  flag_type   TEXT NOT NULL,
  description TEXT,
  severity    TEXT DEFAULT 'moderate',  -- mild | moderate | severe
  recorded_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS domain_scores (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id     TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  domain         TEXT NOT NULL,  -- social_comm | restricted_rep | sensory | pretend
  raw_score      REAL,
  max_score      REAL,
  weighted_score REAL,
  risk_level     TEXT,  -- low | medium | high | very_high
  calculated_at  INTEGER NOT NULL,
  UNIQUE(session_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_task_responses_session ON task_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_mouse_session ON mouse_movements(session_id);
CREATE INDEX IF NOT EXISTS idx_chapter_scores_session ON chapter_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_red_flags_session ON red_flags(session_id);
`;
