"use client";

"use client";

import { useLocale as useIntlLocale } from "next-intl";

type Locale = "ja" | "en";

export function useLocale() {
  // Read the locale chosen by the root NextIntlClientProvider. Avoid reading
  // localStorage during the first client render, which can differ from SSR.
  const locale = useIntlLocale() as Locale;

  return {
    locale,
    setLocale: (newLocale: Locale) => {
      try {
        localStorage.setItem("locale", newLocale);
      } catch {
        // ignore
      }
      try {
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
      } catch {
        // ignore
      }
      window.location.reload();
    },
  };
}
