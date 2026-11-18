"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type { FaqItem } from "@sample-insurance/shared";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";
import { Search } from "@/components/ui/icons";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { getFaqs } from "@/lib/faq";
import { demoFaqs } from "@/lib/demo-content";

interface FaqSectionProps {
  faqs?: FaqItem[];
  loading?: boolean;
  emptyLabel?: string;
  noResultsLabel?: string;
}

export function FaqSection({ faqs: initialFaqs, loading: initialLoading, emptyLabel, noResultsLabel }: FaqSectionProps) {
  const t = useTranslations("home");
  const [faqs, setFaqs] = useState(initialFaqs ?? []);
  const [loading, setLoading] = useState(initialLoading ?? true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getFaqs()
      .then((items) => {
        if (!cancelled) setFaqs(items.length ? items.filter(Boolean) : demoFaqs);
      })
      .catch(() => {
        if (!cancelled) setFaqs(demoFaqs);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return faqs;
    const q = search.toLowerCase();
    return faqs.filter((item) => {
      const question = (item.questionJa ?? item.questionEn ?? "").toLowerCase();
      const answer = (item.answerJa ?? item.answerEn ?? "").toLowerCase();
      return question.includes(q) || answer.includes(q);
    });
  }, [faqs, search]);

  if (loading && faqs.length === 0) {
    return (
      <section className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">{t("faqTitle")}</h2>
            <p className="mt-3 text-muted-600 max-w-xl mx-auto">{t("faqSubtitle")}</p>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-navy-200 bg-white p-5">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || faqs.length === 0) {
    return null;
  }

  const displayEmptyLabel = emptyLabel ?? t("faqTitle");
  const displayNoResultsLabel = noResultsLabel ?? t("faqTitle");

  return (
    <section className="py-16 bg-primary-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">{t("faqTitle")}</h2>
          <p className="mt-3 text-muted-600 max-w-xl mx-auto">{t("faqSubtitle")}</p>
          <p className="mt-2 text-xs text-muted-500">デモ用のサンプルFAQ</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("faqSubtitle")}
            className="pl-10 h-12 text-base rounded-xl border-navy-200 bg-white shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-400 hover:text-navy-700"
              aria-label={t("faqTitle")}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-muted-500 mb-6">
            {`${filtered.length} / ${faqs.length}`}
          </p>
        )}

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="text-center py-12 rounded-xl border border-dashed border-navy-200 bg-white">
            <p className="text-muted-500">
              {search ? displayNoResultsLabel : displayEmptyLabel}
            </p>
          </div>
        )}

        {/* FAQ list */}
        <Accordion type="single" defaultValue={filtered[0]?.id}>
          {filtered.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger>
                <span className="text-left text-sm font-medium text-navy-900">
                  {item.questionJa ?? item.questionEn}
                </span>
                <svg className="h-4 w-4 text-muted-400 shrink-0 transition-transform group-data-[state=open]:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </AccordionTrigger>
              <AccordionContent>
                <div className="prose prose-sm max-w-none text-muted-600">
                  {(item.answerJa ?? item.answerEn) as any}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact link */}
        <div className="mt-10 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-navy-900 text-white font-semibold shadow hover:bg-navy-800 transition"
          >
            {t("faqTitle")} â†’
          </Link>
        </div>
      </div>
    </section>
  );
}

