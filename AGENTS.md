# HORIZONS — Codex Development Reference

> **ASD Screening Game** | Next.js 15 · Tailwind CSS v4 · ShadCN UI · SQLite3 (bun:sqlite) · Bun

---

## 0. QUICK REFERENCE

| Parameter      | Value                                                            |
| -------------- | ---------------------------------------------------------------- |
| Project Name   | horizons                                                         |
| Runtime        | Bun (latest)                                                     |
| Framework      | Next.js 15 (App Router, JavaScript only — NO TypeScript)         |
| Styling        | Tailwind CSS v4 (no raw CSS files except globals.css)            |
| UI Components  | ShadCN UI                                                        |
| Database       | SQLite3 via `bun:sqlite` (native, no ORM)                        |
| State          | Zustand                                                          |
| Animation      | Framer Motion                                                    |
| Audio          | Howler.js                                                        |
| Drag & Drop    | @dnd-kit/core                                                    |
| Testing        | Bun test runner (built-in)                                       |
| Target Users   | Children aged 3–10                                               |
| Purpose        | ASD indicator screening via gameplay-based behavioral assessment |
| Total Duration | 75–90 minutes                                                    |
| Viewport       | 1280×768 minimum, responsive                                     |

---

## 1. RESEARCH FOUNDATION

This project's scoring and game mechanics are grounded in three peer-reviewed sources:

### 1.1 ADOS-2 (Maddox et al., 2017)

- Gold-standard ASD observational measure
- Two core domains: **Social Communication (SC)** and **Restricted/Repetitive Behaviors (RRB)**
- SC scores alone produce false positives; RRB domain is the key differentiator
- Our game mirrors this split: SC chapters (2, 3, 8) and RRB chapters (4, 7)
- Developmental history context must accompany any score — game is **screening only**

### 1.2 Serious Game for ASD Vocabulary (Khowaja & Salim, 2018)

- Discrete Trial Training (DTT) as the core instruction method
- Record: number of correct responses AND number of attempts
- Score formula per task: `accuracy = correct_responses / total_responses`
- Attempt formula: `avg_attempts = sum_of_attempts / total_questions`
- Single-subject research design: baseline → intervention → maintenance phases

### 1.3 EmoGalaxy Emotion Screening (Irani et al., 2018)

- Emotion recognition game achieved **93% screening accuracy** using SVM
- Score per game: `score = number_of_true_answers / number_of_moves`
- Key finding: emotion detection tasks (sea/snowball) > emotion expression for screening
- Negative emotions (sadness, fear) show greater ASD vs. typical difference
- Statistical validation: Kruskal-Wallis test confirmed group separation

### 1.4 Scoring Philosophy

- **Lower raw score = better** (penalty-based: 0 = no concern)
- Research-backed thresholds mapped to domain risk levels
- **Non-diagnostic** — always output "consult a specialist" alongside results
- GDPR-style: no personal identifiers stored (anonymous session IDs)

---

