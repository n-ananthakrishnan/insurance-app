# Deployment Guide — SAMPLE INSURANCE JAPAN

Free-tier hosting: Frontend on Vercel, Backend on Render, Database on Neon, files on Cloudflare R2 (or Supabase Storage).

## Accounts to create (all free tiers)

- GitHub (repo)
- Neon (PostgreSQL)
- Cloudflare (R2) — or Supabase (Storage)
- Render (web service)
- Vercel (frontend)
- (Optional, prod email) Resend

## Step 1: Database (Neon)

1. Sign in to [Neon](https://neon.tech). Create a new project.
2. On the project page, copy the **Pooled connection string** (uses `-pooler` host). This is for the running app.
3. Copy the **Direct connection string** (normal host). This is for migrations.
4. Set the pooled string as `DATABASE_URL` in the Render service env (Step 4) and in local `.env.api`.
5. For local/CI migrations, use the direct string as `DATABASE_URL` when running `prisma migrate dev` / `prisma migrate deploy`.

Free-tier notes:
- Neon suspends idle compute. The app uses the pooled connection string and Prisma retry settings to cope with cold starts. The first query after idle may take a few extra seconds.
- On migrate deploy, if the connection fails due to cold start, retry once or twice.

## Step 2: File storage (Cloudflare R2)

1. Sign in to the [Cloudflare dashboard](https://dash.cloudflare.com). Go to R2.
2. Create a bucket, e.g. `sample-insurance-jp-docs`.
3. Under Settings → CORS, add a CORS policy that allows `PUT` from your browser origins:
   - Origins: `http://localhost:3000`, your Vercel production domain, and Vercel preview domain(s).
   - Methods: `PUT`, `POST`, `GET`.
   - Allowed headers: `Content-Type`, `x-amz-*`, `authorization`.
   - Max age: 3600.
4. Create an API token (R2 → API Tokens) with `Object Read & Write` on this bucket. Copy the Access Key ID and Secret Access Key.
5. Note your Cloudflare Account ID (top right of dashboard).
6. The R2 endpoint is `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
7. If using a public `r2.dev` bucket for signed downloads, create one and copy its public URL (optional; alternatively generate signed URLs server-side).

Free-tier limits: 10 GB storage, 10 MB max object. We enforce 10 MB on the server before issuing an upload URL, and reject oversize/forbidden types.

(If using Supabase Storage instead: create a bucket, set up anon/key roles, get the service role key for the backend to generate signed URLs, and configure CORS on the bucket.)

## Step 3: Backend (Render)

1. Push the repo to GitHub.
2. In Render, create a new **Web Service**. Connect the repo. Set the root directory to `apps/api`.
3. Build command: `npm ci && npm run build`.
4. Start command: `npm start`.
5. Plan: Free.
6. Environment variables (set these in Render):
   - `DATABASE_URL` = Neon pooled connection string.
   - `JWT_SECRET` = random 256-bit secret (generate: `openssl rand -base64 32`).
   - `BCRYPT_SALT_ROUNDS` = `12`.
   - `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`.
   - `CORS_ORIGINS` = comma-separated: `http://localhost:3000`, the Vercel production URL, and any preview URL pattern you want to allow.
   - `ENABLE_RATE_LIMIT` = `true`.
   - `PORT` = `3001` (Render sets `PORT` automatically in some setups; if Render injects its own port, omit `PORT` and let the app read `process.env.PORT || 3001`).
   - `NODE_ENV` = `production`.
7. Health check: set the health check path to `/api/v1/health` (GET). Render pings this to confirm the service is up.
8. Deploy. After the first deploy finishes, connect to the Render shell (or run locally) and run:
   - `npx prisma migrate deploy` — apply migrations to the production DB.
   - `npx prisma db seed` — seed demo data (admin, customers, products, policies, claims, news, FAQ).
   - `npx prisma generate` — ensure the client is generated (usually done in build).
9. Verify `GET /api/v1/health` returns 200 from your browser/curl.
10. Note the service URL: `https://<service>.onrender.com`. This is your `NEXT_PUBLIC_API_BASE_URL` (append `/api/v1`).

Free-tier notes:
- Render free web services sleep after 15 minutes of inactivity. The first request wakes the service (cold start ~ a few seconds). The frontend handles this with a "server is waking up" state and retry with backoff.
- Optional keep-alive: set up a free scheduled ping (e.g. a GitHub Actions workflow that `curl`s `/api/v1/health` every 10 minutes) to reduce cold starts. Document the cron in the runbook. This is optional; the app works without it.

## Step 4: Frontend (Vercel)

1. In Vercel, create a new project from GitHub. Set the root directory to `apps/web`.
2. Framework preset: Next.js.
3. Build command: `npm run build` (or leave default Next.js build).
4. Output directory: `.next`.
5. Environment variables:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://<render-service>.onrender.com/api/v1`.
   - `NEXT_PUBLIC_SITE_URL` = your Vercel production URL (e.g. `https://your-domain.vercel.app` or custom domain).
6. Deploy. Add a custom domain if desired (Vercel supports free custom domains with automatic HTTPS).
7. After the production domain is live, update `CORS_ORIGINS` on the Render service to include the production domain (and any preview domain pattern you allow).

## Step 5: CORS finalization

- The backend only accepts CORS requests from origins in `CORS_ORIGINS`.
- Add the Vercel production domain and any preview domain(s) you want to allow.
- For local dev, keep `http://localhost:3000`.
- Preflight (OPTIONS) is allowed for these origins only; credentials are not sent on public endpoints.

## Step 6: Smoke tests and e2e

1. Update `scripts/smoke-test.ts` with the live base URL (or pass it via env).
2. Run the smoke test against the live backend:
   - `npm run smoke:test` (if wired) or `npx tsx scripts/smoke-test.ts`.
   - Checks: `/health` 200; `/api/v1/auth/me` 401 without token; `/api/v1/products` 200; upload URL flow (request + confirm) returns proper shapes; CORS headers present for the allowed origin; 403 for an unknown origin.
3. Run Playwright e2e journeys 1–5 against the staging/live frontend.
4. If any smoke or e2e test fails, do not deploy further until fixed.

## Step 7: Ongoing operations (runbook)

### Cold start
- Symptom: first request after idle returns a timeout or slow response.
- Action: the frontend shows "server is waking up" and retries with backoff. No action needed for the user.
- If cold starts are too frequent, enable the optional keep-alive ping (GitHub Actions scheduled workflow hitting `/api/v1/health` every 10 min).

### Database cold start (Neon)
- Symptom: first query after idle fails or is slow.
- Action: the backend retries the Prisma connection with backoff. If it persists, check Neon project status.

### Seed / re-seed
- To re-run seed in production: `npx prisma db seed` on the Render shell. This is safe to run again (upsert-based seed). Do not run in the middle of traffic without a brief maintenance note.

### Migrations
- To add a migration: `npx prisma migrate dev --name <name>` locally → commit the migration file → deploy → run `npx prisma migrate deploy` on Render after deploy.

### Logs
- Render logs: view in the Render dashboard. Backend logs are structured and exclude PII/secrets.
- Do not log passwords, tokens, full bank account numbers, or personal data.

### Backups
- Neon provides point-in-time recovery on paid tiers; free tier has limited restore. Treat the DB as recoverable from seed + operational data exported via the API if needed. For a demo, the seed is the baseline.

### Secrets rotation
- Rotate `JWT_SECRET` by setting a new value and restarting the service. Existing access tokens expire in 15 min; refresh tokens are invalidated on next login. Plan a brief window.

## Environment variable summary

### Backend (Render)
`DATABASE_URL`, `JWT_SECRET`, `BCRYPT_SALT_ROUNDS=12`, `R2_BUCKET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_PUBLIC_URL` (optional), `CORS_ORIGINS`, `ENABLE_RATE_LIMIT=true`, `PORT` (if not injected), `NODE_ENV=production`.

### Frontend (Vercel)
`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`.

See `.env.example`, `.env.example.web`, `.env.example.api` at the repo root.
