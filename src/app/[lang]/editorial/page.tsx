import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Feather, BookOpen, Archive } from "lucide-react";
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
  const dict = getDictionary(locale);
  return {
    title: `${dict.nav.editorial} (અગ્રલેખ)`,
    description: dict.home.editorialSectionTitle,
  };
}

export default async function EditorialListingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  const { todaysEditorial, previousEditorials } =
    await newsDataProvider.getEditorials();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#174F73] pb-4">
        <div className="flex items-center gap-3">
          <span className="font-gujarati inline-flex items-center gap-1.5 rounded bg-[#174F73] px-3.5 py-1.5 text-lg font-extrabold text-white">
            <Feather className="h-4 w-4 text-[#C59B4B]" />
            <span>અગ્રલેખ</span>
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292725]">
              {dict.home.editorialSectionTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#292725]/70">
              {locale === "gu"
                ? "જન્મભૂમિ સંપાદકીય મંડળના સત્તાવાર અગ્રલેખ અને વિચારો"
                : "Institutional editorials (અગ્રલેખ) and analytical columns."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge variant="gold" />
          <Link
            href={`/${locale}/editorial/archive`}
            className="inline-flex items-center gap-1.5 rounded bg-[#174F73] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#103A55]"
          >
            <Archive className="h-4 w-4 text-[#C59B4B]" />
            <span>{dict.home.editorialArchiveCta}</span>
          </Link>
        </div>
      </div>

      {/* Today's Featured Editorial */}
      <article className="mb-8 rounded-md border-2 border-[#C59B4B] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="rounded-xs bg-[#174F73] px-3 py-0.5 text-xs font-bold uppercase text-white">
            {dict.home.todaysEditorial} • અગ્રલેખ
          </span>
          <span className="text-xs font-semibold text-[#292725]/65">
            {todaysEditorial.publishedDate} • Page {todaysEditorial.epaperPageNumber}
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292725] leading-snug">
          {getLocalizedText(todaysEditorial.title, locale)}
        </h2>

        <p className="mt-3 text-base font-medium text-[#174F73]">
          {getLocalizedText(todaysEditorial.excerpt, locale)}
        </p>

        <div className="mt-4 space-y-3 border-l-2 border-[#C59B4B] pl-4 text-sm sm:text-base text-[#292725]/85 leading-relaxed">
          {todaysEditorial.teaserParagraphs[locale]?.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-[#292725]/12 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#292725]">
            {getLocalizedText(todaysEditorial.author, locale)} —{" "}
            {getLocalizedText(todaysEditorial.authorRole, locale)}
          </span>

          <Link
            href={`/${locale}/epaper?page=${todaysEditorial.epaperPageNumber}`}
            className="inline-flex items-center gap-2 rounded bg-[#174F73] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#103A55]"
          >
            <BookOpen className="h-4 w-4 text-[#C59B4B]" />
            <span>{dict.home.readInEpaper}</span>
          </Link>
        </div>
      </article>

      {/* Previous Editorials */}
      <h2 className="text-xl font-extrabold text-[#174F73] mb-4">
        {dict.home.previousEditorials}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {previousEditorials.map((ed) => (
          <article
            key={ed.id}
            className="rounded-md border border-[#292725]/15 bg-white p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-gujarati font-bold text-[#174F73]">
                  {ed.tag} • {getLocalizedText(ed.authorRole, locale)}
                </span>
                <span className="text-[#292725]/60">{ed.publishedDate}</span>
              </div>
              <h3 className="text-lg font-bold text-[#292725] leading-snug">
                {getLocalizedText(ed.title, locale)}
              </h3>
              <p className="mt-2 text-sm text-[#292725]/75 leading-relaxed">
                {getLocalizedText(ed.excerpt, locale)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#292725]/10 flex items-center justify-between text-xs">
              <span className="font-medium text-[#292725]/70">
                {getLocalizedText(ed.author, locale)}
              </span>
              <Link
                href={`/${locale}/epaper?page=${ed.epaperPageNumber}`}
                className="font-bold text-[#174F73] hover:underline"
              >
                {dict.home.readInEpaper} →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
