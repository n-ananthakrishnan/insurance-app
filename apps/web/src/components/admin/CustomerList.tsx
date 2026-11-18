"use client";

import { useTranslations } from "next-intl";
import type { CustomerSummary } from "@sample-insurance/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";import { ja } from "@/lib/date-fns-locales";

interface CustomerListProps {
  customers: CustomerSummary[];
}
export function CustomerList({ customers }: CustomerListProps) {
  const t = useTranslations();
  const isJa = typeof document !== "undefined" && navigator.language?.startsWith("ja");
  const locale = isJa ? ja : undefined; // used for future date formatting; kept for parity
  void locale;

  return (
    <div className="space-y-3">
      {customers.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-navy-200 bg-navy-50">
          <p className="text-muted-500">{t("admin.customersEmpty")}</p>
        </div>
      ) : (
        customers.map((customer) => (
          <div
            key={customer.id}
            className="flex items-center gap-4 rounded-xl border border-navy-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={`/api/avatars/${customer.id}`} alt="" />
              <AvatarFallback>{((customer.nameJa ?? customer.nameEn) ?? "-").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy-900">
                {customer.nameJa ?? customer.nameEn ?? "-"}
              </p>
              <p className="mt-0.5 text-sm text-muted-600">{customer.email}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-500">
                {customer.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l1.414 1.414L11 12.414l2.293 2.293a1 1 0 001.414-1.414L13 11.586l1.293-1.293a1 1 0 00-1.414-1.414L11 9.293 9.707 10.586z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {t("admin.emailVerified")}
                  </span>
                ) : (
                  <span className="text-muted-400">{t("admin.emailNotVerified")}</span>
                )}
                <span>·</span>
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {/* 가입일 등 추가 필드 있을 경우 표시 */}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={customer.emailVerified ? "default" : "secondary"}>
                {t(`roles.${customer.role}`)}
              </Badge>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/customers/${customer.id}`}>
                  {t("admin.viewDetails")}
                </Link>
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
