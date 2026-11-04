import React from "react";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { NewsCard } from "@/components/shared/NewsCard";
import { DemoBadge } from "@/components/shared/DemoBadge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  return {
    title: dict.nav.latest,
    description: dict.meta.siteDescription,
  };
}

export default async function LatestNewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const articles = await newsDataProvider.getLatestArticles(12);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#174F73] pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174F73]">
            {dict.nav.latest}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#292725]/70">
            {locale === "gu"
              ? "જન્મભૂમિ ન્યૂઝ ડેસ્ક પરથી તાજા સમાચારના સંક્ષિપ્ત પૂર્વાવલોકનો"
              : "Chronological news dispatches and previews from the Janmabhoomi editorial desk."}
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
