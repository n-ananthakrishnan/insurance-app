import { Router } from "express";
import { z } from "zod";
import { prisma, withRetry } from "../prisma";
import { authMiddleware, requireRole, type AuthRequest } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../utils/validator";
import { sendClaimsError } from "../middleware/error-handler";
import { Role, ProductStatus } from "../shared";
import { ulid } from "ulid";

const router = Router();

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid("categoryIdInvalid").optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  enabledOnly: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

const createProductBody = z.object({
  categoryId: z.string().uuid("categoryIdInvalid"),
  nameJa: z.string().min(1).max(200),
  nameEn: z.string().min(1).max(200),
  taglineJa: z.string().max(500).optional(),
  taglineEn: z.string().max(500).optional(),
  descriptionJa: z.string().max(5000).optional(),
  descriptionEn: z.string().max(5000).optional(),
  coverageSummaryJa: z.string().max(2000).optional(),
  coverageSummaryEn: z.string().max(2000).optional(),
  highlightsJa: z.string().max(2000).optional(),
  highlightsEn: z.string().max(2000).optional(),
  basePremiumYen: z.coerce.number().min(0),
  paymentCycles: z.array(z.enum(["monthly", "quarterly", "annual", "one-time"])).default(["annual"]),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
  enabledForCustomers: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).default(0),
  imageUrlJa: z.string().url().optional(),
  imageUrlEn: z.string().url().optional(),
  documentUrls: z.array(z.object({ urlJa: z.string().url(), urlEn: z.string().url() })).optional(),
});

const updateProductBody = z.object({
  nameJa: z.string().min(1).max(200).optional(),
  nameEn: z.string().min(1).max(200).optional(),
  taglineJa: z.string().max(500).optional(),
  taglineEn: z.string().max(500).optional(),
  descriptionJa: z.string().max(5000).optional(),
  descriptionEn: z.string().max(5000).optional(),
  coverageSummaryJa: z.string().max(2000).optional(),
  coverageSummaryEn: z.string().max(2000).optional(),
  highlightsJa: z.string().max(2000).optional(),
  highlightsEn: z.string().max(2000).optional(),
  basePremiumYen: z.coerce.number().min(0).optional(),
  paymentCycles: z.array(z.enum(["monthly", "quarterly", "annual", "one-time"])).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  enabledForCustomers: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
  imageUrlJa: z.string().url().optional(),
  imageUrlEn: z.string().url().optional(),
  documentUrls: z.array(z.object({ urlJa: z.string().url(), urlEn: z.string().url() })).optional(),
}).refine((data) => Object.keys(data).length > 0, "updateProductEmpty");

