import React from "react";
import Link from "next/link";
import Image from "next/image";
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
    <article className="group flex-1 flex flex-col justify-between rounded-xl border border-[#016BB7]/15 bg-white transition-all hover:border-[#016BB7]/50 hover:shadow-md overflow-hidden">
      <div>
        <Link
          href={`/${lang}/article/${article.slug}`}
          className="block relative aspect-16/10 w-full overflow-hidden bg-[#F0F6FA]"
        >
          <Image
            src={article.imageUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
            <span className="rounded-sm bg-[#016BB7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-2xs">
              {categoryLabel}
            </span>
          </div>
        </Link>

        <div className="p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] text-[#1F2937]/65">
            <span className="font-semibold text-[#016BB7]">{location}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-[#016BB7]" />
              {article.readTimeMinutes} {lang === "gu" ? "મિનિટ" : "min"}
            </span>
          </div>

          <Link href={`/${lang}/article/${article.slug}`}>
            <h3
              className={`font-bold text-[#1F2937] group-hover:text-[#016BB7] transition-colors leading-snug line-clamp-2 ${
                compact ? "text-sm sm:text-base min-h-[2.75rem]" : "text-base sm:text-lg min-h-[3rem]"
              }`}
            >
              {title}
            </h3>
          </Link>

          {!compact && (
            <p className="mt-2 text-xs sm:text-sm text-[#1F2937]/75 line-clamp-2 leading-relaxed">
              {summary}
            </p>
          )}
        </div>
      </div>

      <div className="px-3.5 py-2.5 border-t border-[#016BB7]/10 bg-[#F0F6FA]/50 flex items-center justify-between text-xs">
        <Link
          href={`/${lang}/article/${article.slug}`}
          className="font-bold text-[#016BB7] hover:text-[#016BB7]/80 transition-colors"
        >
          {lang === "gu" ? "સંક્ષિપ્ત વાંચો →" : "Read Preview →"}
        </Link>
        <Link
          href={`/${lang}/epaper?page=${article.epaperPageNumber || 1}`}
          className="inline-flex items-center gap-1 font-semibold text-[#1F2937]/75 hover:text-[#016BB7] transition-colors"
          title={readInEpaperLabel}
        >
          <BookOpen className="h-3.5 w-3.5 text-[#016BB7]" />
          <span>
            {lang === "gu"
              ? `પાનું ${article.epaperPageNumber || 1}`
              : `p.${article.epaperPageNumber || 1}`}
          </span>
        </Link>
      </div>
    </article>
  );
}
