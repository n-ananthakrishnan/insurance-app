"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Check, ChevronLeft, CircleHelp, FileText, ShieldCheck } from "lucide-react";

type Coverage = {
  id: string;
  labelJa?: string | null;
  labelEn?: string | null;
  detailJa?: string | null;
  detailEn?: string | null;
  description?: string | null;
  amount?: number | null;
  maxAmountYen?: number | null;
  coverage?: {
    nameJa?: string | null;
    nameEn?: string | null;
    descriptionJa?: string | null;
    descriptionEn?: string | null;
    maxAmountYen?: number | null;
  } | null;
};

export interface ProductDetailData {
  id: string;
  slug?: string;
  nameJa?: string | null;
  nameEn?: string | null;
  taglineJa?: string | null;
  taglineEn?: string | null;
  descriptionJa?: string | null;
  descriptionEn?: string | null;
  whoForJa?: string | null;
  whoForEn?: string | null;
  coverageListJa?: string | null;
  coverageListEn?: string | null;
  riderListJa?: string | null;
  riderListEn?: string | null;
  exclusionJa?: string | null;
  exclusionEn?: string | null;
  claimHowToJa?: string | null;
  claimHowToEn?: string | null;
  highlightsJa?: unknown;
  highlightsEn?: unknown;
  exclusionsJa?: unknown;
  exclusionsEn?: unknown;
  faqJa?: unknown;
  faqEn?: unknown;
  basePremiumYen?: number | null;
  priceHintJa?: string | null;
  priceHintEn?: string | null;
  examplePremiumJa?: string | null;
  examplePremiumEn?: string | null;
  status?: string;
  updatedAt?: string | Date | null;
  supportedYears?: number[] | null;
  category?: { nameJa?: string | null; nameEn?: string | null } | null;
  coverages?: Coverage[] | null;
}

interface ProductDetailProps {
  product: ProductDetailData;
  language: "ja" | "en";
}

type Feature = { title: string; description: string; amount?: number | null };
type ProductCopy = {
  features: Feature[];
  whoFor: string;
  exclusions: string[];
  claimSteps: string[];
  faq: Feature[];
};

function ApplyButton({ productKey, label }: { productKey: string; label: string }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const applicationPath = `/products/${encodeURIComponent(productKey)}/apply`;
  const startApplication = () => {
    router.push(user ? applicationPath : `/register?next=${encodeURIComponent(applicationPath)}`);
  };
  return <button type="button" disabled={loading} onClick={startApplication} className="inline-flex h-11 items-center rounded-xl border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10 disabled:cursor-wait disabled:opacity-60">{label}</button>;
}

