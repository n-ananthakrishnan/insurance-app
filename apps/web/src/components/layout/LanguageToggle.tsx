"use client";

import { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "@/components/ui/icons";

interface Props {
  /** When true, render a compact inline button suitable for header/footer */
  compact?: boolean;
}

export function LanguageToggle({ compact = false }: Props) {
  const t = useTranslations("languageToggle");
  const locale = useLocale() as "ja" | "en";

  const switchLocale = useCallback((next: "ja" | "en") => {
    try {
      localStorage.setItem("locale", next);
    } catch {
      // The locale cookie remains sufficient if storage is unavailable.
    }
    document.cookie = `locale=${next}; path=/; max-age=31536000; SameSite=Lax${
      window.location.protocol === "https:" ? "; Secure" : ""
    }`;
    // Server rendered translations are refreshed from the same cookie.
    window.location.reload();
  }, []);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => switchLocale(locale === "ja" ? "en" : "ja")}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-navy-800 text-white hover:bg-navy-700 transition"
        aria-label={t("label")}
      >
        <Globe className="w-3.5 h-3.5" />
        {locale === "ja" ? "EN" : "JA"}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={t("label")}>
      <span className="text-sm text-muted-600">{t("label")}:</span>
      <button
        type="button"
        onClick={() => switchLocale("ja")}
        aria-pressed={locale === "ja"}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          locale === "ja"
            ? "bg-navy-900 text-white"
            : "bg-navy-100 text-navy-700 hover:bg-navy-200"
        }`}
      >
        日本語
      </button>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-3 py-1 rounded-full text-sm font-medium transition ${
          locale === "en"
            ? "bg-navy-900 text-white"
            : "bg-navy-100 text-navy-700 hover:bg-navy-200"
        }`}
      >
        English
      </button>
    </div>
  );
}
