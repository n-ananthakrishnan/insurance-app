"use client";

import { useTranslations } from "next-intl";
import type { AuditLogEntry } from "@sample-insurance/shared";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ja } from "@/lib/date-fns-locales";
import Link from "next/link";

export interface RecentActivityItem {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string;
  actorNameJa: string;
  actorNameEn: string;
  createdAt: string;
}

type DashboardTranslator = {
  (key: string): string;
  (key: string, params?: Record<string, string | number>): string;
};

interface RecentAuditActivityProps {
  // Accept both the legacy `entries` shape and the dashboard's `items` shape.
  entries?: AuditLogEntry[] | null;
  items?: RecentActivityItem[] | null;
  max?: number;
  t?: DashboardTranslator;
}

const ACTION_LABELS: Record<string, string> = {
  CLAIM_STATUS_CHANGED: "請求状況を更新",
  CLAIM_COMMENT_ADDED: "コメントを追加",
  CUSTOMER_CREATED: "顧客を作成",
  CUSTOMER_UPDATED: "顧客を更新",
  CUSTOMER_DELETED: "顧客を削除",
  POLICY_CREATED: "契約を発行",
  POLICY_UPDATED: "契約を更新",
  POLICY_CANCELLED: "契約を解約",
  PRODUCT_CREATED: "商品を追加",
  PRODUCT_UPDATED: "商品を更新",
  PRODUCT_DELETED: "商品を削除",
  NEWS_CREATED: "お知らせを公開",
  NEWS_UPDATED: "お知らせを更新",
  NEWS_DELETED: "お知らせを削除",
  FAQ_CREATED: "FAQを追加",
  FAQ_UPDATED: "FAQを更新",
  FAQ_DELETED: "FAQを削除",
  SETTINGS_CHANGED: "設定を変更",
  DOCUMENT_UPLOADED: "書類をアップロード",
  DOCUMENT_DELETED: "書類を削除",
};

export function RecentAuditActivity({
  entries,
  items,
  max = 6,
  t,
}: RecentAuditActivityProps) {
  const translator: DashboardTranslator = (t ?? useTranslations());
  const locale = typeof document !== "undefined" && navigator.language?.startsWith("ja")
    ? ja
    : undefined;

  const source: Array<AuditLogEntry | RecentActivityItem> =
    items && items.length > 0 ? items : entries ?? [];

  const recent = source.slice(0, max);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-900">
          {translator("admin.dashboard.recentActivity")}
        </h3>
        <Link
          href="/admin/audit-log"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          {translator("admin.dashboard.viewAllActivity")} →
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-muted-500 py-2">
          {translator("admin.dashboard.noRecentActivity")}
        </p>
      ) : (
        <div className="space-y-2">
          {recent.map((entry) => {
            const action = ("action" in entry ? entry.action : "") as string;
            const actionLabel =
              translator(`admin.auditLog.action.${action}`) ??
              ACTION_LABELS[action] ??
              action;

            const adminId =
              ("adminId" in entry ? entry.adminId : "") as string;
            const targetType =
              ("targetType" in entry ? entry.targetType : "") as string | undefined;
            const targetId =
              ("targetId" in entry ? entry.targetId : "") as string | undefined;
            const createdAt =
              ("createdAt" in entry ? entry.createdAt : "") as string;
            const resourceType =
              ("resourceType" in entry ? entry.resourceType : "") as string;
            const resourceId =
              ("resourceId" in entry ? entry.resourceId : "") as string;
            const actorNameJa =
              ("actorNameJa" in entry ? entry.actorNameJa : "") as string;
            const actorNameEn =
              ("actorNameEn" in entry ? entry.actorNameEn : "") as string;

            // Map the dashboard's activity shape into the audit-log shape the UI
            // already reads, so the rendering stays consistent.
            const displayAdminId = adminId || actorNameJa || actorNameEn || "AD";
            const displayTargetType = targetType || resourceType || undefined;
            const displayTargetId = targetId || resourceId || undefined;

            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm"
              >
                <Avatar className="mt-0.5 h-7 w-7">
                  <AvatarFallback className="text-[10px] font-semibold bg-navy-100 text-navy-700">
                    {String(displayAdminId).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-navy-900">{actionLabel}</p>
                  <p className="text-[11px] text-muted-500 truncate">
                    {displayTargetType && displayTargetId
                      ? translator(
                          `admin.auditLog.target.${displayTargetType}`,
                          { id: displayTargetId }
                        )
                      : translator("admin.auditLog.general")}
                  </p>
                </div>
                <span className="text-[11px] text-muted-400 shrink-0">
                  {formatDistanceToNow(new Date(createdAt), {
                    addSuffix: true,
                    locale,
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
