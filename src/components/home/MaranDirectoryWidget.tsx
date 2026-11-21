"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, ArrowRight, RotateCcw, BookMarked } from "lucide-react";
import { Locale } from "@/lib/i18n/config";

interface MaranNotice {
  id: string;
  name: { en: string; gu: string };
  surname: { en: string; gu: string };
  gaam: { en: string; gu: string };
  city: { en: string; gu: string };
  age: number;
  date: string; // YYYY-MM-DD
  dateLabel: { en: string; gu: string };
  noticeType: { en: string; gu: string };
  venue: { en: string; gu: string };
  time: { en: string; gu: string };
}

const MARAN_DIRECTORY_NOTICES: MaranNotice[] = [
  {
    id: "maran-01",
    name: { en: "Shri Kantilal Harjivan Parekh", gu: "શ્રી કાંતિલાલ હરજીવન પારેખ" },
    surname: { en: "Parekh", gu: "પારેખ" },
    gaam: { en: "Bhavnagar (Sihor)", gu: "ભાવનગર (સિહોર)" },
    city: { en: "Ghatkopar, Mumbai", gu: "ઘાટકોપર, મુંબઈ" },
    age: 82,
    date: "2026-11-21",
    dateLabel: { en: "21 Nov 2026", gu: "૨૧ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Besanu", gu: "બેસણું" },
    venue: {
      en: "Zaverben Popatlal Hall, Ghatkopar (East)",
      gu: "ઝવેરબેન પોપટલાલ હોલ, ઘાટકોપર (પૂર્વ)",
    },
    time: { en: "4:00 PM – 6:00 PM", gu: "સાંજે ૪:૦૦ થી ૬:૦૦" },
  },
  {
    id: "maran-02",
    name: { en: "Smt. Nirmalaben Mansukhlal Shah", gu: "શ્રીમતી નિર્મળાબેન મનસુખલાલ શાહ" },
    surname: { en: "Shah", gu: "શાહ" },
    gaam: { en: "Morbi", gu: "મોરબી" },
    city: { en: "Borivali, Mumbai", gu: "બોરીવલી, મુંબઈ" },
    age: 78,
    date: "2026-11-21",
    dateLabel: { en: "21 Nov 2026", gu: "૨૧ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Prarthana Sabha", gu: "પ્રાર્થના સભા" },
    venue: {
      en: "Saurashtra Patel Samaj Hall, Borivali (West)",
      gu: "સૌરાષ્ટ્ર પટેલ સમાજ હોલ, બોરીવલી (પશ્ચિમ)",
    },
    time: { en: "5:00 PM – 6:30 PM", gu: "સાંજે ૫:૦૦ થી ૬:૩૦" },
  },
  {
    id: "maran-03",
    name: { en: "Shri Devjibhai Karshanbhai Patel", gu: "શ્રી દેવજીભાઈ કરશનભાઈ પટેલ" },
    surname: { en: "Patel", gu: "પટેલ" },
    gaam: { en: "Rajkot (Gondal)", gu: "રાજકોટ (ગોંડલ)" },
    city: { en: "Mulund, Mumbai", gu: "મુલુંડ, મુંબઈ" },
    age: 86,
    date: "2026-11-20",
    dateLabel: { en: "20 Nov 2026", gu: "૨૦ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Besanu", gu: "બેસણું" },
    venue: {
      en: "Kalidas Natyagruh Annex, Mulund (West)",
      gu: "કાલિદાસ નાટ્યગૃહ એનેક્સ, મુલુંડ (પશ્ચિમ)",
    },
    time: { en: "4:30 PM – 6:00 PM", gu: "સાંજે ૪:૩૦ થી ૬:૦૦" },
  },
  {
    id: "maran-04",
    name: { en: "Shri Chhotalal Velji Mehta", gu: "શ્રી છોટાલાલ વેલજી મહેતા" },
    surname: { en: "Mehta", gu: "મહેતા" },
    gaam: { en: "Bhuj (Mandvi, Kutch)", gu: "ભુજ (માંડવી, કચ્છ)" },
    city: { en: "Matunga, Mumbai", gu: "માટુંગા, મુંબઈ" },
    age: 84,
    date: "2026-11-20",
    dateLabel: { en: "20 Nov 2026", gu: "૨૦ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Shraddhanjali", gu: "શ્રદ્ધાંજલિ" },
    venue: {
      en: "Kutchhi Visa Oswal Hall, Matunga (CR)",
      gu: "કચ્છી વીસા ઓસવાળ હોલ, માટુંગા",
    },
    time: { en: "3:30 PM – 5:30 PM", gu: "બપોરે ૩:૩૦ થી ૫:૩૦" },
  },
  {
    id: "maran-05",
    name: { en: "Smt. Pushpaben Rasiklal Desai", gu: "શ્રીમતી પુષ્પાબેન રસિકલાલ દેસાઈ" },
    surname: { en: "Desai", gu: "દેસાઈ" },
    gaam: { en: "Surat (Navsari)", gu: "સુરત (નવસારી)" },
    city: { en: "Vile Parle, Mumbai", gu: "વિલેપાર્લે, મુંબઈ" },
    age: 75,
    date: "2026-11-19",
    dateLabel: { en: "19 Nov 2026", gu: "૧૯ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Besanu", gu: "બેસણું" },
    venue: {
      en: "Bhaidas Sabhagriha Lawn, Vile Parle (West)",
      gu: "ભાઈદાસ સભાગૃહ, વિલેપાર્લે (પશ્ચિમ)",
    },
    time: { en: "4:00 PM – 6:00 PM", gu: "સાંજે ૪:૦૦ થી ૬:૦૦" },
  },
  {
    id: "maran-06",
    name: { en: "Shri Harishchandra Mohanlal Joshi", gu: "શ્રી હરિશ્ચંદ્ર મોહનલાલ જોશી" },
    surname: { en: "Joshi", gu: "જોશી" },
    gaam: { en: "Jamnagar", gu: "જામનગર" },
    city: { en: "Kandivali, Mumbai", gu: "કાંદિવલી, મુંબઈ" },
    age: 80,
    date: "2026-11-19",
    dateLabel: { en: "19 Nov 2026", gu: "૧૯ નવેમ્બર ૨૦૨૬" },
    noticeType: { en: "Prarthana Sabha", gu: "પ્રાર્થના સભા" },
    venue: {
      en: "Halai Lohana Mahajanwadi, Kandivali (West)",
      gu: "હાલાઈ લોહાણા મહાજનવાડી, કાંદિવલી (પશ્ચિમ)",
    },
    time: { en: "5:00 PM – 6:30 PM", gu: "સાંજે ૫:૦૦ થી ૬:૩૦" },
  },
];

