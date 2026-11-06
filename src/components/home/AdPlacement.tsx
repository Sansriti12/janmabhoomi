import React from "react";
import Link from "next/link";
import { AdvertisementSlot, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";

interface AdPlacementProps {
  slot: AdvertisementSlot;
  lang: Locale;
  label: string;
}

/**
 * Section 3 – Defined Horizontal Advertisement Area
 * Clean, non-intrusive newspaper display slot without popups or oversized heights.
 */
export function AdPlacement({ slot, lang, label }: AdPlacementProps) {
  return (
    <section
      aria-label={label}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-4"
    >
      <div className="rounded-md border border-[#016BB7]/20 bg-white px-5 py-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-[#292725]/50 mb-2">
          <span>{label}</span>
          <span>{slot.dimensionsLabel}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#292725]/10 pt-3">
          <div>
            <p className="text-sm sm:text-base font-bold text-[#016BB7]">
              {getLocalizedText(slot.sponsorHeadline, lang)}
            </p>
            <p className="text-xs text-[#292725]/75 mt-0.5">
              {getLocalizedText(slot.sponsorSubtext, lang)}
            </p>
          </div>

          <Link
            href={`/${lang}${slot.ctaHref}`}
            className="shrink-0 inline-flex items-center justify-center rounded border border-[#016BB7] bg-[#FAF8F3] px-4 py-2 text-xs font-bold text-[#016BB7] hover:bg-[#016BB7] hover:text-white transition-colors"
          >
            {getLocalizedText(slot.ctaText, lang)}
          </Link>
        </div>
      </div>
    </section>
  );
}
