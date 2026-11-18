"use client";

import { useTranslations } from "next-intl";
import type { ClaimWithCustomer } from "@sample-insurance/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { ja } from "@/lib/date-fns-locales";
import Link from "next/link";

interface ClaimDetailProps {
  claim: ClaimWithCustomer;
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

export function ClaimDetail({ claim }: ClaimDetailProps) {
  const t = useTranslations();
  const locale = typeof document !== "undefined" && navigator.language?.startsWith("ja") ? ja : undefined;

  // Normalize the claim number the UI displays. The claim detail page fetches the
  // real API response (which uses `claimNumber`); older/list shapes use `number`.
  // `ClaimWithCustomer` accepts both.
  const claimNumber = claim.claimNumber ?? claim.number ?? "-";
  const claimType = claim.type ?? claim.claimType ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy-900">
              {claimNumber}
            </h1>
            <Badge className={STATUS_CLASSES[claim.status] ?? "bg-gray-100 text-gray-700"}>
              {t(`claims.status.${claim.status}`) ?? claim.status}
            </Badge>
          </div>
          <p className="mt-1 text-muted-600">
            {t(`claims.type.${claimType}`) ?? claimType ?? ""} ·{" "}
            {format(new Date(claim.createdAt ?? "2000-01-01"), "yyyy年MM月dd日 HH:mm", { locale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/claims">{t("claims.backToList")}</Link>
          </Button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-4 rounded-xl border border-navy-200 bg-white p-5 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-navy-700">{t("claims.estimatedAmount")}</p>
          <p className="text-2xl font-bold text-navy-900">
            ¥{Number(claim.estimatedAmount ?? 0).toLocaleString()}
          </p>
        </div>
        {claim.policyNumber && (
          <div>
            <p className="text-sm font-medium text-navy-700">{t("claims.relatedPolicy")}</p>
            <p className="text-lg font-semibold text-navy-900">{claim.policyNumber}</p>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-navy-700">{t("claims.description")}</p>
          <p className="mt-1 text-sm text-muted-700">
            {claim.descriptionJa ?? claim.descriptionEn ?? "-"}
          </p>
        </div>
        {claim.address && (
          <div>
            <p className="text-sm font-medium text-navy-700">{t("claims.address")}</p>
            <p className="mt-1 text-sm text-muted-700">{claim.address}</p>
          </div>
        )}
      </div>

      {/* Customer info */}
      {claim.customer && (
        <div className="rounded-xl border border-navy-200 bg-white p-5">
          <h2 className="text-base font-semibold text-navy-900 mb-4">
            {t("claims.customerInfo")}
          </h2>
          <dl className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-500">{t("claims.name")}</dt>
              <dd className="mt-1 text-sm font-medium text-navy-900">
                {claim.customer.nameJa ?? claim.customer.nameEn ?? claim.customer.name ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-500">{t("claims.email")}</dt>
              <dd className="mt-1 text-sm text-navy-900">{claim.customer.email}</dd>
            </div>
            {claim.customer.phone && (
              <div>
                <dt className="text-sm text-muted-500">{t("claims.phone")}</dt>
                <dd className="mt-1 text-sm text-navy-900">{claim.customer.phone}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Documents */}
      {claim.documents && claim.documents.length > 0 && (
        <div className="rounded-xl border border-navy-200 bg-white p-5">
          <h2 className="text-base font-semibold text-navy-900 mb-4">
            {t("claims.documents")}
          </h2>
          <ul className="space-y-2">
            {claim.documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-navy-200 bg-navy-50 px-4 py-3 text-sm"
              >
                <span className="truncate">
                  {doc.fileNameJa ?? doc.fileNameEn ?? doc.fileName ?? "-"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0"
                  asChild
                >
                  <Link href={`/claims/${claim.id}/documents/${doc.id}`}>
                    {t("claims.viewDocument")}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next steps */}
      {claim.status !== "PAID" && claim.status !== "REJECTED" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">{t("claims.nextStepsNote")}</p>
          <p className="mt-1">{t("claims.nextSteps")}</p>
        </div>
      )}
    </div>
  );
}
