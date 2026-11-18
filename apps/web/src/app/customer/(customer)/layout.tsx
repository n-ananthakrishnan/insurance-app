"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Header } from "@/components/layout/Header";
import { AuthProvider } from "@/context/AuthContext";
import { Home, ShieldCheck, FileText, Bell, Settings, CreditCard } from "lucide-react";

const navItems = [
  { href: "/customer/my-page", key: "dashboardLabel", Icon: Home },
  { href: "/customer/policies", key: "policies", Icon: ShieldCheck },
  { href: "/customer/claims", key: "claims", Icon: FileText },
  { href: "/customer/billing", key: "billing", Icon: CreditCard },
  { href: "/customer/my-page/notifications", key: "notifications", Icon: Bell },
  { href: "/customer/my-page/settings", key: "settings", Icon: Settings },
];

export default function CustomerLayout({ children }: { children: ReactNode }) {
  const t = useTranslations("customer");
  const pathname = usePathname();
  return <AuthProvider>
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <Link href="/customer/my-page" className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white"><ShieldCheck className="h-5 w-5" /></span>
          <span><span className="block text-sm font-bold text-navy-900">SAMPLE INSURANCE</span><span className="mt-0.5 block text-xs text-slate-500">{t("title")}</span></span>
        </Link>
        <nav aria-label={t("title")} className="flex-1 space-y-1 px-3 py-5">
          {navItems.map(({ href, key, Icon }) => {
            const active = pathname === href || (href !== "/customer/my-page" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50 hover:text-navy-900"}`}>
              <Icon className="h-5 w-5" /><span>{t(key)}</span>
            </Link>;
          })}
        </nav>
        <div className="border-t border-slate-100 p-4"><Link href="/contact" className="block rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100">{t("supportLink")}</Link></div>
      </aside>

      <div className="lg:pl-64">
        <Header />
        <main className="min-h-[calc(100vh-72px)] pb-24 lg:pb-8">{children}</main>
      </div>

      <nav aria-label={t("title")} className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur lg:hidden">
        {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[5]].map(({ href, key, Icon }) => {
          const active = pathname === href || (href !== "/customer/my-page" && pathname.startsWith(`${href}/`));
          return <Link key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium ${active ? "text-blue-800" : "text-slate-500"}`}><Icon className="h-5 w-5" /><span>{t(key)}</span></Link>;
        })}
      </nav>
    </div>
  </AuthProvider>;
}
