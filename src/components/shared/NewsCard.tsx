import React from "react";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";

interface NewsCardProps {
  article: NewsArticle;
  lang: Locale;
  readInEpaperLabel: string;
  compact?: boolean;
}

export function NewsCard({
  article,
  lang,
  readInEpaperLabel,
  compact = false,
}: NewsCardProps) {
  const title = getLocalizedText(article.title, lang);
  const summary = getLocalizedText(article.summary, lang);
  const categoryLabel = getLocalizedText(article.categoryLabel, lang);
  const location = getLocalizedText(article.location, lang);

  return (
    <article className="group flex flex-col justify-between rounded-md border border-[#292725]/12 bg-white transition-colors hover:border-[#174F73]/40 overflow-hidden">
      <div>
        <Link
          href={`/${lang}/article/${article.slug}`}
          className="block relative aspect-16/10 w-full overflow-hidden bg-[#292725]/5"
        >
          <img
            src={article.imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="rounded-xs bg-[#174F73] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
              {categoryLabel}
            </span>
            <span className="rounded-xs bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white/90">
              DEMO
            </span>
          </div>
        </Link>

        <div className="p-4">
          <div className="mb-1.5 flex items-center gap-2 text-xs text-[#292725]/60">
            <span className="font-medium text-[#174F73]">{location}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {article.readTimeMinutes} {lang === "gu" ? "મિનિટ" : "min"}
            </span>
          </div>

          <Link href={`/${lang}/article/${article.slug}`}>
            <h3
              className={`font-bold text-[#292725] group-hover:text-[#174F73] transition-colors leading-snug ${
                compact ? "text-base line-clamp-2" : "text-lg line-clamp-3"
              }`}
            >
              {title}
            </h3>
          </Link>

          {!compact && (
            <p className="mt-2 text-sm text-[#292725]/75 line-clamp-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-[#292725]/8 bg-[#FAF8F3]/60 flex items-center justify-between text-xs">
        <Link
          href={`/${lang}/article/${article.slug}`}
          className="font-semibold text-[#174F73] hover:underline"
        >
          {lang === "gu" ? "પૂર્વાવલોકન વાંચો →" : "Read Preview →"}
        </Link>
        <Link
          href={`/${lang}/epaper?page=${article.epaperPageNumber}`}
          className="inline-flex items-center gap-1 font-medium text-[#292725]/70 hover:text-[#174F73]"
          title={readInEpaperLabel}
        >
          <BookOpen className="h-3.5 w-3.5 text-[#C59B4B]" />
          <span>
            {lang === "gu"
              ? `ઈ-પેપર પાનું ${article.epaperPageNumber}`
              : `E-Paper p.${article.epaperPageNumber}`}
          </span>
        </Link>
      </div>
    </article>
  );
}
