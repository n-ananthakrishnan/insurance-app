# Continuation: SAMPLE INSURANCE JAPAN monorepo

## Current status (as of this session)

Goal for this pass: first make the app *locally runnable and visible* with a minimal
functional baseline, then report what is left with priorities and reasons before doing
more build-debugging.

### What was created/fixed to get to “runnable first”

- **Environment files / templates now exist**
  - `apps/api/.env` (already present for local SQLite dev: `DATABASE_URL="file:./dev.db"`,
    JWT secret, CORS origins for `http://localhost:3000`, `PORT=3001`, blank R2/SMTP/Resend).
  - `apps/web/.env.local` (already present: `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1`,
    `API_BASE_URL=...`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000`).
  - Added non-secret templates so the repo documents what env is needed:
    - `.env.example` (root, shared note)
    - `apps/api/.env.example` (API keys, with SQLite dev values shown)
    - `apps/web/.env.example` (web keys, browser-exposed `NEXT_PUBLIC_*` emphasized)
    - `apps/api/.env.test` (non-secret test env for vitest runs)
  - Added run helpers so “how do I run this?” is answerable in one place:
    - `run-local.sh` (Git Bash / WSL) and `run-local.cmd` (Windows CMD) — install deps,
      generate Prisma client, push SQLite schema, then start API + Web side by side.

- **README now documents how to run locally**
  - Added a “How to run locally” section covering dependency install, Prisma generate/push,
    optional seed reality check, starting API + Web, running both at once, health-check curl,
    and common local issues (ports, missing Prisma client, web↔API reachability).

- **Bilingual (JA/EN) scaffolding is now in place and parity-checkable**
  - Created `apps/web/src/i18n.ts` (next-intl `getRequestConfig`, `locales`, `defaultLocale = "ja"`,
    message loading from `messages/{locale}.json`), plus `apps/web/src/middleware.ts` for next-intl
    locale routing.
  - Rewrote `apps/web/src/i18n/client.ts` so it cleanly exports next-intl `useTranslations`/`useLocale`
    and server `getTranslations` without duplicate named imports.
  - Fixed `npm run locale:check` (`scripts/check-locale-keys.ts`) which was broken at runtime due to
    ESM/CJS module-interop issues with `node:fs` + `import.meta.url`. The script now runs and
    **reports `✓ Locale keys match: ja.json and en.json have the same keys.`** against the existing
    `apps/web/i18n/ja.json` / `en.json`.
  - Note: this confirms *key parity* only. Actual i18n wiring inside pages/components and any
    missing message *values* are not yet verified end-to-end.

### Expected “minimal functional” state before wavefront expansion

- Backend (API) is the piece that must be live first: `http://localhost:3001/api/v1/health`
  should respond, and the basic auth endpoints (`register`, `login`, `me`) should work against
  the local SQLite DB.
- Frontend (Web) should start on `http://localhost:3000` and ideally render public pages
  (home, news, products, FAQ, contact) together with admin/customer areas once auth/sidebar
  wiring is acceptable. Public pages should be the first thing to look at; admin/customer
  protected flows come after.
- The bilingual baseline means pages should at least resolve a locale (defaulting to JA) and
  render from `ja.json`/`en.json` without a locale setup crash. Full JA/EN text completeness is
  a follow-up item, not a precondition for “the app opens.”

### Known next blockers after “it starts”

- The web app still does **not** have a clean production build yet — `next build` has been failing
  on a moving series of small TS/import errors. This session intentionally paused the build-debug
  loop in favor of “let the user see the app first.” A clean build is still required before
  production packaging/deploy, but it is no longer treated as the gate for “can I see the app.”
- The API routers (especially admin-based ones) and the seed script were noted earlier as not fully
  aligned with the adapted SQLite schema. If registered users/policies/claims/news/faq are needed at
  runtime, create them via the API or write a current-schema seed; the bundled `prisma/seed.ts` may
  not run cleanly yet.
- R2/Resend/SMTP are still unconfigured (env blank). Document upload/email flows are therefore not
  expected to work until storage/email are wired.

### How to continue (proposed)

1. Run the API and Web locally using `run-local.sh` / `run-local.cmd` (or the two `npm run dev`
   commands) and open `http://localhost:3000`.
2. Confirm the public pages render in JA (or EN when toggled) and that the API health/auth smoke
   works.
3. Tell me which screens you can see and which are broken/empty, and I will either (a) continue
   with the minimal-functional fixes you care about first, or (b) switch to a prioritized remaining
   work list with reasons before more build-debugging.

### Important context

- Project root: `/c/projects/insurance/insurance`. Bash on Windows uses `cd /c/projects/...`.
- Node/runtime: the repo uses `tsx` for dev and ESM/CJS interop quirks exist in some scripts; scripts
  were adjusted to actually run rather than to match a theoretical import style.
- The shared package (`packages/shared`) and the web-local type shim (`apps/web/src/types/shared-shims.ts`)
  are still part of the build-debugging story; they are not changed here unless a run-time/audit issue
  needs it.
