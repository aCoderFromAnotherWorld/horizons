# Horizons System Requirements Specification

## 1. Problem Statement

Horizons is a serious-game screening aid for autism spectrum disorder (ASD) indicators in children aged 3-10. Traditional screening can be difficult to administer consistently in playful settings, especially when researchers need timing, attempt, and behavioral data. Horizons collects structured gameplay observations across response to name, emotion recognition, social communication, executive flexibility, pretend play, sensory processing, restricted/repetitive behaviors, imitation, and summary review tasks.

Horizons is not diagnostic. It produces screening indicators that must be interpreted with developmental history and a qualified healthcare specialist's evaluation.

## 2. Research Justification

- Maddox et al. (2017), ADOS-2: supports separating Social Communication from Restricted/Repetitive Behaviors and treating RRB evidence as a key differentiator.
- Khowaja and Salim (2018), serious game for children with autism: supports Discrete Trial Training measurements, including correct responses and attempts.
- Irani et al. (2018), EmoGalaxy: supports emotion recognition as a high-signal screening task and uses `correct answers / total moves` as a game score.

The scoring model is penalty-based: lower raw scores indicate fewer observed concerns.

## 3. Scope

In scope:

- Child game flow from onboarding through Chapters 1-9.
- Anonymous session creation with optional first name and required age.
- SQLite persistence for sessions, responses, scores, mouse movement batches, red flags, and domain scores.
- Researcher dashboard with password-gated access, session review, charts, heatmap, and JSON/CSV export.
- Automated tests for database queries, scoring, API routes, assets, chapter logic, and scoring pipeline.
- Accessibility baseline: large touch targets, aria labels for icon-only controls, non-color indicators, reduced-motion support, and media fallbacks.

Out of scope:

- Clinical diagnosis.
- Durable identity records.
- Remote accounts or cloud synchronization.
- Medical-device certification.

## 4. Functional Requirements

### FR-1 Main Menu and Onboarding

- Show Play and Researcher Dashboard actions.
- Collect optional first name and required age.
- Create an anonymous session before gameplay.
- Restore active session state from local storage when available.

### FR-2 Chapter 1: Welcome to My World

- Support avatar customization.
- Store avatar selections in `sessions.avatar_data`.
- Run three response-to-name trials.
- Record response time and score each trial.
- Run five guide-following joint-attention trials.

### FR-3 Chapter 2: Emotion Island

- Run emotion matching with face and scenario cards.
- Compute EmoGalaxy-style accuracy as `correct_drops / total_moves`.
- Track sad/fear negative emotion accuracy and sad/fear confusion.
- Run expression and regulation tasks.

### FR-4 Chapter 3: Friend's House Visit

- Run greeting, conversation turn-taking, and sharing/joint-attention tasks.
- Score social, factual, literal, off-topic, timeout, and sharing responses.
- Record response time and metadata for each trial.

### FR-5 Chapter 4: Daily Routines Village

- Run routine sequencing with shuffled cards and a sortable target list.
- Track sequence errors and attempt count.
- Run disruption, activity-selection, and unexpected-event flexibility tasks.

### FR-6 Chapter 5: Pretend Play Theater

- Run pretend-play recognition trials.
- Flag complete absence of pretend play when all recognition trials are literal.
- Run symbolic object-selection prompts.
- Treat empty manual submission as refusal/no engagement.

### FR-7 Chapter 6: Sensory Garden

- Play sound stimuli and prevent rating before stimulus presentation.
- Include happy, neutral, worried, upset, cover-ears, and leave response paths.
- Track visual room visits, quick exits, texture ratings, and aversive patterns.

### FR-8 Chapter 7: Pattern Detective

- Run AB, ABC, and complex AABBC pattern completion.
- Introduce a forced wrong-piece disruption.
- Detect distress plus return-to-pattern for `rigid_pattern_plus_distress_at_change`.
- Analyze free-play repetition, lining-up behavior, disruption distress, and special-interest intensity.

### FR-9 Chapter 8: Copy Cat Challenge

- Run simple imitation across facial, body, and object categories.
- Flag poor imitation across modalities at threshold.
- Run sequential imitation and score step errors, perseveration, and three-action failure.

### FR-10 Chapter 9: Assessment Summary

- Sample 20 review tasks, weighted toward chapters with higher concern scores.
- Run the full scoring pipeline after review.
- Redirect to results.

### FR-11 Results

- Show a child-friendly completion page.
- Show parent/researcher domain breakdown below the child-facing summary.
- Always show: "Please consult a healthcare specialist for a proper evaluation."
- Link to the researcher session report.

### FR-12 Researcher Dashboard

- Password-gate access using `RESEARCHER_PASSWORD`.
- Store researcher auth in `sessionStorage`, not the database.
- List sessions with date, name, age, status, combined score, risk level, and actions.
- Show detail charts, red flags, response timing, mouse heatmap, and exports.
- Export JSON and CSV.

## 5. Non-Functional Requirements

Performance:

- Support 1280x768 minimum and responsive layouts.
- Keep touch interactions immediate.
- Buffer mouse movement and flush in batches.
- Preload audio stimuli where needed.

Usability:

- Use direct, low-pressure, child-friendly interactions.
- Keep interactive controls at least 60x60px.
- Use soft timers.
- Degrade missing media with placeholders.

Accessibility:

- Icon-only buttons include `aria-label`.
- Color is not the only state indicator.
- Reduced-motion preference is respected.
- Canvas visualizations include accessible labels.

Privacy:

- Sessions use anonymous IDs.
- First name is optional.
- Researcher auth is browser-session only.
- Export files should be handled as sensitive research data.

Reliability:

- API routes catch errors and return JSON `{ error }`.
- SQLite uses foreign keys, cascading deletes, WAL mode, and busy timeout.
- Test coverage exceeds 80% for `lib/scoring/` and `lib/db/queries/`.

## 6. Feasibility Analysis

Horizons is feasible with the selected stack because the app is local-first, data volume is modest, and scoring is deterministic. Bun provides fast tests and native SQLite, Next.js handles route organization and production builds, and React supports the game mechanics required for drag/drop, animation, audio, and timed tasks.

The primary risk is interpretation. Results may be mistaken for diagnosis, so the interface and documentation consistently frame Horizons as a screening aid and direct caregivers to qualified specialists.

## 7. Acceptance Criteria

- `bun test --coverage` passes with target critical-module coverage.
- `bun test` passes with no failures.
- `bun run build` succeeds.
- Researcher dashboard can list, inspect, and export sessions.
- Main Menu -> Chapter 9 -> Results -> Researcher flow is routable.
- Missing media does not crash gameplay.
