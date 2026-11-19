"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { Menu, X, LogIn, User, Shield } from "@/components/ui/icons";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top bar on desktop */}
      <div className="hidden md:flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-navy-900">
            SAMPLE INSURANCE JAPAN
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-muted-600">
            <NavLink href="/" active={pathname === "/"}>
              {t("home")}
            </NavLink>
            <NavLink href="/products" active={pathname.startsWith("/products")}>
              {t("products")}
            </NavLink>
            <NavLink href="/news" active={pathname.startsWith("/news")}>
              {t("news")}
            </NavLink>
            <NavLink href="/faq" active={pathname === "/faq"}>
              {t("faq")}
            </NavLink>
            <NavLink href="/contact" active={pathname === "/contact"}>
              {t("contact")}
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <NavCTA />
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-navy-200">
        <Link href="/" className="text-lg font-bold text-navy-900">
          SAMPLE INSURANCE JAPAN
        </Link>
        <button
          type="button"
          className="p-2 -ml-2 rounded-md text-muted-600 hover:bg-navy-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-b border-navy-200 bg-white py-4">
          <nav className="flex flex-col gap-1 px-4 text-sm font-medium">
            <MobileNavLink href="/" active={pathname === "/"} onClick={() => setMenuOpen(false)}>
              {t("home")}
            </MobileNavLink>
            <MobileNavLink href="/products" active={pathname.startsWith("/products")} onClick={() => setMenuOpen(false)}>
              {t("products")}
            </MobileNavLink>
            <MobileNavLink href="/claims/new" active={pathname === "/claims/new"} onClick={() => setMenuOpen(false)}>
              請求を開始
            </MobileNavLink>
            <MobileNavLink href="/news" active={pathname.startsWith("/news")} onClick={() => setMenuOpen(false)}>
              {t("news")}
            </MobileNavLink>
            <MobileNavLink href="/faq" active={pathname === "/faq"} onClick={() => setMenuOpen(false)}>
              {t("faq")}
            </MobileNavLink>
            <MobileNavLink href="/contact" active={pathname === "/contact"} onClick={() => setMenuOpen(false)}>
              {t("contact")}
            </MobileNavLink>

            <div className="my-3 border-t border-navy-200" />

            <div className="flex flex-col gap-1">
              <LanguageToggle />
              <MobileNavCTA onLogout={() => setMenuOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`transition ${
        active
          ? "text-navy-900"
          : "text-muted-600 hover:text-navy-900"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  active,
  children,
  onClick,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      className={`py-2 transition ${
        active ? "text-navy-900 font-semibold" : "text-muted-600"
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function NavCTA() {
  const { user, loading, logout } = useAuth();
  const t = useTranslations("nav");

  if (loading) return null;

  if (user) {
    const isCustomer = user.role === "CUSTOMER";
    return (
      <div className="flex items-center gap-2">
        <Link
          href={isCustomer ? "/customer" : "/admin"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-navy-200 text-sm font-medium text-navy-700 hover:bg-navy-50 transition"
        >
          {isCustomer ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          {isCustomer ? t("customerArea") : t("admin")}
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          {t("logout")}
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-navy-200 text-sm font-medium text-navy-700 hover:bg-navy-50 transition"
    >
      <LogIn className="w-4 h-4" />
      {t("login")}
    </Link>
  );
}

function MobileNavCTA({ onLogout }: { onLogout: () => void }) {
  const { user, loading, logout } = useAuth();
  const t = useTranslations("nav");

  if (loading) return null;

  if (user) {
    const isCustomer = user.role === "CUSTOMER";
    const label = isCustomer ? t("customerArea") : t("admin");
    const href = isCustomer ? "/customer" : "/admin";
    return (
      <div className="flex flex-col gap-2 mt-2">
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-medium hover:bg-navy-800 transition"
        >
          {label}
        </Link>
        <button
          type="button"
          onClick={() => {
            onLogout();
            void logout();
          }}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {t("logout")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <Link href="/login" className="inline-flex h-8 items-center justify-center rounded-md bg-navy-900 px-3 text-xs font-medium text-white hover:bg-navy-800 transition">
        {t("login")}
      </Link>
      <Link href="/register" className="inline-flex h-8 items-center justify-center rounded-md bg-navy-100 px-3 text-xs font-medium text-navy-700 hover:bg-navy-200 transition">
        {t("register")}
      </Link>
    </div>
  );
}
