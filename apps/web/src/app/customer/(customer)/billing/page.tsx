"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";
import { CreditCard, ShieldCheck } from "lucide-react";

type Policy = { id: string; policyNumber: string; status: string; premium: number; effectiveDate: string; expiryDate: string; product?: { nameJa: string; nameEn: string } };
export default function BillingPage() {
  const locale = useLocale();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => { let cancelled = false; api.get<{ items: Policy[] }>("/policies").then(({ items }) => { if (!cancelled) setPolicies(items); }).catch(() => { if (!cancelled) setError(true); }).finally(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, []);
  const currency = new Intl.NumberFormat(locale === "ja" ? "ja-JP" : "en-US", { style: "currency", currency: "JPY", maximumFractionDigits: 0 });
  return <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <div className="mb-7"><p className="text-sm font-medium text-blue-800">SAMPLE INSURANCE JAPAN</p><h1 className="mt-2 text-3xl font-bold text-navy-900">{locale === "ja" ? "保険料" : "Premiums"}</h1><p className="mt-2 text-slate-600">{locale === "ja" ? "ご契約ごとの保険料を確認できます。" : "Review the premium amount for each of your policies."}</p></div>
    <div className="mb-6 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950"><CreditCard className="mt-0.5 h-5 w-5 shrink-0" /><p>{locale === "ja" ? "このページでは契約に登録された保険料を表示しています。お支払い履歴や決済方法の変更は、サポート窓口へお問い合わせください。" : "This page shows the premium recorded for each policy. Contact support for payment history or payment method changes."}</p></div>
    {loading ? <div className="h-24 animate-pulse rounded-2xl bg-white" /> : error ? <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-700">{locale === "ja" ? "契約情報を読み込めませんでした。再度ログインしてください。" : "We could not load your policies. Please sign in again."}</p> : policies.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-9 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-3 font-medium text-navy-900">{locale === "ja" ? "保険料の情報はありません" : "No premium information yet"}</p><Link href="/products" className="mt-4 inline-block text-sm font-semibold text-blue-800 underline">{locale === "ja" ? "保険商品を見る" : "Explore coverage"}</Link></div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="grid grid-cols-[1fr_auto] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>{locale === "ja" ? "ご契約" : "Policy"}</span><span>{locale === "ja" ? "保険料" : "Premium"}</span></div>{policies.map(policy => <Link key={policy.id} href={`/customer/policies/${policy.id}`} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0 hover:bg-slate-50"><div><p className="font-semibold text-navy-900">{locale === "ja" ? policy.product?.nameJa : policy.product?.nameEn}</p><p className="mt-1 text-xs text-slate-500">{policy.policyNumber} · {policy.status}</p></div><p className="font-semibold text-navy-900">{currency.format(policy.premium)}<span className="ml-1 text-xs font-normal text-slate-500">/ {locale === "ja" ? "月" : "month"}</span></p></Link>)}</div>}
  </section>;
}
