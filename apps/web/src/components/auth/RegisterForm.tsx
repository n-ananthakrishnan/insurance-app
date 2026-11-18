"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function RegisterForm() {
  const { register, error, clearError } = useAuth();
  const [values, setValues] = useState({ nameJa: "", nameEn: "", furigana: "", email: "", phone: "", password: "", passwordConfirm: "" });
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [networkError, setNetworkError] = useState("");
  const update = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) => setValues(v => ({ ...v, [key]: e.target.value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); clearError(); setMessage(""); setNetworkError("");
    if (values.password !== values.passwordConfirm) { setMessage("Passwords do not match."); return; }
    if (!terms) { setMessage("Please accept the terms and privacy policy to continue."); return; }
    setSubmitting(true);
    try {
      const next = new URLSearchParams(window.location.search).get("next") ?? undefined;
      await register({ nameJa: values.nameJa, nameEn: values.nameEn, furigana: values.furigana, email: values.email, phone: values.phone, password: values.password, passwordConfirm: values.passwordConfirm, consentToTerms: true, consentToPrivacy: true }, next);
    } catch (err) {
      if (err instanceof TypeError) setNetworkError("Could not reach the registration service. Make sure the API server is running, then try again.");
    } finally { setSubmitting(false); }
  }

  const fields: Array<[keyof typeof values, string, string]> = [
    ["nameJa", "Name (Japanese)", "name"], ["nameEn", "Name (English)", "name"], ["furigana", "Furigana (optional)", "name"],
    ["email", "Email address", "email"], ["phone", "Phone (optional)", "tel"], ["password", "Password (at least 8 characters)", "new-password"], ["passwordConfirm", "Confirm password", "new-password"],
  ];
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      {(error || message || networkError) && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{networkError || message || error}</p>}
      {fields.map(([key, label, autoComplete]) => <label key={key} className="block space-y-1 text-sm font-medium text-navy-800">{label}<input required={!(["furigana", "phone"] as string[]).includes(key)} type={key.toLowerCase().includes("password") ? "password" : key === "email" ? "email" : key === "phone" ? "tel" : "text"} autoComplete={autoComplete} minLength={key === "password" || key === "passwordConfirm" ? 8 : undefined} value={values[key]} onChange={update(key)} className="mt-1 block h-10 w-full rounded-lg border border-navy-200 px-3 font-normal" /></label>)}
      <label className="flex items-start gap-2 text-sm text-navy-700"><input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1" />I agree to the terms of service and privacy policy.</label>
      <button disabled={submitting} className="h-11 w-full rounded-lg bg-navy-900 font-semibold text-white disabled:opacity-60">{submitting ? "Creating account…" : "Create account"}</button>
    </form>
  );
}
