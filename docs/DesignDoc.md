# Horizons System Design Document

## 1. Architecture Overview

Horizons is a Next.js 15 App Router application with client-heavy gameplay and server-side persistence through API routes. Game pages never import SQLite directly; all database work goes through route handlers.

```text
+-----------------------+
| Browser / Tablet      |
| React Game Pages      |
| Zustand Stores        |
| Framer Motion         |
| Howler Audio          |
+-----------+-----------+
            |
            | fetch()
            v
+-----------------------+
| Next.js App Router    |
| API Route Handlers    |
| Validation + Scoring  |
+-----------+-----------+
            |
            | bun:sqlite
            v
+-----------------------+
| SQLite Database       |
| sessions              |
| task_responses        |
| chapter_scores        |
| red_flags             |
| domain_scores         |
| mouse_movements       |
+-----------------------+
```

Major presentation areas:

- `/`: main menu and onboarding.
- `app/(game)`: chapter hubs, level pages, results.
- `/researcher`: password-gated dashboard and exports.

## 2. Technology Justification

- Next.js 15 App Router: file-based routes, server components, route handlers, production optimization.
- Bun: fast runtime, built-in test runner, native `bun:sqlite`.
- SQLite: local persistence with no external service dependency.
- Zustand: minimal persisted client session and avatar state.
- Tailwind CSS v4: consistent utility styling.
- ShadCN UI patterns: accessible buttons, dialogs, progress, tables, badges, and alerts.
- Framer Motion: animation with reduced-motion support.
- Howler.js: reliable browser audio and preloading.
- @dnd-kit: pointer and touch drag/drop.
- Recharts: researcher-facing charts.

## 3. Component Hierarchy

```text
RootLayout
  Providers
    ErrorBoundary
    MotionConfig
    Home
      SceneBackground
      Dialog
      BigButton
    GameLayout
      ChapterHub
      Chapter Level Pages
        AnimalGuide
        AvatarDisplay
        EmotionFace
        DragDropSortable
        FeedbackOverlay
        SoundPlayer
        SafeImage
    ResultsClient
      ConfettiBlast
      StarRating
    ResearcherLayout
      ResearcherGate
      Dashboard Page
        DashboardCharts
        Table
      Session Detail Page
        SessionCharts
        MouseHeatmap
        Alert
```

## 4. Database ER Diagram

```text
sessions
  id PK
  player_age
  player_name
  started_at
  completed_at
  current_chapter
  current_level
  status
  avatar_data

sessions 1 --- * task_responses
sessions 1 --- * mouse_movements
sessions 1 --- * chapter_scores
sessions 1 --- * red_flags
sessions 1 --- * domain_scores

task_responses
  id PK
  session_id FK -> sessions.id ON DELETE CASCADE
  chapter, level, task_key
  started_at, response_time_ms
  selection, is_correct, attempt_number, score_points, extra_data

mouse_movements
  id PK
  session_id FK -> sessions.id ON DELETE CASCADE
  task_key, x, y, recorded_at

chapter_scores
  id PK
  session_id FK -> sessions.id ON DELETE CASCADE
  chapter_key, raw_points, recorded_at

red_flags
  id PK
  session_id FK -> sessions.id ON DELETE CASCADE
  flag_type, description, severity, recorded_at

domain_scores
  id PK
  session_id FK -> sessions.id ON DELETE CASCADE
  domain, raw_score, max_score, weighted_score, risk_level, calculated_at
  UNIQUE(session_id, domain)
```

SQLite pragmas:

- `journal_mode = WAL`
- `foreign_keys = ON`
- `busy_timeout = 5000`

## 5. Data Flow

```text
Onboarding
  user selects age/name
  POST /api/session
  Zustand stores sessionId
  route to /chapter-1

Gameplay trial
  render stimulus
  start timer
  child responds or timeout occurs
  score helper calculates points
  POST /api/response
  chapter summary POST /api/score
  optional POST /api/flag or /api/mouse

Results
  GET /api/results/[sessionId]
  aggregate chapter_scores by domain
  detect red flags from task_responses
  calculate combined score with multipliers
  upsert domain_scores
  mark session completed
  show child and parent/researcher summary

Researcher
  POST /api/researcher/auth
  sessionStorage stores auth only
  dashboard reads server-side DB data
  export route returns JSON or CSV
```

## 6. Scoring Algorithm

Horizons uses penalty scoring:

```text
0 = no observed concern
higher raw points = stronger observed screening concern
```

Domain weights:

```text
social_communication     0.40
restricted_repetitive    0.30
sensory_processing       0.15
pretend_play             0.15
```

Combined score:

```text
combined = sum(domainRawScore * domainWeight)
```

Red flags apply multiplicatively and cap at 2.0x:

```text
combinedWithFlags = combined * min(product(activeFlagMultipliers), 2.0)
```

Risk thresholds:

```text
0-25   low
26-45  medium
46-65  high
66+    very_high
```

Research formulas:

```text
Emotion accuracy = correct_drops / total_moves
Average attempts = sum_of_attempts / total_questions
```

## 7. Error Handling

- API routes wrap operations in `try/catch` and return JSON errors.
- Database constraints enforce referential integrity.
- Cascading deletes prevent orphan data.
- `SafeImage` shows a placeholder if an image fails.
- Audio hooks unload Howler instances on cleanup.
- A root `ErrorBoundary` isolates client rendering failures and offers retry.

## 8. Accessibility Design

- Default, small, large, and icon buttons use at least 60px touch targets.
- Icon-only controls include aria labels.
- Selected states include text/check indicators or `aria-pressed`.
- Reduced motion is handled through CSS and Framer Motion `MotionConfig`.
- Heatmap canvas includes an accessible label.

## 9. Performance Design

- Mouse tracking samples at most every 100ms and flushes every 500ms.
- Cleanup flushes remaining mouse samples on unmount/pagehide.
- Audio preloads for stimuli.
- Game data is static and imported from `lib/gameData`.
- Scoring helpers are deterministic and unit-tested.
