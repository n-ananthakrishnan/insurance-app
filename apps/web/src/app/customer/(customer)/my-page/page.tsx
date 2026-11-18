"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ArrowRight, FileText, ShieldCheck } from "@/components/ui/icons";

type Policy = {
  id: string; policyNumber: string; status: string; effectiveDate: string; expiryDate: string; premium: number;
  product?: { nameJa: string; nameEn: string; category?: { nameJa: string; nameEn: string } };
};
type Claim = {
  id: string; claimNumber: string; type: string; status: string; policyNumber?: string;
  createdAt: string; descriptionJa?: string; descriptionEn?: string;
};

export default function CustomerHomePage() {
  const t = useTranslations("customer");
  const claimsT = useTranslations("claims");
  const locale = useLocale();
  const { user, loading: authLoading } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    Promise.all([
      api.get<{ items: Policy[] }>("/policies"),
      api.get<{ items: Claim[] }>("/claims"),
    ]).then(([policyResponse, claimResponse]) => {
      if (!cancelled) {
        setPolicies(policyResponse.items);
        setClaims(claimResponse.items.slice(0, 4));
      }
    }).catch(() => {
      if (!cancelled) setLoadError(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [authLoading, user]);

  const name = useMemo(() => {
    if (locale === "ja") return user?.nameJa || user?.nameEn || "お客さま";
    return user?.nameEn || user?.nameJa || "there";
  }, [locale, user]);
  const openClaims = claims.filter((claim) => !["PAID", "REJECTED"].includes(claim.status)).length;

  return (
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-6 sm:px-6 sm:py-9">
      <section className="relative overflow-hidden rounded-3xl bg-blue-950 bg-gradient-to-br from-blue-950 via-navy-900 to-blue-800 px-6 py-8 text-white shadow-lg sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[34px] border-white/5" />
        <div aria-hidden="true" className="absolute -bottom-32 right-24 h-64 w-64 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium text-sky-200">SAMPLE INSURANCE JAPAN</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("welcome", { name })}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">{t("dashboardIntro")}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/claims/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 font-semibold text-navy-900 shadow-sm transition hover:bg-sky-50">
              <FileText className="h-4 w-4" />{t("reportAccident")}
            </Link>
            <Link href="/customer/policies" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/25 px-4 font-semibold text-white transition hover:bg-white/10">
              <ShieldCheck className="h-4 w-4" />{t("policiesTitle")}
            </Link>
          </div>
        </div>
      </section>

      <section aria-label={t("title")} className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><ShieldCheck className="h-6 w-6" /></span>
          <div><p className="text-sm text-muted-600">{t("activePolicies")}</p><p className="mt-1 text-2xl font-bold text-navy-900">{loading ? "—" : policies.filter((p) => p.status === "ACTIVE").length}</p></div>
          <Link href="/customer/policies" className="ml-auto rounded-lg p-2 text-navy-500 hover:bg-navy-50" aria-label={t("viewAll")}><ArrowRight className="h-5 w-5" /></Link>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><FileText className="h-6 w-6" /></span>
          <div><p className="text-sm text-muted-600">{t("openClaims")}</p><p className="mt-1 text-2xl font-bold text-navy-900">{loading ? "—" : openClaims}</p></div>
          <Link href="/customer/claims" className="ml-auto rounded-lg p-2 text-navy-500 hover:bg-navy-50" aria-label={t("viewAll")}><ArrowRight className="h-5 w-5" /></Link>
        </div>
      </section>

      {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Could not load your account data. Please refresh or sign in again.</p>}

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4 sm:px-6">
            <div><h2 className="font-semibold text-navy-900">{t("recentClaims.title")}</h2><p className="mt-1 text-sm text-muted-500">{t("recentClaims.subtitle")}</p></div>
            <Link href="/customer/claims" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline">{t("viewAll")}<ArrowRight className="h-4 w-4" /></Link>
          </div>
          {loading ? <div className="space-y-3 p-6"><div className="h-12 animate-pulse rounded-lg bg-navy-50" /><div className="h-12 animate-pulse rounded-lg bg-navy-50" /></div> : claims.length ? <ul className="divide-y divide-navy-100">{claims.map((claim) => <li key={claim.id} className="flex items-center gap-4 px-5 py-4 sm:px-6"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText className="h-5 w-5" /></span><div className="min-w-0 flex-1"><Link href={`/customer/my-page/claims/${claim.id}`} className="font-semibold text-navy-900 hover:underline">{claim.claimNumber}</Link><p className="mt-0.5 truncate text-sm text-muted-500">{claim.policyNumber || claim.type} · {new Date(claim.createdAt).toLocaleDateString(locale)}</p></div><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{claimsT(`status.${claim.status}`)}</span></li>)}</ul> : <div className="px-6 py-8"><p className="text-sm text-muted-600">{t("noRecentClaims")}</p><Link href="/claims/new" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline">{t("reportAccident")}<ArrowRight className="h-4 w-4" /></Link></div>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4 sm:px-6"><div><h2 className="font-semibold text-navy-900">{t("recentPolicies.title")}</h2><p className="mt-1 text-sm text-muted-500">{t("recentPolicies.subtitle")}</p></div><Link href="/customer/policies" className="rounded-lg p-2 text-navy-500 hover:bg-navy-50" aria-label={t("viewAll")}><ArrowRight className="h-5 w-5" /></Link></div>
          {loading ? <div className="space-y-3 p-6"><div className="h-16 animate-pulse rounded-lg bg-navy-50" /><div className="h-16 animate-pulse rounded-lg bg-navy-50" /></div> : policies.length ? <ul className="divide-y divide-navy-100">{policies.slice(0, 3).map((policy) => <li key={policy.id} className="px-5 py-4 sm:px-6"><Link href={`/customer/policies/${policy.id}`} className="font-semibold text-navy-900 hover:underline">{locale === "ja" ? policy.product?.nameJa : policy.product?.nameEn}</Link><p className="mt-1 text-xs text-muted-500">{policy.policyNumber} · {policy.status}</p></li>)}</ul> : <div className="px-6 py-8"><p className="text-sm text-muted-600">{t("noRecentPolicies")}</p><Link href="/products" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:underline">{t("browseProducts")}<ArrowRight className="h-4 w-4" /></Link></div>}
        </div>
      </section>
    </div>
  );
}
