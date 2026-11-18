"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, isApiErrorInstance } from "@/lib/api";

export default function NewClaimPage() {
  const { user, loading } = useAuth();
  const [policyId, setPolicyId] = useState("");
  const [policies, setPolicies] = useState<Array<{ id: string; policyNumber: string; planNameEn?: string; planNameJa?: string }>>([]);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [type, setType] = useState("AUTO");
  const [occurredAt, setOccurredAt] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [claimNumber, setClaimNumber] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setPoliciesLoading(true);
    api.get<{ items: typeof policies }>("/policies")
      .then(data => { if (!cancelled) { setPolicies(data.items); setPolicyId(current => current || data.items[0]?.id || ""); } })
      .catch(() => { if (!cancelled) setError("We could not load your policies. Please try signing in again."); })
      .finally(() => { if (!cancelled) setPoliciesLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setSubmitting(true);
    try {
      const result = await api.post<{ claimNumber: string }>("/claims", {
        policyId: policyId.trim(), type, occurredAt: new Date(occurredAt).toISOString(), descriptionJa: description, descriptionEn: description,
        injuredPeople: 0, propertyDamageEstimateYen: 0,
      });
      setClaimNumber(result.claimNumber);
    } catch (err) {
      setError(isApiErrorInstance(err) ? err.messageEn : err instanceof TypeError ? "Could not reach the claims service. Please check that the API server is running." : "We could not submit your report. Please try again.");
    } finally { setSubmitting(false); }
  }

  return <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <Link href="/" className="text-sm text-navy-700 underline">← Back to home</Link>
    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-900"><h1 className="text-2xl font-bold">Report an accident</h1><p className="mt-2">If anyone is in immediate danger or needs urgent medical help, call 119. For a traffic accident, contact the police at 110.</p></div>
    {loading ? <p className="mt-8">Checking your sign-in…</p> : !user ? <div className="mt-6 rounded-xl border border-navy-200 bg-white p-6"><h2 className="text-lg font-semibold">Sign in to submit a report</h2><p className="mt-2 text-sm text-muted-600">Your report is attached to your insurance policy. Sign in to continue, or create an account first.</p><div className="mt-5 flex gap-3"><Link className="rounded-lg bg-navy-900 px-5 py-2.5 text-white" href="/login?next=%2Fclaims%2Fnew">Sign in</Link><Link className="rounded-lg border border-navy-300 px-5 py-2.5" href="/register">Create account</Link></div></div> : claimNumber ? <div role="status" className="mt-6 rounded-xl bg-green-50 p-6 text-green-900"><h2 className="text-xl font-semibold">Report submitted</h2><p className="mt-2">Your reference number is <strong>{claimNumber}</strong>. Our claims team will review it.</p><Link href="/customer/claims" className="mt-4 inline-block underline">View my claims</Link></div> : <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium">Policy<select required value={policyId} onChange={e => setPolicyId(e.target.value)} disabled={policiesLoading || policies.length === 0} className="mt-1 block h-11 w-full rounded-lg border border-navy-200 px-3">{policies.length === 0 ? <option value="">{policiesLoading ? "Loading your policies…" : "No policy is available for this account"}</option> : policies.map(policy => <option key={policy.id} value={policy.id}>{policy.policyNumber} — {policy.planNameEn || policy.planNameJa || "Insurance policy"}</option>)}</select></label>
      <label className="block text-sm font-medium">Incident type <select value={type} onChange={e => setType(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-navy-200 px-3">{[["AUTO","Vehicle accident"],["FIRE_EARTHQUAKE","Fire or earthquake"],["TRAVEL","Travel"],["MEDICAL","Medical"],["LIABILITY","Liability"],["OTHER","Other"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      <label className="block text-sm font-medium">Date and time <input required type="datetime-local" value={occurredAt} onChange={e => setOccurredAt(e.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-navy-200 px-3" /></label>
      <label className="block text-sm font-medium">What happened? <textarea required minLength={5} maxLength={5000} value={description} onChange={e => setDescription(e.target.value)} rows={5} className="mt-1 block w-full rounded-lg border border-navy-200 p-3" /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={submitting || policies.length === 0 || policiesLoading} className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white disabled:opacity-60">{submitting ? "Submitting…" : "Submit accident report"}</button>
    </form>}
  </section>;
}