## 2. TECH STACK — EXACT PACKAGES

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "framer-motion": "^11.0.0",
    "howler": "^2.2.4",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "uuid": "^10.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.1",
    "recharts": "^2.13.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.20",
    "@types/howler": "^2.2.12"
  }
}
```

**ShadCN components to install (run during Phase 1):**

```
button, card, dialog, badge, progress, slider, tabs,
toast, tooltip, separator, scroll-area, avatar, alert
```

---

## 3. DIRECTORY STRUCTURE

```
horizons/
├── app/
│   ├── (game)/
│   │   ├── layout.jsx               # Game shell (progress bar, back button)
│   │   ├── chapter-1/
│   │   │   ├── page.jsx             # Chapter 1 hub
│   │   │   ├── level-1/page.jsx     # Avatar Creation
│   │   │   └── level-2/page.jsx     # Following the Guide
│   │   ├── chapter-2/
│   │   │   ├── page.jsx
│   │   │   ├── level-1/page.jsx     # Emotion Matching Garden
│   │   │   ├── level-2/page.jsx     # Emotion Expression Mirror
│   │   │   └── level-3/page.jsx     # Emotion Regulation Scenarios
│   │   ├── chapter-3/
│   │   │   ├── page.jsx
│   │   │   ├── level-1/page.jsx     # Greeting Sequence
│   │   │   ├── level-2/page.jsx     # Conversation Turn-Taking
│   │   │   └── level-3/page.jsx     # Sharing & Joint Attention
│   │   ├── chapter-4/
│   │   │   ├── page.jsx
│   │   │   ├── level-1/page.jsx     # Morning Routine Sequence
│   │   │   ├── level-2/page.jsx     # Playground Equipment Choice
│   │   │   └── level-3/page.jsx     # Unexpected Events Response
│   │   ├── chapter-5/
│   │   │   ├── page.jsx
│   │   │   ├── level-1/page.jsx     # Pretend Play Recognition
│   │   │   └── level-2/page.jsx     # Create Your Own Pretend Play
│   │   ├── chapter-6/
│   │   │   ├── page.jsx
│   │   │   ├── level-1/page.jsx     # Sound Sensitivity
│   │   │   ├── level-2/page.jsx     # Visual Sensitivity
│   │   │   └── level-3/page.jsx     # Texture Preferences
│   │   ├── chapter-7/
│   │   │   ├── page.jsx
│   │   │   ├── level-1/page.jsx     # Pattern Completion
│   │   │   ├── level-2/page.jsx     # Repetitive Behavior Recognition
│   │   │   └── level-3/page.jsx     # Special Interest Intensity
│   │   ├── chapter-8/
│   │   │   ├── page.jsx
│   │   │   ├── level-1/page.jsx     # Simple Action Imitation
│   │   │   └── level-2/page.jsx     # Sequential Imitation
│   │   └── chapter-9/
│   │       └── page.jsx             # Assessment Summary
│   ├── researcher/
│   │   ├── layout.jsx
│   │   ├── page.jsx                 # Dashboard overview
│   │   ├── session/[id]/page.jsx    # Individual session detail
│   │   └── export/route.js          # CSV/JSON export endpoint
│   ├── api/
│   │   ├── session/
│   │   │   ├── route.js             # POST create session, GET list
│   │   │   └── [id]/route.js        # GET/PATCH/DELETE session
│   │   ├── response/route.js        # POST log task response
│   │   ├── score/route.js           # POST add score
│   │   ├── mouse/route.js           # POST log mouse batch
│   │   ├── flag/route.js            # POST add red flag
│   │   └── results/[sessionId]/route.js  # GET full results
│   ├── layout.jsx                   # Root layout
│   ├── page.jsx                     # Main menu
│   └── globals.css                  # Tailwind v4 @import only
├── components/
│   ├── ui/                          # ShadCN auto-generated
│   ├── game/
│   │   ├── GameShell.jsx            # Chapter wrapper with progress
│   │   ├── TaskTimer.jsx            # Invisible response-time tracker
│   │   ├── AvatarDisplay.jsx        # Customizable child avatar
│   │   ├── EmotionFace.jsx          # Renders emotion face sprite
│   │   ├── AnimalGuide.jsx          # Animated guide character
│   │   ├── SceneBackground.jsx      # Full-bleed background image
│   │   ├── FeedbackOverlay.jsx      # Correct/wrong animation overlay
│   │   ├── ProgressBar.jsx          # Chapter/overall progress
│   │   ├── DragDropSortable.jsx     # Wrapper around @dnd-kit
│   │   └── SoundPlayer.jsx          # Howler.js wrapper component
│   └── shared/
│       ├── BigButton.jsx            # Large touch-friendly button
│       ├── StarRating.jsx           # 0-5 star display
│       └── ConfettiBlast.jsx        # Celebration animation
├── lib/
│   ├── db/
│   │   ├── index.js                 # Singleton DB connection (bun:sqlite)
│   │   ├── schema.js                # CREATE TABLE statements
│   │   ├── migrations.js            # Run migrations on startup
│   │   └── queries/
│   │       ├── sessions.js
│   │       ├── responses.js
│   │       ├── scores.js
│   │       ├── mouseMovements.js
│   │       ├── redFlags.js
│   │       └── domainScores.js
│   ├── scoring/
│   │   ├── engine.js                # Main scoring calculator
│   │   ├── domains.js               # Domain aggregation & weighting
│   │   ├── redFlags.js              # Red flag detection logic
│   │   └── thresholds.js            # Risk level constants
│   ├── gameData/
│   │   ├── chapter1.js              # Static content for ch1
│   │   ├── chapter2.js              # Emotion stimuli data
│   │   ├── chapter3.js
│   │   ├── chapter4.js
│   │   ├── chapter5.js
│   │   ├── chapter6.js
│   │   ├── chapter7.js
│   │   ├── chapter8.js
│   │   └── chapter9.js              # Sampled task pool
│   └── utils.js                     # cn(), formatTime(), generateId()
├── store/
│   ├── gameStore.js                 # Zustand: session, chapter, level
│   └── avatarStore.js               # Zustand: avatar customization state
├── hooks/
│   ├── useTaskTimer.js              # Start/stop response timer
│   ├── useMouseTracker.js           # Mouse position at 100ms intervals
│   └── useAudio.js                  # Howler wrapper hook
├── public/
│   └── assets/
│       ├── characters/              # Avatar parts, guide animals
│       ├── backgrounds/             # Chapter backgrounds (27+ scenes)
│       ├── emotions/                # Emotion face images
│       ├── objects/                 # Daily objects, toys, food, etc.
│       ├── sounds/                  # Sound effects, ambient, voice
│       ├── ui/                      # Icons, buttons, decorative
│       └── patterns/                # Pattern sequences for Ch7
├── tests/
│   ├── unit/
│   │   ├── scoring.test.js
│   │   ├── redFlags.test.js
│   │   ├── db.test.js
│   │   └── utils.test.js
│   └── integration/
│       ├── api.test.js
│       └── scoring-pipeline.test.js
├── docs/
│   ├── SRS.md                       # System Requirements Specification
│   ├── DesignDoc.md                 # Architecture & design decisions
│   └── UserManual.md                # How to use the game
├── next.config.js
├── tailwind.config.js               # v4 minimal config
├── components.json                  # ShadCN config
├── package.json
├── bunfig.toml                      # Bun config
└── AGENTS.md                        # This file
```

---

## 4. DATABASE SCHEMA

File: `lib/db/schema.js`

```js
// ALL table definitions as SQL strings
export const SCHEMA = `

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

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
```

---

## 5. DATABASE CONNECTION

File: `lib/db/index.js`

