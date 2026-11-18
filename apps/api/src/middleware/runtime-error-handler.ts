import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";

export const runtimeErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ success: false, data: null, error: { code: "CONFLICT", messageEn: "A record with these details already exists.", messageJa: "同じ情報のデータがすでに登録されています。" } });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", messageEn: "The requested record was not found.", messageJa: "指定されたデータが見つかりません。" } });
      return;
    }
    if (error.code === "P2003" || error.code === "P2023") {
      res.status(400).json({ success: false, data: null, error: { code: "INVALID_INPUT", messageEn: "The supplied record reference is invalid.", messageJa: "指定された情報を確認してください。" } });
      return;
    }
  }
  console.error("[api] request failed", error);
  res.status(500).json({ success: false, data: null, error: { code: "INTERNAL_ERROR", messageEn: "An unexpected server error occurred.", messageJa: "サーバーで予期しないエラーが発生しました。" } });
};
