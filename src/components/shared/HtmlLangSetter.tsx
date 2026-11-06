"use client";

import { useEffect } from "react";
import { Locale } from "@/lib/i18n/config";

interface HtmlLangSetterProps {
  lang: Locale;
}

/**
 * HtmlLangSetter
 * Dynamically synchronizes documentElement `lang` and `dir` attributes
 * upon client-side navigation between /en and /gu routes.
 */
export function HtmlLangSetter({ lang }: HtmlLangSetterProps) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = "ltr";
    }
  }, [lang]);

  return null;
}
