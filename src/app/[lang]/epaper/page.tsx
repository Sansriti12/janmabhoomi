import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Newspaper,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { getLocalizedText } from "@/lib/data/types";
import { DemoBadge } from "@/components/shared/DemoBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  return {
    title:
      locale === "gu"
        ? "જન્મભૂમિ ઈ-પેપર અને પ્રિન્ટ પ્રતિકૃતિ સબ્સ્ક્રિપ્શન"
        : "Janmabhoomi E-Paper & Print Replica Subscription Portal",
    description:
      locale === "gu"
        ? "જન્મભૂમિ દૈનિક અખબારની અધિકૃત ડિજિટલ પ્રિન્ટ પ્રતિકૃતિ. સમગ્ર અખબારના પાના, અગ્રલેખ અને વિશેષ પૂર્તિઓ."
        : "Official digital print replica of Janmabhoomi Daily Newspaper. Full broadsheet pages, editorials, and special editions.",
  };
}

export default async function EpaperLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ page?: string; view?: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const sisterPublications = await newsDataProvider.getSisterPublications();
  const epaperEditions = await newsDataProvider.getEPaperEditions();
  const currentEdition = epaperEditions[0] || null;

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activePageNo = resolvedSearchParams.page
    ? parseInt(resolvedSearchParams.page, 10)
    : 1;

  const samplePages = currentEdition?.pages || [
    {
      pageNumber: 1,
      label: { en: "Page 1 — Main Front Page", gu: "પાનું ૧ — મુખ્ય પ્રથમ પાનું" },
      previewDescription: {
        en: "Western Maritime Corridor, Top National News, Front Page briefs",
        gu: "વેસ્ટર્ન મેરિટાઇમ કોરિડોર, મુખ્ય રાષ્ટ્રીય સમાચાર, પ્રથમ પાનાના સંક્ષિપ્ત",
      },
    },
    {
      pageNumber: 2,
      label: { en: "Page 2 — City & Maran Notices", gu: "પાનું ૨ — શહેર અને મરણ નોંધ" },
      previewDescription: {
        en: "Mumbai local civic reporting, Community announcements, Besanu & Maran tributes",
        gu: "મુંબઈ સ્થાનિક સમાચારો, સમાજ સેવા, મરણ નોંધ અને બેસણું શ્રદ્ધાંજલિ",
      },
    },
    {
      pageNumber: 3,
      label: { en: "Page 3 — Mumbai Metropolitan", gu: "પાનું ૩ — મુંબઈ મહાનગર" },
      previewDescription: {
        en: "Suburban railway updates, BMC infrastructure, Coastal Road extension",
        gu: "ઉપનગરીય રેલવે, પાલિકા વિકાસ કામો, કોસ્ટલ રોડ વિસ્તરણ અહેવાલ",
      },
    },
    {
      pageNumber: 4,
      label: { en: "Page 4 — Gujarat & Saurashtra", gu: "પાનું ૪ — ગુજરાત અને સૌરાષ્ટ્ર" },
      previewDescription: {
        en: "State capital dispatches, Gandhinagar policy updates, regional roundups",
        gu: "ગાંધીનગર સચિવાલય સમાચાર, રાજ્યના મહત્વના નીતિગત નિર્ણયો",
      },
    },
    {
      pageNumber: 8,
      label: { en: "Page 8 — Editorial (અગ્રલેખ) & Ideas", gu: "પાનું ૮ — અગ્રલેખ અને વિચાર" },
      previewDescription: {
        en: "Institutional leading editorial, Guest columnists, Reader letters",
        gu: "મુખ્ય અગ્રલેખ, વિચારવંત કટારલેખકોના લેખ, વાચકોના પત્રો",
      },
    },
    {
      pageNumber: 10,
      label: { en: "Page 10 — Vyapar, Markets & Commodities", gu: "પાનું ૧૦ — વ્યાપાર અને બજાર" },
      previewDescription: {
        en: "BSE/NSE stock movements, bullion rates, textile & commodity markets",
        gu: "શેરબજાર તેજી-મંદી, સોના-ચાંદીના ભાવ, કપાસ અને તેલીબિયાં બજાર",
      },
    },
    {
      pageNumber: 14,
      label: { en: "Page 14 — Sports & Cricket Roundup", gu: "પાનું ૧૪ — રમતગમત જગત" },
      previewDescription: {
        en: "Ranji Trophy match reports, International cricket, Olympic athletics",
        gu: "રણજી ટ્રોફી મેચ અહેવાલ, આંતરરાષ્ટ્રીય ક્રિકેટ, એથ્લેટિક્સ",
      },
    },
    {
      pageNumber: 16,
      label: { en: "Page 16 — Entertainment & Culture", gu: "પાનું ૧૬ — સંસ્કૃતિ અને મનોરંજન" },
      previewDescription: {
        en: "Gujarati stage theatre reviews, film releases, cultural heritage features",
        gu: "ગુજરાતી રંગભૂમિ સમીક્ષા, નાટક, સિનેમા અને કલા-સાહિત્ય",
      },
    },
  ];

  const activePageItem =
    samplePages.find((p) => p.pageNumber === activePageNo) || samplePages[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Header Edition Masthead Banner */}
      <div className="rounded-md border-2 border-[#016BB7] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xs bg-[#016BB7] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <Newspaper className="h-3.5 w-3.5 text-[#016BB7]" />
              <span>JANMABHOOMI BROADSHEET DIGITAL REPLICA</span>
            </span>
            <span className="rounded-xs bg-[#FAF8F3] border border-[#016BB7]/20 px-2.5 py-1 text-xs font-semibold text-[#016BB7]">
              {locale === "gu" ? "મુંબઈ આવૃત્તિ" : "Mumbai Main Edition"}
            </span>
          </div>
          <DemoBadge />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#016BB7] tracking-tight">
              {dict.home.epaperBannerTitle}
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-[#292725]/85 leading-relaxed">
              {dict.home.epaperBannerDesc}
            </p>

            {/* Edition Metadata Pill Bar */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-[#292725]/75 border-t border-[#292725]/10 pt-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#016BB7]" />
                <strong>{locale === "gu" ? "તારીખ:" : "Date:"}</strong> Tuesday, 3 November 2026
              </span>
              <span className="text-[#292725]/30 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#016BB7]" />
                <strong>{locale === "gu" ? "પાના:" : "Pages:"}</strong> 16 Broadsheet Pages
              </span>
              <span className="text-[#292725]/30 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#016BB7]" />
                <strong>{locale === "gu" ? "સત્તાવાર પ્રકાશન:" : "Official:"}</strong> Saurashtra Trust
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#FAF8F3] border border-[#016BB7]/40 rounded-md p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#016BB7]">
              <Lock className="h-4 w-4 text-[#016BB7]" />
              <span>{locale === "gu" ? "સબ્સ્ક્રાઇબર એક્સેસ ગેટ" : "Subscriber Paywall Gate"}</span>
            </div>
            <p className="text-xs text-[#292725]/80 leading-relaxed">
              {locale === "gu"
                ? "સંપૂર્ણ અખબાર વાંચવા માટે સબ્સ્ક્રિપ્શન પ્લાન પસંદ કરો. પેમેન્ટ ગેટવે અને એકાઉન્ટ લોગિન બીજા તબક્કામાં જોડાશે."
                : "Public previews are accessible below. Full 16-page broadsheet reading is reserved for subscribers."}
            </p>
            <a
              href="#plans"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-[#016BB7] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#016BB7]/90 transition-colors"
            >
              <span>{locale === "gu" ? "પ્લાન જુઓ અને સબ્સ્ક્રાઇબ કરો" : "View Subscription Plans"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Selected Page Active Preview Inspector */}
      <section
        aria-labelledby="active-page-inspector-heading"
        className="rounded-md border border-[#016BB7]/25 bg-gradient-to-r from-[#FAF8F3] to-white p-5 border-l-4 border-l-[#016BB7]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#016BB7]">
              <FileText className="h-4 w-4 text-[#016BB7]" />
              <span>{locale === "gu" ? "પસંદ કરેલ પાનું ઝલક" : "Selected Page Preview"}</span>
              <span className="rounded bg-[#016BB7] text-white px-2 py-0.5 text-[11px] font-bold">
                {locale === "gu" ? `પાનું ${activePageItem.pageNumber}` : `Page ${activePageItem.pageNumber}`}
              </span>
            </div>
            <h2
              id="active-page-inspector-heading"
              className="text-lg sm:text-xl font-extrabold text-[#292725] mt-1"
            >
              {getLocalizedText(activePageItem.label, locale)}
            </h2>
            <p className="text-xs sm:text-sm text-[#292725]/75 mt-0.5">
              {getLocalizedText(activePageItem.previewDescription, locale)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs text-[#292725]/60">
              {locale === "gu" ? "બીજા પાના પર જાઓ:" : "Jump to page:"}
            </span>
            <div className="flex items-center gap-1">
              {samplePages.map((p) => (
                <Link
                  key={p.pageNumber}
                  href={`/${locale}/epaper?page=${p.pageNumber}`}
                  className={`h-7 w-7 rounded flex items-center justify-center text-xs font-bold transition-all ${
                    p.pageNumber === activePageItem.pageNumber
                      ? "bg-[#016BB7] text-white shadow-xs"
                      : "bg-white border border-[#292725]/20 text-[#292725] hover:border-[#016BB7] hover:text-[#016BB7]"
                  }`}
                  aria-label={`Go to page ${p.pageNumber}`}
                >
                  {p.pageNumber}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Broadsheet Miniature Thumbnails Grid */}
      <section aria-labelledby="edition-pages-heading">
        <div className="mb-4 flex items-center justify-between border-b-2 border-[#016BB7] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#016BB7]" />
            <h2
              id="edition-pages-heading"
              className="text-lg sm:text-xl font-extrabold text-[#292725]"
            >
              {locale === "gu"
                ? "આજની મુખ્ય આવૃત્તિ — પાનાની વિગતવાર ઝલક"
                : "Today's Broadsheet Page Index & Thumbnails"}
            </h2>
          </div>
          <span className="text-xs font-semibold text-[#016BB7]">
            {locale === "gu" ? "૧૬ પાના • પ્રિન્ટ પ્રતિકૃતિ" : "16 Pages • Print Replica"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {samplePages.map((pg) => {
            const isSelected = pg.pageNumber === activePageItem.pageNumber;
            return (
              <Link
                key={pg.pageNumber}
                href={`/${locale}/epaper?page=${pg.pageNumber}`}
                className={`group rounded-md border p-3.5 flex flex-col justify-between transition-all ${
                  isSelected
                    ? "border-2 border-[#016BB7] bg-[#FAF8F3] shadow-md ring-2 ring-[#016BB7]/20"
                    : "border-[#292725]/15 bg-white hover:border-[#016BB7]/50 hover:shadow-sm"
                }`}
              >
                <div>
                  {/* Realistic Broadsheet Miniature Representation */}
                  <div className="relative aspect-[3/4] w-full rounded border border-[#292725]/15 bg-white p-2.5 flex flex-col justify-between overflow-hidden shadow-2xs group-hover:border-[#016BB7]/40">
                    {/* Simulated Broadsheet Masthead */}
                    <div className="border-b border-[#292725]/20 pb-1.5 text-center">
                      <p className="text-[9px] font-bold tracking-widest text-[#016BB7] font-gujarati uppercase truncate">
                        જન્મભૂમિ મુંબઈ
                      </p>
                      <div className="flex justify-between text-[7px] text-[#292725]/50 px-1 mt-0.5">
                        <span>P.{pg.pageNumber}</span>
                        <span>03-11-2026</span>
                      </div>
                    </div>

                    {/* Simulated Multi-Column Print Newspaper Content */}
                    <div className="grid grid-cols-3 gap-1.5 py-1.5 flex-1">
                      <div className="space-y-1">
                        <div className="h-1.5 bg-[#016BB7]/20 rounded-xs w-full" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-5/6" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-full" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-4/6" />
                        <div className="h-6 bg-[#292725]/5 rounded-xs w-full mt-1 border border-dashed border-[#292725]/15 flex items-center justify-center">
                          <BookOpen className="h-3 w-3 text-[#016BB7]/40" />
                        </div>
                      </div>
                      <div className="space-y-1 border-x border-[#292725]/10 px-1">
                        <div className="h-2 bg-[#292725]/25 rounded-xs w-full font-bold" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-full" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-3/4" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-full" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-5/6" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-full" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-4/5" />
                        <div className="h-4 bg-[#016BB7]/10 rounded-xs w-full border border-dashed border-[#016BB7]/30" />
                        <div className="h-1 bg-[#292725]/10 rounded-xs w-full" />
                      </div>
                    </div>

                    {/* Watermark Lock Tag */}
                    <div className="border-t border-[#292725]/10 pt-1 text-center bg-[#FAF8F3]/80 py-0.5 rounded-xs">
                      <span className="text-[9px] font-bold text-[#016BB7]">
                        {locale === "gu" ? `પાનું ${pg.pageNumber}` : `Page ${pg.pageNumber}`}
                      </span>
                    </div>

                    {/* Active Selected Badge Overlay */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-[#016BB7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-xs shadow-xs">
                        {locale === "gu" ? "પસંદ કરેલ" : "ACTIVE"}
                      </div>
                    )}
                  </div>

                  <h3 className="mt-2.5 text-xs font-bold text-[#292725] line-clamp-1 group-hover:text-[#016BB7]">
                    {getLocalizedText(pg.label, locale)}
                  </h3>
                  <p className="mt-1 text-[11px] text-[#292725]/70 line-clamp-2">
                    {getLocalizedText(pg.previewDescription, locale)}
                  </p>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-xs border-t border-[#292725]/10">
                  <span className="font-semibold text-[#016BB7] text-[11px]">
                    {isSelected
                      ? locale === "gu" ? "• ઝલક ચાલુ છે" : "• Viewing Preview"
                      : locale === "gu" ? "ઝલક જુઓ" : "View Preview"}
                  </span>
                  <span className="rounded bg-[#016BB7]/20 px-2 py-0.5 text-[10px] font-bold text-[#292725]">
                    {locale === "gu" ? "સબ્સ્ક્રાઇબર એક્સેસ" : "SUBSCRIBER ACCESS"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Subscription Plans Overview (No Payment Processing in this Phase) */}
      <section id="plans" aria-labelledby="plans-heading">
        <div className="mb-5 border-b-2 border-[#016BB7] pb-2.5">
          <h2
            id="plans-heading"
            className="text-xl sm:text-2xl font-extrabold text-[#016BB7]"
          >
            {locale === "gu"
              ? "ઈ-પેપર સબ્સ્ક્રિપ્શન યોજનાઓ"
              : "E-Paper Subscription Plans"}
          </h2>
          <p className="text-xs sm:text-sm text-[#292725]/70 mt-0.5">
            {locale === "gu"
              ? "સૌરાષ્ટ્ર ટ્રસ્ટના વાચકો માટે સત્તાવાર ડિજિટલ સબ્સ્ક્રિપ્શન પેકેજ."
              : "Official digital subscription packages for Janmabhoomi readers."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              titleEn: "Monthly Digital Reader",
              titleGu: "માસિક ડિજિટલ પ્લાન",
              durationEn: "30 Days Full E-Paper Access",
              durationGu: "૩૦ દિવસ સંપૂર્ણ ઈ-પેપર એક્સેસ",
              badgeEn: "INDIVIDUAL",
              badgeGu: "વ્યક્તિગત",
            },
            {
              titleEn: "Annual Janmabhoomi E-Paper",
              titleGu: "વાર્ષિક જન્મભૂમિ ઈ-પેપર",
              durationEn: "365 Days + 30-Day Archive Access",
              durationGu: "૩૬૫ દિવસ + આર્કાઇવ એક્સેસ",
              badgeEn: "RECOMMENDED",
              badgeGu: "ભલામણ કરેલ",
              highlighted: true,
            },
            {
              titleEn: "All-Publications Group Bundle",
              titleGu: "જન્મભૂમિ જૂથ સંયુક્ત પ્લાન",
              durationEn: "Janmabhoomi, Phulchhab, Kutchmitra, Vyapar & Pravasi",
              durationGu: "જન્મભૂમિ, ફૂલછાબ, કચ્છમિત્ર, વ્યાપાર અને પ્રવાસી",
              badgeEn: "MULTI-PUBLICATION",
              badgeGu: "સંયુક્ત પ્રકાશન",
            },
          ].map((plan) => (
            <div
              key={plan.titleEn}
              className={`rounded-md p-6 flex flex-col justify-between bg-white ${
                plan.highlighted
                  ? "border-2 border-[#016BB7] shadow-md"
                  : "border border-[#292725]/15"
              }`}
            >
              <div>
                <span className="inline-block rounded-xs bg-[#016BB7]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#292725]">
                  {locale === "gu" ? plan.badgeGu : plan.badgeEn}
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-[#292725]">
                  {locale === "gu" ? plan.titleGu : plan.titleEn}
                </h3>
                <p className="mt-1 text-xs text-[#016BB7] font-semibold">
                  {locale === "gu" ? plan.durationGu : plan.durationEn}
                </p>

                <ul className="mt-4 space-y-2 text-xs text-[#292725]/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#016BB7] shrink-0" />
                    <span>
                      {locale === "gu"
                        ? "સંપૂર્ણ દૈનિક અખબારના પાના"
                        : "Complete daily broadsheet pages"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#016BB7] shrink-0" />
                    <span>
                      {locale === "gu"
                        ? "સંપૂર્ણ અગ્રલેખ અને વિશેષ અહેવાલો"
                        : "Full અગ્રલેખ & investigative articles"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#016BB7] shrink-0" />
                    <span>
                      {locale === "gu"
                        ? "વેબ, ટેબ્લેટ અને મોબાઇલ પર દરરોજ સવારે ઉપલબ્ધ"
                        : "Morning delivery on Web, Tablet & Mobile"}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-[#292725]/10">
                <Link
                  href={`/${locale}/contact?topic=subscription`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-[#016BB7] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#016BB7]/90 transition-colors"
                >
                  <ShieldCheck className="h-4 w-4 text-[#016BB7]" />
                  <span>
                    {locale === "gu"
                      ? "સબ્સ્ક્રિપ્શન નોંધણી પૂછપરછ (ડેમો)"
                      : "Enquire / Register Interest (Demo)"}
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Sister Publication E-Paper Links */}
      <section className="rounded-md border border-[#292725]/15 bg-white p-6">
        <h2 className="text-lg font-extrabold text-[#016BB7] mb-3">
          {dict.home.otherPublicationsTitle}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {sisterPublications.map((pub) => (
            <div
              key={pub.id}
              className="rounded border border-[#292725]/12 bg-[#FAF8F3] p-3 text-center"
            >
              <p className="font-gujarati font-extrabold text-[#016BB7]">
                {pub.logoPlaceholderCode}
              </p>
              <p className="text-xs font-bold text-[#292725] mt-1">
                {getLocalizedText(pub.name, locale)}
              </p>
              <p className="text-[11px] text-[#292725]/65">
                {getLocalizedText(pub.region, locale)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
