import { Router } from "express";
import { z } from "zod";
import { prisma, withRetry } from "../prisma";
import { authMiddleware, requireRole, type AuthRequest } from "../middleware/auth";
import { validateParams, validateQuery } from "../utils/validator";
import { sendClaimsError } from "../middleware/error-handler";
import { Role } from "../shared";

const router = Router();
router.use(authMiddleware);
router.use(requireRole(Role.ADMIN));

const docParams = z.object({
  docId: z.string().uuid("docIdInvalid"),
});

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.string().optional(),
  mimeType: z.string().optional(),
  claimId: z.string().uuid("claimIdInvalid").optional(),
  search: z.string().optional(),
});

// List all uploaded documents across claims (admin)
router.get("/", requireRole(Role.ADMIN), validateQuery(listQuery), async (req: AuthRequest, res) => {
  const query = listQuery.parse(req.query as unknown as Record<string, unknown>);
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {};
  if (query.status) where.status = query.status;
  if (query.mimeType) where.mimeType = query.mimeType;
  if (query.claimId) where.claimId = query.claimId;
  if (query.search) {
    where.OR = [
      { fileName: { contains: query.search, mode: "insensitive" } },
      { claim: { customer: { customerProfile: { nameJa: { contains: query.search, mode: "insensitive" } } } } },
    ];
  }

  const [items, total] = await withRetry(() =>
    prisma.$transaction([
      prisma.claimDocument.findMany({
        where,
        include: {
          claim: {
            include: {
              customer: { include: { customerProfile: true } },
            },
          },
        },
        orderBy: { uploadedAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.claimDocument.count({ where }),
    ])
  );

  return res.json({
    success: true,
    data: {
      items: items.map((d) => ({
        id: d.id,
        claimId: d.claimId,
        claimNumber: d.claim.claimNumber,
        customer: {
          id: d.claim.customer.id,
          nameJa: d.claim.customer.customerProfile?.nameJa ?? "—",
          nameEn: d.claim.customer.customerProfile?.nameEn ?? "—",
        },
        fileName: d.fileName,
        mimeType: d.mimeType,
        sizeBytes: d.sizeBytes,
        purpose: d.purpose,
        storageKey: d.storageKey,
        status: d.status,
        uploadedAt: d.uploadedAt.toISOString(),
        orderIndex: d.orderIndex,
        uploadedBy: d.uploadedBy,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    error: null,
  });
});

// Delete (soft) a document
router.delete("/:docId", requireRole(Role.ADMIN), validateParams(docParams), async (req: AuthRequest, res) => {
  const { docId } = docParams.parse(req.params);

  const doc = await withRetry(() =>
    prisma.claimDocument.findUnique({ where: { id: docId } })
  );

  if (!doc) {
    return sendClaimsError(res, 404, "NOT_FOUND", "書類が見つかりませんでした。", "Document not found.");
  }

  await withRetry(() =>
    prisma.claimDocument.update({
      where: { id: docId },
      data: {
        status: "DELETED",
        deletedAt: new Date(),
        deletedBy: req.user!.id,
      },
    })
  );

  return res.json({
    success: true,
    data: { deleted: true },
    error: null,
  });
});

export { router as documentsRouter };
