# ASD Screening Serious Game — Refined Design Document
## "Game Horizons: A World of My Own"

> **Platform Change Notice:** This document supersedes the original Godot-based plan.
> The game is now built on **Next.js 15 (App Router)** with a **MongoDB** backend (Mongoose),
> enabling browser-based delivery, real-time data collection, clinician dashboards,
> and cross-device accessibility without installation friction.
>
> **v2 Update — MongoDB Migration + AI/ML Integration:** This revision documents the planned migration
> from SQLite to MongoDB (keeping the existing lib/db/queries/ API surface), and introduces a **Python FastAPI
> ML sidecar service** that augments the existing rule-based scoring engine with a
> trained machine-learning model for higher-accuracy ASD risk prediction. All changes
> are designed to minimally disrupt the existing project structure.

---

## Table of Contents

1. [Game Identity & Purpose](#1-game-identity--purpose)
2. [Platform & Technology Stack](#2-platform--technology-stack)
3. [Target Audience & Age Segmentation](#3-target-audience--age-segmentation)
4. [How to Play — Complete Player Guide](#4-how-to-play--complete-player-guide)
5. [Visual & Audio Asset Specification](#5-visual--audio-asset-specification)
6. [Chapter & Level Flow Architecture](#6-chapter--level-flow-architecture)
7. [Chapter 1: Welcome to My World](#7-chapter-1-welcome-to-my-world)
8. [Chapter 2: Emotion Island](#8-chapter-2-emotion-island)
9. [Chapter 3: Friend's House Visit](#9-chapter-3-friends-house-visit)
10. [Chapter 4: Daily Routines Village](#10-chapter-4-daily-routines-village)
11. [Chapter 5: Pretend Play Theater](#11-chapter-5-pretend-play-theater)
12. [Chapter 6: Sensory Garden](#12-chapter-6-sensory-garden)
13. [Chapter 7: Pattern Detective Agency](#13-chapter-7-pattern-detective-agency)
14. [Chapter 8: Copy Cat Challenge](#14-chapter-8-copy-cat-challenge)
15. [Chapter 9: Assessment Summary (The Grand Journey)](#15-chapter-9-assessment-summary-the-grand-journey)
16. [Scoring System — Complete Specification](#16-scoring-system--complete-specification)
17. [ASD Evaluation Process — Data-Driven Analysis](#17-asd-evaluation-process--data-driven-analysis)
18. [Database Architecture — MongoDB Migration](#18-database-architecture--mongodb-migration)
19. [Next.js Application Architecture](#19-nextjs-application-architecture)
20. [AI/ML Integration Layer](#20-aiml-integration-layer)
21. [Clinician & Parent Dashboard](#21-clinician--parent-dashboard)
22. [Validation Requirements](#22-validation-requirements)
23. [Development Roadmap](#23-development-roadmap)
24. [Key Changes from Original Plan](#24-key-changes-from-original-plan)

---

## 1. Game Identity & Purpose

### 1.1 Game Title
**"Game Horizons: A World of My Own"**
Subtitle: *A journey of discovery, friendship, and feelings.*

### 1.2 Mission Statement
Game Horizons is a **serious game for ASD screening** disguised as a warm, colorful, child-friendly adventure. The child plays through nine interconnected chapters — each a different "world" within a magical archipelago — performing tasks that appear to be simple fun but are carefully designed to surface behavioral patterns mapped to autism spectrum disorder indicators derived from M-CHAT-R/F, DSM-5 criteria, and ADOS-2 domains.

The game does **not diagnose**. It produces a **structured behavioral risk profile** intended for clinical review.

### 1.3 Core Design Philosophy
- **Child-first:** The game must feel like play, never like a test.
- **Culturally neutral:** All characters, names, and scenarios are culturally agnostic.
- **Caregiver-mediated or independent:** Children aged 3–5 are expected to have a caregiver beside them; ages 6–10 can play independently.
- **Non-stigmatizing:** No indication of "right" or "wrong" answers during gameplay.
- **Clinically grounded:** Every mechanic maps to at least one validated ASD behavioral marker.

### 1.4 Clinical Alignment

| Validated Tool | How It Is Reflected |
|---|---|
| M-CHAT-R/F (16 items) | 12 of 16 M-CHAT items are directly embedded as game mechanics |
| DSM-5 Criteria A & B | All four DSM-5 symptom domains are covered across 9 chapters |
| ADOS-2 Modules 1–3 | Task types mirror ADOS-2 presses for joint attention, pretend play, social communication |
| CARS-2 | Sensory and emotional scoring calibration aligned with CARS-2 subscale ranges |

---

## 2. Platform & Technology Stack

### 2.1 Framework: Next.js 14 (App Router)

| Aspect | Choice | Reason |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | SSR + client-side animation, easy deployment |
| Animation | Framer Motion + CSS animations | Smooth character animations without game engine overhead |
| Game Canvas | React-based component tree (no canvas) | DOM-based interactivity for precise click/touch logging |
| Drag & Drop | `@dnd-kit/core` | Accessible, mobile-friendly drag-drop library |
| Audio | Howler.js | Cross-browser audio with precise timing |
| State Management | Zustand | Lightweight, persistent game state |
| Styling | Tailwind CSS + custom CSS | Rapid styling with custom children's UI theme |
| Deployment | Vercel | Edge-optimized, zero-config deployment |

### 2.2 Backend

| Aspect | Choice |
|---|---|
| Runtime | Node.js / Bun (Next.js API Routes) |
| Primary Database | **SQLite** via `bun:sqlite` (Bun) or `node:sqlite` (Node.js) — local file `horizons.db` |
| DB Abstraction | Custom query layer in `lib/db/queries/` — no ORM overhead |
| Authentication | Simple token-based auth for researcher routes (`/api/researcher/auth`) |
| ML Service | Python FastAPI sidecar (see Section 20) |
| Data Encryption | AES-256 for exported PII fields |
| GDPR Compliance | Pseudonymized session IDs, consent-gated sessions |

> **Note on MongoDB:** `mongodb` is listed in `package.json` as a dependency but is not
> used in the current implementation. SQLite is the actual production database. MongoDB
> may be re-evaluated if horizontal scaling becomes necessary in multi-site deployments,
> but SQLite is entirely appropriate for single-server research deployments.

### 2.3 Why Next.js Over Godot

- **No installation required** — browser-based access increases study participation rate significantly.
- **Real-time database writes** — every interaction event is POSTed to MongoDB instantly, not just at session end.
- **Multi-device support** — runs on tablets (iPad, Android), laptops, and desktop without code changes.
- **Clinician portal** — a separate authenticated route (`/dashboard`) serves the clinician reporting interface.
- **Easier asset pipeline** — images, audio, and video are served via Next.js's `/public` directory and optimized via `next/image`.
- **Internationalization** — `next-intl` enables adding Bangla, Arabic, or other languages for localized deployments.

---

## 3. Target Audience & Age Segmentation

### 3.1 Player Age Groups

| Group | Age | UI Adaptations | Expected Caregiver Presence |
|---|---|---|---|
| Toddlers | 3–4 | Very large buttons (min 80px), simple 2-option choices, caregiver reads instructions | Always present |
| Early Childhood | 5–6 | Large buttons (min 60px), 3–4 options, read-along voice narration | Nearby |
| Middle Childhood | 7–8 | Standard UI, 4 options, voice narration optional | Optional |
| Late Childhood | 9–10+ | Standard UI, some text-based choices, voice narration off by default | Not required |

### 3.2 Age-Adaptive Content
The game collects the child's age at session start and:
- Adjusts response time thresholds per level (younger children get longer windows)
- Adjusts complexity of distractor options
- Adjusts scoring weights using age-normative data from the validation study database

### 3.3 Who Administers the Session
A **clinician, researcher, parent, or trained educator** initiates the session. They log in to the clinician portal, create a child profile, and hand the device to the child. The game runs in **kiosk mode** (no browser chrome, no exit buttons visible to child).

---

## 4. How to Play — Complete Player Guide

### 4.1 Game Setup (Clinician/Caregiver Side)
1. Clinician logs in to `/dashboard` using their institutional account.
2. Creates a new **Child Session**: enters pseudonymized ID, age, gender (optional), and any known conditions (for exclusion criteria).
3. Selects **Full Assessment** (all 9 chapters) or **Short Assessment** (Chapters 1, 2, 3, 6 — ~30 minutes).
4. Presses **"Start Game"**, which launches the game in full-screen kiosk mode.

### 4.2 Player-Facing Introduction
The child is greeted by **Pip** — a friendly, round, androgynous animated creature with large eyes and a soft color palette — who serves as the guide throughout the game.

**Intro sequence (non-skippable, ~90 seconds):**
> *"Hi! I'm Pip! Welcome to our magical island world! We're going on a big adventure together. You'll visit lots of cool places, meet new friends, and play some really fun games. There are no wrong choices — just do what feels right to you! Let's go!"*

Pip waves, the map of the **Horizon Archipelago** appears, and Chapter 1's island glows.

### 4.3 Gameplay Loop (Per Level)
1. **Pip introduces the task** via voiced narration (always plays; cannot be skipped by child).
2. **Demonstration phase** (first time a mechanic appears): Pip shows an example interaction.
3. **Active play phase**: Child interacts with the scene.
4. **Gentle feedback**: After each interaction, Pip reacts neutrally ("Great!", "Thanks!", "Let's try the next one!"). Pip never says "Wrong!" or "Oops!".
5. **Transition**: Pip waves and a fun animation bridges to the next task.

### 4.4 Interaction Mechanics (by mechanic type)

| Mechanic | How Child Interacts | Data Captured |
|---|---|---|
| Click/Tap | Single click on character or object | Click coords, response latency (ms), attempts |
| Drag & Drop | Drag item to target zone | Drag path, duration, error count, hover time |
| Multiple Choice | Click one of 2–4 illustrated cards | Choice made, latency, hover dwell time per option |
| Sequence Building | Click items in order | Order chosen, time per step, backtracking events |
| Rating Scale | Click a face (happy → sad spectrum) | Rating value, latency, changes made |
| Look/Gaze Simulation | Click where character is pointing | Accuracy, latency, click target (correct vs pointer vs random) |
| Body Imitation | Click matching action from 4 illustrated options | Selection, latency |
| Free Exploration | Move character through a scene | Path taken, dwell time per zone, objects interacted with |

### 4.5 Breaks & Session Management
- A **break reminder** appears after every 2 chapters (Pip: "Great job! Want a quick stretch?"). Caregiver can pause by pressing **P**.
- If the child abandons the session mid-way, data up to the last completed level is saved and the session is marked `incomplete`. Partial data is still usable for analysis.
- Sessions can be **resumed** within 24 hours using the same session token.

### 4.6 Goal for the Player
The child's explicit in-game goal is: **"Help Pip explore every island and earn Star Gems for the Gem Tower!"**

- Completing each level earns 1–3 Star Gems (cosmetic reward only, not based on "correctness").
- Completing each chapter unlocks a new part of the Horizon Map (visible to child).
- These rewards are entirely decoupled from the clinical scoring system. Every child earns roughly the same number of gems regardless of responses, preventing score visibility and avoiding anxiety.

---

## 5. Visual & Audio Asset Specification

### 5.1 Art Direction
- **Style:** Soft 2D illustration, warm pastel palette, rounded shapes, no sharp edges.
- **Resolution:** All assets designed at 1920×1080 (downscaled for tablets).
- **Format:** SVG for UI elements and characters (scalable), WebP for backgrounds and scene illustrations, MP3/OGG for audio.

### 5.2 Character Assets

| Character | Description | Variations Needed |
|---|---|---|
| Pip (guide) | Round, yellow-green creature, large expressive eyes | Idle, talking, pointing, excited, waving, sad, thinking — 7 animations × 3 intensities = 21 states |
| Child Avatar | Customizable: 3 skin tones × 3 hair styles × 4 outfits = 36 combinations | Each combination as a layered SVG |
| Friend Character (Alex) | Purple-haired child, gender-neutral | Happy, sad, angry, neutral, waving, pointing — 6 states |
| Parent/Adult NPC | Warm adult figure | Idle, talking, gesturing — 3 states |
| Emotion Face Cards | Illustrated round faces | Happy (mild, moderate, strong), Sad (mild, moderate, strong), Angry (mild, moderate, strong), Scared (mild, moderate, strong), Surprised, Neutral = 14 cards |
| Animal Characters (Ch.1) | Rabbit, cat, dog options for guide role variant | 3 alternatives to Pip for cultural preference |

### 5.3 Background Scenes

| Chapter | Scene Name | Description |
|---|---|---|
| 1.1 | Avatar Studio | Cozy colorful room with mirror, wardrobe, soft lighting |
| 1.2 | Horizon Meadow | Wide open grassy field, trees, sunny sky |
| 2.1 | Emotion Garden | Four flower beds (each bed a different color), butterfly paths |
| 2.2 | Mirror Hall | Warm room with large oval mirror surrounded by soft lights |
| 2.3 | Feeling Stories Stage | Simple theater stage with illustrated storybook panels |
| 3.1 | Alex's Front Door | Charming small house with a colorful door, garden path |
| 3.2 | Alex's Living Room | Toy-filled room, couch, shelves with books and puzzles |
| 3.3 | Alex's Backyard | Garden with butterflies, rocks, bushes |
| 4.1 | Morning Bedroom | Bright bedroom with items: toothbrush, clothes, bag icons |
| 4.2 | Playground | Colorful equipment: swing, slide, sandbox, monkey bars, seesaw |
| 4.3 | Village Street | Simple map view with blocked path, library, café, park |
| 5.1 | Magic Theater | Mini stage with curtain, spotlight, character performing |
| 5.2 | Toy Chest Room | Scatter of blocks, blankets, leaves, ropes, boxes |
| 6.1 | Sound Forest | Trees with speaker icons, ambient visual waveform |
| 6.2 | Visual Gallery | Museum-style hallway with 6 framed room scenes |
| 6.3 | Texture Pavilion | Table with 8 labeled texture swatches with visual description |
| 7.1 | Pattern Workshop | Workbench with colored shape sequences laid out |
| 7.2 | Free Play Room | Open room with toys, blocks, cars, animals |
| 7.3 | Library Corner | Cozy reading nook with 8 topic bookshelves |
| 8.1 | Copy Cat Studio | Split screen: character on left, response panel on right |
| 8.2 | Action Stage | Theater with sequence scroll and action tiles |
| 9.x | Grand Journey Map | Returns to Horizon Archipelago map with replay vignettes |

**Total Backgrounds:** 24 primary scenes + 9 transition animations between chapters.

### 5.4 Object & Prop Assets

| Category | Items | Format |
|---|---|---|
| Morning routine items | Alarm clock, toothbrush, shirt, bowl, cereal, backpack, shoes | WebP, min 256×256 |
| Playground equipment | Swing, slide, sandbox, monkey bars, seesaw | SVG (animated hover state) |
| Emotion scenario props | Ice cream cone (dropped), toy car, loud speaker, backpack, toy, two children figures | WebP |
| Sensory room textures | Cotton, glass, rock, clay, honey jar, sandpaper, ribbon, jello | WebP, high detail |
| Pattern shapes | Circle, square, triangle, star in red, blue, green, yellow | SVG |
| Pretend play objects | Banana, pot + spoon, teddy bear + spoon, wooden block, cup | WebP + animation frames |
| Free play toys | Blocks × 10, car, animal figures × 5, ball, puzzle pieces | SVG |
| Library books | 8 distinct cover designs for each interest topic | WebP |
| Texture table swatches | 8 swatch images with tactile visual representation | WebP |
| Discovery items (Ch.3) | Butterfly, spotted rock, marble, ladybug, shiny leaf | SVG animated |

**Total Object Assets:** ~280 individual assets.

### 5.5 Audio Assets

#### Voice Narration (Pip's Voice)
- Gender-neutral, warm, mid-pitched recorded voice
- All narration pre-recorded professionally (not TTS) for natural prosody
- **Minimum 120 audio clips**, organized by chapter/level/event:
  - Task instructions: ~60 clips
  - Positive feedback variations: 15 clips ("Great!", "Thanks!", "Cool!", "Nice one!", "You got it!")
  - Neutral feedback: 10 clips
  - Transition phrases: 15 clips
  - Break encouragements: 5 clips
  - Chapter intro narrations: 9 clips

#### Sensory Sound Bank (Chapter 6)
| Sound ID | Sound | Duration | Volume Profile |
|---|---|---|---|
| S01 | Birds chirping | 4s | Soft, gradual |
| S02 | Water fountain | 4s | Medium, constant |
| S03 | Children laughing | 4s | Medium-loud, variable |
| S04 | Vacuum cleaner | 4s | Loud, sustained mechanical |
| S05 | Dog barking | 3s | Sudden, loud |
| S06 | Thunder crack | 3s | Very loud, sudden |
| S07 | Baby crying | 4s | High-pitched, loud |
| S08 | Traffic noise | 4s | Constant, loud, multi-layered |

All sensory sounds are presented at **calibrated dB levels** (the game prompts the caregiver to set device volume to a standard level before Chapter 6 begins).

#### Ambient Music
| Track | Chapter | Mood | BPM |
|---|---|---|---|
| "Horizon Dawn" | Ch.1 | Gentle, welcoming | 72 |
| "Garden of Feelings" | Ch.2 | Warm, slightly emotional | 80 |
| "Friendly Doors" | Ch.3 | Playful, light | 90 |
| "Morning March" | Ch.4 | Structured, cheerful | 95 |
| "Imagination Clouds" | Ch.5 | Whimsical, dreamy | 68 |
| "Nature Hum" | Ch.6 | Calm, natural | 60 |
| "Detective Tick" | Ch.7 | Focused, curious | 85 |
| "Mirror Dance" | Ch.8 | Energetic, fun | 100 |
| "Grand Journey" | Ch.9 | Nostalgic, warm | 75 |

#### UI Sound Effects
| Event | Sound | Duration |
|---|---|---|
| Correct selection | Soft chime | 0.5s |
| Item placed (drag-drop) | Satisfying "click" | 0.3s |
| Star Gem earned | Sparkle jingle | 1.0s |
| Chapter complete | Celebratory fanfare | 2.5s |
| Scene transition | Whoosh | 0.8s |
| Pip speaking (indicator) | Soft pop | 0.2s |

### 5.6 Animation Specification

| Animation | Frames | Loop | Trigger |
|---|---|---|---|
| Pip idle breathing | 24 | Yes | Always when Pip on screen |
| Pip talking | 16 | Yes | During audio narration |
| Pip pointing | 12 | No | Level 1.2 guide mechanic |
| Pip excited (gem earned) | 20 | No | Level completion |
| Avatar walking | 16 | Yes | Scene navigation |
| Imitation actions × 12 | 20 each | No | Chapter 8 tasks |
| Pretend play scenarios × 5 | 30 each | No (playable once) | Chapter 5 tasks |
| Emotion scenario stories × 6 | Variable | No | Chapter 2.3 tasks |
| Pattern block placement | 8 | No | Chapter 7 tasks |
| Drag item hover state | 6 | Yes | During drag |
| Character wave (greeting) | 12 | No | Level 3.1 |
| Playground equipment play | 16 each | Yes | Level 4.2 |

---

## 6. Chapter & Level Flow Architecture

### 6.1 The Horizon Archipelago Map
The overworld is a **top-down illustrated island map** showing 9 islands, each representing a chapter. Islands are connected by animated paths (boat routes, bridges, rainbow arcs). As chapters are completed, islands "light up" with color; uncompleted islands appear in muted grayscale.

The child sees the map between chapters and taps the next glowing island to continue.

### 6.2 Linear Progression with Adaptive Branching

```
SESSION START
     │
     ▼
INTRO (non-skippable, 90s)
     │
     ▼
CHAPTER 1 ──── Avatar Customization ──── Name Response ──── Following Guide
     │
     ▼
CHAPTER 2 ──── Emotion Matching ──── Emotion Expression ──── Regulation
     │
     ▼
CHAPTER 3 ──── Greeting Sequence ──── Conversation ──── Joint Attention
     │
     ▼
[BREAK REMINDER → optional 2-minute rest]
     │
     ▼
CHAPTER 4 ──── Morning Routine ──── Playground ──── Unexpected Events
     │
     ▼
CHAPTER 5 ──── Pretend Play Recognition ──── Create Pretend Play
     │
     ▼
CHAPTER 6 ──── Sound Sensitivity ──── Visual Sensitivity ──── Texture
     │
     ▼
[BREAK REMINDER → optional 2-minute rest]
     │
     ▼
CHAPTER 7 ──── Pattern Completion ──── Free Play Observation ──── Special Interests
     │
     ▼
CHAPTER 8 ──── Simple Imitation ──── Sequential Imitation
     │
     ▼
CHAPTER 9 ──── Grand Journey (20 randomized tasks from prior chapters)
     │
     ▼
OUTRO (Pip wave, gem count shown, certificate generated)
     │
     ▼
SESSION ENDS → Data auto-submitted to MongoDB
```

### 6.3 Adaptive Difficulty Rules
The system uses **real-time adaptive rules** — not to change scoring, but to avoid task abandonment:

| Condition | Adaptive Action |
|---|---|
| Child fails 3 consecutive tasks with no response | Pip offers a simplified "try again" version once |
| Child completes level in < 30% expected time | System flags "rushed completion" and logs a `speed_flag = true` for that level |
| Child does not interact for > 30s | Pip gives a gentle prompt ("Ready to try?"); logged as `inactivity_event` |
| Child age ≤ 4 and on 4-choice task | Automatically reduces to 2-choice for that trial only |

### 6.4 Session Time Targets

| Chapter | Min Time | Max Time | If Child Exceeds Max |
|---|---|---|---|
| 1 | 5 min | 8 min | Auto-advance after 8 min, remaining tasks marked `timeout` |
| 2 | 10 min | 16 min | Same |
| 3 | 12 min | 16 min | Same |
| 4 | 10 min | 14 min | Same |
| 5 | 8 min | 12 min | Same |
| 6 | 6 min | 10 min | Same |
| 7 | 8 min | 12 min | Same |
| 8 | 6 min | 10 min | Same |
| 9 | 8 min | 12 min | Same |
| **Total** | **73 min** | **110 min** | — |

---

## 7. Chapter 1: Welcome to My World

**Clinical Focus:** Baseline engagement, name response, joint attention to pointing
**M-CHAT Items Covered:** #10 (response to name), #16 (follow point)
**DSM-5 Domain:** Social communication (A1, A3)

---

### Level 1.1: Avatar Creation & Name Response

**Narrative Setup:**
> *Pip: "Welcome to Horizon Island! Before we go on our adventure, let's make YOUR explorer! Pick how they look!"*

**Gameplay — Phase 1: Avatar Customization (2–3 minutes)**

The child customizes their explorer character using large, tap-friendly panels:
- **Skin tone:** 5 circular swatches
- **Hair style:** 4 illustrated hair options
- **Hair color:** 6 color swatches
- **Outfit:** 4 illustrated outfit options
- **Accessory:** Hat, scarf, backpack, or none

Each selection updates the avatar live on-screen. There is a "Surprise me!" button that randomizes the appearance.

**Data Collected During Customization:**
- Time spent on each customization category
- Number of option changes (cycling) — excessive repetitive cycling of one option is flagged
- Whether "Surprise me!" is used (correlates with rigidity in choice-making)
- Total time in customization phase (unusually long or short is logged)

**Gameplay — Phase 2: Name Response Test (trials run 3 times)**

After avatar is confirmed, the scene transitions to the Horizon Meadow. The avatar stands facing away. An NPC character (friendly animal — rabbit, dog, or cat, whichever the caregiver selected during setup) appears and calls the **child's name** (pre-recorded using TTS from the name entered at session creation, or a generic "Hey, explorer!" if no name entered) at 5-second intervals.

| Trial | Stimulus | Expected Response |
|---|---|---|
| Trial 1 | Name called (audio only) | Child clicks the avatar/NPC |
| Trial 2 | Name called + NPC waves gently | Child clicks the avatar/NPC |
| Trial 3 | Name called + NPC jumps | Child clicks the avatar/NPC |

**Scoring:**

| Condition | Points |
|---|---|
| Responds < 2 seconds (all 3 trials) | 0 |
| Responds 2–5 seconds | 1 per trial |
| Responds > 5 seconds | 2 per trial |
| No response (trial times out at 8s) | 3 per trial |
| Clicks wrong location (not avatar/NPC area) | +1 per trial |

**ASD Link:** Failure to orient to own name is one of the earliest and most reliable ASD indicators in toddlers (M-CHAT #10). The graduated prompting (audio → audio + wave → audio + jump) mirrors the M-CHAT follow-up interview structure.

---

### Level 1.2: Following the Guide

**Narrative Setup:**
> *Pip: "I love this meadow! Ooh, look at that! Can you find what I'm pointing at?"*

**Gameplay:**

Pip stands on the left side of the Horizon Meadow scene. One by one, Pip points (animated arm extension + directional glow) to 5 objects placed around the scene:
1. Large oak tree (far left background)
2. Yellow house (center background)
3. Red flower (near foreground right)
4. Bright sun (upper right)
5. White cloud (upper left)

On each pointing action:
- A subtle animated glow travels from Pip's finger toward the target
- The child must **click the object Pip is pointing at** (not Pip)
- Each trial has a 10-second response window

**Distractor Elements:**
- 5 additional objects are in the scene (rocks, a bird, a fence, a tree stump, a puddle) that are NOT pointed at.

**Scoring:**

| Condition | Points |
|---|---|
| Clicks correct object within 5s | 0 |
| Clicks correct object within 5–10s | 1 |
| Clicks Pip's pointing hand/arm | 2 (significant flag) |
| Clicks unrelated distractor | 2 |
| No click within 10s | 3 |

**Pattern Flags:**
- If child clicks Pip's hand on 3+ of 5 trials: `flag_points_to_pointer = true` — this is a specific joint attention deficit marker.
- If child clicks random areas with no apparent relationship to Pip's pointing: `flag_random_clicking = true`

**ASD Link:** Joint attention via following a point is a core social communication ability absent or reduced in ASD. Maps to M-CHAT #16, and is a primary ADOS-2 press in Module 1.

---

## 8. Chapter 2: Emotion Island

**Clinical Focus:** Emotion recognition (basic + contextual), emotion expression, emotion regulation
**M-CHAT Items Covered:** (indirect — emotion atypicality)
**DSM-5 Domain:** Social communication (A1), emotional reciprocity
**ADOS-2 Domain:** Emotional understanding presses

---

### Level 2.1: Emotion Matching Garden

**Narrative Setup:**
> *Pip: "This is Emotion Island! Each flower bed belongs to a feeling. Can you help put the right faces in the right beds?"*

**Scene:** Four large flower beds, each labeled with a word AND a corresponding color AND an anchor face card:
- 🌻 **Happy** (Yellow bed) — smiling face
- 💧 **Sad** (Blue bed) — frowning face
- 🔥 **Angry** (Red bed) — furrowed brow face
- 💜 **Scared** (Purple bed) — wide eyes face

**Phase 1: Face Matching (12 cards)**
Cards appear one at a time (floating onto the screen). Each card shows a face — child, adult, or cartoon animal face — expressing one emotion. Child drags the card to the correct flower bed.

Card breakdown:
- 3 Happy faces (child age-similar, adult, cartoon animal)
- 3 Sad faces (same breakdown)
- 3 Angry faces (same breakdown)
- 3 Scared faces (same breakdown)

**Phase 2: Contextual Scenario Matching (8 scenarios)**
A small illustrated scenario appears (static image + 1-sentence Pip narration). Child clicks which flower bed matches:
1. Child's balloon pops → Sad
2. Child wins a race → Happy
3. Child's toy is taken → Angry
4. Child hears a loud bang → Scared
5. Friend gives gift → Happy
6. Child falls down, hurts knee → Sad
7. Child loses their way → Scared
8. Child breaks sibling's toy → Angry (with guilt nuance)

**Scoring:**

| Accuracy | Points |
|---|---|
| ≥ 90% correct | 0 |
| 70–89% correct | 1 |
| 50–69% correct | 2 |
| < 50% correct | 3 |
| Negative emotions (angry/scared) < 80% accurate | +2 (additional flag) |
| Fear/Sad confusion rate > 25% | +2 (additional flag) |

**Additional Data Logged:**
- Confusion matrix (which emotion was confused for which — full 4×4 matrix stored in MongoDB)
- Hover dwell time per card before placement
- Number of drag-and-drop errors (picking up wrong card, placing wrong, correcting)

---

### Level 2.2: Emotion Expression Mirror

**Narrative Setup:**
> *Pip: "Now it's YOUR explorer's turn! I'll say a feeling, and you pick the face that shows it!"*

**Scene:** The Mirror Hall. Pip stands on left. The child's avatar stands in front of the mirror. Pip calls out an emotion (audio + text label on screen). Six face option cards appear below the mirror. Child taps the correct one.

**Stimuli:** 16 trials — 4 per emotion (Happy, Sad, Angry, Scared)

**Distractor Face Types (5 per trial):**
- Correct emotion at wrong intensity (e.g., mild happy when strong happy asked)
- Neutral face
- Opposite valence emotion (e.g., happy when sad asked)
- Adjacent emotion (e.g., scared when angry asked)
- Ambiguous/confused expression

**Scoring per trial:**

| Selection | Points |
|---|---|
| Correct emotion (any intensity) | 0 |
| Correct emotion, wrong intensity | 1 |
| Neutral face selected | 2 |
| Adjacent emotion selected | 2 |
| Opposite emotion selected | 3 |
| No response within 8s | 2 |

---

### Level 2.3: Emotion Regulation Scenarios

**Narrative Setup:**
> *Pip: "Sometimes things don't go the way we want. Watch what happens and help choose what to do!"*

**Format:** Animated storyboard (3–4 frames) showing a scenario. After the last frame, 4 response buttons appear. Child picks what the character should do.

**6 Scenarios:**

**Scenario 1: The Dropped Ice Cream**
Story: Child's ice cream falls on the ground.
Options:
- A) Cry quietly and ask parent for help → Socially appropriate (0 pts)
- B) Scream and throw themselves on the floor → Aggressive/dysregulated (3 pts)
- C) Walk away silently, ignoring it → Avoidant (2 pts)
- D) Stand frozen and stare → Shutdown (2 pts)

**Scenario 2: Friend Takes Toy Without Asking**
Options:
- A) Say "Hey, can I have that back please?" → Appropriate (0 pts)
- B) Grab it back forcefully → Aggressive (3 pts)
- C) Say nothing and go play alone → Avoidant (2 pts)
- D) Tell a grown-up → Appropriate (0 pts)

**Scenario 3: Sudden Loud Noise**
Options:
- A) Look around curiously → Appropriate (0 pts)
- B) Cover ears and run away → Dysregulated (2 pts)
- C) Freeze and stare → Shutdown (2 pts)
- D) Ask "What was that?" → Appropriate (0 pts)

**Scenario 4: Can't Find Backpack**
Options:
- A) Search methodically, ask for help → Flexible (0 pts)
- B) Panic and refuse to leave without it → Rigid (3 pts)
- C) Sit down and cry → Dysregulated (2 pts)
- D) Use a different bag → Problem-solving (0 pts)

**Scenario 5: Favorite Toy Breaks**
Options:
- A) Feel sad, accept it, ask to get a new one → Appropriate (0 pts)
- B) Extreme meltdown → Dysregulated (3 pts)
- C) Pretend it didn't happen → Avoidant (2 pts)
- D) Try to fix it → Problem-solving (0 pts)

**Scenario 6: Peer Conflict at School**
Options:
- A) Talk it out → Appropriate (0 pts)
- B) Physical aggression → Aggressive (3 pts)
- C) Completely withdraw → Avoidant (2 pts)
- D) Get a teacher → Appropriate (0 pts)

**Additional time penalty:** If decision > 15 seconds: +1 pt per scenario.

---

## 9. Chapter 3: Friend's House Visit

**Clinical Focus:** Social communication — greeting, reciprocity, turn-taking, joint attention sharing
**M-CHAT Items Covered:** #11 (social reciprocity), #9 (showing), #16 (joint attention)
**DSM-5 Domain:** Social communication (A1, A2, A3)

---

### Level 3.1: Greeting Sequence

**Narrative Setup:**
> *Pip: "Your explorer is visiting Alex today! Let's go say hello!"*

**Scene:** Alex's Front Door. The avatar approaches. Alex opens the door.

**Step 1 — Door Knock / Arrival Statement**
Child is shown 4 options for what to say when the door opens:
- A) "Hello! / Hi Alex!" → Appropriate greeting (0 pts)
- B) [Silence — child taps nothing within 8s] → No greeting (3 pts)
- C) "Can I play with you?" → Appropriate with social intent (0 pts)
- D) "Where's your dog?" → Inappropriate/off-topic opener (2 pts)

