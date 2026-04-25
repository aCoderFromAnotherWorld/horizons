# Horizons

## **Live:** https://horizons-asd.vercel.app

An ASD screening serious game for children aged 3–10. Delivers a 60–75 minute play experience across 6 chapters while collecting behavioral data for researcher and clinician review.

> **Screening tool only — not a diagnostic instrument. Always consult a qualified specialist.**

---

## Research Foundation

| Paper                                    | Key Contribution                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| ADOS-2 (Maddox et al., 2017)             | Gold-standard ASD domains: Social Communication + Restricted/Repetitive Behaviors |
| DTT Serious Game (Khowaja & Salim, 2018) | Per-task accuracy and attempt metrics                                             |
| EmoGalaxy (Irani et al., 2018)           | 93% screening accuracy via SVM; negative emotion recognition as differentiator    |
| M-CHAT-R/F                               | Checklist items embedded across chapters (items #3, #9, #10, #11, #15, #16)       |

---

## Tech Stack

|             |                                                          |
| ----------- | -------------------------------------------------------- |
| Runtime     | Bun                                                      |
| Framework   | Next.js 15 (App Router, JavaScript only — no TypeScript) |
| Styling     | Tailwind CSS v4 + Framer Motion                          |
| UI          | ShadCN UI                                                |
| Database    | PostgreSQL via Neon + `postgres.js`                      |
| Auth        | Better Auth (email+password, roles)                      |
| State       | Zustand (localStorage-persisted)                         |
| Sound       | Tone.js (synthesized — zero audio files)                 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable                        |
| Charts      | Recharts                                                 |
| Email       | Resend                                                   |
| Analytics   | Vercel Analytics                                         |
| Deployment  | Vercel                                                   |

Zero image or audio files — all visuals are emoji + CSS + SVG + Canvas.

---

## Game Structure

| Chapter                | Theme            | Domain                      | Duration  |
| ---------------------- | ---------------- | --------------------------- | --------- |
| 1 — My World           | 💜 Lavender      | Baseline                    | 5–7 min   |
| 2 — Feeling World      | 🧡 Amber         | Social Communication        | 11–13 min |
| 3 — Social World       | 💙 Sky Blue      | Social Communication        | 14–16 min |
| 4 — Routine & Patterns | 💚 Emerald       | Restricted/Repetitive       | 13–15 min |
| 5 — Pretend & Senses   | 💜🩷 Violet-Pink | Pretend Play + Sensory      | 11–13 min |
| 6 — Grand Finale       | 🌟 Gold          | Consistency check + results | 7–9 min   |

### Scoring

- **Lower = better** (penalty-based; 0 = no concern)
- Four domains with research-backed weights:

| Domain                | Weight | Chapters  |
| --------------------- | ------ | --------- |
| Social Communication  | 0.40   | Ch2 + Ch3 |
| Restricted/Repetitive | 0.30   | Ch4       |
| Pretend Play          | 0.15   | Ch5 L1–2  |
| Sensory Processing    | 0.15   | Ch5 L3    |

- Five red flag multipliers (stack multiplicatively, capped at 2×): negative emotion recognition, absent pretend play, extreme sensory distress, rigid pattern distress, poor imitation

---

## Setup

```bash
bun install

# ShadCN (once)
bunx shadcn@latest init
bunx shadcn@latest add button card dialog badge progress tabs toast tooltip \
  separator scroll-area avatar alert table input label select textarea \
  dropdown-menu sheet

# Seed admin account (once)
bun scripts/seed-admin.js

bun dev          # development
bun run build    # production build
bun start        # production server
bun test         # run all tests
```

Database schema auto-migrates on every server start — no manual Neon setup required after setting `DATABASE_URL`.

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech/horizons?sslmode=require

BETTER_AUTH_SECRET=<32+ chars>
BETTER_AUTH_URL=https://horizons-asd.vercel.app

REPORT_HMAC_SECRET=<32+ chars>

RESEND_API_KEY=re_...
RESEND_FROM=noreply@horizons-asd.vercel.app
CONTACT_EMAIL=researcher@institution.edu

NEXT_PUBLIC_APP_NAME=Horizons
NEXT_PUBLIC_APP_URL=https://horizons-asd.vercel.app

# Seed script only
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=<strong>
```

All services are **free tier**: Neon (0.5 GB), Resend (3k/month), Vercel + Analytics (hobby), Better Auth (open source).

---

## Dashboard

`/dashboard/*` requires Better Auth session (guarded by middleware).

| Role         | Access                                                                |
| ------------ | --------------------------------------------------------------------- |
| `researcher` | Sessions list, session detail, data export                            |
| `admin`      | All researcher + accounts management, contact inbox, survey responses |

Login at `/dashboard/login`. Create first admin with `bun scripts/seed-admin.js`.

Caregiver reports at `/report/[sessionId]` — HMAC-SHA256 gated, generated after Chapter 6 completion.

---

## Key Design Decisions

- No visible timers — response time measured silently in background
- Practice demo before every new mechanic type (unscored)
- Break button between every level; frequency logged as behavioral signal
- Animation and sound intensity scales with caregiver-configured sensory level (low/medium/high)
- Minimum 64×64px touch targets; mobile-first (375px), primary target tablet (768px+)
- `sessionId` is the sole permanent identifier — no persistent personal data (GDPR-aligned)
