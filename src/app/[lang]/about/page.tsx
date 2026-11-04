import React from "react";
import type { Metadata } from "next";
import { Shield, Award, Newspaper } from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { BrandLogo } from "@/components/shared/BrandLogo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  return {
    title: dict.header.aboutUs,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="rounded-md border border-[#292725]/15 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-[#292725]/12">
          <BrandLogo />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C59B4B]">
              SAURASHTRA TRUST • EST. 1934
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174F73]">
              {dict.footer.aboutHeading}
            </h1>
            <p className="font-gujarati text-sm font-semibold text-[#292725]/80 mt-0.5">
              {dict.header.tagline}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 text-sm sm:text-base text-[#292725]/85 leading-relaxed">
          <p>{dict.footer.aboutText}</p>
          <p>
            {locale === "gu"
              ? "જન્મભૂમિ જૂથ દ્વારા મુંબઈથી જન્મભૂમિ, જન્મભૂમિ પ્રવાસી અને વ્યાપાર, રાજકોટથી ફૂલછાબ અને ભુજથી કચ્છમિત્ર દૈનિકોનું પ્રકાશન કરવામાં આવે છે. આ નવું ડિજિટલ પ્લેટફોર્મ અમારા પરંપરાગત અખબારી મૂલ્યોને આધુનિક ટેકનોલોજી સાથે જોડે છે."
              : "Published from Janmabhoomi Bhavan in Fort, Mumbai, the Janmabhoomi Group (under Saurashtra Trust) publishes flagship titles including Janmabhoomi, Janmabhoomi Pravasi, Vyapar, Phulchhab (Rajkot), and Kutchmitra (Bhuj). This digital platform is architected as the foundational flagship of our centralised multi-publication ecosystem."}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded border border-[#292725]/12 bg-[#FAF8F3] p-4">
            <Newspaper className="h-5 w-5 text-[#174F73] mb-2" />
            <h2 className="text-sm font-bold text-[#292725]">
              {locale === "gu" ? "સમાચાર (News)" : "Credible Journalism"}
            </h2>
            <p className="mt-1 text-xs text-[#292725]/75">
              {locale === "gu"
                ? "મુંબઈ, ગુજરાત, સૌરાષ્ટ્ર, કચ્છ અને નવી દિલ્હીથી પ્રમાણિત સમાચાર કવરેજ."
                : "Verified reporting across Mumbai, Gujarat, Saurashtra, Kutch, and New Delhi."}
            </p>
          </div>

          <div className="rounded border border-[#292725]/12 bg-[#FAF8F3] p-4">
            <Shield className="h-5 w-5 text-[#174F73] mb-2" />
            <h2 className="text-sm font-bold text-[#292725]">
              {locale === "gu" ? "વિશ્વાસ (Trust)" : "Reader Trust Since 1934"}
            </h2>
            <p className="mt-1 text-xs text-[#292725]/75">
              {locale === "gu"
                ? "સૌરાષ્ટ્ર ટ્રસ્ટ હેઠળ નવ દાયકાથી વધુ સમયની સંસ્થાકીય વિશ્વસનીયતા."
                : "Over nine decades of institutional integrity under Saurashtra Trust."}
            </p>
          </div>

          <div className="rounded border border-[#292725]/12 bg-[#FAF8F3] p-4">
            <Award className="h-5 w-5 text-[#C59B4B] mb-2" />
            <h2 className="text-sm font-bold text-[#292725]">
              {locale === "gu" ? "નિષ્પક્ષતા (Impartiality)" : "Editorial Independence"}
            </h2>
            <p className="mt-1 text-xs text-[#292725]/75">
              {locale === "gu"
                ? "નિર્ભીક અને સંતુલિત અગ્રલેખ તથા લોકહિતલક્ષી વિશ્લેષણ."
                : "Fearless, balanced અગ્રલેખ (Editorial) and public-interest analysis."}
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy & Terms Sections linked from Footer */}
      <div
        id="privacy"
        className="rounded-md border border-[#292725]/15 bg-white p-6"
      >
        <h2 className="text-lg font-extrabold text-[#174F73]">
          {dict.footer.privacyPolicy}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#292725]/75 leading-relaxed">
          {locale === "gu"
            ? "જન્મભૂમિ જૂથ વાચકોની ગોપનીયતાનો આદર કરે છે. આ પ્રથમ તબક્કાના ડેમો સંસ્કરણ દરમિયાન, સબ્સ્ક્રિપ્શન પોપઅપ બંધ કર્યાની પસંદગી ૭ દિવસ સુધી યાદ રાખવા માટે માત્ર બ્રાઉઝરના localStorage નો ઉપયોગ કરવામાં આવે છે."
            : "Janmabhoomi Group respects reader privacy. During this first-cut demonstration phase, only a local browser preference (localStorage) is used to remember subscription popup dismissal for 7 days."}
        </p>
      </div>

      <div
        id="terms"
        className="rounded-md border border-[#292725]/15 bg-white p-6"
      >
        <h2 className="text-lg font-extrabold text-[#174F73]">
          {dict.footer.termsConditions}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#292725]/75 leading-relaxed">
          {locale === "gu"
            ? "તમામ સમાચાર અહેવાલો, અગ્રલેખ, માસ્ટહેડ અને ઈ-પેપર લેઆઉટના કોપીરાઇટ જન્મભૂમિ જૂથ (સૌરાષ્ટ્ર ટ્રસ્ટ) પાસે સુરક્ષિત છે. જાહેર વેબસાઇટ પર માત્ર સંક્ષિપ્ત પૂર્વાવલોકન ઉપલબ્ધ છે; સંપૂર્ણ અખબાર વાંચવા માટે સક્રિય ઈ-પેપર સબ્સ્ક્રિપ્શન આવશ્યક છે."
            : "All news articles, અગ્રલેખ editorials, mastheads, and E-Paper layouts are copyright of Janmabhoomi Group (Saurashtra Trust). Public web pages provide editorial previews; complete print editions require an active E-Paper subscription."}
        </p>
      </div>
    </div>
  );
}
