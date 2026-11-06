"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  Compass,
  AlertTriangle,
  ArrowRight,
  Clock,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { PanchangData, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";

type CityKey = "mumbai" | "ahmedabad" | "rajkot";

interface PanchangWidgetProps {
  panchang?: PanchangData;
  initialPanchang?: PanchangData;
  cityPanchangMap?: Record<CityKey, PanchangData>;
  lang: Locale;
  dict: Dictionary;
  showChoghadiya?: boolean;
}

const CITIES: Array<{ key: CityKey; en: string; gu: string }> = [
  { key: "mumbai", en: "Mumbai", gu: "મુંબઈ" },
  { key: "ahmedabad", en: "Ahmedabad", gu: "અમદાવાદ" },
  { key: "rajkot", en: "Rajkot", gu: "રાજકોટ" },
];

/**
 * Enhanced Panchang Component
 * Supports city switching (Mumbai, Ahmedabad, Rajkot), sunrise/sunset timings,
 * Day & Night Choghadiya tables, and explicit demonstration disclaimers.
 */
export function PanchangWidget({
  panchang,
  initialPanchang,
  cityPanchangMap,
  lang,
  dict,
  showChoghadiya = false,
}: PanchangWidgetProps) {
  const [selectedCity, setSelectedCity] = useState<CityKey>("mumbai");
  const [activeChoghadiyaTab, setActiveChoghadiyaTab] = useState<"day" | "night">("day");

  // Determine active panchang data according to selected city
  const activeData: PanchangData =
    (cityPanchangMap && cityPanchangMap[selectedCity]) ||
    panchang ||
    initialPanchang!;

  if (!activeData) return null;

  return (
    <section
      aria-labelledby="panchang-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6"
    >
      <div className="rounded-md border border-[#016BB7]/50 bg-white p-5 sm:p-6 shadow-xs">
        {/* Top Header & Disclaimers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#292725]/12">
          <div className="flex flex-wrap items-center gap-2.5">
            <Compass className="h-5 w-5 text-[#016BB7]" />
            <h2
              id="panchang-heading"
              className="text-lg sm:text-xl font-extrabold text-[#016BB7]"
            >
              {dict.home.panchangTitle} (પંચાંગ)
            </h2>
            <span className="text-xs font-semibold text-[#016BB7] bg-[#016BB7]/10 px-2.5 py-0.5 rounded-xs">
              {getLocalizedText(activeData.vikramSamvat, lang)}
            </span>
          </div>

          {/* Demonstration Notice Badge */}
          <div className="inline-flex items-center gap-1.5 rounded bg-[#B83232]/10 border border-[#B83232]/30 px-2.5 py-1 text-[11px] font-bold text-[#B83232]">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{dict.home.panchangSampleBadge}</span>
          </div>
        </div>

        {/* City Selector Pill Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#016BB7] shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#292725]/75">
              {lang === "gu" ? "આવૃત્તિ શહેર પસંદ કરો:" : "Select City Edition:"}
            </span>
            <div className="flex items-center gap-1.5">
              {CITIES.map((city) => (
                <button
                  key={city.key}
                  type="button"
                  onClick={() => setSelectedCity(city.key)}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                    selectedCity === city.key
                      ? "bg-[#016BB7] text-white shadow-xs"
                      : "bg-[#FAF8F3] border border-[#292725]/15 text-[#292725]/80 hover:border-[#016BB7] hover:text-[#016BB7]"
                  }`}
                >
                  {lang === "gu" ? city.gu : city.en}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-semibold text-[#016BB7]">
            {activeData.editionCity
              ? getLocalizedText(activeData.editionCity, lang)
              : lang === "gu"
              ? `${selectedCity === "mumbai" ? "મુંબઈ" : selectedCity === "ahmedabad" ? "અમદાવાદ" : "રાજકોટ"} આવૃત્તિ`
              : `${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)} Edition`}
          </div>
        </div>

        {/* 6-Cell Daily Astronomical Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase text-[#016BB7]">
              {lang === "gu" ? "તિથિ (Tithi)" : "Tithi"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {getLocalizedText(activeData.tithi, lang)}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase text-[#016BB7]">
              {lang === "gu" ? "નક્ષત્ર (Nakshatra)" : "Nakshatra"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {getLocalizedText(activeData.nakshatra, lang)}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase text-[#016BB7]">
              {lang === "gu" ? "યોગ / કરણ" : "Yoga & Karana"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {getLocalizedText(activeData.yoga, lang)}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#016BB7]">
              <Sun className="h-3.5 w-3.5 text-[#016BB7]" />
              {lang === "gu" ? "સૂર્યોદય" : "Sunrise"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {activeData.sunrise}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-[#016BB7]">
              <Moon className="h-3.5 w-3.5 text-[#016BB7]" />
              {lang === "gu" ? "સૂર્યાસ્ત" : "Sunset"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {activeData.sunset}
            </p>
          </div>

          <div className="rounded bg-[#FAF8F3] p-3 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase text-[#B83232]">
              {lang === "gu" ? "રાહુકાળ (નમૂનો)" : "Rahu Kaal (Sample)"}
            </span>
            <p className="mt-1 text-xs font-semibold text-[#292725]">
              {activeData.rahuKaal}
            </p>
          </div>
        </div>

        {/* Day & Night Choghadiya Section */}
        {showChoghadiya && activeData.choghadiya && (
          <div className="mt-6 pt-5 border-t border-[#292725]/12">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#016BB7]" />
                <h3 className="text-base font-bold text-[#292725]">
                  {lang === "gu"
                    ? "દૈનિક ચોઘડિયા સમયસારિણી (નમૂનો)"
                    : "Daily Choghadiya Timings (Sample Preview)"}
                </h3>
              </div>

              {/* Day / Night Toggle */}
              <div className="inline-flex rounded-md border border-[#292725]/20 p-0.5 bg-[#FAF8F3]">
                <button
                  type="button"
                  onClick={() => setActiveChoghadiyaTab("day")}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    activeChoghadiyaTab === "day"
                      ? "bg-[#016BB7] text-white shadow-2xs"
                      : "text-[#292725]/70 hover:text-[#016BB7]"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>{lang === "gu" ? "દિવસના ચોઘડિયા" : "Day Choghadiya"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChoghadiyaTab("night")}
                  className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    activeChoghadiyaTab === "night"
                      ? "bg-[#016BB7] text-white shadow-2xs"
                      : "text-[#292725]/70 hover:text-[#016BB7]"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>{lang === "gu" ? "રાત્રિના ચોઘડિયા" : "Night Choghadiya"}</span>
                </button>
              </div>
            </div>

            {/* Choghadiya 8-Slots Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {(activeChoghadiyaTab === "day"
                ? activeData.choghadiya.day
                : activeData.choghadiya.night
              ).map((slot, index) => {
                const isGood = slot.quality === "good";
                const isNeutral = slot.quality === "neutral";
                const badgeColor = isGood
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : isNeutral
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-rose-50 text-rose-800 border-rose-300";

                const qualityLabel =
                  slot.quality === "good"
                    ? lang === "gu" ? "શુભ" : "Auspicious"
                    : slot.quality === "neutral"
                    ? lang === "gu" ? "સામાન્ય" : "Neutral"
                    : lang === "gu" ? "અશુભ" : "Inauspicious";

                return (
                  <div
                    key={`${slot.name.en}-${index}`}
                    className={`rounded border p-2.5 text-center flex flex-col justify-between ${badgeColor}`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-xs bg-white/70">
                        {qualityLabel}
                      </span>
                      <p className="text-sm font-extrabold text-[#292725] mt-1.5 font-gujarati">
                        {getLocalizedText(slot.name, lang)}
                      </p>
                    </div>
                    <p className="text-[11px] font-medium text-[#292725]/75 mt-2 pt-1 border-t border-black/10">
                      {slot.timing}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer disclaimer and link */}
        <div className="mt-4 pt-3 border-t border-[#292725]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#292725]/70">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-[#016BB7] shrink-0" />
            <span>{getLocalizedText(activeData.auspiciousNote, lang)}</span>
          </p>

          {!showChoghadiya && (
            <Link
              href={`/${lang}/panchang`}
              className="inline-flex items-center gap-1 font-bold text-[#016BB7] hover:underline shrink-0"
            >
              <span>
                {lang === "gu"
                  ? "સંપૂર્ણ પંચાંગ અને ચોઘડિયા"
                  : "Full Panchang & Choghadiya"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
