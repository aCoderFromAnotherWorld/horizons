# HORIZONS — Phase Prompts for Codex

> Use these prompts sequentially. Complete and test each phase fully before moving to the next.
> Copy the exact prompt and paste it into Codex.

---

## PHASE 1 — Project Setup & Infrastructure

**Recommended Model:** `GPT-5.4 (Medium)` (fast, precise for boilerplate)
**Estimated Time:** 30–45 min

```
I'm building a Next.js 15 project called "horizons" — an ASD screening game for children.
Set up the complete project infrastructure exactly as specified in AGENTS.md.

Perform these steps in order:

1. Initialize a new Next.js 15 project named "horizons" (actually `.` for this current project) using bun (modify the `horizons` to current directly that is already open):
   `bun create next-app@latest horizons --no-typescript --tailwind --eslint --app --src-dir no --import-alias "@/*"`

2. Navigate into the project and configure it:
   - Set up Tailwind CSS v4 (update package.json, tailwind.config.js, globals.css with @theme tokens as in AGENTS.md)
   - Initialize ShadCN with `bunx shadcn@latest init` using the components.json config from AGENTS.md (tsx: false, style: default, baseColor: violet)
   - Install all ShadCN components listed in AGENTS.md section 2
   - Install all dependencies from AGENTS.md section 2 using bun

3. Create the complete directory structure from AGENTS.md section 3 (create all folders and placeholder index.js files)

4. Create `next.config.js`, `components.json`, `bunfig.toml` as specified in AGENTS.md

5. Add a `.env.local` file with the variables from AGENTS.md section 14

6. Create `app/globals.css` with Tailwind v4 @theme configuration

7. Create `lib/utils.js` with a `cn()` helper (clsx + tailwind-merge), `generateId()` (crypto.randomUUID), and `formatTime(ms)` helper

8. Create `app/page.jsx` as a simple placeholder that says "Horizons - Loading..."

9. Run `bun dev` and confirm it starts without errors

10. Run `bun test` and confirm 0 failures (no tests yet is fine)

Report each step's status. If anything fails, fix it before continuing.
```

---

## PHASE 2 — Database Layer

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 45–60 min

```
The project "horizons" is set up. Now implement the complete database layer.

Using AGENTS.md sections 4, 5, and the queries structure in section 3, do the following:

1. Create `lib/db/schema.js` with all CREATE TABLE and CREATE INDEX statements exactly as in AGENTS.md section 4

2. Create `lib/db/migrations.js` — a simple function that checks for and runs any pending schema additions. For now it just logs "DB ready".

3. Create `lib/db/index.js` — singleton bun:sqlite Database instance as in AGENTS.md section 5. Use `process.env.DB_PATH || './horizons.db'` for the path.

4. Create all query files in `lib/db/queries/`:
   - `sessions.js` — createSession(data), getSession(id), updateSession(id, data), listSessions(), deleteSession(id)
   - `responses.js` — createResponse(data), getResponsesBySession(sessionId), getResponsesByTask(sessionId, taskKey)
   - `scores.js` — addChapterScore(data), getScoresBySession(sessionId), getTotalScoreByChapter(sessionId, chapterKey)
   - `mouseMovements.js` — batchInsertMouseMovements(movements[]), getMovementsBySession(sessionId)
   - `redFlags.js` — addRedFlag(data), getRedFlagsBySession(sessionId)
   - `domainScores.js` — upsertDomainScore(data), getDomainScoresBySession(sessionId)

   All functions use the singleton DB from index.js. All bun:sqlite calls are synchronous (no await).

5. Write unit tests in `tests/unit/db.test.js`:
   - Import { Database } from 'bun:sqlite' directly
   - Use an in-memory DB (':memory:') for all tests
   - Test each CRUD function
   - Test that foreign key constraints work
   - Test cascade delete (delete session → responses deleted)
   - Minimum 20 test cases

6. Run `bun test tests/unit/db.test.js` — all tests must pass before finishing this phase.

Show me the test results.
```

---

## PHASE 3 — Core Game Engine & API Routes

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 60–90 min