```js
import { Database } from "bun:sqlite";
import { SCHEMA } from "./schema.js";
import { runMigrations } from "./migrations.js";

let db;

export function getDb() {
  if (!db) {
    db = new Database("./horizons.db", { create: true });
    db.exec(SCHEMA);
    runMigrations(db);
  }
  return db;
}
```

**IMPORTANT:** `bun:sqlite` is server-side only. Never import `lib/db` in client components. Use API routes or Server Actions exclusively for all DB operations.

---

## 6. GAME STATE (ZUSTAND)

File: `store/gameStore.js`

```js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Session
      sessionId: null,
      playerAge: null,
      playerName: null,

      // Navigation
      currentChapter: 1,
      currentLevel: 1,

      // In-memory scores (synced to DB via API)
      scores: {}, // { 'ch2_emotion': 12, ... }
      redFlags: [],
      domainScores: {},

      // Helpers
      setSession: (id, age, name) =>
        set({ sessionId: id, playerAge: age, playerName: name }),

      goToChapter: (chapter, level = 1) =>
        set({ currentChapter: chapter, currentLevel: level }),

      addScore: (key, points) =>
        set((s) => ({
          scores: { ...s.scores, [key]: (s.scores[key] || 0) + points },
        })),

      addRedFlag: (flag) => set((s) => ({ redFlags: [...s.redFlags, flag] })),

      reset: () =>
        set({
          sessionId: null,
          playerAge: null,
          playerName: null,
          currentChapter: 1,
          currentLevel: 1,
          scores: {},
          redFlags: [],
          domainScores: {},
        }),
    }),
    { name: "horizons-game-store" },
  ),
);
```

---

## 7. SCORING ENGINE

File: `lib/scoring/engine.js`

### 7.1 Domain Weights (research-backed)

```js
export const DOMAIN_WEIGHTS = {
  social_communication: 0.4, // Chapters 2, 3, 8  — aligned with ADOS-2 SC domain
  restricted_repetitive: 0.3, // Chapters 4, 7     — aligned with ADOS-2 RRB domain
  sensory_processing: 0.15, // Chapter 6
  pretend_play: 0.15, // Chapter 5
};

export const DOMAIN_MAX_POINTS = {
  social_communication: 100,
  restricted_repetitive: 70,
  sensory_processing: 30,
  pretend_play: 40,
};
```

### 7.2 Chapter → Domain Mapping

```js
export const CHAPTER_TO_DOMAIN = {
  ch1_baseline: null, // Baseline only, not scored in domain
  ch2_emotion: "social_communication",
  ch3_social: "social_communication",
  ch4_executive: "restricted_repetitive",
  ch5_pretend: "pretend_play",
  ch6_sensory: "sensory_processing",
  ch7_pattern: "restricted_repetitive",
  ch8_imitation: "social_communication",
  ch9_summary: null, // Consistency check only
};
```

### 7.3 Risk Thresholds

```js
export const DOMAIN_THRESHOLDS = {
  social_communication: {
    low: [0, 20],
    medium: [21, 45],
    high: [46, 65],
    very_high: [66, Infinity],
  },
  restricted_repetitive: {
    low: [0, 15],
    medium: [16, 30],
    high: [31, Infinity],
  },
  sensory_processing: {
    low: [0, 8],
    medium: [9, 15],
    high: [16, Infinity],
  },
  pretend_play: {
    low: [0, 10],
    medium: [11, 20],
    high: [21, Infinity],
  },
};

export const COMBINED_THRESHOLDS = {
  low: [0, 25],
  medium: [26, 45],
  high: [46, 65],
  very_high: [66, Infinity],
};
```

### 7.4 Red Flag Multipliers

```js
export const RED_FLAG_MULTIPLIERS = {
  negative_emotion_recognition_under_50: 1.2,
  complete_absence_pretend_play: 1.3,
  extreme_sensory_4plus_distressing_sounds: 1.15,
  rigid_pattern_plus_distress_at_change: 1.2,
  poor_imitation_all_modalities: 1.25,
};
```

### 7.5 Main Calculator

```js
export function calculateCombinedScore(domainRawScores, activeRedFlags) {
  // domainRawScores: { social_communication: 35, restricted_repetitive: 18, ... }

  let combined = 0;
  for (const [domain, weight] of Object.entries(DOMAIN_WEIGHTS)) {
    combined += (domainRawScores[domain] || 0) * weight;
  }

  // Apply red flag multipliers (stack multiplicatively, cap at 2.0x)
  let multiplier = 1.0;
  for (const flag of activeRedFlags) {
    if (RED_FLAG_MULTIPLIERS[flag]) {
      multiplier *= RED_FLAG_MULTIPLIERS[flag];
    }
  }
  multiplier = Math.min(multiplier, 2.0);
  combined *= multiplier;

  return Math.round(combined * 10) / 10;
}

export function getRiskLevel(combined) {
  if (combined <= 25) return "low";
  if (combined <= 45) return "medium";
  if (combined <= 65) return "high";
  return "very_high";
}

export function getDomainRisk(domain, rawScore) {
  const thresholds = DOMAIN_THRESHOLDS[domain];
  for (const [level, [min, max]] of Object.entries(thresholds)) {
    if (rawScore >= min && rawScore <= max) return level;
  }
  return "unknown";
}

// EmoGalaxy-style accuracy score (Irani et al., 2018)
export function calcGameAccuracy(correctResponses, totalMoves) {
  if (!totalMoves) return 0;
  return correctResponses / totalMoves;
}

// DTT-style avg attempts (Khowaja & Salim, 2018)
export function calcAvgAttempts(sumOfAttempts, totalQuestions) {
  if (!totalQuestions) return 0;
  return sumOfAttempts / totalQuestions;
}
```

