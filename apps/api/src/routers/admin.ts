import { Router } from "express";
import { prisma } from "../prisma";
import { config } from "../config";
import { sendError } from "../middleware/error-handler";
import { attach } from "../middleware/attach";
import type { ApiErrorCode } from "../shared";

type UserSelect = {
  id: true;
  email: true;
  name: true;
  role: true;
  status: true;
  createdAt: true;
  updatedAt: true;
};

type PolicySelect = {
  id: true;
  number: true;
  customerId: true;
  customer: { id: true; name: true; email: true };
  type: true;
  status: true;
  premiumJa: true;
  premiumEn: true;
  startDate: true;
  endDate: true;
  accidentCoverageJa: true;
  accidentCoverageEn: true;
  theftCoverageJa: true;
  theftCoverageEn: true;
  liabilityCoverageJa: true;
  liabilityCoverageEn: true;
  createdAt: true;
  updatedAt: true;
};

type ClaimSelect = {
  id: true;
  number: true;
  policyId: true;
  policy: { id: true; number: true; customerId: true };
  customerId: true;
  status: true;
  reportedAt: true;
  accidentDateJa: true;
  accidentDateEn: true;
  accidentTimeJa: true;
  accidentTimeEn: true;
  locationJa: true;
  locationEn: true;
  descriptionJa: true;
  descriptionEn: true;
  damageAmountJa: true;
  damageAmountEn: true;
  policeReportJa: true;
  policeReportEn: true;
  insuredVehicleJa: true;
  insuredVehicleEn: true;
  otherPartyInfoJa: true;
  otherPartyInfoEn: true;
  createdBy: true;
  createdAt: true;
  updatedAt: true;
};

type FaqSelect = {
  id: true;
  category: true;
  questionJa: true;
  questionEn: true;
  answerJa: true;
  answerEn: true;
  status: true;
  order: true;
  createdAt: true;
  updatedAt: true;
};

type DocumentSelect = {
  id: true;
  claimId: true;
  nameJa: true;
  nameEn: true;
  documentType: true;
  storageKey: true;
  mimeType: true;
  sizeBytes: true;
  uploadedBy: true;
  createdAt: true;
};

type NoteSelect = {
  id: true;
  claimId: true;
  noteJa: true;
  noteEn: true;
  isPrivate: true;
  createdBy: true;
  createdAt: true;
};

const adminRouter = Router();

adminRouter.use(attach);

const requireAdmin: Parameters<typeof attach>[0] = async (req, _res, next) => {
  const user = (req as any).user;
  if (!user || user.role !== "ADMIN") {
    return sendError(_res, 403, "管理者権限が必要です。", "Admin access required.");
  }
  next();
};