```
Database layer is complete. Now build the core game engine: scoring system, Zustand store, and all API routes.

1. Build the scoring engine in `lib/scoring/`:
   - `thresholds.js` — all constants: DOMAIN_WEIGHTS, DOMAIN_MAX_POINTS, DOMAIN_THRESHOLDS, COMBINED_THRESHOLDS, RED_FLAG_MULTIPLIERS (exactly as in AGENTS.md section 7)
   - `engine.js` — all functions: calculateCombinedScore(), getRiskLevel(), getDomainRisk(), calcGameAccuracy(), calcAvgAttempts() (exactly as in AGENTS.md section 7)
   - `domains.js` — CHAPTER_TO_DOMAIN map + function aggregateDomainScores(sessionId) that reads from DB and computes all four domain raw scores
   - `redFlags.js` — function detectAndSaveRedFlags(sessionId) that checks all conditions from AGENTS.md and inserts any triggered flags

2. Write `tests/unit/scoring.test.js`:
   - Test calculateCombinedScore with known inputs
   - Test all red flag multipliers
   - Test getRiskLevel at boundary values (25, 26, 45, 46, 65, 66)
   - Test calcGameAccuracy(10, 15) === 0.667
   - Test calcAvgAttempts(18, 12) === 1.5
   - Minimum 30 test cases covering all edge cases

3. Create Zustand store `store/gameStore.js` exactly as in AGENTS.md section 6. Also create `store/avatarStore.js` with: { hair: 0, clothes: 0, hairColor: 0, clothesColor: 0 } and setters.

4. Create all API routes in `app/api/`:
   - `session/route.js` — POST creates session, GET lists all sessions
   - `session/[id]/route.js` — GET single session, PATCH update, DELETE
   - `response/route.js` — POST log task response
   - `score/route.js` — POST add chapter score points
   - `mouse/route.js` — POST batch mouse movements
   - `flag/route.js` — POST add red flag
   - `results/[sessionId]/route.js` — GET: runs full scoring pipeline and returns domain scores, combined score, risk level, red flags

5. Write `tests/integration/api.test.js`:
   - Use bun's fetch to test each API route
   - Test the full session lifecycle
   - Test that results endpoint triggers scoring correctly
   - Minimum 15 test cases

6. Create `hooks/useTaskTimer.js`, `hooks/useMouseTracker.js`, `hooks/useAudio.js` as described in AGENTS.md

7. Run `bun test` — ALL tests must pass.

Show me the final test results.
```

---

## PHASE 4 — Main Menu & Onboarding

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 45–60 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Core engine is ready. Now build the main menu and onboarding flow.

1. Update `app/page.jsx` — Main menu with:
   - Full-screen background (use /assets/backgrounds/main-menu.webp with colorful gradient fallback: from-indigo-400 via-purple-400 to-pink-400)
   - Large "HORIZONS" title with playful styling (Nunito font, large, white)
   - "Play" button (big, green, rounded) → opens age entry dialog
   - "Researcher Dashboard" button (small, bottom corner) → /researcher
   - Animated floating elements using Framer Motion (stars, circles)
   - Session restore toast if an active session exists in Zustand store

2. Create age/name entry as a ShadCN Dialog:
   - Child's first name (optional text input)
   - Age selector (big circular buttons: 3, 4, 5, 6, 7, 8, 9, 10+)
   - "Let's Play!" button → POST /api/session → save to Zustand → router.push('/chapter-1')

3. Create `app/(game)/layout.jsx` — game shell:
   - Top bar: chapter title, overall progress bar (ShadCN Progress)
   - Main content area (flex, centered)
   - Back/home button (top-left, small)
   - Background color changes per chapter (pass via context or className)

4. Create `components/game/SceneBackground.jsx` — renders full-viewport background image with Next.js Image, with gradient color fallback

5. Create `components/shared/BigButton.jsx` — large (min h-16), rounded-2xl, ShadCN Button variant wrapper, touch-friendly, with optional icon prop

6. Create `components/game/FeedbackOverlay.jsx` — shows ✅ or ❌ with scale animation (Framer Motion), calls onComplete after 800ms

7. Create chapter hub pages for chapters 1–8 (simple pages that list levels as BigButtons and navigate to level routes)

8. Verify that clicking Play → entering age → navigating to /chapter-1 works end-to-end.

