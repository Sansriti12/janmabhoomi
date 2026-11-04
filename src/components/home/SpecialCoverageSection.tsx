import React from "react";
import Link from "next/link";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { SpecialEventItem, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { DemoBadge } from "@/components/shared/DemoBadge";

interface SpecialCoverageSectionProps {
  featuredCoverage: SpecialEventItem;
  events: SpecialEventItem[];
  lang: Locale;
  dict: Dictionary;
}

/**
 * Section 5 – Special Coverage and Events
 * Includes special coverage banner, featured event cards, and Explore/View All CTA.
 */
export function SpecialCoverageSection({
  featuredCoverage,
  events,
  lang,
  dict,
}: SpecialCoverageSectionProps) {
  return (
    <section
      aria-labelledby="special-coverage-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-[#292725]/10"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-[#C59B4B] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-xs bg-[#C59B4B] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
              {dict.nav.specialCoverage}
            </span>
            <DemoBadge variant="gold" />
          </div>
          <h2
            id="special-coverage-heading"
            className="mt-1.5 text-xl sm:text-2xl font-extrabold text-[#292725]"
          >
            {dict.home.specialCoverageTitle}
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#292725]/70">
            {dict.home.specialCoverageSubtitle}
          </p>
        </div>

        <Link
          href={`/${lang}/events`}
          className="inline-flex items-center gap-1.5 rounded bg-[#174F73] px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-[#103A55] transition-colors shrink-0"
        >
          <span>{dict.home.exploreEvents}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Special Coverage Banner */}
      <div className="mb-6 rounded-md border border-[#174F73]/25 bg-[#174F73] text-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 p-6 sm:p-8">
            <span className="inline-block rounded-xs bg-[#C59B4B] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#292725]">
              {getLocalizedText(featuredCoverage.badge, lang)}
            </span>

            <h3 className="mt-3 text-xl sm:text-2xl font-extrabold leading-snug">
              {getLocalizedText(featuredCoverage.title, lang)}
            </h3>

            <p className="mt-2.5 text-sm text-white/85 leading-relaxed">
              {getLocalizedText(featuredCoverage.description, lang)}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#C59B4B]" />
                {getLocalizedText(featuredCoverage.dateLabel, lang)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#C59B4B]" />
                {getLocalizedText(featuredCoverage.location, lang)}
              </span>
            </div>

            <div className="mt-5">
              <Link
                href={`/${lang}/events`}
                className="inline-flex items-center gap-2 rounded bg-[#C59B4B] px-4 py-2 text-xs sm:text-sm font-bold text-[#292725] hover:bg-[#d3aa59] transition-colors"
              >
                <span>{getLocalizedText(featuredCoverage.ctaLabel, lang)}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 h-56 lg:h-full relative bg-[#103A55]">
            <img
              src={featuredCoverage.imageUrl}
              alt={getLocalizedText(featuredCoverage.title, lang)}
              className="h-full w-full object-cover opacity-90"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {events.map((eventItem) => (
          <article
            key={eventItem.id}
            className="flex flex-col sm:flex-row rounded-md border border-[#292725]/15 bg-white overflow-hidden"
          >
            <div className="sm:w-48 shrink-0 relative aspect-16/10 sm:aspect-auto bg-[#292725]/5">
              <img
                src={eventItem.imageUrl}
                alt={getLocalizedText(eventItem.title, lang)}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="p-4 flex flex-col justify-between flex-1">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#174F73] bg-[#174F73]/10 px-2 py-0.5 rounded-xs">
                  {getLocalizedText(eventItem.badge, lang)}
                </span>
                <h4 className="mt-2 text-base font-bold text-[#292725] leading-snug">
                  {getLocalizedText(eventItem.title, lang)}
                </h4>
                <p className="mt-1.5 text-xs text-[#292725]/75 line-clamp-2">
                  {getLocalizedText(eventItem.description, lang)}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#292725]/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-[#292725]/65 space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#C59B4B]" />
                    <span>{getLocalizedText(eventItem.dateLabel, lang)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#174F73]" />
                    <span>{getLocalizedText(eventItem.location, lang)}</span>
                  </div>
                </div>

                <Link
                  href={`/${lang}/events`}
                  className="font-bold text-[#174F73] hover:underline"
                >
                  {getLocalizedText(eventItem.ctaLabel, lang)} →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
