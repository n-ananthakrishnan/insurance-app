"use client";

import { useTranslations } from "next-intl";
import type { PolicyWithCustomer } from "@sample-insurance/shared";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  format,
  addMonths,
} from "date-fns";
import { ja } from "@/lib/date-fns-locales";
import Link from "next/link";

interface PolicyDetailProps {
  policy: PolicyWithCustomer;
}

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-gray-200 text-gray-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export function PolicyDetail({ policy }: PolicyDetailProps) {
  const t = useTranslations();
  const locale = typeof document !== "undefined" && navigator.language?.startsWith("ja") ? ja : undefined;

  // Normalize fields the policy detail page fetches (real API) vs older/shared shapes.
  const policyNumber = policy.policyNumber ?? policy.number ?? "-";
  const productName = policy.productNameJa ?? policy.productNameEn ?? policy.product?.nameJa ?? policy.product?.nameEn ?? "-";
  const annualPremium = policy.annualPremiumYen ?? policy.totalPremiumYen ?? policy.monthlyPremiumYen ?? 0;
  const paymentCycle = policy.paymentCycle ?? policy.paymentMethod ?? "";
  const coverages = policy.coverages ?? [];

  const startDate = new Date(policy.startDate ?? policy.createdAt ?? "2000-01-01");
  const termMonths = policy.termMonths ?? 12;
  const renewalDate = addMonths(startDate, termMonths);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-500">
              {t("policies.policyNumber")}
            </span>
            <span className="text-lg font-semibold text-navy-900">{policyNumber}</span>
          </div>
          <p className="mt-1 text-muted-600">{productName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={STATUS_CLASSES[policy.status] ?? "bg-gray-100 text-gray-700"}>
            {t(`policies.status.${policy.status}`) ?? policy.status}
          </Badge>
        </div>
      </div>

      {/* Coverage summary */}
      <div className="grid gap-4 rounded-xl border border-navy-200 bg-white p-5 sm:grid-cols-3">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-500">{t("policies.annualPremium")}</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">
            ¥{Number(annualPremium).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-500">{t("policies.termMonths")}</p>
          <p className="mt-1 text-2xl font-bold text-navy-900">{termMonths}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-muted-500">{t("policies.renewalDate")}</p>
          <p className="mt-1 text-lg font-semibold text-navy-900">
            {format(renewalDate, "yyyy年MM月dd日", { locale })}
          </p>
        </div>
      </div>

      {/* Coverage items */}
      {coverages.length > 0 && (
        <div className="rounded-xl border border-navy-200 bg-white p-5">
          <h2 className="text-base font-semibold text-navy-900 mb-4">
            {t("policies.coverages")}
          </h2>
          <ul className="space-y-2">
            {coverages.map((coverage) => (
              <li
                key={coverage.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-navy-200 bg-navy-50 px-4 py-3"
              >
                <span className="text-sm text-navy-900">
                  {coverage.descriptionJa ?? coverage.descriptionEn ?? "-"}
                </span>
                <span className="text-sm font-semibold text-navy-900">
                  ¥{Number(coverage.amount).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Schedule / dates */}
      <div className="rounded-xl border border-navy-200 bg-white p-5">
        <h2 className="text-base font-semibold text-navy-900 mb-4">
          {t("policies.schedule")}
        </h2>
        <dl className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-500">{t("policies.startDate")}</dt>
            <dd className="mt-1 text-sm font-medium text-navy-900">
              {format(startDate, "yyyy年MM月dd日", { locale })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-500">{t("policies.renewalDateLabel")}</dt>
            <dd className="mt-1 text-sm font-medium text-navy-900">
              {format(renewalDate, "yyyy年MM月dd日", { locale })}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-500">{t("policies.paymentCycle")}</dt>
            <dd className="mt-1 text-sm font-medium text-navy-900">
              {t(`policies.paymentCycle.${paymentCycle}`) ?? paymentCycle ?? "-"}
            </dd>
          </div>
        </dl>
      </div>

      {/* Customer */}
      {policy.customer && (
        <div className="rounded-xl border border-navy-200 bg-white p-5">
          <h2 className="text-base font-semibold text-navy-900 mb-4">
            {t("policies.holder")}
          </h2>
          <dl className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-500">{t("policies.name")}</dt>
              <dd className="mt-1 text-sm font-medium text-navy-900">
                {policy.customer.nameJa ?? policy.customer.nameEn ?? policy.customer.name ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-500">{t("policies.email")}</dt>
              <dd className="mt-1 text-sm text-navy-900">{policy.customer.email}</dd>
            </div>
            {policy.customer.phone && (
              <div>
                <dt className="text-sm text-muted-500">{t("policies.phone")}</dt>
                <dd className="mt-1 text-sm text-navy-900">{policy.customer.phone}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {policy.status === "ACTIVE" && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/policies/${encodeURIComponent(policyNumber)}/documents`}>
              {t("policies.viewDocuments")}
            </Link>
          </Button>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href="/claims/new">{t("policies.reportIncident")}</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/policies">{t("policies.backToList")}</Link>
        </Button>
      </div>
    </div>
  );
}
