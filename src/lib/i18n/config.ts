export type Locale = "en" | "gu";

export const i18nConfig = {
  defaultLocale: "en" as Locale,
  locales: ["en", "gu"] as const,
};

export function isValidLocale(lang: string): lang is Locale {
  return i18nConfig.locales.includes(lang as Locale);
}
