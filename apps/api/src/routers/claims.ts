import { Router } from "express";
import { z } from "zod";
import { ulid } from "ulid";
import { v4 as uuid } from "uuid";
import { prisma, withRetry } from "../prisma";
import { authMiddleware, requireRole, type AuthRequest } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../utils/validator";
import { createError, type AppError } from "../middleware/error-handler";
import { Role, ClaimStatus, ClaimType, ALLOWED_TRANSITIONS } from "../shared";
import type { Claim, ClaimDocument, ClaimStatusHistory, ClaimComment, CustomerProfile, Policy } from "@prisma/client";
import { config } from "../config";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/plain"] as const;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function sendError(res: import("express").Response, status: number, code: string, messageJa: string, messageEn: string, details?: Record<string, unknown>) {
  const err = createError(status, code, messageJa, messageEn, details) as unknown as AppError;
  (err as unknown as Record<string, unknown>).statusCode = status;
  return res.status(status).json({ success: false, data: null, error: { code, messageJa, messageEn, details } });
}

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(ClaimStatus).optional(),
  type: z.nativeEnum(ClaimType).optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
});

const params = z.object({ id: z.string().uuid("claimIdInvalid") });

const createClaimBody = z.object({
  type: z.nativeEnum(ClaimType),
  policyId: z.string().uuid("policyIdInvalid").optional(),
  occurredAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), "occurredAtInvalid"),
  descriptionJa: z.string().min(1, "descriptionJaRequired").max(5000),
  descriptionEn: z.string().min(1, "descriptionEnRequired").max(5000),
  injuredPeople: z.coerce.number().int().min(0).max(1000).default(0),
  propertyDamageEstimateYen: z.coerce.number().min(0).default(0),
  policeReported: z.boolean().optional(),
  notesJa: z.string().max(2000).optional(),
  notesEn: z.string().max(2000).optional(),
  otherPartyNameJa: z.string().max(200).optional(),
  otherPartyNameEn: z.string().max(200).optional(),
  otherPartyPhone: z.string().max(50).optional(),
  otherPartyPolicyNumber: z.string().max(50).optional(),
  accidentLocationJa: z.string().max(200).optional(),
  accidentLocationEn: z.string().max(200).optional(),
});

const updateClaimBody = z.object({
  status: z.nativeEnum(ClaimStatus).optional(),
  descriptionJa: z.string().min(1).max(5000).optional(),
  descriptionEn: z.string().min(1).max(5000).optional(),
  notesJa: z.string().max(2000).optional(),
  notesEn: z.string().max(2000).optional(),
  injuredPeople: z.coerce.number().int().min(0).max(1000).optional(),
  propertyDamageEstimateYen: z.coerce.number().min(0).optional(),
  otherPartyNameJa: z.string().max(200).optional(),
  otherPartyNameEn: z.string().max(200).optional(),
  otherPartyPhone: z.string().max(50).optional(),
  otherPartyPolicyNumber: z.string().max(50).optional(),
  accidentLocationJa: z.string().max(200).optional(),
  accidentLocationEn: z.string().max(200).optional(),
  commentJa: z.string().max(500).optional(),
  commentEn: z.string().max(500).optional(),
}).refine((data) => Object.keys(data).length > 0, "claimUpdateEmpty");

const uploadUrlBody = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum([...Object.values(ALLOWED_MIME_TYPES) as string[]], { errorMap: () => ({ message: "invalidMimeType" }) }),
  sizeBytes: z.coerce.number().int().min(1).max(MAX_FILE_SIZE_BYTES, { errorMap: () => ({ message: "fileTooLarge" }) }),
  purpose: z.enum(["evidence", "supporting", "medical", "other"]).optional(),
});

const confirmDocBody = z.object({
  uploadUrlId: z.string().min(1),
  fileName: z.string().min(1).max(255),
  mimeType: z.enum([...Object.values(ALLOWED_MIME_TYPES) as string[]], { errorMap: () => ({ message: "invalidMimeType" }) }),
  sizeBytes: z.coerce.number().int().min(1).max(MAX_FILE_SIZE_BYTES, { errorMap: () => ({ message: "fileTooLarge" }) }),
  storageKey: z.string().min(1),
  purpose: z.enum(["evidence", "supporting", "medical", "other"]).optional(),
});

const docParams = z.object({ id: z.string().uuid("claimIdInvalid"), docId: z.string().uuid("docIdInvalid") });

