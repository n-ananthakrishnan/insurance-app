# Test Plan — SAMPLE INSURANCE JAPAN

**Status:** Phase 1 (plan written). Tests written and passing as each phase completes. This document is kept current.

**Principles:**
- A feature is not done until its tests are written, passing, and listed here.
- Never delete or skip a failing test to make the build pass; fix the cause.
- Code without tests is considered unfinished.

## Test Layers

| Layer | Tools | Coverage target |
|-------|-------|-----------------|
| Unit | Vitest (web) + Vitest/Jest (api) | ≥85% of shared + service code |
| API integration | Supertest + Postgres container (CI) | 100% of endpoints: ≥1 success + ≥1 failure test each |
| Component | React Testing Library | All shared components (forms, toggle, accordion, uploader, timeline) |
| End-to-end | Playwright (desktop 1440px + mobile 375px) | All 5 journeys below |
| Accessibility | jest-axe + Playwright axe | Zero serious/critical violations on all public pages + forms |
| Security | Manual checklist + automated (rate limit, authorisation, upload abuse) | All checklist items signed off |
| Performance | Lighthouse CI | ≥90 in Performance, Accessibility, Best Practices, SEO on home/products/product detail |
| Deployment smoke | `scripts/smoke-test.ts` | Green on every production deploy |

## CI

- On PR: lint, typecheck, unit, API integration, component tests. Fail → merge blocked.
- On merge to main: e2e against staging (Playwright) + Lighthouse CI.
- Deploy smoke script runs after production deploy (manual step in runbook, automated in CI if live env vars available in a separate pipeline — default: run manually from runbook, automated optional).

## Test Case Table

### Authentication and Accounts

| ID | Module | Scenario | Steps | Expected Result | Type | Status |
|----|--------|----------|-------|-----------------|------|--------|
| TC-AUTH-01 | Auth | Register valid data | POST /auth/register with valid nameJa/En, email, password≥8 chars, phone, postal code, consent checkboxes; verify password stored hashed (query DB, not plain text) | 201; user created; passwordHash is bcrypt hash, not plain text; email not verified until token used | API + unit | Planned |
| TC-AUTH-02 | Auth | Duplicate email | Register with email that already exists | 400 INVALID_INPUT (or DUPLICATE_EMAIL); no second user created | API | Planned |
| TC-AUTH-03 | Auth | Weak/invalid input rejected both sides | (a) password too short, (b) invalid email, (c) missing consent, (d) bad phone format — submit on UI; also call API directly with same bad data | UI shows validation error; API returns 400 INVALID_INPUT with stable code; no user created | API + component | Planned |
| TC-AUTH-04 | Auth | Login success vs wrong password | (a) correct credentials → (b) wrong password | (a) 200, accessToken + refresh cookie, user returned, dashboard reachable; (b) 401 INVALID_CREDENTIALS, message generic (does not reveal whether email exists) | API + e2e | Planned |
| TC-AUTH-05 | Auth | Account lockout after 5 failed logins | Submit wrong password 5 times for same account; then try correct password; wait for lock expiry; try again | After 5th failure: 401 ACCOUNT_LOCKED; correct password also rejected while locked; after lock expires: login succeeds | API | Planned |
| TC-AUTH-06 | Auth | Refresh token flow | Login → use access token until expired → call /auth/refresh → use new access token; then reuse old refresh token; then use invalidated refresh token | Refresh returns new accessToken; old refresh token revoked → further use returns 401 and logs out; invalid/missing refresh cookie returns 401 | API + e2e | Planned |
| TC-AUTH-07 | Auth | Forgot + reset password | POST /auth/forgot-password with email; POST /auth/reset-password with token + newPassword; reuse token; wait for expiry | Forgot returns 200 with same message regardless of email existence; reset with valid newPassword → password changed, token marked used; reuse → 400 EXPIRED_TOKEN/already used; expired token → 400 | API + e2e | Planned |
| TC-AUTH-08 | Auth | Role-based access control | (a) Customer calls admin endpoint; (b) unauthenticated user hits /admin page; (c) customer logs in → lands on /dashboard; admin logs in → lands on /admin | (a) API 403 FORBIDDEN; (b) redirect to /login?returnTo=/admin; after login, customer → /dashboard (not /admin); admin → /admin | API + e2e + component | Planned |

### Language Toggle

