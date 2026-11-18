"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "@/components/ui/icons";

interface DashboardStatsProps {
  // Note: this component's translations still reference legacy stat keys
  // (totalClaims, pendingReview, approvedThisMonth, deniedThisMonth, paidThisMonth,
  //  avgProcessingDays). When the dashboard is aligned to the real API contract,
  //  these props should be replaced with the real stats shape.
  claimsInQueue?: number | null;
  activePolicies?: number | null;
  newCustomers?: number | null;
  pendingDocuments?: number | null;

  // Legacy stats shape kept for translations until the dashboard is aligned.
  stats?: {
    totalClaims?: number | null;
    pendingReview?: number | null;
    approvedThisMonth?: number | null;
    deniedThisMonth?: number | null;
    paidThisMonth?: number | null;
    avgProcessingDays?: number | null;
  };
  previousStats?: {
    totalClaims?: number | null;
    pendingReview?: number | null;
    approvedThisMonth?: number | null;
    deniedThisMonth?: number | null;
    paidThisMonth?: number | null;
  };
}

function DeltaBadge({ value, previous }: { value: number; previous?: number }) {
  // kept for future locale-aware delta labels; currently purely numeric.
  void useTranslations;
  if (!previous) return null;

  const delta = value - previous;
  const percent = previous === 0 ? 0 : (delta / previous) * 100;

  if (Math.abs(percent) < 0.5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        <Minus className="h-3 w-3" />
        0%
      </span>
    );
  }

  const isUp = delta > 0;
  // NOTE: the previous `value === "pendingReview"` check was always false because
  // `value` is numeric here; restored to a numeric comparison.
  const isBad = isUp && value > 100;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        (isUp && !isBad) || (!isUp && isBad)
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(percent).toFixed(1)}%
    </span>
  );
}

export function DashboardStats({
  stats,
  previousStats,
  claimsInQueue,
  activePolicies,
  newCustomers,
  pendingDocuments,
}: DashboardStatsProps) {
  // Prefer the new dashboard shape when present, falling back to the legacy stats
  // shape so existing call sites and translations keep working.
  const totalClaims = stats?.totalClaims ?? claimsInQueue ?? 0;
  const pendingReview = stats?.pendingReview ?? pendingDocuments ?? 0;
  const approvedThisMonth = stats?.approvedThisMonth ?? 0;
  const deniedThisMonth = stats?.deniedThisMonth ?? 0;
  const paidThisMonth = stats?.paidThisMonth ?? 0;
  const avgProcessingDays = stats?.avgProcessingDays ?? newCustomers ?? 0;
  // NOTE: `activePolicies` is accepted for API-shape parity but is not yet mapped to
  // a stat card; it is retained explicitly so the prop stays used.
  void activePolicies;
  const t = useTranslations();

  const statCards: Array<{
    label: string;
    value: number;
    previous?: number | undefined;
    color: string;
    icon?: React.ReactNode;
    accentColor?: string;
    isText?: boolean;
  }> = [
    {
      label: t("admin.dashboard.totalClaims"),
      value: totalClaims,
      previous: previousStats?.totalClaims ?? claimsInQueue ?? undefined,
      color: "bg-white border-navy-200",
    },
    {
      label: t("admin.dashboard.pendingReview"),
      value: pendingReview,
      previous: previousStats?.pendingReview ?? pendingDocuments ?? undefined,
      color: "bg-amber-50 border-amber-200",
      icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
      accentColor: "text-amber-600",
    },
    {
      label: t("admin.dashboard.approvedThisMonth"),
      value: approvedThisMonth,
      previous: previousStats?.approvedThisMonth ?? undefined,
      color: "bg-green-50 border-green-200",
      accentColor: "text-green-600",
    },
    {
      label: t("admin.dashboard.deniedThisMonth"),
      value: deniedThisMonth,
      previous: previousStats?.deniedThisMonth ?? undefined,
      color: "bg-red-50 border-red-200",
      accentColor: "text-red-600",
    },
    {
      label: t("admin.dashboard.paidThisMonth"),
      value: paidThisMonth,
      previous: previousStats?.paidThisMonth ?? undefined,
      color: "bg-navy-50 border-navy-200",
      accentColor: "text-navy-600",
    },
    {
      label: t("admin.dashboard.avgProcessingDays"),
      value: avgProcessingDays,
      previous: undefined,
      color: "bg-white border-navy-200",
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((card) => (
        <div
          key={card.label}
          className={`rounded-xl border p-4 shadow-sm ${card.color}`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">{card.label}</p>
            {card.icon && <span className={card.accentColor}>{card.icon}</span>}
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <span className={`text-2xl font-bold ${card.accentColor ?? "text-navy-900"}`}>
              {card.isText ? `${avgProcessingDays}日` : card.value}
            </span>
            {card.previous !== undefined && (
              <DeltaBadge
                value={card.value}
                previous={card.previous}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
