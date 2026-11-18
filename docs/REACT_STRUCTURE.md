# Next.js Component Structure

## App Router Tree

```
apps/web/src/app/
├── layout.tsx                    # root: html lang, font, providers (AuthContext, LanguageContext),
│                                  #   Header (skip-link first), Footer
├── page.tsx                      # redirect to / (home under (public))
├── globals.css                   # Tailwind + theme tokens (colors, radii, spacing, fonts)
│
├── (public)/                     # public routes, no auth needed
│   ├── layout.tsx                # public layout: header, footer, SEO metadata base
│   ├── page.tsx                  # HOME — hero, news strip, fraud banner, product cards,
│   │                              #   how-a-claim-works steps, trust numbers, FAQ preview, contact block
│   │
│   ├── products/
│   │   ├── page.tsx              # product grid — filters, search, sort, cards, legal notice block
│   │   └── [slug]/
│   │       └── page.tsx          # product detail — overview, who-for, coverage table, riders,
│   │                              #   exclusions, example premium, how-to-claim, related FAQ, CTAs, SEO
│   │
│   ├── about/
│   │   └── page.tsx              # company message, mission, history timeline, numbers, offices,
│   │                              #   governance, policies
│   │
│   ├── news/
│   │   ├── page.tsx              # news list — category tags, pagination, pinned first
│   │   └── [slug]/
│   │       └── page.tsx          # news detail
│   │
│   ├── faq/
│   │   └── page.tsx              # search box, category tabs, accordion, helpful feedback,
│   │                              #   link to contact when no answer
│   │
│   ├── contact/
│   │   └── page.tsx              # two blocks: accident contact (24h number + wizard link),
│   │                              #   general enquiry form (saved to DB), complaint desk info
│   │
│   ├── claim/
│   │   └── page.tsx              # "Report an accident" landing — 24h number, link to wizard
│   │
│   ├── glossary/
│   │   └── page.tsx              # insurance word glossary (Ja + En)
│   │
│   ├── privacy/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   ├── solicitation/
│   │   └── page.tsx
│   ├── accessibility/
│   │   └── page.tsx
│   ├── sitemap/
│   │   └── page.tsx
│   │
│   └── error/
│       ├── 404.tsx
│       └── 500.tsx
│
├── (auth)/                       # auth routes
│   ├── layout.tsx                # slim layout: no footer hero, just header + content
│   ├── register/
│   │   └── page.tsx              # registration form — name, furigana, email, password (strength meter),
│   │                              #   phone, birth date, postal+address, consent checkboxes, zod validation,
│   │                              #   duplicate-email handling, email verification dev link
│   │
│   ├── login/
│   │   └── page.tsx              # email+password, remember me, forgot link, redirect-back,
│   │                              #   admin → /admin after login
│   │
│   └── verify-email/
│       └── page.tsx              # verification success/failed notice
│
├── (customer)/                   # protected customer area
│   ├── layout.tsx                # customer shell: header + dashboard nav + content
│   ├── dashboard/
│   │   └── page.tsx              # greeting, my policies, my claims with status badges,
│   │                              #   quick actions, profile edit link, change password link,
│   │                              #   notification list — protected route
│   │
│   ├── profile/
│   │   └── edit/
│   │       └── page.tsx          # edit profile form
│   │
│   ├── claims/
│   │   ├── page.tsx              # claim list with filters (status, type), link to new claim
│   │   ├── new/
│   │   │   └── page.tsx          # CLAIM WIZARD — 5 steps:
│   │   │                          #   (1) choose policy + claim type
│   │   │                          #   (2) accident date, place, description
│   │   │                          #   (3) amount estimate + bank details (masked input)
│   │   │                          #   (4) document upload with drag-drop, progress, preview, delete
│   │   │                          #   (5) review + submit → claim number SIJ-2026-000123
│   │   │                          #   draft save/resume, back-button handling, double-submit guard
│   │   └── [id]/
│   │       ├── page.tsx          # claim detail: status timeline, admin comments, document list,
│   │       │                      #   upload requested docs button, status badge
│   │       └── upload/           # (optional route for document-only upload)
│   │
│   └── notifications/
│       └── page.tsx              # notification list with read/unread
│
├── (admin)/                      # admin back office
│   ├── layout.tsx                # admin shell: sidebar nav + header + content
│   ├── page.tsx                  # admin dashboard: KPI cards + charts (claims by status, by type,
│   │                              #   per month), quick links
│   │
│   ├── claims/
│   │   ├── page.tsx              # claims list — search, filter by status/type, pagination
│   │   └── [id]/
│   │       └── page.tsx          # claim detail: full view, change status, add comment,
│   │                              #   request documents, view/download files, customer+policy summary
│   │
│   ├── customers/
│   │   ├── page.tsx              # customer list — search, pagination
│   │   └── [id]/
│   │       └── page.tsx          # customer detail: profile, policies, recent claims
│   │
│   ├── products/
│   │   ├── page.tsx              # product list + CRUD buttons
│   │   ├── new/
│   │   │   └── page.tsx          # create product form
│   │   └── [id]/
│   │       └── page.tsx          # edit product form
│   │
│   ├── news/
│   │   ├── page.tsx              # news list + CRUD
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── faq/
│   │   ├── page.tsx              # FAQ list + CRUD
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── contact-messages/
│   │   └── page.tsx              # contact message list + status change
│   │
│   └── audit-log/
│       └── page.tsx              # audit log table with filters
│
└── api/                          # (optional) Next.js route handlers for proxying revalidate
    └── revalidate/...
```

