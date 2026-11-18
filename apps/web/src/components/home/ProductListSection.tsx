"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { demoProducts } from "@/lib/demo-content";

interface Product {
  id: string;
  nameJa: string;
  nameEn: string;
  taglineJa: string | null;
  taglineEn: string | null;
  basePremiumYen: number;
  paymentCycles: string[];
  status: string;
  category: {
    id: string;
    nameJa: string;
    nameEn: string;
    slug: string;
  } | null;
}

interface ProductsResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const CATEGORIES = [
  { slug: "auto", nameJa: "自動車保険", nameEn: "Auto insurance" },
  { slug: "fire", nameJa: "火災保険", nameEn: "Fire insurance" },
  { slug: "medical", nameJa: "医療保険", nameEn: "Medical insurance" },
  { slug: "liability", nameJa: "賠償責任保険", nameEn: "Liability insurance" },
];

function getDemoProducts(category: string): Product[] {
  return demoProducts
    .filter((product) => category === "all" || (typeof product.category === "object" && product.category?.slug === category))
    .map((product) => ({
      id: product.id,
      nameJa: product.nameJa,
      nameEn: product.nameEn ?? product.nameJa,
      taglineJa: product.taglineJa ?? null,
      taglineEn: product.taglineEn ?? null,
      basePremiumYen: product.basePremiumYen ?? 0,
      paymentCycles: [],
      status: "ACTIVE",
      category: typeof product.category === "object" ? product.category : null,
    }));
}

export function ProductListSection() {
  const t = useTranslations("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "8",
        });
        if (category !== "all") {
          params.set("category", category);
        }

        const res = await api.get<ProductsResponse>(`/products?${params}`);
        if (!cancelled) {
          const availableProducts = res.items.length ? res.items : getDemoProducts(category);
          if (page === 1) {
            setProducts(availableProducts);
          } else {
            setProducts((prev) => [...prev, ...availableProducts]);
          }
          setPagination(res);
          setHasMore(res.items.length > 0 && page < res.totalPages);
        }
      } catch {
        if (!cancelled) {
          setProducts(getDemoProducts(category));
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [category, page]);

  const loadMore = () => {
    if (!hasMore || loading) return;
    setPage((prev) => prev + 1);
  };

  const categories = [
    { slug: "all", nameJa: "すべてのカテゴリ", nameEn: "All categories" },
    ...CATEGORIES,
  ];

  return (
    <div className="space-y-6">
      <p className="text-center text-xs text-muted-500">掲載商品・保険料は画面確認用のサンプルです。</p>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => {
              setCategory(cat.slug);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              category === cat.slug
                ? "bg-navy-900 text-white"
                : "bg-navy-100 text-navy-700 hover:bg-navy-200"
            }`}
          >
            {cat.nameJa}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-navy-200 bg-white p-5">
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-3 w-1/2 mb-4" />
              <Skeleton className="h-3 w-2/3 mb-4" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-500">{t("productsTitle")}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {/* Pagination */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-2 rounded-full bg-navy-900 text-white font-medium hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {t("loadMore")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
