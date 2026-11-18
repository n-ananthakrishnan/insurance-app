// Shared API error types. Imported by the API layer via `#shared` (workspace reference).
export enum ApiErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  INVALID_INPUT = "INVALID_INPUT",
  INVALID_TRANSITION = "INVALID_TRANSITION",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  DUPLICATE_EMAIL = "DUPLICATE_EMAIL",
  EXPIRED_TOKEN = "EXPIRED_TOKEN",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  RATE_LIMIT = "RATE_LIMIT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  EMPTY_RESPONSE = "EMPTY_RESPONSE",
  INVALID_MIME_TYPE = "INVALID_MIME_TYPE",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  INVALID_STATE = "INVALID_STATE",
  CANNOT_DELETE = "CANNOT_DELETE",
  NETWORK_ERROR = "NETWORK_ERROR",
}

export type ApiErrorDetail = string | number | boolean | null | ApiErrorDetail[] | { [k: string]: ApiErrorDetail };

export interface ApiErrorEnvelope {
  success: false;
  data: null;
  error: {
    code: string;
    messageJa: string;
    messageEn: string;
    details?: Record<string, unknown> | ApiErrorDetail[] | undefined;
  };
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  error: null;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;
