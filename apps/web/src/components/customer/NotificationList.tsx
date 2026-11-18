"use client";

import { useTranslations } from "next-intl";
import type { Notification } from "@sample-insurance/shared";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow } from "date-fns";
import { ja } from "@/lib/date-fns-locales";
import { useState } from "react";

interface NotificationListProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

const TYPE_CLASSES: Record<string, string> = {
  claim_status: "bg-blue-100 text-blue-700",
  document_required: "bg-orange-100 text-orange-700",
  approval: "bg-green-100 text-green-700",
  payment: "bg-navy-100 text-navy-700",
  reminder: "bg-purple-100 text-purple-700",
  general: "bg-gray-100 text-gray-700",
};

export function NotificationList({
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationListProps) {
  const t = useTranslations();
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set(notifications.filter((n) => n.read).map((n) => n.id)));
  const locale = typeof document !== "undefined" && navigator.language?.startsWith("ja") ? ja : undefined;

  const handleToggleRead = (id: string, currentRead: boolean) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (currentRead) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    onMarkRead?.(id);
  };

  const handleMarkAllRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)));
    onMarkAllRead?.();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy-900">
          {t("notifications.title")}
        </h2>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-navy-200 bg-navy-50">
          <p className="text-muted-500">{t("notifications.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const isRead = notification.read || readIds.has(notification.id);
            const handleClick = () => handleToggleRead(notification.id, isRead);

            return (
              <div
                key={notification.id}
                className={`flex items-start gap-3 rounded-xl border p-4 transition cursor-pointer ${
                  isRead
                    ? "border-navy-200 bg-white"
                    : "border-navy-200 bg-blue-50/50 shadow-sm"
                }`}
                onClick={handleClick}
              >
                <Avatar className="mt-0.5 h-9 w-9">
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l1.414 1.414L11 12.414l2.293 2.293a1 1 0 001.414-1.414L13 11.586l1.293-1.293a1 1 0 00-1.414-1.414L11 9.293 9.707 10.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-navy-900">
                      {notification.titleJa ?? notification.titleEn}
                    </p>
                    <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_CLASSES[notification.type] ?? "bg-gray-100 text-gray-700"}`} onClick={(e) => e.stopPropagation()}>
                      {t(`notifications.type.${notification.type}`) ?? notification.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-600" onClick={(e) => e.stopPropagation()}>
                    {notification.bodyJa ?? notification.bodyEn}
                  </p>
                  <p className="mt-1 text-xs text-muted-400">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale })}
                  </p>
                </div>
                {!isRead && (
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500" onClick={(e) => e.stopPropagation()}>
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l1.414 1.414L11 12.414l2.293 2.293a1 1 0 001.414-1.414L13 11.586l1.293-1.293a1 1 0 00-1.414-1.414L11 9.293 9.707 10.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
