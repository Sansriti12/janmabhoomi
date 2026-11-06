import React from "react";
import Link from "next/link";
import { Newspaper, Globe, BookOpen, CheckCircle2 } from "lucide-react";
import { SisterPublication, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";

interface PublicationsSectionProps {
  publications: SisterPublication[];
  lang: Locale;
  dict: Dictionary;
}

/**
 * Section 8 – E-Paper and Other Publications
 * Includes prominent E-paper subscription CTA and Sister Publications logo cards near the bottom.
 * Sister publications are deliberately kept out of the main navigation bar as required.
 */
export function PublicationsSection({
  publications,
  lang,
  dict,
}: PublicationsSectionProps) {
  return (
    <section
      aria-labelledby="publications-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 border-t border-[#292725]/10 space-y-8"
    >
      {/* Part A: Prominent E-Paper Subscription CTA Banner */}
      <div className="rounded-md border-2 border-[#016BB7] bg-white p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8">
            <span className="inline-flex items-center gap-1.5 rounded-xs bg-[#016BB7]/20 border border-[#016BB7] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#292725]">
              <Newspaper className="h-3.5 w-3.5 text-[#016BB7]" />
              <span>JANMABHOOMI DIGITAL E-PAPER</span>
            </span>

            <h2 className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-[#016BB7] leading-tight">
              {dict.home.epaperBannerTitle}
            </h2>

            <p className="mt-2 text-sm sm:text-base text-[#292725]/80 leading-relaxed">
              {dict.home.epaperBannerDesc}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#292725]/80">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#016BB7]" />
                {lang === "gu"
                  ? "મુંબઈ અને ગુજરાત આવૃત્તિઓ"
                  : "High-Resolution Print Replica"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#016BB7]" />
                {lang === "gu"
                  ? "તમામ વિશેષ પૂર્તિઓ અને આર્કાઇવ"
                  : "All Weekly Supplements & Archives"}
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <Link
              href={`/${lang}/epaper`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#016BB7] px-5 py-3 text-sm font-bold text-white hover:bg-[#016BB7]/90 transition-colors"
            >
              <Newspaper className="h-4 w-4 text-[#016BB7]" />
              <span>{dict.home.subscribeEpaper}</span>
            </Link>

            <Link
              href={`/${lang}/epaper?view=preview`}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#016BB7] bg-[#FAF8F3] px-5 py-2.5 text-sm font-bold text-[#016BB7] hover:bg-[#016BB7]/10 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>{dict.home.openTodaysEdition}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Part B: Other Publications with Logos (Section 9 in handwritten note) */}
      <div>
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#016BB7] pb-2.5">
          <div>
            <h3
              id="publications-heading"
              className="text-xl sm:text-2xl font-extrabold text-[#292725]"
            >
              {dict.home.otherPublicationsTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#292725]/70 mt-0.5">
              {dict.home.otherPublicationsSubtitle}
            </p>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#016BB7] bg-[#016BB7]/10 px-2.5 py-1 rounded-xs">
            MULTI-PUBLICATION PLATFORM READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {publications.map((pub) => (
            <div
              key={pub.id}
              className="flex flex-col justify-between rounded-md border border-[#292725]/15 bg-white p-4 hover:border-[#016BB7]/50 transition-colors"
            >
              <div>
                {/* Marked Official Publication Logo Placeholder */}
                <div className="mb-3 flex h-16 w-full flex-col items-center justify-center rounded border border-dashed border-[#292725]/25 bg-[#FAF8F3] px-2 text-center">
                  <span className="font-gujarati text-lg font-extrabold text-[#016BB7]">
                    {pub.logoPlaceholderCode}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[#292725]/50">
                    LOGO ASSET PLACEHOLDER
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#292725]/60 mb-1">
                  <span>Est. {pub.establishedYear}</span>
                  <span className="font-medium text-[#016BB7]">
                    {getLocalizedText(pub.region, lang)}
                  </span>
                </div>

                <h4 className="text-base font-bold text-[#292725]">
                  {getLocalizedText(pub.name, lang)}
                </h4>

                <p className="mt-1 text-xs text-[#292725]/70 leading-snug">
                  {getLocalizedText(pub.tagline, lang)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#292725]/10 grid grid-cols-2 gap-2 text-xs">
                <Link
                  href={`/${lang}${pub.websiteUrl}`}
                  className="inline-flex items-center justify-center gap-1 rounded border border-[#292725]/20 px-2 py-1.5 font-semibold text-[#292725] hover:border-[#016BB7] hover:text-[#016BB7] transition-colors"
                >
                  <Globe className="h-3 w-3" />
                  <span className="truncate">{dict.home.visitWebsite}</span>
                </Link>

                <Link
                  href={`/${lang}${pub.epaperUrl}`}
                  className="inline-flex items-center justify-center gap-1 rounded bg-[#016BB7] px-2 py-1.5 font-semibold text-white hover:bg-[#016BB7]/90 transition-colors"
                >
                  <BookOpen className="h-3 w-3 text-[#016BB7]" />
                  <span>{dict.home.readPublicationEpaper}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
