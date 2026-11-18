import { Router } from "express";
import { z } from "zod";
import { prisma, withRetry } from "../prisma";
import { type AuthRequest } from "../middleware/auth";
import { validateQuery, validateParams } from "../utils/validator";
import { sendClaimsError } from "../middleware/error-handler";
import { NewsStatus } from "../shared";

const router = Router();

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid("categoryIdInvalid").optional(),
  status: z.nativeEnum(NewsStatus).optional(),
  search: z.string().optional(),
});

const newsParams = z.object({
  id: z.string().uuid("newsIdInvalid"),
});

// List published news (public)
router.get("/", validateQuery(listQuery), async (req: AuthRequest, res) => {
  const query = listQuery.parse(req.query as unknown as Record<string, unknown>);
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = {
    deleted: false,
    status: NewsStatus.PUBLISHED,
    publishDate: { lte: new Date() },
  };
  if (query.categoryId) where.categoryId = query.categoryId;
  if (query.search) {
    where.OR = [
      { titleJa: { contains: query.search, mode: "insensitive" } },
      { titleEn: { contains: query.search, mode: "insensitive" } },
      { summaryJa: { contains: query.search, mode: "insensitive" } },
      { summaryEn: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await withRetry(() =>
    prisma.$transaction([
      prisma.newsArticle.findMany({
        where,
        include: { category: true },
        orderBy: [{ priority: "desc" }, { publishDate: "desc" }],
        skip,
        take: pageSize,
      }),
      prisma.newsArticle.count({ where }),
    ])
  );

  return res.json({
    success: true,
    data: {
      items: items.map((n) => ({
        id: n.id,
        titleJa: n.titleJa,
        titleEn: n.titleEn,
        summaryJa: n.summaryJa ?? null,
        summaryEn: n.summaryEn ?? null,
        bodyJa: n.bodyJa,
        bodyEn: n.bodyEn,
        categoryId: n.categoryId,
        category: n.category ? { id: n.category.id, nameJa: n.category.nameJa, nameEn: n.category.nameEn, slug: n.category.slug } : null,
        publishDate: n.publishDate?.toISOString() ?? null,
        imageUrlJa: n.imageUrlJa ?? null,
        imageUrlEn: n.imageUrlEn ?? null,
        priority: n.priority,
        viewCount: n.viewCount,
        createdAt: n.createdAt.toISOString(),
        updatedAt: n.updatedAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    error: null,
  });
});

// Get a news article (public, increments view count)
router.get("/:id", validateParams(newsParams), async (req: AuthRequest, res) => {
  const { id } = newsParams.parse(req.params);

  const article = await withRetry(() =>
    prisma.newsArticle.findUnique({
      where: { id, deleted: false },
      include: { category: true },
    })
  );

  if (!article || article.status !== NewsStatus.PUBLISHED || (article.publishDate && article.publishDate > new Date())) {
    return sendClaimsError(res, 404, "NOT_FOUND", "ニュースが見つかりませんでした。", "News article not found.");
  }

  // Increment view count
  await withRetry(() =>
    prisma.newsArticle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
  );

  return res.json({
    success: true,
    data: {
      id: article.id,
      titleJa: article.titleJa,
      titleEn: article.titleEn,
      summaryJa: article.summaryJa ?? null,
      summaryEn: article.summaryEn ?? null,
      bodyJa: article.bodyJa,
      bodyEn: article.bodyEn,
      categoryId: article.categoryId,
      category: article.category ? { id: article.category.id, nameJa: article.category.nameJa, nameEn: article.category.nameEn, slug: article.category.slug } : null,
      publishDate: article.publishDate?.toISOString() ?? null,
      imageUrlJa: article.imageUrlJa ?? null,
      imageUrlEn: article.imageUrlEn ?? null,
      priority: article.priority,
      viewCount: article.viewCount + 1,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    },
    error: null,
  });
});

export { router as newsRouter };
