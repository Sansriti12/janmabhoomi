import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { getLocalizedText } from "@/lib/data/types";
import { NewsCard } from "@/components/shared/NewsCard";
import { DemoBadge } from "@/components/shared/DemoBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const categoryMeta = await newsDataProvider.getCategoryMetadata(slug);

  if (!categoryMeta) {
    return { title: "Category" };
  }

  return {
    title: getLocalizedText(categoryMeta.title, locale),
    description: getLocalizedText(categoryMeta.description, locale),
  };
}

export default async function CategoryListingPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  const categoryMeta = await newsDataProvider.getCategoryMetadata(slug);
  if (!categoryMeta) {
    notFound();
  }

  const articles = await newsDataProvider.getArticlesByCategory(
    categoryMeta.slug,
    9
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#174F73] pb-3.5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C59B4B]">
            JANMABHOOMI SECTION
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#174F73]">
            {getLocalizedText(categoryMeta.title, locale)}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#292725]/75">
            {getLocalizedText(categoryMeta.description, locale)}
          </p>
        </div>
        <DemoBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            lang={locale}
            readInEpaperLabel={dict.home.readInEpaper}
          />
        ))}
      </div>
    </div>
  );
}