| ID | Module | Scenario | Steps | Expected Result | Type | Status |
|----|--------|----------|-------|-----------------|------|--------|
| TC-I18N-01 | i18n | Default view Japanese + English underneath; toggle switches to English only | Load any page (default lang cookie absent → JA); verify each visible text shows JA first + EN underneath muted; toggle to EN; verify EN only, no JA visible | Default: JA primary + EN secondary; after toggle: EN only; on every page | E2E + component | Planned |
| TC-I18N-02 | i18n | Toggle persists across reload, navigation, login | Toggle to EN; reload page; navigate to product/detail/news/faq/contact; log in; verify lang still EN; switch back to JA; logout; verify JA | Choice persisted in localStorage + cookie; applied on first paint (no flash of wrong lang); kept across pages and after login/logout | E2E + component | Planned |
| TC-I18N-03 | i18n | Locale files have identical key sets; build fails if one missing | Run locale parity script (`scripts/check-locale-keys.ts`) | Script exits 0 when keys match; when a key is added to ja.json but not en.json, script exits non-zero and CI fails | Unit (script) + CI | Planned |
| TC-I18N-04 | i18n | Database content + server error codes display in selected language | Load product detail / news / faq in JA and EN; trigger an API error (e.g. 400) and verify message shown in selected language | Product/news/Faq titles, descriptions show correct lang; API error messages translated via code→t() | E2E | Planned |

### Products and Public Pages

| ID | Module | Scenario | Steps | Expected Result | Type | Status |
|----|--------|----------|-------|-----------------|------|--------|
| TC-PROD-01 | Products | List loads from API, filter, search, sort, empty + error states | Load /products; filter by category; search by name; sort; clear filters; simulate API error (mock) | Cards render from API; filter/search/sort work; empty state shown with message; error state shows retry; legal notice block present | E2E + component | Planned |
| TC-PROD-02 | Products | Detail by slug renders all sections; unknown slug 404 | Open /products/[validSlug] → verify overview, who-for, coverage table, riders, exclusions, example premium, how-to-claim, related FAQ, CTAs; open /products/[unknownSlug] | Valid slug: all sections present, SEO meta set; unknown slug: 404 page (not 200 with empty) | E2E + component | Planned |
| TC-PUB-01 | News | List pagination + detail; pinned first | Load /news; check pagination; open detail; verify pinned items appear before others | List paginated; detail shows full bilingual content; pinned sorted first | E2E + API | Planned |
| TC-PUB-02 | FAQ | Search finds matches in both languages; accordion keyboard accessible | Search "事故" / "accident" → results in both langs; open accordion with keyboard (Enter/Space); navigate with arrow keys | Search returns matching items; accordion expands/collapses via keyboard; ARIA roles correct | E2E + axe | Planned |
| TC-PUB-03 | Contact | Form saves to DB, rejects invalid input, rate limited, success message in selected lang | Fill valid form → submit → verify row in DB + success message; submit invalid (missing email, too long message) → validation error; spam fast → rate limit 429; check message lang matches UI lang | ContactMessage created; invalid rejected with clear errors; rate limit enforced; success message translated | API + E2E + component | Planned |

### Claims and Documents

