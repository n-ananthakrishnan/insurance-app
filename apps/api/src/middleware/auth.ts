import { sendError } from "./error-handler";
import type { ApiErrorCode } from "../shared";
import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { config as _config } from "../config";

const SECRET = (_config.JWT_SECRET as string) || "change-me";

function decodeToken(raw: string): jwt.JwtPayload {
  const decoded = jwt.verify(raw, SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
  return decoded;
}

function createToken(payload: jwt.JwtPayload): string {
  return jwt.sign(payload, SECRET, { algorithm: "HS256", expiresIn: "15m" });
}

export const auth: RequestHandler & { createToken?: typeof createToken } = Object.assign((req, _res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return next();

    const parts = header as string;
    const [scheme, token] = parts.split(" ");
    if (!scheme || !token || scheme.toLowerCase() !== "bearer") return next();

    const payload = decodeToken(token);
    (req as any).user = payload;
    next();
  } catch (err) {
    next(err);
  }
}, { createToken });

export { createToken };