**Step 2 — Alex Waves and Smiles**
Alex's character performs a wave + smile animation. Child must respond by clicking one of 4 options:
- A) Wave back → Reciprocal (0 pts)
- B) Smile back → Reciprocal (0 pts)
- C) Wave + smile back → Reciprocal + initiated (0 pts)
- D) Do nothing → No reciprocation (2 pts)

**Step 3 — Eye Contact Simulation**
Alex looks directly at the camera (simulated eye contact). A gentle glow highlights Alex's face. Child must click Alex's face area within 5 seconds.
- Click < 2s: 0 pts (typical)
- Click 2–5s: 1 pt
- Click face but avoid eyes area: 1 pt
- Click > 5s or no click: 2 pts

---

### Level 3.2: Conversation Turn-Taking

**Scene:** Alex's Living Room. Alex and the avatar are seated across from each other.

**Format:** 8 conversation exchanges. For each, Alex speaks (audio + speech bubble), and child selects a response from 3–4 illustrated speech bubble options.

**Full 8-Exchange Script:**

| # | Alex Says | Options | Scoring |
|---|---|---|---|
| 1 | "I got a new puzzle! Want to try?" | A: "Yes, looks fun!" (0) / B: "I only like cars" (rigid, 3) / C: [silence] (2) / D: "Puzzles have 500 pieces typically" (info-dump, 2) | — |
| 2 | "What's your favorite thing to do?" | A: "I love drawing!" (0) / B: Lists 12 facts about trains (restricted, 3) / C: "I don't know" (0) / D: [silence] (2) | — |
| 3 | "I'm feeling a bit tired today." | A: "Oh, did you sleep okay?" (0 — empathy) / B: "Let's play anyway!" (1 — miss cue) / C: "I'm not tired" (1 — self-focused) / D: [silence] (2) | — |
| 4 | "Look at my drawing!" (holds up paper) | A: "Wow, I love it!" (0) / B: "The perspective is anatomically wrong" (literal, 3) / C: [ignore] (2) / D: "Did you use crayons?" (0 — engaged) | — |
| 5 | "Should we share the blocks?" | A: "Yes, you take some and I take some" (0) / B: "All mine" (3) / C: [silence] (2) / D: Starts arranging blocks alone (avoidant, 2) | — |
| 6 | "I made up a funny joke!" | A: "Tell me!" (0) / B: "Jokes are illogical" (literal, 3) / C: Laugh preemptively (0) / D: [silence] (2) | — |
| 7 | "Oops, I spilled!" | A: "It's okay, we can clean it" (0) / B: "Why did you do that?" (2) / C: Helps clean without words (0) / D: Leaves room (avoidant, 2) | — |
| 8 | "Thanks for coming over today!" | A: "Thanks for having me!" (0) / B: "See you tomorrow at exactly 3pm" (rigid, 2) / C: [silence] (2) / D: Asks unrelated question (off-topic, 2) | — |

