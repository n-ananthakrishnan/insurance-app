"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import { Skeleton } from "@/components/ui/Skeleton";
import { demoFaqs } from "@/lib/demo-content";

interface FaqItem {
  id: string;
  questionJa: string;
  questionEn: string;
  answerJa: string;
  answerEn: string;
  categoryId: string;
  category: {
    id: string;
    nameJa: string;
    nameEn: string;
    slug: string;
  } | null;
}

export function FaqAccordion() {
  const t = useTranslations("home");
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const data = await api.get<{ items: FaqItem[] }>("/faq");
        if (!cancelled) {
          setItems(data.items?.length ? data.items : getDemoFaqs());
        }
      } catch {
        // In production we might show a fallback; for now leave empty.
        if (!cancelled) {
          setItems(getDemoFaqs());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    const key = item.category?.slug || "uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const categoryNames: Record<string, { ja: string; en: string }> = {
    auto: { ja: "自動車保険", en: "Auto insurance" },
    fire: { ja: "火災保険", en: "Fire insurance" },
    medical: { ja: "医療保険", en: "Medical insurance" },
    liability: { ja: "賠償責任保険", en: "Liability insurance" },
    general: { ja: "全般", en: "General" },
    uncategorized: { ja: "その他", en: "Other" },
  };

  function getDemoFaqs(): FaqItem[] {
    return demoFaqs.map((faq) => ({
      id: faq.id,
      questionJa: faq.questionJa,
      questionEn: faq.questionEn ?? "",
      answerJa: faq.answerJa,
      answerEn: faq.answerEn ?? "",
      categoryId: faq.category ?? "general",
      category: {
        id: faq.category ?? "general",
        nameJa: faq.category ?? "一般",
        nameEn: "General",
        slug: faq.category === "事故・請求" ? "claims" : "general",
      },
    }));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-navy-50">
            <Skeleton className="h-5 w-2/3 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-500">
        FAQ情報を準備しています。時間をおいて再度ご確認ください。<br />FAQ information is being prepared. Please check back soon.
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-xs text-muted-500">サンプルFAQ</p>
      <Accordion type="single" collapsible defaultValue={items[0]?.id}>
      {Object.entries(grouped).map(([categorySlug, categoryItems]) => {
        const name = categoryItems[0]?.category?.nameJa
          || categoryNames[categorySlug]?.ja
          || t("faqOther");
        const nameEn = categoryItems[0]?.category?.nameEn
          || categoryNames[categorySlug]?.en
          || "";

        return (
          <div key={categorySlug} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-navy-700 uppercase tracking-wide mb-2">
              {name}
              {nameEn && (
                <span className="ml-2 text-xs text-muted-500 font-normal normal-case">
                  ({nameEn})
                </span>
              )}
            </h3>
            <Accordion
              type="single"
              collapsible
              defaultValue={categoryItems[0]?.id || undefined}
            >
              {categoryItems.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left py-3">
                    <span className="font-medium text-navy-900">
                      {item.questionJa}
                    </span>
                    {item.questionEn && (
                      <span className="block text-sm text-muted-500 mt-0.5">
                        {item.questionEn}
                      </span>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pb-3 text-muted-700 leading-relaxed">
                      <p>{item.answerJa}</p>
                      {item.answerEn && (
                        <p className="mt-2 text-sm text-muted-500 border-t pt-2">
                          {item.answerEn}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        );
      })}
      </Accordion>
    </div>
  );
}
