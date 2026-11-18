import type { FaqItem } from "@sample-insurance/shared";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api/v1";

export async function getFaqs(): Promise<FaqItem[]> {
  const res = await fetch(`${API_BASE_URL}/faq`, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch FAQ");
  const json = await res.json();
  return (json.items ?? json.faqs ?? json.data?.items ?? []) as FaqItem[];
}

export async function getFaq(id: string): Promise<FaqItem> {
  const res = await fetch(`${API_BASE_URL}/faq/${id}`, {
    headers: { "Accept": "application/json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch FAQ item");
  const json = await res.json();
  return (json.item ?? json.data?.item ?? json.data) as FaqItem;
}
