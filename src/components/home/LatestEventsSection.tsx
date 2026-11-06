import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { SpecialEventItem, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";

interface LatestEventsSectionProps {
  events: SpecialEventItem[];
  lang: Locale;
}

/**
 * Dedicated Latest Events Section (Revision Specification)
 * 
 * - Placed between Advertisement and Our News Coverage carousel.
 * - Horizontal cards layout matching the Phulchhab Ram Katha reference format.
 * - Features event image, event name, date, location, "View Event Details" CTA,
 *   and "View All Events" header link pointing to /events.
 * - Styled with official Janmabhoomi brand blue (#016BB7).
 */
export function LatestEventsSection({ events, lang }: LatestEventsSectionProps) {
  const isGu = lang === "gu";

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="latest-events-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 border-b-2 border-[#016BB7] pb-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1.5 bg-[#016BB7] rounded-full" />
            <h2
              id="latest-events-heading"
              className="text-xl sm:text-2xl font-extrabold text-[#1F2937] tracking-tight"
            >
              {isGu ? "તાજેતરના કાર્યક્રમો" : "Latest Events"}
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/70 font-medium">
            {isGu
              ? "સૌરાષ્ટ્ર ટ્રસ્ટ અને જન્મભૂમિ દ્વારા આયોજિત સંવાદ, સાહિત્ય પરિષદ અને જાહેર કાર્યક્રમો"
              : "Conclaves, forums, and civic events organised by Saurashtra Trust & Janmabhoomi"}
          </p>
        </div>

        <Link
          href={`/${lang}/events`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#016BB7] hover:underline transition-all shrink-0 group"
        >
          <span>{isGu ? "બધા કાર્યક્રમો જુઓ" : "View All Events"}</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Compact Event Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
        {events.map((eventItem) => {
          const title = getLocalizedText(eventItem.title, lang);
          const description = getLocalizedText(eventItem.description, lang);
          const badge = getLocalizedText(eventItem.badge, lang);
          const dateLabel = getLocalizedText(eventItem.dateLabel, lang);
          const location = getLocalizedText(eventItem.location, lang);
          const ctaLabel =
            getLocalizedText(eventItem.ctaLabel, lang) ||
            (isGu ? "કાર્યક્રમની વિગતો જુઓ" : "View Event Details");

          return (
            <article
              key={eventItem.id}
              className="group flex flex-col rounded-lg border border-[#016BB7]/20 bg-white shadow-2xs hover:shadow-sm hover:border-[#016BB7]/40 transition-all overflow-hidden"
            >
              {/* Compact Event Image */}
              <div className="relative h-32 sm:h-36 w-full bg-[#F0F6FA] overflow-hidden">
                <Image
                  src={eventItem.imageUrl || "/assets/images/epaper-placeholder.jpg"}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-102 transition-transform duration-300"
                />
                {badge && (
                  <span className="absolute top-2 left-2 rounded bg-[#016BB7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs">
                    {badge}
                  </span>
                )}
              </div>

              {/* Compact Event Content */}
              <div className="flex flex-col justify-between flex-1 p-3.5 sm:p-4 space-y-2.5">
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-[#1F2937] group-hover:text-[#016BB7] leading-snug transition-colors line-clamp-1">
                    <Link href={`/${lang}/events`}>{title}</Link>
                  </h3>
                  <p className="text-xs text-[#1F2937]/75 leading-relaxed line-clamp-2 font-normal">
                    {description}
                  </p>
                </div>

                {/* Event Metadata (Date & Location) */}
                <div className="space-y-1 pt-2 border-t border-[#016BB7]/10 text-xs text-[#1F2937]/75">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#016BB7] shrink-0" />
                    <span className="font-medium truncate">{dateLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-[#016BB7] shrink-0" />
                    <span className="font-medium truncate">{location}</span>
                  </div>
                </div>

                {/* CTA Action */}
                <div className="pt-1">
                  <Link
                    href={`/${lang}/events`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:underline group-hover:gap-2 transition-all"
                  >
                    <span>{ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#016BB7]" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
