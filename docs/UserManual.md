# Horizons User Manual

## 1. Running the Project

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun dev
```

Open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

Run tests:

```bash
bun test
```

Run a production build:

```bash
bun run build
```

## 2. Starting a Child Session

1. Open the main menu.
2. Select **Play**.
3. Optionally enter the child's first name.
4. Select the child's age.
5. Select **Let's Play!**

Horizons creates an anonymous session and starts Chapter 1.

## 3. How to Play

The child should interact naturally with each activity. A parent, guardian, researcher, or facilitator may help with device handling, but should avoid coaching answers unless a task protocol explicitly allows prompting.

Game flow:

1. Chapter 1: Welcome to My World
2. Chapter 2: Emotion Island
3. Chapter 3: Friend's House Visit
4. Chapter 4: Daily Routines Village
5. Chapter 5: Pretend Play Theater
6. Chapter 6: Sensory Garden
7. Chapter 7: Pattern Detective
8. Chapter 8: Copy Cat Challenge
9. Chapter 9: Assessment Summary

The app records choices, response timing, attempts, mouse movement batches, chapter scores, and red-flag candidates.

## 4. Results

After Chapter 9, Horizons shows a child-friendly completion page first. Parent/researcher details appear below the child-facing summary.

Horizons always includes this recommendation:

> Please consult a healthcare specialist for a proper evaluation.

The results are screening indicators only. They are not a diagnosis.

## 5. Researcher Dashboard

Open:

```text
/researcher
```

Enter the researcher password configured in `.env.local`:

```text
RESEARCHER_PASSWORD=...
```

Authentication is stored in browser `sessionStorage`; it is not written to the database.

The dashboard provides:

- Total sessions.
- Average combined score.
- Risk distribution chart.
- Session table with date, name, age, status, combined score, risk level, and details link.

## 6. Session Detail Page

Open a session from the dashboard with **View Details**.

The session page includes:

- Session metadata.
- Combined score gauge.
- Domain score bar chart.
- Red flags.
- Chapter-by-chapter score table.
- Response-time distribution.
- Mouse movement heatmap.
- JSON and CSV export buttons.

## 7. Exporting Data

From a session detail page:

- **Export JSON** downloads full session data, responses, scores, flags, domain scores, mouse movements, and summarized results.
- **Export CSV** downloads one row per task response.

Direct export URL pattern:

```text
/researcher/export?sessionId=SESSION_ID&format=json
/researcher/export?sessionId=SESSION_ID&format=csv
```

## 8. Interpreting Results

Horizons uses penalty scoring:

```text
lower score = fewer observed concerns
higher score = stronger observed screening concern
```

Risk labels:

- Low
- Medium
- High
- Very high

Risk labels summarize gameplay observations only. A healthcare specialist should interpret results with developmental history, caregiver report, and clinical observation.

## 9. Privacy Notice

- Session IDs are anonymous.
- First name is optional.
- No account system is used.
- Researcher authentication is local to the browser session.
- Data is stored in the local SQLite database configured by `DB_PATH` or `./horizons.db`.
- Exports should be handled as sensitive research data.

## 10. Troubleshooting

- If the app does not start, run `bun install` and then `bun dev`.
- If researcher login fails, check `RESEARCHER_PASSWORD` in `.env.local`.
- If a media file is missing, the game should show a placeholder instead of crashing.
- If the database is locked briefly, SQLite waits using the configured busy timeout.
