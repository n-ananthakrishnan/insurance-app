import { Router, type Request, type Response, type NextFunction, type RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";
import { config } from "./config";

type UserClaims = { id: string; email: string; role: string };
type AuthedRequest = Request & { user?: UserClaims };
const send = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data, error: null });
const fail = (res: Response, status: number, code: string, messageEn: string, messageJa = messageEn) =>
  res.status(status).json({ success: false, data: null, error: { code, messageEn, messageJa } });
const route = (fn: (req: AuthedRequest, res: Response) => Promise<unknown>): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req as AuthedRequest, res)).catch(next);
};

const userFromRequest: RequestHandler = (req: AuthedRequest, res, next) => {
  const token = req.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) { fail(res, 401, "UNAUTHORIZED", "Sign in to continue."); return; }
  try {
    req.user = jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] }) as UserClaims;
    next();
  } catch { fail(res, 401, "UNAUTHORIZED", "Your session has expired. Please sign in again."); }
};
const adminOnly: RequestHandler = (req: AuthedRequest, res, next) => {
  if (req.user?.role !== "ADMIN") { fail(res, 403, "FORBIDDEN", "Administrator access required."); return; }
  next();
};
const userRoute = (fn: (req: AuthedRequest, res: Response) => Promise<unknown>) => [userFromRequest, route(fn)] as RequestHandler[];
const adminRoute = (fn: (req: AuthedRequest, res: Response) => Promise<unknown>) => [userFromRequest, adminOnly, route(fn)] as RequestHandler[];

export const runtimeRouter = Router();

// Public content APIs
runtimeRouter.get("/products", route(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1), pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const where = { isActive: true };
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true, coverages: { orderBy: { coverageOrder: "asc" } } }, orderBy: { createdAt: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.product.count({ where }),
  ]);
  return send(res, { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}));
