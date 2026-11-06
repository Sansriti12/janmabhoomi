"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
 * Delayed Subscription Popup (Accessible Edition)
 * - Displays after ~35 seconds if not dismissed within the past 7 days
 * - Remembers dismissal for 7 days in localStorage
 * - WCAG compliant: Focus trap, Escape-key listener, background scroll lock, focus restoration
 * - Mobile-friendly bottom-sheet with touch-friendly touch targets
 * - Listens for `janmabhoomi:open-sub-popup` custom event for reviewer manual preview
 */
export function SubscriptionPopup({ lang, dict }: SubscriptionPopupProps) {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    try {
      const expiresAt = Date.now() + SEVEN_DAYS_MS;
      localStorage.setItem(DISMISS_STORAGE_KEY, String(expiresAt));
    } catch {
      // Ignore storage errors in restricted browsing
    }

    // Restore focus to previously focused element
    if (previouslyFocusedElementRef.current && typeof previouslyFocusedElementRef.current.focus === "function") {
      previouslyFocusedElementRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Allow instant manual trigger from the Footer "Preview Subscription Popup" button for testing
    const handleManualOpen = () => {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      setVisible(true);
    };
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
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
      setVisible(true);
    }, INITIAL_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("janmabhoomi:open-sub-popup", handleManualOpen);
    };
  }, []);

  // Focus trap, Escape-key handling, and body scroll lock when modal is open
  useEffect(() => {
    if (!visible) return;

    // 1. Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // 2. Set initial focus into modal
    const focusTimer = window.setTimeout(() => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else if (dialogRef.current) {
        dialogRef.current.focus();
      }
    }, 50);

    // 3. Handle Keyboard: Escape to close and Tab/Shift-Tab focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleDismiss();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, handleDismiss]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sub-popup-title"
      aria-describedby="sub-popup-desc"
      onClick={(e) => {
        // Dismiss if clicking directly on the overlay backdrop
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg border-2 border-[#016BB7] bg-white p-5 sm:p-6 shadow-2xl outline-none"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleDismiss}
          aria-label={dict.popup.dismiss}
          className="absolute right-3 top-3 rounded-full p-2 text-[#292725]/70 hover:bg-[#FAF8F3] hover:text-[#292725] focus:outline-none focus:ring-2 focus:ring-[#016BB7] cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 rounded-xs bg-[#016BB7]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#016BB7]">
          <Newspaper className="h-3.5 w-3.5 text-[#016BB7]" />
          <span>{dict.popup.badge}</span>
        </div>

        <h2
          id="sub-popup-title"
          className="mt-2.5 text-lg sm:text-xl font-extrabold text-[#292725] leading-snug pr-8"
        >
          {dict.popup.title}
        </h2>

        <p
          id="sub-popup-desc"
          className="mt-2 text-xs sm:text-sm text-[#292725]/80 leading-relaxed"
        >
          {dict.popup.description}
        </p>

        <ul className="mt-3 space-y-1.5 text-xs text-[#292725]/85">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#016BB7] shrink-0" />
            <span>
              {lang === "gu"
                ? "દરરોજ સવારે સંપૂર્ણ પ્રિન્ટ અખબાર ડિજિટલ સ્વરૂપે"
                : "Complete daily newspaper & city supplements"}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-[#016BB7] shrink-0" />
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#016BB7] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#016BB7]/90 active:bg-[#015a99] focus:outline-none focus:ring-2 focus:ring-[#016BB7] transition-colors"
          >
            <Newspaper className="h-4 w-4 text-white" />
            <span>{dict.popup.cta}</span>
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full rounded-md border border-[#292725]/20 bg-[#FAF8F3] px-4 py-2 text-xs font-semibold text-[#292725]/80 hover:text-[#292725] focus:outline-none focus:ring-2 focus:ring-[#016BB7] transition-colors cursor-pointer"
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