function toClaimEnvelope(claim: Claim & { customer: { customerProfile: CustomerProfile | null }; documents: ClaimDocument[]; statusHistory: ClaimStatusHistory[]; comments: ClaimComment[] }) {
  return {
    id: claim.id,
    claimNumber: claim.claimNumber,
    policyId: claim.policyId,
    policyNumber: (claim as unknown as { policyNumber?: string }).policyNumber ?? null,
    customerId: claim.policy.customerId,
    customer: {
      id: claim.policy.customer.id,
      email: claim.policy.customer.email,
      nameJa: claim.policy.customer.customerProfile?.nameJa ?? "—",
      nameEn: claim.policy.customer.customerProfile?.nameEn ?? "—",
      phone: claim.policy.customer.customerProfile?.phone ?? null,
      role: claim.policy.customer.role,
    },
    type: claim.claimType,
    status: claim.status,
    occurredAt: claim.accidentDate.toISOString(),
    createdAt: claim.createdAt.toISOString(),
    updatedAt: claim.updatedAt.toISOString(),
    descriptionJa: claim.descriptionJa,
    descriptionEn: claim.descriptionEn,
    notesJa: (claim as unknown as { notesJa?: string | null }).notesJa ?? null,
    notesEn: (claim as unknown as { notesEn?: string | null }).notesEn ?? null,
    injuredPeople: (claim as unknown as { injuredPeople?: number }).injuredPeople ?? 0,
    propertyDamageEstimateYen: (claim as unknown as { propertyDamageEstimateYen?: number }).propertyDamageEstimateYen ?? 0,
    policeReported: (claim as unknown as { policeReported?: boolean }).policeReported ?? false,
    otherPartyNameJa: (claim as unknown as { otherPartyNameJa?: string | null }).otherPartyNameJa ?? null,
    otherPartyNameEn: (claim as unknown as { otherPartyNameEn?: string | null }).otherPartyNameEn ?? null,
    otherPartyPhone: (claim as unknown as { otherPartyPhone?: string | null }).otherPartyPhone ?? null,
    otherPartyPolicyNumber: (claim as unknown as { otherPartyPolicyNumber?: string | null }).otherPartyPolicyNumber ?? null,
    accidentLocationJa: (claim as unknown as { accidentLocationJa?: string | null }).accidentLocationJa ?? null,
    accidentLocationEn: (claim as unknown as { accidentLocationEn?: string | null }).accidentLocationEn ?? null,
    estimatedPayoutYen: (claim as unknown as { estimatedPayoutYen?: string | null }).estimatedPayoutYen ?? null,
    payoutAt: (claim as unknown as { payoutAt?: Date | null }).payoutAt?.toISOString() ?? null,
    documents: claim.documents.map((d) => ({
      id: d.id, fileNameJa: d.fileNameJa, fileNameEn: d.fileNameEn, mimeType: d.fileType, sizeBytes: d.fileSize, purpose: d.documentType, storageKey: d.r2Key, uploadedAt: d.uploadedAt.toISOString(), orderIndex: 0,
    })),
    statusHistory: claim.statusHistory.map((h) => ({
      id: h.id, fromStatus: h.fromStatus, toStatus: h.toStatus, commentJa: h.commentJa ?? null, commentEn: h.commentEn ?? null, changedBy: h.changedById, createdAt: h.changedAt.toISOString(),
    })),
    comments: claim.comments.map((c) => ({
      id: c.id, authorId: c.authorId, authorNameJa: c.authorNameJa ?? null, authorNameEn: c.authorNameEn ?? null, commentJa: c.commentJa, commentEn: c.commentEn, createdAt: c.createdAt.toISOString(),
    })),
  };
}

function computeClaimNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 900000) + 100000);
  return `SIJ-${year}-${seq}`;
}

router.use(authMiddleware);

router.get("/", validateQuery(listQuery), async (req: AuthRequest, res) => {
  const query = listQuery.parse(req.query as unknown as Record<string, unknown>);
  const page = query.page, pageSize = query.pageSize, skip = (page - 1) * pageSize;
  const where: Record<string, unknown> = { deleted: false };
  if (query.status) where.status = query.status;
  if (query.type) where.claimType = query.type;
  if (req.user!.role === Role.CUSTOMER) {
    where.policy = { customerId: req.user!.id };
  } else {
    if (query.customerName) where.policy = { customer: { customerProfile: { nameJa: { contains: query.customerName, mode: "insensitive" } } } };
    if (query.customerPhone) where.policy = { customer: { customerProfile: { phone: { equals: query.customerPhone, mode: "insensitive" } } } };
  }
  const [{ items }, total] = await withRetry(() =>
    prisma.$transaction([
      prisma.claim.findMany({ where, include: { policy: { include: { customer: { include: { customerProfile: true } } } }, documents: { orderBy: { uploadedAt: "asc" }, take: 100 }, statusHistory: { orderBy: { changedAt: "asc" }, take: 200 }, comments: { orderBy: { createdAt: "asc" }, take: 200 } }, orderBy: { createdAt: "desc" }, skip, take: pageSize }),
      prisma.claim.count({ where }),
    ])
  );
  return res.json({ success: true, data: { items: items.map(toClaimEnvelope), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) }, error: null });
});

