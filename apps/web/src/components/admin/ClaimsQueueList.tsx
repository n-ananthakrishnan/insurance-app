"use client";

import { useTranslations } from "next-intl";
import type { ClaimSummary } from "@sample-insurance/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { ja } from "@/lib/date-fns-locales";
import Link from "next/link";

interface ClaimsQueueListProps {
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

export function ClaimsQueueList({ claims }: ClaimsQueueListProps) {
  const t = useTranslations();
  const isJa = typeof document !== "undefined" && navigator.language?.startsWith("ja");
  const locale = isJa ? ja : undefined;

  return (
    <div className="space-y-3">
      {claims.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-navy-200 bg-navy-50">
          <p className="text-muted-500">{t("admin.claimsEmpty")}</p>
        </div>
      ) : (
        claims.map((claim) => (
          <div
            key={claim.id}
            className="flex items-start gap-4 rounded-xl border border-navy-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-navy-100 text-sm font-semibold text-navy-800">
              {String(claim.claimNumber ?? claim.number ?? "").slice(-4)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-navy-900">
                    {claim.claimNumber}
                  </p>
                  <p className="mt-1 text-sm text-muted-600">
                    {claim.customerNameJa ?? claim.customerNameEn}
                  </p>
                </div>
                <Badge className={STATUS_CLASSES[claim.status] ?? "bg-gray-100 text-gray-700"}>
                  {t(`claims.status.${claim.status}`)}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-500">
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDistanceToNow(new Date(claim.createdAt ?? claim.submittedAt ?? claim.lastActivityAt ?? "2000-01-01"), { addSuffix: true, locale })}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t(`claims.type.${claim.type ?? claim.claimType ?? ""}`) ?? claim.type ?? claim.claimType ?? ""}
                </span>
                <span>¥{Number(claim.estimatedAmount ?? 0).toLocaleString()}</span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/claims/${claim.id}`}>
                    {t("admin.claims.viewDetails")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
