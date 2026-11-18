import { Router } from "express";
import { z } from "zod";
import { prisma, withRetry } from "../prisma";
import { authMiddleware, requireRole, type AuthRequest } from "../middleware/auth";
import { validateBody, validateParams, validateQuery } from "../utils/validator";
import { sendClaimsError } from "../middleware/error-handler";
import { Role } from "../shared";
import { ulid } from "ulid";

const router = Router();

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(["CUSTOMER", "ADMIN"]).optional(),
  verifiedOnly: z.coerce.boolean().optional(),
  search: z.string().optional(),
});

const updateProfileBody = z.object({
  nameJa: z.string().min(1).max(100),
  nameEn: z.string().min(1).max(100),
  furigana: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  postalCode: z.string().max(20).optional(),
  prefecture: z.string().max(100).optional(),
  city: z.string().max(200).optional(),
  addressLine: z.string().max(500).optional(),
});

const adminNoteBody = z.object({
  noteJa: z.string().min(1).max(2000),
  noteEn: z.string().min(1).max(2000),
  private: z.boolean().optional(),
});

const noteParams = z.object({
  customerId: z.string().uuid("customerIdInvalid"),
  noteId: z.string().uuid("noteIdInvalid"),
});

// Customers can only access their own profile.
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { id: req.user!.id, deleted: false },
      include: { customerProfile: true },
    })
  );

  if (!user) {
    return sendClaimsError(res, 404, "NOT_FOUND", "アカウントが見つかりませんでした。", "Account not found.");
  }

  return res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        nameJa: user.customerProfile?.nameJa ?? user.email,
        nameEn: user.customerProfile?.nameEn ?? user.email,
        furigana: user.customerProfile?.furigana ?? null,
        phone: user.customerProfile?.phone ?? null,
        postalCode: user.customerProfile?.postalCode ?? null,
        prefecture: user.customerProfile?.prefecture ?? null,
        city: user.customerProfile?.city ?? null,
        addressLine: user.customerProfile?.addressLine ?? null,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt.toISOString(),
      },
    },
    error: null,
  });
});

router.patch("/me", authMiddleware, validateBody(updateProfileBody), async (req: AuthRequest, res) => {
  const body = updateProfileBody.parse(req.body);

  const updated = await withRetry(() =>
    prisma.$transaction([
      prisma.customerProfile.update({
        where: { userId: req.user!.id },
        data: {
          nameJa: body.nameJa,
          nameEn: body.nameEn,
          furigana: body.furigana ?? null,
          phone: body.phone ?? null,
          postalCode: body.postalCode ?? null,
          prefecture: body.prefecture ?? null,
          city: body.city ?? null,
          addressLine: body.addressLine ?? null,
        },
      }),
      prisma.user.update({
        where: { id: req.user!.id },
        data: {
          nameJa: body.nameJa,
          nameEn: body.nameEn,
        },
      }),
    ])
  );

  return res.json({
    success: true,
    data: {
      user: {
        id: updated[1].id,
        email: updated[1].email,
        role: updated[1].role,
        nameJa: updated[1].nameJa,
        nameEn: updated[1].nameEn,
        emailVerified: updated[1].emailVerified,
        customerProfile: updated[0],
      },
    },
    error: null,
  });
});