Show me a summary of what was built and any issues found.
```

---

## PHASE 5 — Chapter 1: Welcome to My World

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 60–75 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 1 of Horizons: "Welcome to My World" — Baseline & Response to Name.

Reference: AGENTS.md section 8, Chapter 1 specification.

1. Create `lib/gameData/chapter1.js`:
   - Guide animal options (5 different animals with image paths)
   - 5 target objects for "Following the Guide" task
   - Name-call timing config (3 calls, 5s intervals)

2. Build `app/(game)/chapter-1/level-1/page.jsx` — Avatar Creation & Name Response:
   - Avatar customizer using `store/avatarStore.js`:
     * 4 hair style options (image buttons, big, grid layout)
     * 4 clothes style options
     * 6 color swatches for hair color
     * 6 color swatches for clothes color
     * Live preview of avatar (SVG-based or image composite)
   - After avatar is done → "Ready!" button triggers name response phase:
     * Guide character animates and "calls" child's name 3 times at 5s intervals
     * Each call: timer starts → child must click guide character
     * Log response time, score per AGENTS.md scoring table
     * POST /api/response for each of 3 trials
     * POST /api/score with accumulated points
   - Use useTaskTimer hook for precise timing
   - After 3 trials → router.push('/chapter-1/level-2')

3. Build `app/(game)/chapter-1/level-2/page.jsx` — Following the Guide:
   - Scene with guide animal in corner + 5 objects placed around scene
   - Guide points (animated arrow/paw) to one object at a time
   - Child clicks the object
   - Score each of 5 pointing trials per AGENTS.md rules
   - Track: did child click the pointing hand or the object?
   - POST /api/response for each trial
   - After all 5 → router.push('/chapter-2')

4. Create `components/game/AvatarDisplay.jsx` — renders the customized avatar using current avatarStore state

5. Create `components/game/AnimalGuide.jsx` — animated guide character that can "point" (CSS transform), "speak" (animation), and "react"

6. Write unit tests for chapter 1 scoring logic in `tests/unit/chapter1.test.js`

7. Run `bun test` — all tests pass.

Report what was built and confirm routing works: chapter-1 → level-1 → level-2 → chapter-2.
```

---

## PHASE 6 — Chapter 2: Emotion Island

**Recommended Model:** `GPT-5.4 (High)` (complex emotion mechanics)
**Estimated Time:** 90–120 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 2: "Emotion Island" — Emotion Recognition, Expression & Regulation.

Reference: AGENTS.md section 8, Chapter 2 specification. Key research: EmoGalaxy (Irani et al.) — emotion recognition is the strongest ASD screening signal. Score = correct / total moves.

1. Create `lib/gameData/chapter2.js`:
   - 12 face cards: { id, emotion, subjectType: 'child'|'adult'|'animal', imagePath, altText }
   - 8 scenario cards: { id, description, correctEmotion, imagePath }
   - 16 expression trials: { id, emotion, intensity: 1|2|3, voiceAudioPath, correctFaceIndex, options: [6 face image paths] }
   - 6 regulation scenarios: { id, story, options: [{text, type: 'appropriate'|'avoidant'|'aggressive'}] }

2. Build `app/(game)/chapter-2/level-1/page.jsx` — Emotion Matching Garden:
   - 4 flower bed drop zones (Happy/Sad/Angry/Scared) using @dnd-kit/core
   - Face cards as draggable items
   - Phase 1 (12 face cards) → Phase 2 (8 scenario cards) auto-transitions
   - Track accuracy overall + negative emotion accuracy separately
   - Detect Fear/Sad confusion (dragging Fear→Sad or Sad→Fear)
   - EmoGalaxy scoring: track total_moves (drags attempted) + correct_drops
   - Calculate: score = correct_drops / total_moves
   - Check red flag: negative emotion accuracy < 50% → POST /api/flag
   - POST /api/response for each card, POST /api/score at end

3. Build `app/(game)/chapter-2/level-2/page.jsx` — Emotion Expression Mirror:
   - Show emotion label (large text) + play audio via useAudio hook
   - 6 face image options in a 2×3 grid (BigButton style)
   - 16 trials total (4 per emotion)
   - Track: correct, intensity error, neutral selected, opposite selected
   - Score per AGENTS.md table
   - 3s delay between trials with FeedbackOverlay

