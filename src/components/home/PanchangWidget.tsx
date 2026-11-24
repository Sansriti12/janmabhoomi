"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  Compass,
  ArrowRight,
  Clock,
  MapPin,
} from "lucide-react";
import { PanchangData, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { SponsorStrip } from "@/components/ads/SponsorStrip";

type CityKey = "mumbai" | "delhi" | "ahmedabad" | "surat" | "vadodara";

interface CitySchedule {
  key: CityKey;
  en: string;
  gu: string;
  sunrise: string;
  sunset: string;
  rahuKaal: string;
  rahuStartMin: number; // minutes from midnight IST
  rahuEndMin: number;
  tithi: { en: string; gu: string };
  nakshatra: { en: string; gu: string };
  yogaKarana: { en: string; gu: string };
  vikramSamvat: { en: string; gu: string };
}

const CITY_PANCHANG_SCHEDULES: Record<CityKey, CitySchedule> = {
  mumbai: {
    key: "mumbai",
    en: "Mumbai",
    gu: "મુંબઈ",
    sunrise: "06:48 AM",
    sunset: "06:01 PM",
    rahuKaal: "09:36 AM – 11:00 AM",
    rahuStartMin: 9 * 60 + 36,
    rahuEndMin: 11 * 60,
    tithi: { en: "Kartik Shukla Ekadashi", gu: "કારતક સુદ એકાદશી" },
    nakshatra: { en: "Uttara Bhadrapada", gu: "ઉત્તરા ભાદ્રપદ" },
    yogaKarana: { en: "Siddhi Yoga • Vanija", gu: "સિદ્ધિ યોગ • વણિજ કરણ" },
    vikramSamvat: { en: "Vikram Samvat 2083", gu: "વિક્રમ સંવત ૨૦૮૩" },
  },
  delhi: {
    key: "delhi",
    en: "Delhi",
    gu: "દિલ્હી",
    sunrise: "06:50 AM",
    sunset: "05:25 PM",
    rahuKaal: "09:29 AM – 10:48 AM",
    rahuStartMin: 9 * 60 + 29,
    rahuEndMin: 10 * 60 + 48,
    tithi: { en: "Kartik Shukla Ekadashi", gu: "કારતક સુદ એકાદશી" },
    nakshatra: { en: "Uttara Bhadrapada", gu: "ઉત્તરા ભાદ્રપદ" },
    yogaKarana: { en: "Siddhi Yoga • Vanija", gu: "સિદ્ધિ યોગ • વણિજ કરણ" },
    vikramSamvat: { en: "Vikram Samvat 2083", gu: "વિક્રમ સંવત ૨૦૮૩" },
  },
  ahmedabad: {
    key: "ahmedabad",
    en: "Ahmedabad",
    gu: "અમદાવાદ",
    sunrise: "06:58 AM",
    sunset: "05:56 PM",
    rahuKaal: "09:42 AM – 11:04 AM",
    rahuStartMin: 9 * 60 + 42,
    rahuEndMin: 11 * 60 + 4,
    tithi: { en: "Kartik Shukla Ekadashi", gu: "કારતક સુદ એકાદશી" },
    nakshatra: { en: "Uttara Bhadrapada", gu: "ઉત્તરા ભાદ્રપદ" },
    yogaKarana: { en: "Siddhi Yoga • Vishti", gu: "સિદ્ધિ યોગ • વિષ્ટિ કરણ" },
    vikramSamvat: { en: "Vikram Samvat 2083", gu: "વિક્રમ સંવત ૨૦૮૩" },
  },
  surat: {
    key: "surat",
    en: "Surat",
    gu: "સુરત",
    sunrise: "06:51 AM",
    sunset: "05:59 PM",
    rahuKaal: "09:38 AM – 11:02 AM",
    rahuStartMin: 9 * 60 + 38,
    rahuEndMin: 11 * 60 + 2,
    tithi: { en: "Kartik Shukla Ekadashi", gu: "કારતક સુદ એકાદશી" },
    nakshatra: { en: "Uttara Bhadrapada", gu: "ઉત્તરા ભાદ્રપદ" },
    yogaKarana: { en: "Siddhi Yoga • Vanija", gu: "સિદ્ધિ યોગ • વણિજ કરણ" },
    vikramSamvat: { en: "Vikram Samvat 2083", gu: "વિક્રમ સંવત ૨૦૮૩" },
  },
  vadodara: {
    key: "vadodara",
    en: "Vadodra",
    gu: "વડોદરા",
    sunrise: "06:54 AM",
    sunset: "05:56 PM",
    rahuKaal: "09:39 AM – 11:02 AM",
    rahuStartMin: 9 * 60 + 39,
    rahuEndMin: 11 * 60 + 2,
    tithi: { en: "Kartik Shukla Ekadashi", gu: "કારતક સુદ એકાદશી" },
    nakshatra: { en: "Uttara Bhadrapada", gu: "ઉત્તરા ભાદ્રપદ" },
    yogaKarana: { en: "Siddhi Yoga • Bava", gu: "સિદ્ધિ યોગ • બવ કરણ" },
    vikramSamvat: { en: "Vikram Samvat 2083", gu: "વિક્રમ સંવત ૨૦૮૩" },
  },
};

const CITY_ORDER: CityKey[] = ["mumbai", "delhi", "ahmedabad", "surat", "vadodara"];

interface LiveStatusInfo {
  tone: "good" | "amber" | "neutral";
  labelEn: string;
  labelGu: string;
  timeRange: string;
}

const DEFAULT_DAY_SLOTS = [
  { name: { en: "Shubh", gu: "શુભ" }, start: 6 * 60 + 45, end: 8 * 60 + 15, quality: "good" as const, time: "06:45 AM – 08:15 AM" },
  { name: { en: "Rog", gu: "રોગ" }, start: 8 * 60 + 15, end: 9 * 60 + 45, quality: "bad" as const, time: "08:15 AM – 09:45 AM" },
  { name: { en: "Udveg", gu: "ઉદ્વેગ" }, start: 9 * 60 + 45, end: 11 * 60 + 15, quality: "bad" as const, time: "09:45 AM – 11:15 AM" },
  { name: { en: "Chal", gu: "ચલ" }, start: 11 * 60 + 15, end: 12 * 60 + 45, quality: "neutral" as const, time: "11:15 AM – 12:45 PM" },
  { name: { en: "Labh", gu: "લાભ" }, start: 12 * 60 + 45, end: 14 * 60 + 15, quality: "good" as const, time: "12:45 PM – 02:15 PM" },
  { name: { en: "Amrit", gu: "અમૃત" }, start: 14 * 60 + 15, end: 15 * 60 + 45, quality: "good" as const, time: "02:15 PM – 03:45 PM" },
  { name: { en: "Kaal", gu: "કાળ" }, start: 15 * 60 + 45, end: 17 * 60 + 15, quality: "bad" as const, time: "03:45 PM – 05:15 PM" },
  { name: { en: "Shubh", gu: "શુભ" }, start: 17 * 60 + 15, end: 18 * 60 + 45, quality: "good" as const, time: "05:15 PM – 06:45 PM" },
];

function computeLiveIstStatus(city: CitySchedule): LiveStatusInfo {
  try {
    const now = new Date();
    const istParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const h = Number(istParts.find((p) => p.type === "hour")?.value ?? 12);
    const m = Number(istParts.find((p) => p.type === "minute")?.value ?? 0);
    const totalMin = h * 60 + m;

    // Check Rahu Kaal first
    if (totalMin >= city.rahuStartMin && totalMin < city.rahuEndMin) {
      return {
        tone: "amber",
        labelEn: "Rahu Kaal Active",
        labelGu: "હાલ રાહુકાળ ચાલુ છે",
        timeRange: city.rahuKaal,
      };
    }

    const activeSlot = DEFAULT_DAY_SLOTS.find(
      (s) => totalMin >= s.start && totalMin < s.end
    );

    if (activeSlot) {
      if (activeSlot.quality === "good") {
        return {
          tone: "good",
          labelEn: `Shubh / ${activeSlot.name.en} Hour`,
          labelGu: `શુભ સમય • ${activeSlot.name.gu} ચોઘડિયું`,
          timeRange: activeSlot.time,
        };
      }
      if (activeSlot.quality === "bad") {
        return {
          tone: "amber",
          labelEn: `${activeSlot.name.en} Choghadiya`,
          labelGu: `${activeSlot.name.gu} ચોઘડિયું`,
          timeRange: activeSlot.time,
        };
      }
      return {
        tone: "neutral",
        labelEn: "Chal (Neutral) Hour",
        labelGu: "ચલ (સામાન્ય) ચોઘડિયું",
        timeRange: activeSlot.time,
      };
    }

    return {
      tone: "good",
      labelEn: "Evening Shubh / Labh",
      labelGu: "સાંજનો શુભ / લાભ સમય",
      timeRange: "IST",
    };
  } catch {
    return {
      tone: "good",
      labelEn: "Shubh / Labh Window",
      labelGu: "શુભ / લાભ સમય",
      timeRange: "IST",
    };
  }
}

interface PanchangWidgetProps {
  panchang?: PanchangData;
  initialPanchang?: PanchangData;
  lang: Locale;
  dict: Dictionary;
  showChoghadiya?: boolean;
}

/**
 * City-Switchable Live Janmabhoomi Daily Panchang Widget
 * - Interactive tabs for Mumbai, Rajkot, Bhuj, and Surat
 * - Live IST Choghadiya / Rahu Kaal status badge
 * - Clean production typography with subtle Preview badge
 */
export function PanchangWidget({
  panchang,
  initialPanchang,
  lang,
  showChoghadiya = false,
}: PanchangWidgetProps) {
  const isGu = lang === "gu";
  const [selectedCity, setSelectedCity] = useState<CityKey>("mumbai");
  const [citySchedules, setCitySchedules] = useState<Record<CityKey, CitySchedule>>(
    CITY_PANCHANG_SCHEDULES
  );
  const [activeChoghadiyaTab, setActiveChoghadiyaTab] = useState<"day" | "night">("day");
  const [liveStatus, setLiveStatus] = useState<LiveStatusInfo>(() =>
    computeLiveIstStatus(CITY_PANCHANG_SCHEDULES.mumbai)
  );

  // Sync with any updates saved in /admin/panchang
  useEffect(() => {
    try {
      const raw = localStorage.getItem("janmabhoomi_city_panchang_v1");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === "object") {
          setCitySchedules((prev) => {
            const next = { ...prev };
            for (const key of CITY_ORDER) {
              const s = saved[key];
              if (s) {
                next[key] = {
                  ...prev[key],
                  sunrise: s.sunrise || prev[key].sunrise,
                  sunset: s.sunset || prev[key].sunset,
                  rahuKaal: s.rahuKaal || prev[key].rahuKaal,
                  tithi: {
                    en: s.tithiEn || prev[key].tithi.en,
                    gu: s.tithiGu || prev[key].tithi.gu,
                  },
                  nakshatra: {
                    en: s.nakshatraEn || prev[key].nakshatra.en,
                    gu: s.nakshatraGu || prev[key].nakshatra.gu,
                  },
                  yogaKarana: {
                    en: s.yogaEn || prev[key].yogaKarana.en,
                    gu: s.yogaGu || prev[key].yogaKarana.gu,
                  },
                  vikramSamvat: {
                    en: s.vikramSamvatEn || prev[key].vikramSamvat.en,
                    gu: s.vikramSamvatGu || prev[key].vikramSamvat.gu,
                  },
                };
              }
            }
            return next;
          });
        }
      }
    } catch {}
  }, []);

  const cityData = citySchedules[selectedCity];
  const baseData = panchang || initialPanchang;

  useEffect(() => {
    setLiveStatus(computeLiveIstStatus(citySchedules[selectedCity]));
    const interval = setInterval(() => {
      setLiveStatus(computeLiveIstStatus(citySchedules[selectedCity]));
    }, 60_000);
    return () => clearInterval(interval);
  }, [selectedCity, citySchedules]);

  const indicatorClasses =
    liveStatus.tone === "good"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : liveStatus.tone === "amber"
      ? "bg-amber-50 text-amber-800 border-amber-200"
      : "bg-sky-50 text-sky-800 border-sky-200";

  const dotClasses =
    liveStatus.tone === "good"
      ? "bg-emerald-500"
      : liveStatus.tone === "amber"
      ? "bg-amber-500"
      : "bg-sky-500";

  return (
    <section
      aria-labelledby="panchang-heading"
      className="container-wide py-4 sm:py-6 notranslate"
      translate="no"
      suppressHydrationWarning
    >
      <div
        className="rounded-2xl border border-[#016BB7]/25 bg-white p-5 sm:p-6 lg:p-7 shadow-xs"
        suppressHydrationWarning
      >
        {/* Top Header + Live Choghadiya Indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#016BB7]/15">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-6 w-1.5 bg-[#016BB7] rounded-full" />
              <Compass className="h-5 w-5 text-[#016BB7]" />
              <h2
                id="panchang-heading"
                className="text-lg sm:text-2xl font-extrabold text-[#1F2937] tracking-tight font-gujarati"
              >
                {isGu ? "જન્મભૂમિ દૈનિક પંચાંગ" : "Janmabhoomi Daily Panchang"}
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {isGu ? "પૂર્વાવલોકન" : "Preview"}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/70 font-medium font-gujarati">
              {cityData.vikramSamvat[lang]} •{" "}
              {isGu
                ? "દૈનિક તિથિ, નક્ષત્ર, ચોઘડિયા અને સૂર્યોદય-સૂર્યાસ્ત સમય"
                : "Daily Tithi, Nakshatra, Choghadiya & regional solar timings"}
            </p>
          </div>

          {/* Live Choghadiya / Auspicious Time Indicator + Link */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-2xs ${indicatorClasses}`}
              title={liveStatus.timeRange}
            >
              <span className={`h-2 w-2 rounded-full animate-pulse ${dotClasses}`} />
              <span>{isGu ? liveStatus.labelGu : liveStatus.labelEn}</span>
              <span className="text-[10px] opacity-75 hidden sm:inline">
                ({liveStatus.timeRange})
              </span>
            </div>

            <Link
              href={`/${lang}/panchang`}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#016BB7] hover:underline"
            >
              <span>{isGu ? "સંપૂર્ણ પંચાંગ" : "Full Panchang"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* City Selector Tabs (Mumbai, Rajkot, Bhuj, Surat) */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x py-0.5"
            role="tablist"
            aria-label={isGu ? "શહેર પસંદ કરો" : "Select Panchang city"}
          >
            {CITY_ORDER.map((cityKey) => {
              const c = CITY_PANCHANG_SCHEDULES[cityKey];
              const active = selectedCity === cityKey;
              return (
                <button
                  key={cityKey}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCity(cityKey)}
                  className={`snap-start shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                    active
                      ? "bg-[#016BB7] text-white border-[#016BB7] shadow-2xs"
                      : "bg-[#FAF8F3] text-[#1F2937] border-slate-200 hover:border-[#016BB7]/50 hover:text-[#016BB7]"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{isGu ? c.gu : c.en}</span>
                </button>
              );
            })}
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Compass className="h-3.5 w-3.5 text-[#016BB7]" />
            <span>
              {isGu
                ? `${cityData.gu} પ્રાદેશિક ખગોળ ગણતરી (IST)`
                : `${cityData.en} Regional Solar Schedule (IST)`}
            </span>
          </span>
        </div>

        {/* 6-Cell Daily Astronomical Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="rounded-xl bg-[#FAF8F3] p-3.5 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#016BB7]">
              {isGu ? "તિથિ" : "Tithi"}
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-[#292725]">
              {cityData.tithi[lang]}
            </p>
          </div>

          <div className="rounded-xl bg-[#FAF8F3] p-3.5 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#016BB7]">
              {isGu ? "નક્ષત્ર" : "Nakshatra"}
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-[#292725]">
              {cityData.nakshatra[lang]}
            </p>
          </div>

          <div className="rounded-xl bg-[#FAF8F3] p-3.5 border border-[#292725]/10">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#016BB7]">
              {isGu ? "યોગ અને કરણ" : "Yoga & Karana"}
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-[#292725]">
              {cityData.yogaKarana[lang]}
            </p>
          </div>

          <div className="rounded-xl bg-[#FAF8F3] p-3.5 border border-[#292725]/10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#016BB7]">
              <Sun className="h-3.5 w-3.5 text-amber-500" />
              {isGu ? "સૂર્યોદય" : "Sunrise"}
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-[#292725] tabular-nums">
              {cityData.sunrise}
            </p>
          </div>

          <div className="rounded-xl bg-[#FAF8F3] p-3.5 border border-[#292725]/10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#016BB7]">
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              {isGu ? "સૂર્યાસ્ત" : "Sunset"}
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-[#292725] tabular-nums">
              {cityData.sunset}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
              {isGu ? "રાહુકાળ" : "Rahu Kaal"}
            </span>
            <p className="mt-1 text-xs sm:text-sm font-bold text-amber-950 tabular-nums">
              {cityData.rahuKaal}
            </p>
          </div>
        </div>

        {/* Day & Night Choghadiya Section */}
        {showChoghadiya && (
          <div className="mt-6 pt-5 border-t border-[#292725]/10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#016BB7]" />
                <h3 className="text-sm sm:text-base font-bold text-[#292725]">
                  {isGu ? "દૈનિક ચોઘડિયા સમયસારિણી" : "Daily Choghadiya Schedule"}
                </h3>
              </div>

              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-[#FAF8F3]">
                <button
                  type="button"
                  onClick={() => setActiveChoghadiyaTab("day")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    activeChoghadiyaTab === "day"
                      ? "bg-[#016BB7] text-white shadow-2xs"
                      : "text-[#292725]/70 hover:text-[#016BB7]"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  <span>{isGu ? "દિવસના ચોઘડિયા" : "Day"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChoghadiyaTab("night")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    activeChoghadiyaTab === "night"
                      ? "bg-[#016BB7] text-white shadow-2xs"
                      : "text-[#292725]/70 hover:text-[#016BB7]"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  <span>{isGu ? "રાત્રિના ચોઘડિયા" : "Night"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {(activeChoghadiyaTab === "day"
                ? baseData?.choghadiya?.day ||
                  DEFAULT_DAY_SLOTS.map((s) => ({
                    name: s.name,
                    timing: s.time,
                    quality: s.quality,
                  }))
                : baseData?.choghadiya?.night ||
                  DEFAULT_DAY_SLOTS.map((s) => ({
                    name: s.name,
                    timing: s.time.replace("AM", "PM").replace("PM", "AM"),
                    quality: s.quality,
                  }))
              ).map((slot, index) => {
                const isGood = slot.quality === "good";
                const isNeutral = slot.quality === "neutral";
                const badgeColor = isGood
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : isNeutral
                  ? "bg-sky-50 text-sky-900 border-sky-200"
                  : "bg-amber-50 text-amber-900 border-amber-200";

                const qualityLabel = isGood
                  ? isGu
                    ? "શુભ"
                    : "Shubh"
                  : isNeutral
                  ? isGu
                    ? "સામાન્ય"
                    : "Chal"
                  : isGu
                  ? "અશુભ"
                  : "Caution";

                return (
                  <div
                    key={`${activeChoghadiyaTab}-${slot.name.en}-${index}`}
                    className={`rounded-lg border p-2.5 text-center flex flex-col justify-between ${badgeColor}`}
                  >
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/80">
                        {qualityLabel}
                      </span>
                      <p className="mt-1.5 text-xs font-extrabold">
                        {getLocalizedText(slot.name, lang)}
                      </p>
                    </div>
                    <p className="mt-1 text-[10px] font-medium opacity-80 tabular-nums">
                      {slot.timing}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monetized Panchang 'Powered By' Sponsor Strip */}
        <div className="px-4 sm:px-5 pb-3.5 pt-2 border-t border-slate-100">
          <SponsorStrip slotKey="panchang_sponsor" lang={lang} />
        </div>
      </div>
    </section>
  );
}
