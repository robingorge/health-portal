# Health Portal

A full-stack mini-EMR and Patient Portal built with production-style architecture.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Express 5 + TypeScript + Mongoose
- **Database:** MongoDB
- **Validation:** Zod
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
- Auth state is held in a minimal Zustand store (`user`, `isAuthenticated`) and revalidated against `/auth/me` on every portal mount.

## Scripts Reference

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Run web (:3000) and server (:4000) together  |
| `pnpm dev:web`      | Frontend only                                |
| `pnpm dev:server`   | Backend only                                 |
| `pnpm seed`         | Reset & seed the database                    |
| `pnpm typecheck`    | Type-check all workspaces                    |
| `pnpm build`        | Build all workspaces                         |