---

## 8. CHAPTER SPECIFICATIONS

### CHAPTER 1 — Welcome to My World (5–7 min)

**Purpose:** Baseline & Response to Name | **Domain:** Baseline (not scored in combined)

#### Level 1 — Avatar Creation & Name Response

**Mechanics:**

1. Child customizes avatar (4 hair styles, 4 clothes styles, 6 color options each)
2. Guide character calls child's name 3× at 5-second intervals
3. Child must click the guide character to "respond"

**Scoring:**

```
Response to name scoring:
< 2 seconds to respond     → 0 pts
2–5 seconds                → 1 pt
> 5 seconds OR no response → 2 pts
Each attempt needed        → +1 pt

ASD Indicator: M-CHAT #10 (Response to name)
```

**Data collected:**

- Avatar selections (hair, clothes, colors) → stored in sessions.avatar_data
- Time from name-call to click (3 trials)
- Total name-response score

**Task keys:** `ch1_name_1`, `ch1_name_2`, `ch1_name_3`

#### Level 2 — Following the Guide

**Mechanics:**

1. Guide animal points to 5 objects on screen one at a time
2. Child must click the object being pointed to (not the guide's hand)

**Scoring:**

```
All 5 correct first try      → 0 pts
Needs verbal prompt          → 1 pt each
Clicks finger vs target      → 2 pts each  (clicking the pointing hand instead)
Random clicking / ignoring   → 3 pts

ASD Indicator: Joint attention deficit
```

**Task keys:** `ch1_guide_1` through `ch1_guide_5`

---

### CHAPTER 2 — Emotion Island (10–15 min)

**Purpose:** Emotion Recognition & Expression | **Domain:** social_communication

#### Level 1 — Emotion Matching Garden

**Mechanics:**

- 4 flower beds labeled: Happy, Sad, Angry, Scared
- Phase 1: 12 face cards (3 per emotion — child face, adult face, animal face) → drag to correct bed
- Phase 2: 8 scenario cards (contextual emotion situations) → drag to bed

**Scoring:**

```
Accuracy > 90%             → 0 pts
70–90%                     → 1 pt
50–70%                     → 2 pts
< 50%                      → 3 pts
Negative emotions < 80%    → +2 pts  (RED FLAG candidate)
Fear/Sad confusion > 25%   → +2 pts

Note (Irani et al.): ASD children less sensitive to negative emotions (sadness, fear)
Task accuracy: score = correct_drags / total_items (EmoGalaxy formula)
```

**Red flag:** If negative emotion accuracy < 50% → add flag `negative_emotion_recognition_under_50`

#### Level 2 — Emotion Expression Mirror

**Mechanics:**

- 16 trials (4 per emotion)
- Show emotion label + voice audio
- Child selects from 6 face options (grid)

**Scoring:**

```
Correct emotion selected      → 0 pts
Intensity error (e.g., slightly vs very happy) → 1 pt
Neutral when emotion requested → 2 pts
Opposite emotion              → 3 pts
```

#### Level 3 — Emotion Regulation Scenarios

**Mechanics:**

- 6 scenarios presented as animated vignettes:
  1. Ice cream drops 2. Toy taken by another child 3. Loud sudden noise
  2. Lost item 5. Broken toy 6. Peer conflict
- 3 response options per scenario: appropriate / avoidant / aggressive

**Scoring:**

```
Appropriate response   → 0 pts
Avoidant response      → 2 pts
Aggressive response    → 3 pts
Decision time > 15 sec → +1 pt per slow decision
```

---

### CHAPTER 3 — Friend's House Visit (12–15 min)

**Purpose:** Social Communication | **Domain:** social_communication

#### Level 1 — Greeting Sequence

**Mechanics:**

- Animated sequence: knock on door → door opens → friend appears
- Child must: (a) click to wave, (b) click when guide smiles to reciprocate, (c) click friend's face to make eye contact

**Scoring:**

```
No greeting initiated       → 3 pts
No wave/smile reciprocation → 2 pts
Eye contact click delay > 4s → 2 pts

ASD Indicator: M-CHAT #11 (Social reciprocity)
```

#### Level 2 — Conversation Turn-Taking

**Mechanics:**

- 8 exchanges with friend character
- Each exchange shows 3–4 response options
- Child clicks their choice

**Scoring:**

```
Off-topic response (restricted interest topic) → 3 pts
Overly literal when social expected            → 2 pts
No response within 10 seconds                  → 2 pts
Pattern: ALWAYS picks factual over emotional   → +5 pts (if ≥6/8 factual)
```

#### Level 3 — Sharing & Joint Attention

**Mechanics:**

- 5 "discovery events" occur during play scene
- Friend finds something → points → child must click what friend is pointing at
- Child finds something → button appears to "share with friend" or "keep"

**Scoring:**

```
Doesn't attend to friend's discovery → 2 pts each
Doesn't share own discovery         → 2 pts each
Excessive factual detail vs sharing  → 1 pt each

ASD Indicators: M-CHAT #9 (showing to share), M-CHAT #16 (joint attention)
```

---

### CHAPTER 4 — Daily Routines Village (10–12 min)

**Purpose:** Executive Function & Cognitive Flexibility | **Domain:** restricted_repetitive

#### Level 1 — Morning Routine Sequence

**Mechanics:**

- 6 activity cards must be drag-drop sorted into correct order:
  Wake Up → Brush Teeth → Get Dressed → Eat Breakfast → Pack Bag → Put On Shoes
- After correct sort: "Oh no! The clean shirt is in the wash!" → child selects response

**Scoring:**

```
Each sequence error          → 1 pt each
Cannot complete after 3 tries → 3 pts
Rigid response to disruption  → 3 pts (e.g., "I can't get dressed")
Flexible response             → 0 pts (e.g., "wear a different shirt")
Response time to disruption > 10s → 1 pt
```

#### Level 2 — Playground Equipment Choice

**Mechanics:**

- Scene shows 5 activities (slide, swings, sandbox, climbing frame, see-saw)
- Child selects one → animated sequence plays → "Time to try something new!" appears × 4

**Scoring:**

```
Selects same activity 3+ times  → 3 pts
Transition delay > 8 seconds    → 2 pts
Exact same sequence every loop  → 2 pts
```

#### Level 3 — Unexpected Events Response

**Mechanics:**

- 4 scenarios (path blocked by construction, library is closed, favourite food sold out, rain cancels outdoor plan)
- Select from 3 responses per scenario

**Scoring:**

```
Flexible/creative response  → 0 pts
Distress response            → 2 pts
Rigid/refusal response       → 3 pts
Response time > 12 seconds   → +1 pt per scenario
```

---

### CHAPTER 5 — Pretend Play Theater (8–10 min)

**Purpose:** Symbolic Play & Imagination | **Domain:** pretend_play

#### Level 1 — Pretend Play Recognition

**Mechanics:**

- 5 short animations play:
  1. Banana used as a phone
  2. Empty pot being stirred
  3. Child feeding a teddy bear
  4. Block being driven like a car
  5. Empty cup drinking
- After each, child selects: "They're pretending!" OR literal interpretation option

**Scoring:**

```
Literal response when pretend is obvious → 2 pts each
No response (timeout)                    → 1 pt each
All 5 literal                           → +3 pts (RED FLAG: complete_absence_pretend_play)

ASD Indicator: M-CHAT #3 (Pretend play deficit)
```

**Red flag:** If all 5 literal → add flag `complete_absence_pretend_play`

#### Level 2 — Create Your Own Pretend Play

**Mechanics:**

- 4 prompts: tea party / superheroes / going on a trip / building a house
- Object palette available (some literal-use only, some can be symbolic)
- Child selects objects to "play with"

**Scoring:**

```
No symbolic selections (only literal objects) → 4 pts per scenario
Some symbolic but rigid/repetitive use        → 2 pts
Refuses to engage (timeout)                   → 3 pts per scenario
Response time > 15 seconds                    → +1 pt
```

---

### CHAPTER 6 — Sensory Garden (6–8 min)

**Purpose:** Sensory Processing | **Domain:** sensory_processing

#### Level 1 — Sound Sensitivity

**Mechanics:**

- 8 sounds play one at a time with animated source:
  Birds chirping / Water fountain / Children's laughter / Vacuum cleaner /
  Dog barking / Thunder / Baby crying / Traffic noise
- After each, child rates: 😊 Happy / 😐 Neutral / 😟 Worried / 😢 Upset / 🚫 (leave/cover ears icon)

**Scoring:**

```
Happy/Neutral response → 0 pts
Worried                → 1 pt
Upset                  → 2 pts
"Cover ears" icon      → +1 pt additional
"Leave" icon           → +2 pts additional
4+ sounds distressing  → 3 pts (RED FLAG: extreme_sensory_4plus_distressing_sounds)
Vacuum/mechanical specific distress → 2 pts (specific clinical flag)
Covers ears 3+ sounds  → 2 pts
Leaves immediately 2+  → 3 pts
```

**Red flag:** ≥4 distressing sounds → add flag `extreme_sensory_4plus_distressing_sounds`

#### Level 2 — Visual Sensitivity Patterns

**Mechanics:**

- Child navigates through 6 "rooms" in a house:
  Calm painting room / Colorful rainbow room / Flickering lights room /
  Spinning pinwheel room / Crowded scene room / Stripe patterns room
- Time spent in each room tracked; option to "leave" each room

**Scoring:**

```
Avoids 3+ rooms            → 2 pts
Flickering/motion distress → 2 pts (leaves within 3 seconds)
Excessive time in repetitive pattern rooms (>60s) → 1 pt
Crowded scene distress     → 1 pt
```

#### Level 3 — Texture Preferences

**Mechanics:**

- 8 texture cards: Cotton wool / Glass / Rock / Clay / Honey / Sandpaper / Ribbon / Jello
- Child drags card to: ❤️ Love / 👍 Okay / 👎 Don't Like / ✋ Never Touch (won't try)

