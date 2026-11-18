import { notFound } from "next/navigation";
import { ProductDetail, type ProductDetailData } from "@/components/products/ProductDetail";
import { Metadata } from "next";
import { api } from "@/lib/api";
import { demoProducts } from "@/lib/demo-content";
import { getLocale } from "next-intl/server";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(_props: Props): Promise<Metadata> {
  return {
    title: "Product details",
    description: "View product coverage and how to apply.",
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  let product: ProductDetailData;
  const locale = (await getLocale()) as "ja" | "en";
  try {
    product = await api.get<ProductDetailData>(`/products/${id}`);
  } catch {
    const sample = demoProducts.find((item) => item.id === id || item.slug === id);
    if (!sample) notFound();
    product = {
      id: sample.id,
      slug: sample.slug,
      nameJa: sample.nameJa,
      nameEn: sample.nameEn,
      taglineJa: sample.taglineJa,
      taglineEn: sample.taglineEn,
      descriptionJa: sample.descriptionJa,
      descriptionEn: sample.descriptionEn,
      basePremiumYen: sample.basePremiumYen,
      status: "ACTIVE",
      category: typeof sample.category === "object" ? sample.category : null,
      coverages: [],
    } as ProductDetailData;
  }

  return <ProductDetail product={product} language={locale} />;
}
