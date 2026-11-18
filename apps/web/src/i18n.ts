import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

export const locales = ["en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ja";

function fallbackMessage({ namespace, key }: { namespace?: string; key: string }) {
  const parts = [...(namespace?.split(".") ?? []), ...key.split(".")];
  const last = parts.at(-1) ?? key;
  const labelPart = /^(title|subtitle|label|description|placeholder|hint|count)$/.test(last)
    ? (parts.at(-2) ?? last)
    : last;
  return labelPart
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieLocale = cookies().get("locale")?.value;
  // Locale-prefixed routes are disabled, so the saved preference cookie is
  // the source of truth for both the server HTML and the client provider.
  const locale = cookieLocale ?? (await requestLocale) ?? defaultLocale;
  if (!locales.includes(locale as Locale)) notFound();
  return {
    locale,
    messages: (await import(`./i18n/${locale}.json`)).default,
    getMessageFallback: fallbackMessage,
    onError(error) {
      if (error.code !== "MISSING_MESSAGE") console.error(error);
    },
  };
});