**Scoring:**

```
Love/Okay   → 0 pts
Don't Like  → 1 pt
Never Touch → 2 pts
Won't Try   → 3 pts
4+ aversive → 2 pts additional
All wet textures aversive → 2 pts additional
Refuses 2+  → 2 pts
```

---

### CHAPTER 7 — Pattern Detective (8–10 min)

**Purpose:** Restricted/Repetitive Behaviors | **Domain:** restricted_repetitive

#### Level 1 — Pattern Completion

**Mechanics:**

- 3 sequence patterns shown (AB pattern, ABC pattern, complex AABBC)
- Child completes pattern by clicking next item
- After completion, a forced error is introduced
- Then pattern type changes

**Scoring:**

```
Distress at error + upset ("must fix it") → 3 pts (RED FLAG candidate)
Refuses new pattern                        → 3 pts
Delay > 10 seconds to start new pattern   → 2 pts
Returns to first pattern after change      → 2 pts
```

**Red flag:** Forced error causes meltdown + insists on returning to pattern → add flag `rigid_pattern_plus_distress_at_change`

#### Level 2 — Repetitive Behavior Recognition (Free Play)

**Mechanics:**

- Free play scene with various objects (blocks, toy cars, animals)
- Capture: what child selects and how many times they interact with same object
- "Disruption" event occurs mid-play (a character moves the objects)

