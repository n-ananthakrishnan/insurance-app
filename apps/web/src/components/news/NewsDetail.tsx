import type { NewsItem } from "@sample-insurance/shared";
import { format } from "date-fns";
import { ja } from "@/lib/date-fns-locales";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

interface NewsDetailProps {
  news: NewsItem;
  onBreadcrumb?: () => void;
}

export function NewsDetail({ news }: NewsDetailProps) {
  const date = news.publishedAt ?? news.publishDate ?? "";
  const category = typeof news.category === "string" ? news.category : news.category?.nameJa ?? news.category?.nameEn;
  const body = news.body ?? news.bodyJa ?? news.summaryJa ?? news.bodyEn;

  return (
    <article className="mx-auto min-h-[50vh] max-w-3xl">
      <Link href="/news" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-500 hover:text-navy-800">
        ← お知らせ一覧に戻る
      </Link>
      <header className="mb-8 border-b border-navy-200 pb-6">
        <div className="mb-3 flex items-center gap-3 text-sm text-muted-500">
          {date && <time dateTime={date}>{format(new Date(date), "yyyy年MM月dd日", { locale: ja })}</time>}
          {category && <Badge variant="secondary">{category}</Badge>}
        </div>
        <h1 className="text-3xl font-bold leading-tight text-navy-900">{news.titleJa}</h1>
        {news.titleEn && <p className="mt-2 text-lg text-muted-500">{news.titleEn}</p>}
        {news.summaryJa && <p className="mt-5 text-lg leading-relaxed text-navy-700">{news.summaryJa}</p>}
      </header>
      <Card className="border-navy-200 bg-white shadow-sm">
        <CardContent className="space-y-4 py-6 leading-8 text-navy-800">
          <p>{String(body ?? "記事本文は準備中です。")}</p>
          {news.bodyEn && <p className="border-t border-navy-100 pt-4 text-muted-600">{news.bodyEn}</p>}
        </CardContent>
      </Card>
      <div className="mt-6 flex flex-wrap gap-3">
        <a className="inline-flex h-9 items-center rounded-md border border-navy-200 px-3 text-sm text-navy-700 hover:bg-navy-50" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(news.titleJa)}`} target="_blank" rel="noreferrer">Twitterで共有</a>
        <a className="inline-flex h-9 items-center rounded-md border border-navy-200 px-3 text-sm text-navy-700 hover:bg-navy-50" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`} target="_blank" rel="noreferrer">Facebookで共有</a>
      </div>
    </article>
  );
}
