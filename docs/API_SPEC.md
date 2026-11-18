# API Specification — `/api/v1`

All endpoints return a consistent JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "page": 1, "perPage": 20, "total": 42 }
}
```

Errors:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "messageJa": "入力内容に問題があります。",
    "messageEn": "There is a problem with the input.",
    "details": { ... }
  }
}
```

Stable error codes (frontend translates): `INVALID_INPUT`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `RATE_LIMIT`, `INTERNAL_ERROR`.

Base URL: `https://<render-app>.onrender.com/api/v1`

---

## Auth

| # | Method | Path | Auth | Role | Request Body | Success Response | Error Codes |
|---|--------|------|------|------|--------------|------------------|-------------|
| A1 | POST | /auth/register | — | — | `{ nameJa, nameEn, furigana?, email, password, phone?, postalCode?, prefecture?, city?, addressLine?, consentToTerms: true, consentToPrivacy: true }` | `{ user: { id, email, role }, messageJa, messageEn }` | INVALID_INPUT, DUPLICATE_EMAIL |
| A2 | POST | /auth/verify-email | — | — | `{ token }` | `{ messageJa, messageEn }` | NOT_FOUND, EXPIRED_TOKEN |
| A3 | POST | /auth/login | — | — | `{ email, password, rememberMe?: boolean }` | `{ user: { id, email, role, nameJa, nameEn }, accessToken, expiresIn }` + httpOnly refresh cookie | INVALID_INPUT, INVALID_CREDENTIALS, ACCOUNT_LOCKED |
| A4 | POST | /auth/refresh | refresh cookie | — | — | `{ accessToken, expiresIn }` | UNAUTHORIZED, REUSED_TOKEN |
| A5 | POST | /auth/logout | — | — | — | `{ messageJa, messageEn }` | — |
| A6 | POST | /auth/forgot-password | — | — | `{ email }` | `{ messageJa, messageEn }` (same response whether email exists or not) | INVALID_INPUT |
| A7 | POST | /auth/reset-password | — | — | `{ token, newPassword }` | `{ messageJa, messageEn }` | NOT_FOUND, EXPIRED_TOKEN, INVALID_INPUT |
| A8 | GET | /auth/me | Bearer | — | — | `{ user: { id, email, role, nameJa, nameEn, emailVerified } }` | UNAUTHORIZED |

Rate limit: A1, A3 (10/min per IP), A6 (3/min per email).

---

## Customers

| # | Method | Path | Auth | Role | Request Body | Success Response | Error Codes |
|---|--------|------|------|------|--------------|------------------|-------------|
| C1 | GET | /customers/me | Bearer | CUSTOMER | — | `{ profile: { id, nameJa, nameEn, furigana, phone, postalCode, prefecture, city, addressLine, bankName, bankBranch, bankAccountType, bankAccountNumberMasked }, createdAt }` | UNAUTHORIZED, NOT_FOUND |
| C2 | PATCH | /customers/me | Bearer | CUSTOMER | partial `CustomerProfileUpdateSchema` | `{ profile }` | INVALID_INPUT, UNAUTHORIZED |
| C3 | POST | /customers/me/password | Bearer | CUSTOMER | `{ currentPassword, newPassword }` | `{ messageJa, messageEn }` | INVALID_INPUT, CURRENT_PASSWORD_WRONG |

---

## Products

| # | Method | Path | Auth | Role | Query Params | Success Response | Error Codes |
|---|--------|------|------|------|-------------|------------------|-------------|
| P1 | GET | /products | — | — | `category?: string`, `search?: string`, `sort?: "name_asc"|"name_desc"|"newest"`, `page`, `perPage` | `{ products: [...], meta }` where each product has all bilingual fields + category name | — |
| P2 | GET | /products/slugs | — | — | — | `{ slugs: string[] }` | — |
| P3 | GET | /products/categories | — | — | — | `{ categories: [...] }` | — |
| P4 | GET | /products/:slug | — | — | — | `{ product: { ..., coverages: [...], faqItems: [...] } }` | NOT_FOUND |

---

## Policies

| # | Method | Path | Auth | Role | Success Response | Error Codes |
|---|--------|------|------|------|------------------|-------------|
| PO1 | GET | /policies | Bearer | CUSTOMER | `{ policies: [...], meta }` each with product summary + coverages | UNAUTHORIZED |
| PO2 | GET | /policies/:id | Bearer | CUSTOMER | `{ policy: { ... } }` | UNAUTHORIZED, NOT_FOUND, FORBIDDEN (wrong owner) |

---

## Claims

