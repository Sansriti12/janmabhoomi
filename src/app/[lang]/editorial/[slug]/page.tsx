import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Feather,
  BookOpen,
  ArrowLeft,
  Share2,
  Mail,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Quote,
  Clock,
  Calendar,
} from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { getLocalizedText } from "@/lib/data/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const editorial = await newsDataProvider.getEditorialBySlug(slug);

  if (!editorial) {
    return { title: "Editorial | Janmabhoomi" };
  }

  const title = getLocalizedText(editorial.title, locale);
  const excerpt = getLocalizedText(editorial.excerpt, locale);

  return {
    title: `${title} | Janmabhoomi Editorial`,
    description: excerpt,
  };
}

export default async function EditorialDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const dict = getDictionary(locale);
  const isGu = locale === "gu";

  const editorial = await newsDataProvider.getEditorialBySlug(slug);
  if (!editorial) {
    notFound();
  }

  const paragraphs =
    editorial.teaserParagraphs[locale] ||
    editorial.teaserParagraphs.gu ||
    [getLocalizedText(editorial.excerpt, locale)];

  const firstLetter = paragraphs[0]?.charAt(0) || "સ";
  const restOfFirstParagraph = paragraphs[0]?.slice(1) || "";

  return (
    <main className="bg-[#FAF8F5] min-h-screen py-8 sm:py-12 text-slate-800 font-serif">
      <div className="mx-auto max-w-[740px] px-4 sm:px-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${locale}/editorial`}
            className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-[#016BB7] hover:text-[#015a99] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isGu ? "તમામ અગ્રલેખ પર પાછા ફરો" : "Back to All Editorials"}</span>
          </Link>
        </div>

        {/* 1. CLEAR "EDITORIAL / THE EDITORIAL BOARD" PROMINENT KICKER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 font-sans">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#016BB7] px-3 py-1 text-xs font-black tracking-wider text-white uppercase shadow-xs">
              <Feather className="h-3.5 w-3.5" />
              <span>{isGu ? "સંપાદકીય વિચાર • અગ્રલેખ" : "The Editorial Board • Opinion"}</span>
            </span>
            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">
              {isGu ? "સત્તાવાર મત" : "Official View"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#016BB7]" />
              {editorial.publishedDate}
            </span>
            <span>•</span>
            <span>{isGu ? "પાનું ૮" : "Page 8 Broadsheet"}</span>
          </div>
        </div>

        {/* Editorial Headline */}
        <header className="mt-6 mb-6">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black leading-[1.2] text-slate-900 tracking-tight font-gujarati">
            {getLocalizedText(editorial.title, locale)}
          </h1>

          <p className="mt-4 text-lg sm:text-xl font-normal text-slate-700 leading-relaxed italic border-l-3 border-[#016BB7] pl-4">
            {getLocalizedText(editorial.excerpt, locale)}
          </p>
        </header>

        {/* 2. AUTHOR / BOARD ATTRIBUTION BOX */}
        <div className="my-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#016BB7]/10 border border-[#016BB7]/20 flex items-center justify-center text-[#016BB7] font-black text-sm">
              JB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">
                  {getLocalizedText(editorial.author, locale)}
                </span>
                <ShieldCheck className="h-4 w-4 text-[#016BB7]" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {isGu
                  ? "સૌરાષ્ટ્ર ટ્રસ્ટ - જન્મભૂમિ સંપાદકીય નીતિ મુજબ પ્રકાશિત"
                  : "Published in accordance with Saurashtra Trust Editorial Charter"}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/about`}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#016BB7] hover:underline"
          >
            <span>{isGu ? "સંપાદકીય નીતિ" : "Editorial Policy"}</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* 3. CONTEXT / "THE NEWS BEHIND THIS VIEW" CALLOUT BOX */}
        <div className="my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50/60 p-4 font-sans text-xs sm:text-sm text-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 uppercase tracking-wide text-[11px] mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{isGu ? "આ વિચાર પાછળના સમાચાર (News Context)" : "The News Behind This View"}</span>
          </div>
          <p className="text-slate-700 leading-relaxed font-gujarati">
            {isGu
              ? "આ અગ્રલેખ તાજેતરમાં પશ્ચિમ ભારતમાં મોટા ઈન્ફ્રાસ્ટ્રક્ચર પ્રોજેક્ટ્સ અને જાહેર પરિવહન સંબંધિત લેવાયેલા વહીવટી નિર્ણયોના સંદર્ભમાં પ્રસ્તુત કરવામાં આવ્યો છે."
              : "This institutional editorial responds to recent administrative directives regarding public transit infrastructure, civic audits, and urban coastal connectivity across Maharashtra and Gujarat."}
          </p>
        </div>

        {/* 4. SINGLE-COLUMN LONG-FORM READING LAYOUT WITH DROP CAP & TYPOGRAPHY */}
        <article className="mt-8 space-y-6 text-[18px] sm:text-[19px] leading-[1.8] text-slate-800">
          {/* First Paragraph with Classic Newspaper Drop Cap */}
          <p className="font-gujarati">
            <span className="float-left text-5xl sm:text-6xl font-black text-[#016BB7] leading-none pr-3 pt-1 font-serif select-none">
              {firstLetter}
            </span>
            {restOfFirstParagraph}
          </p>

          {/* Remaining Paragraphs */}
          {paragraphs.slice(1, 3).map((para, idx) => (
            <p key={idx} className="font-gujarati">
              {para}
            </p>
          ))}

          {/* 5. EDITORIAL PULL-QUOTE (HIGHLIGHTED KEY ARGUMENT) */}
          <div className="my-8 rounded-2xl bg-gradient-to-br from-[#016BB7]/10 to-[#016BB7]/5 border-y-2 border-[#016BB7] p-6 text-center">
            <Quote className="h-8 w-8 text-[#016BB7]/40 mx-auto mb-2 rotate-180" />
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-snug font-gujarati italic">
              {isGu
                ? "“૯ દાયકાથી વધુ સમયની સાક્ષી પૂરતી જન્મભૂમિની પરંપરા યાદ અપાવે છે કે આધુનિક નિર્માણ સાથે નાગરિક સુરક્ષા અને પારદર્શિતા સર્વોપરી હોવી જોઈએ.”"
                : "“Modern structural advancement must walk hand in hand with rigorous civic safeguards and transparent accountability to the grassroots citizen.”"}
            </p>
            <span className="block mt-3 text-xs font-sans font-bold text-[#016BB7] uppercase tracking-wider">
              {isGu ? "— જન્મભૂમિ સંપાદકીય નિષ્કર્ષ" : "— Janmabhoomi Editorial Principle"}
            </span>
          </div>

          {paragraphs.slice(3).map((para, idx) => (
            <p key={idx + 3} className="font-gujarati">
              {para}
            </p>
          ))}
        </article>

        {/* E-Paper Read Broadsheet Link */}
        <div className="my-8 rounded-xl bg-blue-50 border border-blue-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-[#016BB7] shrink-0" />
            <div>
              <span className="text-sm font-bold text-slate-900">
                {isGu ? "આ અગ્રલેખ આજના અખબારના પાના ૮ પર વાંચો" : "Read this editorial in today's E-Paper"}
              </span>
              <p className="text-xs text-slate-600">
                {isGu ? "અધિકૃત ૧૨ પાનાની ડિજિટલ પ્રતિકૃતિ" : "Official 12-page digital replica"}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/epaper?page=${editorial.epaperPageNumber || 8}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#016BB7] text-white text-xs font-bold hover:bg-[#015a99] transition-colors shrink-0 shadow-xs"
          >
            <span>{isGu ? "ઇ-પેપરમાં ખોલો" : "Open in E-Paper"}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 6. COUNTER-PERSPECTIVE / "THE OTHER SIDE" MODULE */}
        <section className="my-10 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs font-sans">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {isGu ? "સામા વિચાર / વિશ્લેષણ (The Other Side)" : "Counter-Perspective / Reader Views"}
            </h3>
          </div>
          <p className="text-xs text-slate-600 mb-3 font-gujarati">
            {isGu
              ? "લોકતાંત્રિક ચર્ચામાં બંને પાસાંનું મહત્વ છે. આ વિષય પર વાચકોના પત્રો અને પ્રતિભાવો નીચે મુજબ છે:"
              : "In healthy democratic discourse, diverse perspectives enrich understanding. Explore letters and columns examining alternate facets of this policy."}
          </p>
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-1.5">
            <span className="text-xs font-bold text-slate-800">
              {isGu
                ? "વાચક વિચાર: પરિવહન યોજનાઓમાં ઝડપ અને વિકાસ પણ મહત્વપૂર્ણ છે"
                : "Reader Forum: Balancing environmental timelines with economic growth"}
            </span>
            <p className="text-[11px] text-slate-500">
              {isGu ? "પ્રત્યુત્તર: વાચક મંડળ, મુંબઈ • જન્મભૂમિ વાચક મંચ" : "Contributor: Civic Trade Chamber • Reader Letters Desk"}
            </p>
          </div>
        </section>

        {/* 7. READER RESPONSE / "SEND A LETTER TO THE EDITOR" FOOTER */}
        <footer className="my-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 shadow-lg font-sans">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
                <MessageSquare className="h-4 w-4" />
                <span>{isGu ? "વાચક પ્રતિભાવ (Letter to the Editor)" : "Letter to the Editor"}</span>
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-gujarati">
                {isGu ? "આ અગ્રલેખ વિશે આપનો અભિપ્રાય જણાવો" : "Have your say on this editorial"}
              </h3>
              <p className="text-xs text-slate-300 max-w-md font-gujarati">
                {isGu
                  ? "જન્મભૂમિ વાચકોના વિચારોને હંમેશાં પ્રાધાન્ય આપે છે. પસંદગીના પત્રો દૈનિક અખબારના વિચાર પાના પર પ્રકાશિત થશે."
                  : "Letters reacting to this editorial are published on the Letters page of Janmabhoomi. Share your reasoned views with the editors."}
              </p>
            </div>

            <a
              href={`mailto:letters@janmabhoomi.in?subject=Letter to the Editor: ${encodeURIComponent(
                getLocalizedText(editorial.title, "en")
              )}`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#016BB7] hover:bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-md transition-all shrink-0 cursor-pointer"
            >
              <Mail className="h-4 w-4" />
              <span>{isGu ? "પત્ર મોકલો (Send Letter)" : "Send a Letter"}</span>
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