interface MaranDirectoryWidgetProps {
  lang: Locale;
}

/**
 * Searchable "Maran / Besanu" (Obituaries) Directory Card
 * Compact inline community lookup by Surname, Native Village / Gaam (વતન), and Date.
 */
export function MaranDirectoryWidget({ lang }: MaranDirectoryWidgetProps) {
  const isGu = lang === "gu";
  const [surnameQuery, setSurnameQuery] = useState("");
  const [gaamQuery, setGaamQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const hasFilters = Boolean(surnameQuery.trim() || gaamQuery.trim() || selectedDate);

  const filteredNotices = useMemo(() => {
    return MARAN_DIRECTORY_NOTICES.filter((notice) => {
      if (surnameQuery.trim()) {
        const q = surnameQuery.trim().toLowerCase();
        const matchSurname =
          notice.surname.en.toLowerCase().includes(q) ||
          notice.surname.gu.toLowerCase().includes(q) ||
          notice.name.en.toLowerCase().includes(q) ||
          notice.name.gu.toLowerCase().includes(q);
        if (!matchSurname) return false;
      }

      if (gaamQuery.trim()) {
        const g = gaamQuery.trim().toLowerCase();
        const matchGaam =
          notice.gaam.en.toLowerCase().includes(g) ||
          notice.gaam.gu.toLowerCase().includes(g) ||
          notice.city.en.toLowerCase().includes(g) ||
          notice.city.gu.toLowerCase().includes(g);
        if (!matchGaam) return false;
      }

      if (selectedDate && notice.date !== selectedDate) {
        return false;
      }

      return true;
    });
  }, [surnameQuery, gaamQuery, selectedDate]);

  const clearFilters = () => {
    setSurnameQuery("");
    setGaamQuery("");
    setSelectedDate("");
  };

  return (
    <section
      aria-labelledby="maran-directory-heading"
      className="container-wide py-4 sm:py-5"
    >
      <div className="rounded-2xl border border-[#292725]/15 bg-white p-5 sm:p-6 lg:p-7 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#292725]/12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-6 w-1.5 bg-[#292725] rounded-full" />
              <BookMarked className="h-5 w-5 text-[#016BB7]" />
              <h2
                id="maran-directory-heading"
                className="text-lg sm:text-2xl font-extrabold text-[#1F2937] tracking-tight font-gujarati"
              >
                {isGu
                  ? "મરણ નોંધ અને બેસણું — સમુદાય ડિરેક્ટરી"
                  : "Maran & Besanu (Obituaries) Directory"}
              </h2>
              <span className="rounded-full bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {isGu ? "પૂર્વાવલોકન" : "Preview"}
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/70 font-medium">
              {isGu
                ? "અટક, મૂળ વતન (ગામ) અથવા તારીખ દ્વારા બેસણું અને શ્રદ્ધાંજલિ નોંધ શોધો"
                : "Search community obituary, besanu, and prayer meeting notices by surname, native village (વતન), or date"}
            </p>
          </div>

          <Link
            href={`/${lang}/category/maran`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#016BB7] hover:underline shrink-0"
          >
            <span>{isGu ? "તમામ મરણ નોંધ જુઓ" : "All Obituary Notices"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Inline Community Lookup Filter Bar */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center bg-[#FAF8F3] p-3.5 rounded-xl border border-[#292725]/10">
          {/* Surname Filter */}
          <div className="lg:col-span-4 relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={surnameQuery}
              onChange={(e) => setSurnameQuery(e.target.value)}
              placeholder={isGu ? "અટક અથવા નામ શોધો (દા.ત. શાહ, પટેલ)..." : "Filter by Surname (e.g. Shah, Patel, Parekh)..."}
              aria-label={isGu ? "અટક દ્વારા શોધો" : "Filter by surname"}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
            />
          </div>

          {/* Native Village / Gaam (વતન) Filter */}
          <div className="lg:col-span-4 relative">
            <MapPin className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={gaamQuery}
              onChange={(e) => setGaamQuery(e.target.value)}
              placeholder={isGu ? "મૂળ વતન / ગામ (દા.ત. ભાવનગર, ભુજ, મોરબી)..." : "Native Village / Gaam (વતન) e.g. Bhuj, Morbi..."}
              aria-label={isGu ? "મૂળ વતન દ્વારા શોધો" : "Filter by native village or gaam"}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
            />
          </div>

          {/* Date Filter */}
          <div className="lg:col-span-3 relative">
            <Calendar className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              aria-label={isGu ? "તારીખ પસંદ કરો" : "Filter by date"}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs sm:text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none cursor-pointer"
            >
              <option value="">{isGu ? "તમામ તારીખો" : "All Dates"}</option>
              <option value="2026-11-21">{isGu ? "૨૧ નવેમ્બર ૨૦૨૬" : "21 Nov 2026"}</option>
              <option value="2026-11-20">{isGu ? "૨૦ નવેમ્બર ૨૦૨૬" : "20 Nov 2026"}</option>
              <option value="2026-11-19">{isGu ? "૧૯ નવેમ્બર ૨૦૨૬" : "19 Nov 2026"}</option>
            </select>
          </div>

          {/* Reset Button */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasFilters}
              title={isGu ? "ફિલ્ટર સાફ કરો" : "Clear filters"}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-[#016BB7] hover:text-[#016BB7] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="lg:hidden">{isGu ? "રીસેટ" : "Reset"}</span>
            </button>
          </div>
        </div>

        {/* Filtered Results Grid */}
        {filteredNotices.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {filteredNotices.map((notice) => (
              <article
                key={notice.id}
                className="rounded-xl border border-slate-200 bg-[#FAF8F3]/60 hover:bg-white hover:border-[#016BB7]/40 p-4 transition-all flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-slate-800 text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      {notice.noticeType[lang]}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {notice.dateLabel[lang]}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-[#1F2937] leading-snug font-gujarati">
                    {notice.name[lang]}{" "}
                    <span className="text-xs font-semibold text-slate-500">
                      ({isGu ? `ઉં. વ. ${notice.age}` : `Age ${notice.age}`})
                    </span>
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1 font-semibold text-[#016BB7]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {isGu ? `વતન: ${notice.gaam.gu}` : `Gaam: ${notice.gaam.en}`}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span>{notice.city[lang]}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-0.5">
                  <p className="font-semibold text-slate-800 line-clamp-1">
                    {notice.venue[lang]}
                  </p>
                  <p className="text-slate-500">{notice.time[lang]}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-[#FAF8F3] p-8 text-center space-y-2">
            <p className="text-sm font-bold text-slate-700">
              {isGu
                ? "તમારી શોધ મુજબ કોઈ મરણ નોંધ મળી નથી."
                : "No obituary or besanu notices match your filters."}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isGu ? "બધી નોંધો ફરી બતાવો" : "Show all notices"}</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
