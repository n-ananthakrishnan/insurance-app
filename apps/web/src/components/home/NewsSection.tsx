"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { NewsItem } from "@sample-insurance/shared";
import { format } from "date-fns"; import { ja } from "@/lib/date-fns-locales";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { getNews } from "@/lib/news";
import { demoNews } from "@/lib/demo-content";

interface NewsSectionProps {
  news?: NewsItem[];
  loading?: boolean;
}

export function NewsSection({ news: initialNews, loading: initialLoading }: NewsSectionProps) {
  const t = useTranslations("home");
  const [news, setNews] = useState(initialNews ?? []);
  const [loading, setLoading] = useState(initialLoading ?? true);
  const [error, setError] = useState<string | null>(null);

  const isJa = typeof window !== "undefined" && navigator.language?.startsWith("ja");
  const locale = isJa ? ja : undefined;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getNews({ page: 1, pageSize: 3 })
      .then((items) => {
        if (!cancelled) setNews(items.length ? items.slice(0, 3) : demoNews.slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setNews(demoNews.slice(0, 3));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  if (loading && news.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">{t("newsTitle")}</h2>
            <p className="mt-3 text-muted-600 max-w-xl mx-auto">{t("newsSubtitle")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-navy-200 bg-white shadow-sm">
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-3/4 mb-3" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || news.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">{t("newsTitle")}</h2>
          <p className="mt-3 text-muted-600 max-w-xl mx-auto">{t("newsSubtitle")}</p>
          <p className="mt-2 text-xs text-muted-500">デモ用のお知らせを表示しています。</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} locale={locale} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-navy-900 text-white font-semibold shadow hover:bg-navy-800 transition"
          >
            {t("newsTitle")} →
          </Link>
        </div>
      </div>
    </section>
  );
}

function NewsCard({ item, locale }: { item: NewsItem; locale?: typeof ja }) {
  const t = useTranslations("home");

  return (
    <Link href={`/news/${item.id}`} className="group block">
      <Card className="border-navy-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        {item.imageUrl && (
          <div className="aspect-video bg-navy-100 overflow-hidden">
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <CardContent className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-500 mb-2">
            {item.publishedAt && (
              <time dateTime={item.publishedAt}>
                {format(new Date(item.publishedAt), "yyyy.MM.dd", { locale })}
              </time>
            )}
            {item.category && <Badge variant="secondary" className="text-[10px]">{typeof item.category === "string" ? item.category : item.category.nameJa || item.category.nameEn}</Badge>}
          </div>
          <h3 className="text-base font-semibold text-navy-900 group-hover:text-navy-700 mb-2 line-clamp-2">
            {item.titleJa ?? item.titleEn}
          </h3>
          <p className="text-sm text-muted-600 line-clamp-2 flex-1">
            {item.summaryJa ?? item.summaryEn}
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm font-medium text-navy-700 group-hover:text-navy-900">
            {t("newsTitle")}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