router.get("/:id", validateParams(params), async (req: AuthRequest, res) => {
  const { id } = params.parse(req.params);
  const claim = await withRetry(() =>
    prisma.claim.findUnique({ where: { id, deleted: false }, include: { policy: { include: { customer: { include: { customerProfile: true } } } }, documents: { orderBy: { uploadedAt: "asc" } }, statusHistory: { orderBy: { changedAt: "asc" } }, comments: { orderBy: { createdAt: "asc" } } } })
  );
  if (!claim) return sendError(res, 404, "NOT_FOUND", "請求が見つかりませんでした。", "Claim not found.");
  if (req.user!.role === Role.CUSTOMER && claim.policy.customerId !== req.user!.id) return sendError(res, 403, "FORBIDDEN", "この請求にアクセスする権限がありません。", "You do not have access to this claim.");
  return res.json({ success: true, data: toClaimEnvelope(claim), error: null });
});

router.post("/", validateBody(createClaimBody), async (req: AuthRequest, res) => {
  const body = createClaimBody.parse(req.body);
  let policyNumber: string | null = null;
  if (body.policyId) {
    const policy = await withRetry(() => prisma.policy.findUnique({ where: { id: body.policyId, deleted: false }, include: { customer: { include: { customerProfile: true } } } }));
    if (!policy) return sendError(res, 400, "NOT_FOUND", "指定された契約が見つかりませんでした。", "The specified policy was not found.");
    if (req.user!.role === Role.CUSTOMER && policy.customerId !== req.user!.id) return sendError(res, 403, "FORBIDDEN", "この契約の請求を作成する権限がありません。", "You do not have permission to file a claim on this policy.");
    policyNumber = policy.policyNumber;
  } else {
    return sendError(res, 400, "INVALID_INPUT", "契約番号または契約IDを指定してください。", "Please specify a policy number or policy ID.", { required: ["policyId"] });
  }
  const id = ulid();
  const claimNumber = computeClaimNumber();
  const created = await withRetry(() =>
    prisma.claim.create({
      data: {
        id, claimNumber, policyId: body.policyId!, claimType: body.type, status: ClaimStatus.RECEIVED, accidentDate: new Date(body.occurredAt), descriptionJa: body.descriptionJa, descriptionEn: body.descriptionEn, notesJa: body.notesJa ?? null, notesEn: body.notesEn ?? null, injuredPeople: body.injuredPeople, propertyDamageEstimateYen: body.propertyDamageEstimateYen, policeReported: body.policeReported ?? false, otherPartyNameJa: body.otherPartyNameJa ?? null, otherPartyNameEn: body.otherPartyNameEn ?? null, otherPartyPhone: body.otherPartyPhone ?? null, otherPartyPolicyNumber: body.otherPartyPolicyNumber ?? null, accidentLocationJa: body.accidentLocationJa ?? null, accidentLocationEn: body.accidentLocationEn ?? null,
        submittedById: req.user!.id, submittedAt: new Date(),
        statusHistory: { create: [{ id: uuid(), fromStatus: null, toStatus: ClaimStatus.RECEIVED, changedById: req.user!.id, commentJa: "請求を受領しました。", commentEn: "Claim received." }] },
        comments: { create: [] },
      },
      include: { policy: { include: { customer: { include: { customerProfile: true } } } }, documents: true, statusHistory: true, comments: true },
    })
  );
  (created as unknown as { policyNumber?: string }).policyNumber = policyNumber;
  return res.status(201).json({ success: true, data: toClaimEnvelope(created), error: null });
});

