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

- 5 patients (all with password `password123`)
- 6 appointments (mix of one-time and recurring)
- 7 prescriptions (mix of one-time and recurring refills)

Running `pnpm seed` clears existing data before inserting, so it's safe to re-run.

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

| Area             | Path     | Auth                |
| ---------------- | -------- | ------------------- |
| Admin (mini-EMR) | `/admin` | None                |
| Patient Portal   | `/`      | Session-based login |

## API

All endpoints return a consistent shape:

```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }
```

Health check: `GET /api/health`
