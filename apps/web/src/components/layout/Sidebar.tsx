"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  House,
  FileText,
  ClipboardList,
  Bell,
  Settings,
  User,
} from "@/components/ui/icons";

const customerNavItems = [
  { href: "/customer/my-page", label: "dashboard", icon: House },
  { href: "/customer/my-page/policies", label: "policies", icon: ClipboardList },
  { href: "/customer/my-page/claims", label: "claims", icon: FileText },
  { href: "/customer/my-page/notifications", label: "notifications", icon: Bell },
  { href: "/customer/my-page/settings", label: "settings", icon: Settings },
];

const adminNavItems = [
  { href: "/admin", label: "dashboard", icon: House },
  { href: "/admin/customers", label: "customers", icon: User },
  { href: "/admin/claims", label: "claims", icon: ClipboardList },
  { href: "/admin/audit-log", label: "auditLog", icon: FileText },
  { href: "/admin/settings", label: "settings", icon: Settings },
];

export function Sidebar({
  mode = "customer",
}: {
  mode?: "customer" | "admin";
}) {
  const pathname = usePathname();
  const t = useTranslations("layout.sidebar");
  const items =
    mode === "admin" ? adminNavItems : customerNavItems;

  return (
    <aside className="w-64 min-h-screen border-r border-navy-200 bg-navy-50 dark:bg-gray-900 hidden lg:block">
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const href = item.href;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-200"
                  : "text-navy-700 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {t(item.label)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