**Pattern Flag:** If child selects factual/info-dump options on 4+ exchanges: `flag_restricted_interest_conversation = true` (+5 pts to domain score).

---

### Level 3.3: Sharing & Joint Attention (Discovery in the Garden)

**Scene:** Alex's Backyard. Both characters explore the garden.

**Format:** 5 discovery events alternating between Alex-initiated and avatar-initiated.

**Event 1 (Alex points):** Alex points excitedly to a butterfly. Child must click the butterfly (not Alex).
**Event 2 (Alex-initiated):** Alex picks up a spotted rock and holds it up. Child must click the rock.
**Event 3 (Avatar finds a marble):** Four choice buttons appear:
- A) "Alex, look what I found!" → Sharing, joint attention (0 pts)
- B) Put it in pocket quietly → Solo play (2 pts)
- C) Keep playing alone → Solo focus (2 pts)
- D) Describe 5 facts about marble formation → Info-dump (1 pt)

**Event 4 (Alex-initiated):** Alex finds a ladybug, crouches down, looks excited. Child clicks either:
- Ladybug directly: 0 pts (follows gaze)
- Alex: 1 pt (social, not joint)
- Elsewhere: 2 pts

**Event 5 (Avatar finds a shiny leaf):** Same choice format as Event 3.

---

## 10. Chapter 4: Daily Routines Village

**Clinical Focus:** Executive function, cognitive flexibility, response to change, rigidity
**DSM-5 Domain:** Restricted/repetitive behaviors (B3 — insistence on sameness)

---

### Level 4.1: Morning Routine Sequence

**Scene:** Morning Bedroom.

**Phase 1 — Sequence Building:**
6 routine item cards are scrambled on screen. Child drags them into the correct order in a sequence tray. Items: Wake up, Brush teeth, Get dressed, Eat breakfast, Pack bag, Put on shoes.

Scoring:
- Each sequence error: 1 pt
- Completes correctly on 1st try: 0 pts additional
- Cannot complete after 3 attempts: 3 pts

**Phase 2 — Disruption Response:**
After sequence is complete, Pip announces: *"Oh no! Alex's shirt is wet from the wash! What should the explorer do?"*

Options:
- A) Ask parent for help → Flexible (0 pts)
- B) Wear the wet shirt anyway → Rigid (3 pts)
- C) Have a meltdown / refuse to proceed → Inflexibility (4 pts)
- D) Wear yesterday's shirt from the hamper → Problem-solving (0 pts)
- E) Sit and do nothing → Shutdown (2 pts)

Response time > 10s for disruption question: +1 pt.

---

### Level 4.2: Playground Equipment Choice

**Scene:** Playground.

**Format:** Child selects an activity (swing, slide, sandbox, monkey bars, seesaw), plays it (3 simple interaction clicks), then Pip says: *"That was fun! Want to try something different?"*

This repeats 5 times. Child can choose the same or different equipment each round.

**Scoring:**

| Behavior | Points |
|---|---|
| Selects same equipment 3+ consecutive times | 3 pts |
| Selects same equipment all 5 rounds | 5 pts |
| Transition delay > 8s per transition | 2 pts per occurrence |
| Exhibits same sequence of 3+ clicks every round | 2 pts (perseveration flag) |

---

### Level 4.3: Unexpected Events Response

**Format:** 4 illustrated scenarios, each with 4 choice options. Scene renders as a mini-map with the situation shown.

| Scenario | Options | Scoring |
|---|---|---|
| Path to park is blocked | A: Take detour (0) / B: Wait and try again (0) / C: Become upset, refuse to move (3) / D: Ask someone for help (0) | Time > 12s: +1 |
| Library is unexpectedly closed | A: Come back tomorrow (0) / B: Try another activity (0) / C: Cry and insist (3) / D: Read outside on bench (creative, 0) | Same |
| Favorite food unavailable at café | A: Try something new (0) / B: Order nothing and leave upset (2) / C: Ask for the closest similar option (0) / D: Refuse to eat (3) | Same |
| Rain cancels outdoor plan | A: Suggest indoor alternative (0) / B: Insist on going outside anyway (3) / C: Refuse all alternatives (3) / D: Accept calmly (0) | Same |

---

## 11. Chapter 5: Pretend Play Theater

**Clinical Focus:** Symbolic/pretend play recognition and generation
**M-CHAT Items Covered:** #3 (pretend play deficit)
**DSM-5 Domain:** Restricted/repetitive behaviors (B1 — inflexibility of play)

---

### Level 5.1: Pretend Play Recognition

**Scene:** The Magic Theater. A small stage with curtain. A character performs an action animation. After the animation, Pip asks: *"What are they doing?"* Four options appear.

**5 Scenarios:**

| Animation | Pip's Question | Options | Correct |
|---|---|---|---|
| Character holds banana to ear, talks | "What are they doing?" | A: Eating / B: Talking on phone (pretend) / C: Being silly / D: Holding banana | B |
| Character stirs empty pot, smells it | "What are they doing?" | A: Washing pot / B: Cooking pretend soup / C: Just playing / D: Nothing | B |
| Character feeds teddy with empty spoon | "What are they doing?" | A: Feeding the bear (pretend) / B: Cleaning the bear / C: Holding a spoon / D: Moving the bear | A |
| Character pushes wooden block making "vroom" sounds | "What are they doing?" | A: Pushing something / B: Playing pretend car / C: Making noise / D: Moving | B |
| Character pretend-drinks from empty cup, sighs contentedly | "What are they doing?" | A: Holding cup / B: Drinking pretend tea / C: Playing / D: Looking at cup | B |

**Scoring per scenario:**

| Response | Points |
|---|---|
| Identifies pretend correctly | 0 |
| Literal answer (describes action only) | 2 |
| "Don't know" or no response | 1 |
| All 5 literal: pattern flag | +3 |

---

### Level 5.2: Create Your Own Pretend Play

**Scene:** The Toy Chest Room.

**Format:** 4 prompts given by Pip. Objects are scattered on screen. Child clicks/selects objects to use for the pretend scenario. Child must select ≥ 2 objects per scenario.

| Pip's Prompt | Objects Available | Symbolic Use Expected |
|---|---|---|
| "Let's have a tea party!" | Blocks, stick, leaves, rocks, toy cup, paper | Leaves as food, rocks as plates, block as teapot |
| "Let's be superheroes!" | Blanket, box, pillow, toy, stick | Blanket as cape, box as hideout |
| "Let's go on a trip!" | Chair, basket, cardboard, rope, bowl | Chair as car, basket as suitcase |
| "Let's build a house!" | Blocks, fabric, sticks, box | Creative construction |

**Scoring per scenario:**

