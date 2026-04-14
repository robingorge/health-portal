# Health Portal

A full-stack mini-EMR and Patient Portal built with production-style architecture.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Express 5 + TypeScript + Mongoose
- **Database:** MongoDB
- **Validation:** Zod
- **Auth:** Session cookie + bcrypt password hashing
- **Client state:** Zustand
- **HTTP client:** axios
- **Monorepo:** pnpm workspaces

## Project Structure

```
apps/
  web/           → Next.js frontend
  server/        → Express API server

packages/
  shared/        → Shared types, Zod schemas, constants
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- MongoDB running locally on port 27017

### Install

```bash
pnpm install
```

### MongoDB

Install via Homebrew:

```bash
brew tap mongodb/brew
brew install mongodb-community
```

Start MongoDB:

```bash
mongod --config /opt/homebrew/etc/mongod.conf &
```

The server connects to `mongodb://localhost:27017/health-portal` by default. Override with the `MONGO_URI` environment variable if needed.

### Seed the Database

```bash
pnpm seed
```

This populates the database with sample data:

- 2 patients (both with password `Password123!`)
  - `mark@some-email-provider.net`
  - `lisa@some-email-provider.net`
- 4 recurring appointments (2 per patient)
- 4 recurring prescriptions (2 per patient)

Running `pnpm seed` clears `patients`, `appointments`, and `prescriptions` before inserting, so it's safe to re-run.

### Run

```bash
# Both apps (web on :3000, server on :4000)
pnpm dev

# Frontend only
pnpm dev:web

# Backend only
pnpm dev:server
```

### Type Check

```bash
pnpm typecheck
```

## Application Areas

| Area             | Path                       | Auth                              |
| ---------------- | -------------------------- | --------------------------------- |
| Patient Portal   | `/` (login), `/portal/*`   | Session cookie (`hp_session`)     |
| Admin (mini-EMR) | `/admin`, `/admin/patients/[id]` | None                        |

### Patient Portal

- `/` — login page; redirects to `/portal` if a session already exists
- `/portal` — dashboard with profile, next 7 days of appointments, next 7 days of refills
- `/portal/appointments` — appointments over the next 3 months (recurrences expanded server-side)
- `/portal/prescriptions` — all prescriptions on file

### Admin

- `/admin` — patient list + create patient
- `/admin/patients/[id]` — patient detail with CRUD for appointments and prescriptions (supports recurrence rules / refill schedules)

## API

Base URL: `http://localhost:4000/api`

All endpoints return a consistent envelope:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

Route groups (see `apps/server/src/routes/`):

| Prefix              | Purpose                                     | Auth          |
| ------------------- | ------------------------------------------- | ------------- |
| `/api/auth`         | `login`, `logout`, `me`                     | mixed         |
| `/api/patients`     | Patient CRUD + nested appointments / rx     | none (admin)  |
| `/api/appointments` | Appointment CRUD                            | none (admin)  |
| `/api/prescriptions`| Prescription CRUD + `/options`              | none (admin)  |
| `/api/portal`       | `summary`, `appointments`, `prescriptions`, `prescriptions/refills` | session cookie |

Health check: `GET /api/health`

## Architecture Notes

- Backend follows a layered structure: `routes → controllers → services → repositories → models`. Business logic (recurrence expansion, refill schedule expansion, password hashing) lives in services.
- Recurrence rules are stored once on the appointment/prescription document; occurrences are expanded on read in the portal service for the requested window (7 days or 3 months).
- Shared DTOs and Zod schemas in `packages/shared` are consumed by both apps so the API contract is enforced at compile time.
- Frontend uses a thin axios wrapper (`apps/web/src/lib/api/client.ts`) that unwraps the envelope, throws a typed `ApiError`, and fires a global `onUnauthorized` callback for expired sessions.
- Auth state is held in a Zustand store driven by a `status` state machine (`idle | probing | authenticated | unauthenticated | error`). The store owns all async auth flows (`probe`, `login`, `logout`); components only read `status` and dispatch actions. `/auth/me` is re-probed on every portal mount.

## Deployment

The demo is deployed across three free-tier services:

| Layer    | Provider       | Notes                                                          |
| -------- | -------------- | -------------------------------------------------------------- |
| Frontend | Vercel         | Root directory `apps/web`; builds from the monorepo root.      |
| Backend  | Render         | Long-running Node process; free tier sleeps after 15 min idle. |
| Database | MongoDB Atlas  | Free M0 cluster; seeded once via `pnpm seed:prod`.             |

Key configuration:

- The server sets `app.set("trust proxy", 1)` so Express sees the original protocol behind Render/Vercel's TLS termination.
- In production, the session cookie is issued with `Secure` + `SameSite=None` so it survives the cross-origin hop between the Vercel frontend and Render backend.
- `CORS_ORIGIN` on the backend is pinned to the Vercel **production alias** (stable across redeploys), not the per-deploy hashed URL.
- Environment variables are provided via each provider's dashboard — `.env.production` is git-ignored and only used for local production-mode testing.

Build commands (in provider dashboards):

- **Render build:** `npm i -g pnpm@9.15.4 && pnpm install --prod=false && pnpm build:server`
- **Render start:** `pnpm --filter @health-portal/server start`
- **Vercel install:** `cd ../.. && pnpm install --prod=false`
- **Vercel build:** `cd ../.. && pnpm build:web`

## Known Limitations

- **No rate limiting** on `/auth/login` — trivial to brute-force in its current form.
- **Sessions are in-memory** on the server, so all users are logged out on restart and horizontal scaling would break auth. A real deployment would back sessions with Redis or a DB collection.
- **Admin area has no authentication** — intentional per the spec (mini-EMR is meant to be an internal tool), but it means anyone who can reach the frontend can edit patient data.
- **No automated tests** (unit, integration, or E2E). Coverage is currently manual.
- **Recurrence is expanded on every read** rather than cached/materialized. Fine at this scale; would need rethinking for large datasets or long windows.
- **Free-tier cold start** (~30s) on the first request after idle, due to Render's sleep policy.
- **No observability** — no structured logging, metrics, or error reporting (Sentry, Datadog, etc.).
- **Single-region deployment** — no read replicas, no CDN for API responses.

## Scripts Reference

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Run web (:3000) and server (:4000) together  |
| `pnpm dev:web`      | Frontend only                                |
| `pnpm dev:server`   | Backend only                                 |
| `pnpm seed`         | Reset & seed the database                    |
| `pnpm typecheck`    | Type-check all workspaces                    |
| `pnpm build`        | Build all workspaces                         |
