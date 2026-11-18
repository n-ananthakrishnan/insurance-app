import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CarFront, HeartPulse, House, ShieldCheck, Umbrella } from "lucide-react";
import { ProductListSection } from "@/components/home/ProductListSection";
import { NewsSection } from "@/components/home/NewsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { getTranslations } from "@/i18n/request";
import { getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "SAMPLE INSURANCE JAPAN",
  description: "Auto, home, medical and travel insurance designed for everyday life in Japan.",
  openGraph: {
    title: "SAMPLE INSURANCE JAPAN",
    description: "Insurance for the moments that matter.",
    type: "website",
  },
};

export default async function HomePage() {
  const t = await getTranslations("home");
  const ja = (await getLocale()) === "ja";
  const categories = [
    { title: ja ? "自動車保険" : "Auto insurance", description: t("categories.auto"), href: "/products/everyday-auto", Icon: CarFront, tone: "bg-blue-50 text-blue-800" },
    { title: ja ? "住まいの保険" : "Home insurance", description: t("categories.fire"), href: "/products/home-and-belongings", Icon: House, tone: "bg-amber-50 text-amber-800" },
    { title: ja ? "医療保険" : "Medical insurance", description: t("categories.medical"), href: "/products/medical-support", Icon: HeartPulse, tone: "bg-rose-50 text-rose-800" },
    { title: ja ? "旅行保険" : "Travel insurance", description: ja ? "旅行中の病気やけが、手荷物のトラブルに備えます。" : "Support for illness, injury, or baggage problems while travelling.", href: "/products/travel-peace-of-mind", Icon: Umbrella, tone: "bg-emerald-50 text-emerald-800" },
  ];

  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate bg-slate-50">
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-36 -top-48 h-[34rem] w-[34rem] rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute -bottom-48 left-0 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_0.7px,transparent_0.7px)] bg-[size:22px_22px] opacity-[0.14]" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-blue-900 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              SAMPLE INSURANCE JAPAN
            </div>
            <h1 className="mt-7 text-4xl font-bold leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{t("heroTitle")}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">{t("heroSubtitle")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-950 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-950/15 transition hover:bg-blue-900">
                {t("getStarted")}<ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/claims/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-300 hover:bg-blue-50">
                {t("reportAccident")}<ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />{ja ? "わかりやすい補償内容" : "Clear coverage information"}</span>
              <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" />{ja ? "いつでも事故受付" : "Accident support, day or night"}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div aria-hidden="true" className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-blue-200 via-sky-100 to-amber-100 opacity-80 blur-xl" />
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-6 text-white shadow-2xl shadow-blue-950/20 sm:p-8">
              <div aria-hidden="true" className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-white/[0.06]" />
              <div aria-hidden="true" className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-sky-400/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium text-blue-200">{ja ? "あなたと大切な人のために" : "For you and the people you care about"}</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">{ja ? "毎日の安心を、もっとシンプルに。" : "Confidence for everyday life."}</h2></div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><ShieldCheck className="h-6 w-6 text-sky-200" /></span>
              </div>
              <div className="relative mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                {categories.map(({ title, href, Icon, tone }) => <Link key={title} href={href} className="group flex min-h-24 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur transition hover:bg-white/[0.13]">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                  <span className="min-w-0"><span className="block text-sm font-semibold text-white">{title}</span><span className="mt-1 block text-xs text-blue-200">{ja ? "補償内容を見る" : "Explore coverage"}</span></span>
                  <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-blue-200 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>)}
              </div>
              <div className="relative mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200"><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" /></span>
                <p className="text-sm text-blue-100">{ja ? "事故のときも、サポート窓口へすぐに相談できます。" : "When something happens, our support team is here to help."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-200 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          {[t("trustSupport"), t("trustSecurity"), t("trustPrivacy")].map((item) => <div key={item} className="flex items-center justify-center gap-3 py-5 text-sm font-medium text-slate-700 sm:py-6"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><ShieldCheck className="h-4 w-4" /></span>{item}</div>)}
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-800">{ja ? "あなたに合う補償" : "Find your cover"}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{t("categoriesTitle")}</h2></div>
            <p className="max-w-lg text-base leading-7 text-slate-600">{t("categoriesSubtitle")}</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ title, description, href, Icon, tone }) => <Link key={title} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5 sm:p-6">
              <div className="flex items-center justify-between"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}><Icon className="h-6 w-6" /></span><ArrowUpRight className="h-5 w-5 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-800" /></div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </Link>)}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-800">{ja ? "シンプルな選び方" : "Simple choices"}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{t("productsTitle")}</h2></div><p className="max-w-lg text-base leading-7 text-slate-600">{t("productsSubtitle")}</p></div>
          <ProductListSection />
        </div>
      </section>

      <NewsSection />
      <FaqSection />

      <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-blue-950 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14">
          <div aria-hidden="true" className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[44px] border-white/[0.06]" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-200">SAMPLE INSURANCE JAPAN</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t("ctaTitle")}</h2><p className="mt-3 text-base leading-7 text-blue-100">{t("ctaSubtitle")}</p></div>
            <div className="flex flex-col gap-3 sm:flex-row"><Link href="/contact" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10">{t("ctaContact")}<ArrowRight className="h-4 w-4" /></Link><Link href="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300">{t("ctaGetStarted")}<ArrowRight className="h-4 w-4" /></Link></div>
          </div>
        </div>
      </section>
    </main>
  );
}