## Route Groups Summary

| Group | Purpose |
|-------|---------|
| `(public)` | Marketing site, no auth. ISR-enabled. |
| `(auth)` | Login/register flows. Slim layout. |
| `(customer)` | Protected by auth middleware + role CUSTOMER. |
| `(admin)` | Protected by auth + role ADMIN. |

## Server vs Client Components

- **Server components (default):** pages that fetch data (home, product list/detail, news, FAQ, admin list pages). Fetch directly from API or via React Server Components fetch with `next: { revalidate }`.
- **Client components:** interactive pieces — Header (lang toggle, menu), LanguageToggle, MegaMenu, AccidentButton (floating), Hero (CTA clicks), ProductCard (hover), ClaimWizard, FileUploader, StatusTimeline (interactive), FaqAccordion, DataTable (sort/filter/paginate), StatCard (charts when animated), auth forms (react-hook-form + zod), language toggle, toast notifications.
- **Boundary:** Keep server components fetching data and passing serializable props; client components handle interactivity. Use `"use client"` only where needed.

## Shared UI Components

| Component | Responsibility |
|-----------|----------------|
| `Header` | Two-row header: utility row (News, Contact, LanguageToggle, Login), main nav (Policyholders, Personal Insurance, Corporate, Company, Careers). Sticky. Mobile slide-in menu. |
| `LanguageToggle` | JA/EN switch, saves to localStorage + cookie, no flash (middleware reads cookie first). |
| `MegaMenu` | Desktop mega-menu for main nav categories. |
| `Footer` | Group links, policy pages, social links, demo notice. |
| `AccidentButton` | Floating red/coral button "事故のご連絡 / Report an accident" on every page → claim wizard landing. |
| `Hero` | Hero with 3 big actions (Report accident, Find insurance, Check my claim). |
| `ProductCard` | Card with icon, name (Ja+En), short description, price hint, "See details" → slug. |
| `ClaimWizard` | Multi-step wizard with Stepper, step validation, draft save, resume, review. |
| `FileUploader` | Drag-drop, multiple files, progress bar, type/size validation, preview, delete-before-submit, pre-signed upload to R2. |
| `StatusTimeline` | Vertical timeline of claim statuses with labels, dates, comments. |
| `FaqAccordion` | Accordion by category, keyboard accessible, "Was this helpful?" button. |
| `DataTable` | Sortable, filterable, paginated table (admin lists). |
| `StatCard` | KPI card with number + label + optional trend/icon. |
| `Stepper` | Step indicator for wizards. |
| `Skeleton` | Loading skeleton variants for cards, list, detail. |
| `EmptyState` | Friendly empty state with illustration + action. |
| `ErrorState` | Error with retry button. |
| `Badge` | Status badges (claim statuses) with color coding. |
| `Toast` | Success/error/loading feedback via sonner or shadcn toast. |

