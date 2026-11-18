import { NewsList } from "@/components/news/NewsList";
import { Metadata } from "next";
import { demoNews } from "@/lib/demo-content";

export const metadata: Metadata = {
  title: "News",
  description: "Latest news and announcements.",
};

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = page ? parseInt(page, 10) : 1;

  return (
    <div className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-navy-900">お知らせ</h1>
          <p className="mt-2 text-muted-600">最新のお知らせ・ご案内をご確認ください。</p>
        </div>

        <p className="mb-6 rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">
          デモ用のお知らせです。<br />These sample announcements are for demonstration only.
        </p>
        <NewsList initialPage={pageNum} items={demoNews} />
      </div>
    </div>
  );
}