router.patch("/:id", validateParams(params), validateBody(updateClaimBody), async (req: AuthRequest, res) => {
  const { id } = params.parse(req.params);
  const body = updateClaimBody.parse(req.body);
  const claim = await withRetry(() => prisma.claim.findUnique({ where: { id, deleted: false }, include: { policy: { include: { customer: { include: { customerProfile: true } } } }, documents: true, statusHistory: true, comments: true } }));
  if (!claim) return sendError(res, 404, "NOT_FOUND", "請求が見つかりませんでした。", "Claim not found.");
  if (req.user!.role === Role.CUSTOMER) {
    if (claim.policy.customerId !== req.user!.id) return sendError(res, 403, "FORBIDDEN", "この請求を更新する権限がありません。", "You do not have permission to update this claim.");
    if (body.status !== undefined) return sendError(res, 403, "FORBIDDEN", "請求のステータスは管理者のみ変更できます。", "Only administrators can change the claim status.");
  }
  const allowedFields: Record<string, unknown> = {};
  if (body.descriptionJa !== undefined) allowedFields.descriptionJa = body.descriptionJa;
  if (body.descriptionEn !== undefined) allowedFields.descriptionEn = body.descriptionEn;
  if (body.notesJa !== undefined) allowedFields.notesJa = body.notesJa;
  if (body.notesEn !== undefined) allowedFields.notesEn = body.notesEn;
  if (body.injuredPeople !== undefined) allowedFields.injuredPeople = body.injuredPeople;
  if (body.propertyDamageEstimateYen !== undefined) allowedFields.propertyDamageEstimateYen = body.propertyDamageEstimateYen;
  if (body.otherPartyNameJa !== undefined) allowedFields.otherPartyNameJa = body.otherPartyNameJa;
  if (body.otherPartyNameEn !== undefined) allowedFields.otherPartyNameEn = body.otherPartyNameEn;
  if (body.otherPartyPhone !== undefined) allowedFields.otherPartyPhone = body.otherPartyPhone;
  if (body.otherPartyPolicyNumber !== undefined) allowedFields.otherPartyPolicyNumber = body.otherPartyPolicyNumber;
  if (body.accidentLocationJa !== undefined) allowedFields.accidentLocationJa = body.accidentLocationJa;
  if (body.accidentLocationEn !== undefined) allowedFields.accidentLocationEn = body.accidentLocationEn;
  if (Object.keys(allowedFields).length === 0) return sendError(res, 400, "INVALID_INPUT", "更新内容が空です。", "No updates provided.");
  const updated = await withRetry(() => prisma.claim.update({ where: { id }, data: allowedFields, include: { policy: { include: { customer: { include: { customerProfile: true } } } }, documents: true, statusHistory: true, comments: true } }));
  return res.json({ success: true, data: toClaimEnvelope(updated), error: null });
});

router.post("/:id/status", validateParams(params), validateBody(updateClaimBody), async (req: AuthRequest, res) => {
  const { id } = params.parse(req.params);
  const body = updateClaimBody.parse(req.body);
  if (!body.status) return sendError(res, 400, "INVALID_INPUT", "変更するステータスを指定してください。", "Please specify the status to change to.");
  const claim = await withRetry(() => prisma.claim.findUnique({ where: { id, deleted: false }, include: { statusHistory: true } }));
  if (!claim) return sendError(res, 404, "NOT_FOUND", "請求が見つかりませんでした。", "Claim not found.");
  if (req.user!.role !== Role.ADMIN) return sendError(res, 403, "FORBIDDEN", "請求のステータスは管理者のみ変更できます。", "Only administrators can change the claim status.");
  const currentStatus = claim.status as ClaimStatus;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(body.status)) {
    return sendError(res, 400, "INVALID_TRANSITION", `この請求は "${ClaimStatus[currentStatus]}" のため、指定された状態 "${ClaimStatus[body.status]}" に変更できません。`, `This claim is in "${ClaimStatus[currentStatus]}" and cannot be moved to "${ClaimStatus[body.status]}".`, { current: ClaimStatus[currentStatus], requested: ClaimStatus[body.status], allowed: allowed.map((s) => ClaimStatus[s]) });
  }
  if (body.status === ClaimStatus.REJECTED || body.status === ClaimStatus.MORE_DOCUMENTS_NEEDED) {
    if (!body.commentJa && !body.commentEn) return sendError(res, 400, "INVALID_INPUT", "この遷移にはコメントが必要です。", "A comment is required for this transition.", { required: ["commentJa", "commentEn"] });
  }
  const beforeUpdate = await withRetry(() => prisma.claim.findUnique({ where: { id }, select: { status: true } }));
  if (!beforeUpdate || beforeUpdate.status !== currentStatus) return sendError(res, 409, "CONFLICT", "この請求は他のユーザーによって更新されました。もう一度お試しください。", "This claim was updated by another user. Please try again.", { currentStatus: beforeUpdate.status });
  const updated = await withRetry(() => prisma.$transaction([
    prisma.claim.update({ where: { id }, data: { status: body.status, estimatedAmount: body.status === ClaimStatus.APPROVED && claim.estimatedAmount === null ? 0 : claim.estimatedAmount } }),
    prisma.claimStatusHistory.create({ data: { id: uuid(), claimId: id, fromStatus: currentStatus, toStatus: body.status, changedById: req.user!.id, commentJa: body.commentJa ?? null, commentEn: body.commentEn ?? null } }),
    ...(body.commentJa || body.commentEn ? [prisma.claimComment.create({ data: { id: uuid(), claimId: id, authorId: req.user!.id, authorRole: "ADMIN", commentJa: body.commentJa ?? body.commentEn!, commentEn: body.commentEn ?? body.commentJa! } })] : []),
  ]));
  const refreshed = await withRetry(() => prisma.claim.findUnique({ where: { id, deleted: false }, include: { policy: { include: { customer: { include: { customerProfile: true } } } }, documents: { orderBy: { uploadedAt: "asc" } }, statusHistory: { orderBy: { changedAt: "asc" } }, comments: { orderBy: { createdAt: "asc" } } } }));
  return res.json({ success: true, data: refreshed ? toClaimEnvelope(refreshed) : { id, status: body.status }, error: null });
});