runtimeRouter.get("/products/:id", route(async (req, res) => {
  const item = await prisma.product.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }], isActive: true }, include: { category: true, coverages: { orderBy: { coverageOrder: "asc" } }, claimHowToDocs: { orderBy: { docOrder: "asc" } } } });
  return item ? send(res, item) : fail(res, 404, "NOT_FOUND", "Product not found.");
}));
runtimeRouter.get("/faq", route(async (req, res) => {
  const items = await prisma.faqItem.findMany({ where: { status: "PUBLISHED", deleted: false }, include: { category: true }, orderBy: [{ category: { displayOrder: "asc" } }, { sortOrder: "asc" }] });
  return send(res, { items, total: items.length, page: 1, pageSize: items.length, totalPages: 1 });
}));
runtimeRouter.get("/faq/:id", route(async (req, res) => {
  const item = await prisma.faqItem.findFirst({ where: { id: req.params.id, status: "PUBLISHED", deleted: false }, include: { category: true } });
  return item ? send(res, item) : fail(res, 404, "NOT_FOUND", "FAQ item not found.");
}));
runtimeRouter.get("/news", route(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1), pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const where = { deleted: false };
  const [items, total] = await Promise.all([
    prisma.newsArticle.findMany({ where, include: { category: true }, orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.newsArticle.count({ where }),
  ]);
  return send(res, { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}));
runtimeRouter.get("/news/search", route(async (req, res) => {
  const query = String(req.query.q ?? req.query.query ?? "").trim();
  const page = Math.max(1, Number(req.query.page) || 1), pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20));
  const where = { deleted: false, ...(query ? { OR: [
    { titleJa: { contains: query } }, { titleEn: { contains: query } },
    { summaryJa: { contains: query } }, { summaryEn: { contains: query } },
    { bodyJa: { contains: query } }, { bodyEn: { contains: query } },
  ] } : {}) };
  const [items, total] = await Promise.all([
    prisma.newsArticle.findMany({ where, include: { category: true }, orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize }),
    prisma.newsArticle.count({ where }),
  ]);
  return send(res, { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}));
runtimeRouter.get("/news/:id", route(async (req, res) => {
  const item = await prisma.newsArticle.findFirst({ where: { OR: [{ id: req.params.id }, { slug: req.params.id }], deleted: false }, include: { category: true } });
  return item ? send(res, item) : fail(res, 404, "NOT_FOUND", "News article not found.");
}));
runtimeRouter.post("/contact", route(async (req, res) => {
  const body = req.body ?? {};
  const nameJa = body.nameJa ?? body.name, nameEn = body.nameEn ?? body.name;
  const subjectJa = body.subjectJa ?? body.subject, subjectEn = body.subjectEn ?? body.subject;
  const messageJa = body.messageJa ?? body.message, messageEn = body.messageEn ?? body.message;
  const { email, phone } = body;
  if (!email || !subjectEn || !messageEn || !String(messageEn).trim() || body.consent === false || body.consentToPrivacy === false) return fail(res, 400, "VALIDATION", "Email, consent, subject, and message are required.");
  const message = await prisma.contactMessage.create({ data: { nameJa, nameEn, email: String(email), phone, subjectJa, subjectEn, messageJa: String(messageJa), messageEn: String(messageEn) } });
  return send(res, { id: message.id, received: true }, 201);
}));

// Customer profile and policy endpoints
runtimeRouter.get("/customers/me", ...userRoute(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { profile: true } });
  if (!user) return fail(res, 404, "NOT_FOUND", "Customer not found.");
  return send(res, { user: { id: user.id, email: user.email, role: user.role, ...user.profile } });
}));
runtimeRouter.patch("/customers/me", ...userRoute(async (req, res) => {
  const { nameJa, nameEn, furigana, phone, postalCode, prefecture, city, addressLine, addressJa, addressEn } = req.body ?? {};
  const profile = await prisma.customerProfile.upsert({ where: { userId: req.user!.id }, create: { userId: req.user!.id, nameJa, nameEn, furigana, phone, postalCode, prefecture, city, addressLine, addressJa, addressEn }, update: { nameJa, nameEn, furigana, phone, postalCode, prefecture, city, addressLine, addressJa, addressEn } });
  return send(res, profile);
}));
runtimeRouter.patch("/customers/me/password", ...userRoute(async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8) return fail(res, 400, "VALIDATION", "Enter your current password and a new password with at least 8 characters.");
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) return fail(res, 400, "INVALID_PASSWORD", "The current password is incorrect.");
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, config.BCRYPT_SALT_ROUNDS) } });
  return send(res, { changed: true });
}));
runtimeRouter.get("/policies", ...userRoute(async (req, res) => {
  const where = req.user!.role === "ADMIN" ? { deleted: false } : { deleted: false, customerId: req.user!.id };
  const items = await prisma.policy.findMany({ where, include: { product: { include: { category: true } }, coverages: true }, orderBy: { createdAt: "desc" } });
  return send(res, { items, total: items.length, page: 1, pageSize: items.length, totalPages: 1 });
}));
// Applications create a pending policy record so customers can track the
// request in My Page without implying that insurance coverage is already active.
runtimeRouter.post("/applications", ...userRoute(async (req, res) => {
  if (req.user!.role !== "CUSTOMER") return fail(res, 403, "CUSTOMER_ONLY", "Only customer accounts can apply for insurance.");
  const productKey = String(req.body?.productId ?? req.body?.product ?? "").trim();
  if (!productKey) return fail(res, 400, "VALIDATION", "Choose an insurance product to apply for.");

  const product = await prisma.product.findFirst({
    where: { OR: [{ id: productKey }, { slug: productKey }], isActive: true },
    include: { coverages: { orderBy: { coverageOrder: "asc" } } },
  });
  if (!product) return fail(res, 404, "PRODUCT_NOT_FOUND", "This insurance product is not available.");

  const existing = await prisma.policy.findFirst({
    where: { customerId: req.user!.id, productId: product.id, deleted: false, status: "PENDING" },
    include: { product: { include: { category: true } }, coverages: true },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return send(res, { policy: existing, alreadyApplied: true });

  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  const premiumText = product.examplePremiumEn ?? product.priceHintEn ?? "";
  const premium = Number(premiumText.replace(/[^0-9]/g, "")) || 0;
  const policy = await prisma.policy.create({
    data: {
      customerId: req.user!.id,
      productId: product.id,
      policyNumber: `APP-${now.getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      status: "PENDING",
      premium,
      planNameJa: product.nameJa,
      planNameEn: product.nameEn,
      effectiveDate: now,
      expiryDate,
      coverages: {
        create: product.coverages.map((coverage) => ({
          coverageId: coverage.id,
          labelJa: coverage.labelJa,
          labelEn: coverage.labelEn,
        })),
      },
    },
    include: { product: { include: { category: true } }, coverages: true },
  });
  return send(res, { policy, alreadyApplied: false }, 201);
}));
runtimeRouter.get("/policies/:id", ...userRoute(async (req, res) => {
  const item = await prisma.policy.findFirst({ where: { id: req.params.id, deleted: false, ...(req.user!.role === "ADMIN" ? {} : { customerId: req.user!.id }) }, include: { product: { include: { category: true } }, coverages: true, claims: { where: { deleted: false }, orderBy: { createdAt: "desc" } } } });
  return item ? send(res, item) : fail(res, 404, "NOT_FOUND", "Policy not found.");
}));

// Claims: authenticated customers can file and review claims for their own policies.
runtimeRouter.get("/claims", ...userRoute(async (req, res) => {
  const items = await prisma.claim.findMany({ where: { deleted: false, ...(req.user!.role === "ADMIN" ? {} : { policy: { customerId: req.user!.id } }) }, include: { policy: { include: { product: true } } }, orderBy: { createdAt: "desc" } });
  const summaries = items.map(item => ({ id: item.id, claimNumber: item.claimNumber, status: item.status, type: item.claimType, policyNumber: item.policy.policyNumber, estimatedAmount: item.propertyDamageEstimateYen, createdAt: item.createdAt, submittedAt: item.submittedAt, descriptionJa: item.descriptionJa, descriptionEn: item.descriptionEn }));
  return send(res, { items: summaries, total: summaries.length, page: 1, pageSize: summaries.length, totalPages: 1 });
}));
runtimeRouter.post("/claims", ...userRoute(async (req, res) => {
  const body = req.body ?? {};
  if (!body.policyId || !body.type || !body.occurredAt || !body.descriptionEn) return fail(res, 400, "VALIDATION", "Policy, incident type, date, and description are required.");
  const policy = await prisma.policy.findFirst({ where: { id: String(body.policyId), deleted: false, ...(req.user!.role === "ADMIN" ? {} : { customerId: req.user!.id }) } });
  if (!policy) return fail(res, 404, "POLICY_NOT_FOUND", "The selected policy was not found for your account.");
  const now = new Date();
  const claim = await prisma.claim.create({ data: {
    policyId: policy.id, claimNumber: `SIJ-${now.getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
    claimType: String(body.type), status: "RECEIVED", accidentDate: new Date(body.occurredAt),
    descriptionJa: String(body.descriptionJa ?? body.descriptionEn), descriptionEn: String(body.descriptionEn),
    accidentPlaceJa: String(body.accidentLocationJa ?? ""), accidentPlaceEn: String(body.accidentLocationEn ?? ""),
    injuredPeople: Number(body.injuredPeople) || 0, propertyDamageEstimateYen: Number(body.propertyDamageEstimateYen) || 0,
    policeReported: Boolean(body.policeReported), otherPartyNameJa: body.otherPartyNameJa, otherPartyNameEn: body.otherPartyNameEn,
    otherPartyPhone: body.otherPartyPhone, otherPartyPolicyNumber: body.otherPartyPolicyNumber,
    isDraft: false, submittedById: req.user!.id, submittedAt: now,
    statusHistory: { create: { fromStatus: null, toStatus: "RECEIVED", changedById: req.user!.id, commentEn: "Claim received.", commentJa: "事故の報告を受け付けました。" } },
  } });
  return send(res, { id: claim.id, claimNumber: claim.claimNumber }, 201);
}));
runtimeRouter.get("/claims/:id", ...userRoute(async (req, res) => {
  const item = await prisma.claim.findFirst({ where: { id: req.params.id, deleted: false, ...(req.user!.role === "ADMIN" ? {} : { policy: { customerId: req.user!.id } }) }, include: { policy: { include: { product: true } }, documents: { where: { deleted: false } }, statusHistory: { orderBy: { changedAt: "asc" } }, comments: { orderBy: { createdAt: "asc" } } } });
  return item ? send(res, { ...item, type: item.claimType, occurredAt: item.accidentDate, policyNumber: item.policy.policyNumber }) : fail(res, 404, "NOT_FOUND", "Claim not found.");
}));

// Small admin dashboard read APIs used by the existing admin home screen.
runtimeRouter.get("/admin/stats", ...adminRoute(async (_req, res) => {
  const [claimsInQueue, activePolicies, newCustomers, pendingDocuments] = await Promise.all([
    prisma.claim.count({ where: { deleted: false, status: { in: ["RECEIVED", "UNDER_REVIEW", "MORE_DOCUMENTS_NEEDED"] } } }),
    prisma.policy.count({ where: { deleted: false, status: "ACTIVE" } }),
    prisma.user.count({ where: { deleted: false, role: "CUSTOMER" } }),
    prisma.claimDocument.count({ where: { deleted: false } }),
  ]);
  return send(res, { claimsInQueue, activePolicies, newCustomers, pendingDocuments });
}));
runtimeRouter.get("/admin/audit-log", ...adminRoute(async (_req, res) => {
  const records = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  const items = records.map(record => ({ id: record.id, action: record.action, resourceType: record.targetType, resourceId: record.targetId, actorNameJa: record.adminNameJa ?? "管理者", actorNameEn: record.adminNameEn ?? "Administrator", createdAt: record.createdAt }));
  return send(res, { items, total: items.length, page: 1, pageSize: 50, totalPages: 1 });
}));
runtimeRouter.get("/admin/claim-queue", ...adminRoute(async (_req, res) => {
  const claims = await prisma.claim.findMany({ where: { deleted: false, status: { in: ["RECEIVED", "UNDER_REVIEW", "MORE_DOCUMENTS_NEEDED"] } }, include: { policy: { include: { customer: { include: { profile: true } } } } }, orderBy: { createdAt: "asc" }, take: 20 });
  const items = claims.map(claim => ({ id: claim.id, claimNumber: claim.claimNumber, status: claim.status, type: claim.claimType, policyNumber: claim.policy.policyNumber, createdAt: claim.createdAt, descriptionJa: claim.descriptionJa, descriptionEn: claim.descriptionEn, customer: { nameJa: claim.policy.customer.profile?.nameJa ?? "", nameEn: claim.policy.customer.profile?.nameEn ?? "" } }));
  return send(res, { items });
}));

runtimeRouter.get("/admin/product-categories", ...adminRoute(async (_req, res) => send(res, await prisma.productCategory.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } }))));
runtimeRouter.post("/admin/products", ...adminRoute(async (req, res) => {
  const body = req.body ?? {};
  if (!body.categoryId || !body.nameJa || !body.nameEn) return fail(res, 400, "VALIDATION", "Product category and names are required.");
  const slugBase = String(body.nameEn).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55) || "product";
  const slug = `${slugBase}-${randomUUID().slice(0, 6)}`;
  const active = body.enabledForCustomers !== false && body.status !== "DRAFT";
  const premium = Number(body.basePremiumYen) || 0;
  const product = await prisma.product.create({ data: {
    categoryId: String(body.categoryId), slug, nameJa: String(body.nameJa), nameEn: String(body.nameEn),
    taglineJa: String(body.taglineJa ?? ""), taglineEn: String(body.taglineEn ?? ""),
    descriptionJa: String(body.contentJa ?? ""), descriptionEn: String(body.contentEn ?? ""),
    priceHintJa: premium ? `月額 ${premium.toLocaleString("ja-JP")}円から` : null,
    priceHintEn: premium ? `From ¥${premium.toLocaleString("en-US")} per month` : null,
    examplePremiumJa: premium ? `月額 ${premium.toLocaleString("ja-JP")}円` : null,
    examplePremiumEn: premium ? `¥${premium.toLocaleString("en-US")} per month` : null,
    isActive: active,
  } });
  return send(res, product, 201);
}));
runtimeRouter.post("/admin/settings", ...adminRoute(async (req, res) => {
  const input = req.body ?? {};
  const settings = await prisma.siteSetting.upsert({ where: { key: "site" }, update: { value: JSON.stringify(input) }, create: { key: "site", value: JSON.stringify(input) } });
  return send(res, JSON.parse(settings.value));
}));
runtimeRouter.get("/admin/settings", ...adminRoute(async (_req, res) => {
  const settings = await prisma.siteSetting.findUnique({ where: { key: "site" } });
  return send(res, settings ? JSON.parse(settings.value) : {});
}));
