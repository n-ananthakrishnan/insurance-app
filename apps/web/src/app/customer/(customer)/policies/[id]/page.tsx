"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Policy = { id: string; policyNumber: string; status: string; effectiveDate: string; expiryDate: string; premium: number; planNameEn: string; product?: { nameEn: string; category?: { nameEn: string } }; coverages?: Array<{ id: string; labelEn: string; labelJa: string }> };
export default function PolicyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { let cancelled = false; api.get<Policy>(`/policies/${id}`).then(p => { if (!cancelled) setPolicy(p); }).catch(() => { if (!cancelled) setError("Policy not found or your session has expired."); }); return () => { cancelled = true; }; }, [id]);
  return <section className="mx-auto max-w-3xl px-4 py-10"><Link href="/customer/policies" className="text-sm underline">← My policies</Link>{error ? <p role="alert" className="mt-6 rounded-xl bg-red-50 p-5 text-red-700">{error}</p> : !policy ? <p className="mt-6">Loading policy…</p> : <article className="mt-5 rounded-2xl border bg-white p-6 shadow-sm"><p className="font-mono text-sm text-muted-500">{policy.policyNumber}</p><h1 className="mt-2 text-2xl font-bold text-navy-900">{policy.product?.nameEn || policy.planNameEn}</h1><p className="mt-2">{policy.status} · {policy.product?.category?.nameEn}</p><dl className="mt-6 grid gap-4 sm:grid-cols-2"><div><dt className="text-sm text-muted-500">Effective</dt><dd>{new Date(policy.effectiveDate).toLocaleDateString()}</dd></div><div><dt className="text-sm text-muted-500">Expires</dt><dd>{new Date(policy.expiryDate).toLocaleDateString()}</dd></div><div><dt className="text-sm text-muted-500">Premium</dt><dd>¥{policy.premium.toLocaleString()} / month</dd></div></dl>{policy.coverages?.length ? <div className="mt-7"><h2 className="font-semibold">Coverage</h2><ul className="mt-2 list-disc space-y-1 pl-5">{policy.coverages.map(coverage => <li key={coverage.id}>{coverage.labelEn || coverage.labelJa}</li>)}</ul></div> : null}<Link href="/claims/new" className="mt-7 inline-block rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white">Report an accident</Link></article>}</section>;
}