| # | Method | Path | Auth | Role | Request Body | Success Response | Error Codes |
|---|--------|------|------|------|------|------------------|-------------|
| CL1 | POST | /claims | Bearer | CUSTOMER | Step 1-2 partial data; full submit later | `{ claim: { id, claimNumber, status, isDraft } }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN (policy not owned), NOT_FOUND (policy) |
| CL2 | PATCH | /claims/:id | Bearer | CUSTOMER | partial claim fields | `{ claim }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN (not owner) |
| CL3 | POST | /claims/:id/submit | Bearer | CUSTOMER | — | `{ claim: { ..., isDraft: false, submittedAt, claimNumber } }` | CONFLICT (already submitted), UNAUTHORIZED, FORBIDDEN |
| CL4 | GET | /claims | Bearer | CUSTOMER | — | `{ claims: [...], meta }` filterable by status | UNAUTHORIZED |
| CL5 | GET | /claims/:id | Bearer | CUSTOMER | — | `{ claim: { ..., documents, statusHistory, comments } }` | UNAUTHORIZED, FORBIDDEN (not owner or admin only for some fields), NOT_FOUND |
| CL6 | GET | /claims/:id/timeline | Bearer | CUSTOMER | — | `{ timeline: [...], comments: [...] }` | UNAUTHORIZED, NOT_FOUND |
| CL7 | POST | /claims/:id/comments | Bearer | CUSTOMER, ADMIN | `{ commentJa, commentEn }` | `{ comment }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN (CUSTOMER can comment only on own claim), NOT_FOUND |

Status transition rules (enforced server-side): DRAFT→RECEIVED, RECEIVED→UNDER_REVIEW, UNDER_REVIEW→MORE_DOCUMENTS_NEEDED, MORE_DOCUMENTS_NEEDED→UNDER_REVIEW, UNDER_REVIEW→APPROVED, UNDER_REVIEW→REJECTED, APPROVED→PAID. All others → 409 CONFLICT.

---

## Documents

| # | Method | Path | Auth | Role | Request Body | Success Response | Error Codes |
|---|--------|------|------|------|------|------------------|-------------|
| D1 | POST | /documents/upload-url | Bearer | CUSTOMER, ADMIN | `{ claimId, fileName, fileType, fileSize }` | `{ uploadUrl, r2Key, expiresAt }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN (claim not owned), NOT_FOUND |
| D2 | POST | /documents/confirm | Bearer | CUSTOMER, ADMIN | `{ claimId, r2Key, fileNameJa, fileNameEn, fileType, fileSize, required, documentType? }` | `{ document }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| D3 | GET | /documents/claim/:claimId | Bearer | CUSTOMER, ADMIN | — | `{ documents: [...] }` | UNAUTHORIZED, FORBIDDEN (CUSTOMER sees only own claim docs), NOT_FOUND |
| D4 | GET | /documents/:id/download | Bearer | CUSTOMER (owner), ADMIN | — | 302 redirect to short-lived signed R2 URL (expires 15min) | UNAUTHORIZED, FORBIDDEN, NOT_FOUND, EXPIRED_URL |
| D5 | DELETE | /documents/:id | Bearer | CUSTOMER (owner), ADMIN | — | `{ messageJa, messageEn }` | UNAUTHORIZED, FORBIDDEN, NOT_FOUND |

File validation: type must be `application/pdf`, `image/jpeg`, `image/png`, `image/heic` (optional). Size ≤ 10 MB. Type checked on upload-url issuance and on confirm via magic bytes re-check server-side (R2 can be configured to verify, but we also re-validate).

---

## Public Content

| # | Method | Path | Auth | Role | Query Params | Success Response | Error Codes |
|---|--------|------|------|------|------|------------------|-------------|
| N1 | GET | /news | — | — | `page`, `perPage`, `category?` | `{ articles: [...], meta }` — pinned first | — |
| N2 | GET | /news/:slug | — | — | — | `{ article }` | NOT_FOUND |
| F1 | GET | /faq | — | — | `category?`, `search?`, `page`, `perPage` | `{ items: [...], categories, meta }` | — |
| F2 | POST | /contact | — | — | `{ nameJa, nameEn, email, topic, topicJa, topicEn, messageJa, messageEn, policyNumber?, isAccidentContact }` | `{ messageJa, messageEn, contactId }` | INVALID_INPUT, RATE_LIMIT |

Contact form rate limit: 5/min per IP, 20/hour per email.

---

## Admin

All admin endpoints require auth + role ADMIN. Frontend also guards routes; API is the authority.

| # | Method | Path | Auth | Role | Request Body | Success Response | Error Codes |
|---|--------|------|------|------|------|------------------|-------------|
| AD1 | GET | /admin/stats | Bearer | ADMIN | — | `{ stats: { totalCustomers, activeCustomers, totalPolicies, activePolicies, totalClaims, claimsByStatus: { DRAFT, RECEIVED, UNDER_REVIEW, MORE_DOCUMENTS_NEEDED, APPROVED, PAID, REJECTED }, claimsByType: { AUTO, FIRE_EARTHQUAKE, TRAVEL, MEDICAL, INJURY, OTHER }, newCustomersThisMonth, newClaimsThisMonth }, period?: { from, to } }` | UNAUTHORIZED, FORBIDDEN |
| AD2 | GET | /admin/claims | Bearer | ADMIN | `status?`, `type?`, `search?`, `page`, `perPage` | `{ claims: [...], meta }` (includes policy + customer summary) | UNAUTHORIZED, FORBIDDEN |
| AD3 | GET | /admin/claims/:id | Bearer | ADMIN | — | `{ claim: { ... full ... }, documents, statusHistory, comments }` | UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD4 | POST | /admin/claims/:id/status | Bearer | ADMIN | `{ toStatus, commentJa, commentEn }` | `{ claim: { ... }, historyEntry }` | INVALID_INPUT, CONFLICT (invalid transition), UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD5 | POST | /admin/claims/:id/request-documents | Bearer | ADMIN | `{ requiredDocumentTypes: string[] }` | `{ messageJa, messageEn, requestedTypes }` — creates CLAIM_COMMENT + sets status MORE_DOCUMENTS_NEEDED | UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD6 | GET | /admin/customers | Bearer | ADMIN | `search?`, `page`, `perPage` | `{ customers: [...], meta }` | UNAUTHORIZED, FORBIDDEN |
| AD7 | GET | /admin/customers/:id | Bearer | ADMIN | — | `{ customer: { profile, policies, recentClaims } }` | UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD8 | POST | /admin/products | Bearer | ADMIN | full ProductCreateSchema | `{ product }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN |
| AD9 | PATCH | /admin/products/:id | Bearer | ADMIN | partial ProductUpdateSchema | `{ product }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD10 | DELETE | /admin/products/:id | Bearer | ADMIN | — | `{ messageJa, messageEn }` (soft delete: isActive=false) | UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD11 | POST | /admin/news | Bearer | ADMIN | full NewsArticleCreateSchema | `{ article }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN |
| AD12 | PATCH | /admin/news/:id | Bearer | ADMIN | partial NewsArticleUpdateSchema | `{ article }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD13 | DELETE | /admin/news/:id | Bearer | ADMIN | — | `{ messageJa, messageEn }` (soft delete) | UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD14 | POST | /admin/faq | Bearer | ADMIN | full FaqItemCreateSchema | `{ item }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN |
| AD15 | PATCH | /admin/faq/:id | Bearer | ADMIN | partial FaqItemUpdateSchema | `{ item }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD16 | DELETE | /admin/faq/:id | Bearer | ADMIN | — | `{ messageJa, messageEn }` (soft delete: isPublished=false) | UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD17 | GET | /admin/contact-messages | Bearer | ADMIN | `status?`, `page`, `perPage` | `{ messages: [...], meta }` | UNAUTHORIZED, FORBIDDEN |
| AD18 | PATCH | /admin/contact-messages/:id | Bearer | ADMIN | `{ status }` | `{ message }` | INVALID_INPUT, UNAUTHORIZED, FORBIDDEN, NOT_FOUND |
| AD19 | GET | /admin/audit-log | Bearer | ADMIN | `action?`, `targetType?`, `targetId?`, `page`, `perPage` | `{ entries: [...], meta }` | UNAUTHORIZED, FORBIDDEN |
| AD20 | POST | /admin/news/revalidate | Bearer | ADMIN | — | `{ revalidated: true }` (triggers Next.js revalidateTag on news+faq) | UNAUTHORIZED, FORBIDDEN |

---

## System

| # | Method | Path | Auth | Role | Success Response |
|---|--------|------|------|------|------------------|
| S1 | GET | /health | — | — | `{ status: "ok", timestamp, uptime }` |

---

## Pagination

All list endpoints accept `page` (default 1) and `perPage` (default 20, max 100). Response includes `meta: { page, perPage, total, totalPages }`.

## CORS

Allowed origins: Vercel production domain + preview domains + `http://localhost:3000`. Configured via env `CORS_ORIGINS` (comma-separated). Reflected only on preflight; no credentials on public endpoints.

## OpenAPI

An OpenAPI 3.1 spec is generated from the zod schemas and route metadata, saved to `docs/openapi.json` and served at `/api/v1/openapi.json` (admin-only or public depending on policy — public read-only is fine). Used to generate TS types for the frontend API client.
