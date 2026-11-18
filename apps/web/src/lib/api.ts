const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";
const TOKEN_KEY = "sample_insurance_access_token";

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    messageJa: string;
    messageEn: string;
    details?: Record<string, unknown>;
  } | null;
}

class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly messageJa: string,
    public readonly messageEn: string,
    public readonly statusCode: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(messageJa);
    this.name = "ApiError";
  }
}

function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

async function fetchJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  let token: string | null = null;
  if (typeof window !== "undefined") token = window.localStorage.getItem(TOKEN_KEY);
  const opts: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> | undefined),
    },
    credentials: "include",
  };

  let res = await fetch(`${BASE_URL}${path}`, opts);
  if (res.status === 401 && token && path !== "/auth/refresh" && path !== "/auth/login") {
    try {
      const refresh = await fetch(`${BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" });
      const refreshBody = await refresh.json() as ApiEnvelope<{ accessToken: string }>;
      if (refresh.ok && refreshBody.success && refreshBody.data?.accessToken) {
        token = refreshBody.data.accessToken;
        setAccessToken(token);
        (opts.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        res = await fetch(`${BASE_URL}${path}`, opts);
      } else {
        setAccessToken(null);
      }
    } catch {
      // Preserve the original 401 response so the caller can handle sign-out.
    }
  }

  let body: ApiEnvelope<T>;
  try {
    body = await res.json();
  } catch {
    throw new ApiError(
      "NETWORK_ERROR",
      "サーバーとの通信に失敗しました。",
      "Network error. Please try again.",
      res.status
    );
  }

  if (!body.success) {
    throw new ApiError(
      body.error!.code,
      body.error!.messageJa,
      body.error!.messageEn,
      res.status,
      body.error!.details
    );
  }

  if (body.data === null) {
    throw new ApiError(
      "EMPTY_RESPONSE",
      "レスポンスがありません。",
      "No response data.",
      res.status
    );
  }

  return body.data as T;
}

export const api = {
  get<T>(path: string, init?: RequestInit): Promise<T> {
    return fetchJson<T>(path, { ...init, method: "GET" });
  },

  post<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return fetchJson<T>(path, {
      ...init,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown, init?: RequestInit): Promise<T> {
    return fetchJson<T>(path, {
      ...init,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, init?: RequestInit): Promise<T> {
    return fetchJson<T>(path, { ...init, method: "DELETE" });
  },

  // POST with FormData (for file uploads — no JSON content-type)
  postForm<T>(path: string, formData: FormData, init?: RequestInit): Promise<T> {
    return fetchJson<T>(path, {
      ...init,
      method: "POST",
      body: formData,
      headers: { ...init?.headers },
    });
  },
};

// Re-export useful types
export type { ApiEnvelope, ApiError };

export function isApiErrorInstance(err: unknown): err is ApiError {
  return isApiError(err);
}
