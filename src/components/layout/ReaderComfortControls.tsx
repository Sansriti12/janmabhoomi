"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useReaderComfort, ReaderTheme } from "@/lib/context/ReaderComfortContext";
import { Locale } from "@/lib/i18n/config";

interface ReaderComfortControlsProps {
  lang: Locale;
}

/**
 * Compact Theme Switcher (Top Utility Bar)
 * Light / Dark reading theme toggle.
 */
export function ReaderComfortControls({ lang }: ReaderComfortControlsProps) {
  const { theme, setTheme } = useReaderComfort();
  const isGu = lang === "gu";

  const themes: Array<{
    key: ReaderTheme;
    labelEn: string;
    labelGu: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "light",
      labelEn: "Light Theme",
      labelGu: "લાઇટ થીમ",
      icon: <Sun className="h-3 w-3" />,
    },
    {
      key: "dark",
      labelEn: "Dark Theme",
      labelGu: "ડાર્ક થીમ",
      icon: <Moon className="h-3 w-3" />,
    },
  ];

  const activeTheme: ReaderTheme = theme === "dark" ? "dark" : "light";

  return (
    <div
      className="flex items-center text-[11px]"
      role="radiogroup"
      aria-label={isGu ? "વાંચન થીમ પસંદ કરો" : "Select reading theme"}
    >
      <div className="inline-flex items-center rounded bg-white/15 border border-white/25 p-0.5 gap-0.5">
        {themes.map((t) => {
          const active = activeTheme === t.key;
          return (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(t.key)}
              title={isGu ? t.labelGu : t.labelEn}
              aria-label={isGu ? t.labelGu : t.labelEn}
              className={`inline-flex items-center justify-center rounded-xs px-1.5 py-0.5 transition-all cursor-pointer ${
                active
                  ? t.key === "dark"
                    ? "bg-slate-900 text-sky-300 shadow-2xs"
                    : "bg-white text-[#016BB7] shadow-2xs"
                  : "text-white/85 hover:bg-white/20 hover:text-white"
              }`}
            >
              {t.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}