**Scoring:**

```
Same action repeated 8+ times        → 2 pts
Spontaneously lines up all objects   → 2 pts
Distress when disrupted              → 2 pts
```

**Implementation note:** Track click sequences; detect repetition algorithmically.

#### Level 3 — Special Interest Intensity

**Mechanics:**

- 8 topic book covers: Trains / Space / Animals / Numbers / Colors / Dinosaurs / Cars / Music
- Child selects book → reads "facts" (illustrated pages)
- After 5 facts, guide says "Try a different book!" × 4

**Scoring:**

```
Same topic selected 3+ times       → 3 pts
Reads 15+ facts on one topic        → 2 pts
Transition resistance (> 8 seconds) → 2 pts each
Returns to same topic after change  → 2 pts
```

---

### CHAPTER 8 — Copy Cat Challenge (6–8 min)

**Purpose:** Imitation Skills | **Domain:** social_communication

#### Level 1 — Simple Action Imitation

**Mechanics:**

- 12 animated actions shown (4 facial, 4 body, 4 object use)
- Child selects matching action from grid of 4 options

**Scoring:**

```
Facial imitation error    → 2 pts each
Body/object use error     → 1 pt each
No response within 8 secs → 2 pts each
6+ total errors           → +3 pts (RED FLAG: poor_imitation_all_modalities)

ASD Indicator: M-CHAT #15 (Imitation deficit)
```

**Red flag:** ≥6 errors across modalities → add flag `poor_imitation_all_modalities`

#### Level 2 — Sequential Imitation

**Mechanics:**

- 6 sequences: 3 × two-action sequences, 3 × three-action sequences
- Watch full animation → then reproduce by clicking objects in order

**Scoring:**

```
2-action sequence error   → 1 pt each
3-action sequence error   → 2 pts each
Perseveration (repeats same wrong step) → +2 pts
Cannot complete any 3-action sequence  → +3 pts
```

---

### CHAPTER 9 — Assessment Summary (8–10 min)

**Purpose:** Consistency check & results | **Domain:** No new domain scoring

**Mechanics:**

- 20 randomly sampled tasks from all previous chapters
- Same mechanics as original task, no new content
- Tests consistency and pattern emergence

**Data collected:** Compare Chapter 9 performance to original chapter performance.

- Significant drop (>20% worse) → consistency flag added
- Significantly better → note as possible learning effect

**Output:**

1. Domain scores with risk levels
2. Combined weighted score
3. Risk classification
4. Red flag report
5. Recommendation text (always includes "consult specialist")
6. Researcher data export (JSON)

---

## 9. DATA COLLECTION

Collected automatically during every task:

| Metric                  | How                       | Frequency      |
| ----------------------- | ------------------------- | -------------- |
| Response time (ms)      | `performance.now()` delta | Per task       |
| Attempts before correct | Counter increment         | Per question   |
| Mouse position (x, y)   | Event listener → batched  | Every 100ms    |
| Sequence of selections  | Array push on click       | Per task       |
| Task completion         | Boolean                   | Per task       |
| Help requests           | Button click counter      | Per task       |
| Time-in-scene           | Timer                     | Per scene/room |

**Mouse tracking hook:**

```js
// hooks/useMouseTracker.js
export function useMouseTracker(sessionId, taskKey, active = true) {
  useEffect(() => {
    if (!active) return;
    const buffer = [];
    const handler = (e) => {
      buffer.push({ x: e.clientX, y: e.clientY, t: Date.now() });
    };
    window.addEventListener("mousemove", handler);
    const flush = setInterval(async () => {
      if (buffer.length === 0) return;
      const batch = buffer.splice(0, buffer.length);
      await fetch("/api/mouse", {
        method: "POST",
        body: JSON.stringify({ sessionId, taskKey, movements: batch }),
      });
    }, 500); // Batch every 500ms
    return () => {
      window.removeEventListener("mousemove", handler);
      clearInterval(flush);
    };
  }, [sessionId, taskKey, active]);
}
```

---

## 10. API ROUTES

All API routes live in `app/api/` and use `bun:sqlite` via `lib/db/index.js`.

### POST `/api/session`

