import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Newspaper,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Layers,
  Lock,
  ArrowRight,
} from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { PublicEpaperReader } from "@/components/epaper/PublicEpaperReader";

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
        ? "જન્મભૂમિ ઇ-પેપર — અધિકૃત ડિજિટલ પ્રિન્ટ પ્રતિકૃતિ"
        : "Janmabhoomi E-Paper — Official Digital Broadsheet Replica",
    description:
      locale === "gu"
        ? "જન્મભૂમિ દૈનિક અખબારની અધિકૃત ડિજિટલ પ્રિન્ટ પ્રતિકૃતિ. સમગ્ર અખબારના પાના, અગ્રલેખ, મુંબઈ-ગુજરાતના સમાચારો અને વિશેષ પૂર્તિઓ."
        : "Official digital print replica of Janmabhoomi Daily Newspaper. Full broadsheet pages, editorials, Mumbai & Gujarat dispatches, and special supplements.",
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
  const epaperEditions = await newsDataProvider.getEPaperEditions("pub-janmabhoomi");
  const currentEdition = epaperEditions[0] || null;

  // Format date dynamically
  const editionDateObj = currentEdition?.editionDate
    ? new Date(currentEdition.editionDate)
    : new Date();

  const formattedDate = editionDateObj.toLocaleDateString(
    locale === "gu" ? "gu-IN" : "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const pageCountDisplay = currentEdition?.pageCount || 12;

  return (
    <div className="container-reader py-6 sm:py-8 space-y-8">
      {/* ========================================================================= */}
      {/* 1. PROFESSIONAL EDITORIAL MASTHEAD BANNER                                 */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#016BB7] px-3.5 py-1 text-xs font-bold text-white shadow-2xs">
                <Newspaper className="h-3.5 w-3.5" />
                <span>{locale === "gu" ? "જન્મભૂમિ ઇ-પેપર" : "JANMABHOOMI E-PAPER"}</span>
              </span>
              <span className="rounded-full bg-blue-50 border border-[#016BB7]/20 px-3 py-1 text-xs font-bold text-[#016BB7]">
                {locale === "gu" ? "મુંબઈ મુખ્ય આવૃત્તિ" : "Mumbai Main Edition"}
              </span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
                {locale === "gu" ? "સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશન (સ્થાપના ૧૯૩૪)" : "Saurashtra Trust (Est. 1934)"}
              </span>
            </div>

            {/* Masthead Headline */}
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-gujarati">
              {locale === "gu"
                ? "જન્મભૂમિ દૈનિક અખબાર — અધિકૃત ડિજિટલ પ્રિન્ટ પ્રતિકૃતિ"
                : "Janmabhoomi Daily — Official Digital Broadsheet Replica"}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {locale === "gu"
                ? "વાસ્તવિક અખબાર વાંચવાનો અજોડ અનુભવ. સંપૂર્ણ બ્રોડશીટ પૃષ્ઠો, અગ્રલેખ, વેપાર, રમતગમત અને મુંબઈ-ગુજરાતના વિશ્વસનીય સમાચારો દરરોજ તમારા ડિવાઇસ પર."
                : "Experience the authentic print broadsheet on any device. Continuous high-resolution reading, trusted Saurashtra Trust journalism, and complete supplements."}
            </p>

            {/* Dynamic Edition Metadata Bar */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#016BB7]" />
                <span className="text-slate-400">{locale === "gu" ? "તારીખ:" : "Date:"}</span>
                <strong className="text-slate-800">{formattedDate}</strong>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#016BB7]" />
                <span className="text-slate-400">{locale === "gu" ? "કુલ પૃષ્ઠો:" : "Pages:"}</span>
                <strong className="text-slate-800">
                  {pageCountDisplay} {locale === "gu" ? "બ્રોડશીટ પાના" : "Broadsheet Pages"}
                </strong>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">
                  {locale === "gu" ? "પ્રથમ ૨ પાના વિનામૂલ્યે" : "Pages 1–2 Free Preview"}
                </span>
              </span>
            </div>
          </div>

          {/* Quick Paywall CTA Box */}
          <div className="lg:w-80 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#016BB7]">
              <Lock className="h-4 w-4 text-[#016BB7]" />
              <span>{locale === "gu" ? "સબ્સ્ક્રિપ્શન પ્લાન" : "Subscription Access"}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {locale === "gu"
                ? "સંપૂર્ણ અખબાર વાંચવા, તમામ અગ્રલેખો અને આર્કાઇવ માટે વાર્ષિક અથવા માસિક સબ્સ્ક્રિપ્શન પ્લાન પસંદ કરો."
                : "Full 12-page broadsheet reading, editorials, and special editions are available to subscribers."}
            </p>
            <a
              href="#subscription-plans"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#016BB7] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#016BB7]/90 transition-colors shadow-xs"
            >
              <span>{locale === "gu" ? "પ્લાન જુઓ અને સબ્સ્ક્રાઇબ કરો" : "View Plans & Pricing"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE PUBLIC E-PAPER READER CENTERPIECE                          */}
      {/* ========================================================================= */}
      <section aria-label="Janmabhoomi E-Paper Reader">
        <PublicEpaperReader lang={locale} initialPublicationId="all" />
      </section>

      {/* ========================================================================= */}
      {/* 3. CLEAN SUBSCRIPTION PLANS SECTION (JANMABHOOMI ONLY)                    */}
      {/* ========================================================================= */}
      <section id="subscription-plans" aria-labelledby="plans-heading" className="pt-4">
        <div className="mb-6 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[#016BB7]" />
            <h2
              id="plans-heading"
              className="text-xl sm:text-2xl font-extrabold text-slate-900 font-gujarati"
            >
              {locale === "gu"
                ? "જન્મભૂમિ ડિજિટલ સબ્સ્ક્રિપ્શન યોજનાઓ"
                : "Janmabhoomi Digital Subscription Plans"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {locale === "gu"
              ? "સૌરાષ્ટ્ર ટ્રસ્ટના વાચકો માટે સત્તાવાર ડિજિટલ ઇ-પેપર સબ્સ્ક્રિપ્શન પેકેજ."
              : "Official digital subscription packages for Janmabhoomi and Pravasi readers."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              titleEn: "Monthly Digital Reader",
              titleGu: "માસિક ડિજિટલ પ્લાન",
              price: "₹100",
              periodEn: "per month",
              periodGu: "દર મહિને",
              durationEn: "30 Days Full E-Paper Access",
              durationGu: "૩૦ દિવસ સંપૂર્ણ ઇ-પેપર ઍક્સેસ",
              badgeEn: "INDIVIDUAL",
              badgeGu: "માસિક વાચક",
              features: [
                { en: "Full 12-page daily broadsheet edition", gu: "સંપૂર્ણ ૧૨ પાનાની દૈનિક બ્રોડશીટ આવૃત્તિ" },
                { en: "In-depth editorials & lead articles", gu: "સંપૂર્ણ અગ્રલેખ અને વિશેષ અહેવાલો" },
                { en: "Morning delivery from 5:00 AM", gu: "દરરોજ વહેલી સવારે ૫:૦૦ વાગ્યે ઉપલબ્ધ" },
              ],
            },
            {
              titleEn: "Annual Janmabhoomi Broadsheet",
              titleGu: "વાર્ષિક જન્મભૂમિ ઇ-પેપર",
              price: "₹800",
              periodEn: "per year",
              periodGu: "વાર્ષિક",
              durationEn: "365 Days + 30-Day Archive Access",
              durationGu: "૩૬૫ દિવસ + ૩૦ દિવસ આર્કાઇવ એક્સેસ",
              badgeEn: "RECOMMENDED",
              badgeGu: "ભલામણ કરેલ",
              highlighted: true,
              features: [
                { en: "Complete Janmabhoomi daily editions", gu: "જન્મભૂમિ દૈનિક તમામ અખબારના પાના" },
                { en: "Sunday Pravasi special editions included", gu: "રવિવારીય પ્રવાસી વિશેષ આવૃત્તિઓ સામેલ" },
                { en: "Full digital archive access (last 30 days)", gu: "છેલ્લા ૩૦ દિવસનું આર્કાઇવ એક્સેસ" },
                { en: "High-resolution zoom & offline print view", gu: "હાઇ-રિઝોલ્યુશન ઝૂમ અને ડાઉનલોડ" },
              ],
            },
            {
              titleEn: "Janmabhoomi Pravasi Weekend",
              titleGu: "જન્મભૂમિ પ્રવાસી વીકેન્ડ પ્લાન",
              price: "₹400",
              periodEn: "per year",
              periodGu: "વાર્ષિક",
              durationEn: "Sunday Weekly + Special Supplements",
              durationGu: "સાપ્તાહિક રવિવાર + તમામ પૂર્તિઓ",
              badgeEn: "WEEKEND SPECIAL",
              badgeGu: "સાપ્તાહિક વિશેષ",
              features: [
                { en: "Sunday Janmabhoomi Pravasi edition", gu: "રવિવારીય જન્મભૂમિ પ્રવાસી મુખ્ય આવૃત્તિ" },
                { en: "All weekly literary & lifestyle supplements", gu: "તમામ સાહિત્યિક અને સાંસ્કૃતિક પૂર્તિઓ" },
                { en: "Cross-platform reading on web, tablet & mobile", gu: "વેબ, ટેબ્લેટ અને મોબાઇલ પર સુલભ" },
              ],
            },
          ].map((plan) => (
            <div
              key={plan.titleEn}
              className={`rounded-2xl p-6 flex flex-col justify-between bg-white transition-all ${
                plan.highlighted
                  ? "border-2 border-[#016BB7] shadow-lg ring-2 ring-[#016BB7]/10"
                  : "border border-slate-200 shadow-xs hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      plan.highlighted
                        ? "bg-[#016BB7] text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {locale === "gu" ? plan.badgeGu : plan.badgeEn}
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-[11px] text-slate-500 ml-1">
                      {locale === "gu" ? plan.periodGu : plan.periodEn}
                    </span>
                  </div>
                </div>

                <h3 className="mt-3 text-lg font-extrabold text-slate-900 font-gujarati">
                  {locale === "gu" ? plan.titleGu : plan.titleEn}
                </h3>
                <p className="mt-1 text-xs text-[#016BB7] font-semibold">
                  {locale === "gu" ? plan.durationGu : plan.durationEn}
                </p>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{locale === "gu" ? feat.gu : feat.en}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <Link
                  href={`/${locale}/contact?topic=subscription`}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors ${
                    plan.highlighted
                      ? "bg-[#016BB7] text-white hover:bg-[#016BB7]/90 shadow-xs"
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>
                    {locale === "gu"
                      ? "સબ્સ્ક્રિપ્શન પૂછપરછ અને નોંધણી"
                      : "Subscribe / Register Interest"}
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