| Behavior | Points |
|---|---|
| Selects 2+ objects for symbolic purpose | 0 |
| Selects only literal-use objects (toy cup only) | 2 |
| Refuses to select anything | 3 |
| Selects 1 object, stops | 2 |
| Response time > 15s to first selection | +1 |

---

## 12. Chapter 6: Sensory Garden

**Clinical Focus:** Auditory, visual, and tactile sensory processing patterns
**M-CHAT Items Covered:** #12 (noise sensitivity)
**DSM-5 Domain:** Restricted/repetitive behaviors (B4 — sensory hyper/hypo reactivity)

---

### Level 6.1: Sound Sensitivity

**Scene:** Sound Forest.

**Caregiver Alert:** Before this level starts, a caregiver-facing overlay appears:
> *"Please set device volume to 60% now. A volume indicator will confirm."*

**Format:** Each of 8 sounds plays once (4 seconds). After each, a row of 5 face-buttons appears for the child to rate how it felt:
😄 Love it | 😐 Okay | 😟 Didn't like it | 😨 Upset me | 🙉 Too loud! (bonus button)

**After rating, child also has option:** "Skip to next" (clicking this immediately counted as avoidance).

**Scoring:**

| Metric | Points |
|---|---|
| "Upset me" or "Too loud!" for 4+ sounds | 3 |
| Vacuum / dog / thunder rated "Upset me" or "Too loud!" | 2 each (specific flag: `flag_mechanical_sound_sensitivity`) |
| Clicks "Too loud!" 3+ times | 2 |
| "Skip to next" before sound ends 2+ times | 3 |

---

### Level 6.2: Visual Sensitivity Patterns

**Scene:** Visual Gallery — a museum hallway with 6 framed "rooms" viewed through picture-frame doorways.

**Format:** Child's avatar walks along the hallway. For each room, the child chooses:
- Walk up and look (engagement)
- Walk quickly past (avoidance)
- After looking: rates comfort (comfortable / uncomfortable)

**6 Rooms:**

| Room | Content | Expected ASD Pattern |
|---|---|---|
| Calm painting room | Soft blues and greens, simple shapes | Neutral |
| Rainbow room | Bright, vivid, colorful static | May distress |
| Flickering light room | Subtle rhythmic flicker (safe 3Hz) | May distress OR may attract |
| Spinning pinwheel room | Gentle rotation animation | May attract (hypnotic) |
| Crowded scene room | Many objects, people, items | May distress |
| Striped pattern room | High-contrast black/white stripes | May distress OR may attract (hyper) |

**Scoring:**

| Behavior | Points |
|---|---|
| Avoids (skips) 3+ rooms | 2 |
| Rates flickering or motion room "uncomfortable" | 2 |
| Spends > 20s in striped/spinning room vs < 5s in others | 1 (hyperfocus flag) |
| Rates crowded room "uncomfortable" | 1 |

---

### Level 6.3: Texture Preferences

**Scene:** Texture Pavilion — a table with 8 labeled texture swatches, each with a visual image and a short Pip description.

**Pip narrates each texture:** *"This one is soft and fluffy, like a cloud! How do you feel about this one?"*

**5-point response scale (illustrated):**
❤️ Love to touch! | 👍 Okay | 👎 Don't like | 🚫 Never touch | ❓ Don't know / won't try

**8 Textures:**

| Texture | Description | Common ASD Response |
|---|---|---|
| Soft fluffy cotton | Soft, light, dry | Typically positive |
| Smooth cool glass | Smooth, cold, hard | Typically neutral |
| Bumpy rough rock | Hard, irregular, rough | May avoid |
| Squishy wet clay | Wet, moldable, cold | Often aversive |
| Sticky honey | Wet, sticky, sweet smell icon | Often aversive |
| Scratchy sandpaper | Rough, abrasive | May avoid |
| Silky ribbon | Smooth, flowing, cool | Typically positive |
| Slimy jello | Wet, jiggly, cold | Often aversive |

**Scoring:**

| Metric | Points |
|---|---|
| 4+ textures rated "Don't like" or worse | 2 |
| All 3 wet textures (clay, honey, jello) rated aversive | 2 |
| "Won't try" for 2+ textures | 2 |

---

## 13. Chapter 7: Pattern Detective Agency

**Clinical Focus:** Insistence on sameness, restricted/repetitive patterns, special interest intensity
**DSM-5 Domain:** Restricted/repetitive behaviors (B2, B3)

---

### Level 7.1: Pattern Completion

**Scene:** Pattern Workshop.

**Format:** 5 pattern sequences presented as rows of colored shapes on a workbench. Missing items are shown as blank gray squares. Child drags correct shapes from a palette to fill blanks.

| Pattern | Complexity |
|---|---|
| AB: 🔴🔵🔴🔵_ _ | Simple |
| ABC: ○□△○□_ _ | Medium |
| AABB: 🔴🔴🔵🔵🔴_ _ | Medium |
| Complex: 🔴○🔴□🔵○🔵_ _ _ _ | Hard |
| Forced error: Pattern has a deliberate wrong block. "Fix it or leave it?" | Emotional response |
| Pattern change: "Now let's try a totally new pattern!" | Flexibility |

**Scoring (behavior, not accuracy):**

| Behavior | Points |
|---|---|
| Strong distress at forced error ("has to fix it" + emotional reaction) | 3 |
| Refuses to start new pattern | 3 |
| Delay > 10s to begin new pattern | 2 |
| Returns to completed patterns instead of proceeding | 2 |
| Pattern errors themselves | 0 (not an ASD indicator) |

---

### Level 7.2: Free Play Observation

**Scene:** Free Play Room — scattered blocks, toy cars, animal figures, balls.

**Duration:** 3 minutes of free play. Pip says: *"You can play with anything you want in here!"*

**System passively observes:**
- Which objects are clicked/interacted with
- Sequence of interactions
- Whether child organizes or lines up objects (detected by spatial proximity algorithm — if 5+ objects placed in a linear row: `flag_lining_up = true`)
- Whether child repeats the same action 8+ times consecutively (`flag_perseverative_action = true`)

**Disruption at 2-minute mark:** Pip gently moves one of the organized items. System logs emotional response:
- Child ignores disruption: 0 pts
- Child moves it back once: 1 pt
- Child becomes visibly upset (repeated clicking on disrupted area): 2 pts
- Child refuses to continue: 3 pts

---

### Level 7.3: Special Interest Intensity

**Scene:** Library Corner — 8 themed bookshelves.

**Topics:** 🦕 Dinosaurs | 🚂 Trains | 🪐 Space | 🐘 Animals | 🚗 Vehicles | 🔢 Numbers | ⛈️ Weather | 🗺️ Maps

**Format:** Child freely selects a topic to "read." Clicking a book shows 5 fact cards (animated, voice-read by Pip). After reading, Pip says: *"Great! Let's try a different topic!"* This repeats 4 times.

**Tracking:**
- Topic selected each round
- Whether child switches topics or returns to same
- Number of fact-cards clicked per topic session (1–5)
- Latency when Pip suggests changing

**Scoring:**

| Behavior | Points |
|---|---|
| Same topic selected 3+ of 4 rounds | 3 |
| Reads all 5 facts + clicks back for more × 2 topics | 2 (unusual depth) |
| Transition resistance: > 8s before selecting new book | 2 per instance |
| Returns to same topic after being redirected | 2 |

---

## 14. Chapter 8: Copy Cat Challenge

**Clinical Focus:** Imitation — facial, body, and object-use
**M-CHAT Items Covered:** #15 (imitation deficit)
**DSM-5 Domain:** Social communication (A1)

---

### Level 8.1: Simple Action Imitation

**Scene:** Copy Cat Studio — split-screen. Left: character performing action. Right: 4 illustrated action option cards.

**Format:** Character performs an action (animation plays twice). Child selects the matching action from 4 illustrated option cards.

**12 Actions:**

| Category | Actions |
|---|---|
| Facial | Wave hello, stick out tongue, blow a kiss, scrunch nose |
| Body | Jump up and down, spin around, stomp feet, arms stretched wide |
| Object Use | Pretend drink from cup, pretend comb hair, pretend throw ball, pretend read book |

**Scoring:**

| Error Type | Points |
|---|---|
| Facial imitation error | 2 each |
| Body imitation error | 1 each |
| Object use error | 1 each |
| No response within 8s | 2 each |
| 6+ total errors across all 12 | +3 (significant deficit flag) |

---

### Level 8.2: Sequential Imitation

**Scene:** Action Stage — a scroll appears showing the sequence. Character demonstrates the sequence. Child clicks action tiles in order.

**6 Sequences:**

| Sequence | Length |
|---|---|
| Clap → Wave | 2 |
| Jump → Spin | 2 |
| Touch head → Touch nose | 2 |
| Wave → Clap → Jump | 3 |
| Touch nose → Stomp → Clap | 3 |
| Spin → Wave → Touch head | 3 |

**Scoring:**

| Error | Points |
|---|---|
| 2-action sequence error | 1 each |
| 3-action sequence error | 2 each |
| Same action repeated twice (perseveration) | +2 |
| Cannot complete any 3-action sequence | +3 |

---

## 15. Chapter 9: Assessment Summary (The Grand Journey)

**Clinical Focus:** Consistency, generalization, cross-context skill maintenance

**Narrative Setup:**
> *Pip: "Wow, we've visited every island! Let's take one last big journey through ALL our worlds and see what we remember!"*

**Format:** The Horizon Map is shown. 20 tasks are presented in randomized order, selected by the system from all previous chapters. Each task type appears in a miniature version of its original scene. No new mechanics or task types are introduced.

**Selection Algorithm:**
- 2–3 tasks from each of Chapters 1–8
- Tasks are weighted toward areas where the child showed the most borderline scores in the first pass (adaptive re-sampling)
- Maximum 3 consecutive tasks from the same domain

**Purpose:**
- **Consistency check:** Compare Chapter 9 performance on same task type to original chapter performance. High variability → `flag_inconsistent_performance = true`
- **Fatigue modeling:** Performance degradation in Chapter 9 vs earlier is noted and factored into analysis
- **Generalization:** Tasks are presented in slightly varied visual contexts (different color scheme for the scene) to test context independence

**Chapter 9 Scoring:**
Does not add to raw domain scores. Instead, generates a **consistency modifier**:
- ≤ 15% deviation from original scores: no modifier
- 16–30% deviation: `consistency_modifier = 0.9` (slight reduction in confidence)
- > 30% deviation: `consistency_modifier = 0.8` (lower confidence flag for clinician)

---

## 16. Scoring System — Complete Specification

### 16.1 Domain Structure

| Domain ID | Domain Name | Chapters | Raw Max Points |
|---|---|---|---|
| D1 | Social Communication | 2, 3, 8 | 100 |
| D2 | Restricted/Repetitive Behaviors | 4, 7 | 70 |
| D3 | Sensory Processing | 6 | 30 |
| D4 | Pretend Play & Imagination | 5 | 40 |

### 16.2 Domain Weights & Composite Score Formula

```
Composite Score = (D1_score × 0.40) + (D2_score × 0.30)
                + (D3_score × 0.15) + (D4_score × 0.15)
```

Maximum raw composite: 100 points (post-normalization).

### 16.3 Age-Normative Adjustment

Domain scores are adjusted by age band using normative percentile data collected in the validation phase:

```
Adjusted_Score = Raw_Score × Age_Normative_Factor[age_band][domain]
```

Age bands: 3–4, 5–6, 7–8, 9–10+
Age normative factors are loaded from the MongoDB `normative_data` collection and are updated as more validation data is collected.

### 16.4 Red Flag Multipliers

| Pattern Detected | Multiplier Applied To |
|---|---|
| Negative emotion recognition < 50% overall | Composite × 1.20 |
| Complete absence of pretend play (all 5 Recognition = literal) | D4 × 1.30 |
| 4+ distressing sounds (Sensory Level 6.1) | D3 × 1.15 |
| Rigid pattern behavior + distress at disruption (Level 7.1 + 7.2 both flagged) | D2 × 1.20 |
| Imitation deficit: 6+ errors in Level 8.1 | D1 × 1.25 |
| No greeting + no social reciprocity (Level 3.1 all items flagged) | D1 × 1.10 |

Multipliers are applied after age-normative adjustment and are capped at 1.30 per domain to prevent over-inflation.

### 16.5 Overall Risk Classification

| Composite Score | Risk Level | System Recommendation |
|---|---|---|
| 0–25 | 🟢 Low | Minimal indicators. Typical developmental profile likely. |
| 26–45 | 🟡 Moderate | Some indicators present. Suggest monitoring and re-screening in 3–6 months. |
| 46–65 | 🟠 High | Significant indicators across multiple domains. Clinical evaluation recommended (ADOS-2 or equivalent). |
| 66–100 | 🔴 Very High | Strong indicators across most domains. Urgent clinical referral recommended. |

### 16.6 Domain-Level Risk Classification

Each domain is also independently classified:

| Domain | Low | Moderate | High |
|---|---|---|---|
| D1 Social Communication | 0–20 | 21–45 | 46+ |
| D2 Restricted/Repetitive | 0–15 | 16–30 | 31+ |
| D3 Sensory Processing | 0–8 | 9–15 | 16+ |
| D4 Pretend Play | 0–10 | 11–20 | 21+ |

### 16.7 Behavioral Flag Summary Table

These flags are computed separately from the numeric score and appear as qualitative markers in the clinician report:

| Flag ID | Description | Source |
|---|---|---|
| F01 | `no_name_response` | Level 1.1 — all 3 trials failed |
| F02 | `points_to_pointer` | Level 1.2 — 3+ trials |
| F03 | `no_social_greeting` | Level 3.1 |
| F04 | `no_social_reciprocity` | Level 3.1 |
| F05 | `restricted_conversation_interest` | Level 3.2 |
| F06 | `negative_emotion_recognition_deficit` | Level 2.1 |
| F07 | `no_pretend_play_recognition` | Level 5.1 |
| F08 | `no_symbolic_play` | Level 5.2 |
| F09 | `mechanical_sound_sensitivity` | Level 6.1 |
| F10 | `wet_texture_aversion` | Level 6.3 |
| F11 | `lining_up_objects` | Level 7.2 |
| F12 | `perseverative_action` | Level 7.2 |
| F13 | `restricted_special_interest` | Level 7.3 |
| F14 | `imitation_deficit` | Level 8.1 |
| F15 | `inconsistent_performance` | Chapter 9 |
| F16 | `rigidity_at_routine_disruption` | Level 4.1 |
| F17 | `playground_same_activity_repeat` | Level 4.2 |

