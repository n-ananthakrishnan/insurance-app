import { Router } from "express";
import { z } from "zod";
import { prisma, withRetry } from "../prisma";
import { type AuthRequest } from "../middleware/auth";
import { validateQuery } from "../utils/validator";
import { FaqStatus } from "../shared";

const router = Router();

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid("categoryIdInvalid").optional(),
  search: z.string().optional(),
});

// Public: list FAQ
router.get("/", validateQuery(listQuery), async (req: AuthRequest, res) => {
  const query = listQuery.parse(req.query as unknown as Record<string, unknown>);
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {
    deleted: false,
    status: FaqStatus.PUBLISHED,
  };
  if (query.categoryId) where.categoryId = query.categoryId;

  const [items, total] = await withRetry(() =>
    prisma.$transaction([
      prisma.faqItem.findMany({
        where,
        include: { category: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        skip,
        take: pageSize,
      }),
      prisma.faqItem.count({ where }),
    ])
  );

  return res.json({
    success: true,
    data: {
      items: items.map((f) => ({
        id: f.id,
        questionJa: f.questionJa,
        questionEn: f.questionEn,
        answerJa: f.answerJa,
        answerEn: f.answerEn,
        categoryId: f.categoryId,
        category: f.category ? { id: f.category.id, nameJa: f.category.nameJa, nameEn: f.category.nameEn, slug: f.category.slug } : null,
        sortOrder: f.sortOrder,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    error: null,
  });
});

export { router as faqRouter };
