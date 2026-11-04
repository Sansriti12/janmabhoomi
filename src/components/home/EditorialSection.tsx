import React from "react";
import Link from "next/link";
import { Feather, BookOpen, Archive, ArrowRight } from "lucide-react";
import { EditorialArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { DemoBadge } from "@/components/shared/DemoBadge";

interface EditorialSectionProps {
  todaysEditorial: EditorialArticle;
  previousEditorials: EditorialArticle[];
  lang: Locale;
  dict: Dictionary;
}

/**
 * Section 6 – Editorial and Opinions
 * Retains the iconic Gujarati editorial identity: અગ્રલેખ.
 * Includes Today's Editorial, Editorial headline & preview, Previous editorials, and Editorial Archive CTA.
 */
export function EditorialSection({
  todaysEditorial,
  previousEditorials,
  lang,
  dict,
}: EditorialSectionProps) {
  return (
    <section
      aria-labelledby="editorial-section-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-[#292725]/10"
    >
      <div className="rounded-md border border-[#C59B4B]/45 bg-[#FAF8F3] p-5 sm:p-7">
        {/* Header Bar with retained Gujarati identity અગ્રલેખ */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#174F73] pb-3.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-gujarati inline-flex items-center gap-1.5 rounded bg-[#174F73] px-3 py-1 text-base sm:text-lg font-extrabold text-white tracking-wide">
              <Feather className="h-4 w-4 text-[#C59B4B]" />
              <span>અગ્રલેખ</span>
            </span>
            <div>
              <h2
                id="editorial-section-heading"
                className="text-xl sm:text-2xl font-extrabold text-[#292725]"
              >
                {dict.home.editorialSectionTitle}
              </h2>
            </div>
            <DemoBadge variant="gold" />
          </div>

          <Link
            href={`/${lang}/editorial/archive`}
            className="inline-flex items-center gap-1.5 rounded border border-[#174F73] bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-[#174F73] hover:bg-[#174F73] hover:text-white transition-colors shrink-0"
          >
            <Archive className="h-4 w-4" />
            <span>{dict.home.editorialArchiveCta}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left (7 Cols): TODAY'S EDITORIAL */}
          <article className="lg:col-span-7 rounded-md border border-[#292725]/15 bg-white p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-xs bg-[#C59B4B]/20 border border-[#C59B4B] px-2.5 py-0.5 text-xs font-bold text-[#292725]">
                    {dict.home.todaysEditorial}
                  </span>
                  <span className="font-gujarati text-xs font-bold text-[#174F73]">
                    • {todaysEditorial.tag}
                  </span>
                </div>
                <span className="text-xs text-[#292725]/60 font-medium">
                  {todaysEditorial.publishedDate}
                </span>
              </div>

              <Link
                href={`/${lang}/editorial`}
                className="group block"
              >
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#292725] group-hover:text-[#174F73] leading-snug transition-colors">
                  {getLocalizedText(todaysEditorial.title, lang)}
                </h3>
              </Link>

              <p className="mt-3 text-sm sm:text-base text-[#292725]/85 leading-relaxed font-medium">
                {getLocalizedText(todaysEditorial.excerpt, lang)}
              </p>

              <div className="mt-3 pl-3.5 border-l-2 border-[#C59B4B] text-xs sm:text-sm text-[#292725]/75 space-y-2">
                {todaysEditorial.teaserParagraphs[lang]?.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#292725]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-[#292725]">
                  {getLocalizedText(todaysEditorial.author, lang)}
                </p>
                <p className="text-[#292725]/60">
                  {getLocalizedText(todaysEditorial.authorRole, lang)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/${lang}/editorial`}
                  className="font-bold text-[#174F73] hover:underline"
                >
                  {dict.home.readPreview} →
                </Link>
                <Link
                  href={`/${lang}/epaper?page=${todaysEditorial.epaperPageNumber}`}
                  className="inline-flex items-center gap-1.5 rounded bg-[#174F73] px-3 py-1.5 font-semibold text-white hover:bg-[#103A55]"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#C59B4B]" />
                  <span>{dict.home.readInEpaper}</span>
                </Link>
              </div>
            </div>
          </article>

          {/* Right (5 Cols): PREVIOUS EDITORIALS & OPINIONS */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-md border border-[#292725]/15 bg-white p-5">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#174F73] pb-2.5 mb-3.5 border-b border-[#292725]/12">
                {dict.home.previousEditorials}
              </h3>

              <div className="divide-y divide-[#292725]/10">
                {previousEditorials.map((item) => (
                  <article key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-gujarati font-bold text-[#174F73]">
                        {item.tag} • {getLocalizedText(item.authorRole, lang)}
                      </span>
                      <span className="text-[#292725]/55">
                        {item.publishedDate}
                      </span>
                    </div>

                    <Link
                      href={`/${lang}/editorial/archive`}
                      className="group block"
                    >
                      <h4 className="text-base font-bold text-[#292725] group-hover:text-[#174F73] leading-snug transition-colors">
                        {getLocalizedText(item.title, lang)}
                      </h4>
                    </Link>

                    <p className="mt-1.5 text-xs text-[#292725]/75 line-clamp-2 leading-relaxed">
                      {getLocalizedText(item.excerpt, lang)}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#292725]/10 flex items-center justify-between">
              <Link
                href={`/${lang}/editorial`}
                className="text-xs font-bold text-[#174F73] hover:underline"
              >
                {dict.nav.editorial} (અગ્રલેખ)
              </Link>
              <Link
                href={`/${lang}/editorial/archive`}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#174F73] hover:underline"
              >
                <span>{dict.home.editorialArchiveCta}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