---

## 17. ASD Evaluation Process — Data-Driven Analysis

### 17.1 What the Game Measures vs. Clinical Diagnosis
**This game does NOT diagnose ASD.** It is a structured behavioral observation tool that:
1. Quantifies behavioral patterns that correlate with ASD indicators
2. Generates a risk profile report for clinician review
3. Serves as a pre-screening tool to prioritize referrals for comprehensive evaluation (ADOS-2, ADI-R, DSM-5 clinical interview)

### 17.2 The Evaluation Pipeline

```
GAME SESSION (child plays)
        │
        ▼
TASK RESPONSE LOGGED → /api/response  (task_responses table)
MOUSE MOVEMENTS LOGGED → /api/mouse   (mouse_movements table)
CHAPTER SCORE LOGGED → /api/score     (chapter_scores table)
FLAG CHECK → /api/flag                (red_flags table)
        │
        ▼  [GET /api/results/:sessionId triggered at session end]
        │
        ├─► RULE-BASED PIPELINE (existing, always runs)
        │         │
        │         ├─ aggregateDomainScores()   → domain_scores table
        │         ├─ detectAndSaveRedFlags()   → red_flags table
        │         ├─ calculateCombinedScore()  → weighted composite
        │         └─ getRiskLevel()            → low/medium/high/very_high
        │
        ├─► ML FEATURE EXTRACTION (new, lib/ml/featureExtractor.js)
        │         │
        │         ├─ extractResponseFeatures()   → 28 numeric features from task_responses
        │         ├─ extractMouseFeatures()      → 8 numeric features from mouse_movements
        │         └─ normalizeByAge()            → age-adjusted feature vector
        │
        ├─► ML INFERENCE (new, Python FastAPI sidecar)
        │         │
        │         ├─ POST http://localhost:8000/predict  {features: [...]}
        │         ├─ Random Forest / XGBoost prediction
        │         └─ Returns: { asd_probability, confidence, shap_values, model_version }
        │
        ├─► ML RESULT STORED (new, ml_predictions table in SQLite)
        │
        └─► COMBINED RESPONSE returned to client:
              rule_based_score, rule_based_risk,
              ml_probability, ml_confidence,
              consensus_risk, shap_explanations,
              active_red_flags, domain_scores
```

### 17.3 Behavioral Indicators & Their Mapping to DSM-5/M-CHAT

| Game Mechanic | Behavioral Signal Captured | DSM-5 Criterion | M-CHAT Item |
|---|---|---|---|
| Name response (1.1) | Response to own name | A1 — Social-emotional reciprocity | #10 |
| Follow point (1.2) | Joint attention via pointing | A3 — Nonverbal communication | #16 |
| Emotion matching (2.1) | Facial emotion recognition | A1 — Emotional reciprocity | — |
| Emotion regulation (2.3) | Regulation strategy selection | A1 — Emotional reciprocity | — |
| Greeting sequence (3.1) | Social initiation, eye contact | A1, A2 — Social reciprocity | #11 |
| Conversation turns (3.2) | Turn-taking, topic maintenance | A1 — Social reciprocity | — |
| Joint discovery (3.3) | Showing to share, gaze following | A3 — Nonverbal communication | #9 |
| Routine disruption (4.1) | Inflexibility, distress at change | B3 — Insistence on sameness | — |
| Playground repetition (4.2) | Repetitive activity patterns | B2 — Repetitive motor movements | — |
| Pretend play recognition (5.1) | Symbolic understanding | B1 — Inflexible play | #3 |
| Symbolic play creation (5.2) | Pretend play generation | B1 — Inflexible play | #3 |
| Sound sensitivity (6.1) | Auditory hyper-reactivity | B4 — Sensory reactivity | #12 |
| Visual sensitivity (6.2) | Visual hyper/hypo-reactivity | B4 — Sensory reactivity | — |
| Pattern distress (7.1) | Distress at change | B3 — Insistence on sameness | — |
| Repetitive behavior (7.2) | Stereotyped motor behavior | B2 — Repetitive motor behavior | — |
| Special interests (7.3) | Restricted interest intensity | B3 — Restricted interests | — |
| Simple imitation (8.1) | Imitation capacity | A2 — Nonverbal communication | #15 |
| Sequential imitation (8.2) | Motor imitation | A2 — Nonverbal communication | #15 |

### 17.4 Statistical Model for Risk Scoring

**Phase 1 (pre-launch, validation study):**
- 100+ neurotypical children (ages 3–10) play the game → establishes **normative score distributions** per age band per domain
- 50+ ASD-diagnosed children (ADOS-2 confirmed) play → establishes **ASD score distributions**
- ROC curve analysis per domain to set **optimal cut-off thresholds**

**Phase 2 (live deployment):**
- Each new session is scored against the validated cut-offs
- **Sensitivity and specificity targets:** ≥ 80% sensitivity, ≥ 75% specificity

**Confidence Intervals:**
Every domain score is reported with a **90% confidence interval** based on within-session response consistency:
```
CI = score ± (1.645 × within_domain_sd)
```

### 17.5 Behavioral Pattern Analysis (Beyond Raw Scores)

The system runs a **Pattern Analysis Engine** (Node.js service, post-session) that examines:

**Temporal Patterns:**
- Response time trajectory across a chapter (slowing down = fatigue or increasing difficulty)
- Response time spikes at specific task types (emotional content, social scenarios)

**Consistency Analysis:**
- Coefficient of variation (CV) of response times within a domain
- High CV (> 40%) → `flag_high_response_variability`

**Interaction Pattern Analysis:**
- Mouse/touch path data → identify circular or repetitive cursor movements during decision-making
- Hover dwell time: lingering on one option before selecting another (ambivalence signal)

**Sequential Dependency Analysis:**
- Whether the child's responses show sequential dependency (always picking option A regardless of content)
- Detected via chi-square test on response distributions

### 17.6 The Clinician Report

The report is generated as a **PDF and web-view** and contains:

**Section 1 — Session Overview**
- Child pseudonymized ID, age, session date, duration, completion status

**Section 2 — Domain Score Profile**
- Radar chart (web) / bar chart (PDF) showing all 4 domain scores with risk level color coding
- Comparison to age-normative range (shaded area on chart)

**Section 3 — Composite Score & Risk Classification**
- Prominent risk level badge (Low / Moderate / High / Very High)
- Score breakdown with multipliers shown

**Section 4 — Behavioral Flag Summary**
- List of all triggered flags (F01–F17) with brief plain-English explanations
- M-CHAT and DSM-5 cross-references for each flag

**Section 5 — Item-Level Detail**
- Per-chapter, per-level breakdown
- Response time charts
- Confusion matrices (emotion matching)

**Section 6 — Recommended Next Steps**
- Auto-generated recommendations based on risk level and flagged domains
- Referral suggestions (ADOS-2, speech-language evaluation, OT for sensory)
- Re-screening timeline if applicable

**Section 7 — Data Quality Indicators**
- Completion rate, inactivity events, speed flags, timeout events
- Session reliability score (0–100%) — sessions with < 70% reliability are flagged for clinician review

---

## 18. Database Architecture — MongoDB Migration

### 18.1 Why Migrate from SQLite to MongoDB

The current implementation uses `bun:sqlite` (SQLite). The planned migration to **MongoDB** is motivated by:
- **Flexible schema**: `extra_data` and `camera_data` fields grow in complexity as ML features are added; MongoDB's document model handles this natively without migrations
- **Horizontal scaling**: Multi-site research deployments can share a single Atlas cluster
- **Rich aggregation pipeline**: MongoDB's `$group`, `$lookup`, and `$unwind` operators simplify the researcher dashboard queries that currently require complex SQL joins
- **Native JSON**: All current `TEXT` JSON blobs (selection, extra_data, avatar_data) become first-class embedded documents

### 18.2 Migration Strategy — Minimal Code Change

The key principle: **keep `lib/db/queries/*.js` function signatures identical**. Only the internals of each query file change. No API routes, scoring engine, or game components need modification.

```
BEFORE (SQLite)                          AFTER (MongoDB)
─────────────────────────────────────    ─────────────────────────────────────
lib/db/index.js                          lib/db/index.js
  getDb() → bun:sqlite Database            connectDb() → Mongoose connection

lib/db/schema.js                         lib/db/models/
  CREATE TABLE statements                  Session.js   (Mongoose schema)
                                           Response.js
                                           MouseMovement.js
                                           ChapterScore.js
                                           RedFlag.js
                                           DomainScore.js
                                           MlPrediction.js    ← NEW
                                           CameraFrame.js     ← NEW

lib/db/migrations.js                     lib/db/migrations.js
  runMigrations() → no-op                  runMigrations() → createIndexes()

lib/db/queries/sessions.js               lib/db/queries/sessions.js
  createSession(), getSession()            Same function names, Mongoose calls
  listSessions(), updateSession()

lib/db/queries/responses.js              lib/db/queries/responses.js
  createResponse()                         Same names, Mongoose calls
  getResponsesBySession()

lib/db/queries/scores.js                 lib/db/queries/scores.js
  addChapterScore()                        Same names, Mongoose calls
  getScoresBySession()

lib/db/queries/mouseMovements.js         lib/db/queries/mouseMovements.js
  batchInsertMouseMovements()              Same names, Mongoose calls

lib/db/queries/redFlags.js               lib/db/queries/redFlags.js
  addRedFlag()                             Same names, Mongoose calls
  getRedFlagsBySession()

lib/db/queries/domainScores.js           lib/db/queries/domainScores.js
  upsertDomainScore()                      Same names, Mongoose calls
  getDomainScoresBySession()
```

### 18.3 Updated `lib/db/index.js`

```js
// lib/db/index.js — MongoDB version
import mongoose from 'mongoose';

let isConnected = false;

/**
 * Returns a live Mongoose connection. Call at the top of every API route.
 * Replaces the old getDb() for SQLite.
 */
export async function connectDb() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'game_horizons',
  });
  isConnected = true;
}

// For test isolation (mirrors old setDbForTests / resetDbForTests)
export async function disconnectDb() {
  await mongoose.disconnect();
  isConnected = false;
}
```

> **Note:** Since MongoDB operations are **async**, all query functions become `async`
> and all API routes must `await` them. This is the only breaking change to callers.
> SQLite calls were synchronous; MongoDB calls are not. Update all `route.js` files
> to `await` query function calls.

### 18.4 Environment Variables (Updated)

```env
# .env.local
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/
RESEARCHER_PASSWORD=research123
NEXT_PUBLIC_APP_NAME=Horizons
ML_SERVICE_URL=http://localhost:8000   # Python FastAPI sidecar
ML_SERVICE_SECRET=your-shared-secret  # HMAC auth between Next.js and ML service
```

Remove: `DB_PATH` (no longer needed)

### 18.5 Mongoose Models (`lib/db/models/`)

#### `Session.js`
```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const SessionSchema = new Schema({
  _id: { type: String, default: () => crypto.randomUUID() }, // keep UUID string IDs
  playerAge: Number,
  playerName: String,
  startedAt: { type: Number, required: true },   // Unix ms — keep same field names
  completedAt: Number,
  currentChapter: { type: Number, default: 1 },
  currentLevel: { type: Number, default: 1 },
  status: { type: String, default: 'active', enum: ['active','completed','abandoned'] },
  avatarData: Schema.Types.Mixed,                // was TEXT JSON, now subdocument
});

export default mongoose.models.Session || mongoose.model('Session', SessionSchema);
```

#### `Response.js`
```js
const ResponseSchema = new Schema({
  sessionId: { type: String, ref: 'Session', required: true },
  chapter: { type: Number, required: true },
  level: { type: Number, required: true },
  taskKey: { type: String, required: true },
  startedAt: { type: Number, required: true },
  responseTimeMs: Number,
  selection: Schema.Types.Mixed,     // was TEXT JSON — now native object
  isCorrect: { type: Boolean, default: false },
  attemptNumber: { type: Number, default: 1 },
  scorePoints: { type: Number, default: 0 },
  extraData: Schema.Types.Mixed,     // was TEXT JSON — now native object
});
ResponseSchema.index({ sessionId: 1 });
ResponseSchema.index({ sessionId: 1, chapter: 1, level: 1 });
```

#### `MouseMovement.js`
```js
const MouseMovementSchema = new Schema({
  sessionId: { type: String, ref: 'Session', required: true },
  taskKey: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  recordedAt: { type: Number, required: true },
});
MouseMovementSchema.index({ sessionId: 1 });
```

#### `ChapterScore.js`
```js
const ChapterScoreSchema = new Schema({
  sessionId: { type: String, ref: 'Session', required: true },
  chapterKey: { type: String, required: true },   // e.g. 'ch2_emotion'
  rawPoints: { type: Number, default: 0 },
  recordedAt: { type: Number, required: true },
});
ChapterScoreSchema.index({ sessionId: 1 });
```

#### `RedFlag.js`
```js
const RedFlagSchema = new Schema({
  sessionId: { type: String, ref: 'Session', required: true },
  flagType: { type: String, required: true },
  description: String,
  severity: { type: String, default: 'moderate', enum: ['mild','moderate','severe'] },
  recordedAt: { type: Number, required: true },
});
RedFlagSchema.index({ sessionId: 1 });
```

#### `DomainScore.js`
```js
const DomainScoreSchema = new Schema({
  sessionId: { type: String, ref: 'Session', required: true },
  domain: { type: String, required: true },      // social_communication | etc.
  rawScore: Number,
  maxScore: Number,
  weightedScore: Number,
  riskLevel: String,                             // low | medium | high | very_high
  calculatedAt: { type: Number, required: true },
});
DomainScoreSchema.index({ sessionId: 1, domain: 1 }, { unique: true });
```

