"use client";

import { useTranslations } from "next-intl";
import { ProductCard } from "./ProductCard";

interface ProductListProps {
  products?: Array<{
    id: string;
    nameJa?: string | null;
    nameEn?: string | null;
    shortDescriptionJa?: string | null;
    shortDescriptionEn?: string | null;
    coverageType?: string | null;
    annualPremiumYen?: number | null;
    category?: { id: string; nameJa: string; nameEn: string; slug: string } | null;
    taglineJa?: string | null;
    taglineEn?: string | null;
    basePremiumYen?: number | null;
    priceFrom?: number | null;
    badge?: string | null;
  }>;
  initialCategory?: string;
  initialPage?: number;
}

export function ProductList({ products = [] }: ProductListProps) {
  const t = useTranslations("products");
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-navy-200 bg-navy-50 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-navy-900">{t("noProducts")}</p>
          <p className="mt-2 text-sm text-muted-600">商品情報を準備しています。時間をおいて再度ご確認ください。<br />Product information is being prepared. Please check back soon.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => <ProductCard key={product.id} product={{ ...product, nameJa: product.nameJa ?? "", nameEn: product.nameEn ?? "" }} />)}
    </div>
  );
}
