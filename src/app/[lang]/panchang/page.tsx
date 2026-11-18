import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, Newspaper, MapPin } from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { PanchangWidget } from "@/components/home/PanchangWidget";

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
        ? "દૈનિક પંચાંગ અને ચોઘડિયા — મુંબઈ આવૃત્તિ | જન્મભૂમિ"
        : "Daily Panchang & Choghadiya Timings — Mumbai Edition | Janmabhoomi",
    description:
      locale === "gu"
        ? "જન્મભૂમિ પંચાંગ: દૈનિક તિથિ, નક્ષત્ર, સૂર્યોદય, સૂર્યાસ્ત, રાહુકાળ અને દિવસ-રાત્રિના ચોઘડિયા."
        : "Janmabhoomi Daily Panchang: Authentic Tithi, Nakshatra, Sunrise, Sunset, Rahu Kaal, and Day/Night Choghadiya timings.",
  };
}

export default async function PanchangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  const initialPanchang = await newsDataProvider.getPanchangByCity("mumbai");

  return (
    <div className="py-8 space-y-8 notranslate" translate="no" suppressHydrationWarning>
      {/* Page Header Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border-2 border-[#016BB7]/25 bg-white p-6 sm:p-8 shadow-xs" suppressHydrationWarning>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#016BB7] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Compass className="h-3.5 w-3.5" />
                <span>{locale === "gu" ? "જન્મભૂમિ પંચાંગ" : "JANMABHOOMI PANCHANG"}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#016BB7] bg-[#016BB7]/10 px-2.5 py-1 rounded-full border border-[#016BB7]/20">
                <MapPin className="h-3.5 w-3.5 text-[#016BB7]" />
                <span>{locale === "gu" ? "મુંબઈ આવૃત્તિ" : "Mumbai Edition"}</span>
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {locale === "gu" ? "સ્થાપના ૧૯૩૪" : "Saurashtra Trust Est. 1934"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#016BB7] tracking-tight font-gujarati">
            {locale === "gu"
              ? "દૈનિક પંચાંગ અને દિવસ-રાત્રિના ચોઘડિયા (મુંબઈ)"
              : "Daily Panchang & Day-Night Choghadiya (Mumbai)"}
          </h1>

          <p className="mt-2.5 max-w-3xl text-sm sm:text-base text-slate-600 leading-relaxed font-gujarati">
            {locale === "gu"
              ? "સૌરાષ્ટ્ર ટ્રસ્ટ દ્વારા ૧૯૩૪ થી પ્રકાશિત થતું વિશ્વપ્રસિદ્ધ જન્મભૂમિ પંચાંગ. પૂજા, લગ્ન અને વેપાર-મુહૂર્ત માટે મુંબઈ અને દેશ-વિદેશના ગુજરાતી પરિવારોમાં પરંપરાગત વિશ્વસનીયતા."
              : "Published since 1934 by Saurashtra Trust, the revered Janmabhoomi Panchang serves families worldwide as a trusted authority for auspicious muhurats and timings."}
          </p>
        </div>
      </div>

      {/* Main Interactive Panchang Component with Choghadiya Enabled */}
      <PanchangWidget
        initialPanchang={initialPanchang}
        lang={locale}
        dict={dict}
        showChoghadiya={true}
      />

      {/* Reference Guide to Choghadiya Meaning */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <BookOpen className="h-5 w-5 text-[#016BB7]" />
            <h2 className="text-lg font-extrabold text-slate-900 font-gujarati">
              {locale === "gu"
                ? "ચોઘડિયા માર્ગદર્શિકા — શુભ અને અશુભ સમયનું મહત્વ"
                : "Understanding Choghadiya — Auspicious & Inauspicious Periods"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed font-gujarati">
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-4">
              <span className="font-bold text-emerald-900 uppercase tracking-wider">
                {locale === "gu" ? "શુભ ચોઘડિયા (Auspicious)" : "Auspicious Slots"}
              </span>
              <p className="mt-1.5 text-emerald-950">
                <strong>અમૃત (Amrut), લાભ (Labh), શુભ (Shubh):</strong>{" "}
                {locale === "gu"
                  ? "નવા કાર્યનો પ્રારંભ, સોદાબાજી, ગૃહપ્રવેશ, પૂજન અને રોકાણ માટે શ્રેષ્ઠ."
                  : "Optimal for starting new ventures, business deals, prayers, and financial investments."}
              </p>
            </div>

            <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-4">
              <span className="font-bold text-amber-900 uppercase tracking-wider">
                {locale === "gu" ? "મધ્યમ ચોઘડિયું (Neutral)" : "Neutral Slots"}
              </span>
              <p className="mt-1.5 text-amber-950">
                <strong>ચલ (Char):</strong>{" "}
                {locale === "gu"
                  ? "યાત્રા, પ્રવાસ, વાહન ખરીદી અને ગતિશીલ કાર્યો માટે અનુકૂળ."
                  : "Favorable for travel, journeys, commuting, and dynamic moving activities."}
              </p>
            </div>

            <div className="rounded-xl border border-rose-300 bg-rose-50/60 p-4">
              <span className="font-bold text-rose-900 uppercase tracking-wider">
                {locale === "gu" ? "અનિષ્ટ ચોઘડિયા (Avoid)" : "Inauspicious Slots"}
              </span>
              <p className="mt-1.5 text-rose-950">
                <strong>રોગ (Rog), ઉદ્વેગ (Udveg), કાળ (Kaal):</strong>{" "}
                {locale === "gu"
                  ? "મહત્વપૂર્ણ નિર્ણયો અને શુભ કાર્યો શરૂ કરવા માટે ત્યાજ્ય માનવામાં આવે છે."
                  : "Traditionally avoided when signing critical agreements or initiating auspicious ceremonies."}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-gujarati">
            <p>
              {locale === "gu"
                ? "સંપૂર્ણ વાર્ષિક જન્મભૂમિ પંચાંગ પુસ્તિકા બુકસ્ટોર અને જન્મભૂમિ કાર્યાલય પર ઉપલબ્ધ છે."
                : "The complete authoritative Janmabhoomi Annual Printed Panchang is available at all major bookstalls."}
            </p>
            <Link
              href={`/${locale}/epaper`}
              className="inline-flex items-center gap-1.5 font-bold text-[#016BB7] hover:underline shrink-0"
            >
              <Newspaper className="h-4 w-4" />
              <span>
                {locale === "gu"
                  ? "ઈ-પેપર પંચાંગ પૂર્તિ જુઓ"
                  : "View Panchang in E-Paper"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