4. Build `app/(game)/chapter-2/level-3/page.jsx` — Emotion Regulation Scenarios:
   - Animated vignette panel (image + short description text)
   - 3 response option buttons
   - Timer visible (soft countdown animation, not pressuring)
   - Track slow decisions (>15s) → +1 pt
   - 6 scenarios, score each, POST all responses

5. Create `components/game/EmotionFace.jsx` — renders emotion face with intensity prop. Falls back to colored circle + emoji if image missing.

6. Create `components/game/DragDropSortable.jsx` — wrapper around @dnd-kit with touch sensor support (important for tablets)

7. Write `tests/unit/chapter2.test.js`:
   - Test negative emotion detection logic
   - Test fear/sad confusion counter
   - Test red flag trigger conditions
   - Test EmoGalaxy accuracy formula
   - Minimum 20 tests

8. Run `bun test` — all pass.

Report all components built and confirm chapter-2 routing works end-to-end.
```

---

## PHASE 7 — Chapter 3: Friend's House Visit

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 60–75 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 3: "Friend's House Visit" — Social Communication.

Reference: AGENTS.md section 8, Chapter 3. M-CHAT indicators #9, #11, #16.

1. Create `lib/gameData/chapter3.js`:
   - Greeting sequence steps with timing
   - 8 conversation exchanges: { id, friendSays, options: [{text, type: 'social'|'factual'|'off-topic'|'literal'}] }
   - 5 discovery events: { id, type: 'friend_finds'|'child_finds', object, shareOptions }

2. Build `app/(game)/chapter-3/level-1/page.jsx` — Greeting Sequence:
   - Animated house door scene
   - Step 1: Door with knocker → child clicks to knock
   - Step 2: Door opens, friend appears → wave/smile buttons appear (5s timeout)
   - Step 3: Friend's face shown → child clicks it to make eye contact (5s timeout)
   - Each step timed, scored per AGENTS.md rules
   - No action = score that step's penalty

3. Build `app/(game)/chapter-3/level-2/page.jsx` — Conversation Turn-Taking:
   - Chat bubble UI (friend says something)
   - 3–4 response options as BigButtons
   - 8 exchanges total
   - 10s timer per response (soft visual countdown)
   - Track: how many factual vs social responses → if ≥6/8 factual → +5 pts
   - Detect off-topic responses (restricted interest type) → 3 pts each

4. Build `app/(game)/chapter-3/level-3/page.jsx` — Sharing & Joint Attention:
   - Playground scene
   - 5 events alternating: friend points at something / child "discovers" something
   - For friend-discovery: highlighted arrow points to object, child must click it within 8s
   - For child-discovery: two buttons appear: "Show friend!" / "Keep to myself"
   - Score per AGENTS.md, POST all responses

5. Run `bun test` — all pass.

Report routing: chapter-3 → level-1 → level-2 → level-3 → chapter-4.
```

---

## PHASE 8 — Chapter 4: Daily Routines Village

**Recommended Model:** `GPT-5.4 (High)` (complex drag-drop mechanics)
**Estimated Time:** 75–90 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 4: "Daily Routines Village" — Executive Function & Cognitive Flexibility.

Reference: AGENTS.md section 8, Chapter 4. The drag-drop routine sequence is the most complex interaction.

1. Create `lib/gameData/chapter4.js`:
   - 6 morning routine cards with correct order + image paths
   - 4 disruption scenarios with response options
   - 5 playground activities with image paths
   - 4 unexpected event scenarios with responses

2. Build `app/(game)/chapter-4/level-1/page.jsx` — Morning Routine Sequence:
   - 6 card images shuffled randomly in a "card pile"
   - Drag-drop sortable list using @dnd-kit/sortable (vertical list target)
   - "Done!" button to submit order
   - Track: sequence errors, attempt count (up to 3 tries)
   - After correct sort (or 3 failures): disruption scenario appears as animated popup
   - 3 response buttons for disruption (flexible/rigid/meltdown)
   - Track disruption response time
   - RED FLAG note: rigid + distress → check for rigid_pattern_plus_distress_at_change

