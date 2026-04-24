# HORIZONS — Implementation Prompts

> Complete step-by-step guide for building the project from scratch using Claude Code.
> Follow every step in order. Do not skip steps.

---

## PART 1 — BEFORE YOU TOUCH CODE (Manual Setup)

Complete all of these before opening Claude Code. You only do this once.

---

### Step 1 — Install Bun (if not already installed)

Open your terminal and run:

```
curl -fsSL https://bun.sh/install | bash
```

Then close and reopen your terminal. Verify with: `bun --version`

---

### Step 2 — Create a Neon database (free PostgreSQL)

1. Go to **neon.tech** in your browser
2. Click **"Sign Up"** → sign in with GitHub or email (it's free)
3. Click **"New Project"** → name it `horizons` → click **"Create Project"**
4. You'll see a connection string. Copy the one labeled **"Connection string"** (starts with `postgresql://`)
5. Save it — you will need it in Step 6

The '.env' NeonDB PostgreSQL connection string:

```
DATABASE_URL='postgresql://neondb_owner:npg_ublOKAZf87BU@ep-lucky-forest-aoyj8e8q-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

---

### Step 3 — Create a Resend account (free email service)

1. Go to **resend.com** in your browser
2. Click **"Sign Up"** → create a free account
3. After logging in, go to **API Keys** in the left menu
4. Click **"Create API Key"** → name it `horizons` → click **"Add"**
5. Copy the key shown (starts with `re_`) — you will need it in Step 6
6. Go to **Domains** → click **"Add Domain"** and follow instructions to verify your domain, OR skip this and use their sandbox domain for testing

---

### Step 4 — Create your project folder

In your terminal:

```bash
mkdir horizons
cd horizons
```

---

### Step 5 — Copy CLAUDE.md into the new project

Copy the `CLAUDE.md` file from `fresh_plan/CLAUDE.md` (the planning document) into your new `horizons/` folder root. The file must be named exactly `CLAUDE.md` and be at the top level of your project.

```bash
# Example (adjust paths to match where you saved fresh_plan/)
cp /path/to/fresh_plan/CLAUDE.md /path/to/horizons/CLAUDE.md
```

---

### Step 6 — Create your environment file

Inside your `horizons/` folder, create a file named exactly `.env.local` (note the dot at the start). Add these lines, replacing the placeholder values with your real ones:

```
DATABASE_URL=postgresql://paste-your-neon-connection-string-here

BETTER_AUTH_SECRET=pick-any-random-string-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000

REPORT_HMAC_SECRET=pick-another-random-string-at-least-32-characters-long

RESEND_API_KEY=re_paste-your-resend-api-key-here
RESEND_FROM=noreply@yourdomain.com
CONTACT_EMAIL=your-own-email@gmail.com

NEXT_PUBLIC_APP_NAME=Horizons
NEXT_PUBLIC_APP_URL=http://localhost:3000

SEED_ADMIN_EMAIL=admin@horizons.app
SEED_ADMIN_PASSWORD=choose-a-strong-password-you-will-remember
```

For `BETTER_AUTH_SECRET` and `REPORT_HMAC_SECRET`, you can generate random strings at **randomkeygen.com** (use "256-bit WEP Keys").

---

### Step 7 — Open Claude Code in your project folder

Open your terminal in the `horizons/` folder and run:

```
claude
```

Or open the Claude Code desktop app and click **"Open Folder"** → select your `horizons/` folder.

You are now ready. All prompts below are pasted into Claude Code one at a time.

---

## PART 2 — CLAUDE CODE PROMPTS

**How to use these prompts:**

- Copy the text inside each grey box exactly as written
- Paste it into Claude Code and press Enter
- Wait for Claude to finish completely before moving to the next prompt
- When Claude asks you to run a command in the terminal, run it (some commands need YOU to run them, not Claude)
- If Claude says tests are failing, let it fix them before moving on

---

### PROMPT 1 — Project Initialization

```
Read the CLAUDE.md file in this project root first. It is the complete specification for what we are building.

Then do the following in order:

1. Initialize a Next.js 15 project in the current directory using Bun with these exact options: App Router, JavaScript (no TypeScript), Tailwind CSS, ESLint, no src/ directory. Run: `bunx create-next-app@latest . --javascript --tailwind --eslint --app --no-src-dir --no-import-alias`

2. Install all dependencies listed in CLAUDE.md Section 2 (Tech Stack). Run: `bun add better-auth postgres zustand framer-motion tone @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities resend @vercel/analytics uuid clsx tailwind-merge lucide-react class-variance-authority recharts`

3. Initialize ShadCN UI: Run `bunx shadcn@latest init` — when prompted, choose: Default style, Zinc base color, yes to CSS variables, no to TypeScript. Then install all components: `bunx shadcn@latest add button card dialog badge progress tabs toast tooltip separator scroll-area avatar alert table input label select textarea dropdown-menu sheet`

4. Update `next.config.js` to export a config object (ESM format, no TypeScript). Keep it minimal.

5. Update `app/globals.css` to contain only `@import "tailwindcss"` plus the `@theme` block from CLAUDE.md Section 19 (which sets chapter color CSS variables and font).

6. Create the `.gitignore` to include `.env.local`, `node_modules/`, `.next/`, `horizons.db`.

7. Create `components.json` for ShadCN as specified in CLAUDE.md, with `tsx: false`.

After all of this, run `bun dev` and confirm the app starts without errors. Report the result.
```

---

### PROMPT 2 — Database Schema & Migration

> **New session after `/clear`?** Paste this first: _"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompt 1 is complete. Now implement Prompt 2."_

```
Read CLAUDE.md Section 4 (Database Schema) and Section 5 (Database Connection) carefully.

Implement the following:

1. Create `lib/db/schema.sql` with all CREATE TABLE IF NOT EXISTS statements from CLAUDE.md Section 4 exactly as specified. Include all indexes. Use correct PostgreSQL syntax: SERIAL for auto-increment, JSONB for JSON fields, BOOLEAN for booleans, BIGINT for epoch-ms timestamps.

2. Create `lib/db/index.js` as a postgres.js singleton — imports postgres, creates `sql = postgres(process.env.DATABASE_URL)`, exports `sql`. This file is SERVER-ONLY.

3. Create `lib/db/migrate.js` that:
   - Imports `sql` from `lib/db/index.js`
   - Reads and executes `schema.sql` via `sql.file('./lib/db/schema.sql')` on startup
   - Also calls Better Auth's migration (auth.migrate()) — import auth from `lib/auth.js` which we will create in the next step, but for now add a comment placeholder

4. Create `lib/db/queries/sessions.js` with JSDoc functions: `createSession`, `getSession`, `updateSession`, `listAllSessions`, `deleteSession`. All are async, use `sql` template literals.

5. Create `lib/db/queries/responses.js` with: `insertResponse`, `getResponsesBySession`.

6. Create `lib/db/queries/scores.js` with: `insertScore`, `getScoresBySession`.

7. Create `lib/db/queries/mouseMovements.js` with: `insertMouseBatch`, `getMouseBySession`.

8. Create `lib/db/queries/redFlags.js` with: `insertRedFlag`, `getRedFlagsBySession`.

9. Create `lib/db/queries/domainScores.js` with: `upsertDomainScore`, `getDomainScoresBySession`.

10. Create `lib/db/queries/accounts.js` with: `listAccounts`, `createAccount`, `updateAccount`.

11. Create `lib/db/queries/contactSubmissions.js` with: `insertContact`, `listContacts`, `updateContactStatus`.

12. Create `lib/db/queries/surveyResponses.js` with: `insertSurvey`, `listSurveys`.

13. Create `lib/utils.js` with: `cn()` (clsx + tailwind-merge), `formatTime(ms)`, `generateId()` (uses uuid v4).

After creating all files, run `bun dev`. The server should start without crashing. Report any errors.
```

---

### PROMPT 3 — Authentication

> **New session after `/clear`?** Paste this first: _"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–2 are complete. Now implement Prompt 3."_

```
Read CLAUDE.md Section 5 (Authentication) carefully.

Implement the following:

1. Create `lib/auth.js` — configure a Better Auth instance:
   - Use the postgres.js adapter (import from `better-auth/adapters/pg` or the correct Better Auth postgres adapter path)
   - Email + password provider enabled
   - Custom user fields: `role` (TEXT, default 'researcher') and `is_active` (BOOLEAN, default true)
   - Session cookie named `horizons_session`, HttpOnly, SameSite=Lax
   - Session expires in 7 days
   - Base URL from `process.env.BETTER_AUTH_URL`
   - Export the auth instance as default

2. Update `lib/db/migrate.js` to call `auth.migrate()` alongside `sql.file()` so Better Auth creates its own tables (`user`, `session`, `account`, `verification`) automatically on startup.

3. Create `app/api/auth/[...all]/route.js` — export `{ GET, POST }` using Better Auth's Next.js handler.

4. Create `lib/dashboardAuth.js` with two exported async functions:
   - `getAuthenticatedUser(request)` → returns user object or null by verifying the `horizons_session` cookie
   - `requireAdmin(request)` → calls getAuthenticatedUser; if null or role !== 'admin', returns `{ error: 'Forbidden', status: 403 }`; otherwise returns the user

5. Create `middleware.js` at the project root:
   - Matches pattern `/dashboard/:path*`
   - Excludes `/dashboard/login`
   - Reads the `horizons_session` cookie using Better Auth's server API
   - Redirects to `/dashboard/login` if no valid session or `is_active === false`
   - Use `NextResponse.redirect` from `next/server`

6. Implement login rate limiting: in `lib/auth.js` or a separate `lib/rateLimit.js`, create an in-memory Map keyed by IP address. Track failed login attempts. After 5 failures within 15 minutes, reject with HTTP 429. Apply this check in the login flow.

7. Create `scripts/seed-admin.js`:
   - Uses Better Auth's API to create a user with email from `SEED_ADMIN_EMAIL` env var, password from `SEED_ADMIN_PASSWORD`, and role set to `'admin'`
   - If user already exists, log a message and exit gracefully
   - Print success/failure to console

8. Create a basic `app/dashboard/login/page.jsx` (client component) with:
   - Email + password form
   - On submit: POST to `/api/auth/sign-in/email` (Better Auth endpoint)
   - On success: redirect to `/dashboard`
   - Show error message on failure
   - Rate limit feedback: if 429 returned, show "Too many attempts" message

After implementing, test: run `bun scripts/seed-admin.js` and confirm it creates the admin account without errors. Then run `bun dev`, visit `localhost:3000/dashboard` and confirm you are redirected to `/dashboard/login`.
```

---

### PROMPT 4 — Scoring Engine & Game State

> **New session after `/clear`?** Paste this first: _"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–3 are complete. Now implement Prompt 4."_

```
Read CLAUDE.md Section 7 (Scoring Engine) and Section 6 (Game State) carefully.

Implement the following:

1. Create `lib/scoring/thresholds.js` — export constants: `DOMAIN_THRESHOLDS` (all 4 domains with their risk ranges), `COMBINED_THRESHOLDS`. Use exact values from CLAUDE.md Section 7.

2. Create `lib/scoring/domains.js` — export: `DOMAIN_WEIGHTS`, `DOMAIN_MAX_POINTS`, `CHAPTER_TO_DOMAIN` mapping. Use exact values from CLAUDE.md Section 7.

3. Create `lib/scoring/redFlags.js` — export `RED_FLAG_MULTIPLIERS` object with all 5 flags and their multiplier values from CLAUDE.md Section 7. Also export helper functions: `detectRedFlags(sessionData)` → returns array of triggered flag type strings based on session task response data.

4. Create `lib/scoring/engine.js` — export these JSDoc-documented functions:
   - `calculateCombinedScore(domainRawScores, activeRedFlags)` → REAL: weighted domain sum × stacked multipliers (capped at 2.0×)
   - `getRiskLevel(combinedScore)` → string
   - `getDomainRisk(domain, rawScore)` → string
   - `calcGameAccuracy(correctResponses, totalMoves)` → REAL
   - `calcAvgAttempts(sumOfAttempts, totalQuestions)` → REAL

5. Create `store/gameStore.js` — Zustand store persisted to localStorage with the fields and methods from CLAUDE.md Section 6. Export `useGameStore`.

6. Create `store/settingsStore.js` — Zustand store persisted to localStorage with `guideEmoji`, `sensoryLevel`, `caregiverMode` fields. Export `useSettingsStore`.

7. Create `hooks/useTaskTimer.js` — returns a ref with `{ start(), stop() }` imperative API using `performance.now()`.

8. Create `hooks/useMouseTracker.js` — attaches `window.pointermove` listener when `active=true`; buffers `{x, y, t}` objects; flushes to `POST /api/game/mouse` every 500ms; cleans up on unmount. Parameters: `(sessionId, taskKey, active)`.

9. Create `hooks/useSoundCue.js` — lazily imports Tone.js inside a useEffect; reads `sensoryLevel` from settingsStore; exports a `play(cueName)` function that calls the named cue from `lib/sound/cues.js`; returns early or applies volume scaling based on sensoryLevel.

10. Create `components/game/TaskTimer.jsx` (`'use client'`) — forwardRef component exposing `{ start(), stop() }` imperative handle via `useImperativeHandle`. Renders null. Uses `performance.now()`.

Now run `bun test tests/unit/scoring.test.js` to verify the scoring engine. If the test file doesn't exist yet, create it with tests covering:
- `calculateCombinedScore` with known inputs
- `getRiskLevel` at every threshold boundary
- All 5 red flag multipliers including stacking and 2.0× cap
Fix any test failures.
```

---

### PROMPT 5 — Sound Synthesis & Visual Design System

> **New session after `/clear`?** Paste this first: _"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–4 are complete. Now implement Prompt 5."_

````
Read CLAUDE.md Section 12 (Sound Synthesis) and Section 11 (Visual Design System) carefully.

Implement the following:

1. Create `lib/sound/synth.js` (`'use client'` — this file is only imported client-side):
   - All Tone.js imports must use dynamic import inside a function so they only load after a user gesture
   - Export an async function `getSynths()` that lazily creates and caches singleton Tone.js instruments:
     - `feedbackSynth` — Synth with Triangle oscillator, short envelope
     - `melodyPluck` — PluckSynth
     - `ambientDrone` — AMSynth
     - `noisePlayer` — NoiseSynth

2. Create `lib/sound/cues.js` — export these async functions (each calls `getSynths()` first):
   - `cueCorrect()` — ascending C4–E4–G4 triad, 120ms each note
   - `cueWrong()` — soft descending E4→C4, gentle tone, not jarring
   - `cueChapterComplete()` — 6-note fanfare on PluckSynth
   - `cueBreak()` — slow descending tone over 1 second
   - `cueGuideSpeak()` — warm pulse train, 3 pulses at 280 Hz
   - `startAmbient(chapterNumber)` — starts looping chapter-specific AMSynth drone; different root note per chapter
   - `stopAmbient()` — fades out current ambient over 2 seconds
   - `cueSound(type)` — synthesizes sensory test sounds using exact specs from CLAUDE.md Section 12: 'birds' (FM + tremolo), 'fountain' (pink noise lowpass), 'laughter' (burst pulse train), 'vacuum' (square wave + noise), 'thunder' (white noise ADSR + sub-bass), 'traffic' (swept pink noise)

3. Create `lib/visual/themes.js` — export `CHAPTER_THEMES` object with the 6 chapter color palettes from CLAUDE.md Section 11 (primary, secondary, accent, gradient description for each chapter plus dashboard and marketing).

4. Create `lib/visual/animations.js` — export Framer Motion variant objects:
   - `pageTransition` — slide from right in, slide to left out; duration 0.35s at medium sensory level
   - `popIn` — scale 0→1, spring physics
   - `floatLoop` — infinite subtle Y-axis oscillation for idle guide character
   - `shakeFeedback` — short horizontal shake for wrong answers
   - `celebrateBurst` — scale spike + color ring for correct answers
   - `fadeSlide` — opacity + Y translate for dashboard content
   All variants must accept a `sensoryLevel` prop that scales durations (low=0.5×, high=1.5×).

5. Create `app/globals.css`:
   ```css
   @import "tailwindcss";
   @theme {
     --color-primary: #6366f1;
     --color-primary-foreground: #ffffff;
     --font-game: "Nunito", sans-serif;
     --radius: 1rem;
   }
````

6. Create `components/shared/BigButton.jsx` — ShadCN Button base, minimum 64×64px via padding, large font size, touch-friendly. Exported as default.

7. Create `components/shared/StarRating.jsx` — both interactive (click to rate) and display-only (read-only prop) modes. Uses emoji ⭐ visually. Exported as default.

8. Create `components/shared/ConfettiBlast.jsx` — canvas-based confetti animation that plays once on mount and disappears. No image files. Pure canvas drawing with colored rectangles.

9. Create `components/shared/SensoryToggle.jsx` — three-option toggle (Low / Medium / High) using ShadCN Tabs or button group. Reads and writes `sensoryLevel` in settingsStore.

After this, run `bun dev` and confirm no import errors. Open browser to localhost:3000 — it should load without crashing.

```

---

### PROMPT 6 — All Game API Routes

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–5 are complete. Now implement Prompt 6."*

```

Read CLAUDE.md Section 10 (API Routes) carefully. Look at the full result object shape too.

Implement all game API routes. All routes must: validate required fields, return `{ error: string }` with correct HTTP status on failure, and be server-only (no DB imports in client code).

1. `app/api/game/session/route.js` — POST: validates `playerAge` (3-10 required), creates session via `createSession()`, returns `{ sessionId }`.

2. `app/api/game/session/[id]/route.js` — GET: returns session row. PATCH: accepts `{ currentChapter, currentLevel, status, avatarData }` (all optional), updates session.

3. `app/api/game/response/route.js` — POST: validates required fields (`sessionId`, `chapter`, `level`, `taskKey`, `startedAt`), inserts task response, returns `{ id }`.

4. `app/api/game/score/route.js` — POST: validates `sessionId`, `chapterKey`, `rawPoints`, inserts chapter score, returns `{ ok: true }`.

5. `app/api/game/mouse/route.js` — POST: validates `sessionId`, `taskKey`, `movements` (array), batch-inserts mouse movements, returns `{ ok: true }`.

6. `app/api/game/flag/route.js` — POST: validates `sessionId`, `flagType`, inserts red flag (severity defaults to 'moderate'), returns `{ id }`.

7. `app/api/game/results/[sessionId]/route.js` — GET: this is the most complex route:
   - Fetch all chapter_scores for session, group by CHAPTER_TO_DOMAIN, sum per domain
   - Detect which red flags were triggered (query task_responses for red flag conditions from CLAUDE.md scoring sections)
   - Call `calculateCombinedScore(domainRawScores, activeRedFlags)` and `getRiskLevel()`
   - Call `getDomainRisk()` for each domain
   - Upsert all domain scores to `domain_scores` table
   - Generate `report_token` using `generateReportToken(sessionId, completedAt)` from `lib/reportToken.js`
   - Save report_token to game_sessions
   - Mark session as 'completed' with current timestamp
   - Return the full result object as defined in CLAUDE.md Section 10

8. `app/api/game/chapter6/tasks/route.js` — GET with `?seed=sessionId`: returns 15 randomly sampled tasks from `lib/gameData/chapter6.js` using the sessionId as a deterministic seed.

9. `app/api/platform/contact/route.js` — POST: validates email (required), message (5-2000 chars); inserts to DB; calls `sendContactNotification()` from `lib/email.js`; returns `{ ok: true }`.

10. `app/api/platform/survey/route.js` — POST: validates rating (1-5); inserts to DB; returns `{ ok: true }`.

11. Create `lib/reportToken.js`:
    - `generateReportToken(sessionId, completedAt)` → HMAC-SHA256 hex using `REPORT_HMAC_SECRET`, input string: `"{sessionId}:{completedAt}"`
    - `verifyReportToken(sessionId, completedAt, token)` → boolean using `crypto.timingSafeEqual` for constant-time comparison

12. Create `lib/email.js`:
    - Import Resend from 'resend'
    - Export `sendContactNotification({ name, email, role, message })` — sends HTML email to `CONTACT_EMAIL` env var with subject "New Contact Form Submission — Horizons" and a structured body with all fields

After implementing, run `bun dev` then test the session creation route manually: open a new terminal and run `curl -X POST http://localhost:3000/api/game/session -H "Content-Type: application/json" -d '{"playerAge": 6}'` — you should get back a `{ sessionId: "..." }` response.

```

---

### PROMPT 7 — All Dashboard API Routes

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–6 are complete. Now implement Prompt 7."*

```

Read CLAUDE.md Section 10 (API Routes — Dashboard section) carefully.

Implement all dashboard API routes. Every route must verify authentication using `getAuthenticatedUser()` or `requireAdmin()` from `lib/dashboardAuth.js` before doing anything else. Return 401 if not authenticated, 403 if not admin.

1. `app/api/dashboard/sessions/route.js` — GET (researcher+): query all game_sessions joined with domain_scores; support query params `?status=`, `?risk=`, `?search=` (filters by player_name or id); return array of session summaries.

2. `app/api/dashboard/sessions/[id]/route.js`:
   - GET (researcher+): return full session detail including all task_responses, chapter_scores, red_flags, domain_scores
   - DELETE (researcher+): delete session (cascades all related rows), return `{ ok: true }`

3. `app/api/dashboard/export/route.js` — GET (researcher+): accepts `?format=csv|json&from=&to=`; fetches all sessions with their domain scores and red flags; formats as CSV (using manual string building, no external library) or JSON; sets `Content-Disposition: attachment` header.

4. `app/api/dashboard/accounts/route.js`:
   - GET (admin): list all researcher/admin accounts from Better Auth's user table, return `{ accounts: [...] }`
   - POST (admin): create new account; accepts `{ email, password, role }`; uses Better Auth's admin API or direct DB insert; return `{ ok: true }`

5. `app/api/dashboard/accounts/[id]/route.js` — PATCH (admin): accepts `{ isActive?, role? }`; updates the user record in Better Auth's user table.

6. `app/api/dashboard/contact/route.js` — GET (admin): list contact_submissions; accepts `?status=new|read|archived`; return array.

7. `app/api/dashboard/contact/[id]/route.js` — PATCH (admin): accepts `{ status }`; updates contact submission status.

8. `app/api/dashboard/survey/route.js` — GET (admin): list all survey_responses; return array with total count and average rating.

After implementing, run `bun dev`. Then open browser to `localhost:3000/dashboard` — you should be redirected to `/dashboard/login`. Log in with the admin credentials you created with `bun scripts/seed-admin.js` and confirm you reach the dashboard. The dashboard page is a placeholder for now — that's fine.

```

---

### PROMPT 8 — Game Shell & World Map & Start Page

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–7 are complete. Now implement Prompt 8."*

```

Read CLAUDE.md Section 13 (Navigation & UX) and Section 3 (Directory Structure — game section) carefully.

Implement the game wrapper, world map, and start page.

1. Create `app/(game)/layout.jsx` (`'use client'`) — the `GameShell` layout:
   - Renders a full-viewport container with the chapter's theme gradient background (read current chapter from `useGameStore`, look up color in `CHAPTER_THEMES`)
   - Top bar: dual progress bar component (overall chapters 1-6, current level within chapter)
   - Bottom bar (or floating): guide emoji character (animated `floatLoop` variant, tappable for a random encouraging message), and a prominent "🛑 I need a break" button that calls `incrementBreak()` and shows a 10-second rest screen before returning to the task
   - Wraps `{children}` in a `motion.div` with `pageTransition` variant
   - Import and start Tone.js ambient sound for the current chapter (call `startAmbient(currentChapter)`, stop on unmount with `stopAmbient()`)

2. Create `components/game/ProgressBar.jsx` — two-tier progress indicator:
   - Top row: 6 small chapter emoji dots (filled = completed, current = pulsing, locked = dimmed)
   - Bottom row: level dots for the current chapter (filled = completed, current = active)
   - Uses `useGameStore` to get current position

3. Create `components/game/VisualSchedule.jsx` — horizontal strip of emoji icons representing remaining tasks in the current level. Props: `tasks` (array of {emoji, label}), `currentIndex`. Scrollable on mobile.

4. Create `components/game/PracticeDemo.jsx` — animated demo component shown before a new mechanic type:
   - Shows 3 step-by-step animations (watch → guided → free)
   - Uses Framer Motion stagger
   - Props: `steps` (array of {emoji, label, animation}), `onComplete` callback
   - "I understand! 👍" button triggers onComplete

5. Create `components/game/GuideCharacter.jsx` — renders the selected guide emoji (from `useSettingsStore`) at large size with `floatLoop` Framer Motion animation. When tapped, shows a speech bubble with an encouraging phrase (random from a list of 8 child-friendly phrases). The bubble auto-hides after 3 seconds.

6. Create `app/(game)/start/page.jsx` (`'use client'`) — caregiver setup screen:
   - Step 1: Child's first name input (optional, placeholder "What's your name?") + age selector (touch-friendly number buttons 3-10, required)
   - Step 2: Pick your guide (4 large tappable emoji buttons: 🦊 Fox, 🐻 Bear, 🦁 Lion, 🐸 Frog — each animates on tap)
   - Step 3: Sensory settings (SensoryToggle component) with brief friendly explanation
   - Step 4: Avatar builder (EmojiAvatar component — skin tone selector: 5 options; hair color: 6 colored dot buttons; outfit color: 6 colored dot buttons)
   - On "Let's Go! 🚀" button: POST to `/api/game/session` with age, name, guideChoice, sensoryLevel; store sessionId+playerAge+playerName in gameStore; save guide+sensoryLevel in settingsStore; navigate to `/game/map`

7. Create `components/game/EmojiAvatar.jsx` — CSS-composed avatar:
   - Large emoji character (👦/👧 based on implicit neutral, with skin tone Unicode modifier)
   - Two colored divs absolutely positioned for hair overlay and outfit overlay
   - Props: `skinTone`, `hairColor`, `outfitColor`; all colors are CSS hex strings

8. Create `app/(game)/map/page.jsx` (`'use client'`) — animated world map:
   - 6 chapter "islands" arranged on a colorful CSS gradient background
   - Each island is a `motion.button` with: chapter number, chapter title, theme color, relevant emoji decoration, Framer Motion `whileHover` scale + glow
   - Completed chapters: show ✅ overlay + full color
   - Current chapter: pulsing ring animation
   - Locked chapters (beyond current): 🔒 overlay, not interactive, slightly faded
   - Islands reveal with `staggerChildren` on mount (appear one by one with `popIn`)
   - Tapping a chapter navigates to its first incomplete level

After building, run `bun dev`. Visit `localhost:3000/game/start`. Walk through the setup flow and verify you land on the map. The map should show 6 chapter islands. Report any errors.

```

---

### PROMPT 9 — Public Marketing Pages

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–8 are complete. Now implement Prompt 9."*

```

Read CLAUDE.md Section 14 (Public Platform Pages) and the marketing section of the directory structure carefully.

Implement all public-facing marketing pages. These must be mobile-first, visually polished, and use only emoji + CSS + Framer Motion (no image files).

1. Create `app/(marketing)/layout.jsx`:
   - Sticky top navigation bar with: Horizons logo (text + brain emoji 🧠), nav links (About, Contact, Survey), and a "Start Assessment →" CTA button (ShadCN Button, primary color)
   - On mobile (base breakpoint): hamburger icon → ShadCN Sheet slide-in with the same nav links
   - Footer: copyright, links to About/Contact/Survey, non-diagnostic disclaimer line

2. Create `components/marketing/Hero.jsx`:
   - Full-viewport-height hero section with layered CSS radial gradient background (use primary color)
   - Large animated emoji collage (children playing: 🧒🎮🧩🎨🌈) with Framer Motion stagger reveal
   - Main headline: "Horizons" in large bold font
   - Sub-headline: "Understanding your child through play — a research-based behavioral screening tool"
   - Two CTA buttons: primary "Start Assessment 🚀" → `/game/start`, secondary "Learn More" → smooth scroll to #how-it-works section

3. Create `components/marketing/HowItWorks.jsx`:
   - Section id="how-it-works"
   - 3-step horizontal (desktop) / vertical (mobile) layout with Framer Motion stagger
   - Step 1: 🎮 Play — "Child completes engaging emoji-based games across 6 chapters"
   - Step 2: 📊 Assess — "Behavioral patterns are analyzed across 4 clinical domains"
   - Step 3: 📋 Report — "Caregiver receives a friendly, plain-language screening summary"

4. Create `components/marketing/ResearchSection.jsx`:
   - 3 citation cards (ShadCN Card) with colored top borders:
     - ADOS-2 card (purple): brief plain-language description
     - DTT/Khowaja card (amber): brief description
     - EmoGalaxy card (blue): brief description + "93% screening accuracy"
   - Below cards: 4 domain overview cards showing domain name, weight %, chapter numbers, and a relevant emoji

5. Create `app/(marketing)/page.jsx` — Landing page composing: Hero + HowItWorks + ResearchSection + privacy callout section + CTA section. All sections with Framer Motion scroll-triggered fade-in animations using `whileInView`.

6. Create `app/(marketing)/about/page.jsx`:
   - Full research foundation section (citations with more detail)
   - Domain scoring explained in simple terms
   - Privacy data handling explanation
   - Prominent non-diagnostic disclaimer in a colored alert box
   - Team/institution info section (placeholder text)

7. Create `app/(marketing)/contact/page.jsx` (`'use client'`):
   - Form with: Name (optional), Email (required, validated), Role (ShadCN Select with 5 options), Message (textarea, 5-2000 chars with character counter)
   - Client-side validation before submit
   - POST to `/api/platform/contact`
   - Show success state (emoji + message) or error state
   - While submitting: button shows loading spinner

8. Create `app/(marketing)/survey/page.jsx` (`'use client'`):
   - Role selector (ShadCN Select)
   - Star rating using StarRating component (1-5)
   - Feedback textarea (optional)
   - Reads `?session=` from URL query params and includes it in POST body
   - POST to `/api/platform/survey`
   - Success state with thank-you message

9. Create `app/not-found.jsx` — friendly 404 page with a large 🗺️ emoji, "Oops! Page not found", and a "Go Home" button.

10. Create `app/error.jsx` — error boundary with a large 😕 emoji, "Something went wrong", and a "Try Again" button that calls the Next.js `reset()` function.

After building, run `bun dev`. Visit `localhost:3000` — the landing page should load and look polished. Check that the navigation works. Check mobile view by resizing your browser window to about 375px wide. Report any visual issues.

```

---

### PROMPT 10 — Chapter 1: My World

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–9 are complete. Now implement Prompt 10."*

```

Read CLAUDE.md Section 8 (Chapter Specifications — Chapter 1) carefully.

Implement Chapter 1: My World (Baseline chapter, no domain scoring).

1. Create `lib/gameData/chapter1.js` — static content:
   - `NAME_RESPONSE_TRIALS`: array of 3 objects with task key, delay (5000ms each), guide cue description
   - `GUIDE_TARGETS`: array of 5 objects with emoji object, position (x/y percent), task key

2. Create `app/(game)/chapter-1/level-1/page.jsx` (`'use client'`) — Name Response:
   - Show the guide character (GuideCharacter) prominently on a lavender gradient background
   - After a 2-second intro pause, the guide "calls the child's name" — animate the guide with a bounce + cueGuideSpeak() Tone.js sound
   - The child must tap the guide emoji. Record response time using TaskTimer.
   - After child taps (or after 8 seconds with no tap): score the trial and proceed to next
   - Run 3 trials total (ch1_l1_name_1, ch1_l1_name_2, ch1_l1_name_3)
   - Between trials: 5 second pause with guide in idle floatLoop animation
   - After 3 trials: POST scores to `/api/game/score`, POST each response to `/api/game/response`, navigate to level-2

3. Create `app/(game)/chapter-1/level-2/page.jsx` (`'use client'`) — Following the Guide:
   - Show PracticeDemo first (2 demo steps showing guide pointing → child taps object)
   - Render 5 large emoji objects scattered across the screen (positioned with absolute % coords)
   - Guide emoji appears with an animated "pointing" gesture (Framer Motion rotation) toward one emoji at a time
   - Child must tap the correct emoji, NOT the guide
   - Sequence through all 5 targets (ch1_l2_guide_1 through ch1_l2_guide_5)
   - Score each response using TaskTimer, POST to API
   - FeedbackBurst component shows on each response (correct: green burst + cueCorrect(); wrong: gentle shake + cueWrong())
   - After all 5: cueChapterComplete(), show chapter-complete card ("Great job! 🌟"), navigate to `/game/map`

4. Create `components/game/FeedbackBurst.jsx` (`'use client'`):
   - Correct: Framer Motion scale spike + green ring + celebrateBurst animation variant + cueCorrect() sound
   - Wrong: shakeFeedback animation variant on the wrong element + cueWrong() sound
   - Never shows text like "Wrong!" — keep feedback visual and gentle
   - Props: `show`, `correct`, `onComplete` callback

5. Create `components/game/SceneCanvas.jsx` (`'use client'`):
   - Full-viewport container
   - Sets background to chapter's CSS gradient from CHAPTER_THEMES
   - Accepts `chapterNumber` prop
   - Decorative floating emoji elements (3-5 random from the chapter's emoji palette) that drift slowly with Framer Motion in the background

After building, run `bun dev`. Navigate to `/game/start`, complete setup, land on the map, click Chapter 1, and play both levels end-to-end. Verify scores are being saved (check Neon console or add a console.log). Report any issues.

```

---

### PROMPT 11 — Chapter 2: Feeling World

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–10 are complete. Now implement Prompt 11."*

```

Read CLAUDE.md Section 8 (Chapter Specifications — Chapter 2) carefully.

Implement Chapter 2: Feeling World (social_communication domain).

1. Create `lib/gameData/chapter2.js`:
   - `FACE_CARDS`: 12 emoji face objects with `{ emoji, emotion, style, taskKey }` (emotion: 'happy'|'sad'|'angry'|'scared'; style: 'child'|'adult'|'animal')
   - `SCENARIO_CARDS`: 8 objects with `{ emoji, description, correctEmotion, taskKey }`
   - `EMOTION_BUCKETS`: 4 targets with emoji label and emotion key
   - `MIRROR_TRIALS`: 16 objects with `{ emotion, optionEmojis: [6 options], correctIndex, taskKey }`
   - `REGULATION_SCENARIOS`: 6 objects with `{ emoji, description, options: [{label, type: 'appropriate'|'avoidant'|'aggressive'}], taskKey }`

2. Create `app/(game)/chapter-2/level-1/page.jsx` (`'use client'`) — Emotion Matching:
   - Show PracticeDemo first (demonstrate drag to bucket)
   - Use DragDropSortable to allow dragging emoji face cards to 4 emotion buckets
   - Phase 1: 12 face cards presented 3 at a time (batches to reduce screen clutter)
   - Phase 2: 8 scenario cards (show emoji scene + description text)
   - Each drag scored based on CLAUDE.md scoring rules (accuracy tiers)
   - Track negative emotion (sad + scared) accuracy separately to detect red flag
   - After all items: calculate overall accuracy, apply scoring from CLAUDE.md, check red flag condition, POST score + individual responses + red flag (if triggered) to API
   - Navigate to level-2

3. Create `app/(game)/chapter-2/level-2/page.jsx` (`'use client'`) — Expression Mirror:
   - Show PracticeDemo first
   - Show one trial at a time: large emotion word centered + play Tone.js mood cue (major chord = happy/surprise; minor chord = sad/scared; dissonant = angry)
   - Grid of 6 emoji face options (2×3 or 3×2, large tappable)
   - Child taps one — score using CLAUDE.md rules — FeedbackBurst — next trial
   - After 16 trials: POST accumulated score + responses, navigate to level-3

4. Create `app/(game)/chapter-2/level-3/page.jsx` (`'use client'`) — Regulation Scenarios:
   - Show PracticeDemo first
   - Show one scenario at a time: large emoji scene illustration + short description text
   - 3 large emoji response buttons (one per type: appropriate/avoidant/aggressive)
   - Track response time via TaskTimer — if >15s, add 1 pt penalty
   - Score using CLAUDE.md rules — FeedbackBurst on selection — next scenario
   - After 6 scenarios: POST score + responses, navigate to `/game/map`

5. Create `components/game/DragDropSortable.jsx` (`'use client'`):
   - Wraps @dnd-kit DndContext + SortableContext
   - Accepts `items` (draggable emoji cards) and `targets` (drop zones)
   - On successful drop: calls `onDrop(itemId, targetId)` callback
   - Visual feedback: dragging item scales up slightly; valid drop target highlights
   - Works with both pointer and touch events (dnd-kit handles this automatically)

After building, run `bun dev`. Play through all 3 levels of Chapter 2 end-to-end. Verify the emotion matching drag-and-drop works on both desktop and mobile viewport. Verify chapter score is saved after completing level-3. Report any issues.

```

---

### PROMPT 12 — Chapter 3: Social World

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–11 are complete. Now implement Prompt 12."*

```

Read CLAUDE.md Section 8 (Chapter Specifications — Chapter 3) carefully.

Implement Chapter 3: Social World (social_communication domain, includes imitation).

1. Create `lib/gameData/chapter3.js`:
   - `GREETING_STEPS`: 3 steps with emoji, action label, timing, taskKey
   - `CONVO_EXCHANGES`: 6 objects with `{ friendEmoji, friendText, options: [{emoji, text, type: 'appropriate'|'factual'|'social'|'off_topic'}], taskKey }` — include one ToM probe at index 4
   - `TOM_PROBE`: `{ setup, question, options: [{text, isCorrect}] }` — false-belief scenario
   - `DISCOVERY_EVENTS`: 5 objects with `{ emoji, description, type: 'friend_finds'|'child_finds', taskKey }`
   - `IMITATION_ACTIONS`: 10 objects with `{ emoji, label, modality: 'facial'|'body'|'object', options: [4 emojis], correctIndex, taskKey }`

2. Create `app/(game)/chapter-3/level-1/page.jsx` — Greeting Sequence:
   - Animated scene: child avatar emoji on the left, friend emoji behind a door emoji on the right
   - Sequence plays in 3 steps with timed prompts:
     Step 1: Door shows → "Knock!" button appears → child taps → door opens animation (Framer Motion)
     Step 2: Friend emoji appears smiling → "Wave back! 👋" button → child taps
     Step 3: Friend's face highlighted → "Look at your friend 👀" zone → child taps face area
   - Score each step via TaskTimer (delay points for >4s on eye-contact step)
   - POST responses + score → navigate to level-2

3. Create `app/(game)/chapter-3/level-2/page.jsx` — Conversation + Theory of Mind:
   - Chat-bubble UI: friend emoji on the left with a speech bubble, child emoji on the right with response choices
   - Show one exchange at a time; 3-4 large tappable response option buttons
   - Exchange 5 is the ToM probe: show a narrative ("Friend hides toy, then leaves...") with emoji illustration → "Where will friend look first?" → 2 options → score based on correct ToM answer
   - Track: factual-over-social count (if ≥5/6 → add +5 pts), off-topic count
   - POST responses + score → navigate to level-3

4. Create `app/(game)/chapter-3/level-3/page.jsx` — Sharing & Joint Attention:
   - Shared play scene: child avatar + friend avatar on a playmat with emoji objects scattered around
   - Trigger 5 discovery events in sequence:
     Friend-finds events: friend emoji "points" (animated arrow) → child must tap the pointed-at object
     Child-finds events: highlighted emoji object + two buttons: "🎁 Share!" / "🤐 Keep"
   - Score each: miss/no-tap → 2 pts, wrong target → 2 pts, keeps instead of shares → 2 pts
   - POST responses + score → navigate to level-4

5. Create `app/(game)/chapter-3/level-4/page.jsx` — Copy Cat (Imitation):
   - Show PracticeDemo first
   - Each trial: animated emoji action clip plays (use Framer Motion to animate the emoji action sequence, e.g., hand emoji moves up-down for "wave")
   - Grid of 4 large emoji option buttons
   - Score: facial errors = 2 pts, body/object = 1 pt, timeout 8s = 2 pts
   - Track total errors; if ≥5: POST red flag `poor_imitation_all_modalities`
   - After 10 trials: POST score + responses + flag (if triggered) → navigate to `/game/map`

After building, run `bun dev`. Play through all 4 levels of Chapter 3. Verify the ToM probe appears in level-2 at the correct exchange. Verify the friend's pointing animation works in level-3. Report any issues.

```

---

### PROMPT 13 — Chapters 4 & 5

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–12 are complete. Now implement Prompt 13."*

```

Read CLAUDE.md Section 8 (Chapter Specifications — Chapters 4 and 5) carefully.

Implement Chapter 4: Routine & Patterns and Chapter 5: Pretend & Senses.

CHAPTER 4 — ROUTINE & PATTERNS (restricted_repetitive domain):

1. Create `lib/gameData/chapter4.js` with all static content: routine cards, scenario options, pattern sequences, topic books.

2. `app/(game)/chapter-4/level-1/page.jsx` — Morning Routine Sequence:
   - 6 emoji cards in a DragDropSortable area; child drags them into the correct order
   - Cards: ⏰ Wake → 🦷 Teeth → 👕 Dress → 🥣 Breakfast → 🎒 Pack → 👟 Shoes
   - Score each sequence error (+1 pt each); if can't complete after 3 attempts: 3 pts
   - After correct sort: disruption appears: "😮 The clean shirt is in the wash!" → show 3 emoji response buttons (flexible/neutral/rigid)
   - Score disruption response; POST all → navigate to level-2

3. `app/(game)/chapter-4/level-2/page.jsx` — Flexibility Challenge:
   - Sub-scene A: 5 emoji activity buttons; child picks one → animation plays; "Try something new! 🔄" appears × 4; track same-activity selections
   - Sub-scene B: 3 unexpected scenario emoji cards → 3 response buttons each (flexible/distress/rigid)
   - Score both sub-scenes; POST → navigate to level-3

4. `app/(game)/chapter-4/level-3/page.jsx` — Pattern Detective:
   - Show PracticeDemo first
   - 3 pattern sequences displayed as emoji chains (AB: 🔴🔵🔴🔵*** | ABC: ⭐🌙☀️⭐🌙☀️*** | AABBC: complex)
   - Child taps the correct next emoji from 3-4 options
   - After each completion: introduce forced error (wrong emoji appears in chain) + pattern type changes
   - Detect distress response (if child taps same area repeatedly after error) and refusal (timeout >10s on next pattern)
   - Red flag trigger: distress + insistence → POST `rigid_pattern_distress`
   - POST score + responses → navigate to level-4

5. `app/(game)/chapter-4/level-4/page.jsx` — Special Interests:
   - 8 emoji topic cards displayed in a grid
   - Child taps a card → full-screen "fact slides" appear (5 emoji-illustrated facts per topic)
   - After slide 5: guide says "📚 Try a different book!" with a gentle animation
   - Track: same topic re-selected count, slides read per topic, transition delay via TaskTimer
   - Apply scoring rules from CLAUDE.md; POST → navigate to `/game/map`

CHAPTER 5 — PRETEND & SENSES (pretend_play + sensory_processing domains):

6. Create `lib/gameData/chapter5.js` with: pretend scenarios, object palette, sensory stimuli list.

7. `app/(game)/chapter-5/level-1/page.jsx` — Pretend Play Recognition:
   - Show PracticeDemo first
   - 5 emoji animation clips: show a sequence of emoji illustrating the pretend scenario (e.g., 🍌 → 📞 → 😊 speaking)
   - After each clip: two large buttons — "🎭 They're pretending!" / "📌 [literal interpretation]"
   - Score: literal answer = 2 pts; timeout = 1 pt
   - If all 5 answered literally: POST red flag `complete_absence_pretend_play`
   - POST score + responses → navigate to level-2

8. `app/(game)/chapter-5/level-2/page.jsx` — Create Pretend World:
   - 4 scenario prompts shown one at a time (Tea Party / Superheroes / Trip / House)
   - Object palette: scrollable row of emoji objects — some literal-only (🪑🍽️), some symbolic-eligible (📦🥄🧸)
   - Child taps objects to "use" them in the scenario
   - Detect: no symbolic selections → 4 pts; rigid/same use → 2 pts; timeout → 3 pts
   - POST score → navigate to level-3

9. `app/(game)/chapter-5/level-3/page.jsx` — Sensory Explorer:
   Sub-scene A (Sounds):
   - Show 6 synthesized sounds one at a time with animated source emoji
   - Each sound plays via `cueSound(type)` Tone.js function; animated emoji "source" pulses while playing
   - 6 emoji rating buttons: 😊 / 😐 / 😟 / 😢 / 🙉 / 🚪
   - Score per rating; track total distressing; red flag if ≥4 distressing: POST `extreme_sensory_distress`

   Sub-scene B (Visual & Texture):
   - 8 emoji pattern/texture cards displayed in a DragDropSortable grid
   - 4 target zones: ❤️ Love / 👍 Okay / 👎 Dislike / ✋ Won't Touch
   - Child drags each card to a zone
   - Score per placement; accumulate aversion count
   - POST both sub-scene scores + all responses → navigate to `/game/map`

After building, run `bun dev`. Play through Chapters 4 and 5 completely. Specifically test: the drag-sort routine (verify order detection works), the pattern sequences (verify they display correctly), and the sound synthesis in Chapter 5 Level 3 (verify Tone.js plays sounds without errors). Report any issues.

```

---

### PROMPT 14 — Chapter 6: Grand Finale & Results

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–13 are complete. Now implement Prompt 14."*

```

Read CLAUDE.md Section 8 (Chapter 6 — Grand Finale) and the full result object spec in Section 10 carefully.

Implement Chapter 6 and the complete results flow.

1. Create `lib/gameData/chapter6.js`:
   - `TASK_POOL`: an array of 60+ task descriptors, one for each scoreable task from Chapters 1-5
   - Each descriptor: `{ taskKey, chapter, level, type, mechanic, emoji, prompt, options }`
   - The mechanic types must mirror the original level mechanic (e.g., emotion_match, imitation_grid, pattern_complete)
   - Export `sampleTasks(sessionId, count = 15)`: deterministic seeded random selection using the sessionId string as a numeric seed (sum char codes, modulo array length)

2. Create `app/(game)/chapter-6/page.jsx` (`'use client'`) — Grand Finale:
   - Fetch 15 tasks from `/api/game/chapter6/tasks?seed={sessionId}` on mount
   - Show a brief animated intro: "🏆 Grand Finale! Let's revisit your favorite challenges!"
   - Render each sampled task using a `DynamicTask` component (see below) with the same mechanics as the original
   - Show VisualSchedule with 15 task emoji dots
   - After all 15 tasks:
     a. POST all responses to `/api/game/response`
     b. Call `GET /api/game/results/{sessionId}`
     c. Navigate to the results section of the same page (or scroll down to it)

3. Create `components/game/DynamicTask.jsx` (`'use client'`):
   - Accepts a task descriptor object and an `onComplete(scorePoints, isCorrect)` callback
   - Renders the appropriate UI based on `mechanic` field:
     - `'tap_target'` → single emoji tap (name response / guide following mechanic)
     - `'emotion_match'` → drag emoji to bucket
     - `'grid_select'` → tap from grid of 4-6 options
     - `'drag_sort'` → small drag-sort of 3-4 items
     - `'scenario_choice'` → 3 option buttons
   - Uses TaskTimer for response time

4. Results display within `chapter-6/page.jsx` (shown after scoring completes):
   - Chapter-complete animation: ConfettiBlast component + cueChapterComplete() sound
   - "🎉 Amazing journey, [playerName]!" heading
   - 4 domain score cards: each shows domain name, emoji icon, risk level badge (colored), short plain-language description of what the domain measures
   - Combined risk level: large colored badge (green=low, yellow=medium, orange=high, red=very_high)
   - Red flags section: list of triggered flags in plain child-friendly language (e.g., "We noticed some things about patterns that might be worth exploring")
   - Non-diagnostic disclaimer: prominent colored alert box — "This is a screening tool, not a diagnosis. Please share these results with a qualified specialist."
   - Break count shown if > 2: "Thanks for being patient — taking breaks is perfectly okay!"
   - Two action buttons:
     a. "📋 View Caregiver Report" → opens `/report/{sessionId}?token={reportToken}` in a new tab
     b. "💬 Share Your Feedback" → links to `/survey?session={sessionId}`
   - Consistency flag shown to researcher (not child): if `consistencyFlag === true`, small subtle note

5. Create `app/report/[sessionId]/page.jsx` — Caregiver Report (Server Component):
   - Read `token` from URL search params using `searchParams` (Next.js 15 async searchParams)
   - Verify via `verifyReportToken(sessionId, completedAt, token)` — if fails, render error state
   - Query `game_sessions` + `domain_scores` + `red_flags` for this sessionId
   - Render a clean, print-friendly report with:
     - "Horizons Screening Summary" title
     - Date and child's first name (or "Your Child")
     - 4 domain cards with plain-language risk descriptions (no raw numbers; use phrases like "typical range", "some differences noted", "significant differences")
     - Overall risk indicator as a colored emoji gauge (🟢/🟡🟠🔴)
     - Red flags in plain language (no clinical jargon)
     - "What to do next" section with specialist consultation CTA
     - Footer: "This report was generated by Horizons, a research-based screening tool. It is not a medical diagnosis. Always consult a qualified specialist."
     - Print button (calls `window.print()`)

After building, play through the entire game from `/game/start` → Chapter 1 → Chapter 2 → Chapter 3 → Chapter 4 → Chapter 5 → Chapter 6. Verify the results page loads with domain scores. Visit the caregiver report URL. Run `bun test tests/integration/scoring-pipeline.test.js` and fix any failures. Report any issues.

```

---

### PROMPT 15 — Researcher Dashboard (Core)

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–14 are complete. Now implement Prompt 15."*

```

Read CLAUDE.md Section 15 (Researcher Dashboard) carefully.

Implement the researcher dashboard — the data analysis interface for clinicians.

1. Create `app/dashboard/layout.jsx` (`'use client'`):
   - Auth guard: if no Better Auth session, this is handled by middleware.js already — but also add a client-side `useEffect` to call `/api/auth/session` and redirect to login if null
   - Sidebar navigation (desktop `lg:` breakpoint):
     - Logo "🧠 Horizons" at top
     - Nav items with icons (lucide-react) and labels: Overview / Sessions / Analytics / Accounts / Inbox / Feedback
     - Admin-only items (Accounts, Inbox, Feedback): only show if user.role === 'admin'
     - Active item has animated indicator (Framer Motion layout animation on the active pill)
     - "Sign Out" at the bottom — POST to `/api/auth/sign-out`, redirect to `/dashboard/login`
   - Mobile: hamburger button → ShadCN Sheet drawer with same nav
   - Main content area: `{children}` with `fadeSlide` Framer Motion transition

2. Create `app/dashboard/page.jsx` — Overview:
   - Fetch from `/api/dashboard/sessions` on mount (use SWR-style fetch in useEffect or Server Component + fetch)
   - 4 stat cards (ShadCN Card): Total Sessions, Completed, Completion Rate %, Average Combined Score
   - DomainRadarChart (placeholder if no data)
   - RiskDistributionChart (Recharts Pie — 4 slices: low/medium/high/very_high with green/yellow/orange/red)
   - Sessions table (SessionsTable component)

3. Create `components/dashboard/SessionsTable.jsx` (`'use client'`):
   - Filterable by: status (select), risk level (select), search text (input — matches name or ID)
   - Columns: Date, Name (or "Anonymous"), Age, Status badge, Risk badge (colored), Score, "View" link, "Delete" button
   - Delete triggers confirmation dialog (ShadCN AlertDialog) then DELETE to `/api/dashboard/sessions/[id]`
   - Pagination: show 20 per page with previous/next buttons

4. Create `app/dashboard/sessions/[id]/page.jsx` — Session Detail:
   - Fetch full session detail from `/api/dashboard/sessions/[id]`
   - Header: name, age, date, status badge, combined score, risk level badge
   - ShadCN Tabs with 3 panels:
     Panel "Overview": DomainRadarChart + chapter score bar chart (ResponseTimeChart) + RedFlagList
     Panel "Tasks": ShadCN Table of all task_responses (chapter, level, task_key, is_correct, attempt_number, response_time_ms, score_points)
     Panel "Mouse Data": MouseHeatmap canvas component
   - Two action buttons: "📥 Export JSON" (triggers download) and "🗑️ Delete Session" (confirm dialog + DELETE + redirect)

5. Create `components/dashboard/DomainRadarChart.jsx` — Recharts RadarChart with 4 axes (one per domain). Shows raw_score and risk_level. Color-coded fills.

6. Create `components/dashboard/ResponseTimeChart.jsx` — Recharts BarChart showing average response_time_ms per chapter. Horizontal bars.

7. Create `components/dashboard/MouseHeatmap.jsx` (`'use client'`):
   - Canvas element, dimensions 1000×600 (scaled to fit container)
   - On mount: fetch mouse_movements from the session data (passed as prop)
   - Draw a radial gradient "heat dot" for each point — accumulate opacity
   - Use red-yellow color scale for density

8. Create `components/dashboard/RedFlagList.jsx`:
   - List of red flag objects with severity badge (mild=blue, moderate=amber, severe=red) and description
   - If empty: show "✅ No red flags detected" in green

9. Create `app/dashboard/analytics/page.jsx`:
   - Fetch aggregate stats from multiple dashboard API calls
   - 6 Recharts charts:
     a. Sessions per day (LineChart, 30 days, from game_sessions.started_at)
     b. Completion rate (PieChart donut: completed vs abandoned vs active)
     c. Risk distribution (BarChart: 4 risk levels)
     d. Age distribution (BarChart: ages 3-10, count per age)
     e. Average chapter completion time (BarChart: 6 chapters)
     f. Survey rating distribution (BarChart: ratings 1-5)
   - All charts use Recharts with consistent color palette
   - Vercel Analytics note: add a card explaining Vercel Analytics is tracking visitor stats automatically

After building, run `bun dev`. Log into the dashboard and verify:

- Overview stats show correctly
- Sessions table filters work
- Clicking a session shows the detail page with working tabs
- Mouse heatmap renders (even if empty)
- Analytics page shows all 6 charts (even if data is empty)
  Report any issues.

```

---

### PROMPT 16 — Dashboard Admin Pages

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–15 are complete. Now implement Prompt 16."*

```

Read CLAUDE.md Section 15 (Researcher Dashboard — Accounts, Feedback, Inbox sections) carefully.

Implement the three admin-only dashboard pages.

1. Create `app/dashboard/accounts/page.jsx` (`'use client'`):
   - Verify user is admin (fetch from `/api/auth/session`); if not, show "Access denied 🔒" message
   - Fetch accounts from `GET /api/dashboard/accounts`
   - AccountsTable component (below) + "Add Account" button

2. Create `components/dashboard/AccountsTable.jsx` (`'use client'`):
   - Table with columns: Email, Role badge (researcher=blue, admin=purple), Created At, Last Login, Active toggle (ShadCN Switch)
   - Active toggle calls `PATCH /api/dashboard/accounts/[id]` with `{ isActive: !current }`
   - "Add Account" triggers a ShadCN Dialog with: Email input, Password input, Role select (researcher/admin), Submit button → POST `/api/dashboard/accounts`
   - Optimistic UI: show new account immediately, revert on error

3. Create `app/dashboard/feedback/page.jsx` (`'use client'`):
   - Verify admin
   - Fetch from `GET /api/dashboard/survey`
   - Summary section: total count, average rating shown as large star display (e.g., "4.2 ⭐"), bar chart of rating distribution (use Recharts small BarChart)
   - Table: submitted_at, role, star rating (StarRating read-only), feedback preview (max 100 chars + "...")
   - Click a row: expands inline to show full feedback text + link to game session (if present)

4. Create `app/dashboard/inbox/page.jsx` (`'use client'`):
   - Verify admin
   - Fetch from `GET /api/dashboard/contact`
   - Filter tabs (ShadCN Tabs): All / New / Read / Archived — "New" tab shows unread count badge
   - Two-pane layout on desktop (`md:` breakpoint): message list (left, 1/3 width) + detail panel (right, 2/3 width)
   - On mobile: list view only; tap a message to open detail (uses ShadCN Sheet)
   - Message list item: sender name/email, role badge, timestamp, first 60 chars of message, status dot
   - Detail panel: full sender info, role, full timestamp, full message, action buttons:
     - "Mark Read" → PATCH status to 'read'
     - "Archive" → PATCH status to 'archived'
     - "Reply" → opens `mailto:email?subject=Re: Horizons Contact&body=...` link
   - When a message is selected from the list, auto-mark as read

After building, run `bun dev`. Log in as admin and test all three pages. Verify:

- You can create a new researcher account and it appears in the table
- You can toggle active/inactive status
- Feedback page shows (even if empty, charts render)
- Inbox shows the two-pane layout on desktop, collapses on mobile
- Marking messages as read updates the "New" badge count
  Report any issues.

```

---

### PROMPT 17 — Testing Suite

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–16 are complete. Now implement Prompt 17."*

```

Read CLAUDE.md Section 17 (Testing Strategy) carefully.

Create the full test suite.

1. Create `tests/unit/scoring.test.js` using Bun's built-in test runner (import { test, expect } from 'bun:test'):
   - Test `calculateCombinedScore` with: all zeroes → 0; max domain scores no flags; single domain score; all flags stacked → verify 2.0× cap applies
   - Test `getRiskLevel` for: 0 → 'low'; 25 → 'low'; 26 → 'medium'; 45 → 'medium'; 46 → 'high'; 65 → 'high'; 66 → 'very_high'; 999 → 'very_high'
   - Test `getDomainRisk` for each domain at each threshold boundary
   - Test `calcGameAccuracy`: (0, 0) → 0; (3, 10) → 0.3; (10, 10) → 1
   - Test `calcAvgAttempts`: (0, 0) → 0; (15, 5) → 3

2. Create `tests/unit/redFlags.test.js`:
   - Test each of 5 red flag conditions: triggered when condition is met, absent when not
   - Test multiplier stacking: 2 flags → product of multipliers; 4+ flags → capped at 2.0×
   - Test: `negative_emotion_recognition_under_50` triggered at 49% negative accuracy, not triggered at 50%
   - Test: `complete_absence_pretend_play` triggered when all 5 = literal, not triggered with 4 literal

3. Create `tests/unit/utils.test.js`:
   - Test `calcGameAccuracy` and `calcAvgAttempts` edge cases
   - Test `generateId` returns a UUID v4 format string (regex: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
   - Test `formatTime`: formatTime(1000) === '1s'; formatTime(65000) → includes 'm' and 's'; formatTime(0) → '0s'
   - Test `cn()` merges class strings correctly

4. Create `tests/integration/scoring-pipeline.test.js` (uses a real test DB at DATABASE_URL_TEST):
   - beforeAll: run migrations on test DB
   - afterAll: drop all test data
   - Test 1: Create session → add chapter scores for all domains → call results API → verify domain scores in DB and correct risk levels returned
   - Test 2: Create session → add chapter scores → add 2 red flag records → call results API → verify combined score is multiplied correctly
   - Test 3: Simulate Chapter 6 performance >20% worse than original → verify `consistencyFlag: true` in result

5. Create `tests/integration/api.test.js`:
   - Test POST `/api/game/session` with valid data → 200 + sessionId
   - Test POST `/api/game/session` with playerAge=2 (invalid) → 400 + error
   - Test PATCH `/api/game/session/[id]` with status update → 200
   - Test POST `/api/game/response` → 200 + id
   - Test POST `/api/game/score` → 200
   - Test POST `/api/game/flag` → 200
   - Test POST `/api/platform/contact` with valid data → 200
   - Test POST `/api/platform/contact` without email → 400
   - Test POST `/api/platform/survey` with rating 3 → 200
   - Test GET `/api/dashboard/sessions` without auth → 401
   - Test GET `/api/dashboard/accounts` without admin → 401 or 403

6. Create `scripts/migrate-test.js` — runs the same schema migrations against DATABASE_URL_TEST.

Run `bun test` — all unit tests must pass. Run `bun test tests/integration/` with DATABASE_URL_TEST set — all integration tests must pass. Fix every failure before proceeding.

```

---

### PROMPT 18 — Final Polish & Accessibility

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–17 are complete. Now implement Prompt 18."*

```

Review the complete implementation across all files and apply final polish. Do not add new features — only improve what exists.

1. Accessibility audit — check every interactive element across all game pages:
   - All game buttons and tap targets: verify minimum 64×64px (add padding if needed)
   - All text in game: verify minimum 16px (use `text-lg` or larger in Tailwind)
   - All emoji elements used as interactive targets: add `aria-label` attributes with the emoji's meaning
   - All forms on marketing pages: add proper `<label>` elements and `aria-describedby` for error messages
   - Add `role="button"` and `tabIndex={0}` to any `<div>` elements used as buttons

2. Framer Motion — `prefers-reduced-motion`:
   - In `lib/visual/animations.js`, add a check: if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, return a variant with `duration: 0.01` instead of the full animation
   - Apply this to `pageTransition`, `floatLoop`, and `celebrateBurst` variants

3. Tone.js — autoplay policy:
   - Verify Tone.js is only started after a user gesture (tap/click)
   - In `lib/sound/synth.js`: if `Tone.context.state !== 'running'`, call `Tone.start()` on the first user interaction event
   - This should already be handled but verify it doesn't throw "AudioContext was not allowed to start" warnings in the browser console

4. Mobile responsiveness — verify on 375px viewport:
   - Open browser DevTools → set device to iPhone SE (375×667)
   - Check: landing page hero looks correct; navigation hamburger works; game start form is usable; chapter map islands are all visible and tappable; drag-and-drop works with touch simulation on; dashboard login is usable
   - Fix any overflow issues (add `overflow-x: hidden` to body if needed)

5. Add `app/layout.jsx` root layout:
   - Import and render `<Analytics />` from `@vercel/analytics/react`
   - Import a Google Font (Nunito) using Next.js font optimization: `import { Nunito } from 'next/font/google'`
   - Apply the font class to `<body>`
   - Set `<html lang="en">`
   - Add basic metadata: title "Horizons", description

6. Error boundaries — verify `app/error.jsx` and `app/not-found.jsx` exist and render correctly. Visit `localhost:3000/nonexistent-page` to test the 404 page.

7. Security — verify no secrets are exposed:
   - Check all `'use client'` files: confirm none import from `lib/db/` or `lib/auth.js`
   - Check all `lib/db/` files: confirm they have no React imports or browser-only APIs
   - Check `.env.local` is in `.gitignore`

8. Run the complete test suite one final time: `bun test`. All tests must pass.

9. Run `bun run build` — verify the production build completes without errors. Fix any build errors (they are usually about missing `'use client'` directives or incorrect server/client boundary violations).

Report the final test results and build status.

```

---

### PROMPT 19 — Deployment to Vercel

> **New session after `/clear`?** Paste this first: *"Continuing the Horizons project. Read CLAUDE.md in the project root. Prompts 1–18 are complete. Now implement Prompt 19."*

```

The code is ready for deployment. Help me deploy to Vercel.

1. Initialize a git repository in this project if not already done:
   Run: `git init && git add . && git commit -m "Initial Horizons implementation"`

2. Create a `.gitignore` if not present (should already exist from Prompt 1). Confirm it includes: `.env.local`, `node_modules/`, `.next/`

3. Create `public/manifest.json` with a minimal PWA manifest:
   - name: "Horizons"
   - short_name: "Horizons"
   - start_url: "/"
   - display: "standalone"
   - background_color: "#6366f1"
   - theme_color: "#6366f1"
   - icons: empty array (no icons needed since we're using emoji)

4. In `app/layout.jsx`, add the PWA metadata link: `<link rel="manifest" href="/manifest.json" />`

5. Create `vercel.json` at the project root:
   {
   "buildCommand": "bun run build",
   "installCommand": "bun install",
   "framework": "nextjs"
   }

After making these changes, tell me the git remote command to add (I will push to GitHub myself) and give me the exact list of environment variables I need to add in the Vercel dashboard before deploying.

```

**After PROMPT 19, you do the following manually:**

1. Create a GitHub repository at **github.com** (click "New Repository")
2. Push your code: run the git remote command Claude gave you, then `git push -u origin main`
3. Go to **vercel.com** → Sign Up (free) → "Import Git Repository" → select your GitHub repo
4. In Vercel → Settings → Environment Variables — add all the env vars Claude listed
   - Change `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your Vercel URL (e.g., `https://horizons.vercel.app`)
5. Click "Deploy" — Vercel builds and deploys automatically
6. Once deployed: run `bun scripts/seed-admin.js` with `DATABASE_URL` set to your Neon URL (not the test URL) to create your admin account on the live database

---

## PART 3 — TIPS FOR SMOOTH IMPLEMENTATION

### If Claude makes an error or gets confused:
- Say: "Stop. Revert that change. Read CLAUDE.md Section [X] again and re-implement it correctly."
- If something is broken: "Run `bun dev` and show me the error message."

### If a prompt is too large and Claude stops mid-way:
- Say: "Continue from where you stopped. You were implementing [describe the last file]."

### Session management:
- You can keep the same Claude Code session for all prompts
- If the session gets very long (>2 hours of work), start a new Claude Code session. Paste this at the top: "I am continuing the Horizons project. Read CLAUDE.md carefully. We have completed up to Prompt [X]. Continue with Prompt [X+1]."

### Running the app during development:
- Terminal 1: `bun dev` (keeps running, restarts automatically)
- Terminal 2: for running other commands (tests, seed scripts)

### Checking if data is saved to Neon:
- Go to **console.neon.tech** → your project → "SQL Editor"
- Run: `SELECT * FROM game_sessions ORDER BY started_at DESC LIMIT 10;`

### If `bun test` fails:
- Always fix test failures before moving to the next prompt
- Say to Claude: "The following tests are failing: [paste error]. Fix them."

### The order matters:
- Never skip a prompt
- Never run Prompt 12 before Prompt 6 (you need the API routes before the game chapters)
- Prompts 1-7 are the foundation; they must all succeed before touching game content
```