Creates a new game session. Body: `{ playerAge, playerName }`. Returns `{ sessionId }`.

### PATCH `/api/session/[id]`

Updates session progress. Body: `{ currentChapter, currentLevel, status, avatarData }`.

### POST `/api/response`

Logs a task response. Body:

```json
{
  "sessionId": "...",
  "chapter": 2,
  "level": 1,
  "taskKey": "ch2_emotion_match_1",
  "startedAt": 1700000000000,
  "responseTimeMs": 3400,
  "selection": "happy",
  "isCorrect": true,
  "attemptNumber": 1,
  "scorePoints": 0
}
```

### POST `/api/score`

Adds chapter score points. Body: `{ sessionId, chapterKey, rawPoints }`.

### POST `/api/mouse`

Batch mouse movement log. Body: `{ sessionId, taskKey, movements: [{x, y, t}] }`.

### POST `/api/flag`

Adds red flag. Body: `{ sessionId, flagType, description, severity }`.

### GET `/api/results/[sessionId]`

Returns full session results including computed domain scores. Triggers scoring engine.

---

## 11. COMPONENT ARCHITECTURE

### TaskTimer (invisible, renders nothing)

```jsx
// components/game/TaskTimer.jsx
"use client";
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

const TaskTimer = forwardRef(function TaskTimer(_, ref) {
  const startRef = useRef(null);
  useImperativeHandle(ref, () => ({
    start() {
      startRef.current = performance.now();
    },
    stop() {
      if (!startRef.current) return 0;
      return Math.round(performance.now() - startRef.current);
    },
  }));
  return null;
});
export default TaskTimer;
```

### FeedbackOverlay

Shows ✅ or ❌ animation after each response. Props: `{ show, correct, onComplete }`.
Uses Framer Motion scale + fade animation. Duration: 800ms.

### BigButton

Large (min 80px height), rounded, touch-friendly. Uses ShadCN Button with size="lg" + custom Tailwind classes. Ensures accessibility for young children.

### SceneBackground

Full-viewport background using Next.js `Image` component with `fill` prop. Falls back to gradient color if image is missing.

---

## 12. NAVIGATION FLOW

```
Main Menu (/)
  → Age/Name Entry
  → Chapter 1 Hub (/chapter-1)
    → Level 1 (/chapter-1/level-1) [Avatar + Name Response]
    → Level 2 (/chapter-1/level-2) [Following the Guide]
  → Chapter 2 Hub (/chapter-2)
    → Level 1 → Level 2 → Level 3
  → ... (Chapters 3–8)
  → Chapter 9 (/chapter-9) [Summary + Results]
  → Results Page
  → Main Menu
```

**Router:** Use `next/navigation` `useRouter().push()` for programmatic navigation.  
**Chapter completion:** Each level's last task calls `GameManager.goToChapter(next, 1)` equivalent via `router.push('/chapter-X')`.

---

## 13. RESEARCHER DASHBOARD

Route: `/researcher`

**Features:**

1. Session list table (date, age, status, combined score, risk level)
2. Individual session detail with:
   - Domain score breakdown (recharts radar/bar chart)
   - Red flags list
   - Response time distribution per chapter
   - Task-level accuracy table
   - Mouse movement heatmap (canvas-drawn)
3. Export button: Downloads session as JSON or CSV

**Security note:** For academic project, protect with a simple environment variable password check in the layout (no auth library needed).

---

## 14. ENVIRONMENT VARIABLES

```env
# .env.local
DB_PATH=./horizons.db
RESEARCHER_PASSWORD=research123
NEXT_PUBLIC_APP_NAME=Horizons
```

---

## 15. TESTING STRATEGY

### Unit Tests (Bun test runner)

File: `tests/unit/scoring.test.js`

- Test every scoring function with known inputs/outputs
- Test red flag detection
- Test domain score calculation
- Test combined score formula
- Test risk level classification

File: `tests/unit/db.test.js`

- Test each query function with test DB (in-memory SQLite)
- Test CRUD operations for all tables
- Test cascade deletes

File: `tests/unit/utils.test.js`

- Test `calcGameAccuracy`, `calcAvgAttempts`
- Test timer utilities

### Integration Tests

File: `tests/integration/api.test.js`

- Test each API route with real HTTP calls
- Test session lifecycle: create → update → complete
- Test score accumulation

File: `tests/integration/scoring-pipeline.test.js`

- Simulate full game session data
- Verify end-to-end scoring pipeline produces correct results
- Test red flag multiplier stacking

### Run tests:

```bash
bun test                   # All tests
bun test tests/unit/       # Unit only
bun test --watch           # Watch mode
bun test --coverage        # Coverage report
```

### Test database: Use `:memory:` path for test isolation:

```js
// In test setup
const testDb = new Database(":memory:");
```

---

## 16. BUILD & RUN COMMANDS

```bash
# Install dependencies
bun install

# Install ShadCN components
bunx shadcn@latest init
bunx shadcn@latest add button card dialog badge progress slider tabs toast tooltip separator scroll-area avatar alert

# Development
bun dev

# Production build
bun run build
bun start

# Tests
bun test

# Lint check
bun run lint
```

---

## 17. `next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    unoptimized: process.env.NODE_ENV === "development",
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

