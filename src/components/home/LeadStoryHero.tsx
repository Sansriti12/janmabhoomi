"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  ArrowRight,
  Flame,
} from "lucide-react";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";

interface LeadStoryHeroProps {
  leadStories: NewsArticle[];
  headlineBriefs: NewsArticle[];
  lang: Locale;
  dict: Dictionary;
}

export function LeadStoryHero({
  leadStories,
  headlineBriefs,
  lang,
  dict,
}: LeadStoryHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  const stories = leadStories && leadStories.length > 0 ? leadStories : [];
  const currentStory = stories[currentIndex] || stories[0];

  // Reliable 10-second automatic rotation through all lead stories (0 -> 1 -> 2 -> 0 -> 1...)
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (stories.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stories.length);
    }, 10000);
  }, [stories.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  if (!currentStory) return null;

  const leadTitle = getLocalizedText(currentStory.title, lang);
  const leadSubtitle = currentStory.subtitle
    ? getLocalizedText(currentStory.subtitle, lang)
    : undefined;
  const leadSummary = getLocalizedText(currentStory.summary, lang);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
    startTimer();
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stories.length);
    startTimer();
  };

  return (
    <section
      aria-label={dict.home.leadStoryBadge}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-8"
      tabIndex={0}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* COLUMN 1 (8 Cols on Desktop): PROMINENT LEAD STORY CAROUSEL */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-xl border border-[#016BB7]/20 bg-white p-4 sm:p-6 shadow-xs relative overflow-hidden">
          {/* Carousel Top Bar: Badges only (visible manual navigation controls removed) */}
          <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-[#016BB7]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-sm bg-[#B83232] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-2xs">
                <Flame className="h-3.5 w-3.5" />
                <span>{dict.home.leadStoryBadge}</span>
              </span>
              <span className="rounded-sm bg-[#F0F6FA] border border-[#016BB7]/20 px-2.5 py-1 text-xs font-bold text-[#016BB7]">
                {getLocalizedText(currentStory.categoryLabel, lang)}
              </span>
            </div>
          </div>

          {/* Active Story Content (Animated Fade) */}
          <div
            key={currentStory.id}
            className="flex-1 flex flex-col justify-between transition-opacity duration-300"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchStartX.current === null) return;
              const touchEndX = e.changedTouches[0].clientX;
              const diff = touchStartX.current - touchEndX;
              if (Math.abs(diff) > 40) {
                if (diff > 0) handleNext();
                else handlePrev();
              }
              touchStartX.current = null;
            }}
          >
            <div>
              <Link
                href={`/${lang}/article/${currentStory.slug}`}
                className="group block"
              >
                <div className="relative aspect-16/9 sm:aspect-16/10 w-full overflow-hidden rounded-lg bg-[#F0F6FA] shadow-2xs">
                  <Image
                    src={currentStory.imageUrl}
                    alt={leadTitle}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
                {currentStory.imageCaption && (
                  <p className="mt-1.5 text-xs text-[#1F2937]/70 italic">
                    {getLocalizedText(currentStory.imageCaption, lang)}
                  </p>
                )}

                <h1 className="mt-4 text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1F2937] group-hover:text-[#016BB7] leading-tight transition-colors">
                  {leadTitle}
                </h1>
              </Link>

              {leadSubtitle && (
                <p className="mt-2 text-sm sm:text-base font-semibold text-[#016BB7] leading-snug">
                  {leadSubtitle}
                </p>
              )}

              <p className="mt-3 text-sm sm:text-base text-[#1F2937]/85 leading-relaxed line-clamp-3 sm:line-clamp-4">
                {leadSummary}
              </p>
            </div>

            {/* Bottom Action CTAs (Metadata removed per Management Feedback) */}
            <div className="mt-6 pt-4 border-t border-[#016BB7]/15 flex items-center justify-end gap-4 text-xs sm:text-sm">
              <Link
                href={`/${lang}/article/${currentStory.slug}`}
                className="font-bold text-[#016BB7] hover:text-[#016BB7]/80 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{dict.home.readPreview}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href={`/${lang}/epaper?page=${currentStory.epaperPageNumber || 1}`}
                className="inline-flex items-center gap-2 rounded-lg bg-[#016BB7] hover:bg-[#016BB7]/90 active:bg-[#015a99] px-4 py-2 font-bold text-white transition-colors shadow-2xs"
              >
                <BookOpen className="h-4 w-4 text-white" />
                <span>{dict.home.readInEpaper}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* COLUMN 2 (4 Cols on Desktop): HEADLINES & BRIEFS PANEL */}
        <aside
          aria-labelledby="headlines-panel-heading"
          className="lg:col-span-4 rounded-xl border border-[#016BB7]/25 bg-[#F0F6FA] p-4 sm:p-5 flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="flex items-center justify-between border-b-2 border-[#016BB7] pb-3 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1.5 bg-[#016BB7] rounded-full" />
                <h2
                  id="headlines-panel-heading"
                  className="text-base sm:text-lg font-extrabold text-[#1F2937] tracking-tight"
                >
                  {dict.home.additionalHeadlines}
                </h2>
              </div>
              <Link
                href={`/${lang}/latest`}
                className="text-xs font-bold text-[#016BB7] hover:text-[#016BB7]/80 transition-colors inline-flex items-center gap-1"
              >
                <span>{dict.home.viewAll}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#016BB7]/15">
              {headlineBriefs.map((brief, index) => {
                const title = getLocalizedText(brief.title, lang);
                const category = getLocalizedText(brief.categoryLabel, lang);
                return (
                  <article key={brief.id} className="py-3.5 first:pt-1 last:pb-1 group">
                    <Link
                      href={`/${lang}/article/${brief.slug}`}
                      className="block"
                    >
                      <div className="flex items-center gap-2 text-[11px] mb-1.5">
                        <span className="rounded-xs bg-[#016BB7]/10 border border-[#016BB7]/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#016BB7]">
                          {category}
                        </span>
                        <span className="text-[#1F2937]/40">•</span>
                        <span className="text-[#1F2937]/70 font-medium">
                          {brief.readTimeMinutes} {lang === "gu" ? "મિનિટ" : "min"}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-[15px] font-bold text-[#1F2937] group-hover:text-[#016BB7] leading-snug transition-colors line-clamp-2">
                        {index + 1}. {title}
                      </h3>
                      <p className="mt-1 text-xs text-[#1F2937]/75 line-clamp-2 leading-relaxed font-normal">
                        {getLocalizedText(brief.summary, lang)}
                      </p>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Quick link to E-Paper */}
          <div className="mt-4 pt-3.5 border-t border-[#016BB7]/20">
            <Link
              href={`/${lang}/epaper`}
              className="flex items-center justify-between rounded-lg bg-white border border-[#016BB7]/25 p-3 hover:border-[#016BB7] hover:bg-white shadow-2xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="h-4 w-4 text-[#016BB7]" />
                <span className="text-xs font-bold text-[#016BB7]">
                  {lang === "gu" ? "આજનું સંપૂર્ણ અખબાર ઈ-પેપરમાં વાંચો" : "Read Complete Newspaper in E-Paper"}
                </span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-[#016BB7] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
