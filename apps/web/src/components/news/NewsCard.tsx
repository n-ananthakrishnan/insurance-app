import Link from "next/link";
import type { NewsItem } from "@sample-insurance/shared";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function NewsCard({ item }: { item: NewsItem }) {
  const category = typeof item.category === "string" ? item.category : item.category?.nameJa ?? item.category?.nameEn;
  const publishedAt = item.publishedAt ?? item.publishDate;

  return (
    <Link href={`/news/${item.slug ?? item.id}`} className="group block">
      <Card className="h-full border-navy-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-md">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-500">
            {publishedAt && <time dateTime={publishedAt}>{new Date(publishedAt).toLocaleDateString("ja-JP")}</time>}
            {category && <Badge variant="secondary">{category}</Badge>}
          </div>
          <h2 className="text-lg font-semibold leading-snug text-navy-900 group-hover:text-primary-700">
            {item.titleJa}
          </h2>
          {item.titleEn && <p className="mt-1 text-sm text-muted-500">{item.titleEn}</p>}
          {item.summaryJa && <p className="mt-3 text-sm leading-relaxed text-muted-600">{item.summaryJa}</p>}
          {item.summaryEn && <p className="mt-1 text-xs leading-relaxed text-muted-500">{item.summaryEn}</p>}
          <span className="mt-5 inline-flex text-sm font-semibold text-navy-700 group-hover:text-primary-700">記事を読む →</span>
        </CardContent>
      </Card>
    </Link>
  );
}
