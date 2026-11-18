import type { NewsItem, NewsSearchResult } from "@sample-insurance/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export async function getNews(options?: { page?: number; pageSize?: number }): Promise<NewsItem[]> {
  const { page = 1, pageSize = 10 } = options ?? {};
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const res = await fetch(`${API_BASE_URL}/news?${params}`, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  const json = await res.json();
  return (json.items ?? json.articles ?? json.data?.items ?? []) as NewsItem[];
}

export async function getNewsItem(id: string): Promise<NewsItem> {
  const res = await fetch(`${API_BASE_URL}/news/${id}`, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch news item");
  const json = await res.json();
  return (json.item ?? json.article ?? json.data?.article ?? json.data) as NewsItem;
}

export async function searchNews(options?: { query?: string; page?: number; pageSize?: number }): Promise<NewsSearchResult> {
  const { query = "", page = 1, pageSize = 9 } = options ?? {};
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (query) params.set("q", query);
  const res = await fetch(`${API_BASE_URL}/news/search?${params}`, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to search news");
  const json = await res.json();
  return (json.data ?? json) as NewsSearchResult;
}
