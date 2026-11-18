# Development Roadmap

## Phase 2: Foundation (Week 1-2)

### Tasks

1. **Monorepo setup**
   - Root `package.json` with workspaces, scripts (`dev`, `build`, `lint`, `typecheck`, `test`).
   - `apps/web/package.json`, `apps/api/package.json`, `packages/shared/package.json`.
   - TypeScript config: strict, path aliases (`@/*` for web, `#shared/*` for shared).
   - ESLint + Prettier + format-on-save config.
2. **CI pipeline** (`.github/workflows/ci.yml`)
   - On PR: lint, typecheck, unit tests (shared), API tests (against Postgres container), component tests.
   - Fail on any error.
3. **Prisma schema + Neon**
   - Create Neon project, get connection strings.
   - `apps/api/prisma/schema.prisma` (done in ER_DIAGRAM.md).
   - `npx prisma migrate dev` → migration files.
   - `npx prisma db seed` → seed script.
4. **Express skeleton** (`apps/api`)
   - `src/index.ts`: express app factory, helmet, cors, rate limit, JSON parser, global error handler, `/health`, OpenAPI endpoint.
   - `src/prisma.ts`: Prisma client singleton with retry for Neon cold start.
   - Environment validation on start (zod env schema).
   - Graceful shutdown.
5. **Next.js skeleton** (`apps/web`)
   - `src/app/layout.tsx`, `globals.css` with Tailwind theme tokens.
   - `next-intl` setup: `i18n/ja.json`, `i18n/en.json` with a handful of keys to confirm parity.
   - Middleware: lang cookie → no flash.
   - Language toggle component + persistence.
6. **Design tokens**
   - `globals.css`: colors (navy primary, warm accent, red/coral accident, grey surfaces), radii (12-16px), spacing, shadows, typography (Noto Sans JP + Inter).
   - `next/font` for Noto Sans JP and Inter with subsetting.
7. **Header + Footer**
   - Two-row header, utility row, main nav, language toggle, login, floating accident button.
   - Footer with group links, policy pages, demo notice.

### Dependencies
- GitHub repo created.
- Node.js 20+ installed locally.
- Neon account (free).

### Exit Criteria
- [ ] `npm run lint && npm run typecheck` green at root.
- [ ] `npx prisma migrate deploy` + seed run on fresh Neon DB without error.
- [ ] Express `/health` returns 200.
- [ ] Next.js dev server renders home page with Japanese + English underneath, lang toggle switches on every page, persists after reload, no flash.
- [ ] Locale parity check script passes (no key in one file missing from the other).

### Tests in this phase
- TC-I18N-01, TC-I18N-02, TC-I18N-03 (toggle, persistence, locale parity).
- Component test: LanguageToggle.
- API test: `/health` returns 200 and `{ status: "ok" }`.

---

## Phase 3: Auth (Week 2-3)

### Tasks
1. **Auth router** (`apps/api/src/routers/auth.ts`)
   - register, verify-email, login, refresh, logout, forgot-password, reset-password, me.
   - bcrypt cost 12, JWT access (15min), refresh cookie (httpOnly, secure in prod, sameSite strict).
   - Rate limit on register + login + forgot.
   - Account lockout after 5 failed logins (track failed attempts + lock until).
   - Token reuse detection (revoke old refresh tokens on new login).
   - Password reset token single-use + expiry.
2. **Auth middleware + RBAC** (`apps/api/src/middleware/auth.ts`, `rbac.ts`)
   - Bearer token verification → `req.user`.
   - Role check helper.
3. **Customers router** (`apps/api/src/routers/customers.ts`)
   - get me, update profile, change password.
4. **Next.js auth**
   - `AuthContext` (useAuth hook): login, logout, register, refresh, isLoading, user, role.
   - Access token in memory; refresh cookie handled by browser.
   - `middleware.ts`: protect (customer) and (admin) routes; redirect to login with returnTo; admin route → 403 for customers.
   - Login page: email+password, remember me, forgot link, redirect back, admin → /admin.
   - Register page: full form with zod, strength meter, consent, duplicate handling, dev email verification link.
   - Forgot/reset password pages.

