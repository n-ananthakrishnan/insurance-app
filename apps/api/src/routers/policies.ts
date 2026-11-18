import { Router } from "express";
import { z } from "zod";
import { ulid } from "ulid";
import { prisma, withRetry } from "../prisma";
import { authMiddleware, requireRole, type AuthRequest } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../utils/validator";
import { createError, sendClaimsError } from "../middleware/error-handler";
import { config } from "../config";
import {
  Role,
  PolicyStatus,
  ALLOWED_POLICY_TRANSITIONS,
  PaginationQuery,
  PageEnvelope,
} from "../shared";
import type { CustomerProfile, Policy, PolicyCoverage } from "@prisma/client";

const router = Router();

// ---------- Query schemas ----------

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum([...Object.values(PolicyStatus) as PolicyStatus[]]).optional(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
});

// ---------- Policy schemas ----------

const createPolicyBody = z.object({
  categoryId: z.string().uuid("categoryIdInvalid"),
  productId: z.string().uuid("productIdInvalid"),
  coverages: z
    .array(
      z.object({
        coverageId: z.string().uuid("coverageIdInvalid"),
        termYears: z.coerce.number().int().min(1).max(30).default(1),
        amount: z.coerce.number().min(0).default(0),
        notesJa: z.string().optional(),
        notesEn: z.string().optional(),
      })
    )
    .min(1, "coveragesRequired"),
  paymentCycle: z.enum(["monthly", "quarterly", "annual", "one-time"]).default("annual"),
  startDate: z.string().refine((s) => !isNaN(Date.parse(s)), "startDateInvalid"),
});

const updatePolicyBody = z.object({
  status: z.enum([...Object.values(PolicyStatus) as PolicyStatus[]]).optional(),
  // Admin can adjust payment cycle / coverages in a future phase; for now limited.
}).refine(
  (data) => {
    if (data.status !== undefined) {
      // status transitions validated in service layer
    }
    return true;
  },
  "policyUpdateInvalid"
);

const policyParams = z.object({
  id: z.string().uuid("policyIdInvalid"),
});

// ---------- Helpers ----------

function toPolicyEnvelope(policy: Policy & { customer: { customerProfile: CustomerProfile | null } } & { coverages: PolicyCoverage[] }) {
  return {
    id: policy.id,
    policyNumber: policy.policyNumber,
    customerId: policy.customerId,
    customer: {
      id: policy.customer.id,
      nameJa: policy.customer.customerProfile?.nameJa ?? "—",
      nameEn: policy.customer.customerProfile?.nameEn ?? "—",
      phone: policy.customer.customerProfile?.phone ?? null,
    },
    categoryId: policy.categoryId,
    productId: policy.productId,
    status: policy.status,
    startDate: policy.startDate.toISOString(),
    endDate: policy.endDate?.toISOString() ?? null,
    paymentCycle: policy.paymentCycle,
    monthlyPremiumYen: policy.monthlyPremiumYen ?? null,
    totalPremiumYen: policy.totalPremiumYen ?? null,
    coverages: policy.coverages.map((c) => ({
      id: c.id,
      coverageId: c.coverageId,
      termYears: c.termYears,
      amount: c.amount,
      notesJa: c.notesJa ?? null,
      notesEn: c.notesEn ?? null,
    })),
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString(),
  };
}

// ---------- Routing ----------

// All policy endpoints require auth.
router.use(authMiddleware);