3. Build `app/(game)/chapter-4/level-2/page.jsx` — Playground Equipment Choice:
   - Grid of 5 animated activity cards
   - Child clicks one → 3s animation plays → "Great! Try something new!" appears
   - Repeat × 4 total activity selections
   - Track: repeats of same activity, time to click after prompt
   - Detect: exact same sequence repeated

4. Build `app/(game)/chapter-4/level-3/page.jsx` — Unexpected Events Response:
   - 4 illustrated scenario panels, one at a time
   - 3 response buttons each
   - 12s timer per scenario
   - Score and POST each response

5. Make sure @dnd-kit has both mouse AND touch sensors configured (PointerSensor + TouchSensor) for tablet support.

6. Write `tests/unit/chapter4.test.js`:
   - Test sequence error counting
   - Test same-activity repetition detection
   - Test same-sequence detection logic
   - Minimum 15 tests

7. Run `bun test` — all pass.
```

---

## PHASE 9 — Chapter 5: Pretend Play Theater

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 60–75 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 5: "Pretend Play Theater" — Symbolic Play & Imagination.

Reference: AGENTS.md section 8, Chapter 5. M-CHAT #3. Red flag: complete_absence_pretend_play.

1. Create `lib/gameData/chapter5.js`:
   - 5 pretend-play animations: { id, description, literalInterpretation, pretendInterpretation, imagePath, animationClass }
   - 4 pretend play prompts: { id, scenario, objects: [{name, isLiteral, imagePath}] }

2. Build `app/(game)/chapter-5/level-1/page.jsx` — Pretend Play Recognition:
   - Animated vignette (CSS animation or Framer Motion sequence) for each of 5 scenarios
   - Two large response buttons after animation: "They're pretending! 🎭" / literal interpretation text
   - Score per AGENTS.md
   - Count literal responses → if all 5 literal → POST /api/flag { flagType: 'complete_absence_pretend_play' }
   - POST all responses

3. Build `app/(game)/chapter-5/level-2/page.jsx` — Create Your Own Pretend Play:
   - 4 scenario prompts shown one at a time
   - Object palette (8 objects, mix of literal-use and symbolic-use items) as clickable cards
   - Child clicks objects to "use" them in their pretend play
   - Track: symbolic vs literal selections ratio
   - 15s timer per scenario
   - Score per AGENTS.md rules

4. Run `bun test` — all pass. Chapter-5 routing confirmed.
```

---

## PHASE 10 — Chapter 6: Sensory Garden

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 60–75 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 6: "Sensory Garden" — Sensory Processing.

Reference: AGENTS.md section 8, Chapter 6. Red flag: extreme_sensory_4plus_distressing_sounds.

1. Create `lib/gameData/chapter6.js`:
   - 8 sounds with metadata: { id, name, category, audioPath, animatedSourceImage }
   - 6 rooms: { id, name, backgroundImage, type: 'calm'|'colorful'|'flickering'|'spinning'|'crowded'|'stripes' }
   - 8 textures: { id, name, imagePath, category: 'smooth'|'rough'|'wet'|'dry' }

2. Build `app/(game)/chapter-6/level-1/page.jsx` — Sound Sensitivity:
   - Play audio for each of 8 sounds using useAudio/Howler
   - Show animated source image while sound plays
   - 5-option rating bar: 😊 / 😐 / 😟 / 😢 / 🚫
   - Track distress count, cover-ears/leave selections
   - After 4+ distressing: POST /api/flag { flagType: 'extreme_sensory_4plus_distressing_sounds' }
   - POST all responses

3. Build `app/(game)/chapter-6/level-2/page.jsx` — Visual Sensitivity:
   - 6 "rooms" as a grid of doors to click
   - Entering a room: full background changes + track time-in-room with timer
   - "Leave" button always visible
   - Track: rooms avoided (never entered), time-in-room for pattern rooms, quick exits (<3s) from flickering/motion rooms

4. Build `app/(game)/chapter-6/level-3/page.jsx` — Texture Preferences:
   - 8 texture cards in a grid
   - 4 drop zones: ❤️ Love / 👍 Okay / 👎 Don't Like / ✋ Won't Try
   - @dnd-kit drag-drop
   - Detect wet textures all-aversive pattern
   - Score and POST

