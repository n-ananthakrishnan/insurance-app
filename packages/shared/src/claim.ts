import { z } from "zod";

/**
 * Shared types for claims.
 *
 * These are deliberately kept lightweight and ASCII-keyed so that the API
 * and web app can import from one place. The API stores some of these under
 * snake_case in the database, but the shared envelopes expose the JSON keys
 * that the web app expects.
 */

export const ClaimStatusEnum = z.enum([
  "DRAFT",
  "RECEIVED",
  "UNDER_REVIEW",
  "MORE_DOCUMENTS_NEEDED",
  "APPROVED",
  "REJECTED",
  "PAID",
]);

export type ClaimStatus = z.infer<typeof ClaimStatusEnum>;

export const ClaimTypeEnum = z.enum([
  "CAR_ACCIDENT",
  "PROPERTY_DAMAGE",
  "PERSONAL_INJURY",
  "MISC",
]);

export type ClaimType = z.infer<typeof ClaimTypeEnum>;

export const ClaimPurposeEnum = z.enum(["POLICY_COVERAGE", "OTHER_PARTY", "POLICE"]);

export type ClaimPurpose = z.infer<typeof ClaimPurposeEnum>;

export const DocumentStatusEnum = z.enum(["PENDING", "UPLOADED", "REJECTED"]);

export type DocumentStatus = z.infer<typeof DocumentStatusEnum>;

/**
 * A minimal claim shape exposed to the web app via the API envelope.
 */
export type ClaimDocumentPublic = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  purpose: string;
  storageKey: string;
  status: DocumentStatus;
  uploadedAt: string;
};

export type ClaimStatusHistoryEntry = {
  id: string;
  fromStatus: string | null;
  toStatus: ClaimStatus;
  changedBy: string;
  commentJa: string | null;
  commentEn: string | null;
  createdAt: string;
};

export type ClaimComment = {
  id: string;
  authorId: string;
  authorNameJa: string | null;
  authorNameEn: string | null;
  commentJa: string;
  commentEn: string;
  createdAt: string;
};

export type ClaimPublic = {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  type: ClaimType;
  policyNumber: string | null;
  // ISO-8601 strings from the API
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  descriptionJa: string;
  descriptionEn: string;
  notesJa: string | null;
  notesEn: string | null;
  injuredPeople: number;
  propertyDamageEstimateYen: number;
  policeReported: boolean;
  otherPartyNameJa: string | null;
  otherPartyNameEn: string | null;
  otherPartyPhone: string | null;
  otherPartyPolicyNumber: string | null;
  accidentLocationJa: string | null;
  accidentLocationEn: string | null;
  estimatedPayoutYen: number | null;
  payoutAt: string | null;
  documents: ClaimDocumentPublic[];
  statusHistory: ClaimStatusHistoryEntry[];
  comments: ClaimComment[];
};

export const claimStatusLabel = (status: ClaimStatus, locale: "ja" | "en") => {
  if (locale === "ja") {
    return (
      {
        DRAFT: "下書き",
        RECEIVED: "受付済み",
        UNDER_REVIEW: "審査中",
        MORE_DOCUMENTS_NEEDED: "追加資料必要",
        APPROVED: "承認済み",
        REJECTED: "却下",
        PAID: "支払完了",
      }[status] ?? status
    );
  }
  return (
    {
      DRAFT: "Draft",
      RECEIVED: "Received",
      UNDER_REVIEW: "Under review",
      MORE_DOCUMENTS_NEEDED: "More documents needed",
      APPROVED: "Approved",
      REJECTED: "Rejected",
      PAID: "Paid",
    }[status] ?? status
  );
};

export const claimTypeLabel = (type: ClaimType, locale: "ja" | "en") => {
  if (locale === "ja") {
    return (
      {
        CAR_ACCIDENT: "自動車事故",
        PROPERTY_DAMAGE: "物的損害",
        PERSONAL_INJURY: "人的被害",
        MISC: "その他",
      }[type] ?? type
    );
  }
  return (
    {
      CAR_ACCIDENT: "Car accident",
      PROPERTY_DAMAGE: "Property damage",
      PERSONAL_INJURY: "Personal injury",
      MISC: "Other",
    }[type] ?? type
  );
};

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
] as const;
