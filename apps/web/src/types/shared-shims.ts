// Web-side typed shims for shared API types that are not yet exported from
// `@sample-insurance/shared`. These exist only so the current frontend code
// compiles during the Phase 2 build-debugging pass. They intentionally mirror the
// fields the UI accesses today; when the web↔API wiring phase lands, these
// shims should be replaced by the real shared types exported from
// `@sample-insurance/shared` (or by the API contract types).
//
// These are intentionally loose where backends return inconsistent shapes so the
// build can complete; do not treat them as the final API contract.

export interface AuditLogEntry {
  id: string;
  action: string;
  adminId: string;
  targetType?: string | null;
  targetId?: string | null;
  detailsJa?: string | null;
  detailsEn?: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  nameJa: string;
  nameEn: string;
  slug?: string | null;
}

export interface CoverageDraft {
  coverageId: string;
  termYears: number;
  amount: number;
}

export interface ClaimSummary {
  id: string;
  // API list/queue shapes use different keys for the claim number; accept both.
  claimNumber?: string | null;
  number?: string | null;
  status: string;
  // API list/queue shapes use different keys for the claim type; accept both.
  claimType?: string | null;
  type?: string | null;
  customerName?: string | null;
  customerNameJa?: string | null;
  customerNameEn?: string | null;
  customerId?: string | null;
  policyNumber?: string | null;
  estimatedAmount?: number | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  lastActivityAt?: string | null;
  summary?: string | null;
  description?: string | null;
  descriptionJa?: string | null;
  descriptionEn?: string | null;
  address?: string | null;
  assignedTo?: string | null;
  // Fields present on the claim detail API response but absent on the queue/summary
  // shapes; keep optional so both remain assignable to `ClaimSummary`.
  occurredAt?: string | null;
  notesJa?: string | null;
  notesEn?: string | null;
  injuredPeople?: number | null;
  propertyDamageEstimateYen?: number | null;
  policeReported?: boolean | null;
  otherPartyNameJa?: string | null;
  otherPartyNameEn?: string | null;
  otherPartyPhone?: string | null;
  otherPartyPolicyNumber?: string | null;
  accidentLocationJa?: string | null;
  accidentLocationEn?: string | null;
  estimatedPayoutYen?: number | null;
  payoutAt?: string | null;
  documents?: Array<{
    id: string;
    fileName?: string | null;
    fileNameJa?: string | null;
    fileNameEn?: string | null;
    mimeType?: string | null;
    sizeBytes?: number | null;
    purpose?: string | null;
    storageKey?: string | null;
    status?: string | null;
    uploadedAt?: string | null;
  }> | null;
  statusHistory?: Array<{
    id: string;
    fromStatus?: string | null;
    toStatus?: string | null;
    changedBy?: string | null;
    commentJa?: string | null;
    commentEn?: string | null;
    createdAt?: string | null;
  }> | null;
  comments?: Array<{
    id: string;
    authorId?: string | null;
    authorNameJa?: string | null;
    authorNameEn?: string | null;
    commentJa?: string | null;
    commentEn?: string | null;
    createdAt?: string | null;
  }> | null;
}

export interface ClaimWithCustomer extends ClaimSummary {
  customer?: ClaimCustomer;
}

// Accepted customer shapes across claim/policy detail pages so both the admin-ish
// summary customer object and the detail-page customer object are assignable.
export interface ClaimCustomer {
  id: string;
  name?: string | null;
  nameJa?: string | null;
  nameEn?: string | null;
  email: string;
  phone?: string | null;
}

export interface CustomerSummary {
  id: string;
  // Admin customer list reads nameJa/nameEn; older shapes use `name`.
  name?: string | null;
  nameJa?: string | null;
  nameEn?: string | null;
  email: string;
  status: string;
  phone?: string | null;
  role: string;
  emailVerified?: boolean | null;
  createdAt?: string | null;
  policyCount?: number | null;
  claimCount?: number | null;
}

export interface Notification {
  id: string;
  type: string;
  titleJa?: string | null;
  titleEn?: string | null;
  messageJa?: string | null;
  messageEn?: string | null;
  bodyJa?: string | null;
  bodyEn?: string | null;
  read: boolean;
  createdAt: string;
  link?: string | null;
}

