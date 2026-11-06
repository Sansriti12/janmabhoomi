import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { getLocalizedText } from "@/lib/data/types";
import { NewsCard } from "@/components/shared/NewsCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const categoryMeta = await newsDataProvider.getCategoryMetadata(slug);

  if (!categoryMeta) {
    notFound();
  }

  return {
    title: `${getLocalizedText(categoryMeta.title, locale)} | Janmabhoomi`,
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#016BB7] pb-3.5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#016BB7]">
            {locale === "gu" ? "સમાચાર વિભાગ" : "NEWS SECTION"}
          </span>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#016BB7]">
            {getLocalizedText(categoryMeta.title, locale)}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/75">
            {getLocalizedText(categoryMeta.description, locale)}
          </p>
        </div>
      </div>

      {articles.length > 0 ? (
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
      ) : (
        <div className="rounded-md border border-[#292725]/15 bg-white p-8 text-center text-sm text-[#292725]/70">
          No articles currently available in this section.
        </div>
      )}
    </div>
  );
}
