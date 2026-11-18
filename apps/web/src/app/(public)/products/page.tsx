import { getTranslations } from "@/i18n/request";
import { ProductList } from "@/components/products/ProductList";
import { Metadata } from "next";
import { demoProducts } from "@/lib/demo-content";

export const metadata: Metadata = {
  title: "Products",
  description: "Compare insurance products and find the coverage that fits you.",
};

const CATEGORY_FILTER: Record<string, string> = {
  // Keep category slugs stable even if the backend sends a different shape.
  insurance: "insurance",
  life: "life",
  medical: "medical",
  travel: "travel",
  fire: "fire",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page } = await searchParams;
  const t = await getTranslations("products");

  // Default page for client-side router transitions
  const pageNum = page ? parseInt(page, 10) : 1;
  const categorySlug = (category && CATEGORY_FILTER[category]) ?? CATEGORY_FILTER.insurance ?? "";

  return (
    <div className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-navy-900">{t("title")}</h1>
          <p className="mt-2 text-muted-600">{t("subtitle")}</p>
        </div>

        <p className="mb-6 rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-700">
          サンプル商品データを表示しています。保険料・補償内容はデモ用です。<br />
          Showing sample products. Prices and coverage are for demonstration only.
        </p>
        <ProductList
          initialCategory={categorySlug}
          initialPage={pageNum}
          products={demoProducts.map((product) => ({
            ...product,
            category: typeof product.category === "object" ? product.category : null,
          }))}
        />
      </div>
    </div>
  );
}