// Public: list products
router.get("/", validateQuery(listQuery), async (req: AuthRequest, res) => {
  const query = listQuery.parse(req.query as unknown as Record<string, unknown>);
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;

  // Public pages only show enabled products
  const where: Record<string, unknown> = { deleted: false, enabledForCustomers: true };
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.status) where.status = query.status;

  const [items, total] = await withRetry(() =>
    prisma.$transaction([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          coverages: { include: { coverage: true } },
          images: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ])
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return res.json({
    success: true,
    data: {
      items: items.map((p) => ({
        id: p.id,
        categoryId: p.categoryId,
        category: p.category ? { id: p.category.id, nameJa: p.category.nameJa, nameEn: p.category.nameEn, slug: p.category.slug } : null,
        nameJa: p.nameJa,
        nameEn: p.nameEn,
        taglineJa: p.taglineJa ?? null,
        taglineEn: p.taglineEn ?? null,
        basePremiumYen: p.basePremiumYen,
        paymentCycles: p.paymentCycles,
        status: p.status,
        enabledForCustomers: p.enabledForCustomers,
        sortOrder: p.sortOrder,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages,
    },
    error: null,
  });
});

// Public: get a product
router.get("/:id", validateParams(z.object({ id: z.string().uuid("productIdInvalid") })), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const product = await withRetry(() =>
    prisma.product.findUnique({
      where: { id, deleted: false },
      include: {
        category: true,
        coverages: { include: { coverage: true } },
        images: true,
      },
    })
  );

  if (!product || !product.enabledForCustomers) {
    return sendClaimsError(res, 404, "NOT_FOUND", "商品が見つかりませんでした。", "Product not found.");
  }

  return res.json({
    success: true,
    data: {
      id: product.id,
      categoryId: product.categoryId,
      category: product.category ? { id: product.category.id, nameJa: product.category.nameJa, nameEn: product.category.nameEn, slug: product.category.slug } : null,
      nameJa: product.nameJa,
      nameEn: product.nameEn,
      taglineJa: product.taglineJa ?? null,
      taglineEn: product.taglineEn ?? null,
      descriptionJa: product.descriptionJa ?? null,
      descriptionEn: product.descriptionEn ?? null,
      coverageSummaryJa: product.coverageSummaryJa ?? null,
      coverageSummaryEn: product.coverageSummaryEn ?? null,
      highlightsJa: product.highlightsJa ?? null,
      highlightsEn: product.highlightsEn ?? null,
      basePremiumYen: product.basePremiumYen,
      paymentCycles: product.paymentCycles,
      status: product.status,
      enabledForCustomers: product.enabledForCustomers,
      sortOrder: product.sortOrder,
      imageUrlJa: product.imageUrlJa ?? null,
      imageUrlEn: product.imageUrlEn ?? null,
      documentUrls: product.documentUrls ?? [],
      coverages: product.coverages.map((c) => ({
        id: c.coverageId,
        coverage: c.coverage ? {
          id: c.coverage.id,
          nameJa: c.coverage.nameJa,
          nameEn: c.coverage.nameEn,
          descriptionJa: c.coverage.descriptionJa,
          descriptionEn: c.coverage.descriptionEn,
          maxAmountYen: c.coverage.maxAmountYen,
        } : null,
        termYears: c.termYears,
        amount: c.amount,
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    },
    error: null,
  });
});

// Admin: create product
router.post("/", requireRole(Role.ADMIN), validateBody(createProductBody), async (req: AuthRequest, res) => {
  const body = createProductBody.parse(req.body);

  // Verify category exists and is active
  const category = await withRetry(() => prisma.productCategory.findUnique({ where: { id: body.categoryId, deleted: false } }));
  if (!category) {
    return sendClaimsError(res, 400, "NOT_FOUND", "商品カテゴリが見つかりませんでした。", "Product category not found.");
  }

  const id = ulid();
  const product = await withRetry(() =>
    prisma.product.create({
      data: {
        id,
        categoryId: body.categoryId,
        nameJa: body.nameJa,
        nameEn: body.nameEn,
        taglineJa: body.taglineJa ?? null,
        taglineEn: body.taglineEn ?? null,
        descriptionJa: body.descriptionJa ?? null,
        descriptionEn: body.descriptionEn ?? null,
        coverageSummaryJa: body.coverageSummaryJa ?? null,
        coverageSummaryEn: body.coverageSummaryEn ?? null,
        highlightsJa: body.highlightsJa ?? null,
        highlightsEn: body.highlightsEn ?? null,
        basePremiumYen: body.basePremiumYen,
        paymentCycles: body.paymentCycles,
        status: body.status,
        enabledForCustomers: body.enabledForCustomers,
        sortOrder: body.sortOrder,
        imageUrlJa: body.imageUrlJa ?? null,
        imageUrlEn: body.imageUrlEn ?? null,
        documentUrls: body.documentUrls ?? [],
        coverages: {
          create: body.coverages?.map((c) => ({
            id: ulid(),
            coverageId: c.coverageId,
            termYears: c.termYears,
            amount: c.amount,
            notesJa: c.notesJa ?? null,
            notesEn: c.notesEn ?? null,
          })) ?? [],
        },
        images: {
          create: body.images?.map((img) => ({
            id: ulid(),
            urlJa: img.urlJa,
            urlEn: img.urlEn,
            altJa: img.altJa ?? null,
            altEn: img.altEn ?? null,
            sortOrder: img.sortOrder ?? 0,
          })) ?? [],
        },
      },
      include: {
        category: true,
        coverages: { include: { coverage: true } },
        images: true,
      },
    })
  );

  return res.status(201).json({
    success: true,
    data: {
      id: product.id,
      categoryId: product.categoryId,
      category: product.category ? { id: product.category.id, nameJa: product.category.nameJa, nameEn: product.category.nameEn, slug: product.category.slug } : null,
      nameJa: product.nameJa,
      nameEn: product.nameEn,
      basePremiumYen: product.basePremiumYen,
      status: product.status,
      enabledForCustomers: product.enabledForCustomers,
      createdAt: product.createdAt.toISOString(),
    },
    error: null,
  });
});

// Admin: update product
router.patch("/:id", requireRole(Role.ADMIN), validateParams(z.object({ id: z.string().uuid("productIdInvalid") })), validateBody(updateProductBody), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const body = updateProductBody.parse(req.body);

  const existing = await withRetry(() =>
    prisma.product.findUnique({ where: { id, deleted: false } })
  );
  if (!existing) {
    return sendClaimsError(res, 404, "NOT_FOUND", "商品が見つかりませんでした。", "Product not found.");
  }

  const updated = await withRetry(() =>
    prisma.product.update({
      where: { id },
      data: body,
      include: {
        category: true,
        coverages: { include: { coverage: true } },
        images: true,
      },
    })
  );

  return res.json({
    success: true,
    data: {
      id: updated.id,
      nameJa: updated.nameJa,
      nameEn: updated.nameEn,
      status: updated.status,
      enabledForCustomers: updated.enabledForCustomers,
      messageJa: "商品を更新しました。",
      messageEn: "Product updated.",
    },
    error: null,
  });
});

// Admin: delete product (soft)
router.delete("/:id", requireRole(Role.ADMIN), validateParams(z.object({ id: z.string().uuid("productIdInvalid") })), async (req: AuthRequest, res) => {
  const { id } = req.params;

  const existing = await withRetry(() => prisma.product.findUnique({ where: { id, deleted: false } }));
  if (!existing) {
    return sendClaimsError(res, 404, "NOT_FOUND", "商品が見つかりませんでした。", "Product not found.");
  }

  // Prevent deleting products with active policies
  const activePolicies = await withRetry(() =>
    prisma.policy.count({ where: { productId: id, status: "ACTIVE", deleted: false } })
  );
  if (activePolicies > 0) {
    return sendClaimsError(
      res,
      400,
      "CANNOT_DELETE",
      "契約の存在する商品は削除できません。",
      "Products with active policies cannot be deleted.",
      { activePolicies }
    );
  }

  await withRetry(() =>
    prisma.product.update({
      where: { id },
      data: { deleted: true, deletedAt: new Date() },
    })
  );

  return res.json({
    success: true,
    data: { deleted: true },
    error: null,
  });
});

export { router as productsRouter };