adminRouter.get("/users", requireAdmin, async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ ok: true, users });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/users/reset-attempts", requireAdmin, async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const userId = body.userId as string | undefined;
    if (!userId) return sendError(res, 400, "userId is required.", "userId is required.");
    await prisma.user.update({
      where: { id: userId },
      data: { loginAttempts: 0, lockedUntil: null },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/users/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return sendError(res, 404, "ユーザーが見つかりません。", "User not found.");
    res.json({ ok: true, user });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/claims", requireAdmin, async (_req, res, next) => {
  try {
    const claims = await prisma.claim.findMany({
      select: {
        id: true,
        number: true,
        policyId: true,
        policy: { select: { id: true, number: true, customerId: true } },
        customerId: true,
        status: true,
        reportedAt: true,
        accidentDateJa: true,
        accidentDateEn: true,
        accidentTimeJa: true,
        accidentTimeEn: true,
        locationJa: true,
        locationEn: true,
        descriptionJa: true,
        descriptionEn: true,
        damageAmountJa: true,
        damageAmountEn: true,
        policeReportJa: true,
        policeReportEn: true,
        insuredVehicleJa: true,
        insuredVehicleEn: true,
        otherPartyInfoJa: true,
        otherPartyInfoEn: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ ok: true, claims });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/claims/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const status = body.status as string | undefined;
    if (status && !["DRAFT", "RECEIVED", "UNDER_REVIEW", "MORE_DOCUMENTS_NEEDED", "APPROVED", "REJECTED", "PAID"].includes(status)) {
      return sendError(res, 400, "無効なステータスです。", "Invalid claim status.");
    }
    const claim = await prisma.claim.update({
      where: { id },
      data: status ? { status } : {},
      select: {
        id: true,
        number: true,
        status: true,
        updatedAt: true,
      },
    });
    res.json({ ok: true, claim });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/claims/:id/notes", requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const notes = await prisma.claimNote.findMany({
      where: { claimId: id },
      select: {
        id: true,
        claimId: true,
        noteJa: true,
        noteEn: true,
        isPrivate: true,
        createdById: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ ok: true, notes });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/claims/:id/notes", requireAdmin, async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const body = (req.body ?? {}) as Record<string, unknown>;
    const noteJa = body.noteJa as string | undefined;
    const noteEn = body.noteEn as string | undefined;
    const isPrivate = Boolean(body.isPrivate);
    if (!noteJa && !noteEn) return sendError(res, 400, "メモ内容が必要です。", "Note content required.");
    const user = (req as any).user;
    const note = await prisma.claimNote.create({
      data: {
        claimId: id,
        note: { ja: noteJa ?? "", en: noteEn ?? "" },
        isPrivate,
        createdById: user?.id ?? "unknown",
      },
      select: {
        id: true,
        claimId: true,
        noteJa: true,
        noteEn: true,
        isPrivate: true,
        createdBy: true,
        createdAt: true,
      },
    });
    res.json({ ok: true, note });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/faqs", requireAdmin, async (_req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({
      select: {
        id: true,
        category: true,
        questionJa: true,
        questionEn: true,
        answerJa: true,
        answerEn: true,
        status: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { order: "asc" },
    });
    res.json({ ok: true, faqs });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/faqs", requireAdmin, async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const questionJa = body.questionJa as string | undefined;
    const questionEn = body.questionEn as string | undefined;
    const answerJa = body.answerJa as string | undefined;
    const answerEn = body.answerEn as string | undefined;
    const category = body.category as string | undefined;
    if (!questionJa || !questionEn || !answerJa || !answerEn) {
      return sendError(res, 400, "FAQの内容が不十分です。", "Incomplete FAQ content.");
    }
    const faq = await prisma.faq.create({
      data: {
        question: { ja: questionJa, en: questionEn },
        answer: { ja: answerJa, en: answerEn },
        category: category ?? "",
        status: "PUBLISHED",
      },
      select: {
        id: true,
        category: true,
        questionJa: true,
        questionEn: true,
        answerJa: true,
        answerEn: true,
        status: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ ok: true, faq });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/news", requireAdmin, async (_req, res, next) => {
  try {
    const news = await prisma.newsArticle.findMany({
      include: { category: { select: { id: true, nameJa: true, nameEn: true, slug: true } } },
      orderBy: { publishDate: "desc" },
    });
    res.json({ ok: true, news });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/news", requireAdmin, async (req, res, next) => {
  try {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const titleJa = body.titleJa as string | undefined;
    const titleEn = body.titleEn as string | undefined;
    const summaryJa = body.summaryJa as string | undefined;
    const summaryEn = body.summaryEn as string | undefined;
    const bodyJa = body.bodyJa as string | undefined;
    const bodyEn = body.bodyEn as string | undefined;
    if (!titleJa || !titleEn || !bodyJa || !bodyEn) {
      return sendError(res, 400, "ニュース記事の内容が不十分です。", "Incomplete news article content.");
    }
    const article = await prisma.newsArticle.create({
      data: {
        title: { ja: titleJa, en: titleEn },
        summary: { ja: summaryJa ?? "", en: summaryEn ?? "" },
        body: { ja: bodyJa, en: bodyEn },
        categoryId: body.categoryId as string | null,
        publishDate: (body.publishDate as string | null) ? new Date(body.publishDate as string) : new Date(),
      },
      select: {
        id: true,
        categoryId: true,
        titleJa: true,
        titleEn: true,
        summaryJa: true,
        summaryEn: true,
        bodyJa: true,
        bodyEn: true,
        publishDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ ok: true, article });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/documents/:claimId", requireAdmin, async (req, res, next) => {
  try {
    const claimId = String(req.params.claimId);
    const documents = await prisma.claimDocument.findMany({
      where: { claimId },
      select: {
        id: true,
        claimId: true,
        nameJa: true,
        nameEn: true,
        documentType: true,
        storageKey: true,
        mimeType: true,
        sizeBytes: true,
        uploadedBy: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ ok: true, documents });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/audit-log", requireAdmin, async (_req, res, next) => {
  try {
    const entries = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    res.json({ ok: true, entries });
  } catch (err) {
    next(err);
  }
});

export const adminRouterRouter = adminRouter;
