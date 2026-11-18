"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface ResetPasswordFormProps { token?: string }
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try { await api.post("/auth/reset-password", { token, password, passwordConfirm: confirm }); setDone(true); }
    catch (err) { setError(err instanceof TypeError ? "The account service is unavailable. Please try again shortly." : "This reset link may have expired. Request a new link and try again."); }
    finally { setBusy(false); }
  }
  if (done) return <div className="rounded-2xl border bg-white p-6 text-center shadow-sm"><h2 className="text-lg font-semibold">Password updated</h2><p className="mt-2 text-sm text-muted-600">You can now sign in with your new password.</p><Link href="/login" className="mt-5 inline-block underline">Go to sign in</Link></div>;
  return <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-6 shadow-sm">{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<label className="block text-sm font-medium">New password<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-navy-200 px-3" /></label><label className="block text-sm font-medium">Confirm new password<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-navy-200 px-3" /></label><button disabled={busy} className="h-11 w-full rounded-lg bg-navy-900 font-semibold text-white disabled:opacity-60">{busy ? "Updating…" : "Update password"}</button></form>;
}