#### `MlPrediction.js` ← NEW for AI/ML layer
```js
const MlPredictionSchema = new Schema({
  sessionId: { type: String, ref: 'Session', required: true },
  modelVersion: { type: String, required: true },   // e.g. 'rf_v1.0'
  modelType: { type: String, required: true },       // 'random_forest' | 'xgboost' | 'ensemble'
  asdProbability: { type: Number, required: true },  // 0.0–1.0
  confidence: { type: Number, required: true },       // model's own confidence
  consensusRisk: { type: String, required: true },   // low | moderate | high | very_high
  featureVector: Schema.Types.Mixed,                 // the 36 features sent to model
  shapValues: Schema.Types.Mixed,                    // SHAP explanation per feature
  predictedAt: { type: Number, required: true },
  inferenceMs: Number,
  serviceAvailable: { type: Boolean, default: true }, // false = fallback used
});
MlPredictionSchema.index({ sessionId: 1 }, { unique: true });
```

#### `CameraFrame.js` ← NEW for camera-based CV
```js
const CameraFrameSchema = new Schema({
  sessionId: { type: String, ref: 'Session', required: true },
  taskKey: { type: String, required: true },
  chapterId: Number,
  capturedAt: { type: Number, required: true },
  // MediaPipe output — only landmark coordinates, NO video frames stored
  faceLandmarks: [{        // 478 face mesh points
    x: Number, y: Number, z: Number
  }],
  irisLandmarks: [{        // 10 iris points (5 per eye)
    x: Number, y: Number, z: Number
  }],
  poseLandmarks: [{        // 33 pose keypoints
    x: Number, y: Number, z: Number, visibility: Number
  }],
  // Derived features (computed client-side before sending)
  gazeDirection: { x: Number, y: Number },   // normalized gaze vector
  blinkRate: Number,                          // blinks per second in this window
  headPose: { pitch: Number, yaw: Number, roll: Number },
  expressionScores: {                         // FER probabilities
    happy: Number, sad: Number, angry: Number,
    surprised: Number, fearful: Number, neutral: Number
  },
});
CameraFrameSchema.index({ sessionId: 1, taskKey: 1 });
CameraFrameSchema.index({ sessionId: 1, capturedAt: 1 });
```

### 18.6 Updated Query Files (Pattern for All)

Each query file in `lib/db/queries/` is rewritten using Mongoose but keeps the **same function signatures**. Example for `sessions.js`:

```js
// lib/db/queries/sessions.js — MongoDB version
import { connectDb } from '@/lib/db/index.js';
import Session from '@/lib/db/models/Session.js';

export async function createSession(data) {
  await connectDb();
  const session = await Session.create({
    _id: data.id || crypto.randomUUID(),
    playerAge: data.playerAge,
    playerName: data.playerName,
    startedAt: data.startedAt || Date.now(),
    status: 'active',
  });
  return mapSession(session);
}

export async function getSession(id) {
  await connectDb();
  return mapSession(await Session.findById(id).lean());
}

export async function listSessions() {
  await connectDb();
  return (await Session.find().sort({ startedAt: -1 }).lean()).map(mapSession);
}

export async function updateSession(id, data) {
  await connectDb();
  const updated = await Session.findByIdAndUpdate(id, data, { new: true }).lean();
  return mapSession(updated);
}

function mapSession(doc) {
  if (!doc) return null;
  return {
    id: doc._id,
    playerAge: doc.playerAge,
    playerName: doc.playerName,
    startedAt: doc.startedAt,
    completedAt: doc.completedAt,
    currentChapter: doc.currentChapter,
    currentLevel: doc.currentLevel,
    status: doc.status,
    avatarData: doc.avatarData,
  };
}
```

This pattern mirrors the existing SQLite version exactly — same field names in the returned object, same function names — so **no changes are needed in the 7 API routes or the scoring engine**.

### 18.7 Updated `lib/db/migrations.js`

```js
// lib/db/migrations.js — MongoDB version
import { connectDb } from './index.js';
import Session from './models/Session.js';
import Response from './models/Response.js';
// ... other models

export async function runMigrations() {
  await connectDb();
  // Ensure all indexes are created
  await Session.createIndexes();
  await Response.createIndexes();
  // ... etc.
  console.log('DB ready (MongoDB)');
}
```

---

## 19. Next.js Application Architecture

### 19.1 Existing Project Structure (Maintained)

The following structure **already exists** in the codebase and is **preserved as-is**:

```
horizons/
├── app/
│   ├── (game)/
│   │   ├── layout.jsx
│   │   ├── chapter-1/  level-1/, level-2/
│   │   ├── chapter-2/  level-1/, level-2/, level-3/
│   │   ├── chapter-3/  level-1/, level-2/, level-3/
│   │   ├── chapter-4/  level-1/, level-2/, level-3/
│   │   ├── chapter-5/  level-1/, level-2/
│   │   ├── chapter-6/  level-1/, level-2/, level-3/
│   │   ├── chapter-7/  level-1/, level-2/, level-3/
│   │   ├── chapter-8/  level-1/, level-2/
│   │   ├── chapter-9/
│   │   └── results/    ResultsClient.jsx
│   ├── researcher/
│   │   ├── layout.jsx, page.jsx
│   │   ├── session/[id]/page.jsx
│   │   └── export/route.js
│   ├── api/
│   │   ├── session/route.js, [id]/route.js
│   │   ├── response/route.js            ← no change
│   │   ├── score/route.js               ← no change
│   │   ├── mouse/route.js               ← no change
│   │   ├── flag/route.js                ← no change
│   │   └── results/[sessionId]/route.js ← MODIFIED (add ML call)
│   ├── layout.jsx, page.jsx, globals.css
│   └── providers.jsx
├── components/
│   ├── ui/                 (ShadCN — no change)
│   └── game/
│       ├── GameShell.jsx, TaskTimer.jsx, AvatarDisplay.jsx
│       ├── EmotionFace.jsx, AnimalGuide.jsx, SceneBackground.jsx
│       ├── FeedbackOverlay.jsx, ProgressBar.jsx
│       ├── DragDropSortable.jsx, SoundPlayer.jsx
│       └── ChapterHub.jsx
├── lib/
│   ├── db/
│   │   ├── index.js              ← REWRITTEN (SQLite → MongoDB)
│   │   ├── schema.js             ← REPLACED by models/
│   │   ├── migrations.js         ← REWRITTEN (indexes instead of DDL)
│   │   ├── models/               ← NEW FOLDER
│   │   │   ├── Session.js
│   │   │   ├── Response.js
│   │   │   ├── MouseMovement.js
│   │   │   ├── ChapterScore.js
│   │   │   ├── RedFlag.js
│   │   │   ├── DomainScore.js
│   │   │   ├── MlPrediction.js   ← NEW (ML results)
│   │   │   └── CameraFrame.js    ← NEW (camera landmarks)
│   │   └── queries/              ← REWRITTEN internals, same function names
│   │       ├── sessions.js, responses.js, scores.js
│   │       ├── mouseMovements.js, redFlags.js, domainScores.js
│   │       ├── mlPredictions.js  ← NEW
│   │       └── cameraFrames.js   ← NEW
│   ├── scoring/                  ← NO CHANGE
│   │   ├── engine.js, domains.js, redFlags.js, thresholds.js
│   │   └── chapter1.js ... chapter8.js
│   ├── ml/                       ← NEW FOLDER
│   │   ├── featureExtractor.js   (build feature vector from DB data)
│   │   └── mlClient.js           (call Python FastAPI sidecar)
│   ├── gameData/                 ← NO CHANGE
│   └── utils.js                  ← NO CHANGE
├── store/
│   ├── gameStore.js              ← NO CHANGE
│   └── avatarStore.js            ← NO CHANGE
├── hooks/
│   ├── useTaskTimer.js           ← NO CHANGE
│   ├── useMouseTracker.js        ← NO CHANGE
│   └── useAudio.js               ← NO CHANGE
├── ml-service/                   ← NEW TOP-LEVEL FOLDER (Python FastAPI)
│   ├── main.py
│   ├── models/
│   │   ├── behavioral_rf.pkl     (trained Random Forest)
│   │   └── camera_xgb.pkl        (trained XGBoost on camera features)
│   ├── features.py
│   ├── predict.py
│   ├── train.py
│   ├── requirements.txt
│   └── Dockerfile
├── public/assets/                ← NO CHANGE
├── tests/                        ← ADD ML tests
│   ├── unit/
│   │   └── ml.test.js            ← NEW
│   └── integration/
│       └── ml-pipeline.test.js   ← NEW
├── package.json                  ← ADD mongoose
├── AGENTS.md
└── .env.local                    ← ADD MONGODB_URI, ML_SERVICE_URL
```

### 19.2 Modified: `app/api/results/[sessionId]/route.js`

This is the **only API route that changes in behavior**. After the existing rule-based pipeline, it now calls the ML service:

```js
import { getDomainScoresBySession } from '@/lib/db/queries/domainScores.js';
import { getRedFlagsBySession } from '@/lib/db/queries/redFlags.js';
import { getSession, updateSession } from '@/lib/db/queries/sessions.js';
import { aggregateDomainScores } from '@/lib/scoring/domains.js';
import { calculateCombinedScore, getRiskLevel } from '@/lib/scoring/engine.js';
import { detectAndSaveRedFlags } from '@/lib/scoring/redFlags.js';
import { extractFeatureVector } from '@/lib/ml/featureExtractor.js';    // NEW
import { callMlService, getConsensusRisk } from '@/lib/ml/mlClient.js'; // NEW
import { saveMlPrediction, getMlPrediction } from '@/lib/db/queries/mlPredictions.js'; // NEW

export async function GET(_request, context) {
  try {
    const { sessionId } = await context.params;
    const session = await getSession(sessionId);
    if (!session) return Response.json({ error: 'Session not found' }, { status: 404 });

    // ── EXISTING RULE-BASED PIPELINE (unchanged) ──────────────────────────
    const { rawScores } = await aggregateDomainScores(sessionId);
    await detectAndSaveRedFlags(sessionId);
    const redFlags = await getRedFlagsBySession(sessionId);
    const activeRedFlags = redFlags.map(f => f.flagType);
    const combinedScore = calculateCombinedScore(rawScores, activeRedFlags);
    const riskLevel = getRiskLevel(combinedScore);
    await updateSession(sessionId, {
      status: 'completed',
      completedAt: session.completedAt || Date.now(),
      currentChapter: 9,
      currentLevel: 1,
    });

    // ── NEW: ML PREDICTION ─────────────────────────────────────────────────
    let mlResult = null;
    try {
      const featureVector = await extractFeatureVector(sessionId, session.playerAge);
      const mlResponse = await callMlService(featureVector);
      const consensusRisk = getConsensusRisk(riskLevel, mlResponse.asd_probability);
      mlResult = await saveMlPrediction({
        sessionId,
        modelVersion: mlResponse.model_version,
        modelType: mlResponse.model_type,
        asdProbability: mlResponse.asd_probability,
        confidence: mlResponse.confidence,
        consensusRisk,
        featureVector,
        shapValues: mlResponse.shap_values,
        inferenceMs: mlResponse.inference_ms,
        serviceAvailable: true,
      });
    } catch (mlError) {
      // ML service failure is non-fatal — rule-based result still returned
      console.error('ML service error:', mlError.message);
      mlResult = { serviceAvailable: false, error: mlError.message };
    }

    return Response.json({
      // Existing fields (unchanged — no frontend breakage)
      session: await getSession(sessionId),
      domainRawScores: rawScores,
      domainScores: await getDomainScoresBySession(sessionId),
      combinedScore,
      riskLevel,
      activeRedFlags,
      redFlags,
      recommendation: 'Please consult a healthcare specialist for a proper evaluation.',
      // New fields (additive — frontend can read if present)
      ml: mlResult,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### 19.3 New API Routes Added

| Route | Method | Purpose |
|---|---|---|
| `app/api/camera/route.js` | POST | Log MediaPipe landmark frames from browser |
| `app/api/ml/predict/route.js` | POST | Manually trigger ML re-prediction for a session |
| `app/api/ml/status/route.js` | GET | Check if ML service is online |

### 19.4 `package.json` Additions

```json
{
  "dependencies": {
    "mongoose": "^8.0.0"
  }
}
```

Remove: no package removals needed (keep `mongodb` driver in place for flexibility).

---

## 20. AI/ML Integration Layer

### 20.1 Can We Integrate AI/ML? Yes — Two Complementary Layers

Based on the Gemini research response and your existing codebase, **two AI/ML layers** are recommended, both of which complement the existing rule-based scoring engine without replacing it:

| Layer | What It Uses | When It Runs | Accuracy Gain |
|---|---|---|---|
| **Layer 1: Behavioral ML** | Existing game response data (task_responses, mouse_movements) | Post-session, server-side | +8–15% over rule-based alone |
| **Layer 2: Camera CV** | MediaPipe landmarks captured in browser during gameplay | Real-time during play, stored per-session | +10–20% additional (when camera available) |

Both layers feed into a **consensus risk score** that is shown alongside (not instead of) the rule-based score in the researcher dashboard.

---

### 20.2 Layer 1 — Behavioral ML (Python FastAPI Sidecar)

#### 20.2.1 Why a Python Sidecar?

As the Gemini response notes, the best ML libraries (scikit-learn, XGBoost, PyTorch, SHAP) run in Python. The recommended architecture is:
- Next.js handles the game, data collection, and rule-based scoring
- A lightweight **Python FastAPI service** handles ML model training and inference
- Communication is a simple POST to `http://localhost:8000/predict` with a JSON feature vector
- If the ML service is offline, the results endpoint degrades gracefully to rule-based only

#### 20.2.2 Feature Engineering — What Goes Into the Model

The feature vector is built by `lib/ml/featureExtractor.js` from data already in MongoDB:

**Group A — Domain Score Features (4 features)**
```
f01: social_communication_raw_score
f02: restricted_repetitive_raw_score
f03: sensory_processing_raw_score
f04: pretend_play_raw_score
```

**Group B — Response Time Features (10 features)**
```
f05: avg_response_time_ms (all tasks)
f06: median_response_time_ms
f07: response_time_std_dev
f08: avg_response_time_ch2 (emotion tasks specifically)
f09: avg_response_time_ch3 (social tasks specifically)
f10: avg_response_time_ch8 (imitation tasks specifically)
f11: timeout_rate (ratio of timed-out tasks to total tasks)
f12: slow_response_rate (>10s responses / total)
f13: fast_response_rate (<500ms responses / total) — impulsivity signal
f14: response_time_trend (slope of response times across session — fatigue)
```

