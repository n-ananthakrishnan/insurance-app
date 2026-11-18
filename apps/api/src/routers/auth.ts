import { Router } from "express";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import { parse as parseCookie } from "cookie";
import { prisma } from "../prisma";
import { config } from "../config";

export const authRouter = Router();

const SALT_ROUNDS = Number((config as any).BCRYPT_SALT_ROUNDS ?? 12);
const JWT_SECRET = String((config as any).JWT_SECRET ?? "change-me");
const MAX_ATTEMPTS = Number((config as any).LOGIN_MAX_ATTEMPTS ?? 5);

function signAccess(user: { id: string; email: string; role: string }) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "15m",
  });
}

function err(res: any, status: number, messageJa: string, messageEn: string, code = "ERROR") {
  return res.status(status).json({ success: false, data: null, error: { code, messageJa, messageEn } });
}

function getRefreshToken(req: import("express").Request) {
  const parsedCookies = parseCookie(req.headers.cookie ?? "");
  return (req as any).cookies?.refreshToken || parsedCookies.refreshToken || req.body?.refreshToken;
}

authRouter.post("/register", async (req, res) => {
  try {
    const { email, password, passwordConfirm, nameJa, nameEn, furigana, phone, postalCode, prefecture, city, addressLine, addressJa, addressEn } = req.body ?? {};
    if (!email || !password) return err(res, 400, "メールアドレスとパスワードは必須です。", "email and password are required", "VALIDATION");
    if (password !== passwordConfirm) return err(res, 400, "パスワードが一致しません。", "password and passwordConfirm must match", "VALIDATION");
    if (String(password).length < 8) return err(res, 400, "パスワードは8文字以上で設定してください。", "password must be at least 8 characters", "VALIDATION");

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return err(res, 409, "そのメールアドレスは既に登録されています。", "A user with this email already exists", "CONFLICT");

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: "CUSTOMER",
        emailVerified: true,
        emailVerifiedAt: new Date(),
        profile: {
          create: {
            nameJa: nameJa ? String(nameJa) : "",
            nameEn: nameEn ? String(nameEn) : "",
            furigana: furigana ? String(furigana) : null,
            phone: phone ? String(phone) : null,
            postalCode: postalCode ? String(postalCode) : null,
            prefecture: prefecture ? String(prefecture) : null,
            city: city ? String(city) : null,
            addressLine: addressLine ? String(addressLine) : null,
            addressJa: addressJa ? String(addressJa) : null,
            addressEn: addressEn ? String(addressEn) : null,
          },
        },
      },
      include: { profile: true },
    });

    const token = uuid();
    await prisma.refreshToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const accessToken = signAccess({ id: user.id, email: user.email, role: user.role });
    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: { ja: user.profile?.nameJa ?? "", en: user.profile?.nameEn ?? "" },
        },
        accessToken,
      },
      error: null,
    });
  } catch (e: any) {
    console.error("register error", e);
    return err(res, 500, "登録中にエラーが発生しました。", e?.message || "Registration failed", "INTERNAL");
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return err(res, 400, "メールアドレスとパスワードは必須です。", "email and password are required", "VALIDATION");

    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() }, include: { profile: true } });
    if (!user) return err(res, 401, "メールアドレスまたはパスワードが正しくありません。", "Invalid credentials", "UNAUTHORIZED");

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return err(res, 423, "アカウントがロックされています。", "Account is locked", "LOCKED");
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      const nextAttempts = (user.loginAttempts ?? 0) + 1;
      const data: any = { loginAttempts: nextAttempts };
      if (nextAttempts >= MAX_ATTEMPTS) data.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
      await prisma.user.update({ where: { id: user.id }, data });
      if (nextAttempts >= MAX_ATTEMPTS) {
        return err(res, 423, "ログイン失敗回数が上限に達しました。", "Too many failed attempts; account locked", "LOCKED");
      }
      return err(res, 401, "メールアドレスまたはパスワードが正しくありません。", "Invalid credentials", "UNAUTHORIZED");
    }

    await prisma.user.update({ where: { id: user.id }, data: { loginAttempts: 0, lockedUntil: null } });

    const token = uuid();
    await prisma.refreshToken.create({
      data: { token, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const accessToken = signAccess({ id: user.id, email: user.email, role: user.role });
    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: { ja: user.profile?.nameJa ?? "", en: user.profile?.nameEn ?? "" },
        },
        accessToken,
      },
      error: null,
    });
  } catch (e: any) {
    console.error("login error", e);
    return err(res, 500, "ログイン中にエラーが発生しました。", e?.message || "Login failed", "INTERNAL");
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    const token = getRefreshToken(req);
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token: String(token) } }).catch(() => {});
    }
    res.clearCookie("refreshToken", { path: "/" });
    return res.json({ success: true, data: { ok: true }, error: null });
  } catch {
    return res.json({ success: true, data: { ok: true }, error: null });
  }
});

authRouter.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization as string | undefined;
    if (!header?.startsWith("Bearer ")) return err(res, 401, "認証が必要です。", "Authentication required", "UNAUTHORIZED");
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id }, include: { profile: true } });
    if (!user) return err(res, 404, "ユーザーが見つかりません。", "User not found", "NOT_FOUND");
    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: { ja: user.profile?.nameJa ?? "", en: user.profile?.nameEn ?? "" },
        },
      },
      error: null,
    });
  } catch (e) {
    return err(res, 401, "認証が無効です。", "Invalid authentication", "UNAUTHORIZED");
  }
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const token = getRefreshToken(req);
    if (!token) return err(res, 401, "リフレッシュトークンがありません。", "Refresh token required", "UNAUTHORIZED");
    const record = await prisma.refreshToken.findUnique({ where: { token: String(token) }, include: { user: true } });
    if (!record || record.expiresAt < new Date()) {
      return err(res, 401, "リフレッシュトークンが無効です。", "Invalid refresh token", "UNAUTHORIZED");
    }
    const accessToken = signAccess({ id: record.user.id, email: record.user.email, role: record.user.role });
    return res.json({ success: true, data: { accessToken }, error: null });
  } catch (e: any) {
    return err(res, 500, "更新に失敗しました。", e?.message || "Refresh failed", "INTERNAL");
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (!email) return err(res, 400, "メールアドレスは必須です。", "email is required", "VALIDATION");
    const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (user) {
      const token = uuid();
      await prisma.passwordResetToken.create({
        data: { token, userId: user.id, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      });
      const baseUrl = (config as any).FRONTEND_URL ?? "http://localhost:3000";
      console.log("[dev] password reset link:", `${baseUrl}/reset-password?token=${token}`);
    }
    return res.json({ success: true, data: { ok: true }, error: null });
  } catch (e: any) {
    return err(res, 500, "処理に失敗しました。", e?.message || "Failed", "INTERNAL");
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const { token, password, passwordConfirm } = req.body ?? {};
    if (!token || !password) return err(res, 400, "トークンとパスワードは必須です。", "token and password are required", "VALIDATION");
    if (password !== passwordConfirm) return err(res, 400, "パスワードが一致しません。", "passwords must match", "VALIDATION");
    const record = await prisma.passwordResetToken.findUnique({ where: { token: String(token) } });
    if (!record || record.expiresAt < new Date() || record.used) {
      return err(res, 400, "トークンが無効です。", "Invalid or expired token", "VALIDATION");
    }
    const hash = await bcrypt.hash(String(password), SALT_ROUNDS);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash: hash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    ]);
    return res.json({ success: true, data: { ok: true }, error: null });
  } catch (e: any) {
    return err(res, 500, "処理に失敗しました。", e?.message || "Failed", "INTERNAL");
  }
});
