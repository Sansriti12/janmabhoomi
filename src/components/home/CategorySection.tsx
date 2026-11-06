"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { NewsArticle, CategorySlug } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { NewsCard } from "@/components/shared/NewsCard";

interface CategorySectionProps {
  slug: CategorySlug;
  title: string;
  subtitle?: string;
  articles: NewsArticle[];
  lang: Locale;
  viewAllLabel: string;
  readInEpaperLabel: string;
}

/**
 * Reusable Category News Section with 5-Card Row on Desktop and Horizontal Carousel Navigation
 * Supports National, City, Business, Sports, Entertainment with consistent cards & View All CTA.
 * Fully responsive:
 * - Desktop: Exactly 5 visible cards in one row with carousel scroll navigation
 * - Tablet: 2.5 - 3 cards
 * - Mobile: 1.15 cards (swipeable)
 */
export function CategorySection({
  slug,
  title,
  subtitle,
  articles,
  lang,
  viewAllLabel,
  readInEpaperLabel,
}: CategorySectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [articles.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.clientWidth * 0.8; // Scroll ~80% of visible container
      const targetScroll =
        direction === "left"
          ? container.scrollLeft - cardWidth
          : container.scrollLeft + cardWidth;
      container.scrollTo({ left: targetScroll, behavior: "smooth" });
    }
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section
      aria-labelledby={`cat-heading-${slug}`}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-7 border-t border-[#016BB7]/15"
    >
      {/* Section Header: Title, Subtitle, View All, and Carousel Navigation Controls */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 border-[#016BB7] pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1.5 bg-[#016BB7] rounded-full" />
            <h2
              id={`cat-heading-${slug}`}
              className="text-xl sm:text-2xl font-extrabold text-[#016BB7] tracking-tight"
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/70">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Previous / Next Carousel Buttons */}
          {articles.length > 3 && (
            <div className="flex items-center gap-1.5 mr-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label={`Previous ${title} articles`}
                className={`inline-flex items-center justify-center h-7 w-7 rounded-md border transition-all cursor-pointer ${
                  canScrollLeft
                    ? "border-[#016BB7]/30 text-[#016BB7] hover:bg-[#F0F6FA] hover:border-[#016BB7]"
                    : "border-gray-200 text-gray-300 cursor-not-allowed opacity-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label={`Next ${title} articles`}
                className={`inline-flex items-center justify-center h-7 w-7 rounded-md border transition-all cursor-pointer ${
                  canScrollRight
                    ? "border-[#016BB7]/30 text-[#016BB7] hover:bg-[#F0F6FA] hover:border-[#016BB7]"
                    : "border-gray-200 text-gray-300 cursor-not-allowed opacity-50"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          <Link
            href={`/${lang}/category/${slug}`}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#016BB7] hover:text-[#016BB7]/80 group transition-colors"
          >
            <span>{viewAllLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* 5-Card Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4.5 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 snap-x snap-mandatory"
      >
        {articles.map((article) => (
          <div
            key={`${slug}-${article.id}`}
            className="w-[84vw] sm:w-[46vw] md:w-[31vw] lg:w-[calc((100%-4.5rem)/5)] shrink-0 snap-start flex flex-col"
          >
            <NewsCard
              article={article}
              lang={lang}
              readInEpaperLabel={readInEpaperLabel}
              compact
            />
          </div>
        ))}
      </div>
    </section>
  );
}