| ID | Module | Scenario | Steps | Expected Result | Type | Status |
|----|--------|----------|-------|-----------------|------|--------|
| TC-CLM-01 | Claims | Customer can create claim only for own policy | Authenticate as customer A; try to create claim with customer B's policyId; try with own policyId | Own policy → 201 claim created (draft); other's policy → 403 FORBIDDEN | API | Planned |
| TC-CLM-02 | Claims | Wizard validates each step, saves draft, resumes after logout, submits with unique number | Step through wizard; at step 2, log out; log back in → resume; continue; submit → claim number SIJ-2026-000123 format; double-submit → idempotent (no duplicate) | Each step validates; draft persisted; after re-login, draft data restored; submit gives unique claimNumber; second submit of same draft → no duplicate claim | E2E + API + component | Planned |
| TC-CLM-03 | Claims | Status transitions follow allowed rules only | Create claim; attempt transition DRAFT→PAID (invalid) → 409; valid path DRAFT→RECEIVED→UNDER_REVIEW→APPROVED→PAID; attempt PAID→UNDER_REVIEW → 409 | Invalid transitions return 409 CONFLICT with clear message; valid transitions succeed | API | Planned |
| TC-CLM-04 | Claims | Every status change writes history row + notification | Change status from RECEIVED to UNDER_REVIEW with comment; query ClaimStatusHistory + Notification for the customer | One history row with from/to/comment/changedBy/changedAt; one notification for the customer (titleJa/En, bodyJa/En, unread) | API | Planned |
| TC-DOC-01 | Documents | Upload allowed type ≤10MB via pre-signed URL, appears in claim | Request upload URL for a PDF within size; PUT to R2 URL; confirm; verify document in claim's document list | Upload succeeds; document record created with r2Key; appears in claim documents | API + E2E | Planned |
| TC-DOC-02 | Documents | Disallowed type, oversize, empty, spoofed extension rejected | Attempt upload: .exe, .html, file >10MB, empty file (0 bytes), PDF renamed to .exe (spoofed via magic bytes check) | upload-url issuance rejects bad type/size → 400; confirm rejects bad magic bytes → 400; empty file rejected; no document created for bad uploads | API | Planned |
| TC-DOC-03 | Documents | Customer cannot download another customer's file; signed URLs expire | Authenticate as customer A; request download URL for customer B's document; authenticate as B and request own → URL works; wait for expiry → 404 EXPIRED_URL | A → 403 FORBIDDEN; B → 302 to signed URL (short-lived); after expiry → 404/410 | API | Planned |
| TC-DOC-04 | Documents | Upload failure / network drop → retry, no orphan record | Simulate failure after upload-url issued but before confirm (network drop); retry confirm with same r2Key; verify no orphan (draft claim row not left in bad state) | Retry works; no orphan document record; claim stays in draft/consistent state | E2E + API | Planned |
| TC-TRK-01 | Claims | Tracking page shows timeline + admin comments in correct order + language | On claim detail, verify timeline entries ordered by date descending (most recent first) or ascending per design; admin comments visible; switch lang → comments show correct lang | Timeline ordered correctly; comments present with Ja/En per UI lang; dates shown in Tokyo time (UTC stored) | E2E | Planned |

### Admin

| ID | Module | Scenario | Steps | Expected Result | Type | Status |
|----|--------|----------|-------|-----------------|------|--------|
| TC-ADM-01 | Admin | Dashboard numbers match DB counts | Load /admin; for each KPI (totalCustomers, activeCustomers, totalPolicies, activePolicies, totalClaims, claimsByStatus, claimsByType, newCustomersThisMonth, newClaimsThisMonth) compare to direct DB counts | Each number equals the count from DB at that moment | E2E + API | Planned |
| TC-ADM-02 | Admin | Admin changes status + comment + requests documents; customer sees them | Admin sets claim status to MORE_DOCUMENTS_NEEDED with comment + requested doc types; customer views claim → sees new status, comment, request; customer uploads requested doc; admin sets APPROVED → PAID; customer sees final status + timeline | Status change reflected; comment visible to customer; requested doc types shown; customer can upload; final status PAID visible in timeline + dashboard badge | E2E | Planned |
| TC-ADM-03 | Admin | CRUD for products/news/FAQ works + reflected on public pages (cache revalidated) | Admin creates product → appears on /products; edits product → detail updated; deletes (soft) → hidden; same for news + FAQ; after each, public page shows change (within revalidate window) | CRUD creates/updates/hides records; public pages reflect changes after revalidation (immediate via revalidate endpoint or within ISR window) | E2E + API | Planned |
| TC-ADM-04 | Admin | Every admin action stored in audit log (user, time, target) | Admin performs: change claim status, add comment, request docs, create product, edit news, delete FAQ, change contact message status; query AuditLog | For each action: one AuditLog row with adminId, action, targetType, targetId, detailsJa/En, createdAt; all present and correct | API + E2E | Planned |

### End-to-End Journeys (Playwright)

| ID | Journey | Description | Viewports | Status |
|----|---------|-------------|-----------|--------|
| E2E-1 | Browse + contact | Visitor browses products, opens a detail page, switches language, opens FAQ, sends a contact message | 1440px + 375px | Planned |
| E2E-2 | Register → login → profile → logout | Visitor registers, verifies email (dev link), logs in, edits profile, changes password, logs out | 1440px | Planned |
| E2E-3 | Submit claim with documents + track | Customer submits a claim with 2 documents, sees it in dashboard, tracks it on detail page | 1440px + 375px | Planned |
| E2E-4 | Admin reviews claim end to end | Admin logs in, reviews the claim, requests extra document, customer uploads it, admin approves → Paid, customer sees final status | 1440px | Planned |
| E2E-5 | Mobile repeat | Repeat E2E-1 and E2E-3 at 375px | 375px | Planned |

### Accessibility