const demoCopy: Record<string, Record<"en" | "ja", ProductCopy>> = {
  "everyday-auto": {
    en: {
      features: [
        { title: "Third-party liability", description: "Help with covered injury or property damage you cause to another person." },
        { title: "Vehicle damage options", description: "Choose available protection for damage to your own vehicle." },
        { title: "Roadside assistance", description: "Request support for common breakdowns and roadside incidents." },
        { title: "Accident support", description: "Get guidance on the next steps and the documents needed for a claim." },
      ],
      whoFor: "For drivers who want help with accidents, vehicle repairs, and roadside trouble.",
      exclusions: ["Coverage and limits depend on the plan and options selected. Review the policy documents before purchase."],
      claimSteps: ["Make sure everyone is safe and contact emergency services when needed.", "Report the accident to us and provide your policy and incident details.", "Send requested photos or documents so the claim can be reviewed."],
      faq: [{ title: "Does every plan include roadside assistance?", description: "Available assistance depends on the selected plan. Check the coverage details before applying." }, { title: "What should I do after an accident?", description: "Prioritize safety, contact the police when appropriate, then report the incident to us." }],
    },
    ja: {
      features: [
        { title: "対人・対物賠償", description: "事故で相手にけがをさせたり、物を壊したりした場合の補償です。" },
        { title: "車両補償のオプション", description: "ご自身の車の損害に備える補償を選べます。" },
        { title: "ロードサービス", description: "故障や路上でのトラブル時にサポートを依頼できます。" },
        { title: "事故対応サポート", description: "事故後の手続きや、請求に必要な書類をご案内します。" },
      ],
      whoFor: "事故や車の修理、路上でのトラブルに備えたいドライバー向けです。",
      exclusions: ["補償内容と限度額はプランや選択した特約によって異なります。お申し込み前に約款をご確認ください。"],
      claimSteps: ["安全を確保し、必要に応じて救急・警察へ連絡してください。", "保険証券と事故の情報を用意して、事故をご報告ください。", "審査に必要な写真や書類をご提出ください。"],
      faq: [{ title: "すべてのプランにロードサービスが含まれますか？", description: "ご利用いただけるサービスはプランによって異なります。お申し込み前に補償内容をご確認ください。" }, { title: "事故の後は何をすればよいですか？", description: "まず安全を確保し、必要に応じて警察へ連絡したうえで、事故をご報告ください。" }],
    },
  },
  "home-and-belongings": {
    en: {
      features: [
        { title: "Building protection", description: "Cover options for damage to your home from insured events." },
        { title: "Household belongings", description: "Options to protect furniture, appliances, and personal possessions." },
        { title: "Fire and smoke", description: "Prepare for covered fire and smoke damage at your residence." },
        { title: "Natural disaster options", description: "Choose available protection for eligible natural disaster risks." },
      ],
      whoFor: "For homeowners and renters looking to protect their home and belongings.",
      exclusions: ["Eligible events, limits, and deductibles vary by plan. Check your policy documents for details."],
      claimSteps: ["Take reasonable steps to stay safe and prevent further damage.", "Photograph the damage and keep receipts for emergency repairs.", "Contact us with your policy details and the date and cause of the damage."],
      faq: [{ title: "Can renters apply?", description: "Some plans can cover a renter’s belongings. Available options depend on the product." }, { title: "Are earthquakes covered?", description: "Earthquake protection may require a separate option. Confirm the selected plan documents." }],
    },
    ja: {
      features: [
        { title: "建物の補償", description: "補償対象となる事故による住まいの損害に備えます。" },
        { title: "家財の補償", description: "家具、家電、身の回り品を守る補償を選べます。" },
        { title: "火災・煙による損害", description: "火災や煙による住まいの損害に備えます。" },
        { title: "自然災害のオプション", description: "対象となる自然災害に備える補償を選べます。" },
      ],
      whoFor: "住まいや家財を守りたい持ち家の方、賃貸住宅にお住まいの方向けです。",
      exclusions: ["対象となる事故、限度額、免責金額はプランによって異なります。保険証券をご確認ください。"],
      claimSteps: ["安全を確保し、被害の拡大を防ぐための対応をしてください。", "損害箇所を撮影し、応急修理の領収書を保管してください。", "保険証券、被害の発生日と原因を用意してご連絡ください。"],
      faq: [{ title: "賃貸住宅でも申し込めますか？", description: "家財を対象としたプランを選べる場合があります。商品ごとの条件をご確認ください。" }, { title: "地震による損害も補償されますか？", description: "地震補償には別途オプションが必要な場合があります。お申し込みのプランをご確認ください。" }],
    },
  },
  "medical-support": {
    en: {
      features: [
        { title: "Hospital stay benefit", description: "Financial support for eligible hospital stays." },
        { title: "Surgery benefit", description: "Benefits may be available for covered surgical procedures." },
        { title: "Treatment support", description: "Options designed to help with eligible treatment costs." },
        { title: "Simple claims guidance", description: "See what documents to prepare when making a medical claim." },
      ],
      whoFor: "For people who want financial support if illness or injury requires treatment or a hospital stay.",
      exclusions: ["Waiting periods, eligible treatments, and benefit amounts depend on the plan. Review the policy terms."],
      claimSteps: ["Keep your diagnosis and treatment documents from the medical provider.", "Contact us with your policy information and treatment dates.", "Submit the claim form and requested supporting documents."],
      faq: [{ title: "What documents are needed for a claim?", description: "Requirements vary by treatment. We will tell you which medical records or receipts to provide." }, { title: "Are all treatments covered?", description: "Only treatments that meet the policy terms are eligible. Check plan conditions and exclusions." }],
    },
    ja: {
      features: [
        { title: "入院給付", description: "対象となる入院に対する給付を受けられます。" },
        { title: "手術給付", description: "対象となる手術に対して給付を受けられる場合があります。" },
        { title: "治療費への備え", description: "対象となる治療費をサポートする補償を選べます。" },
        { title: "請求手続きのご案内", description: "医療保険の請求時に必要な書類をご確認いただけます。" },
      ],
      whoFor: "病気やけがの治療、入院に備えて経済的なサポートを希望する方向けです。",
      exclusions: ["待機期間、対象となる治療、給付額はプランによって異なります。約款をご確認ください。"],
      claimSteps: ["医療機関の診断書や治療に関する書類を保管してください。", "保険証券と治療日を用意してご連絡ください。", "請求書と必要な添付書類をご提出ください。"],
      faq: [{ title: "請求にはどのような書類が必要ですか？", description: "治療内容によって異なります。必要な診療記録や領収書をご案内します。" }, { title: "すべての治療が補償されますか？", description: "約款の条件を満たす治療が対象です。プランの条件と対象外事項をご確認ください。" }],
    },
  },
  "personal-liability": {
    en: {
      features: [
        { title: "Injury to another person", description: "Protection options if you are legally responsible for accidentally injuring someone." },
        { title: "Damage to someone else’s property", description: "Help with eligible accidental damage to another person’s belongings." },
        { title: "Bicycle accident options", description: "Support for covered personal liability incidents involving bicycle use." },
        { title: "Household coverage options", description: "Some plans can extend protection to eligible household members." },
      ],
      whoFor: "For individuals and families who want to prepare for accidental injury or property damage claims.",
      exclusions: ["Legal responsibility, covered people, and limits are determined by the policy terms. Check your documents."],
      claimSteps: ["Avoid admitting liability or making a settlement before speaking with us.", "Record what happened and keep photos and contact details for those involved.", "Contact us promptly with your policy and incident information."],
      faq: [{ title: "Does this cover bicycle accidents?", description: "Some plans include bicycle-related liability. Check the specific coverage and limits." }, { title: "Are family members included?", description: "The covered household members depend on the plan and policy definitions." }],
    },
    ja: {
      features: [
        { title: "他人へのけが", description: "誤って他人にけがをさせ、法律上の賠償責任を負う場合に備えます。" },
        { title: "他人の物への損害", description: "誤って他人の持ち物を壊した場合の補償を選べます。" },
        { title: "自転車事故のオプション", description: "自転車利用中の事故に備える補償を選べる場合があります。" },
        { title: "家族の補償オプション", description: "プランによっては同居のご家族も対象となる場合があります。" },
      ],
      whoFor: "日常生活で他人にけがをさせたり、物を壊したりする事故に備えたい個人・ご家族向けです。",
      exclusions: ["賠償責任の範囲、補償対象者、限度額は約款に基づきます。保険証券をご確認ください。"],
      claimSteps: ["当社へ相談する前に、責任を認めたり示談したりしないでください。", "事故の状況を記録し、写真や関係者の連絡先を保管してください。", "保険証券と事故の情報を用意して、速やかにご連絡ください。"],
      faq: [{ title: "自転車事故も対象ですか？", description: "自転車事故の賠償補償を含むプランがあります。補償内容と限度額をご確認ください。" }, { title: "家族も補償されますか？", description: "対象となる同居家族はプランと約款の定義によって異なります。" }],
    },
  },
  "travel-peace-of-mind": {
    en: {
      features: [
        { title: "Emergency medical expenses", description: "Options for eligible illness or injury while travelling." },
        { title: "Trip disruption", description: "Some plans can help with eligible cancellation or interruption costs." },
        { title: "Baggage and belongings", description: "Options for covered loss or damage to baggage and personal items." },
        { title: "Travel assistance", description: "Get guidance on whom to contact when an unexpected problem happens away from home." },
      ],
      whoFor: "For people travelling domestically or internationally who want help with unexpected trip problems.",
      exclusions: ["Eligible destinations, trip dates, covered events, and limits depend on the plan. Review the policy terms."],
      claimSteps: ["Contact local emergency services if anyone is in danger or needs urgent care.", "Keep booking records, receipts, and reports from the carrier or authorities.", "Contact us with your policy details and supporting documents."],
      faq: [{ title: "Can I apply after my trip has started?", description: "Applications generally need to be made before the trip starts. Check the product conditions." }, { title: "Are pre-existing conditions covered?", description: "Eligibility depends on the policy wording and the selected plan." }],
    },
    ja: {
      features: [
        { title: "旅行中の治療費", description: "旅行中の病気やけがに備える補償を選べます。" },
        { title: "旅行の中断・変更", description: "プランによっては、対象となるキャンセルや中断費用に備えられます。" },
        { title: "手荷物・携行品", description: "手荷物や身の回り品の紛失・破損に備える補償を選べます。" },
        { title: "旅行中のサポート", description: "旅先で思いがけないトラブルが起きた際の連絡先をご案内します。" },
      ],
      whoFor: "国内外の旅行中に起こる予期しないトラブルに備えたい方向けです。",
      exclusions: ["対象地域、旅行期間、補償対象となる事故、限度額はプランによって異なります。約款をご確認ください。"],
      claimSteps: ["危険がある場合や緊急の治療が必要な場合は、現地の緊急窓口へ連絡してください。", "予約記録、領収書、交通機関や公的機関の証明書を保管してください。", "保険証券と必要書類を用意して当社へご連絡ください。"],
      faq: [{ title: "旅行開始後に申し込めますか？", description: "通常は旅行開始前のお申し込みが必要です。商品ごとの条件をご確認ください。" }, { title: "持病も補償されますか？", description: "補償対象となるかは約款と選択したプランによって異なります。" }],
    },
  },
};

