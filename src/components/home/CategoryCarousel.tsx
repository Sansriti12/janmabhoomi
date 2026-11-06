"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Newspaper, Clock } from "lucide-react";
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
 * Our News Coverage Carousel
 * 
 * - Displays 6 category cards in a single horizontal row on desktop.
 * - Each card represents exactly ONE category with latest story, thumbnail, headline and CTA.
 * - Automatically switches to the next 6 categories every 10 seconds (continuous Group 1 <-> Group 2 rotation).
 * - Retains manual previous/next navigation buttons; group counter and dots removed per requirements.
 * - Explore All Categories CTA placed at the end of the carousel.
 * - Fully responsive: touch-scrollable cards on mobile/tablet.
 */
export function CategoryCarousel({ categories, lang, dict }: CategoryCarouselProps) {
  const [currentGroup, setCurrentGroup] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  // Group 0 = first 6 categories, Group 1 = next 6 categories
  const groupSize = 6;
  const totalGroups = Math.ceil(categories.length / groupSize) || 2;
  const currentGroupCategories = categories.slice(
    currentGroup * groupSize,
    currentGroup * groupSize + groupSize
  );

  // Reliable 10-second automatic transition (Group 1 -> Group 2 -> Group 1 -> Group 2...)
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalGroups <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentGroup((prev) => (prev + 1) % totalGroups);
    }, 10000);
  }, [totalGroups]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handlePrev = () => {
    setCurrentGroup((prev) => (prev === 0 ? totalGroups - 1 : prev - 1));
    startTimer(); // Reset the 10-second countdown on manual interaction
  };

  const handleNext = () => {
    setCurrentGroup((prev) => (prev + 1) % totalGroups);
    startTimer(); // Reset the 10-second countdown on manual interaction
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    else if (e.key === "ArrowRight") handleNext();
  };

  return (
    <section
      aria-labelledby="category-carousel-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 border-t border-[#016BB7]/15"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* SECTION HEADER: Title, Subtitle & Manual Controls (group indicator and dots removed) */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-[#016BB7] pb-3">
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
            {dict.home.categoryCarouselSubtitle || "Browse through all 12 editorial categories with real-time story previews."}
          </p>
        </div>

        {/* Retained Manual Previous / Next Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrev}
            aria-label={lang === "gu" ? "અગાઉના વિભાગો" : "Previous category group"}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#016BB7]/30 text-[#016BB7] bg-white hover:bg-[#016BB7] hover:text-white transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label={lang === "gu" ? "આગામી વિભાગો" : "Next category group"}
            className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#016BB7]/30 text-[#016BB7] bg-white hover:bg-[#016BB7] hover:text-white transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* DESKTOP VIEW: Exactly 6 Category Cards in One Horizontal Row (lg and up) */}
      <div className="hidden lg:grid grid-cols-6 gap-3.5 transition-opacity duration-300">
        {currentGroupCategories.map((item) => {
          const categoryName = getLocalizedText(item.name, lang);
          const ctaLabel = getLocalizedText(item.ctaText, lang);
          const hasArticle = Boolean(item.article);
          const articleTitle = item.article
            ? getLocalizedText(item.article.title, lang)
            : "";
          const thumbnail = item.article?.imageUrl || "/assets/images/epaper-placeholder.jpg";

          return (
            <article
              key={`desktop-${item.slug}-${currentGroup}`}
              className="group flex flex-col justify-between rounded-xl border border-[#016BB7]/20 bg-white p-3 hover:border-[#016BB7] hover:shadow-md transition-all h-[340px]"
            >
              <div>
                {/* Category Header Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-xs bg-[#016BB7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white truncate max-w-[150px]">
                    {categoryName}
                  </span>
                </div>

                {/* News Thumbnail */}
                <Link
                  href={hasArticle ? `/${lang}/article/${item.article!.slug}` : item.href}
                  className="block relative aspect-16/10 w-full overflow-hidden rounded-md bg-[#F0F6FA]"
                >
                  {hasArticle ? (
                    <Image
                      src={thumbnail}
                      alt={articleTitle}
                      fill
                      sizes="200px"
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
                <div className="mt-2.5">
                  {hasArticle ? (
                    <>
                      <div className="flex items-center gap-1 text-[10px] text-[#1F2937]/60 mb-1">
                        <Clock className="h-2.5 w-2.5 text-[#016BB7]" />
                        <span>
                          {item.article!.readTimeMinutes} {lang === "gu" ? "મિનિટ" : "min"}
                        </span>
                      </div>
                      <Link
                        href={`/${lang}/article/${item.article!.slug}`}
                        className="block font-bold text-xs sm:text-[13px] text-[#1F2937] group-hover:text-[#016BB7] leading-snug line-clamp-2 min-h-[2.5rem] transition-colors"
                        title={articleTitle}
                      >
                        {articleTitle}
                      </Link>
                    </>
                  ) : (
                    <div className="min-h-[3.25rem]">
                      <p className="text-[11px] font-semibold text-[#1F2937]/80 line-clamp-2 leading-relaxed">
                        {item.emptyStateText
                          ? getLocalizedText(item.emptyStateText, lang)
                          : dict.home.emptyCategoryNotice}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Clear Category CTA Button */}
              <div className="mt-2.5 pt-2 border-t border-[#016BB7]/10">
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-between w-full rounded-md bg-[#F0F6FA] hover:bg-[#016BB7] hover:text-white px-2.5 py-1.5 text-[11px] font-bold text-[#016BB7] transition-all group/btn"
                >
                  <span className="truncate">{ctaLabel}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* MOBILE / TABLET VIEW: Touch-Scrollable Row (1-2 Cards Visible) */}
      <div
        ref={mobileScrollRef}
        className="lg:hidden flex gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 pt-1"
      >
        {categories.map((item) => {
          const categoryName = getLocalizedText(item.name, lang);
          const ctaLabel = getLocalizedText(item.ctaText, lang);
          const hasArticle = Boolean(item.article);
          const articleTitle = item.article
            ? getLocalizedText(item.article.title, lang)
            : "";
          const thumbnail = item.article?.imageUrl || "/assets/images/epaper-placeholder.jpg";

          return (
            <article
              key={`mobile-${item.slug}`}
              className="w-[78vw] sm:w-[46vw] shrink-0 snap-start flex flex-col justify-between rounded-xl border border-[#016BB7]/20 bg-white p-3.5 hover:border-[#016BB7] shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-xs bg-[#016BB7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {categoryName}
                  </span>
                </div>

                <Link
                  href={hasArticle ? `/${lang}/article/${item.article!.slug}` : item.href}
                  className="block relative aspect-16/10 w-full overflow-hidden rounded-md bg-[#F0F6FA]"
                >
                  {hasArticle ? (
                    <Image
                      src={thumbnail}
                      alt={articleTitle}
                      fill
                      sizes="(max-width: 640px) 80vw, 45vw"
                      className="object-cover"
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

                <div className="mt-2.5">
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
                        className="block font-bold text-sm text-[#1F2937] leading-snug line-clamp-2"
                      >
                        {articleTitle}
                      </Link>
                    </>
                  ) : (
                    <p className="text-xs text-[#1F2937]/80 line-clamp-2 leading-relaxed">
                      {item.emptyStateText
                        ? getLocalizedText(item.emptyStateText, lang)
                        : dict.home.emptyCategoryNotice}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#016BB7]/10">
                <Link
                  href={item.href}
                  className="inline-flex items-center justify-between w-full rounded-md bg-[#F0F6FA] hover:bg-[#016BB7] hover:text-white px-3 py-2 text-xs font-bold text-[#016BB7] transition-all"
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {/* Explore All Categories CTA at the end of Our News Coverage carousel */}
      <div className="mt-5 flex items-center justify-end border-t border-[#016BB7]/15 pt-4">
        <Link
          href={`/${lang}/category`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#016BB7] hover:bg-[#016BB7]/90 active:bg-[#015a99] px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors shadow-2xs group"
        >
          <span>
            {dict.home.exploreAllCategories ||
              (lang === "gu" ? "તમામ વિભાગો જુઓ" : "Explore All Categories")}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