// List policies (authenticated user can list their own; ADMIN can list all with filters).
router.get("/", validateQuery(listQuery), async (req: AuthRequest, res) => {
  const query = listQuery.parse(req.query as unknown as Record<string, unknown>);
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;

  // Build filters
  const where: Record<string, unknown> = { deleted: false };
  if (query.status) {
    where.status = query.status;
  }
  if (req.user!.role === Role.CUSTOMER) {
    // Customers only see their own policies.
    where.customerId = req.user!.id;
  } else {
    // Admin filters
    if (query.customerPhone) {
      where.customer = { customerProfile: { phone: { equals: query.customerPhone, mode: "insensitive" } } };
    }
    if (query.customerName) {
      where.customer = { customerProfile: { nameJa: { contains: query.customerName, mode: "insensitive" } } };
    }
  }

  const [items, total] = await withRetry(() =>
    prisma.$transaction([
      prisma.policy.findMany({
        where,
        include: {
          customer: { include: { customerProfile: true } },
          coverages: { include: { coverage: true } },
        },
        orderBy: { startDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.policy.count({ where }),
    ])
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return res.json({
    success: true,
    data: {
      items: items.map(toPolicyEnvelope),
      total,
      page,
      pageSize,
      totalPages,
    },
    error: null,
  });
});

// Get a single policy.
router.get("/:id", validateParams(policyParams), async (req: AuthRequest, res) => {
  const { id } = policyParams.parse(req.params);
  const policy = await withRetry(() =>
    prisma.policy.findUnique({
      where: { id, deleted: false },
      include: {
        customer: { include: { customerProfile: true } },
        coverages: { include: { coverage: true } },
      },
    })
  );

  if (!policy) {
    return sendClaimsError(res, 404, "NOT_FOUND", "契約が見つかりませんでした。", "Policy not found.");
  }

  // Customers can only see their own policies.
  if (req.user!.role === Role.CUSTOMER && policy.customerId !== req.user!.id) {
    return sendClaimsError(res, 403, "FORBIDDEN", "この契約にアクセスする権限がありません。", "You do not have access to this policy.");
  }

  return res.json({
    success: true,
    data: toPolicyEnvelope(policy),
    error: null,
  });
});

// Create a policy (customer starts a policy from a product; admin can also create directly).
router.post("/", validateBody(createPolicyBody), async (req: AuthRequest, res) => {
  const body = createPolicyBody.parse(req.body);

  // Look up category+product+coverages
  const category = await withRetry(() => prisma.productCategory.findUnique({ where: { id: body.categoryId } }));
  if (!category || category.deleted) {
    return sendClaimsError(res, 400, "NOT_FOUND", "商品カテゴリが見つかりませんでした。", "Product category not found.");
  }

  const product = await withRetry(() =>
    prisma.product.findUnique({
      where: { id: body.productId },
      include: { coverages: { include: { coverage: true } } },
    })
  );
  if (!product || product.deleted) {
    return sendClaimsError(res, 400, "NOT_FOUND", "商品が見つかりませんでした。", "Product not found.");
  }

  // Verify the user is allowed to buy this product: either they are admin, or the category+product is enabled.
  if (req.user!.role === Role.CUSTOMER && (!product.enabledForCustomers)) {
    return sendClaimsError(res, 400, "FORBIDDEN", "この商品は現在新規契約できません。", "This product is not available for new policies.");
  }

  // Validate each requested coverage exists and belongs to this product
  const requestedCoverageIds = new Set(body.coverages.map((c) => c.coverageId));
  const productCoverageMap = new Map(product.coverages.map((c) => [c.coverageId, c]));
  for (const covId of requestedCoverageIds) {
    if (!productCoverageMap.has(covId)) {
      return sendClaimsError(res, 400, "INVALID_INPUT", "指定された補償内容は、この商品に含まれていません。", "The requested coverage is not included in this product.");
    }
  }

  // Build premium calculation: sum(base premium per coverage * amount factor * term factor) — simplified for demo.
  // In reality this would be a rating engine; for the demo we compute a reasonable estimate.
  const basePremiumPerCoverage = product.basePremiumYen ?? 0;
  const termYears = 1; // start with 1-year terms for simplicity
  const totalBase = body.coverages.reduce((sum, c) => {
    const coverage = productCoverageMap.get(c.coverageId)!;
    const amountFactor = Math.max(1, (c.amount / 1_000_000)); // per million yen factor (demo)
    return sum + (coverage.basePremiumYen ?? basePremiumPerCoverage) * amountFactor * termYears;
  }, 0);

  const annualPremium = Math.round(totalBase);
  const monthlyPremium = Math.round(annualPremium / 12);
  const totalPremium = annualPremium * termYears;
  const startDate = new Date(body.startDate);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + termYears);

  const policyNumber = `SIJ-P-${String(await prisma.policy.count() + 1).padStart(6, "0")}`;

  const created = await withRetry(() =>
    prisma.policy.create({
      data: {
        id: ulid(),
        policyNumber,
        customerId: req.user!.id,
        categoryId: body.categoryId,
        productId: body.productId,
        status: PolicyStatus.ACTIVE,
        startDate,
        endDate,
        paymentCycle: body.paymentCycle,
        monthlyPremiumYen: monthlyPremium,
        totalPremiumYen: totalPremium,
        coverages: {
          create: body.coverages.map((c) => ({
            id: ulid(),
            coverageId: c.coverageId,
            termYears: c.termYears,
            amount: c.amount,
            notesJa: c.notesJa ?? null,
            notesEn: c.notesEn ?? null,
          })),
        },
      },
      include: {
        customer: { include: { customerProfile: true } },
        coverages: { include: { coverage: true } },
      },
    })
  );

  return res.status(201).json({
    success: true,
    data: toPolicyEnvelope(created),
    error: null,
  });
});

// Update a policy (status transitions + limited edits).
router.patch("/:id", validateParams(policyParams), validateBody(updatePolicyBody), async (req: AuthRequest, res) => {
  const { id } = policyParams.parse(req.params);
  const body = updatePolicyBody.parse(req.body);

  const policy = await withRetry(() =>
    prisma.policy.findUnique({
      where: { id, deleted: false },
      include: { coverages: true },
    })
  );

  if (!policy) {
    return sendClaimsError(res, 404, "NOT_FOUND", "契約が見つかりませんでした。", "Policy not found.");
  }

  // Authorization: customer can only update their own; admin can update all.
  if (req.user!.role === Role.CUSTOMER && policy.customerId !== req.user!.id) {
    return sendClaimsError(res, 403, "FORBIDDEN", "この契約を更新する権限がありません。", "You do not have permission to update this policy.");
  }

  if (body.status !== undefined) {
    // Validate transition
    const allowed = ALLOWED_POLICY_TRANSITIONS[PolicyStatus[policy.status] as PolicyStatus];
    if (!allowed || !allowed.includes(body.status as PolicyStatus)) {
      return sendClaimsError(
        res,
        400,
        "INVALID_TRANSITION",
        `この契約は "${PolicyStatus[policy.status]}" のため、指定された状態に変更できません。`,
        `This policy is in "${PolicyStatus[policy.status]}" and cannot be moved to the requested status.`,
        { current: PolicyStatus[policy.status], requested: body.status }
      );
    }

    // For ACTIVE -> other transitions, require a reason.
    if (policy.status === PolicyStatus.ACTIVE && body.status !== PolicyStatus.ACTIVE) {
      if (!req.body.reasonJa && !req.body.reasonEn) {
        return sendClaimsError(
          res,
          400,
          "INVALID_INPUT",
          "契約状態の変更には理由が必要です。",
          "A reason is required to change the policy status.",
          { required: ["reasonJa", "reasonEn"] }
        );
      }
      await withRetry(() =>
        prisma.policy.update({
          where: { id },
          data: {
            status: body.status,
            cancelledAt: body.status !== PolicyStatus.ACTIVE ? new Date() : null,
            reasonJa: body.reasonJa ?? null,
            reasonEn: body.reasonEn ?? null,
          },
        })
      );
    } else {
      await withRetry(() => prisma.policy.update({ where: { id }, data: { status: body.status } }));
    }

    return res.json({
      success: true,
      data: {
        policyNumber: policy.policyNumber,
        status: body.status,
        messageJa: "契約状態を更新しました。",
        messageEn: "Policy status updated.",
      },
      error: null,
    });
  }

  return sendClaimsError(res, 400, "INVALID_INPUT", "更新内容が空です。", "No updates provided.");
});

// Cancel a policy (shortcut: ACTIVE -> CANCELLED).
router.delete("/:id", validateParams(policyParams), async (req: AuthRequest, res) => {
  const { id } = policyParams.parse(req.params);

  const policy = await withRetry(() =>
    prisma.policy.findUnique({ where: { id, deleted: false } })
  );

  if (!policy) {
    return sendClaimsError(res, 404, "NOT_FOUND", "契約が見つかりませんでした。", "Policy not found.");
  }

  if (req.user!.role === Role.CUSTOMER && policy.customerId !== req.user!.id) {
    return sendClaimsError(res, 403, "FORBIDDEN", "この契約を中止する権限がありません。", "You do not have permission to cancel this policy.");
  }

  if (policy.status !== PolicyStatus.ACTIVE) {
    return sendClaimsError(
      res,
      400,
      "INVALID_TRANSITION",
      "有効な契約のみ中止できます。",
      "Only active policies can be cancelled.",
      { current: PolicyStatus[policy.status] }
    );
  }

  // Admin requires reason; customer is assumed to be cancelling their own.
  await withRetry(() =>
    prisma.policy.update({
      where: { id },
      data: {
        status: PolicyStatus.CANCELLED,
        cancelledAt: new Date(),
        reasonJa: req.user!.role === Role.ADMIN ? (req.body.reasonJa as string | undefined ?? "顧客による中止") : null,
        reasonEn: req.user!.role === Role.ADMIN ? (req.body.reasonEn as string | undefined ?? "Cancelled by customer") : null,
      },
    })
  );

  return res.json({
    success: true,
    data: { policyNumber: policy.policyNumber, status: PolicyStatus.CANCELLED },
    error: null,
  });
});

export { router as policiesRouter };