### Dependencies
- Phase 2 foundation done.
- Email provider for prod (Resend free tier) — optional for dev (dev uses log link).

### Exit Criteria
- [ ] All TC-AUTH-01 through TC-AUTH-08 pass.
- [ ] Unauthenticated → login redirect + returnAfterLogin works.
- [ ] Customer cannot access /admin or admin endpoints (403).
- [ ] Admin logs in on same form, lands on /admin.

### Tests in this phase
- TC-AUTH-01 to TC-AUTH-08 (all).
- Component tests: login form validation, register form validation, password strength meter, language toggle persistence through login.

---

## Phase 4: Public Site (Week 3-5)

### Tasks
1. **Home page** — hero 3 actions, news strip (latest 3 from API), fraud banner, product category cards, how-a-claim-works 4 steps, trust numbers, FAQ preview, contact block with 24h number. ISR.
2. **Products list** — grid from API, filter by category, search by name, sort, empty state, error state + retry, legal notice block, brochure request links.
3. **Product detail** — overview, who-for, coverage table, riders, example premium by age/plan, exclusions, how to claim, related FAQ, CTA to contact/login, SEO metadata per product (titleJa/En, descriptionJa/En, og).
4. **About us** — company message, mission, history timeline, numbers, office list, governance, policies.
5. **News** — list with category tags + pagination, detail page, pinned first.
6. **FAQ** — search box, categories, accordion, helpful feedback, link to contact when no answer. Keyboard accessible.
7. **Contact** — two blocks (accident contact with 24h number + wizard link; general enquiry form saved to DB), complaint desk info.
8. **Supporting pages** — privacy, terms, solicitation policy, accessibility statement, sitemap, glossary, 404, 500.
9. **Language toggle** verified across all public pages.

### Dependencies
- Phase 2 + 3 done.
- Seed data (products, news, FAQ, categories) in DB.

### Exit Criteria
- [ ] TC-PROD-01, TC-PROD-02, TC-PUB-01, TC-PUB-02, TC-PUB-03, TC-I18N (all) pass.
- [ ] Accessibility scan (axe) clean on all public pages.
- [ ] Product detail unknown slug → 404.
- [ ] Contact form saves to DB, rejects invalid input, rate limited, success message in selected language.

### Tests in this phase
- TC-PROD-01, TC-PROD-02.
- TC-PUB-01, TC-PUB-02, TC-PUB-03.
- TC-I18N-01, TC-I18N-02, TC-I18N-03, TC-I18N-04.
- Component tests: ProductCard, FaqAccordion, contact form, news list pagination.
- Accessibility: axe on home, products, product detail, news, faq, contact.
- Lighthouse CI on home, products, product detail (target ≥90 all four).

---

## Phase 5: Customer Area (Week 5-6)

### Tasks
1. **Dashboard** — greeting (nameJa/En), my policies (from API), my claims with status badges, quick actions, profile edit link, change password link, notification list. Protected route.
2. **Profile edit** — form to update profile fields (zod), saves to DB.
3. **Change password** — current + new password, server validation.
4. **Notifications** — list with read/unread, mark read.
5. **Policies list/detail** — my policies with product summary + coverages.

### Dependencies
- Phase 3 auth done.
- Policies seeded or created by admin.

### Exit Criteria
- [ ] Object-level access tests pass (customer sees only own policies/claims/notifications).
- [ ] Dashboard loads from API (not mock).
- [ ] Profile edit + change password work end to end.

### Tests in this phase
- Object-level access: customer cannot see another customer's policies/claims (403).
- Customer cannot access admin endpoints (403) — already in auth but re-confirm.
- Component tests: dashboard claim badges, notification list.

---

## Phase 6: Claims (Week 6-9)

### Tasks
1. **Claim wizard** (`/claims/new`) — 5 steps with Stepper:
   - (1) choose policy (only own policies) + claim type.
   - (2) accident date, place (Ja+En), description (Ja+En).
   - (3) amount estimate + bank details (masked inputs: hide full account number, store masked).
   - (4) document upload (drag-drop, multiple, progress, type/size validation, preview, delete-before-submit, pre-signed R2 upload, confirm).
   - (5) review + submit → claim number SIJ-2026-000123.
   - Draft save (step 1-4 save draft to DB), resume after logout, back-button handling, double-submit guard (idempotency key).
