"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper, Clock } from "lucide-react";
import { CategorySlug, BilingualText, NewsArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";

export interface CategoryCardItem {
  slug: CategorySlug;
  name: BilingualText;
  ctaText: BilingualText;
  href: string;
  article?: NewsArticle;
  emptyStateText?: BilingualText;
}

interface CategoryCarouselProps {
  categories: CategoryCardItem[];
  lang: Locale;
  dict: Dictionary;
}

/**
 * Deduplicated "Our News Coverage" 8-Desk Grid
 * - Renders each of the 8 editorial desks exactly once (zero duplicate cards across breakpoints).
 * - Desktop / Tablet (sm+): Clean 2-col / 4-col grid displaying all 8 distinct desk cards.
 * - Mobile (< sm): Horizontal snap-scroll strip.
 */
export function CategoryCarousel({ categories, lang, dict }: CategoryCarouselProps) {
  // Deduplicate by category slug defensively
  const uniqueCategories = Array.from(
    new Map(categories.map((item) => [item.slug, item])).values()
  );

  const renderCard = (item: CategoryCardItem, keyPrefix: string, extraClass = "") => {
    const categoryName = getLocalizedText(item.name, lang);
    const ctaLabel = getLocalizedText(item.ctaText, lang);
    const hasArticle = Boolean(item.article);
    const articleTitle = item.article ? getLocalizedText(item.article.title, lang) : "";
    const thumbnail = item.article?.imageUrl || "/assets/images/epaper-placeholder.jpg";

    return (
      <article
        key={`${keyPrefix}-${item.slug}`}
        className={`group flex flex-col justify-between rounded-xl border border-[#016BB7]/20 bg-white p-3.5 hover:border-[#016BB7] hover:shadow-md transition-all ${extraClass}`}
      >
        <div>
          {/* Category Header Badge */}
          <div className="flex items-center justify-between mb-2.5">
            <span className="rounded-xs bg-[#016BB7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white truncate max-w-[180px]">
              {categoryName}
            </span>
          </div>

          {/* News Thumbnail */}
          <Link
            href={hasArticle ? `/${lang}/article/${item.article!.slug}` : item.href}
            className="block relative aspect-16/10 w-full overflow-hidden rounded-lg bg-[#F0F6FA]"
          >
            {hasArticle ? (
              <Image
                src={thumbnail}
                alt={articleTitle}
                fill
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F0F6FA] text-[#016BB7] p-2 text-center">
                <Newspaper className="h-6 w-6 opacity-60 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#016BB7]">
                  {lang === "gu" ? "પ્રિન્ટ આવૃત્તિ" : "Print Edition"}
                </span>
              </div>
            )}
          </Link>

          {/* Headline & Metadata */}
          <div className="mt-3">
            {hasArticle ? (
              <>
                <div className="flex items-center gap-1 text-[11px] text-[#1F2937]/60 mb-1">
                  <Clock className="h-3 w-3 text-[#016BB7]" />
                  <span>
                    {item.article!.readTimeMinutes} {lang === "gu" ? "મિનિટ" : "min"}
                  </span>
                </div>
                <Link
                  href={`/${lang}/article/${item.article!.slug}`}
                  className="block font-bold text-sm text-[#1F2937] group-hover:text-[#016BB7] leading-snug line-clamp-2 min-h-[2.6rem] transition-colors"
                  title={articleTitle}
                >
                  {articleTitle}
                </Link>
              </>
            ) : (
              <div className="min-h-[3.25rem]">
                <p className="text-xs font-semibold text-[#1F2937]/80 line-clamp-2 leading-relaxed">
                  {item.emptyStateText
                    ? getLocalizedText(item.emptyStateText, lang)
                    : dict.home.emptyCategoryNotice}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Clear Category CTA Button */}
        <div className="mt-3 pt-2.5 border-t border-[#016BB7]/10">
          <Link
            href={item.href}
            className="inline-flex items-center justify-between w-full rounded-md bg-[#F0F6FA] hover:bg-[#016BB7] hover:text-white px-3 py-2 text-xs font-bold text-[#016BB7] transition-all group/btn"
          >
            <span className="truncate">{ctaLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </article>
    );
  };

  return (
    <section
      aria-labelledby="category-carousel-heading"
      className="container-wide py-6 border-t border-[#016BB7]/15"
    >
      {/* SECTION HEADER */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-[#016BB7] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-5 w-1.5 bg-[#016BB7] rounded-full" />
            <h2
              id="category-carousel-heading"
              className="text-lg sm:text-2xl font-extrabold text-[#1F2937] tracking-tight"
            >
              {dict.home.categoryCarouselTitle || "Our News Coverage"}
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/70">
            {lang === "gu"
              ? "રાષ્ટ્રીય, શહેર, વ્યાપાર, રમતગમત, મનોરંજન, અગ્રલેખ અને સમુદાય વિભાગના વિશિષ્ટ અહેવાલો"
              : "Distinct coverage across all 8 Janmabhoomi editorial desks — updated continuously."}
          </p>
        </div>

        <Link
          href={`/${lang}/category`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#016BB7] hover:underline shrink-0 group"
        >
          <span>
            {dict.home.exploreAllCategories ||
              (lang === "gu" ? "તમામ વિભાગો જુઓ" : "Explore All Categories")}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* DESKTOP & TABLET VIEW (sm+): Clean 4x2 Grid of All 8 Distinct Desks */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
        {uniqueCategories.map((item) => renderCard(item, "grid", "min-h-[330px]"))}
      </div>

      {/* MOBILE VIEW (< sm ONLY): Horizontal Snap-Scroll Strip (Mutually exclusive with sm:grid) */}
      <div className="sm:hidden flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 pt-1">
        {uniqueCategories.map((item) =>
          renderCard(item, "mobile", "w-[78vw] shrink-0 snap-start")
        )}
      </div>
    </section>
  );
}
