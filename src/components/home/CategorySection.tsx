import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
 * Section 4 – Reusable Category News Section
 * Supports National, City, Business, Sports, and Entertainment with consistent cards & View All CTA.
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
  return (
    <section
      aria-labelledby={`cat-heading-${slug}`}
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 border-t border-[#292725]/10"
    >
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b-2 border-[#174F73] pb-2.5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-4 w-1.5 bg-[#C59B4B] rounded-xs" />
            <h2
              id={`cat-heading-${slug}`}
              className="text-xl sm:text-2xl font-extrabold text-[#174F73] tracking-tight"
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-[#292725]/70">
              {subtitle}
            </p>
          )}
        </div>

        <Link
          href={`/${lang}/category/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#174F73] hover:text-[#103A55] group"
        >
          <span>{viewAllLabel}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article) => (
          <NewsCard
            key={`${slug}-${article.id}`}
            article={article}
            lang={lang}
            readInEpaperLabel={readInEpaperLabel}
          />
        ))}
      </div>
    </section>
  );
}