router.post("/:id/documents/upload-url", validateParams(params), validateBody(uploadUrlBody), async (req: AuthRequest, res) => {
  const { id } = params.parse(req.params);
  const body = uploadUrlBody.parse(req.body);
  const claim = await withRetry(() => prisma.claim.findUnique({ where: { id, deleted: false }, select: { id: true, policy: { select: { customerId: true } } } }));
  if (!claim) return sendError(res, 404, "NOT_FOUND", "請求が見つかりませんでした。", "Claim not found.");
  if (req.user!.role === Role.CUSTOMER && claim.policy.customerId !== req.user!.id) return sendError(res, 403, "FORBIDDEN", "この請求の書類をアップロードする権限がありません。", "You do not have permission to upload documents for this claim.");
  if (!config.R2_ENDPOINT || !config.R2_ACCESS_KEY_ID || !config.R2_SECRET_ACCESS_KEY || !config.R2_BUCKET) return sendError(res, 503, "SERVICE_UNAVAILABLE", "ファイル保存の準備ができていません。管理者に連絡してください。", "File storage is not available. Please contact an administrator.", { reason: "R2 not configured" });
  const normalizedFileName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storageKey = `claims/${claim.id}/${uuid()}/${normalizedFileName}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const uploadRecordId = uuid();
  const orderIndex = await withRetry(() => prisma.claimDocument.count({ where: { claimId: id } }));
  await withRetry(() => prisma.claimDocument.create({ data: { id: uploadRecordId, claimId: id, fileNameJa: body.fileName, fileNameEn: body.fileName, fileType: body.mimeType, fileSize: body.sizeBytes, r2Key: storageKey, uploadedById: req.user!.id, required: false, documentType: body.purpose ?? "other", uploadedAt: new Date() } }));
  const uploadUrl = `${config.R2_ENDPOINT}/uploads/${storageKey}?signature=${uuid().slice(0, 16)}`;
  return res.json({ success: true, data: { uploadUrl, method: "PUT", storageKey, uploadUrlId: uploadRecordId, expiresAt: expiresAt.toISOString(), maxSizeBytes: MAX_FILE_SIZE_BYTES, allowedMimeTypes: Object.values(ALLOWED_MIME_TYPES), messageJa: "アップロード用リンクを発行しました。5分以内にファイルをアップロードしてください。", messageEn: "Upload URL issued. Upload the file within 5 minutes." }, error: null });
});

router.post("/:id/documents", validateParams(params), validateBody(confirmDocBody), async (req: AuthRequest, res) => {
  const { id } = params.parse(req.params);
  const body = confirmDocBody.parse(req.body);
  const claim = await withRetry(() => prisma.claim.findUnique({ where: { id, deleted: false }, select: { id: true, policy: { select: { customerId: true } } } }));
  if (!claim) return sendError(res, 404, "NOT_FOUND", "請求が見つかりませんでした。", "Claim not found.");
  if (req.user!.role === Role.CUSTOMER && claim.policy.customerId !== req.user!.id) return sendError(res, 403, "FORBIDDEN", "この請求の書類を登録する権限がありません。", "You do not have permission to register documents for this claim.");
  const pendingDoc = await withRetry(() => prisma.claimDocument.findFirst({ where: { id: body.uploadUrlId, claimId: id } }));
  if (!pendingDoc) return sendError(res, 404, "NOT_FOUND", "アップロード待ちの書類が見つかりませんでした。", "No pending document upload found.");
  if (pendingDoc.fileNameJa !== body.fileName) return sendError(res, 400, "INVALID_INPUT", "ファイル名が一致しません。", "The file name does not match.");
  if (pendingDoc.fileType !== body.mimeType) return sendError(res, 400, "INVALID_INPUT", "ファイル形式が一致しません。", "The file type does not match.");
  if (pendingDoc.fileSize !== body.sizeBytes) return sendError(res, 400, "INVALID_INPUT", "ファイルサイズが一致しません。", "The file size does not match.");
  const updated = await withRetry(() => prisma.claimDocument.update({ where: { id: pendingDoc.id }, data: { r2Key: body.storageKey, fileType: body.mimeType, fileSize: body.sizeBytes, fileNameJa: body.fileName, fileNameEn: body.fileName, documentType: body.purpose ?? pendingDoc.documentType ?? "other" }, include: { claim: { include: { customer: { include: { customerProfile: true } } } } } }));
  return res.status(201).json({ success: true, data: { id: updated.id, fileNameJa: updated.fileNameJa, fileNameEn: updated.fileNameEn, mimeType: updated.fileType, sizeBytes: updated.fileSize, purpose: updated.documentType, storageKey: updated.r2Key, uploadedAt: updated.uploadedAt.toISOString(), messageJa: "書類を登録しました。", messageEn: "Document registered." }, error: null });
});

router.get("/:id/documents", validateParams(params), async (req: AuthRequest, res) => {
  const { id } = params.parse(req.params);
  const claim = await withRetry(() => prisma.claim.findUnique({ where: { id, deleted: false }, include: { policy: { include: { customer: { include: { customerProfile: true } } } }, documents: { orderBy: { uploadedAt: "asc" } } } }));
  if (!claim) return sendError(res, 404, "NOT_FOUND", "請求が見つかりませんでした。", "Claim not found.");
  if (req.user!.role === Role.CUSTOMER && claim.policy.customerId !== req.user!.id) return sendError(res, 403, "FORBIDDEN", "この請求の書類を閲覧する権限がありません。", "You do not have permission to view documents for this claim.");
  return res.json({ success: true, data: { items: claim.documents.map((d) => ({ id: d.id, fileNameJa: d.fileNameJa, fileNameEn: d.fileNameEn, mimeType: d.fileType, sizeBytes: d.fileSize, purpose: d.documentType, storageKey: d.r2Key, uploadedAt: d.uploadedAt.toISOString() })), total: claim.documents.length }, error: null });
});

router.get("/:id/documents/:docId/download-url", validateParams(docParams), async (req: AuthRequest, res) => {
  const { id, docId } = docParams.parse(req.params);
  const doc = await withRetry(() => prisma.claimDocument.findUnique({ where: { id: docId, claimId: id }, include: { claim: { include: { customer: { include: { customerProfile: true } } } } } }));
  if (!doc) return sendError(res, 404, "NOT_FOUND", "書類が見つかりませんでした。", "Document not found.");
  if (req.user!.role !== Role.ADMIN && doc.claim.policy.customerId !== req.user!.id) return sendError(res, 403, "FORBIDDEN", "この書類をダウンロードする権限がありません。", "You do not have permission to download this document.");
  if (!config.R2_ENDPOINT || !config.R2_ACCESS_KEY_ID || !config.R2_SECRET_ACCESS_KEY || !config.R2_BUCKET) return sendError(res, 503, "SERVICE_UNAVAILABLE", "ファイル取得の準備ができていません。管理者に連絡してください。", "File storage is not available. Please contact an administrator.", { reason: "R2 not configured" });
  const downloadUrl = `${config.R2_ENDPOINT}/downloads/${doc.r2Key}?signature=${uuid().slice(0, 16)}`;
  return res.json({ success: true, data: { downloadUrl, fileNameJa: doc.fileNameJa, fileNameEn: doc.fileNameEn, mimeType: doc.fileType, sizeBytes: doc.fileSize, expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() }, error: null });
});

export { router as claimsRouter };
