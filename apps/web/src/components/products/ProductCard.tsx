"use client";

import Link from "next/link";

interface Product {
  id: string;
  nameJa: string;
  nameEn?: string | null;
  taglineJa?: string | null;
  taglineEn?: string | null;
  basePremiumYen?: number | null;
  paymentCycles?: string[] | null;
  status?: string | null;
  category?:
    | { id: string; nameJa: string; nameEn: string; slug: string }
    | null;
  badge?: string | null;
  priceFrom?: number | null;
  imageUrl?: string | null;
  featured?: boolean | null;
  highlightsJa?: string | string[] | null;
  highlightsEn?: string | string[] | null;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const jaName = (product.nameJa || product.nameEn) ?? "-";
  const enName = (product.nameEn ?? product.nameJa) ?? "-";
  const tagline = (product.taglineJa ?? product.taglineEn) ?? "";
  const previewPrice = (product.basePremiumYen ?? product.priceFrom) ?? 0;
  const categoryLabel = (product.category?.nameJa ?? product.category?.nameEn) ?? "";

  return (
    <Link
      href={`/products/${product.id}`}
      className="block rounded-xl border border-navy-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-navy-300 transition"
    >
      {product.badge && (
        <span className="inline-block rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-semibold text-navy-700 mb-2">
          {product.badge}
        </span>
      )}
      <div className="text-xs font-medium text-navy-500 uppercase tracking-wide mb-2">
        {categoryLabel || ""}
      </div>
      <h3 className="text-base font-semibold text-navy-900 mb-1">{jaName}</h3>
      {enName !== jaName && (
        <p className="text-xs text-muted-500 mb-2">{enName}</p>
      )}
      <p className="text-sm text-muted-600 mb-3">{tagline}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-navy-700">
          ¥{Number(previewPrice).toLocaleString()}
        </span>
        <span className="text-xs text-navy-500">詳細を見る →</span>
      </div>
    </Link>
  );
}
