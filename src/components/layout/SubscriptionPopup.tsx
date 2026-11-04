"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Newspaper, CheckCircle2 } from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";

interface SubscriptionPopupProps {
  lang: Locale;
  dict: Dictionary;
}

const DISMISS_STORAGE_KEY = "janmabhoomi_epaper_popup_dismissed_until";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const INITIAL_DELAY_MS = 35000; // 35 seconds (within required 30–45s window)

/**
 * Delayed Subscription Popup
 * - Displays after ~35 seconds if not dismissed within the past 7 days
 * - Remembers dismissal for 7 days in localStorage
 * - Compact mobile-friendly bottom-sheet / modal design
 * - Also listens for `janmabhoomi:open-sub-popup` custom event so reviewers can preview it immediately
 */
export function SubscriptionPopup({ lang, dict }: SubscriptionPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Allow instant manual trigger from the Footer "Preview Subscription Popup" button for testing
    const handleManualOpen = () => setVisible(true);
    window.addEventListener("janmabhoomi:open-sub-popup", handleManualOpen);

    // Check if user dismissed within last 7 days
    try {
      const storedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (storedUntil && Number(storedUntil) > Date.now()) {
        return () => {
          window.removeEventListener(
            "janmabhoomi:open-sub-popup",
            handleManualOpen
          );
        };
      }
    } catch {
      // Ignore storage access errors in private browsing
    }

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, INITIAL_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("janmabhoomi:open-sub-popup", handleManualOpen);
    };
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      const expiresAt = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem(DISMISS_STORAGE_KEY, String(expiresAt));
    } catch {
      // Ignore storage errors
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sub-popup-title"
      className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-3 sm:p-4"
    >
      <div className="relative w-full max-w-md rounded-lg border-2 border-[#174F73] bg-white p-5 sm:p-6 shadow-xl">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss subscription promotion"
          className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-[#292725]/60 hover:bg-[#FAF8F3] hover:text-[#292725] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-xs bg-[#174F73]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#174F73]">
          <Newspaper className="h-3.5 w-3.5 text-[#C59B4B]" />
          <span>{dict.popup.badge}</span>
        </div>

        <h2
          id="sub-popup-title"
          className="mt-2.5 text-lg sm:text-xl font-extrabold text-[#292725] leading-snug pr-6"
        >
          {dict.popup.title}
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-[#292725]/80 leading-relaxed">
          {dict.popup.description}
        </p>

        <ul className="mt-3 space-y-1.5 text-xs text-[#292725]/85">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#174F73] shrink-0" />
            <span>
              {lang === "gu"
                ? "દરરોજ સવારે સંપૂર્ણ પ્રિન્ટ અખબાર ડિજિટલ સ્વરૂપે"
                : "Complete daily newspaper & city supplements"}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#174F73] shrink-0" />
            <span>
              {lang === "gu"
                ? "સંપૂર્ણ અગ્રલેખ અને વિશેષ અહેવાલોનું એક્સેસ"
                : "Unrestricted access to full articles & અગ્રલેખ"}
            </span>
          </li>
        </ul>

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/${lang}/epaper`}
            onClick={handleDismiss}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#174F73] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#103A55] transition-colors"
          >
            <Newspaper className="h-4 w-4 text-[#C59B4B]" />
            <span>{dict.popup.cta}</span>
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full rounded-md border border-[#292725]/20 bg-[#FAF8F3] px-4 py-2 text-xs font-semibold text-[#292725]/80 hover:text-[#292725] transition-colors cursor-pointer"
          >
            {dict.popup.dismiss}
          </button>
        </div>

        <p className="mt-2.5 text-[10px] text-center text-[#292725]/50">
          {dict.popup.demoNote}
        </p>
      </div>
    </div>
  );
}
