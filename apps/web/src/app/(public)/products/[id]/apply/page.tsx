"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useLocale } from "@/i18n/use-locale";

type Product = {
  id: string;
  slug: string;
  nameJa: string;
  nameEn: string;
  descriptionJa?: string;
  descriptionEn?: string;
  priceHintJa?: string | null;
  priceHintEn?: string | null;
  examplePremiumJa?: string | null;
  examplePremiumEn?: string | null;
};

type Application = { policy: { id: string; policyNumber: string; status: string }; alreadyApplied: boolean };

export default function ProductApplicationPage() {
  const { id = "" } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { locale } = useLocale();
  const ja = locale === "ja";
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const next = useMemo(() => `/products/${encodeURIComponent(id)}/apply`, [id]);

  useEffect(() => {
    let cancelled = false;
    api.get<Product>(`/products/${encodeURIComponent(id)}`)
      .then((result) => { if (!cancelled) setProduct(result); })
      .catch(() => { if (!cancelled) setError(ja ? "商品情報を読み込めませんでした。商品一覧からもう一度お試しください。" : "We could not load this product. Please return to the product list and try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, ja]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!accepted) {
      setError(ja ? "お申し込み内容をご確認のうえ、同意にチェックしてください。" : "Please review the application details and confirm your agreement.");
      return;
    }
    if (!product) return;
    setSubmitting(true);
    try {
      const result = await api.post<Application>("/applications", { productId: product.id });
      setApplication(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : ja ? "お申し込みを完了できませんでした。もう一度お試しください。" : "We could not submit your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const copy = ja ? {
    title: "保険のお申し込み", review: "お申し込み内容をご確認ください", premium: "保険料の目安", applicant: "お申し込み者", note: "お申し込み後、契約内容を確認して担当者からご連絡します。この時点では補償は開始されません。", consent: "商品内容と保険料の目安を確認し、申し込み手続きを進めることに同意します。", submit: "申し込む", submitting: "送信中…", login: "ログインして続ける", register: "アカウントを作成", success: "お申し込みを受け付けました", reference: "受付番号", pending: "確認待ち", already: "この商品のお申し込みはすでに受け付けています。", view: "マイページで確認", back: "商品詳細に戻る", load: "商品情報を読み込み中…",
  } : {
    title: "Apply for insurance", review: "Review your application", premium: "Estimated premium", applicant: "Applicant", note: "After you apply, our team will review the details and contact you. Coverage does not begin at this step.", consent: "I have reviewed the product information and estimated premium and agree to submit this application.", submit: "Submit application", submitting: "Submitting…", login: "Sign in to continue", register: "Create an account", success: "Application received", reference: "Application reference", pending: "Under review", already: "We already have an application for this product.", view: "View in My Page", back: "Back to product details", load: "Loading product information…",
  };

  if (application) return <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><section className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" /><h1 className="mt-4 text-2xl font-bold text-slate-950">{copy.success}</h1><p className="mt-2 text-slate-600">{application.alreadyApplied ? copy.already : copy.note}</p><div className="mx-auto mt-6 max-w-sm rounded-2xl bg-slate-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{copy.reference}</p><p className="mt-1 font-mono text-lg font-bold text-slate-950">{application.policy.policyNumber}</p><p className="mt-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">{copy.pending}</p></div><Link href="/customer/policies" className="mt-6 inline-flex h-11 items-center rounded-xl bg-blue-950 px-5 font-semibold text-white hover:bg-blue-900">{copy.view}</Link></section></main>;

  if (loading || authLoading) return <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><p className="rounded-2xl border bg-white p-6 text-slate-600">{copy.load}</p></main>;

  if (!user) return <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"><ShieldCheck className="h-10 w-10 text-blue-900" /><h1 className="mt-4 text-2xl font-bold text-slate-950">{copy.title}</h1><p className="mt-2 text-slate-600">{ja ? "ログインまたはアカウント登録後に、お申し込みを続けられます。" : "Sign in or create an account to continue with your application."}</p><div className="mt-6 flex flex-wrap gap-3"><Link href={`/login?next=${encodeURIComponent(next)}`} className="rounded-xl bg-blue-950 px-5 py-3 font-semibold text-white">{copy.login}</Link><Link href={`/register?next=${encodeURIComponent(next)}`} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800">{copy.register}</Link></div></section></main>;

  return <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6"><Link href={`/products/${encodeURIComponent(id)}`} className="text-sm font-medium text-blue-800 hover:underline">← {copy.back}</Link><section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="bg-gradient-to-br from-slate-950 to-blue-900 p-7 text-white"><p className="text-sm font-semibold uppercase tracking-wide text-blue-200">SAMPLE INSURANCE JAPAN</p><h1 className="mt-2 text-2xl font-bold">{copy.title}</h1><p className="mt-2 text-blue-100">{copy.review}</p></div>
    {error && <p role="alert" className="mx-6 mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {product && <form onSubmit={submit} className="space-y-5 p-6 sm:p-7"><div className="rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-500">{copy.applicant}</p><p className="mt-1 font-semibold text-slate-950">{ja ? (user.nameJa || user.nameEn) : (user.nameEn || user.nameJa)}</p><p className="text-sm text-slate-600">{user.email}</p></div><div><p className="text-sm font-medium text-slate-500">{ja ? "保険商品" : "Insurance product"}</p><h2 className="mt-1 text-xl font-bold text-slate-950">{ja ? product.nameJa : product.nameEn}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{ja ? product.descriptionJa : product.descriptionEn}</p></div><div className="rounded-xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-semibold text-blue-950">{copy.premium}</p><p className="mt-1 text-sm text-blue-900">{(ja ? product.examplePremiumJa ?? product.priceHintJa : product.examplePremiumEn ?? product.priceHintEn) || (ja ? "商品・プランにより異なります" : "Varies by product and plan")}</p></div><p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{copy.note}</p><label className="flex items-start gap-3 text-sm leading-6 text-slate-700"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300" />{copy.consent}</label><button disabled={submitting} className="h-12 w-full rounded-xl bg-blue-950 px-5 font-semibold text-white hover:bg-blue-900 disabled:cursor-wait disabled:opacity-60">{submitting ? copy.submitting : copy.submit}</button></form>}</section></main>;
}
