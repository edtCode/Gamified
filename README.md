# 🎮 Gamified College Learning App

A college-focused social learning app that gamifies progress. Students level up through learning
tracks (**Basics → DSA → Projects → Resume → Interviews**), earn XP and badges, keep daily streaks,
find peers, message mentors 2+ levels above them, and compete on batch-wise leaderboards.

This repository contains a **complete, runnable v1**.

---

## Tech stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Frontend   | Next.js (App Router) + Tailwind CSS                |
| Backend    | Node.js + Express + TypeScript                     |
| Real-time  | Socket.IO (live chat + notifications)              |
| Database   | PostgreSQL (via Prisma ORM)                        |
| Cache      | Redis (leaderboard sorted sets)                    |
| Auth       | JWT (Bearer) + bcrypt, college-email verification  |
| Infra      | Docker Compose (Postgres + Redis)                  |

Monorepo via npm workspaces: `apps/api` (backend) and `apps/web` (frontend).

---

## Prerequisites

- Node.js 20+ and npm 9+
- Docker + Docker Compose (for Postgres + Redis)

---

## Quick start

```bash
# 1. Clone & install (installs both workspaces)
npm install

# 2. Configure environment
cp .env.example .env
cp .env apps/api/.env          # the API reads its own .env
# (defaults already match docker-compose.yml — no edits needed for local dev)

# 3. Start Postgres + Redis
npm run docker:up

# 4. Create the schema and seed demo data
npm run db:migrate
npm run db:seed

# 5. Run API (:4000) + Web (:3000) together
npm run dev
```

Open **http://localhost:3000**.

---

## Using the app

### New account
1. Go to **/signup** and register with a college email on an allowed domain — default `you@example.edu`.
2. In dev, **no email is sent**. The verification link is printed to the **API console**:
   `🔗 Verify link: http://localhost:3000/verify?token=...`
   Open it (or paste the token on the `/verify` page) to activate the account.
3. Log in, then complete tasks on **/tracks** to gain XP, level up, earn badges, and build a streak.

### Demo accounts (created by the seed)
All seeded users share the password **`password123`**. Emails are on `example.edu`:

| Email                     | Batch | Approx. level | Notes                         |
| ------------------------- | ----- | ------------- | ----------------------------- |
| `aarav@example.edu`       | 2027  | 1             | Fresh learner                 |
| `diya@example.edu`        | 2027  | 3             | Mid-progress                  |
| `kabir@example.edu`       | 2027  | 6             | Eligible mentor for level ≤4  |
| `meera@example.edu`       | 2027  | 8             | Top of 2027 batch             |
| `rohan@example.edu`       | 2026  | 5             | Other batch                   |
| `ananya@example.edu`      | 2026  | 9             | Top of 2026 batch             |

(Full list printed at the end of `npm run db:seed`.)

---

## Features (v1)

- ✅ Signup/login with **college-email verification** (JWT auth)
- ✅ Profile with **current level, XP, streak, and badges**
- ✅ **Tracks & checklists** — per-skill milestone tasks
- ✅ **Level system + badges + XP** with level-up / badge toasts
- ✅ **Batch-wise leaderboard** (Redis-cached)
- ✅ **Mentor messaging** — DM seniors 2+ levels above, in real time
- ✅ **Notifications + daily streak counter**

### v2 (stubbed)
Roadmap engine, study rooms & pair-matching, unlockable resources / AMA scheduling, admin analytics,
referral & placement-readiness score. The API returns `501 { status: "planned" }` for these, and the
web app shows "Coming in v2" placeholders.

---

## Project layout

```
Gamified/
├── docker-compose.yml        # Postgres + Redis
├── .env.example              # env template
├── package.json              # npm workspaces + root scripts
├── apps/
│   ├── api/                  # Express + Prisma + Socket.IO backend
│   │   ├── prisma/           # schema.prisma + seed.ts
│   │   └── src/
│   │       ├── routes/       # REST endpoints
│   │       ├── services/     # xp, badges, streak, leaderboard, mentors
│   │       ├── middleware/   # auth, error handling
│   │       ├── sockets/      # Socket.IO handlers
│   │       └── lib/          # prisma, redis, config, jwt
│   └── web/                  # Next.js (App Router) + Tailwind
│       └── app/, components/, lib/
└── README.md
```

---

## Useful scripts (run from repo root)

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Run API + Web together                       |
| `npm run build`      | Production build of both apps                |
| `npm run docker:up`  | Start Postgres + Redis                       |
| `npm run docker:down`| Stop containers                              |
| `npm run db:migrate` | Apply Prisma migrations                      |
| `npm run db:seed`    | Seed tracks, tasks, badges, levels, users    |
| `npm run db:reset`   | Drop, re-migrate, and re-seed the database   |

---

## API overview

Base URL `http://localhost:4000`. Send `Authorization: Bearer <token>` for protected routes.

```
POST   /auth/signup            { email, name, password, batch }
GET    /auth/verify?token=...
POST   /auth/login             { email, password }
GET    /auth/me

GET    /users/me   |  PATCH /users/me  |  GET /users/:id

GET    /tracks                 GET /tracks/:slug/tasks
GET    /me/tasks               POST /me/tasks/:taskId/complete

GET    /badges                 GET /me/badges
GET    /leaderboard?scope=batch

GET    /mentors                GET /conversations
GET    /messages/:userId       POST /messages   { toUserId, body }

GET    /notifications          POST /notifications/:id/read

GET    /roadmap  |  GET /rooms  → 501 (planned for v2)
```

Socket.IO (namespace `/`, JWT in `auth.token`): `message:send` → `message:new`, plus `notification:new`.
