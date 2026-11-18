"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { ClaimSummary } from "@sample-insurance/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ja } from "@/lib/date-fns-locales";
import { api } from "@/lib/api";

interface ClaimListProps {
  claims: ClaimSummary[];
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

export function ClaimList({ claims }: ClaimListProps) {
  const t = useTranslations();
  const [items, setItems] = useState(claims);
  const [loading, setLoading] = useState(claims.length === 0);
  const [loadError, setLoadError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    api.get<{ items: ClaimSummary[] }>("/claims")
      .then((result) => { if (!cancelled) setItems(result.items); })
      .catch(() => { if (!cancelled) setLoadError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);
  const isJa = typeof document !== "undefined" && navigator.language?.startsWith("ja");
  const locale = isJa ? ja : undefined;

  return (
    <div className="space-y-4">
      {loading ? <div className="rounded-xl border border-navy-100 bg-white p-6 text-sm text-muted-600">Loading your claims…</div> : loadError ? <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">Could not load claims. Please sign in again and retry.</div> : items.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-navy-200 bg-navy-50">
          <svg className="mx-auto h-12 w-12 text-muted-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-9m-3 5h9M8 14h8m-4-4v8" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-navy-900">{t("claims.emptyTitle")}</h3>
          <p className="mt-1 text-sm text-muted-600">{t("claims.emptyDescription")}</p>
          <Button className="mt-6" asChild>
            <Link href="/claims/new">{t("claims.newClaim")}</Link>
          </Button>
        </div>
      ) : (
        items.map((claim) => (
          <div
            key={claim.id}
            className="flex flex-col gap-3 rounded-xl border border-navy-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-navy-900">
                    {claim.claimNumber ?? claim.number}
                  </span>
                  <Badge className={STATUS_CLASSES[claim.status] ?? "bg-gray-100 text-gray-700"}>
                    {t(`claims.status.${claim.status}`)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-600">
                  {t(`claims.type.${claim.type ?? claim.claimType}`)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-navy-900">
                  ¥{Number(claim.estimatedAmount).toLocaleString()}
                </p>
                <p className="text-xs text-muted-500">
                  {formatDistanceToNow(new Date(claim.createdAt ?? "2000-01-01"), { addSuffix: true, locale })}
                </p>
              </div>
            </div>

            {claim.policyNumber && (
              <p className="text-xs text-muted-500">
                {t("claims.relatedPolicy")}: {claim.policyNumber}
              </p>
            )}

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild disabled={claim.status === "PAID" || claim.status === "REJECTED"}>
                <Link href={`/customer/my-page/claims/${claim.id}`}>
                  {t("claims.viewDetails")}
                </Link>
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
