# SAMPLE INSURANCE JAPAN (サンプル保険ジャパン)

A complete, production-quality, bilingual (Japanese N4 + English) non-life insurance website for individual customers in Japan, plus an admin back office. Built as a full-stack monorepo.

**Demo company** — fictional names, phone numbers (0120-000-000), and policy numbers. Not affiliated with any real insurer.

## Architecture Overview

```
[Mobile/Desktop Browser]
        │
        ▼
   [Vercel CDN] ─── Next.js (App Router, React, TypeScript, Tailwind, shadcn/ui)
        │                ISR for public pages, route-level code splitting
        │
        ▼  REST (JSON over HTTPS)  CORS: Vercel domains + localhost only
   [Render Web Service] ─── Express.js (TypeScript, Prisma ORM, JWT + bcrypt,
        │                    CORS, zod, helmet, rate-limiting)
        │
        ├──▶ [Neon PostgreSQL] ◀── pooled connstring (app) / direct (migrations)
        │
        └──▶ [Cloudflare R2] ◀── pre-signed upload/download URLs (files survive restarts)
```

### Request Flows

**Login:** Browser → `/api/v1/auth/login` → bcrypt verify → JWT access token (15min) + httpOnly refresh cookie → return `{ accessToken, user }`.

**Claim submission:** Browser picks policy → wizard steps POST to `/api/v1/claims` (draft) → R2 pre-signed URL via `/api/v1/documents/upload-url` → browser PUTs file directly to R2 → confirms to `/api/v1/documents/confirm` → submit claim → status `RECEIVED` + timeline entry + notification.

**File upload:** Browser requests pre-signed URL from API → uploads directly to R2 (bypasses Render disk) → confirms to API → R2 holds file; Render restart does not lose it.

### Free-Tier Deployment Flow

1. **Neon:** Create project → copy pooled connection string → set `DATABASE_URL` in API env. Copy direct connection string → use for `prisma migrate dev/deploy`.
2. **R2:** Create bucket → set CORS to allow PUT from browser origins → set `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` in API env.
3. **Render API:** New Web Service → connect repo → root `apps/api` → build `npm ci && npm run build` → start `npm start` → env vars: `DATABASE_URL`, `R2_*`, `JWT_SECRET`, `BCRYPT_SALT_ROUNDS=12`, `ENABLE_RATE_LIMIT=true`, `CORS_ORIGINS` (Vercel domain + localhost) → add `/health` as health check endpoint → after deploy run `npx prisma migrate deploy`.
4. **Vercel Frontend:** New project → root `apps/web` → env vars: `NEXT_PUBLIC_API_BASE_URL` (Render URL) → deploy → set custom domain.
5. **CORS update:** Add Vercel production domain to `CORS_ORIGINS`.
6. **Smoke tests:** Run `scripts/smoke-test.ts` against live URLs.

### Free-Tier Limits and Coping Strategies

| Service | Limit | Coping |
|---------|-------|--------|
| Render Web Service | Sleeps after 15min inactivity | `/health` endpoint, UI "server waking up" state, retry with backoff on first request, optional keep-alive ping (cron) |
| Neon PostgreSQL | Suspends idle compute | Prisma `connectTimeout`, retry logic on connection errors, pooled connection string |
| R2 | 10 GB storage, 10 MB max object (free tier) | Enforce 10 MB cap server+client; reject oversize before upload URL issued |
| Vercel | 100 GB bandwidth/mo (hobby) | ISR caching, image optimization, CDN |

## Folder Structure

```
/
├── apps/
│   ├── web/                    # Next.js frontend (Vercel)
│   │   ├── src/
│   │   │   ├── app/            # App Router: (public), (auth), (customer), (admin) route groups
│   │   │   ├── components/     # shared UI: Header, Footer, LanguageToggle, MegaMenu,
│   │   │   │                    AccidentButton, Hero, ProductCard, ClaimWizard,
│   │   │   │                    FileUploader, StatusTimeline, FaqAccordion, DataTable,
│   │   │   │                    StatCard, Stepper, skeletons, error states
│   │   │   ├── hooks/          # useAuth, useApi, useLanguage, useClaimWizard
│   │   │   ├── lib/            # api client, i18n setup (next-intl), auth helpers,
│   │   │   │                    theme tokens, date/currency formatters
│   │   │   ├── context/        # AuthContext, LanguageContext
│   │   │   ├── middleware.ts   # route protection, lang cookie, auth redirect
│   │   │   └── styles/         # globals.css with Tailwind theme tokens
│   │   ├── public/             # static assets, favicons, illustrations
│   │   ├── i18n/               # ja.json, en.json locale files (next-intl)
│   │   ├── messages/           # localized message catalogs
│   │   └── tests/              # component + e2e tests
│   ├── api/                    # Express backend (Render)
│   │   ├── src/
│   │   │   ├── routers/        # auth, customers, products, policies, claims,
│   │   │   │                    documents, news, faq, contact, admin, health
│   │   │   ├── middleware/      # auth, rbac, error handler, validator, rate limit, cors
│   │   │   ├── services/       # business logic: auth service, claim service,
│   │   │   │                    document service, notification service
│   │   │   ├── prisma/         # schema.prisma, migrations, seed.ts
│   │   │   ├── validators/     # zod schemas per router
│   │   │   ├── utils/          # error codes, response envelope, pagination,
│   │   │   │                    bank-masker, slug generator, token helpers
│   │   │   └── index.ts        # express app factory, helmet, cors, rate limit
│   │   └── tests/              # supertest integration tests
│   └── ...
├── packages/
│   └── shared/                 # zod schemas + TypeScript types shared by web + api
│       ├── src/
│       │   ├── schemas/        # request/response zod schemas (single source of truth)
│       │   └── types/          # shared TS types, enums, API response types
│       └── package.json
├── docs/
│   ├── ARCHITECTURE.md         # this document (design package)
│   ├── TEST_PLAN.md            # test case table, status, coverage
│   ├── DEPLOYMENT.md           # step-by-step deploy guide + runbook
│   ├── README.md               # setup, scripts, env vars (one-command local run)
│   └── ROADMAP.md             # phase plan with tasks, effort, dependencies, exit criteria
├── .github/
│   └── workflows/
│       ├── ci.yml              # lint, typecheck, unit, API, component on PR
│       ├── e2e.yml             # Playwright e2e on staging after merge
│       └── lighthouse.yml      # Lighthouse CI on public pages
├── .env.example                # shared env template (no secrets)
├── .env.example.web            # web-specific env template
├── .env.example.api            # api-specific env template
└── package.json               # monorepo root: workspaces, scripts
```

## Phase 1 Deliverables (this document covers items 1-8 below)

1. ✅ Architecture + diagram (above) + deployment flow + free-tier limits
2. ✅ Folder structure (above)
3. ⬜ Database ER diagram (Mermaid erDiagram) — next section
4. ⬜ Full Prisma schema — next section
5. ⬜ Express REST API endpoints table — after schema
6. ⬜ Next.js component structure — after API table
7. ⬜ Development roadmap — after component structure
8. ⬜ Test plan (docs/TEST_PLAN.md) — at end of Phase 1
