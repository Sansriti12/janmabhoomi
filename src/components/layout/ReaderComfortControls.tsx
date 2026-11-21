"use client";

import React from "react";
import { Sun, Moon, BookOpen } from "lucide-react";
import { useReaderComfort, ReaderTheme } from "@/lib/context/ReaderComfortContext";
import { Locale } from "@/lib/i18n/config";

interface ReaderComfortControlsProps {
  lang: Locale;
}

/**
 * Compact Reader Comfort Accessibility Toolbar (Top Utility Bar)
 * - Font Size Resizer (A- / A / A+)
 * - Reading Theme Switcher (Light / Warm Sepia / Dark)
 */
export function ReaderComfortControls({ lang }: ReaderComfortControlsProps) {
  const { theme, setTheme, fontStep, decreaseFont, resetFont, increaseFont } =
    useReaderComfort();
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
      key: "sepia",
      labelEn: "Warm Sepia Reading Mode",
      labelGu: "સેપિયા વાંચન મોડ",
      icon: <BookOpen className="h-3 w-3" />,
    },
    {
      key: "dark",
      labelEn: "Dark Theme",
      labelGu: "ડાર્ક થીમ",
      icon: <Moon className="h-3 w-3" />,
    },
  ];

  return (
    <div
      className="flex items-center gap-2 text-[11px]"
      role="toolbar"
      aria-label={isGu ? "વાચક સુવિધા નિયંત્રણો" : "Reader comfort controls"}
    >
      {/* Font Size Resizer (A- / A / A+) */}
      <div
        className="inline-flex items-center rounded bg-white/15 border border-white/25 overflow-hidden"
        title={isGu ? "અક્ષરનું કદ બદલો" : "Adjust text size"}
      >
        <button
          type="button"
          onClick={decreaseFont}
          disabled={fontStep === 0}
          aria-label={isGu ? "અક્ષર નાના કરો" : "Decrease font size"}
          className="px-1.5 py-0.5 font-bold text-white/95 hover:bg-white/20 disabled:opacity-40 transition-colors cursor-pointer"
        >
          A-
        </button>
        <button
          type="button"
          onClick={resetFont}
          aria-label={isGu ? "સામાન્ય અક્ષર કદ" : "Reset font size"}
          className={`px-1.5 py-0.5 font-bold border-x border-white/20 transition-colors cursor-pointer ${
            fontStep === 1 ? "bg-white text-[#016BB7]" : "text-white/95 hover:bg-white/20"
          }`}
        >
          A
        </button>
        <button
          type="button"
          onClick={increaseFont}
          disabled={fontStep === 3}
          aria-label={isGu ? "અક્ષર મોટા કરો" : "Increase font size"}
          className="px-1.5 py-0.5 font-bold text-white/95 hover:bg-white/20 disabled:opacity-40 transition-colors cursor-pointer"
        >
          A+
        </button>
      </div>

      {/* Reading Theme Switcher (Light / Warm Sepia / Dark) */}
      <div
        className="inline-flex items-center rounded bg-white/15 border border-white/25 p-0.5 gap-0.5"
        role="radiogroup"
        aria-label={isGu ? "વાંચન થીમ પસંદ કરો" : "Select reading theme"}
      >
        {themes.map((t) => {
          const active = theme === t.key;
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
                  ? t.key === "sepia"
                    ? "bg-[#F4ECD8] text-[#4A3520] shadow-2xs"
                    : t.key === "dark"
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