2. **Document upload** — inside wizard + `/claims/[id]`:
   - pre-signed upload URL from API → browser PUTs to R2 → confirm to API.
   - required-document checklist per claim type.
   - signed download URL (short-lived, owner or admin only).
   - delete document (before submit for customer; admin can delete too).
3. **Claim tracking** — `/claims` list with filters, `/claims/[id]` detail:
   - status timeline (Received, Under review, More documents needed, Approved, Paid, Rejected) with dates + comments.
   - admin comments visible to customer.
   - document list.
   - "Upload requested documents" button when status = MORE_DOCUMENTS_NEEDED.
4. **Status transitions** — server-enforced allowed transitions; invalid → 409.
5. **Notifications** — on every status change, create notification for customer.

### Dependencies
- Phase 3 (auth), Phase 5 (dashboard).
- R2 bucket configured + CORS + env vars.
- Seed data: policies for customers to claim on.

### Exit Criteria
- [ ] TC-CLM-01 to TC-CLM-04 pass.
- [ ] TC-DOC-01 to TC-DOC-04 pass.
- [ ] TC-TRK-01 pass.
- [ ] Draft save + resume works after logout.
- [ ] Uploaded files survive Render restart (in R2).
- [ ] Claim number unique and formatted.

### Tests in this phase
- TC-CLM-01 (own policy only), TC-CLM-02 (wizard validation, draft, resume, submit, unique number), TC-CLM-03 (status transitions + 409), TC-CLM-04 (history row + notification).
- TC-DOC-01 (allowed upload via pre-signed URL), TC-DOC-02 (disallowed type/size/empty/spoofed), TC-DOC-03 (owner-only download, signed URL expiry), TC-DOC-04 (upload failure → retry, no orphan).
- TC-TRK-01 (timeline + comments order + language).
- Component tests: ClaimWizard steps, FileUploader, StatusTimeline, bank masker.

---

## Phase 7: Admin (Week 9-11)

### Tasks
1. **Admin dashboard** — KPI cards + charts (claims by status, by type, per month), quick links. Numbers from API (match DB counts).
2. **Claims management** — list (search, filter status/type), detail, change status (with comment), request documents, view/download files.
3. **Customers** — list (search), detail (profile + policies + recent claims).
4. **Products CRUD** — create, edit, delete (soft), reflected on public pages (cache revalidated).
5. **News CRUD** — create, edit, delete (soft), pinned toggle, reflected on public pages.
6. **FAQ CRUD** — create, edit, delete (soft), reflected on public pages.
7. **Contact messages** — list, status change.
8. **Audit log** — table with filters (action, targetType, targetId), every admin action logged.

### Dependencies
- Phase 3 (auth + roles), Phase 6 (claims).
- Admin user seeded.
- Revalidation: admin actions call Next.js revalidateTag (via API proxy or direct if using preview URLs) — or admin sets a flag and public pages revalidate on next request. Document choice.

### Exit Criteria
- [ ] TC-ADM-01 to TC-ADM-04 pass.
- [ ] Admin numbers match DB counts.
- [ ] Status change + comment + request documents → customer sees them.
- [ ] CRUD for products/news/Faq reflected on public pages (cache revalidated).
- [ ] Every admin action in audit log with user, time, target.

### Tests in this phase
- TC-ADM-01 (dashboard numbers), TC-ADM-02 (status change + comment + request docs → customer sees), TC-ADM-03 (CRUD + public reflection + cache revalidation), TC-ADM-04 (audit log entries).

---

## Phase 8: Hardening (Week 11-12)

### Tasks
1. **Security checklist** — passwords bcrypt, JWT secrets env, httpOnly refresh cookie, CSRF on cookie routes, zod everywhere, Prisma only (no raw SQL), output escaped, no stored XSS in descriptions/news/comments, CORS limited, helmet headers, rate limits on auth/upload-URL/contact, object-level authorisation tests for every owned resource, no secrets/stack traces/PII in logs/errors, bank details masked.
2. **Performance** — Lighthouse CI target ≥90 all four on home/products/product detail. next/image, font subsetting, ISR, route-level code splitting, API response pagination, DB indexes.
3. **SEO** — per-product SEO metadata, sitemap, robots.txt, hreflang, structured data where useful, 404/500 pages.
4. **Error pages** — 404, 500, friendly, bilingual.
5. **Rate limits** — auth (register/login/forgot), upload-URL, contact form. Document limits.
6. **Logging** — structured, no PII, no secrets. Request IDs for tracing.

