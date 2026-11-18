"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Policy = {
  id: string; policyNumber: string; status: string; effectiveDate: string; expiryDate: string;
  premium: number; planNameJa: string; planNameEn: string;
  product?: { nameJa: string; nameEn: string; category?: { nameJa: string; nameEn: string } };
};

export default function CustomerPoliciesPage() {
  const [items, setItems] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    api.get<{ items: Policy[] }>("/policies").then(data => { if (!cancelled) setItems(data.items); })
      .catch(() => { if (!cancelled) setError("We could not load policies. Please sign in again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  return <section className="mx-auto max-w-5xl px-4 py-10">
    <div className="mb-6 flex items-center justify-between"><div><h1 className="text-2xl font-bold text-navy-900">My policies</h1><p className="mt-1 text-muted-600">Review your coverage and policy dates.</p></div><Link href="/customer/my-page" className="text-sm underline">My account</Link></div>
    {loading ? <p className="rounded-xl border bg-white p-6 text-sm">Loading policies…</p> : error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{error}</p> : items.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-muted-600">No active policies are linked to this account yet.</div> : <div className="grid gap-4 md:grid-cols-2">{items.map(policy => <article key={policy.id} className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm"><p className="font-mono text-xs text-muted-500">{policy.policyNumber}</p><h2 className="mt-2 text-lg font-semibold text-navy-900">{policy.product?.nameEn || policy.planNameEn}</h2><p className="mt-1 text-sm text-muted-600">{policy.product?.category?.nameEn} · {policy.status}</p><p className="mt-4 text-sm">{new Date(policy.effectiveDate).toLocaleDateString()} – {new Date(policy.expiryDate).toLocaleDateString()}</p><p className="mt-1 text-sm">¥{policy.premium.toLocaleString()} / month</p><Link href={`/customer/policies/${policy.id}`} className="mt-4 inline-block text-sm font-medium text-accent-700 underline">View policy</Link></article>)}</div>}
  </section>;
}
