export type Locale = "en" | "gu";

export const i18nConfig = {
  defaultLocale: "gu" as Locale,
  locales: ["gu", "en"] as const,
};

export function isValidLocale(lang: string): lang is Locale {
  return i18nConfig.locales.includes(lang as Locale);
}
