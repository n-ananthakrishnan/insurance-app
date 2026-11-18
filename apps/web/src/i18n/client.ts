"use client";

import { useTranslations as useTranslationsNextIntl, useLocale as useLocaleNextIntl } from "next-intl";
import { getTranslations as getTranslationsServer } from "next-intl/server";
import { useLocale as useLocaleCustom } from "./use-locale";

/**
 * Client-side hook for page/component translations.
 * Use inside "use client" components.
 */
export function useTranslationsClient(scope?: string) {
  return useTranslationsNextIntl(scope);
}

/**
 * Use the custom locale hook (localStorage + cookie based).
 */
export function useLocale() {
  return useLocaleCustom();
}

export { useLocaleNextIntl };

/**
 * Server-side getTranslations for use in server components / server forms.
 */
export { getTranslationsServer as getTranslations };
export { getTranslationsServer as getTranslationsRequest };

/**
 * getPageTranslations — a small wrapper used in page files to avoid typing confusion.
 * This is server-side and must be called in server components.
 */
export function getPageTranslations(scope: string) {
  return getTranslationsServer(scope);
}

/**
 * getTranslations for client components — user must call inside client component.
 * Prefer calling useTranslationsClient directly.
 */
export function getClientTranslations(scope: string) {
  return getTranslationsServer(scope);
}