export default nextConfig;
```

---

## 18. `tailwind.config.js` (v4 minimal)

```js
// Tailwind v4: most config is in globals.css via @theme
export default {};
```

`app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-primary: #6366f1;
  --color-primary-foreground: #ffffff;
  --color-game-bg: #fef3c7;
  --color-accent: #f59e0b;
  --font-game: "Nunito", sans-serif;
  --radius: 1rem;
}
```

---

## 19. `components.json` (ShadCN)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": false,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "violet",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 20. CODING STANDARDS

1. **JavaScript only** — NO TypeScript. No `.ts`, `.tsx` files.
2. **File extensions:** `.jsx` for React components, `.js` for everything else.
3. **Imports:** Use `@/` alias for all project imports.
4. **'use client':** Add to any component that uses `useState`, `useEffect`, event handlers, or browser APIs.
5. **Server Actions vs API routes:** Prefer Server Actions for simple form submissions; use API routes for game data logging (called from client during gameplay).
6. **No raw CSS:** All styling via Tailwind utility classes. Exception: `globals.css` for `@theme` tokens only.
7. **ShadCN first:** Use ShadCN components before building custom ones.
8. **Database:** Never import `lib/db` in client components. DB access only in Server Actions or `app/api/` routes.
9. **Error handling:** All API routes return `{ error: string }` with appropriate HTTP status on failure.
10. **Comments:** JSDoc for all functions in `lib/scoring/` and `lib/db/queries/`.
11. **Constants:** All magic numbers go in named constants at top of file or in `lib/scoring/thresholds.js`.
12. **Asset paths:** All assets under `public/assets/`. Use `/assets/...` paths in `<img>` / `Image` components.
13. **Placeholder assets:** If an image file doesn't exist, component falls back to a colored SVG placeholder — never crash.

---

## 21. ACADEMIC REQUIREMENTS COMPLIANCE

| CLO                    | Assessment       | How This Project Satisfies It                                                           |
| ---------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| CLO1: Problem Analysis | A1 (10 marks)    | `docs/SRS.md` — problem definition, requirements, feasibility                           |
| CLO2: Design & Dev     | A2+A3 (35 marks) | Architecture diagram, DB schema, all 9 chapters implemented                             |
| CLO3: Modern Tools     | A3 (10 marks)    | Next.js 15, Bun, Tailwind v4, ShadCN, bun:sqlite — all cutting-edge                     |
| CLO4: Testing          | A4 (15 marks)    | Unit + integration tests, coverage report, performance analysis in researcher dashboard |
| CLO5: Teamwork         | A2+A7            | Task distribution documented in `docs/DesignDoc.md`                                     |
| CLO6: Documentation    | A5+A6 (30 marks) | SRS.md, DesignDoc.md, UserManual.md, inline JSDoc                                       |

**BAETE/OBE compliance:** All CLOs are measurable, use Bloom's Taxonomy action verbs, and are directly assessable via deliverables.

---

## 22. PHASE BREAKDOWN SUMMARY

| Phase | Focus                  | Key Deliverable                                               |
| ----- | ---------------------- | ------------------------------------------------------------- |
| 1     | Setup & Infrastructure | Working Next.js + Bun + Tailwind v4 + ShadCN + SQLite app     |
| 2     | Database Layer         | Full schema, queries, migrations, unit tests                  |
| 3     | Core Game Engine       | Session management, scoring engine, Zustand store, API routes |
| 4     | Main Menu & Onboarding | Landing page, age/name entry, session creation                |
| 5     | Chapter 1              | Avatar creator + name response + guide following              |
| 6     | Chapter 2              | Emotion matching + expression + regulation                    |
| 7     | Chapter 3              | Greeting + conversation + sharing                             |
| 8     | Chapter 4              | Morning routine (drag-drop) + playground + unexpected events  |
| 9     | Chapter 5              | Pretend play recognition + creation                           |
| 10    | Chapter 6              | Sound/visual/texture sensory tasks                            |
| 11    | Chapter 7              | Pattern completion + repetitive behavior + special interests  |
| 12    | Chapter 8              | Simple + sequential imitation                                 |
| 13    | Chapter 9              | Summary tasks + full scoring + results display                |
| 14    | Researcher Dashboard   | Dashboard, charts, export                                     |
| 15    | Testing, Docs & Polish | Full test suite, SRS/Design docs, accessibility pass          |

---

## 23. IMPORTANT REMINDERS FOR CODEX AGENTS

1. **Run `bun test` after every phase.** Fix all failing tests before moving on.
2. **Never hardcode session IDs** — always generate with `crypto.randomUUID()`.
3. **All DB operations are synchronous** with `bun:sqlite` — no `await` needed on DB calls.
4. **Next.js 15 App Router:** `params` in page components are now async — use `await params`.
5. **ShadCN tsx:false** is set — do not add TypeScript annotations to ShadCN generated files.
6. **Tailwind v4:** class names are the same as v3 for standard utilities. `bg-primary`, `text-foreground` etc. work via CSS variables.
7. **Asset fallbacks:** Every `<img>` or `<Image>` needs an `onError` fallback or conditional check.
8. **The game is for young children:** All clickable elements must be minimum 60×60px. Fonts minimum 18px. High contrast colors.
9. **GDPR compliance:** Never log personal data. Player names are optional display-only labels, not stored permanently after session ends.
10. **Scoring is purely additive:** Never subtract from a session's domain score. Points only go up.