5. `components/game/SoundPlayer.jsx` — Howler.js wrapper that plays a sound file and calls onEnd callback.

6. Run `bun test` — all pass.
```

---

## PHASE 11 — Chapter 7: Pattern Detective

**Recommended Model:** `GPT-5.4 (High)` (algorithm for repetition detection)
**Estimated Time:** 75–90 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 7: "Pattern Detective" — Restricted/Repetitive Behaviors.

Reference: AGENTS.md section 8, Chapter 7. Red flag: rigid_pattern_plus_distress_at_change.

1. Create `lib/gameData/chapter7.js`:
   - 3 pattern sequences: AB, ABC, complex AABBC — each as arrays of colored shape objects
   - Free-play object set: 10 objects (blocks, toy cars, animals, circles)
   - 8 topic books: { id, topic, coverImagePath, facts: [string × 20] }

2. Build `app/(game)/chapter-7/level-1/page.jsx` — Pattern Completion:
   - Display pattern sequence with last item(s) missing
   - Object selector bar (click to place next item)
   - After correct completion: "Oops! A wrong piece snuck in!" — one item glitches wrong
   - Measure: distress reaction (button: "It's wrong, fix it!" → score 3pts), acceptance, time to start new pattern
   - Then pattern changes type → track return-to-first-pattern behavior
   - If both distress + returns to pattern: POST /api/flag { flagType: 'rigid_pattern_plus_distress_at_change' }

3. Build `app/(game)/chapter-7/level-2/page.jsx` — Free Play:
   - Scene with 10 interactive objects
   - Track clicks algorithmically: detect same-object repeated 8+ times
   - Detect spontaneous lining-up (user clicks objects left-to-right repeatedly)
   - Disruption at 2 minutes: character moves all objects randomly
   - Measure distress response to disruption
   - Run interaction analysis function that returns flags

4. Build `app/(game)/chapter-7/level-3/page.jsx` — Special Interest Intensity:
   - 8 book covers in a grid
   - Click book → opens fact pages (show fact 1 of N, next button)
   - After 5 facts: guide says "Time for a new book!"
   - Track: same book selected 3+ times, fact count per topic, transition time, return-to-same

5. Write `tests/unit/chapter7.test.js`:
   - Test same-object repeat detection algorithm
   - Test lining-up pattern detection
   - Test topic repetition counter
   - Minimum 15 tests

6. Run `bun test` — all pass.
```

---

## PHASE 12 — Chapter 8: Copy Cat Challenge

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 60–75 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 8: "Copy Cat Challenge" — Imitation Skills.

Reference: AGENTS.md section 8, Chapter 8. M-CHAT #15. Red flag: poor_imitation_all_modalities.

1. Create `lib/gameData/chapter8.js`:
   - 12 simple actions: { id, category: 'facial'|'body'|'object', animationPath, correctOptionIndex, options: [4 image paths] }
   - 6 sequences: { id, type: '2-action'|'3-action', steps: [action ids], distractorOptions: [...] }

2. Build `app/(game)/chapter-8/level-1/page.jsx` — Simple Action Imitation:
   - Show animated action (loop 2 times)
   - "What did they do?" — 2×2 grid of 4 image options
   - 8s timer per trial (soft visual pulse on timer)
   - Track: total errors, errors by category (facial vs body/object)
   - If 6+ total errors → POST /api/flag { flagType: 'poor_imitation_all_modalities' }
   - 12 trials with FeedbackOverlay between each

3. Build `app/(game)/chapter-8/level-2/page.jsx` — Sequential Imitation:
   - Watch full 2 or 3-action animation play through
   - Then: "Now you try!" — object images appear
   - Child clicks objects IN ORDER to reproduce sequence
   - Track: per-step errors, perseveration (same wrong step ≥3 times), overall 3-action success rate
   - If can't complete ANY 3-action sequence → +3 pts

