import { z } from "zod";

export enum Role {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
}

export enum ClaimStatus {
  DRAFT = "DRAFT",
  RECEIVED = "RECEIVED",
  UNDER_REVIEW = "UNDER_REVIEW",
  MORE_DOCUMENTS_NEEDED = "MORE_DOCUMENTS_NEEDED",
  APPROVED = "APPROVED",
  PAID = "PAID",
  REJECTED = "REJECTED",
}

export enum ClaimType {
  AUTO = "AUTO",
  FIRE_EARTHQUAKE = "FIRE_EARTHQUAKE",
  TRAVEL = "TRAVEL",
  MEDICAL = "MEDICAL",
  LIABILITY = "LIABILITY",
  OTHER = "OTHER",
}

export enum NewsStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum FaqStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum PolicyStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING",
}

export enum ProductStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
}

export const ALLOWED_TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  [ClaimStatus.DRAFT]: [ClaimStatus.RECEIVED],
  [ClaimStatus.RECEIVED]: [ClaimStatus.UNDER_REVIEW, ClaimStatus.REJECTED],
  [ClaimStatus.UNDER_REVIEW]: [ClaimStatus.APPROVED, ClaimStatus.REJECTED, ClaimStatus.MORE_DOCUMENTS_NEEDED],
  [ClaimStatus.MORE_DOCUMENTS_NEEDED]: [ClaimStatus.UNDER_REVIEW],
  [ClaimStatus.APPROVED]: [ClaimStatus.PAID],
  [ClaimStatus.PAID]: [],
  [ClaimStatus.REJECTED]: [],
};

export const ALLOWED_POLICY_TRANSITIONS: Record<PolicyStatus, PolicyStatus[]> = {
  [PolicyStatus.DRAFT]: [PolicyStatus.PENDING, PolicyStatus.CANCELLED],
  [PolicyStatus.PENDING]: [PolicyStatus.ACTIVE, PolicyStatus.CANCELLED],
  [PolicyStatus.ACTIVE]: [PolicyStatus.EXPIRED, PolicyStatus.CANCELLED],
  [PolicyStatus.EXPIRED]: [],
  [PolicyStatus.CANCELLED]: [],
};

export const RoleSchema = z.nativeEnum(Role);
export const ClaimStatusSchema = z.nativeEnum(ClaimStatus);
export const ClaimTypeSchema = z.nativeEnum(ClaimType);
export const NewsStatusSchema = z.nativeEnum(NewsStatus);
export const FaqStatusSchema = z.nativeEnum(FaqStatus);
export const PolicyStatusSchema = z.nativeEnum(PolicyStatus);
export const ProductStatusSchema = z.nativeEnum(ProductStatus);
