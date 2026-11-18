## How to run locally (Windows / Git Bash / WSL)

This project is a pnpm/NPM monorepo with two apps:

- `apps/api` — Express API on port 3001 (SQLite in local dev)
- `apps/web` — Next.js frontend on port 3000

### 1) Install deps

```bash
cd /c/projects/insurance/insurance
npm install
```

### 2) Prepare the API database

```bash
cd /c/projects/insurance/insurance/apps/api
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push --schema=prisma/schema.prisma --accept-data-loss
```

> Local dev uses SQLite (`apps/api/.env` sets `DATABASE_URL="file:./dev.db"`).
> For production/Neon Postgres, restore the Postgres schema shape and set a pooled
> `DATABASE_URL` in `apps/api/.env`.

### 3) Seed demo data

```bash
npm run db:seed
```

The repeatable seed creates four products, three news articles, five FAQs, a demo customer, an admin, and an active auto policy. Demo credentials:

- Customer: `customer@example.com` / `Password1`
- Admin: `admin@example.com` / `AdminPass1`

The demo policy is `SIJ-DEMO-0001`. Seeded data is written to SQLite and can be recreated by running the seed command again.

### 4) Start the API

```bash
cd /c/projects/insurance/insurance/apps/api
npm run dev
```

Health check: `curl http://localhost:3001/api/v1/health` (includes SQLite connection status).

### 5) Start the web app

```bash
cd /c/projects/insurance/insurance/apps/web
npm run dev
```

Open `http://localhost:3000`. The web app calls the API at
`NEXT_PUBLIC_API_BASE_URL` (`http://localhost:3001/api/v1`).

### Run both at once

A convenience script is provided (uses concurrent background processes):

```bash
# Git Bash / WSL
bash run-local.sh

# Or on Windows CMD, double-click run-local.cmd
```

### Verify it works

```bash
curl -s http://localhost:3001/api/v1/health | jq .
# expect: {"status":"ok", ...}
```

### Common local issues

- Port 3000 or 3001 already in use: stop the conflicting process or change `PORT`
  in `apps/api/.env`.
- Prisma client missing: re-run `npx prisma generate --schema=prisma/schema.prisma`.
- Web cannot reach the API: confirm `apps/web/.env.local` still has
  `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1` and the API is running.