4. Run `bun test` — all pass.
Report chapter-8 works and links to chapter-9.
```

---

## PHASE 13 — Chapter 9: Assessment Summary & Results

**Recommended Model:** `GPT-5.4 (High)` (complex scoring pipeline)
**Estimated Time:** 90–120 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build Chapter 9: Assessment Summary + Full Results Display.

Reference: AGENTS.md section 8 Chapter 9, and the full scoring engine from sections 6–7.

1. Create `lib/gameData/chapter9.js`:
   - Function: sampleTasksForChapter9(sessionId) — samples 20 tasks from all chapters, weighting toward highest-scoring chapters (where most concern was shown). Returns array of task configs.

2. Build `app/(game)/chapter-9/page.jsx`:
   - "Almost done! Let's do a quick review!" intro screen
   - Loads 20 sampled tasks sequentially (reuses chapter components as sub-components)
   - After all 20: calls GET /api/results/[sessionId]
   - Shows loading spinner while scoring runs
   - Redirects to results display

3. Update `GET /api/results/[sessionId]` to run the full pipeline:
   a. Aggregate all chapter_scores by domain (using CHAPTER_TO_DOMAIN map)
   b. Calculate domain raw scores
   c. Run detectAndSaveRedFlags(sessionId)
   d. Apply red flag multipliers
   e. Calculate combined score
   f. Determine overall risk level
   g. Upsert all domain_scores rows
   h. Return full results object

4. Create the Results display page at `app/(game)/results/page.jsx`:
   - Fun, child-friendly "All done! 🎉" header with confetti (ConfettiBlast component)
   - Simple star/medal display (no numbers shown to child)
   - Below fold (for parent/researcher): domain breakdown
   - Recommendation text (always: "Please consult a healthcare specialist for a proper evaluation")
   - "Play Again" button (clears store, new session)
   - "See Full Report" button → /researcher/session/[id]

5. Create `components/shared/ConfettiBlast.jsx` — uses canvas or CSS animation to create confetti effect for 3 seconds

6. Update PATCH `/api/session/[id]` to mark session as 'completed' when results are fetched

7. Write `tests/integration/scoring-pipeline.test.js`:
   - Create a test session with pre-populated mock responses/scores covering all chapters
   - Run the full scoring pipeline via GET /api/results
   - Assert: correct domain scores, correct combined score, correct risk level
   - Test with a "high concern" mock dataset → verify very_high risk
   - Test with a "low concern" mock dataset → verify low risk
   - Test red flag multiplier application
   - Minimum 10 end-to-end tests

8. Run `bun test` — ALL tests pass.
Report the complete flow: chapter-9 → results → researcher link.
```

---

## PHASE 14 — Researcher Dashboard

**Recommended Model:** `GPT-5.4 (Medium)`
**Estimated Time:** 60–75 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Build the Researcher Dashboard at /researcher.

Reference: AGENTS.md section 13.

1. Create `app/researcher/layout.jsx`:
   - Password protection: check RESEARCHER_PASSWORD env var
   - Simple password form if not authenticated (store auth in sessionStorage, NOT database)
   - Header with "Horizons Researcher Dashboard" + logout button

2. Build `app/researcher/page.jsx` — Dashboard Overview:
   - Server Component: fetches all sessions from DB
   - Data table using ShadCN Table: columns = [Date, Name, Age, Status, Combined Score, Risk Level, Actions]
   - Risk level shown as colored ShadCN Badge (green/yellow/orange/red)
   - "View Details" link per row → /researcher/session/[id]
   - Summary stats cards at top: total sessions, avg score, risk distribution (recharts PieChart)

3. Build `app/researcher/session/[id]/page.jsx` — Individual Session:
   - Session metadata (date, age, duration)
   - Domain score breakdown as recharts BarChart (4 domains vs thresholds)
   - Combined score gauge visualization
   - Red flags section (ShadCN Alert components, severity-colored)
   - Chapter-by-chapter score table
   - Response time distribution (recharts Histogram)
   - Mouse movement heatmap (canvas element, draw dots for x/y coordinates)
   - "Export JSON" and "Export CSV" buttons

4. Build `app/researcher/export/route.js`:
   - GET with ?sessionId=X&format=json|csv
   - JSON: full session data including all responses, scores, flags, domain scores
   - CSV: one row per task_response with key metrics
   - Set appropriate Content-Disposition headers

