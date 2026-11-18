"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AuthErrorBanner } from "@/components/auth/AuthErrorBanner";
import { AuthProvider } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
          <AuthErrorBanner />
          <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="hidden lg:flex lg:flex-col w-64 bg-navy-900 text-white fixed left-0 top-0 h-screen overflow-y-auto z-30">
              <div className="px-6 py-5 border-b border-navy-700">
                <Link href="/admin" className="text-lg font-bold">
                  管理画面
                </Link>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                <SidebarNavItem href="/admin" label="ダッシュボード" />
                <SidebarNavItem href="/admin/claims" label="請求" activeMatch="/admin/claims" />
                <SidebarNavItem href="/admin/customers" label="顧客" />
                <SidebarNavItem href="/admin/products" label="商品" />
                <SidebarNavItem href="/admin/news" label="お知らせ" />
                <SidebarNavItem href="/admin/faq" label="FAQ" />
                <SidebarNavItem href="/admin/categories" label="カテゴリ" />
                <div className="pt-4 mt-4 border-t border-navy-700">
                  <SidebarNavItem href="/admin/settings" label="設定" />
                </div>
              </nav>
              <div className="px-4 py-4 border-t border-navy-700">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-sm text-navy-300 hover:text-white transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  サイトに戻る
                </Link>
              </div>
            </aside>

            {/* Mobile bottom nav */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
              <nav className="flex justify-around py-2">
                <MobileNavItem href="/admin" label="ダッシュボード" activeMatch="/admin$" />
                <MobileNavItem href="/admin/claims" label="請求" activeMatch="/admin/claims" />
                <MobileNavItem href="/admin/customers" label="顧客" activeMatch="/admin/customers" />
                <MobileNavItem href="/admin/products" label="商品" activeMatch="/admin/products" />
                <MobileNavItem href="/admin/news" label="お知らせ" activeMatch="/admin/news" />
              </nav>
            </div>

            {/* Main */}
            <div className="flex-1 lg:ml-64 pb-20">
              <Header />
              <main className="p-6">{children}</main>
            </div>
          </div>
    </AuthProvider>
  );
}

function SidebarNavItem({
  href,
  label,
  activeMatch,
}: {
  href: string;
  label: string;
  activeMatch?: string;
}) {
  const pathname = usePathname();
  const active = activeMatch ? pathname.startsWith(activeMatch) : pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-navy-700 text-white"
          : "text-navy-300 hover:bg-navy-800 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileNavItem({
  href,
  label,
  activeMatch,
}: {
  href: string;
  label: string;
  activeMatch: string;
}) {
  const pathname = usePathname();
  const active = pathname.startsWith(activeMatch);
  return (
    <Link
      href={href}
      className={`flex flex-col items-center px-2 py-1 text-xs transition ${
        active ? "text-navy-900" : "text-gray-400"
      }`}
    >
      {label}
    </Link>
  );
}
