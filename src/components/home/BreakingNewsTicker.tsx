import React from "react";
import Link from "next/link";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";

interface BreakingNewsTickerProps {
  articles: NewsArticle[];
  lang: Locale;
  label: string;
}

export function BreakingNewsTicker({
  articles,
  lang,
  label,
}: BreakingNewsTickerProps) {
  if (!articles.length) return null;

  // Duplicate list for seamless continuous marquee loop
  const tickerItems = [...articles, ...articles];

  return (
    <section
      aria-label={label}
      className="w-full border-b border-[#292725]/12 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 overflow-hidden">
        {/* Breaking News Red Label (#B83232) */}
        <div className="shrink-0 inline-flex items-center gap-2 rounded-xs bg-[#B83232] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          <span>{label}</span>
        </div>

        {/* Scrolling Headlines */}
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-ticker flex items-center gap-8 text-sm">
            {tickerItems.map((article, idx) => (
              <Link
                key={`${article.id}-${idx}`}
                href={`/${lang}/article/${article.slug}`}
                className="inline-flex items-center gap-2.5 text-[#292725] hover:text-[#174F73] font-medium whitespace-nowrap transition-colors"
              >
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FAF8F3] border border-[#292725]/15 text-[#174F73]">
                  {getLocalizedText(article.categoryLabel, lang)}
                </span>
                <span>{getLocalizedText(article.title, lang)}</span>
                <span className="text-[#C59B4B] font-bold">•</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
