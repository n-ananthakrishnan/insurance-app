import type { ApiErrorCode } from "../shared";
import { Request, Response, NextFunction } from "express";

export type ApiError = {
  code: ApiErrorCode;
  httpStatus: number;
  messageJa: string;
  messageEn: string;
  details?: string;
};

export function sendError(
  res: Response,
  httpStatus: number,
  messageJa: string,
  messageEn?: string,
  details?: string,
): void {
  const code: ApiErrorCode = "INTERNAL_ERROR";
  const body: ApiError = {
    code,
    httpStatus,
    messageJa,
    messageEn: messageEn ?? messageJa,
    details,
  };
  res.status(httpStatus).json(body);
}

export function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    typeof (err as Record<string, unknown>).code === "string" &&
    "httpStatus" in err &&
    typeof (err as Record<string, unknown>).httpStatus === "number"
  );
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (isApiError(err)) {
    const e = err as ApiError;
    sendError(res, e.httpStatus, e.messageJa, e.messageEn, e.details);
    return;
  }
  console.error("[error-handler] unhandled error:", err);
  sendError(res, 500, "サーバーで予期しないエラーが発生しました。", "An unexpected server error occurred.", undefined);
}