function lines(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && !!item.trim()).map((item) => item.trim());
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return lines(parsed);
  } catch {
    // Plain text fields are commonly stored as newline separated bullets.
  }
  return value.split(/\r?\n|\s*;\s*/).map((item) => item.trim()).filter(Boolean);
}

function localized(ja: boolean, jaValue?: string | null, enValue?: string | null) {
  return (ja ? jaValue : enValue) || (ja ? enValue : jaValue) || "";
}

export function ProductDetail({ product, language }: ProductDetailProps) {
  const ja = language === "ja";
  const copy = demoCopy[product.slug ?? ""]?.[language];
  const coverages = product.coverages ?? [];
  const featureRows = coverages.map((row) => ({
    title: localized(ja, row.labelJa ?? row.coverage?.nameJa, row.labelEn ?? row.coverage?.nameEn),
    description: localized(ja, row.detailJa ?? row.coverage?.descriptionJa, row.detailEn ?? row.coverage?.descriptionEn) || row.description || "",
    amount: row.amount ?? row.maxAmountYen ?? row.coverage?.maxAmountYen,
  })).filter((row) => row.title || row.description);
  const highlights = lines(ja ? product.highlightsJa ?? product.coverageListJa : product.highlightsEn ?? product.coverageListEn);
  const featureList: Feature[] = featureRows.length ? featureRows : highlights.length ? highlights.map((text) => ({ title: text, description: "" })) : copy?.features ?? [];
  const exclusions = lines(ja ? product.exclusionsJa ?? product.exclusionJa : product.exclusionsEn ?? product.exclusionEn);
  const excludedList = exclusions.length ? exclusions : copy?.exclusions ?? [];
  const name = localized(ja, product.nameJa, product.nameEn);
  const category = localized(ja, product.category?.nameJa, product.category?.nameEn);
  const premium = typeof product.basePremiumYen === "number"
    ? new Intl.NumberFormat(ja ? "ja-JP" : "en-US", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(product.basePremiumYen)
    : localized(ja, product.examplePremiumJa ?? product.priceHintJa, product.examplePremiumEn ?? product.priceHintEn);
  const text = ja ? {
    back: "保険商品一覧へ戻る", available: "販売中", preparing: "準備中", monthly: "月額保険料の目安", apply: "この保険に申し込む", quote: "見積もりを相談する", intro: "この保険について", features: "主な補償・特長", forWho: "こんな方におすすめ", exclusions: "ご確認ください", claims: "事故・給付金の請求方法", faq: "よくある質問", terms: "補償内容・限度額は選択するプランによって異なります。正式な内容はお申し込み前に保険約款をご確認ください。", noDetails: "詳細はお問い合わせください。", updated: "更新日", years: "対象年齢",
  } : {
    back: "Back to insurance products", available: "Available", preparing: "Coming soon", monthly: "Estimated monthly premium", apply: "Apply for this cover", quote: "Ask about a quote", intro: "About this insurance", features: "Key features and coverage", forWho: "Who this is for", exclusions: "Please keep in mind", claims: "How to make a claim", faq: "Frequently asked questions", terms: "Coverage and limits vary by plan. Review the official policy terms before applying.", noDetails: "Contact us for more information.", updated: "Updated", years: "Eligible ages",
  };
  const howTo = lines(ja ? product.claimHowToJa : product.claimHowToEn);
  const claimSteps = howTo.length ? howTo : copy?.claimSteps ?? [];
  const whoFor = localized(ja, product.whoForJa, product.whoForEn) || copy?.whoFor || "";
  const faq = copy?.faq ?? [];

  return (
    <div className="mx-auto max-w-5xl pb-12">
      <Link href="/products" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-blue-800 hover:underline">
        <ChevronLeft className="h-4 w-4" />{text.back}
      </Link>

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-xl sm:p-10">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {category && <span className="rounded-full bg-white/15 px-3 py-1">{category}</span>}
          <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-emerald-100">{product.status === "ACTIVE" ? text.available : text.preparing}</span>
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
        {localized(ja, product.taglineJa, product.taglineEn) && <p className="mt-3 max-w-3xl text-lg leading-8 text-blue-100">{localized(ja, product.taglineJa, product.taglineEn)}</p>}
        <p className="mt-4 max-w-3xl leading-7 text-blue-50/90">{localized(ja, product.descriptionJa, product.descriptionEn) || text.noDetails}</p>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-5 border-t border-white/15 pt-6">
          <div>{premium && <><p className="text-sm text-blue-100">{text.monthly}</p><p className="mt-1 text-2xl font-bold">{premium}{typeof product.basePremiumYen === "number" && <span className="ml-2 text-sm font-normal text-blue-100">/ {ja ? "月" : "month"}</span>}</p></>}</div>
          <div className="flex flex-wrap gap-3">
            <Link className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-blue-950 hover:bg-blue-50" href="/contact"><FileText className="h-4 w-4" />{text.quote}</Link>
            <ApplyButton productKey={product.slug || product.id} label={text.apply} />
          </div>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="features-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-blue-800">{ja ? "COVERAGE" : "COVERAGE"}</p><h2 id="features-heading" className="mt-1 text-2xl font-bold text-slate-950">{text.features}</h2></div>
          <ShieldCheck className="hidden h-9 w-9 text-blue-800 sm:block" />
        </div>
        {featureList.length ? <ul className="grid gap-4 md:grid-cols-2">{featureList.map((feature, index) => <li key={`${feature.title}-${index}`} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Check className="h-5 w-5" /></span><div className="min-w-0 flex-1"><h3 className="font-semibold text-slate-950">{feature.title}</h3>{feature.description && <p className="mt-1 text-sm leading-6 text-slate-600">{feature.description}</p>}{feature.amount != null && feature.amount > 0 && <p className="mt-3 text-sm font-semibold text-blue-900">{ja ? "補償限度額" : "Coverage limit"}: {new Intl.NumberFormat(ja ? "ja-JP" : "en-US", { style: "currency", currency: "JPY", maximumFractionDigits: 0 }).format(feature.amount)}</p>}</div></li>)}</ul> : <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">{text.noDetails}</p>}
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {whoFor && <section className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold text-slate-950">{text.forWho}</h2><p className="mt-3 leading-7 text-slate-600">{whoFor}</p></section>}
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-lg font-bold text-slate-950">{text.exclusions}</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">{excludedList.length ? excludedList.map((item, i) => <li key={i} className="flex gap-2"><CircleHelp className="mt-1 h-4 w-4 shrink-0 text-amber-700" />{item}</li>) : <li>{text.terms}</li>}</ul></section>
      </div>

      {claimSteps.length > 0 && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold text-slate-950">{text.claims}</h2><ol className="mt-4 grid gap-3 md:grid-cols-3">{claimSteps.map((step, i) => <li key={i} className="rounded-xl bg-slate-50 p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white">{i + 1}</span><p className="mt-3 text-sm leading-6 text-slate-700">{step}</p></li>)}</ol></section>}

      {faq.length > 0 && <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-bold text-slate-950">{text.faq}</h2><div className="mt-3 divide-y divide-slate-100">{faq.map((item, i) => <details key={i} className="group py-4"><summary className="cursor-pointer list-none font-semibold text-slate-900 marker:hidden">{item.title}<span className="float-right text-blue-800">+</span></summary><p className="mt-2 pr-6 text-sm leading-6 text-slate-600">{item.description}</p></details>)}</div></section>}

      <p className="mt-6 text-xs leading-5 text-slate-500">{text.terms}</p>
    </div>
  );
}