## Hooks

| Hook | Responsibility |
|------|----------------|
| `useAuth` | current user, login, logout, register, token refresh, isLoading, role |
| `useApi` | typed fetch wrapper with base URL, auth header injection, error parsing (code→message translation), retry for cold start |
| `useLanguage` | current locale, toggle, t() translator, persist |
| `useClaimWizard` | wizard state machine (step, draft, validation, resume, submit) |
| `useFileUpload` | upload queue, progress, pre-signed URL flow, R2 confirm |
| `useMobileMenu` | mobile slide-in menu open/close |
| `useScrollLock` | body scroll lock for dialogs/sheets |

## API Client

`apps/web/src/lib/api.ts` — typed client generated/aligned with OpenAPI spec:

- Base URL from `NEXT_PUBLIC_API_BASE_URL` env (Render URL in prod, localhost in dev).
- `get<T>(path, params?)`, `post<T>(path, body?)`, `patch<T>(path, body?)`, `del<T>(path)`.
- Injects `Authorization: Bearer <accessToken>` from auth context (access token stored in memory, not localStorage for XSS safety; refresh token in httpOnly cookie set by API).
- On 401 with expired access token, silent refresh via `/auth/refresh`; if refresh fails, logout + redirect to login with return URL.
- Retry with exponential backoff on 503 / connection errors (Render cold start).
- Parses envelope: throws typed API error with `code` so UI can translate.

## i18n Setup

- `next-intl` with `ja` and `en` locales.
- Locale files: `apps/web/i18n/ja.json`, `apps/web/i18n/en.json`.
- Middleware (`middleware.ts`) reads `ui_lang` cookie + `Accept-Language` + localStorage fallback; sets `lang` cookie; rewrites to locale path or keeps default.
- `<html lang>` set per locale; `hreflang` meta tags on public pages.
- Date formatting: `ja` → `2026年11月14日`, `en` → `November 14, 2026`.
- Currency: `¥1,200,000` with thousands separators.
- Furigana toggle (bonus): a client setting that wraps kanji above N4 with `<ruby>` if `furigana: true`.

## Auth Context + Middleware

- `AuthContext` (client): holds `user`, `isLoading`, `login`, `logout`, `register`. Access token kept in memory; refresh cookie handled by browser.
- `middleware.ts`:
  - Read `ui_lang` cookie → set `lang` cookie; no flash.
  - If path is `(customer)` or `(admin)` and not authenticated → redirect to `/login?returnTo=...`.
  - If path is `/admin/*` and user is CUSTOMER → redirect to `/dashboard` with 403 notice.
  - Public routes always accessible.
- Route protection also enforced on API (authority).

## Form + Validation Pattern

- `react-hook-form` + `zod` via `zodResolver`.
- Shared zod schemas in `packages/shared` (single source of truth with API).
- Form errors translated via `t()` using error code from API.
- Server actions / API calls on submit; optimistic UI where safe.
- Password strength meter (client-side, visual only; real policy is server zod).
- Consent checkboxes required before submit.

## Media / Assets

- `next/image` for all images; illustrations as optimized SVGs under `public/`.
- Icons: lucide-react.
- Fonts: Noto Sans JP (Japanese) + Inter (English/Latin), subset and preload. Set via `next/font`.
