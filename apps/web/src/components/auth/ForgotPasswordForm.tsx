"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await api.post("/auth/forgot-password", { email }); setSent(true); }
    catch (err) { setError(err instanceof TypeError ? "The account service is unavailable. Please try again shortly." : "We could not process your request. Please try again."); }
    finally { setBusy(false); }
  }
  if (sent) return <div className="rounded-2xl border bg-white p-6 text-center shadow-sm"><h2 className="text-lg font-semibold">Check your email</h2><p className="mt-2 text-sm text-muted-600">If an account uses that email, a password reset link has been created.</p><p className="mt-2 text-xs text-muted-500">For local development, the link is printed in the API server terminal.</p><Link href="/login" className="mt-5 inline-block underline">Back to sign in</Link></div>;
  return <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="block text-sm font-medium">Email address<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-navy-200 px-3" /></label><button disabled={busy} className="h-11 w-full rounded-lg bg-navy-900 font-semibold text-white disabled:opacity-60">{busy ? "Sending…" : "Send reset link"}</button></form>;
}
