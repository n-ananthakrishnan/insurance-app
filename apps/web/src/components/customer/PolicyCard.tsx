import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLocale } from "@/i18n/use-locale";
import { useTranslationsClient } from "@/i18n/client";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "@/lib/date-fns-locales";
import { ArrowRight, Calendar, Tag, X } from "@/components/ui/icons";
import { useState } from "react";

interface Policy {
  id: string;
  policyNumber: string;
  status: string;
  startDate: string;
  endDate: string | null;
  monthlyPremiumYen: number | null;
  totalPremiumYen: number | null;
  category: { nameJa: string; nameEn: string } | null;
  product: { nameJa: string; nameEn: string } | null;
}

export function PolicyCard({ policy, onCancel }: { policy: Policy; onCancel?: () => void }) {
  useLocale();
  const t = useTranslationsClient("customer");
  const [showCancel, setShowCancel] = useState(false);

  const statusColor =
    policy.status === "ACTIVE" ? "success" :
    policy.status === "CANCELLED" ? "secondary" :
    policy.status === "PENDING" ? "warning" : "info";

  const statusLabel =
    policy.status === "ACTIVE" ? t("policyStatus.active") :
    policy.status === "CANCELLED" ? t("policyStatus.cancelled") :
    policy.status === "PENDING" ? t("policyStatus.pending") :
    policy.status === "EXPIRED" ? t("policyStatus.expired") :
    policy.status;

  const startDate = policy.startDate ? format(new Date(policy.startDate), "yyyy年MM月dd日", { locale: ja }) : "—";
  const endDate = policy.endDate ? format(new Date(policy.endDate), "yyyy年MM月dd日", { locale: ja }) : "契約中";

  return (
    <Card className="overflow-hidden group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusColor === "success" ? "bg-green-100" : statusColor === "warning" ? "bg-amber-100" : statusColor === "secondary" ? "bg-gray-100" : "bg-blue-100"}`}>
              <Tag className={`w-6 h-6 ${statusColor === "success" ? "text-green-600" : statusColor === "warning" ? "text-amber-600" : statusColor === "secondary" ? "text-gray-600" : "text-blue-600"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-500">{policy.policyNumber}</span>
                <Badge variant={statusColor} size="sm">{statusLabel}</Badge>
              </div>
              <h3 className="font-semibold text-navy-900">
                {policy.product?.nameJa ?? policy.category?.nameJa ?? "—"}
              </h3>
              <p className="text-sm text-muted-600">{policy.category?.nameJa ?? "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-500">
            <Calendar className="w-4 h-4" />
            <span>{startDate}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-muted-600">
            <span className="flex items-center gap-1">
              <span className="text-xs">{t("policy.startDate")}:</span>
              <span>{startDate}</span>
            </span>
            {endDate !== "契約中" && (
              <span className="flex items-center gap-1">
                <span className="text-xs">{t("policy.endDate")}:</span>
                <span>{endDate}</span>
              </span>
            )}
            {policy.monthlyPremiumYen != null && (
              <span className="flex items-center gap-1">
                <span className="text-xs">{t("policy.monthlyPremium")}:</span>
                <span className="font-medium text-navy-900">¥{policy.monthlyPremiumYen.toLocaleString()}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {policy.status === "ACTIVE" && (
              <button
                type="button"
                onClick={() => setShowCancel(!showCancel)}
                className={`p-1.5 rounded-md transition ${showCancel ? "bg-red-50 text-red-600" : "text-muted-400 hover:text-red-500 hover:bg-red-50"}`}
                aria-label={t("policy.cancel")}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Link
              href={`/customer/policies/${policy.id}`}
              className="inline-flex items-center gap-1 text-accent-600 hover:text-accent-700 font-medium text-sm"
            >
              {t("policy.viewDetails")}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Cancel confirmation popover */}
        {showCancel && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-sm">
            <p className="font-medium text-red-800 mb-2">{t("policy.cancelConfirm")}</p>
            <p className="text-red-700 mb-3">{t("policy.cancelNote")}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                className="flex-1 px-3 py-1.5 rounded-md bg-white border border-red-200 text-red-700 hover:bg-red-100 transition"
              >
                {t("shared.cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCancel(false);
                  onCancel?.();
                }}
                className="flex-1 px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
              >
                {t("policy.cancelConfirmAction")}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
