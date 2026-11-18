import { Router } from "express";
import { z } from "zod";
import { prisma, withRetry } from "../prisma";
import { type AuthRequest } from "../middleware/auth";
import { validateBody } from "../utils/validator";
import { sendClaimsError } from "../middleware/error-handler";

const router = Router();

const contactBody = z.object({
  nameJa: z.string().max(100).optional(),
  nameEn: z.string().max(100).optional(),
  email: z.string().email("invalidEmail").optional(),
  phone: z.string().max(50).optional(),
  subjectJa: z.string().min(1).max(200),
  subjectEn: z.string().min(1).max(200),
  messageJa: z.string().min(1).max(5000),
  messageEn: z.string().min(1).max(5000),
  policyNumber: z.string().max(50).optional(),
  claimNumber: z.string().max(50).optional(),
  consentToPrivacy: z.literal(true, { errorMap: () => ({ message: "consentToPrivacyRequired" }) }),
});

router.post("/", validateBody(contactBody), async (req: AuthRequest, res) => {
  const body = contactBody.parse(req.body);

  // If the user is logged in, use their name/email as a default unless they provided their own.
  let nameJa = body.nameJa;
  let nameEn = body.nameEn;
  let email = body.email;
  if (req.user) {
    if (!nameJa) nameJa = req.user.nameJa;
    if (!nameEn) nameEn = req.user.nameEn;
    if (!email) email = req.user.email;
  }

  if (!nameJa || !nameEn || !email) {
    return sendClaimsError(
      res,
      400,
      "INVALID_INPUT",
      "お名前、メールアドレス、および内容は必須です。",
      "Name, email, and message are required (either provided or from your account).",
      { required: ["nameJa", "nameEn", "email"] }
    );
  }

  const id = await withRetry(() =>
    prisma.contactMessage.create({
      data: {
        id: crypto.randomUUID(),
        nameJa,
        nameEn,
        email,
        phone: body.phone ?? null,
        subjectJa: body.subjectJa,
        subjectEn: body.subjectEn,
        messageJa: body.messageJa,
        messageEn: body.messageEn,
        policyNumber: body.policyNumber ?? null,
        claimNumber: body.claimNumber ?? null,
        userId: req.user?.id ?? null,
        status: "RECEIVED",
      },
    })
  );

  // In production, send a confirmation email. For the demo, we log.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[CONTACT] New inquiry #${id} from ${email}`, {
      subjectJa: body.subjectJa,
      subjectEn: body.subjectEn,
    });
  }

  return res.status(201).json({
    success: true,
    data: {
      id: id,
      messageJa: "お問い合わせを送信しました。後日、担当者からご連絡いたします。",
      messageEn: "Your inquiry has been sent. We will contact you shortly.",
    },
    error: null,
  });
});

export { router as contactRouter };
