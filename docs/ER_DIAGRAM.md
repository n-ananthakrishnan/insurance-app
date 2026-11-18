# Database Design

## ER Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ CUSTOMER_PROFILE : "has"
    USER ||--o{ REFRESH_TOKEN : "owns"
    USER ||--o{ PASSWORD_RESET_TOKEN : "owns"
    USER ||--o{ POLICY : "customer owns"
    USER ||--o{ CLAIM : "submitted"
    USER ||--o{ NOTIFICATION : "received"
    USER ||--o{ AUDIT_LOG : "admin actor"

    CUSTOMER_PROFILE ||--o{ POLICY : "profile has policies"
    CUSTOMER_PROFILE }|--|| USER : "belongs to"

    POLICY ||--o{ CLAIM : "generates"
    POLICY ||--o{ POLICY_COVERAGE : "covers"
    POLICY ||--|| PRODUCT : "based on"

    PRODUCT }|--|| PRODUCT_CATEGORY : "belongs to"
    PRODUCT ||--o{ PRODUCT_COVERAGE : "has"

    CLAIM ||--o{ CLAIM_DOCUMENT : "has documents"
    CLAIM ||--o{ CLAIM_STATUS_HISTORY : "status changes"
    CLAIM ||--o{ CLAIM_COMMENT : "has comments"

    NEWS_ARTICLE ||--|| NEWS_CATEGORY : "tagged"
    FAQ_ITEM ||--|| FAQ_CATEGORY : "belongs to"

    CONTACT_MESSAGE ||--|| USER : "optional sender"

    NOTIFICATION ||--|| USER : "for"

    AUDIT_LOG ||--|| USER : "performed by"

    USER {
        String id PK
        String email UK
        String passwordHash
        Role role
        Boolean emailVerified
        DateTime emailVerifiedAt
        DateTime lockedUntil
        DateTime createdAt
        DateTime updatedAt
        Boolean deleted
    }

    CUSTOMER_PROFILE {
        String id PK
        String userId UK FK
        String nameJa
        String nameEn
        String furigana
        String phone
        String postalCode
        String prefecture
        String city
        String addressLine
        String bankName
        String bankBranch
        String bankAccountType
        String bankAccountNumberMasked
        DateTime createdAt
        DateTime updatedAt
        Boolean deleted
    }

    REFRESH_TOKEN {
        String id PK
        String userId FK
        String token UK
        DateTime expiresAt
        DateTime createdAt
        Boolean revoked
    }

    PASSWORD_RESET_TOKEN {
        String id PK
        String userId FK
        String token UK
        DateTime expiresAt
        DateTime createdAt
        Boolean used
    }

    PRODUCT_CATEGORY {
        String id PK
        String slug UK
        String nameJa
        String nameEn
        String descriptionJa
        String descriptionEn
        String icon
        DateTime createdAt
    }

    PRODUCT {
        String id PK
        String categoryId FK
        String slug UK
        String nameJa
        String nameEn
        String taglineJa
        String taglineEn
        String descriptionJa
        String descriptionEn
        String whoForJa
        String whoForEn
        String coverageListJa
        String coverageListEn
        String riderListJa
        String riderListEn
        String exclusionJa
        String exclusionEn
        String claimHowToJa
        String claimHowToEn
        String priceHintJa
        String priceHintEn
        String examplePremiumJa
        String examplePremiumEn
        String brochureUrl
        Boolean isActive
        DateTime createdAt
        DateTime updatedAt
    }

    PRODUCT_COVERAGE {
        String id PK
        String productId FK
        String labelJa
        String labelEn
        String detailJa
        String detailEn
        Int coverageOrder
    }

    POLICY {
        String id PK
        String customerId FK
        String productId FK
        String policyNumber UK
        PolicyStatus status
        Decimal premium
        String planNameJa
        String planNameEn
        DateTime effectiveDate
        DateTime expiryDate
        DateTime createdAt
        Boolean deleted
    }

    POLICY_COVERAGE {
        String id PK
        String policyId FK
        String coverageId FK
        String labelJa
        String labelEn
    }

    CLAIM {
        String id PK
        String policyId FK
        String claimNumber UK
        ClaimType claimType
        ClaimStatus status
        DateTime accidentDate
        String accidentPlaceJa
        String accidentPlaceEn
        String descriptionJa
        String descriptionEn
        Decimal estimatedAmount
        String bankNameMasked
        String bankBranchMasked
        String bankAccountType
        String bankAccountNumberMasked
        Boolean isDraft
        String submittedById FK
        DateTime submittedAt
        DateTime createdAt
        DateTime updatedAt
    }

    CLAIM_DOCUMENT {
        String id PK
        String claimId FK
        String fileNameJa
        String fileNameEn
        String fileType
        String fileSize
        String r2Key
        String uploadedById FK
        DateTime uploadedAt
        Boolean required
        String documentType
        Boolean deleted
    }

    CLAIM_STATUS_HISTORY {
        String id PK
        String claimId FK
        ClaimStatus fromStatus
        ClaimStatus toStatus
        String commentJa
        String commentEn
        String changedById FK
        DateTime changedAt
    }

    CLAIM_COMMENT {
        String id PK
        String claimId FK
        String commentJa
        String commentEn
        String authorId FK
        String authorRole
        DateTime createdAt
    }

    NEWS_CATEGORY {
        String id PK
        String slug UK
        String nameJa
        String nameEn
    }

    NEWS_ARTICLE {
        String id PK
        String categoryId FK
        String slug UK
        String titleJa
        String titleEn
        String summaryJa
        String summaryEn
        String bodyJa
        String bodyEn
        String category
        Boolean isPinned
        DateTime publishedAt
        DateTime createdAt
        DateTime updatedAt
        Boolean deleted
    }

    FAQ_CATEGORY {
        String id PK
        String slug UK
        String nameJa
        String nameEn
        Int displayOrder
    }

    FAQ_ITEM {
        String id PK
        String categoryId FK
        String questionJa
        String questionEn
        String answerJa
        String answerEn
        Int helpfulCount
        Boolean isPublished
        DateTime createdAt
        DateTime updatedAt
    }

    CONTACT_MESSAGE {
        String id PK
        String userId FK
        String nameJa
        String nameEn
        String email
        String topic
        String topicJa
        String topicEn
        String messageJa
        String messageEn
        String policyNumber
        Boolean isAccidentContact
        String status
        DateTime createdAt
        DateTime updatedAt
    }

    NOTIFICATION {
        String id PK
        String userId FK
        String titleJa
        String titleEn
        String bodyJa
        String bodyEn
        String type
        Boolean read
        DateTime createdAt
    }

    AUDIT_LOG {
        String id PK
        String adminId FK
        String action
        String targetType
        String targetId
        String detailsJa
        String detailsEn
        DateTime createdAt
    }
```

## Prisma Schema (`apps/api/prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ---------- Enums ----------

enum Role {
  CUSTOMER
  ADMIN
}

enum ClaimStatus {
  DRAFT
  RECEIVED
  UNDER_REVIEW
  MORE_DOCUMENTS_NEEDED
  APPROVED
  PAID
  REJECTED
}

enum ClaimType {
  AUTO
  FIRE_EARTHQUAKE
  TRAVEL
  MEDICAL
  INJURY
  OTHER
}

enum PolicyStatus {
  ACTIVE
  EXPIRED
  CANCELLED
}

// ---------- Tables ----------

model User {
  id              String             @id @default(uuid())
  email           String             @unique
  passwordHash    String
  role            Role               @default(CUSTOMER)
  emailVerified   Boolean            @default(false)
  emailVerifiedAt DateTime?
  lockedUntil     DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  deleted         Boolean            @default(false)

  customerProfile    CustomerProfile?
  refreshTokens      RefreshToken[]
  passwordResetTokens PasswordResetToken[]
  policies           Policy[]         @relation("customerPolicies")
  claims             Claim[]          @relation("submittedBy")
  notifications      Notification[]
  auditLogs          AuditLog[]       @relation("adminActor")
  contactMessages    ContactMessage[]

  @@map("users")
}

model CustomerProfile {
  id              String   @id @default(uuid())
  userId          String   @unique @map("user_id")
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  nameJa          String   @map("name_ja")
  nameEn          String   @map("name_en")
  furigana        String?  @map("furigana")
  phone           String?
  postalCode      String?
  prefecture      String?
  city            String?
  addressLine     String?

  bankName              String?  @map("bank_name")
  bankBranch            String?  @map("bank_branch")
  bankAccountType       String?  @map("bank_account_type")
  bankAccountNumberMasked String? @map("bank_account_number_masked")

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  deleted         Boolean  @default(false)

  policies Policy[] @relation("profilePolicies")

  @@map("customer_profiles")
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  revoked   Boolean  @default(false)

  @@index([userId])
  @@map("refresh_tokens")
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  used      Boolean  @default(false)

  @@map("password_reset_tokens")
}

model ProductCategory {
  id          String @id @default(uuid())
  slug        String @unique
  nameJa      String @map("name_ja")
  nameEn      String @map("name_en")
  descriptionJa String @map("description_ja")
  descriptionEn String @map("description_en")
  icon        String?
  createdAt   DateTime @default(now())

  products Product[]

  @@map("product_categories")
}

model Product {
  id              String  @id @default(uuid())
  categoryId      String  @map("category_id")
  category        ProductCategory @relation(fields: [categoryId], references: [id])
  slug            String  @unique
  nameJa          String  @map("name_ja")
  nameEn          String  @map("name_en")
  taglineJa       String  @map("tagline_ja")
  taglineEn       String  @map("tagline_en")
  descriptionJa   String  @map("description_ja")
  descriptionEn   String  @map("description_en")
  whoForJa        String  @map("who_for_ja")
  whoForEn        String  @map("who_for_en")
  coverageListJa  String  @map("coverage_list_ja")
  coverageListEn  String  @map("coverage_list_en")
  riderListJa     String? @map("rider_list_ja")
  riderListEn     String? @map("rider_list_en")
  exclusionJa     String  @map("exclusion_ja")
  exclusionEn     String  @map("exclusion_en")
  claimHowToJa    String  @map("claim_how_to_ja")
  claimHowToEn    String  @map("claim_how_to_en")
  priceHintJa     String? @map("price_hint_ja")
  priceHintEn     String? @map("price_hint_en")
  examplePremiumJa String? @map("example_premium_ja")
  examplePremiumEn String? @map("example_premium_en")
  brochureUrl     String?
  isActive        Boolean @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  coverages  ProductCoverage[]
  policies   Policy[]
  claimHowToDocs ClaimHowToDoc[]

  @@index([categoryId])
  @@map("products")
}

model ProductCoverage {
  id          String @id @default(uuid())
  productId   String  @map("product_id")
  product     Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  labelJa     String  @map("label_ja")
  labelEn     String  @map("label_en")
  detailJa    String  @map("detail_ja")
  detailEn    String  @map("detail_en")
  coverageOrder Int   @default(0)

  @@index([productId])
  @@map("product_coverages")
}

model Policy {
  id            String        @id @default(uuid())
  customerId    String        @map("customer_id")
  customer      User          @relation("customerPolicies", fields: [customerId], references: [id], onDelete: Cascade)
  productId     String        @map("product_id")
  product       Product       @relation(fields: [productId], references: [id])
  policyNumber  String        @unique @map("policy_number")
  status        PolicyStatus  @default(ACTIVE)
  premium       Decimal       @db.Decimal(10, 2)
  planNameJa    String        @map("plan_name_ja")
  planNameEn    String        @map("plan_name_en")
  effectiveDate DateTime      @map("effective_date")
  expiryDate    DateTime      @map("expiry_date")
  createdAt     DateTime      @default(now())
  deleted       Boolean       @default(false)

  coverages PolicyCoverage[]
  claims    Claim[]

  @@index([customerId])
  @@index([productId])
  @@map("policies")
}

model PolicyCoverage {
  id        String @id @default(uuid())
  policyId  String @map("policy_id")
  policy    Policy  @relation(fields: [policyId], references: [id], onDelete: Cascade)
  coverageId String @map("coverage_id")
  labelJa   String @map("label_ja")
  labelEn   String @map("label_en")

  @@map("policy_coverages")
}

model Claim {
  id                   String      @id @default(uuid())
  policyId             String      @map("policy_id")
  policy               Policy      @relation(fields: [policyId], references: [id])
  claimNumber          String      @unique @map("claim_number")
  claimType            ClaimType   @default(OTHER)
  status               ClaimStatus @default(DRAFT)
  accidentDate         DateTime    @map("accident_date")
  accidentPlaceJa      String      @map("accident_place_ja")
  accidentPlaceEn      String      @map("accident_place_en")
  descriptionJa        String      @map("description_ja")
  descriptionEn        String      @map("description_en")
  estimatedAmount      Decimal?    @db.Decimal(12, 2) @map("estimated_amount")
  bankNameMasked       String?     @map("bank_name_masked")
  bankBranchMasked     String?     @map("bank_branch_masked")
  bankAccountType      String?     @map("bank_account_type")
  bankAccountNumberMasked String?  @map("bank_account_number_masked")
  isDraft              Boolean     @default(true)
  submittedById        String?     @map("submitted_by_id")
  submittedBy          User?       @relation("submittedBy", fields: [submittedById], references: [id])
  submittedAt          DateTime?   @map("submitted_at")
  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt

  documents    ClaimDocument[]
  statusHistory ClaimStatusHistory[]
  comments     ClaimComment[]

  @@index([policyId])
  @@index([submittedById])
  @@map("claims")
}

model ClaimDocument {
  id              String    @id @default(uuid())
  claimId         String    @map("claim_id")
  claim           Claim     @relation(fields: [claimId], references: [id], onDelete: Cascade)
  fileNameJa      String    @map("file_name_ja")
  fileNameEn      String    @map("file_name_en")
  fileType        String    @map("file_type")
  fileSize        Int       @map("file_size")
  r2Key           String    @map("r2_key")
  uploadedById    String    @map("uploaded_by_id")
  uploadedBy      User      @relation(fields: [uploadedById], references: [id])
  uploadedAt      DateTime  @default(now()) @map("uploaded_at")
  required        Boolean   @default(false)
  documentType    String?   @map("document_type")
  deleted         Boolean   @default(false)

  @@index([claimId])
  @@map("claim_documents")
}

model ClaimStatusHistory {
  id          String      @id @default(uuid())
  claimId     String      @map("claim_id")
  claim       Claim       @relation(fields: [claimId], references: [id], onDelete: Cascade)
  fromStatus  ClaimStatus? @map("from_status")
  toStatus    ClaimStatus @map("to_status")
  commentJa   String?     @map("comment_ja")
  commentEn   String?     @map("comment_en")
  changedById String      @map("changed_by_id")
  changedAt   DateTime    @default(now()) @map("changed_at")

  @@index([claimId])
  @@map("claim_status_history")
}

model ClaimComment {
  id        String   @id @default(uuid())
  claimId   String   @map("claim_id")
  claim     Claim    @relation(fields: [claimId], references: [id], onDelete: Cascade)
  commentJa String   @map("comment_ja")
  commentEn String   @map("comment_en")
  authorId  String   @map("author_id")
  authorRole String  @map("author_role")
  createdAt DateTime @default(now())

  @@index([claimId])
  @@map("claim_comments")
}

model NewsCategory {
  id        String @id @default(uuid())
  slug      String @unique
  nameJa    String @map("name_ja")
  nameEn    String @map("name_en")

  articles NewsArticle[]

  @@map("news_categories")
}

model NewsArticle {
  id         String   @id @default(uuid())
  categoryId String   @map("category_id")
  category   NewsCategory @relation(fields: [categoryId], references: [id])
  slug       String   @unique
  titleJa    String   @map("title_ja")
  titleEn    String   @map("title_en")
  summaryJa  String   @map("summary_ja")
  summaryEn  String   @map("summary_en")
  bodyJa     String   @map("body_ja")
  bodyEn     String   @map("body_en")
  category   String   // tag: Notice / Disaster / Campaign
  isPinned   Boolean  @default(false)
  publishedAt DateTime @map("published_at")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  deleted    Boolean  @default(false)

  @@index([categoryId])
  @@index([publishedAt])
  @@map("news_articles")
}

model FaqCategory {
  id         String @id @default(uuid())
  slug       String @unique
  nameJa     String @map("name_ja")
  nameEn     String @map("name_en")
  displayOrder Int   @default(0)

  items FaqItem[]

  @@map("faq_categories")
}

model FaqItem {
  id           String @id @default(uuid())
  categoryId   String @map("category_id")
  category     FaqCategory @relation(fields: [categoryId], references: [id])
  questionJa   String @map("question_ja")
  questionEn   String @map("question_en")
  answerJa     String @map("answer_ja")
  answerEn     String @map("answer_en")
  helpfulCount Int    @default(0)
  isPublished  Boolean @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([categoryId])
  @@map("faq_items")
}

model ContactMessage {
  id            String  @id @default(uuid())
  userId        String? @map("user_id")
  user          User?   @relation(fields: [userId], references: [id])
  nameJa        String  @map("name_ja")
  nameEn        String  @map("name_en")
  email         String
  topic         String? @map("topic")
  topicJa       String  @map("topic_ja")
  topicEn       String  @map("topic_en")
  messageJa     String  @map("message_ja")
  messageEn     String  @map("message_en")
  policyNumber  String? @map("policy_number")
  isAccidentContact Boolean @default(false) @map("is_accident_contact")
  status        String  @default("NEW")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@map("contact_messages")
}

model Notification {
  id        String @id @default(uuid())
  userId    String @map("user_id")
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  titleJa   String @map("title_ja")
  titleEn   String @map("title_en")
  bodyJa    String @map("body_ja")
  bodyEn    String @map("body_en")
  type      String
  read      Boolean @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
  @@map("notifications")
}

model AuditLog {
  id          String   @id @default(uuid())
  adminId     String   @map("admin_id")
  admin       User     @relation("adminActor", fields: [adminId], references: [id])
  action      String
  targetType  String    @map("target_type")
  targetId    String?   @map("target_id")
  detailsJa   String?   @map("details_ja")
  detailsEn   String?   @map("details_en")
  createdAt   DateTime @default(now())

  @@index([adminId])
  @@index([targetType, targetId])
  @@map("audit_logs")
}
```

## Seed Data Plan

The seed script (`apps/api/prisma/seed.ts`) creates:

- **1 admin user:** admin@sample-insurance-jp.example
- **3 customers:**
  - 山田 太郎 (Yamada Taro) — 2 policies
  - 鈴木 花子 (Suzuki Hanako) — 2 policies
  - 高橋 健 (Takahashi Ken) — 2 policies
- **4 product categories:** 自動車 (Auto), 火災・地震 (Fire/Earthquake), 旅行 (Travel), 医療・ケガ (Medical/Injury)
- **8 products** spread across categories
- **6 policies** (2 per customer)
- **10 claims** in various statuses: DRAFT, RECEIVED, UNDER_REVIEW, MORE_DOCUMENTS_NEEDED, APPROVED, PAID, REJECTED
- **8 news items:** mix of Notice, Disaster, Campaign; some pinned
- **15 FAQ items** across 3-4 categories
