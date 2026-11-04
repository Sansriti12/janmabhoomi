import React from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowUpRight } from "lucide-react";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { DemoBadge } from "@/components/shared/DemoBadge";

interface LeadStoryHeroProps {
  leadStory: NewsArticle;
  subLeadStories: NewsArticle[];
  headlineBriefs: NewsArticle[];
  lang: Locale;
  dict: Dictionary;
}

/**
 * Section 2 – Main Lead Story (Newspaper Hero Layout)
 * Directly implements the handwritten layout diagram from Reference Image 2:
 * - Left (6 cols): One large lead story with prominent image & strongest visual emphasis
 * - Middle (3 cols): Two smaller visual news stories stacked vertically
 * - Right (3 cols): Compact list of additional headlines
 */
export function LeadStoryHero({
  leadStory,
  subLeadStories,
  headlineBriefs,
  lang,
  dict,
}: LeadStoryHeroProps) {
  const leadTitle = getLocalizedText(leadStory.title, lang);
  const leadSubtitle = leadStory.subtitle
    ? getLocalizedText(leadStory.subtitle, lang)
    : undefined;
  const leadSummary = getLocalizedText(leadStory.summary, lang);

  return (
    <section
      aria-label={dict.home.leadStoryBadge}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* COLUMN 1 (6 Cols on Desktop): ONE LARGE LEAD STORY */}
        <article className="lg:col-span-6 flex flex-col justify-between rounded-md border border-[#292725]/15 bg-white p-4 sm:p-5">
          <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-xs bg-[#B83232] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
                  {dict.home.leadStoryBadge}
                </span>
                <span className="rounded-xs bg-[#174F73]/10 px-2 py-0.5 text-xs font-semibold text-[#174F73]">
                  {getLocalizedText(leadStory.categoryLabel, lang)}
                </span>
              </div>
              <DemoBadge />
            </div>

            <Link
              href={`/${lang}/article/${leadStory.slug}`}
              className="group block"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden rounded bg-[#292725]/5">
                <img
                  src={leadStory.imageUrl}
                  alt={leadTitle}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-[#292725]/60 italic">
                {getLocalizedText(leadStory.imageCaption, lang)}
              </p>

              <h1 className="mt-3 text-xl sm:text-2xl md:text-[28px] font-extrabold text-[#292725] group-hover:text-[#174F73] leading-tight transition-colors">
                {leadTitle}
              </h1>
            </Link>

            {leadSubtitle && (
              <p className="mt-2.5 text-sm sm:text-base font-medium text-[#174F73] leading-snug">
                {leadSubtitle}
              </p>
            )}

            <p className="mt-2.5 text-sm text-[#292725]/80 leading-relaxed">
              {leadSummary}
            </p>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#292725]/12 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#292725]/65">
              <span className="font-semibold text-[#292725]">
                {getLocalizedText(leadStory.author, lang)}
              </span>
              <span>•</span>
              <span>{getLocalizedText(leadStory.location, lang)}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {leadStory.readTimeMinutes} {lang === "gu" ? "મિનિટ" : "min"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/${lang}/article/${leadStory.slug}`}
                className="font-bold text-[#174F73] hover:underline"
              >
                {dict.home.readPreview} →
              </Link>
              <Link
                href={`/${lang}/epaper?page=${leadStory.epaperPageNumber}`}
                className="inline-flex items-center gap-1.5 rounded bg-[#174F73] px-3 py-1.5 font-semibold text-white hover:bg-[#103A55] transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#C59B4B]" />
                <span>{dict.home.readInEpaper}</span>
              </Link>
            </div>
          </div>
        </article>

        {/* COLUMN 2 (3 Cols on Desktop): TWO SMALLER VISUAL NEWS STORIES */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-5">
          {subLeadStories.map((story) => {
            const title = getLocalizedText(story.title, lang);
            return (
              <article
                key={story.id}
                className="flex-1 flex flex-col justify-between rounded-md border border-[#292725]/15 bg-white p-3.5 group"
              >
                <div>
                  <Link
                    href={`/${lang}/article/${story.slug}`}
                    className="block relative aspect-16/10 w-full overflow-hidden rounded bg-[#292725]/5 mb-2.5"
                  >
                    <img
                      src={story.imageUrl}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <span className="absolute top-2 left-2 rounded-xs bg-[#174F73] px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      {getLocalizedText(story.categoryLabel, lang)}
                    </span>
                  </Link>

                  <Link href={`/${lang}/article/${story.slug}`}>
                    <h2 className="text-base font-bold text-[#292725] group-hover:text-[#174F73] leading-snug transition-colors line-clamp-3">
                      {title}
                    </h2>
                  </Link>

                  <p className="mt-1.5 text-xs text-[#292725]/75 line-clamp-2 leading-relaxed">
                    {getLocalizedText(story.summary, lang)}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#292725]/8 flex items-center justify-between text-[11px]">
                  <span className="text-[#292725]/60 font-medium">
                    {getLocalizedText(story.location, lang)}
                  </span>
                  <Link
                    href={`/${lang}/epaper?page=${story.epaperPageNumber}`}
                    className="font-semibold text-[#174F73] hover:underline inline-flex items-center gap-1"
                  >
                    <BookOpen className="h-3 w-3 text-[#C59B4B]" />
                    <span>
                      {lang === "gu"
                        ? `પાનું ${story.epaperPageNumber}`
                        : `p.${story.epaperPageNumber}`}
                    </span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* COLUMN 3 (3 Cols on Desktop): COMPACT LIST OF ADDITIONAL HEADLINES */}
        <aside className="lg:col-span-3 rounded-md border border-[#292725]/15 bg-white p-4 flex flex-col justify-between">
          <div>
            <div className="pb-2.5 mb-3 border-b-2 border-[#174F73] flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#174F73]">
                {dict.home.additionalHeadlines}
              </h2>
              <span className="text-[10px] font-semibold uppercase text-[#C59B4B]">
                DEMO
              </span>
            </div>

            <ul className="divide-y divide-[#292725]/10">
              {headlineBriefs.map((brief) => {
                const briefTitle = getLocalizedText(brief.title, lang);
                return (
                  <li key={brief.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold uppercase tracking-wider text-[#174F73]">
                        {getLocalizedText(brief.categoryLabel, lang)}
                      </span>
                      <span className="text-[#292725]/55">
                        {getLocalizedText(brief.location, lang)}
                      </span>
                    </div>

                    <Link
                      href={`/${lang}/article/${brief.slug}`}
                      className="group block"
                    >
                      <h3 className="text-sm font-bold text-[#292725] group-hover:text-[#174F73] leading-snug transition-colors">
                        {briefTitle}
                      </h3>
                    </Link>

                    <p className="mt-1 text-xs text-[#292725]/70 line-clamp-2">
                      {getLocalizedText(brief.summary, lang)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-[#292725]/12">
            <Link
              href={`/${lang}/latest`}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded border border-[#174F73] px-3 py-2 text-xs font-bold text-[#174F73] hover:bg-[#174F73] hover:text-white transition-colors"
            >
              <span>{dict.home.viewAll}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
