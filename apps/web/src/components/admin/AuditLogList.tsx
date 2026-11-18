"use client";

import { useTranslations } from "next-intl";
import type { AuditLogEntry } from "@sample-insurance/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDistanceToNow } from "date-fns";
import { ja } from "@/lib/date-fns-locales";

interface AuditLogListProps {
  entries: AuditLogEntry[];
}

const ACTION_LABELS: Record<string, string> = {
  CLAIM_STATUS_CHANGED: "請求状況を更新しました",
  CLAIM_COMMENT_ADDED: "コメントを追加しました",
  CUSTOMER_CREATED: "顧客アカウントを作成しました",
  CUSTOMER_UPDATED: "顧客情報を更新しました",
  CUSTOMER_DELETED: "顧客アカウントを削除しました",
  POLICY_CREATED: "保険契約を発行しました",
  POLICY_UPDATED: "保険契約を更新しました",
  POLICY_CANCELLED: "保険契約を解約しました",
  PRODUCT_CREATED: "商品を追加しました",
  PRODUCT_UPDATED: "商品を更新しました",
  PRODUCT_DELETED: "商品を削除しました",
  NEWS_CREATED: "お知らせを公開しました",
  NEWS_UPDATED: "お知らせを更新しました",
  NEWS_DELETED: "お知らせを削除しました",
  FAQ_CREATED: "FAQを追加しました",
  FAQ_UPDATED: "FAQを更新しました",
  FAQ_DELETED: "FAQを削除しました",
  SETTINGS_CHANGED: "設定を変更しました",
  DOCUMENT_UPLOADED: "書類をアップロードしました",
  DOCUMENT_DELETED: "書類を削除しました",
};

export function AuditLogList({ entries }: AuditLogListProps) {
  const t = useTranslations();
  const locale = typeof document !== "undefined" && navigator.language?.startsWith("ja") ? ja : undefined;

  return (
    <div className="space-y-3">
      {entries.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-navy-200 bg-navy-50">
          <p className="text-muted-500">{t("admin.auditLogEmpty")}</p>
        </div>
      ) : (
        entries.map((entry) => {
          const actionLabel =
            t(`admin.auditLog.action.${entry.action}`) ??
            ACTION_LABELS[entry.action] ??
            entry.action;

          return (
            <div
              key={entry.id}
              className="flex items-start gap-4 rounded-xl border border-navy-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={`/api/avatars/${entry.adminId}`} alt="" />
                <AvatarFallback>{entry.adminId.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-navy-900">
                  {actionLabel}
                </p>
                <p className="mt-1 text-sm text-muted-600 truncate">
                  {entry.targetType && entry.targetId
                    ? t(`admin.auditLog.target.${entry.targetType}`, { id: entry.targetId })
                    : t("admin.auditLog.general")}
                </p>
                {entry.detailsJa && (
                  <p className="mt-1 text-sm text-muted-500 truncate">{entry.detailsJa}</p>
                )}
                <p className="mt-1 text-xs text-muted-400">
                  {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true, locale })}
                </p>
              </div>
              <Badge variant="secondary" className="flex-shrink-0">
                {t(`admin.auditLog.type.${entry.targetType}`) ?? entry.targetType}
              </Badge>
            </div>
          );
        })
      )}
    </div>
  );
}
