"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function LogInForm() {
  const { login, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();
    setNetworkError("");
    setSubmitting(true);
    try {
      const next = new URLSearchParams(window.location.search).get("next") ?? undefined;
      await login(email, password, next);
    } catch (err) {
      if (err instanceof TypeError) setNetworkError("Could not reach the sign-in service. Make sure the API server is running, then try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      {(error || networkError) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{networkError || error}</p>}
      <label className="block space-y-1.5 text-sm font-medium text-navy-800">Email address
        <input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-navy-200 px-3 font-normal" />
      </label>
      <label className="block space-y-1.5 text-sm font-medium text-navy-800">Password
        <input required type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-navy-200 px-3 font-normal" />
      </label>
      <div className="text-right text-sm"><Link href="/forgot-password" className="text-accent-700 underline">Forgot password?</Link></div>
      <button disabled={submitting} className="h-11 w-full rounded-lg bg-navy-900 font-semibold text-white disabled:opacity-60">{submitting ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
