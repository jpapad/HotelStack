# Monorepo scaffold (pnpm + NestJS + Next.js + Postgres)

This repository is a pnpm workspace with:

- `apps/api`: NestJS 10 (TypeScript, strict)
- `apps/web`: Next.js 14 App Router (Tailwind CSS + React Query)

## Requirements

- Node.js `20` (see `.nvmrc`)
- pnpm (via Corepack or standalone)
- Docker (for Postgres and/or full stack)

## Environment

- Root `.env` contains defaults used by local dev and Docker Compose.
- Root `.env.example` is a template.
- Per-app overrides live in:
  - `apps/api/.env.local`
  - `apps/web/.env.local`

### Variables

| Variable | Used by | Default | Notes |
|---|---|---:|---|
| `API_PORT` | api | `3001` | host port for API |
| `WEB_PORT` | web | `3000` | host port for web |
| `POSTGRES_PORT` | postgres | `5432` | host port for Postgres |
| `POSTGRES_USER` | postgres | `postgres` | |
| `POSTGRES_PASSWORD` | postgres | `postgres` | |
| `POSTGRES_DB` | postgres | `app` | |
| `DB_HOST` | api | `localhost` | overridden to `postgres` in Docker |
| `DB_PORT` | api | `5432` | |
| `DB_USER` | api | `postgres` | |
| `DB_PASSWORD` | api | `postgres` | |
| `DB_NAME` | api | `app` | |
| `NEXT_PUBLIC_API_URL` | web (browser) | `http://localhost:3001` | public URL used by the client |
| `API_URL` | web (server) | `http://localhost:3001` | overridden to `http://api:3001` in Docker |

## Local development

1. Start Postgres:

```bash
docker compose up -d postgres
```

2. Install dependencies:

```bash
pnpm install
```

3. Run API + web:

```bash
pnpm dev
```

- API: http://localhost:3001 (`/` and `/health`)
- Web: http://localhost:3000

## Docker (full stack)

Build and run Postgres + API + web:

```bash
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:3001

## Notes

- The API exposes a placeholder endpoint at `/` and a `/health` endpoint that also checks database connectivity.
- The web app includes a React Query provider and a placeholder page that fetches the API response.