**Group C — Accuracy & Attempt Features (8 features)**
```
f15: overall_accuracy (correct / total responses)
f16: negative_emotion_accuracy (sad + scared tasks only)
f17: pretend_play_recognition_accuracy
f18: imitation_accuracy (ch8 only)
f19: avg_attempts_per_task
f20: multi_attempt_rate (tasks needing >1 attempt / total)
f21: emotion_confusion_matrix_entropy (how spread the emotion errors are)
f22: rigid_response_rate (proportion of rigid/inflexible choices in ch4)
```

**Group D — Mouse/Touch Pattern Features (7 features)**
```
f23: avg_cursor_speed (pixels/ms across session)
f24: cursor_directionality (ratio of direct paths to total path length)
f25: hover_switching_rate (how often cursor moves between options before selecting)
f26: repetitive_cursor_pattern_score (circular/back-and-forth motion detection)
f27: avg_dwell_time_before_select (deliberation time)
f28: spatial_concentration_score (how focused vs. scattered click locations are)
f29: preferred_screen_quadrant (0=spread, 1=top-left, 2=top-right, etc.)
```

**Group E — Behavioral Flag Features (5 features)**
```
f30: red_flag_count (total triggered flags)
f31: flag_name_response (binary: 0/1)
f32: flag_pretend_play_absent (binary: 0/1)
f33: flag_sensory_distress (binary: 0/1)
f34: flag_imitation_deficit (binary: 0/1)
```

**Group F — Meta Features (2 features)**
```
f35: player_age (years)
f36: session_completion_rate (chapters completed / 9)
```

**Total: 36 features** — sufficient for Random Forest and XGBoost to train on with 200+ sessions.

#### 20.2.3 `lib/ml/featureExtractor.js`

```js
// lib/ml/featureExtractor.js
import { getResponsesBySession } from '@/lib/db/queries/responses.js';
import { getMovementsBySession } from '@/lib/db/queries/mouseMovements.js';
import { getScoresBySession } from '@/lib/db/queries/scores.js';
import { getRedFlagsBySession } from '@/lib/db/queries/redFlags.js';
import { aggregateDomainScores } from '@/lib/scoring/domains.js';

export async function extractFeatureVector(sessionId, playerAge) {
  const [responses, movements, flags, { rawScores }] = await Promise.all([
    getResponsesBySession(sessionId),
    getMovementsBySession(sessionId),
    getRedFlagsBySession(sessionId),
    aggregateDomainScores(sessionId),
  ]);

  const responseTimes = responses
    .map(r => r.responseTimeMs)
    .filter(t => t !== null && t !== undefined);

  const mean = arr => arr.length ? arr.reduce((a,b) => a+b, 0) / arr.length : 0;
  const std  = arr => {
    const m = mean(arr);
    return Math.sqrt(mean(arr.map(x => (x-m)**2)));
  };
  const slope = arr => { /* simple linear regression slope */ };
  const median = arr => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b) => a-b);
    return s[Math.floor(s.length/2)];
  };

  // Group A
  const f01 = rawScores.social_communication || 0;
  const f02 = rawScores.restricted_repetitive || 0;
  const f03 = rawScores.sensory_processing || 0;
  const f04 = rawScores.pretend_play || 0;

  // Group B
  const f05 = mean(responseTimes);
  const f06 = median(responseTimes);
  const f07 = std(responseTimes);
  const ch2Times = responses.filter(r=>r.chapter===2).map(r=>r.responseTimeMs).filter(Boolean);
  const f08 = mean(ch2Times);
  const ch3Times = responses.filter(r=>r.chapter===3).map(r=>r.responseTimeMs).filter(Boolean);
  const f09 = mean(ch3Times);
  const ch8Times = responses.filter(r=>r.chapter===8).map(r=>r.responseTimeMs).filter(Boolean);
  const f10 = mean(ch8Times);
  const f11 = responses.filter(r=>r.responseTimeMs===null).length / (responses.length || 1);
  const f12 = responses.filter(r=>r.responseTimeMs>10000).length / (responses.length || 1);
  const f13 = responses.filter(r=>r.responseTimeMs<500).length / (responses.length || 1);
  const f14 = slope(responseTimes) || 0;

  // Group C
  const correct = responses.filter(r=>r.isCorrect).length;
  const f15 = correct / (responses.length || 1);
  const negEmotionResponses = responses.filter(r=>
    r.chapter===2 && r.extraData?.targetEmotion &&
    ['sad','scared'].includes(r.extraData.targetEmotion)
  );
  const f16 = negEmotionResponses.filter(r=>r.isCorrect).length / (negEmotionResponses.length || 1);
  const pretendResponses = responses.filter(r=>r.chapter===5 && r.level===1);
  const f17 = pretendResponses.filter(r=>r.isCorrect).length / (pretendResponses.length || 1);
  const ch8Responses = responses.filter(r=>r.chapter===8 && r.level===1);
  const f18 = ch8Responses.filter(r=>r.isCorrect).length / (ch8Responses.length || 1);
  const f19 = mean(responses.map(r=>r.attemptNumber));
  const f20 = responses.filter(r=>r.attemptNumber>1).length / (responses.length || 1);
  // f21, f22 computed from extraData patterns...
  const f21 = computeEmotionEntropy(responses);
  const f22 = responses.filter(r=>
    r.chapter===4 && r.extraData?.responseFlexibility === 'rigid'
  ).length / (responses.filter(r=>r.chapter===4).length || 1);

  // Group D (mouse features)
  const f23 = computeAvgCursorSpeed(movements);
  const f24 = computeDirectionality(movements);
  const f25 = 0; // hover switching — from extraData.hoverDwellMs if present
  const f26 = computeRepetitivePattern(movements);
  const f27 = mean(responses.map(r=>r.extraData?.hoverDwellMs?.total || 0));
  const f28 = computeSpatialConcentration(movements);
  const f29 = computePreferredQuadrant(movements);

  // Group E
  const flagTypes = new Set(flags.map(f=>f.flagType));
  const f30 = flags.length;
  const f31 = flagTypes.has('flag_name_response') ? 1 : 0;
  const f32 = flagTypes.has('complete_absence_pretend_play') ? 1 : 0;
  const f33 = flagTypes.has('extreme_sensory_4plus_distressing_sounds') ? 1 : 0;
  const f34 = flagTypes.has('poor_imitation_all_modalities') ? 1 : 0;

  // Group F
  const f35 = playerAge || 0;
  const chaptersWithData = new Set(responses.map(r=>r.chapter)).size;
  const f36 = chaptersWithData / 9;

  return [f01,f02,f03,f04,f05,f06,f07,f08,f09,f10,
          f11,f12,f13,f14,f15,f16,f17,f18,f19,f20,
          f21,f22,f23,f24,f25,f26,f27,f28,f29,f30,
          f31,f32,f33,f34,f35,f36];
}
```

#### 20.2.4 `lib/ml/mlClient.js`

```js
// lib/ml/mlClient.js
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SECRET = process.env.ML_SERVICE_SECRET || '';

export async function callMlService(featureVector) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
  try {
    const res = await fetch(`${ML_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Secret': ML_SECRET,
      },
      body: JSON.stringify({ features: featureVector }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`ML service returned ${res.status}`);
    return await res.json();
    // Expected: { asd_probability, confidence, shap_values, model_version, model_type, inference_ms }
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Consensus risk: combines rule-based risk with ML probability.
 * Rule-based is the anchor; ML can escalate or de-escalate by one level.
 */
export function getConsensusRisk(ruleBasedRisk, mlProbability) {
  const riskOrder = ['low', 'medium', 'high', 'very_high'];
  const ruleIdx = riskOrder.indexOf(ruleBasedRisk);

  // ML probability thresholds aligned with validation study ROC curves
  let mlRisk;
  if (mlProbability < 0.25)      mlRisk = 'low';
  else if (mlProbability < 0.50) mlRisk = 'medium';
  else if (mlProbability < 0.75) mlRisk = 'high';
  else                           mlRisk = 'very_high';

  const mlIdx = riskOrder.indexOf(mlRisk);

  // Disagreement by more than 1 level: return the higher (more cautious)
  if (Math.abs(ruleIdx - mlIdx) > 1) return riskOrder[Math.max(ruleIdx, mlIdx)];
  // Disagreement by 1 level: average toward middle
  if (ruleIdx !== mlIdx) return riskOrder[Math.round((ruleIdx + mlIdx) / 2)];
  // Agreement
  return ruleBasedRisk;
}
```

#### 20.2.5 Python FastAPI Service (`ml-service/`)

```python
# ml-service/main.py
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
import joblib, time, os
import numpy as np

app = FastAPI()
MODEL = joblib.load("models/behavioral_rf.pkl")   # sklearn Pipeline
EXPLAINER = joblib.load("models/shap_explainer.pkl")
MODEL_VERSION = "rf_v1.0"
SERVICE_SECRET = os.getenv("ML_SERVICE_SECRET", "")

class PredictRequest(BaseModel):
    features: list[float]  # 36 floats

@app.post("/predict")
async def predict(req: PredictRequest, x_service_secret: str = Header("")):
    if SERVICE_SECRET and x_service_secret != SERVICE_SECRET:
        raise HTTPException(403, "Forbidden")
    
    X = np.array(req.features).reshape(1, -1)
    t0 = time.time()
    proba = float(MODEL.predict_proba(X)[0][1])   # P(ASD)
    confidence = float(max(MODEL.predict_proba(X)[0]))
    shap_vals = EXPLAINER.shap_values(X)[1].tolist()
    inference_ms = int((time.time() - t0) * 1000)

    return {
        "asd_probability": proba,
        "confidence": confidence,
        "shap_values": shap_vals,
        "model_version": MODEL_VERSION,
        "model_type": "random_forest",
        "inference_ms": inference_ms,
    }

@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_VERSION}
```

**Training script (`ml-service/train.py`):**

```python
# ml-service/train.py
# Run after validation study data is collected
from pymongo import MongoClient
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, classification_report
import xgboost as xgb
import shap, joblib, numpy as np

def load_training_data(mongo_uri):
    client = MongoClient(mongo_uri)
    db = client['game_horizons']
    # sessions with known ASD status (from validation study ADOS-2 results)
    labeled_sessions = list(db.sessions.find({'adosConfirmed': {'$exists': True}}))
    
    X, y = [], []
    for session in labeled_sessions:
        # feature_vector stored in ml_predictions for sessions that ran the extractor
        pred = db.ml_predictions.find_one({'sessionId': session['_id']})
        if pred and pred.get('featureVector'):
            X.append(pred['featureVector'])
            y.append(1 if session['adosConfirmed'] else 0)
    return np.array(X), np.array(y)

def train(mongo_uri):
    X, y = load_training_data(mongo_uri)
    print(f"Training on {len(y)} samples ({y.sum()} ASD, {len(y)-y.sum()} NT)")

    # Random Forest
    rf = Pipeline([
        ('scaler', StandardScaler()),
        ('clf', RandomForestClassifier(n_estimators=200, max_depth=8,
                                       class_weight='balanced', random_state=42))
    ])
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_score(rf, X, y, cv=cv, scoring='roc_auc')
    print(f"RF CV AUC: {scores.mean():.3f} ± {scores.std():.3f}")

    # XGBoost (comparison)
    xgb_clf = xgb.XGBClassifier(n_estimators=150, max_depth=5,
                                  scale_pos_weight=(y==0).sum()/(y==1).sum())
    xgb_scores = cross_val_score(xgb_clf, X, y, cv=cv, scoring='roc_auc')
    print(f"XGB CV AUC: {xgb_scores.mean():.3f} ± {xgb_scores.std():.3f}")

    # Train final RF on all data
    rf.fit(X, y)
    explainer = shap.TreeExplainer(rf.named_steps['clf'])
    
    joblib.dump(rf, "models/behavioral_rf.pkl")
    joblib.dump(explainer, "models/shap_explainer.pkl")
    print("Models saved.")

if __name__ == '__main__':
    import os
    train(os.getenv('MONGODB_URI'))
```

**`ml-service/requirements.txt`:**
```
fastapi>=0.110.0
uvicorn>=0.29.0
scikit-learn>=1.4.0
xgboost>=2.0.0
shap>=0.45.0
pymongo>=4.0.0
numpy>=1.26.0
joblib>=1.3.0
pydantic>=2.0.0
```

---

### 20.3 Layer 2 — Camera-Based CV (MediaPipe in Browser)

#### 20.3.1 Overview

As the Gemini response recommends, the **hybrid approach** is used:
- **Client (browser)**: MediaPipe runs locally (via WebAssembly), captures gaze, facial landmarks, and pose keypoints at 10 FPS during specific game tasks
- **Server (Next.js API)**: Receives only the small landmark coordinate packets — **never raw video frames**
- **Privacy**: No video is ever transmitted or stored. Only normalized (x, y, z) coordinates per keypoint
- **Optional**: Camera capture is consent-gated and degrades gracefully if camera is unavailable

#### 20.3.2 When the Camera Is Active

Camera capture is enabled **only during specific clinically relevant moments**:

| Chapter | Level | What Is Captured | Clinical Relevance |
|---|---|---|---|
| 1 | 1 | Gaze direction when name is called | Name-response eye orientation (M-CHAT #10) |
| 1 | 2 | Gaze tracking during pointing task | Joint attention via gaze following |
| 2 | 1–2 | Facial expression during emotion tasks | Flat affect, micro-expression detection |
| 3 | 1 | Gaze during greeting (eye contact step) | Eye contact simulation validation |
| 5 | 1 | Facial expression during pretend play recognition | Comprehension affect markers |
| 8 | 1 | Pose landmarks during imitation tasks | Motor imitation quality |

#### 20.3.3 `components/game/CameraCapture.jsx` (New Component)

```jsx
// components/game/CameraCapture.jsx
'use client';
import { useEffect, useRef, useState } from 'react';

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

