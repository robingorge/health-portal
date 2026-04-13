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
