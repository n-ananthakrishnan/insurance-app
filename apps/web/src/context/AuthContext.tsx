"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, isApiErrorInstance as isApiError, setAccessToken } from "@/lib/api";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  nameJa: string;
  nameEn: string;
  emailVerified: boolean;
}

type ApiUser = Omit<Partial<User>, "id" | "email" | "role"> & {
  id: string; email: string; role: User["role"];
  name?: { ja?: string; en?: string };
  nameJa?: string; nameEn?: string;
};

function normalizeUser(user: ApiUser): User {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    nameJa: user.nameJa ?? user.name?.ja ?? "",
    nameEn: user.nameEn ?? user.name?.en ?? "",
    emailVerified: user.emailVerified ?? true,
  };
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, redirectTo?: string) => Promise<void>;
  register: (data: RegisterPayload, redirectTo?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  fetchMe: () => Promise<void>;
  isAdmin: boolean;
  error: string | null;
  clearError: () => void;
}

export interface RegisterPayload {
  nameJa: string;
  nameEn: string;
  furigana?: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phone?: string;
  postalCode?: string;
  prefecture?: string;
  city?: string;
  addressLine?: string;
  consentToTerms: boolean;
  consentToPrivacy: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Initial load: try to get the current user via /me
  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const me = await api.get<{ user: ApiUser }>("/auth/me");
        if (!cancelled) {
          setUser(normalizeUser(me.user));
        }
      } catch (err) {
        if (!cancelled && isApiError(err) && err.statusCode === 401) {
          // Not logged in — clear user
          setUser(null);
        } else if (!cancelled && !(err instanceof TypeError)) {
          console.error("Failed to load user:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, redirectTo?: string) => {
      setError(null);
      try {
        const res = await api.post<{ user: ApiUser; accessToken: string; expiresIn: number }>(
          "/auth/login",
          { email, password }
        );
        setAccessToken(res.accessToken);
        setUser(normalizeUser(res.user));
        const defaultDestination = res.user.role === "ADMIN" ? "/admin" : "/customer";
        const destination = redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : defaultDestination;
        router.push(destination);
      } catch (err) {
        setError(isApiError(err) ? err.messageJa : "ログインに失敗しました。");
        throw err;
      }
    },
    [router]
  );

  const register = useCallback(
    async (data: RegisterPayload, redirectTo?: string) => {
      setError(null);
      try {
        const res = await api.post<{ user: ApiUser; accessToken: string }>(
          "/auth/register",
          data
        );
        // After registration, the user should verify email and then log in.
        // We do not auto-login here to match the flow (verify-email → login).
        setAccessToken(res.accessToken);
        setUser(normalizeUser(res.user));
        const destination = redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/customer";
        router.push(destination);
      } catch (err) {
        setError(isApiError(err) ? err.messageJa : "登録に失敗しました。");
        throw err;
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    }
    setUser(null);
    setAccessToken(null);
    router.push("/");
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      const res = await api.post<{ accessToken: string; expiresIn: number }>("/auth/refresh");
      setAccessToken(res.accessToken);
      // We can't set the token on the client directly because it's httpOnly,
      // but we can re-fetch /me to get the latest user.
      const me = await api.get<{ user: ApiUser }>("/auth/me");
      setUser(normalizeUser(me.user));
    } catch {
      setUser(null);
    }
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const me = await api.get<{ user: ApiUser }>("/auth/me");
      setUser(normalizeUser(me.user));
    } catch {
      setUser(null);
    }
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    register,
    logout,
    refresh,
    fetchMe,
    isAdmin: user?.role === "ADMIN",
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
