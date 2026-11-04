import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Archive, BookOpen, ArrowLeft } from "lucide-react";
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
    title: `${dict.home.editorialArchiveCta} | અગ્રલેખ`,
  };
}

export default async function EditorialArchivePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const { todaysEditorial, previousEditorials } =
    await newsDataProvider.getEditorials();
  const allEditorials = [todaysEditorial, ...previousEditorials];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4">
        <Link
          href={`/${locale}/editorial`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#174F73] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{dict.nav.editorial} (અગ્રલેખ)</span>
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#174F73] pb-3.5">
        <div className="flex items-center gap-2.5">
          <Archive className="h-6 w-6 text-[#174F73]" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292725]">
            {dict.home.editorialArchiveCta} (અગ્રલેખ આર્કાઇવ)
          </h1>
        </div>
        <DemoBadge variant="gold" />
      </div>

      <div className="space-y-4">
        {allEditorials.map((ed) => (
          <article
            key={ed.id}
            className="rounded-md border border-[#292725]/15 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-gujarati font-bold text-[#174F73]">
                  {ed.tag}
                </span>
                <span>•</span>
                <span className="font-semibold text-[#292725]/65">
                  {ed.publishedDate}
                </span>
                <span>•</span>
                <span className="text-[#292725]/65">
                  {getLocalizedText(ed.author, locale)}
                </span>
              </div>

              <h2 className="text-lg font-bold text-[#292725]">
                {getLocalizedText(ed.title, locale)}
              </h2>

              <p className="text-xs sm:text-sm text-[#292725]/75">
                {getLocalizedText(ed.excerpt, locale)}
              </p>
            </div>

            <Link
              href={`/${locale}/epaper?page=${ed.epaperPageNumber}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded bg-[#174F73] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#103A55]"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#C59B4B]" />
              <span>{dict.home.readInEpaper}</span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
