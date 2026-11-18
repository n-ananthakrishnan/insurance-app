"use client";

import { useTranslations } from "next-intl";
import type { ClaimSummary } from "@sample-insurance/shared";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "@/lib/date-fns-locales";

export interface RecentClaimItem {
  id: string;
  claimNumber: string;
  customer: { nameJa: string; nameEn: string };
  status: string;
  createdAt: string;
}

type DashboardTranslator = {
  (key: string): string;
  (key: string, params?: Record<string, string | number>): string;
};

interface RecentClaimsQueueProps {
  // Accept both the legacy `claims` shape and the dashboard's `items` shape.
  claims?: ClaimSummary[] | null;
  items?: RecentClaimItem[] | null;
  max?: number;
  t?: DashboardTranslator;
}

const STATUS_CLASSES: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  MORE_DOCUMENTS_NEEDED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-green-100 text-green-700",
  PAID: "bg-navy-100 text-navy-700",
  REJECTED: "bg-red-100 text-red-700",
};

function claimNumberFrom(item: ClaimSummary | RecentClaimItem): string {
  if ("claimNumber" in item) {
    return item.claimNumber ?? item.id ?? "—";
  }
  return (item as ClaimSummary).id ?? "—";
}

function customerNameFrom(item: ClaimSummary | RecentClaimItem): string {
  if ("customer" in item && item.customer && typeof (item as RecentClaimItem).customer === "object") {
    const c = item as RecentClaimItem;
    return (c.customer.nameJa ?? c.customer.nameEn ?? "—") as string;
  }
  const s = item as ClaimSummary;
  return (s.customerNameJa ?? s.customerNameEn ?? "—") as string;
}

export function RecentClaimsQueue({
  claims,
  items,
  max = 5,
  t,
}: RecentClaimsQueueProps) {
  const translator: DashboardTranslator = t ?? useTranslations();
  const locale = typeof document !== "undefined" && navigator.language?.startsWith("ja") ? ja : undefined;

  // Prefer Dashboard's `items`, fall back to legacy `claims`.
  const source: Array<ClaimSummary | RecentClaimItem> =
    items && items.length > 0 ? items : claims ?? [];

  const recent = source.slice(0, max);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-900">
          {translator("admin.dashboard.recentClaims")}
        </h3>
        <Link
          href="/admin/claims"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {translator("admin.dashboard.viewAllClaims")} →
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-500 py-2">
          {translator("admin.dashboard.noRecentClaims")}
        </p>
      ) : (
        <div className="space-y-2">
          {recent.map((claim) => {
            const number = claimNumberFrom(claim);
            const customerName = customerNameFrom(claim);
            const createdAt = ("createdAt" in claim ? claim.createdAt : null) as
              | string
              | null;
            const status = ("status" in claim ? claim.status : "") as string;
            const estimatedAmount = ("estimatedAmount" in claim
              ? claim.estimatedAmount
              : null) as number | null | undefined;

            return (
              <div
                key={claim.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm hover:bg-navy-50 transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-navy-900">{number}</span>
                    <Badge
                      className={STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-700"}
                    >
                      {translator(`claims.status.${status}`) ?? status}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-600">{customerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium text-navy-900">
                    ¥{Number(estimatedAmount ?? 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-500">
                    {formatDistanceToNow(
                      new Date(createdAt ?? "2000-01-01"),
                      { addSuffix: true, locale }
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