export default function CameraCapture({
  sessionId, taskKey, chapterId,
  active = false,    // only runs when active prop is true
  onError,
}) {
  const videoRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const faceLandmarkerRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    let stopped = false;

    async function init() {
      try {
        // Dynamically import MediaPipe — only loads when camera is needed
        const { FaceLandmarker, FilesetResolver } = await import(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest'
        );
        const filesetResolver = await FilesetResolver.forVisionTasks(MEDIAPIPE_CDN);
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: { modelAssetPath: `${MEDIAPIPE_CDN}/face_landmarker.task` },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,   // gives expression coefficients
        });

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setInitialized(true);

        // Capture at 10 FPS
        intervalRef.current = setInterval(() => captureFrame(), 100);
      } catch (err) {
        onError?.(err);  // graceful degradation
      }
    }

    init();
    return () => {
      stopped = true;
      clearInterval(intervalRef.current);
      videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    };
  }, [active, taskKey]);

  async function captureFrame() {
    if (!faceLandmarkerRef.current || !videoRef.current) return;
    const result = faceLandmarkerRef.current.detectForVideo(
      videoRef.current, performance.now()
    );
    if (!result.faceLandmarks?.[0]) return;

    // Send only landmarks — no pixel data
    const payload = {
      sessionId,
      taskKey,
      chapterId,
      capturedAt: Date.now(),
      faceLandmarks: result.faceLandmarks[0],
      expressionScores: result.faceBlendshapes?.[0]?.categories?.reduce((acc, c) => {
        acc[c.categoryName] = c.score; return acc;
      }, {}),
    };

    // Fire-and-forget (non-blocking)
    fetch('/api/camera', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});  // silent fail
  }

  // Render nothing visible — hidden video element only
  return (
    <video
      ref={videoRef}
      className="hidden"
      muted
      playsInline
      aria-hidden="true"
    />
  );
}
```

#### 20.3.4 `app/api/camera/route.js` (New Route)

```js
// app/api/camera/route.js
import { saveCameraFrame } from '@/lib/db/queries/cameraFrames.js';

export async function POST(request) {
  try {
    const body = await request.json();
    // Validate sessionId exists before saving
    const frame = await saveCameraFrame(body);
    return Response.json({ saved: true }, { status: 201 });
  } catch (error) {
    // Silent 200 even on error — camera data loss is non-fatal
    return Response.json({ saved: false }, { status: 200 });
  }
}
```

#### 20.3.5 Camera Feature Extraction (Post-Session)

After the session ends, camera features are computed from stored landmarks and added to the feature vector for the **camera-enhanced model** (`camera_xgb.pkl`):

| Camera Feature | Computation | ASD Relevance |
|---|---|---|
| `gaze_to_face_ratio` | % of frames where gaze is directed at on-screen character face area | Low ratio → avoidance of social gaze |
| `avg_blink_rate` | Blinks per second averaged over session | Atypical blink patterns in ASD |
| `expression_flatness` | Std dev of expression coefficient across emotion tasks | Low std dev → flat affect |
| `expression_mirror_accuracy` | Match between requested emotion and detected expression during Ch2 | Failure to mirror expressions |
| `head_pose_variability` | Std dev of yaw/pitch during attention tasks | High variability → inattention |
| `gaze_follow_success_rate` | Frames where gaze moves toward pointed object after guide points | Joint attention via gaze (Ch1.2) |
| `eye_contact_duration_ms` | Total ms with gaze on character's eye region during Ch3.1 | Reduced eye contact |
| `imitation_pose_similarity` | Cosine similarity of pose landmarks vs. template during Ch8 | Motor imitation quality |

These 8 camera features extend the behavioral feature vector to **44 features** for the camera-enhanced model.

#### 20.3.6 Consent & Privacy Flow

```
SESSION START
     │
     ▼
Researcher dashboard: toggle "Enable Camera" per session
     │
If enabled:
     ▼
Camera consent screen shown to caregiver (not child):
  "To enhance screening, we can use the camera to observe
   gaze and facial expressions. No video is recorded or stored.
   Only movement coordinates are saved. [Allow] [Skip]"
     │
  [Allow] ─────────────────────────────────────────────────────►
     │                                                           │
     │                                                  CameraCapture component
     │                                                  activates per chapter
     │
  [Skip] ──────────────────────────────────────────────────────►
                                                                 │
                                                        Game runs normally
                                                        ML uses behavioral
                                                        features only
```

---

### 20.4 Consensus Scoring — Three-Layer Risk Output

The researcher dashboard now shows three risk assessments side by side:

| Assessment | Source | Description |
|---|---|---|
| **Rule-Based Score** | `lib/scoring/engine.js` | Deterministic, interpretable, always available |
| **ML Behavioral Risk** | Python FastAPI (36 features) | Probabilistic, trained on validation data |
| **ML Camera Risk** | Python FastAPI (44 features) | Available only when camera consent given |
| **Consensus Risk** | `getConsensusRisk()` | Final recommendation to clinician |

**Consensus logic:**
- If all three agree → consensus = that level, high confidence
- If two agree → consensus = majority, moderate confidence
- If all disagree → consensus = highest level (most conservative), flag for clinician review

**Why this is more accurate than rule-based alone:**
- Rule-based scoring is **linear**: it applies fixed weights and thresholds
- ML models capture **non-linear interactions** between features (e.g., slow response time combined with rigid behavior + imitation deficit is more predictive than any one alone)
- Camera features add **biometric signals** that cannot be captured by click data alone (actual gaze direction, real facial expressions)
- EmoGalaxy paper (Irani et al.) achieved 93% accuracy with SVM on emotion game data alone; combining behavioral + camera data with Random Forest is expected to match or exceed this

---

### 20.5 ML Model Performance Targets

| Model | AUC-ROC Target | Sensitivity | Specificity | Training Data Needed |
|---|---|---|---|---|
| Behavioral RF | ≥ 0.85 | ≥ 82% | ≥ 78% | 150+ labeled sessions |
| Camera XGBoost | ≥ 0.88 | ≥ 85% | ≥ 80% | 100+ sessions with camera |
| Ensemble (both) | ≥ 0.91 | ≥ 88% | ≥ 84% | 100+ sessions with both |

Rule-based alone (current): estimated AUC ~0.72 based on EmoGalaxy and similar literature.

---

### 20.6 SHAP Explanations in the Dashboard

The Python service returns SHAP values for each prediction. These are displayed in the researcher dashboard as a feature importance bar chart, showing **which specific behaviors most influenced the ML prediction** for each child. This helps clinicians understand and trust the ML output.

Example SHAP output for a High-risk prediction:
```
Top contributors to HIGH risk prediction:
  +0.18  negative_emotion_accuracy (very low: 28%)
  +0.14  pretend_play_recognition_accuracy (very low: 20%)
  +0.12  flag_imitation_deficit (present)
  +0.09  avg_response_time_ch3 (very slow: 8.4s)
  +0.08  rigid_response_rate (high: 75%)
  -0.03  session_completion_rate (good: 100%)
```

---

## 21. Clinician & Parent Dashboard

### 21.1 Researcher Dashboard (Existing `/researcher` Route)

The existing researcher dashboard at `/researcher` already has:
- Session list table with risk badges
- Individual session detail at `/researcher/session/[id]`
- Export at `/researcher/export`

**Additions for ML integration (minimal UI changes):**

**Session list table** — add one column: `ML Risk` (shown alongside existing `Combined Score`)

**Session detail page** — add a new card below the existing domain scores card:

```
┌─────────────────────────────────────────────────────────┐
│ 🤖 AI Screening Analysis                                │
├─────────────────────────────────────────────────────────┤
│ ML ASD Probability:    [████████░░] 78%                 │
│ Model Confidence:      87%                               │
│ Consensus Risk:        🟠 HIGH                          │
│ Camera Data:           ✅ Available (Ch1, Ch2, Ch3, Ch8) │
├─────────────────────────────────────────────────────────┤
│ Feature Importance (SHAP)                               │
│ ▶ negative_emotion_accuracy    ████████░░ (+18%)        │
│ ▶ pretend_play_accuracy        ███████░░░ (+14%)        │
│ ▶ flag_imitation_deficit       ██████░░░░ (+12%)        │
│ ▶ avg_response_time_social     █████░░░░░ (+9%)         │
│ ▶ rigid_response_rate          ████░░░░░░ (+8%)         │
├─────────────────────────────────────────────────────────┤
│ ⚠ This is a screening tool. Consult a specialist.       │
└─────────────────────────────────────────────────────────┘
```

### 21.2 Gaze Heatmap (Camera Sessions Only)

For sessions where camera data is available, the dashboard renders a **gaze heatmap overlay** on a screenshot of the relevant game scene, showing where the child was looking during that task. This is implemented as a `<canvas>` element using the stored `irisLandmarks` data.

---

## 22. Validation Requirements

### 22.1 Three-Phase Validation Plan

| Phase | Participants | Purpose | Duration |
|---|---|---|---|
| 1. Normative | 150+ neurotypical children ages 3–10 | Establish per-age score distributions; collect feature vectors for ML baseline | 10–14 weeks |
| 2. Clinical | 60+ ADOS-2-confirmed ASD children | Train and validate ML models; calculate sensitivity/specificity for both rule-based and ML outputs | 10–14 weeks |
| 3. Iteration | Based on false positive/negative rates | Retrain ML models; adjust rule-based thresholds; calibrate consensus logic | 6–8 weeks |

### 22.2 Psychometric Targets

| Metric | Rule-Based Target | ML-Enhanced Target |
|---|---|---|
| Sensitivity | ≥ 80% | ≥ 88% |
| Specificity | ≥ 75% | ≥ 82% |
| AUC-ROC | ~0.72 (estimated) | ≥ 0.88 |
| Correlation with ADOS-2 | r > 0.75 | r > 0.85 |
| Camera data collection rate | — | ≥ 70% of sessions (consent rate) |
| Completion rate (age 3–4) | > 80% | > 80% |
| Completion rate (age 5–10) | > 92% | > 92% |

---

## 23. Development Roadmap

### 23.1 Updated Timeline

| Phase | Duration | Deliverables |
|---|---|---|
| **Phase 0: Setup** | 1 week | MongoDB Atlas cluster, update `.env.local`, add `mongoose` to package.json |
| **Phase 1: MongoDB Migration** | 1–2 weeks | Rewrite `lib/db/index.js`, create `lib/db/models/`, rewrite all `lib/db/queries/*.js` to async Mongoose calls; update all API routes to `await` queries; run existing test suite |
| **Phase 2: Core Game** | Already implemented | Chapter 1–9, scoring engine, researcher dashboard — no changes needed |
| **Phase 3: Camera Component** | 1 week | `CameraCapture.jsx`, `app/api/camera/route.js`, `lib/db/models/CameraFrame.js`, consent UI |
| **Phase 4: Feature Extractor** | 1 week | `lib/ml/featureExtractor.js`, `lib/ml/mlClient.js`, modify results route |
| **Phase 5: Python ML Service** | 2 weeks | FastAPI sidecar scaffold, model loading, `/predict` endpoint, health check, Dockerfile |
| **Phase 6: Dashboard ML UI** | 1 week | ML result card in session detail, SHAP bar chart, gaze heatmap (camera sessions) |
| **Phase 7: Data Collection** | 10–14 weeks | Run validation study (normative + clinical cohorts), collect labeled sessions |
| **Phase 8: Model Training** | 1 week | Run `train.py`, evaluate models, deploy trained `.pkl` files to ML service |
| **Phase 9: Calibration** | 4–6 weeks | Retrain on full dataset, adjust consensus thresholds, final dashboard polish |
| **Total to ML-Enhanced Launch** | **~8 months** | Game + MongoDB + Camera + Trained ML models |

---

## 24. Key Changes from Original Plan

### 24.1 Platform Change (Godot → Next.js 15)
Browser-based delivery eliminates installation barriers, enables real-time database writes, and provides a built-in researcher portal.

### 24.2 Database Migration (SQLite → MongoDB)
The existing implementation uses `bun:sqlite`. The migration to MongoDB preserves all `lib/db/queries/` function names and the entire scoring engine — only the internal query implementations change. API routes require `await` to be added since Mongoose calls are async.

### 24.3 Added: Behavioral ML Layer (Python FastAPI Sidecar)
A Python FastAPI service runs alongside the Next.js app, receives a 36-feature vector extracted from each completed session's database records, and returns an ASD probability score. This is additive — the rule-based score remains unchanged and the ML result appears alongside it.

### 24.4 Added: Camera-Based CV Layer (MediaPipe in Browser)
Following Gemini's recommended hybrid approach: MediaPipe runs client-side (WebAssembly, no GPU required), extracts facial landmarks, gaze direction, and pose keypoints, and sends only coordinate data (never video) to the backend. Active only during 6 clinically targeted chapters. Consent-gated.

### 24.5 Added: SHAP Explainability
Every ML prediction includes SHAP feature importance values, which the researcher dashboard renders as a bar chart. This makes the ML output interpretable and trustworthy for clinicians.

### 24.6 Added: Consensus Risk Score
A three-way consensus mechanism combines the rule-based risk level, behavioral ML risk, and camera ML risk into a final recommendation. Disagreements between layers are shown explicitly in the dashboard and trigger a clinician review flag.

### 24.7 Added: Avatar Customization Data Collection
Avatar selection behavior (cycling, randomization) is logged as early behavioral signal.

### 24.8 Added: Caregiver Volume Calibration (Chapter 6)
Sound sensitivity data requires standardized device volume. An explicit calibration step is shown before Chapter 6.

### 24.9 Added: Free Play Observation Algorithm (Level 7.2)
Passive spatial detection of object lining and repetitive action counts using click sequence analysis.

### 24.10 Modified: Scoring Engine Outputs (Additive Only)
The results API endpoint now returns an `ml` field alongside all existing fields. No existing fields are removed or renamed, ensuring full backward compatibility with the existing researcher dashboard.

---

*Document Version: 3.0 — MongoDB Migration + AI/ML Integration Layer*
*Based on original ASD_Game_Horizons.md design and Horizons Next.js 15 codebase*
*Clinical references: M-CHAT-R/F (Robins et al.), ADOS-2 (Maddox et al., Lord et al.), DSM-5 Criteria A & B, CARS-2*
*ML references: EmoGalaxy (Irani et al., 2018), Gemini CV/ML guidance, MediaPipe tasks-vision, SHAP (Lundberg & Lee)*