| ID | Scope | Scenario | Expected Result | Type | Status |
|----|-------|----------|-----------------|------|--------|
| TC-ACC-01 | All public pages + forms | Run axe on home, products, product detail, news, faq, contact, register, login, claim wizard, claim detail, dashboard, about, privacy, terms, solicitation, accessibility, glossary | Zero serious or critical violations; contrast ≥4.5:1; focus rings visible; form fields labelled; accordions/dialogs ARIA correct; skip-to-content link works; prefers-reduced-motion respected | axe (jest-axe + Playwright) | Planned |

### Security

| ID | Scenario | Expected Result | Type | Status |
|----|----------|-----------------|------|--------|
| TC-SEC-01 | Passwords hashed bcrypt cost 12; JWT secret from env; refresh cookie httpOnly secure sameSite strict | Verify in code + DB; no plain text passwords; no token in localStorage | Manual + unit | Planned |
| TC-SEC-02 | CSRF on cookie routes (refresh/logout) | State-changing cookie routes require CSRF token or sameSite strict + custom header; verify | Manual + automated | Planned |
| TC-SEC-03 | Input validated with zod everywhere; Prisma only (no raw SQL); output escaped; no stored XSS in descriptions/news/comments | Attempt inject `<script>` in claim description/news/comment → stored as text, not executed; API validates all inputs | Automated (API + E2E) | Planned |
| TC-SEC-04 | CORS limited to approved origins; helmet headers present | OPTIONS preflight only allowed for Vercel domains + localhost; helmet headers (content-security-policy, etc.) present | Automated (API) | Planned |
| TC-SEC-05 | Rate limits on auth, upload-URL, contact | Exceed limits → 429 with retry-after; documented limits | Automated (API) | Planned |
| TC-SEC-06 | Object-level authorisation for every owned resource | Customer cannot read/write another's policy/claim/document; admin can; verify each resource | Automated (API) | Planned |
| TC-SEC-07 | No secrets/stack traces/PII in logs or error responses; bank details masked | Error responses contain only stable code + translated message, no stack; logs no passwords/tokens/PII; bank account masked in responses | Manual + automated | Planned |

### Performance and Deployment

| ID | Scenario | Expected Result | Type | Status |
|----|----------|-----------------|------|--------|
| TC-PERF-01 | Lighthouse on home/products/product detail | ≥90 Performance, Accessibility, Best Practices, SEO | Lighthouse CI | Planned |
| TC-DEPLOY-01 | Smoke test after deploy | health 200; login works; product list returns 200; upload-url flow works; CORS allows Vercel origin; 403 for unknown origin | smoke-test.ts script | Planned |

## Edge Cases to Cover (in relevant tests)

- Cold-start delays from Render + Neon: retry + backoff in API client; UI "server waking up" state; `/health` used as readiness.
- Double-click on submit: idempotency key prevents duplicate claims.
- Two admins changing same claim: last-write-wins with history; concurrent status change handled (optimistic lock or last-wins with audit). Document choice.
- Very long Japanese text: rendered with proper wrapping; DB fields long enough (text).
- Full-width characters in numbers/postal codes: normalised/validated on input; postal code accepts "100-0001" and "1000001".
- Emoji in names: accept (Unicode), store fine.
- Expired session during upload: refresh token used; if refresh fails, upload aborts gracefully, no orphan.
- Timezone: store UTC; display Asia/Tokyo; claim dates shown in JST.
- Browser back button in wizard: still works (state in URL or DB); going back to a submitted claim → read-only view.

## Coverage Targets

- Unit: ≥85% of `packages/shared` + `apps/api/src/services` + `apps/api/src/utils`.
- API integration: 100% of endpoints have ≥1 success + ≥1 failure test.
- Component: all shared components listed in React structure have at least one test.
- E2E: all 5 journeys + locale journeys pass on staging before merge to prod branch.

## Test Data Management

- CI API tests: Postgres container (or Neon branch per PR if preferred). Fresh schema per run via `prisma migrate deploy` from a baseline; seed minimal data per test suite.
- E2E: run against a seeded staging environment (or spin up a fresh DB + seed before run). Use deterministic claim numbers (the seed creates some; new ones generated by the app with a sequence).
- Never use production data in tests. Use the fictional seed data only.

## Known Limitations / Out of Scope for Tests

- Email delivery in CI: use dev log link; do not test real email sending in CI (Resend in prod only).
- R2 signed URL expiry timing: test that expiry returns 404/410; exact expiry seconds not asserted.
- Lighthouse scores: assert ≥90; if a run is borderline, investigate rather than suppress.
- Playwright mobile: 375px viewport; real-device testing not in scope.