### Dependencies
- Phases 2-7 done.

### Exit Criteria
- [ ] Lighthouse ≥90 all four on home/products/product detail.
- [ ] Zero serious/critical axe violations on all public pages + forms.
- [ ] Security checklist signed off.

### Tests in this phase
- Lighthouse CI runs in GH Actions.
- axe-core via jest-axe on every public page + form; Playwright axe on e2e.
- Security: manual checklist + automated (rate limit tests, 403 on wrong owner, 409 on bad transitions, upload abuse tests).

---

## Phase 9: Deploy (Week 12-13)

### Tasks
1. **Neon** — create project, copy both connection strings, run migrations + seed on production DB.
2. **R2** — create bucket, set CORS (PUT from browser origins), set env vars.
3. **Render API** — create web service, build/start commands, env vars, health check, run `prisma migrate deploy` after deploy.
4. **Vercel frontend** — create project, env vars (NEXT_PUBLIC_API_BASE_URL), deploy, custom domain.
5. **CORS update** — add Vercel production domain(s) to CORS_ORIGINS.
6. **Smoke tests** — run `scripts/smoke-test.ts` against live URLs: health, login, product list, upload, CORS.
7. **E2E journeys** — run Playwright journeys 1-5 against staging/live.
8. **Documentation** — README (setup, scripts, env vars, one-command local run), DEPLOYMENT.md (step-by-step), runbook.

### Dependencies
- Phases 2-8 done.
- Accounts: Neon (free), Render (free), Cloudflare R2 (free) or Supabase Storage (free), Vercel (free), GitHub.
- Optional: Resend (free) for email.

### Exit Criteria
- [ ] Smoke tests green on live URLs.
- [ ] Full e2e journeys pass against staging/live.
- [ ] New developer can clone, follow README, run locally in <30 min, deploy for free by following DEPLOYMENT.md.
- [ ] Site visibly cleaner/simpler/friendlier than reference; no copied branding/text.

### Tests in this phase
- Deployment smoke test script (health, login, product list, upload, CORS).
- Playwright journeys 1-5 (desktop + mobile 375px for journeys 1 and 3).

---

## Total Estimated Effort

| Phase | Estimated |
|-------|-----------|
| 2 Foundation | 2 weeks |
| 3 Auth | 1.5 weeks |
| 4 Public site | 2 weeks |
| 5 Customer area | 1 week |
| 6 Claims | 3 weeks |
| 7 Admin | 2 weeks |
| 8 Hardening | 1.5 weeks |
| 9 Deploy | 1.5 weeks |
| **Total** | **~14.5 weeks** (parallel review/testing throughout) |

Effort assumes one full-stack engineer. Testing is integrated into each phase, not separate.

## Open Assumptions (to confirm in Phase 1 approval)

- R2 vs Supabase Storage: R2 is S3-compatible and simpler for pre-signed URLs; Supabase Storage is also fine. Default to R2 unless user prefers Supabase.
- Email provider: Resend free tier for prod; dev uses log link for verification. Confirm.
- Keep-alive ping for Render: optional cron service (e.g. free GitHub Actions scheduled workflow pinging /health every 10min). Document as optional.
- Charts in admin: use a lightweight SVG-based chart (e.g. a small custom component or chart.js via client component). Default to a simple SVG bar/line chart to avoid heavy deps.
- Furigana: bonus feature; implement as client toggle wrapping known kanji. Default off.
- Dark mode: optional; default light mode. Document as optional future.
- Revalidation strategy: admin actions set a `updatedAt`-based tag; public pages revalidate on next request (stale-while-revalidate) OR admin hits a revalidate endpoint that calls Next.js revalidateTag via server-to-server. Default: admin CRUD writes to DB; public pages use ISR with short revalidate (60s) and a manual revalidate endpoint for immediate refresh. Confirm.