// Admin: list customers with filters.
router.get("/", requireRole(Role.ADMIN), validateQuery(listQuery), async (req: AuthRequest, res) => {
  const query = listQuery.parse(req.query as unknown as Record<string, unknown>);
  const page = query.page;
  const pageSize = query.pageSize;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { deleted: false };
  if (query.role) where.role = query.role;
  if (query.verifiedOnly) where.emailVerified = true;
  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: "insensitive" } },
      { customerProfile: { nameJa: { contains: query.search, mode: "insensitive" } } },
      { customerProfile: { nameEn: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  const [items, total] = await withRetry(() =>
    prisma.$transaction([
      prisma.user.findMany({
        where,
        include: { customerProfile: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])
  );

  return res.json({
    success: true,
    data: {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        nameJa: u.customerProfile?.nameJa ?? "—",
        nameEn: u.customerProfile?.nameEn ?? "—",
        furigana: u.customerProfile?.furigana ?? null,
        phone: u.customerProfile?.phone ?? null,
        postalCode: u.customerProfile?.postalCode ?? null,
        prefecture: u.customerProfile?.prefecture ?? null,
        city: u.customerProfile?.city ?? null,
        addressLine: u.customerProfile?.addressLine ?? null,
        emailVerified: u.emailVerified,
        createdAt: u.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
    error: null,
  });
});

// Admin: get a customer by id
router.get("/:id", requireRole(Role.ADMIN), validateParams(z.object({ id: z.string().uuid("customerIdInvalid") })), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const user = await withRetry(() =>
    prisma.user.findUnique({
      where: { id, deleted: false },
      include: { customerProfile: true },
    })
  );

  if (!user) {
    return sendClaimsError(res, 404, "NOT_FOUND", "顧客が見つかりませんでした。", "Customer not found.");
  }

  return res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      nameJa: user.customerProfile?.nameJa ?? "—",
      nameEn: user.customerProfile?.nameEn ?? "—",
      furigana: user.customerProfile?.furigana ?? null,
      phone: user.customerProfile?.phone ?? null,
      postalCode: user.customerProfile?.postalCode ?? null,
      prefecture: user.customerProfile?.prefecture ?? null,
      city: user.customerProfile?.city ?? null,
      addressLine: user.customerProfile?.addressLine ?? null,
      emailVerified: user.emailVerified,
      lockedUntil: user.lockedUntil?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    error: null,
  });
});

// Admin: customer notes
router.get("/:id/notes", requireRole(Role.ADMIN), validateParams(z.object({ id: z.string().uuid("customerIdInvalid") })), async (req: AuthRequest, res) => {
  const { id } = req.params;
  // Verify the customer exists
  const customer = await withRetry(() => prisma.user.findUnique({ where: { id, deleted: false } }));
  if (!customer) {
    return sendClaimsError(res, 404, "NOT_FOUND", "顧客が見つかりませんでした。", "Customer not found.");
  }

  const notes = await withRetry(() =>
    prisma.customerNote.findMany({
      where: { customerId: id },
      orderBy: { createdAt: "desc" },
    })
  );

  return res.json({
    success: true,
    data: {
      items: notes.map((n) => ({
        id: n.id,
        customerId: n.customerId,
        noteJa: n.noteJa,
        noteEn: n.noteEn,
        private: n.private,
        createdBy: n.createdBy,
        createdAt: n.createdAt.toISOString(),
      })),
      total: notes.length,
    },
    error: null,
  });
});

router.post("/:id/notes", requireRole(Role.ADMIN), validateParams(z.object({ id: z.string().uuid("customerIdInvalid") })), validateBody(adminNoteBody), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const body = adminNoteBody.parse(req.body);

  // Verify customer
  const customer = await withRetry(() => prisma.user.findUnique({ where: { id, deleted: false } }));
  if (!customer) {
    return sendClaimsError(res, 404, "NOT_FOUND", "顧客が見つかりませんでした。", "Customer not found.");
  }

  const note = await withRetry(() =>
    prisma.customerNote.create({
      data: {
        id: ulid(),
        customerId: id,
        noteJa: body.noteJa,
        noteEn: body.noteEn,
        private: body.private ?? false,
        createdBy: req.user!.id,
      },
    })
  );

  return res.status(201).json({
    success: true,
    data: {
      id: note.id,
      customerId: note.customerId,
      noteJa: note.noteJa,
      noteEn: note.noteEn,
      private: note.private,
      createdBy: note.createdBy,
      createdAt: note.createdAt.toISOString(),
    },
    error: null,
  });
});

router.patch("/:id/notes/:noteId", requireRole(Role.ADMIN), validateParams(z.object({ id: z.string().uuid("customerIdInvalid"), noteId: z.string().uuid("noteIdInvalid") })), validateBody(adminNoteBody), async (req: AuthRequest, res) => {
  const { id, noteId } = req.params;
  const body = adminNoteBody.parse(req.body);

  const note = await withRetry(() =>
    prisma.customerNote.update({
      where: { id: noteId, customerId: id },
      data: {
        noteJa: body.noteJa,
        noteEn: body.noteEn,
        private: body.private ?? false,
      },
    })
  );

  return res.json({
    success: true,
    data: {
      id: note.id,
      customerId: note.customerId,
      noteJa: note.noteJa,
      noteEn: note.noteEn,
      private: note.private,
      createdBy: note.createdBy,
      createdAt: note.createdAt.toISOString(),
    },
    error: null,
  });
});

router.delete("/:id/notes/:noteId", requireRole(Role.ADMIN), validateParams(z.object({ id: z.string().uuid("customerIdInvalid"), noteId: z.string().uuid("noteIdInvalid") })), async (req: AuthRequest, res) => {
  const { id, noteId } = req.params;

  await withRetry(() =>
    prisma.customerNote.delete({
      where: { id: noteId, customerId: id },
    })
  );

  return res.json({
    success: true,
    data: { deleted: true },
    error: null,
  });
});

export { router as customersRouter };
