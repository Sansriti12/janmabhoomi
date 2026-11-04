import React from "react";
import Link from "next/link";
import { Sun, Moon, Compass, AlertTriangle, ArrowRight } from "lucide-react";
import { PanchangData, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";

interface PanchangWidgetProps {
  panchang: PanchangData;
  lang: Locale;
  dict: Dictionary;
}

/**
 * Section 7 – Compact Panchang Section
 * Explicitly uses clearly labelled sample placeholder data and does not invent religious calendar timings.
 */
export function PanchangWidget({
  panchang,
  lang,
  dict,
}: PanchangWidgetProps) {
  return (
    <section
      aria-labelledby="panchang-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="rounded-md border border-[#C59B4B]/50 bg-white p-5">
        {/* Top Header & Explicit Sample Disclaimer */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-[#292725]/12">
          <div className="flex flex-wrap items-center gap-2.5">
            <Compass className="h-5 w-5 text-[#174F73]" />
            <h2
              id="panchang-heading"
              className="text-lg sm:text-xl font-extrabold text-[#174F73]"
            >
              {dict.home.panchangTitle} (પંચાંગ)
            </h2>
            <span className="text-xs font-medium text-[#292725]/70">
              • {getLocalizedText(panchang.vikramSamvat, lang)}
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded bg-[#B83232]/10 border border-[#B83232]/30 px-2.5 py-1 text-[11px] font-bold text-[#B83232]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{dict.home.panchangSampleBadge}</span>
          </div>
        </div>

        {/* Compact Panchang Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase text-[#174F73]">
              {lang === "gu" ? "તિથિ (Tithi)" : "Tithi"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {getLocalizedText(panchang.tithi, lang)}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase text-[#174F73]">
              {lang === "gu" ? "નક્ષત્ર (Nakshatra)" : "Nakshatra"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {getLocalizedText(panchang.nakshatra, lang)}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase text-[#174F73]">
              {lang === "gu" ? "યોગ / કરણ" : "Yoga & Karana"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {getLocalizedText(panchang.yoga, lang)}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#174F73]">
              <Sun className="h-3 w-3 text-[#C59B4B]" />
              {lang === "gu" ? "સૂર્યોદય" : "Sunrise"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {panchang.sunrise}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#174F73]">
              <Moon className="h-3 w-3 text-[#174F73]" />
              {lang === "gu" ? "સૂર્યાસ્ત" : "Sunset"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {panchang.sunset}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase text-[#B83232]">
              {lang === "gu" ? "રાહુકાળ (નમૂનો)" : "Rahu Kaal (Sample)"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {panchang.rahuKaal}
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-[#292725]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#292725]/70">
          <p>{getLocalizedText(panchang.auspiciousNote, lang)}</p>
          <Link
            href={`/${lang}/panchang`}
            className="inline-flex items-center gap-1 font-bold text-[#174F73] hover:underline shrink-0"
          >
            <span>
              {lang === "gu" ? "સંપૂર્ણ પંચાંગ વિભાગ" : "Full Panchang Page"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
