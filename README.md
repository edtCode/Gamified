<div align="center">

# Gamified

A college-focused social learning platform that turns academic progress into an engaging, game-like experience.

![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-000000?style=flat-square&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat-square&logo=redis&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

</div>

---

## Overview

Gamified brings a game-like structure to college learning. Students follow learning tracks, complete tasks, and earn XP, levels, badges, and streaks, while competing on batch-wise leaderboards. The platform also supports mentor matching and real-time messaging, combined with a notification system and a campus-style social layer.

**Core features**

- Structured learning tracks and tasks
- XP, levels, badges, and streak tracking
- Batch-wise leaderboards
- Mentor matching with level-gated messaging
- Real-time messaging via Socket.IO
- Notification system
- Campus-style social experience

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Prisma ORM |
| Cache / Realtime state | Redis |
| Realtime transport | Socket.IO |
| Frontend | Next.js, Tailwind CSS |
| Package management | npm workspaces (monorepo) |

---

## Project Structure

```
Gamified/
├── docker-compose.yml
├── .env.example
├── package.json
└── apps/
    ├── api/
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── seed.ts
    │   └── src/
    │       ├── app.ts
    │       ├── index.ts
    │       ├── lib/
    │       ├── middleware/
    │       ├── routes/
    │       ├── services/
    │       └── sockets/
    └── web/
        ├── app/
        ├── components/
        ├── lib/
        └── scripts/
```

---

## Getting Started

### 1. Environment

Copy the environment templates before running the project:

```bash
cp .env.example .env
```

### 2. Start infrastructure

Bring up PostgreSQL and Redis with Docker:

```bash
npm run docker:up
```

### 3. Database

Apply migrations and seed demo data:

```bash
npm run db:migrate
npm run db:seed
```

### 4. Run the app

Start the API and web app together:

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:3000
```

---

## API Overview

Base URL: `http://localhost:4000`

### Authentication

| Method | Endpoint |
|---|---|
| POST | `/auth/signup` |
| GET | `/auth/verify?token=...` |
| POST | `/auth/login` |
| GET | `/auth/me` |

### Users

| Method | Endpoint |
|---|---|
| GET | `/users/me` |
| PATCH | `/users/me` |
| GET | `/users/:id` |

### Learning / Gamification

| Method | Endpoint |
|---|---|
| GET | `/tracks` |
| GET | `/tracks/:slug/tasks` |
| GET | `/me/tasks` |
| POST | `/me/tasks/:taskId/complete` |
| GET | `/badges` |
| GET | `/me/badges` |
| GET | `/leaderboard?scope=batch` |

### Social

| Method | Endpoint |
|---|---|
| GET | `/mentors` |
| GET | `/conversations` |
| GET | `/messages/:userId` |
| POST | `/messages` |

### Notifications

| Method | Endpoint |
|---|---|
| GET | `/notifications` |
| POST | `/notifications/:id/read` |
| POST | `/notifications/read-all` |

### v2 (Stubbed)

| Method | Endpoint |
|---|---|
| GET | `/roadmap` |
| GET | `/rooms` |
| POST | `/rooms` |

---

## Scripts

Run the following from the repository root:

| Command | Description |
|---|---|
| `npm run dev` | Start the API and web app concurrently |
| `npm run build` | Build the backend and frontend |
| `npm run docker:up` | Start PostgreSQL and Redis containers |
| `npm run docker:down` | Stop containers |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset the database |

---

## Demo Data

Seeded users share the password `password123`. The seed file creates example learners and mentors using `example.edu` email addresses.

---

## Environment Variables

The `api` app reads the following variables:

| Variable | Description |
|---|---|
| `API_PORT` | Port the API server runs on |
| `WEB_ORIGIN` | Allowed origin for the frontend (CORS) |
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct PostgreSQL connection string for Prisma migrations |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `ALLOWED_EMAIL_DOMAINS` | Restricts signup to specific college email domains |

The backend loads environment variables from both the repository root `.env` and its own local `.env`.

---

## Notes

- The API exposes real-time events through Socket.IO.
- Mentor messaging enforces a minimum two-level difference for mentorship eligibility.
- Redis is used for caching leaderboard data and managing room state.
- v2 routes are currently stubbed and return a planned/coming-soon response.

---

## Roadmap

- [ ] Contribution guidelines
- [ ] Known issues
- [ ] Public roadmap

---

<div align="center">

Built as part of an ongoing backend engineering roadmap.

</div>
