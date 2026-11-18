import { notFound } from "next/navigation";
import { NewsDetail } from "@/components/news/NewsDetail";
import { Metadata } from "next";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft } from "@/components/ui/icons";
import { demoNews } from "@/lib/demo-content";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return {
    title: "News detail",
    description: "View the full news article.",
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  let article;
  try {
    article = await api.get<{
      id: string;
      titleJa: string;
      titleEn: string;
      summaryJa: string | null;
      summaryEn: string | null;
      bodyJa: string;
      bodyEn: string;
      categoryId: string | null;
      category: { id: string; nameJa: string; nameEn: string; slug: string } | null;
      publishDate: string | null;
      imageUrlJa: string | null;
      imageUrlEn: string | null;
      viewCount: number;
    }>(`/news/${id}`);
  } catch {
    const sample = demoNews.find((item) => item.id === id || item.slug === id);
    if (!sample) notFound();
    article = {
      ...sample,
      titleEn: sample.titleEn ?? sample.titleJa,
      summaryJa: sample.summaryJa ?? "",
      summaryEn: sample.summaryEn ?? "",
      bodyJa: sample.bodyJa ?? "",
      bodyEn: sample.bodyEn ?? "",
      categoryId: null,
      category: { id: "demo", nameJa: String(sample.category), nameEn: "Sample", slug: "sample" },
      publishDate: sample.publishedAt ?? null,
      imageUrlJa: null,
      imageUrlEn: null,
      viewCount: 0,
    };
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          href="/news"
          className="inline-flex items-center text-muted-500 hover:text-navy-700 text-sm mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          お知らせに戻る
        </Link>

        <NewsDetail news={article} />
      </div>
    </div>
  );
}