export interface PolicyWithCustomer {
  id: string;
  // The policy detail page's API uses policyNumber; older shapes use `number`.
  policyNumber?: string | null;
  number?: string | null;
  status: string;
  // The policy detail page's API uses `product.name*` for the product title; older
  // shapes use `productName*`.
  product?: { id: string; nameJa?: string | null; nameEn?: string | null } | null;
  productNameJa?: string | null;
  productNameEn?: string | null;
  policyType?: string | null;
  customerId?: string | null;
  customerName?: string | null;
  coverageAmount?: number | null;
  monthlyPremium?: number | null;
  totalPremiumYen?: number | null;
  annualPremiumYen?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  nextPaymentDate?: string | null;
  paymentMethod?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  // Fields present on the policy detail API response; kept optional so the response
  // is assignable to `PolicyWithCustomer`.
  paymentCycle?: string | null;
  termMonths?: number | null;
  coverages?: Array<{
    id: string;
    description?: string | null;
    descriptionJa?: string | null;
    descriptionEn?: string | null;
    amount: number;
    coverage?: {
      id: string;
      nameJa?: string | null;
      nameEn?: string | null;
      maxAmountYen?: number | null;
    } | null;
    termYears?: number | null;
  }> | null;
  category?: { id: string; nameJa: string; nameEn: string; slug?: string | null } | null;
  customer?: {
    id: string;
    name?: string | null;
    nameJa?: string | null;
    nameEn?: string | null;
    email: string;
    phone?: string | null;
  } | null;
  [k: string]: unknown;
}

export interface FaqItem {
  id: string;
  questionJa: string;
  questionEn?: string | null;
  answerJa: string;
  answerEn?: string | null;
  category?: string | null;
  order?: number | null;
  published?: boolean | null;
  [k: string]: unknown;
}

export interface NewsItem {
  id: string;
  titleJa: string;
  titleEn?: string | null;
  slug?: string | null;
  summaryJa?: string | null;
  summaryEn?: string | null;
  bodyJa?: string | null;
  bodyEn?: string | null;
  publishedAt?: string | null;
  thumbnailUrl?: string | null;
  imageUrl?: string | null;

  // Fields used by the news detail page; present on detail responses, absent on
  // list/search responses. Keep optional so both shapes satisfy NewsItem.
  body?: unknown;
  author?: {
    id?: string | null;
    nameJa?: string | null;
    nameEn?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
  } | null;
  publishDate?: string | null;
  imageUrlJa?: string | null;
  imageUrlEn?: string | null;
  categoryId?: string | null;
  createdAt?: string | null;
  viewCount?: number | null;

  // `category` is read both as a plain label (list/home card badges) and as a
  // category object (news detail). Accept either shape so list/search and detail
  // responses both satisfy NewsItem.
  category?:
    | string
    | null
    | { id: string; nameJa: string; nameEn: string; slug: string };
  [k: string]: unknown;
}

export interface NewsSearchResult {
  items: NewsItem[];
  pageSize?: number | null;
  page?: number | null;
  totalItems?: number | null;
  totalPages?: number | null;
}

export interface Product {
  id: string;
  nameJa: string;
  nameEn?: string | null;
  descriptionJa?: string | null;
  descriptionEn?: string | null;
  category?:
    | string
    | null
    | { id: string; nameJa: string; nameEn: string; slug: string };
  coverageSummaryJa?: string | null;
  coverageSummaryEn?: string | null;
  taglineJa?: string | null;
  taglineEn?: string | null;
  // These may arrive as a single string block OR as an array, depending on the
  // endpoint/version. Accept both so the product page (which fetches the real API
  // shape) is assignable to `Product`.
  highlightsJa?: string | string[] | null;
  highlightsEn?: string | string[] | null;
  exclusionsJa?: string | string[] | null;
  exclusionsEn?: string | string[] | null;
  faqJa?:
    | { question: string; answer: string }
    | Array<{ question: string; answer: string }>
    | null;
  faqEn?:
    | { question: string; answer: string }
    | Array<{ question: string; answer: string }>
    | null;
  basePremiumYen?: number | null;
  status?: string | null;
  coverages?: Array<{
    id: string;
    description?: string | null;
    descriptionJa?: string | null;
    descriptionEn?: string | null;
    amount: number;
    coverage?: {
      id: string;
      nameJa?: string | null;
      nameEn?: string | null;
      descriptionJa?: string | null;
      descriptionEn?: string | null;
      maxAmountYen?: number | null;
    } | null;
    termYears?: number | null;
    notesJa?: string | null;
    notesEn?: string | null;
  }> | null;
  updatedAt?: string | null;
  supportedYears?: string[] | null;
  slug?: string | null;
  priceFrom?: number | null;
  badge?: string | null;
  imageUrl?: string | null;
  featuresJa?: string[] | null;
  featuresEn?: string[] | null;
  popular?: boolean | null;
  relatedProductIds?: string[] | null;
  documentUrls?: Array<{ urlJa: string; urlEn: string }> | null;
  images?: Array<{ urlJa?: string | null; urlEn?: string | null }> | null;
  paymentCycles?: string[] | null;
  enabledForCustomers?: boolean | null;
  categoryId?: string | null;
  description?: string | null;
  highlights?: string | null;
  exclusions?: string | null;
  faq?: unknown;
  contentJa?: string | null;
  contentEn?: string | null;
  [k: string]: unknown;
}
