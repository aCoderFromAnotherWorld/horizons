CREATE TABLE IF NOT EXISTS game_sessions (
  id              TEXT PRIMARY KEY,
  player_age      INTEGER NOT NULL CHECK (player_age BETWEEN 3 AND 10),
  player_name     TEXT,
  guide_choice    TEXT,
  sensory_level   TEXT NOT NULL DEFAULT 'medium',
  started_at      BIGINT NOT NULL,
  completed_at    BIGINT,
  current_chapter INTEGER NOT NULL DEFAULT 1,
  current_level   INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'active',
  avatar_data     JSONB,
  report_token    TEXT,
  break_count     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS task_responses (
  id               SERIAL PRIMARY KEY,
  session_id       TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  chapter          INTEGER NOT NULL,
  level            INTEGER NOT NULL,
  task_key         TEXT NOT NULL,
  started_at       BIGINT NOT NULL,
  response_time_ms INTEGER,
  selection        JSONB,
  is_correct       BOOLEAN NOT NULL DEFAULT false,
  attempt_number   INTEGER NOT NULL DEFAULT 1,
  score_points     INTEGER NOT NULL DEFAULT 0,
  extra_data       JSONB
);
CREATE INDEX IF NOT EXISTS idx_task_responses_session ON task_responses(session_id);

CREATE TABLE IF NOT EXISTS mouse_movements (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  task_key    TEXT NOT NULL,
  x           REAL NOT NULL,
  y           REAL NOT NULL,
  recorded_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_mouse_session ON mouse_movements(session_id);

CREATE TABLE IF NOT EXISTS chapter_scores (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  chapter_key TEXT NOT NULL,
  raw_points  INTEGER NOT NULL DEFAULT 0,
  recorded_at BIGINT NOT NULL,
  UNIQUE (session_id, chapter_key)
);
CREATE INDEX IF NOT EXISTS idx_chapter_scores_session ON chapter_scores(session_id);

CREATE TABLE IF NOT EXISTS red_flags (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  flag_type   TEXT NOT NULL,
  description TEXT,
  severity    TEXT NOT NULL DEFAULT 'moderate',
  recorded_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_red_flags_session ON red_flags(session_id);

CREATE TABLE IF NOT EXISTS domain_scores (
  id             SERIAL PRIMARY KEY,
  session_id     TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  domain         TEXT NOT NULL,
  raw_score      REAL,
  max_score      REAL,
  weighted_score REAL,
  risk_level     TEXT,
  calculated_at  BIGINT NOT NULL,
  UNIQUE (session_id, domain)
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id           SERIAL PRIMARY KEY,
  name         TEXT,
  email        TEXT NOT NULL,
  role         TEXT,
  message      TEXT NOT NULL,
  submitted_at BIGINT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS survey_responses (
  id              SERIAL PRIMARY KEY,
  game_session_id TEXT REFERENCES game_sessions(id) ON DELETE SET NULL,
  role            TEXT,
  rating          INTEGER CHECK (rating BETWEEN 1 AND 5),
  feedback        TEXT,
  submitted_at    BIGINT NOT NULL
);
