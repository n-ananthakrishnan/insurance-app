"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { NewsItem } from "@sample-insurance/shared";
import {
  Card,
  CardContent,
} from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { NewsCard } from "./NewsCard";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "@/components/ui/icons";

interface NewsListProps {
  items?: NewsItem[];
  initialPage?: number;
}

const PAGE_SIZE = 6;

export function NewsList({ items: initialItems, initialPage = 1 }: NewsListProps) {
  const t = useTranslations();
  const [items, setItems] = useState<NewsItem[]>(initialItems ?? []);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageSize = PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize) || 1);

  const goToPage = useCallback(
    (next: number) => {
      setPage((prev) => Math.max(1, Math.min(totalPages, prev + next)));
    },
    [totalPages]
  );

  const loadPage = useCallback(
    async (targetPage: number) => {
      const start = (targetPage - 1) * pageSize;
      const end = start + pageSize;
      setLoading(true);
      setError(null);
      try {
        const pageItems = items.slice(start, end);
        if (pageItems.length === 0 && targetPage > 1 && items.length > 0) {
          setPage((prev) => Math.max(1, prev - 1));
          return;
        }
        setItems((prev) => prev);
      } finally {
        setLoading(false);
      }
    },
    [items]
  );

  const displayed = items.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      {displayed.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}

      {displayed.length === 0 && !loading && !error && (
        <div className="text-center py-12 rounded-xl border border-dashed border-navy-200 bg-navy-50">
          <p className="text-muted-500">お知らせを準備しています。時間をおいて再度ご確認ください。</p>
          <p className="mt-2 text-sm text-muted-500">News is being prepared. Please check back soon.</p>
        </div>
      )}

      {error && displayed.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-dashed border-navy-200 bg-navy-50">
          <p className="text-muted-500">{error}</p>
          <button
            type="button"
            onClick={() => loadPage(1)}
            className="mt-4 text-sm text-navy-700 underline hover:text-navy-900"
          >
            {t("news.retry") ?? "再読み込み"}
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-navy-200">
          <button
            type="button"
            onClick={() => goToPage(-1)}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("news.prev") ?? "前へ"}
          </button>
          <span className="text-sm text-muted-600">
            {t("news.pageInfo", { page, totalPages }) ?? `${page} / ${totalPages}`}
          </span>
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-700 hover:bg-navy-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("news.next") ?? "次へ"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {totalPages > 1 && page < totalPages && (
        <Link
          href={`/news?page=${page + 1}`}
          className="flex justify-center py-4 text-sm text-navy-700 hover:text-navy-900"
        >
          {t("news.viewAll") ?? "すべて見る"}
          <ArrowRight className="inline-block h-4 w-4 ml-1" />
        </Link>
      )}
    </div>
  );
}
