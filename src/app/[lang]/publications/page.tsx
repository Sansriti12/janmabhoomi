import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Newspaper,
  BookOpen,
  Calendar,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Award,
  ChevronRight,
  Globe2,
  Sparkles,
} from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getAllPublications } from "@/lib/data/config/publications";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const isGu = locale === "gu";

  return {
    title: isGu
      ? "સૌરાષ્ટ્ર ટ્રસ્ટના તમામ પ્રકાશનો — જન્મભૂમિ ગ્રુપ"
      : "All Publications — Janmabhoomi Group & Saurashtra Trust",
    description: isGu
      ? "જન્મભૂમિ, જન્મભૂમિ પ્રવાસી, ફૂલછાબ, કચ્છમિત્ર, વ્યાપાર, પંચાંગ અને કવિતા સહિત સૌરાષ્ટ્ર ટ્રસ્ટના તમામ ૮ ઐતિહાસિક પ્રકાશનોની અધિકૃત વિગતો."
      : "Complete official directory of all 8 historic publications, periodicals, and almanacs published by the Saurashtra Trust network since 1931.",
  };
}

export default async function PublicationsDirectoryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const isGu = locale === "gu";
  const publications = getAllPublications();

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="container-wide space-y-8 sm:space-y-12">
        {/* BREADCRUMB NAVIGATION */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
          <Link href={`/${locale}`} className="hover:text-[#016BB7] transition-colors">
            {isGu ? "મુખ્ય પૃષ્ઠ" : "Home"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-slate-800">
            {isGu ? "સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશનો" : "All Publications"}
          </span>
        </nav>

        {/* HERO MASTHEAD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B3558] via-[#016BB7] to-[#015a99] p-6 sm:p-10 md:p-12 text-white shadow-xl">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold backdrop-blur-md border border-white/20">
              <ShieldCheck className="h-4 w-4 text-sky-200" />
              <span>{isGu ? "સૌરાષ્ટ્ર ટ્રસ્ટ પબ્લિકેશન નેટવર્ક" : "Saurashtra Trust Media Network"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {isGu
                ? "સૌરાષ્ટ્ર ટ્રસ્ટના ૮ ઐતિહાસિક સમાચારપત્રો અને સામાયિકો"
                : "Saurashtra Trust — Complete Publication Portfolio"}
            </h1>

            <p className="text-sm sm:text-base text-sky-100 max-w-3xl leading-relaxed">
              {isGu
                ? "૧૯૩૧માં સ્વાતંત્ર્ય સેનાની શ્રી અમૃતલાલ શેઠ દ્વારા સ્થાપિત સૌરાષ્ટ્ર ટ્રસ્ટ આજે જન્મભૂમિ, જન્મભૂમિ પ્રવાસી, ફૂલછાબ, કચ્છમિત્ર, વ્યાપાર, પંચાંગ અને કવિતા થકી કરોડો વાચકોને વિશ્વસનીય અને તટસ્થ પત્રકારત્વ પૂરું પાડે છે."
                : "Founded in 1931 by veteran freedom fighter Shri Amritlal Sheth, the Saurashtra Trust publishes 8 distinguished broadsheets, financial periodicals, and literary journals, reaching millions of readers worldwide with unwavering integrity."}
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-sky-150">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-sky-300" />
                {isGu ? "સ્થાપના: ૧૯૩૧થી અવિરત" : "Serving Readers Since 1931"}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-sky-300" />
                {isGu ? "મુંબઈ, ગુજરાત, સમગ્ર ભારત અને વિદેશ" : "Mumbai, Gujarat, Pan-India & Diaspora"}
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-sky-300" />
                {isGu ? "૮ અધિકૃત પ્રકાશન શૃંખલા" : "8 Official Print & Digital Titles"}
              </span>
            </div>
          </div>

          {/* Decorative background watermark */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none select-none">
            <Newspaper className="h-80 w-80 text-white" />
          </div>
        </div>

        {/* PUBLICATIONS GRID (ALL 8 PUBLICATIONS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {publications.map((pub) => {
            const isJanmabhoomi = pub.id === "pub-janmabhoomi";
            const isExternal = pub.websiteUrl.startsWith("http");
            const isPanchang = pub.slug === "panchang";
            const isKavita = pub.slug === "kavita";

            const primaryHref = isJanmabhoomi
              ? `/${locale}`
              : isPanchang
              ? `/${locale}/panchang`
              : isKavita
              ? `/${locale}/about#kavita`
              : isExternal
              ? pub.websiteUrl
              : `/${locale}`;

            const epaperHref = `/${locale}/epaper?publication=${pub.id}`;

            return (
              <div
                key={pub.id}
                className={`flex flex-col justify-between rounded-2xl bg-white border p-6 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                  isJanmabhoomi
                    ? "border-[#016BB7] ring-2 ring-[#016BB7]/10 shadow-md"
                    : "border-slate-200 hover:border-[#016BB7]/40 shadow-xs"
                }`}
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isJanmabhoomi
                          ? "bg-[#016BB7] text-white"
                          : "bg-blue-50 text-[#016BB7] border border-[#016BB7]/20"
                      }`}
                    >
                      {isJanmabhoomi
                        ? isGu
                          ? "મુખ્ય દૈનિક અખબાર"
                          : "Flagship Daily"
                        : pub.frequency[locale] || pub.frequency.gu}
                    </span>

                    <span className="text-[11px] font-semibold text-slate-400">
                      {isGu ? `સ્થાપના ${pub.establishedYear}` : `Est. ${pub.establishedYear}`}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h2 className="text-xl font-black text-slate-900 group-hover:text-[#016BB7] transition-colors">
                      {pub.name[locale] || pub.name.gu}
                    </h2>
                    <p className="text-xs font-semibold text-[#016BB7] mt-0.5">
                      {pub.tagline[locale] || pub.tagline.gu}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{isGu ? "આવૃત્તિ પ્રકાર:" : "Frequency:"}</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {pub.frequency[locale] || pub.frequency.gu}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{isGu ? "પ્રસાર પ્રદેશ:" : "Region:"}</span>
                      <span className="font-semibold text-slate-800 text-right">
                        {pub.region[locale] || pub.region.gu}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-5 mt-4 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Read E-Paper */}
                    <Link
                      href={epaperHref}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-[#016BB7] py-2 px-3 text-xs font-bold text-white hover:bg-[#015a99] transition-colors shadow-2xs"
                    >
                      <Newspaper className="h-3.5 w-3.5" />
                      <span>{isGu ? "ઇ-પેપર" : "E-Paper"}</span>
                    </Link>

                    {/* View Portal / Details */}
                    {isExternal ? (
                      <a
                        href={pub.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#016BB7] hover:border-[#016BB7]/30 transition-colors"
                      >
                        <span>{isGu ? "વેબસાઇટ" : "Website"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link
                        href={primaryHref}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-[#016BB7] hover:border-[#016BB7]/30 transition-colors"
                      >
                        <span>{isGu ? "વિગતો" : "Details"}</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SAURASHTRA TRUST FOOTER NOTICE */}
        <div className="rounded-2xl border border-[#016BB7]/20 bg-white p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-base font-bold text-slate-900">
              {isGu
                ? "ઐતિહાસિક આર્કાઇવ અને જૂના અંકોની પૂછપરછ"
                : "Historical Archive & Research Inquiries"}
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl">
              {isGu
                ? "૧૯૩૪થી આજ સુધીના તમામ પ્રકાશનોના જૂના અખબારો, અહેવાલો અને સાહિત્યિક દસ્તાવેજો માટે અમારા આર્કાઇવ વિભાગનો સંપર્ક કરો."
                : "Submit research and archival requests for published editions, historical microfilms, and articles spanning 1934 to 2026."}
            </p>
          </div>
          <Link
            href={`/${locale}/archive-enquiry`}
            className="shrink-0 rounded-xl bg-slate-900 hover:bg-[#016BB7] px-5 py-2.5 text-xs font-bold text-white transition-colors shadow-xs"
          >
            {isGu ? "આર્કાઇવ પૂછપરછ ફોર્મ" : "Submit Archive Inquiry"}
          </Link>
        </div>
      </div>
    </div>
  );
}
