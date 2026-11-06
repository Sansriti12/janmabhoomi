import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Compass, ShieldAlert, Newspaper } from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { PanchangWidget } from "@/components/home/PanchangWidget";
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
        ? "દૈનિક પંચાંગ અને ચોઘડિયા — મુંબઈ, અમદાવાદ, રાજકોટ | જન્મભૂમિ"
        : "Daily Panchang & Choghadiya Timings — Mumbai, Ahmedabad, Rajkot | Janmabhoomi",
    description:
      locale === "gu"
        ? "જન્મભૂમિ પંચાંગ: દૈનિક તિથિ, નક્ષત્ર, સૂર્યોદય, સૂર્યાસ્ત, રાહુકાળ અને દિવસ-રાત્રિના ચોઘડિયા."
        : "Janmabhoomi Daily Panchang: Tithi, Nakshatra, Sunrise, Sunset, Rahu Kaal, and Day/Night Choghadiya calculations.",
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

  const [initialPanchang, cityPanchangMap] = await Promise.all([
    newsDataProvider.getDailyPanchang(),
    newsDataProvider.getAllCityPanchang(),
  ]);

  return (
    <div className="py-8 space-y-8">
      {/* Page Header Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-md border-2 border-[#016BB7] bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xs bg-[#016BB7] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Compass className="h-3.5 w-3.5 text-[#016BB7]" />
                <span>JANMABHOOMI TRADITIONAL ALMANAC</span>
              </span>
              <span className="text-xs font-semibold text-[#016BB7] bg-[#016BB7]/10 px-2.5 py-1 rounded-xs">
                {locale === "gu" ? "સ્થાપના ૧૯૩૪" : "Est. 1934"}
              </span>
            </div>
            <DemoBadge />
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#016BB7] tracking-tight">
            {locale === "gu"
              ? "દૈનિક પંચાંગ અને દિવસ-રાત્રિના ચોઘડિયા"
              : "Daily Panchang & Day-Night Choghadiya Almanac"}
          </h1>

          <p className="mt-2.5 max-w-3xl text-sm sm:text-base text-[#292725]/85 leading-relaxed">
            {locale === "gu"
              ? "સૌરાષ્ટ્ર ટ્રસ્ટ દ્વારા ૧૯૩૪ થી પ્રકાશિત થતું વિશ્વપ્રસિદ્ધ 'જન્મભૂમિ પંચાંગ' સમગ્ર ભારતમાં અને વિદેશ વસતા ગુજરાતી પરિવારોમાં પૂજા, લગ્ન અને વેપાર-મુહૂર્ત માટે પ્રમાણભૂત માનવામાં આવે છે."
              : "Published since 1934 by Saurashtra Trust, the revered 'Janmabhoomi Panchang' serves Gujarati families worldwide as the most trusted authority for muhurats, religious observances, and astronomical timings."}
          </p>

          <div className="mt-4 rounded bg-[#FAF8F3] border border-[#B83232]/30 p-3.5 text-xs text-[#292725]/80 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-[#B83232] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#B83232]">
                {locale === "gu" ? "મહત્વપૂર્ણ નિદર્શન નોંધ:" : "Demonstration Notice:"}
              </strong>{" "}
              {locale === "gu"
                ? "આ વેબ પૃષ્ઠ પર પ્રદર્શિત તિથિ અને ચોઘડિયાના સમય ફક્ત ફ્રન્ટએન્ડ આર્કિટેક્ચર ચકાસણી માટે ડેમો ડેટા તરીકે મૂકવામાં આવ્યા છે. વાસ્તવિક ધાર્મિક કાર્યો માટે અધિકૃત મુદ્રિત જન્મભૂમિ પંચાંગ અથવા ઈ-પેપર પંચાંગ પૂર્તિનો સંદર્ભ લેવો."
                : "All timings and planetary calculations displayed on this webpage are demonstration sample values intended for frontend testing. For ceremonial or business muhurat confirmation, please consult the authoritative printed Janmabhoomi Panchang."}
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Panchang Component with Choghadiya Enabled */}
      <PanchangWidget
        initialPanchang={initialPanchang}
        cityPanchangMap={cityPanchangMap}
        lang={locale}
        dict={dict}
        showChoghadiya={true}
      />

      {/* Reference Guide to Choghadiya Meaning */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-md border border-[#292725]/15 bg-white p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#292725]/10 pb-3">
            <BookOpen className="h-5 w-5 text-[#016BB7]" />
            <h2 className="text-lg font-extrabold text-[#292725]">
              {locale === "gu"
                ? "ચોઘડિયા માર્ગદર્શિકા — શુભ અને અશુભ સમયનું મહત્વ"
                : "Understanding Choghadiya — Auspicious & Inauspicious Periods"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
            <div className="rounded border border-emerald-300 bg-emerald-50/50 p-4">
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

            <div className="rounded border border-amber-300 bg-amber-50/50 p-4">
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

            <div className="rounded border border-rose-300 bg-rose-50/50 p-4">
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

          <div className="pt-3 border-t border-[#292725]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#292725]/75">
            <p>
              {locale === "gu"
                ? "સંપૂર્ણ વાર્ષિક જન્મભૂમિ પંચાંગ પુસ્તિકા બુકસ્ટોર અને જન્મભૂમિ કાર્યાલય પર ઉપલબ્ધ છે."
                : "The complete authoritative Janmabhoomi Annual Printed Almanac is available at all major bookstalls."}
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