5. Run `bun test` — all pass.
Confirm /researcher shows sessions, /researcher/session/[id] shows detail, export works.
```

---

## PHASE 15 — Testing, Documentation & Polish [running]

**Recommended Model:** `GPT-5.4 (High)` (thorough review and documentation)
**Estimated Time:** 90–120 min

```
Read the 'AGENTS.md' file if you didn't read yet.

Final phase: comprehensive testing, documentation, accessibility, and academic documentation.

1. TESTING COMPLETENESS:
   Run `bun test --coverage` and fix any uncovered critical paths.
   Target: >80% coverage on lib/scoring/ and lib/db/queries/
   Add any missing edge case tests.
   Ensure ALL tests pass with `bun test`.

2. ACCESSIBILITY AUDIT:
   - Verify all interactive elements are ≥60×60px (BigButton compliance)
   - Add aria-label to all icon-only buttons
   - Ensure color is never the ONLY indicator (add text/icon alongside)
   - Add `prefers-reduced-motion` CSS media query to skip Framer Motion animations

3. ASSET FALLBACKS:
   Review every page: confirm that if an image/audio file is missing, the UI degrades gracefully (placeholder SVG or emoji, not a crash or broken image)

4. ERROR HANDLING:
   - All API routes: wrap in try/catch, return { error: message } on failure
   - All client components: add error boundaries where appropriate
   - Database: handle SQLITE_BUSY and other common errors

5. PERFORMANCE:
   - Verify no unnecessary re-renders in game components (use React DevTools mental model)
   - Ensure mouse tracking buffer flushes properly and doesn't leak
   - Check that audio files are preloaded where needed

6. ACADEMIC DOCUMENTATION — create these files:
   a. `docs/SRS.md` — System Requirements Specification:
      - Problem statement (ASD screening gap for ages 3-10)
      - Functional requirements (all 9 chapters)
      - Non-functional requirements (performance, usability, privacy)
      - Feasibility analysis
      - Research justification (cite all 3 papers from AGENTS.md)

   b. `docs/DesignDoc.md` — System Design Document:
      - Architecture diagram (describe as ASCII art + explanation)
      - Database ER diagram (describe all tables/relationships)
      - Component hierarchy
      - Data flow diagram
      - Scoring algorithm explanation with formulas
      - Technology justification (why each tool was chosen)

   c. `docs/UserManual.md` — User Manual:
      - How to run the project (bun dev)
      - How to play (parent/guardian guide)
      - How to use researcher dashboard
      - How to interpret results
      - Privacy notice

7. FINAL VERIFICATION:
   Run through the complete game flow manually:
   Main Menu → Age Entry → Chapter 1 → ... → Chapter 9 → Results → Researcher Dashboard → Export

   Report any bugs found and fix them.

   Run `bun test` one final time — confirm 100% pass rate.

   Run `bun run build` — confirm production build succeeds with 0 errors.

Provide a final summary of: total test count, coverage %, all routes working, build status.
```

---

## APPENDIX: Quick Commands Reference

```bash
# Start a new phase
cd horizons && bun dev

# Run all tests
bun test

# Run specific test file
bun test tests/unit/scoring.test.js

# Run tests with coverage
bun test --coverage

# Build for production
bun run build

# Install a new package
bun add <package-name>

# Install ShadCN component
bunx shadcn@latest add <component-name>

# Check for TypeScript (should return 0 .ts/.tsx files)
find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | grep -v .next
```

---

## APPENDIX: Phase Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Database)
        └── Phase 3 (Engine + API)
              ├── Phase 4 (Menu)
              │     └── Phase 5 (Ch1)
              │           └── Phase 6 (Ch2)
              │                 └── Phase 7 (Ch3)
              │                       └── Phase 8 (Ch4)
              │                             └── Phase 9 (Ch5)
              │                                   └── Phase 10 (Ch6)
              │                                         └── Phase 11 (Ch7)
              │                                               └── Phase 12 (Ch8)
              │                                                     └── Phase 13 (Ch9 + Results)
              │                                                           └── Phase 14 (Dashboard)
              │                                                                 └── Phase 15 (Polish)
              └── Phase 14 (Dashboard) can start after Phase 3 if needed
```
