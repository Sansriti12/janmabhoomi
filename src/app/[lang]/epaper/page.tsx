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
        ? "જન્મભૂમિ ઈ-પેપર અને સબ્સ્ક્રિપ્શન"
        : "Janmabhoomi E-Paper & Subscription Portal",
  };
}

export default async function EpaperLandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const sisterPublications = await newsDataProvider.getSisterPublications();

  const samplePages = [
    { pageNo: 1, labelEn: "Page 1 — Main Front Page", labelGu: "પાનું ૧ — મુખ્ય પ્રથમ પાનું" },
    { pageNo: 2, labelEn: "Page 2 — City & Maran Notices", labelGu: "પાનું ૨ — શહેર અને મરણ નોંધ" },
    { pageNo: 3, labelEn: "Page 3 — Mumbai Metropolitan", labelGu: "પાનું ૩ — મુંબઈ મહાનગર" },
    { pageNo: 8, labelEn: "Page 8 — અગ્રલેખ (Editorial)", labelGu: "પાનું ૮ — અગ્રલેખ અને વિચાર" },
    { pageNo: 10, labelEn: "Page 10 — Vyapar & Markets", labelGu: "પાનું ૧૦ — વ્યાપાર અને બજાર" },
    { pageNo: 14, labelEn: "Page 14 — Sports & Cricket", labelGu: "પાનું ૧૪ — રમતગમત" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Banner */}
      <div className="rounded-md border-2 border-[#174F73] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 rounded-xs bg-[#174F73] px-3 py-1 text-xs font-bold uppercase text-white">
            <Newspaper className="h-3.5 w-3.5 text-[#C59B4B]" />
            <span>JANMABHOOMI DIGITAL REPLICA EDITION</span>
          </span>
          <DemoBadge />
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#174F73]">
          {dict.home.epaperBannerTitle}
        </h1>

        <p className="mt-2.5 max-w-3xl text-sm sm:text-base text-[#292725]/80 leading-relaxed">
          {dict.home.epaperBannerDesc}
        </p>

        <div className="mt-4 rounded bg-[#FAF8F3] border border-[#C59B4B]/50 p-3.5 text-xs text-[#292725]/80">
          {locale === "gu" ? (
            <>
              <strong>પ્રથમ તબક્કાની આર્કિટેક્ચર નોંધ:</strong> ગ્રાહક લોગિન,
              સબ્સ્ક્રાઇબર ચકાસણી અને પેમેન્ટ ગેટવે બીજા તબક્કામાં સેન્ટ્રલ
              સર્વર સાથે જોડવામાં આવશે.
            </>
          ) : (
            <>
              <strong>Phase 1 Architecture Notice:</strong> Customer
              authentication, subscriber entitlement verification, and payment
              gateway integration will connect here in Phase 2 once the central
              company server is provisioned.
            </>
          )}
        </div>
      </div>

      {/* Print Broadsheet Preview Grid */}
      <section aria-labelledby="edition-pages-heading">
        <div className="mb-4 flex items-center justify-between border-b-2 border-[#174F73] pb-2.5">
          <h2
            id="edition-pages-heading"
            className="text-xl font-extrabold text-[#292725] inline-flex items-center gap-2"
          >
            <Layers className="h-5 w-5 text-[#174F73]" />
            <span>
              {locale === "gu"
                ? "આજની મુંબઈ મુખ્ય આવૃત્તિ — પાનાની ઝલક (નમૂનો)"
                : "Today's Mumbai Main Edition — Broadsheet Page Index (Sample)"}
            </span>
          </h2>
          <span className="text-xs font-semibold text-[#174F73]">
            {locale === "gu"
              ? "૧૬ પાના • પ્રિન્ટ પ્રતિકૃતિ"
              : "16 Pages • Print Replica"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {samplePages.map((pg) => (
            <div
              key={pg.pageNo}
              className="rounded-md border border-[#292725]/15 bg-white p-4 flex flex-col justify-between"
            >
              <div>
                <div className="aspect-4/3 w-full rounded border border-dashed border-[#292725]/20 bg-[#FAF8F3] flex flex-col items-center justify-center p-4 text-center mb-3">
                  <BookOpen className="h-7 w-7 text-[#174F73] mb-1.5" />
                  <span className="text-xs font-extrabold text-[#174F73]">
                    JANMABHOOMI BROADSHEET
                  </span>
                  <span className="text-[11px] text-[#292725]/65 mt-0.5">
                    {locale === "gu" ? pg.labelGu : pg.labelEn}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#292725]/10">
                <span className="font-bold text-[#292725]">
                  {locale === "gu" ? `પાનું ${pg.pageNo}` : `Page ${pg.pageNo}`}
                </span>
                <span className="rounded bg-[#C59B4B]/20 px-2 py-0.5 text-[10px] font-bold text-[#292725]">
                  {locale === "gu" ? "સબ્સ્ક્રાઇબર એક્સેસ" : "SUBSCRIBER ACCESS"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription Plans Overview (No Payment Processing in Phase 1) */}
      <section id="plans" aria-labelledby="plans-heading">
        <div className="mb-5 border-b-2 border-[#174F73] pb-2.5">
          <h2
            id="plans-heading"
            className="text-xl sm:text-2xl font-extrabold text-[#174F73]"
          >
            {locale === "gu"
              ? "ઈ-પેપર સબ્સ્ક્રિપ્શન યોજનાઓ (પ્રથમ તબક્કાનું માળખું)"
              : "E-Paper Subscription Plans (First-Cut Preview)"}
          </h2>
          <p className="text-xs sm:text-sm text-[#292725]/70 mt-0.5">
            {locale === "gu"
              ? "વાસ્તવિક પેમેન્ટ ગેટવે અને લોગિન સિસ્ટમ બીજા તબક્કામાં જોડવામાં આવશે."
              : "Demonstration plan structure ready for Phase 2 subscriber authentication and payment integration."}
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
                  ? "border-2 border-[#174F73]"
                  : "border border-[#292725]/15"
              }`}
            >
              <div>
                <span className="inline-block rounded-xs bg-[#C59B4B]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#292725]">
                  {locale === "gu" ? plan.badgeGu : plan.badgeEn}
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-[#292725]">
                  {locale === "gu" ? plan.titleGu : plan.titleEn}
                </h3>
                <p className="mt-1 text-xs text-[#174F73] font-semibold">
                  {locale === "gu" ? plan.durationGu : plan.durationEn}
                </p>

                <ul className="mt-4 space-y-2 text-xs text-[#292725]/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#174F73] shrink-0" />
                    <span>
                      {locale === "gu"
                        ? "સંપૂર્ણ દૈનિક અખબારના પાના"
                        : "Complete daily broadsheet pages"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#174F73] shrink-0" />
                    <span>
                      {locale === "gu"
                        ? "સંપૂર્ણ અગ્રલેખ અને વિશેષ અહેવાલો"
                        : "Full અગ્રલેખ & investigative articles"}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#C59B4B] shrink-0" />
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
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-[#174F73] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#103A55]"
                >
                  <ShieldCheck className="h-4 w-4 text-[#C59B4B]" />
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

      {/* Sister Publication E-Paper Links */}
      <section className="rounded-md border border-[#292725]/15 bg-white p-6">
        <h2 className="text-lg font-extrabold text-[#174F73] mb-3">
          {dict.home.otherPublicationsTitle}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {sisterPublications.map((pub) => (
            <div
              key={pub.id}
              className="rounded border border-[#292725]/12 bg-[#FAF8F3] p-3 text-center"
            >
              <p className="font-gujarati font-extrabold text-[#174F73]">
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
