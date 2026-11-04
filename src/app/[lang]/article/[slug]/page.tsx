import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Lock,
  Newspaper,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { getLocalizedText } from "@/lib/data/types";
import { DemoBadge } from "@/components/shared/DemoBadge";
import { NewsCard } from "@/components/shared/NewsCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const article = await newsDataProvider.getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const title = getLocalizedText(article.title, locale);
  const description = getLocalizedText(article.summary, locale);

  return {
    title,
    description,
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: article.publishedAt,
      images: [article.imageUrl],
    },
  };
}

/**
 * Individual News Article Page
 * Enforces the Janmabhoomi business model:
 * - Public preview / teaser paragraphs only
 * - Full newspaper reading gated behind the paid E-paper subscription CTA
 * - Never exposes full unrestricted newspaper content freely
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  const article = await newsDataProvider.getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const relatedArticles = (
    await newsDataProvider.getArticlesByCategory(article.category, 4)
  ).filter((item) => item.id !== article.id);

  const title = getLocalizedText(article.title, locale);
  const subtitle = article.subtitle
    ? getLocalizedText(article.subtitle, locale)
    : undefined;
  const teaserParagraphs =
    article.teaserParagraphs[locale] ?? article.teaserParagraphs.en;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb & Back Navigation */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#292725]/70">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1 font-bold text-[#174F73] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{dict.nav.home}</span>
          </Link>
          <span>/</span>
          <Link
            href={`/${locale}/category/${article.category}`}
            className="font-semibold text-[#174F73] hover:underline"
          >
            {getLocalizedText(article.categoryLabel, locale)}
          </Link>
        </div>

        <DemoBadge />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Article Teaser Column */}
        <article className="lg:col-span-8 rounded-md border border-[#292725]/15 bg-white p-5 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-xs bg-[#174F73] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              {getLocalizedText(article.categoryLabel, locale)}
            </span>
            <span className="rounded-xs bg-[#FAF8F3] border border-[#C59B4B] px-2.5 py-0.5 text-xs font-semibold text-[#292725]">
              {getLocalizedText(article.epaperEdition, locale)} •{" "}
              {dict.paywall.editionReference} {article.epaperPageNumber}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#292725] leading-tight">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-3 text-base sm:text-lg font-medium text-[#174F73] leading-snug">
              {subtitle}
            </p>
          )}

          {/* Article Metadata */}
          <div className="mt-4 py-3 border-y border-[#292725]/12 flex flex-wrap items-center gap-4 text-xs text-[#292725]/70">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#292725]">
              <User className="h-3.5 w-3.5 text-[#174F73]" />
              {getLocalizedText(article.author, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#C59B4B]" />
              {getLocalizedText(article.location, locale)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {article.readTimeMinutes} {locale === "gu" ? "મિનિટ વાંચન" : "min read"}
            </span>
          </div>

          {/* Lead Image */}
          <figure className="my-6">
            <div className="aspect-16/10 w-full overflow-hidden rounded bg-[#292725]/5">
              <img
                src={article.imageUrl}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-2 text-xs text-[#292725]/60 italic">
              {getLocalizedText(article.imageCaption, locale)}
            </figcaption>
          </figure>

          {/* Public Preview / Teaser Paragraphs */}
          <div className="space-y-4 text-base sm:text-lg text-[#292725]/90 leading-relaxed">
            {teaserParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Gradient Fade indicating transition from public preview to E-paper subscriber content */}
          <div className="relative mt-4 pt-6">
            <div className="select-none pointer-events-none blur-[3px] opacity-40 space-y-2 text-sm text-[#292725] mb-4">
              <p>
                {locale === "gu"
                  ? `[સબ્સ્ક્રાઇબર ઈ-પેપર અનુસંધાન] આ અહેવાલની સંપૂર્ણ વિગતો, સત્તાવાર આંકડા અને વિશેષ વિશ્લેષણ આજના જન્મભૂમિ પ્રિન્ટ અને ડિજિટલ ઈ-પેપરના પાના નં. ${article.epaperPageNumber} પર ચાલુ...`
                  : `[Subscriber E-Paper Continuation] Detailed statistical tables, official statements, and full multi-column regional ground reports continue on Page ${article.epaperPageNumber} of today's Janmabhoomi print and digital replica edition...`}
              </p>
            </div>

            {/* E-PAPER SUBSCRIPTION GATE */}
            <div className="rounded-md border-2 border-[#174F73] bg-[#FAF8F3] p-6 sm:p-7">
              <div className="inline-flex items-center gap-1.5 rounded-xs bg-[#174F73] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                <Lock className="h-3.5 w-3.5 text-[#C59B4B]" />
                <span>{dict.paywall.badge}</span>
              </div>

              <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-[#174F73]">
                {dict.paywall.title}
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-[#292725]/80 leading-relaxed">
                {dict.paywall.description}
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-[#292725]/85">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#174F73]" />
                  <span>
                    {getLocalizedText(article.epaperEdition, locale)} —{" "}
                    {dict.paywall.editionReference} {article.epaperPageNumber}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#174F73]" />
                  <span>
                    {locale === "gu"
                      ? "સંપૂર્ણ ૧૬ પાનાનું દૈનિક ઈ-પેપર"
                      : "Full 16-Page Broadsheet Digital Edition"}
                  </span>
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/epaper?page=${article.epaperPageNumber}`}
                  className="inline-flex items-center gap-2 rounded-md bg-[#174F73] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#103A55] transition-colors"
                >
                  <Newspaper className="h-4 w-4 text-[#C59B4B]" />
                  <span>{dict.paywall.primaryCta}</span>
                </Link>

                <Link
                  href={`/${locale}/epaper#plans`}
                  className="inline-flex items-center gap-2 rounded-md border border-[#174F73] bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#174F73] hover:bg-[#174F73]/5 transition-colors"
                >
                  <span>{dict.paywall.secondaryCta}</span>
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar: Related Category Stories */}
        <aside className="lg:col-span-4 space-y-5">
          <div className="rounded-md border border-[#292725]/15 bg-white p-5">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-[#174F73] border-b-2 border-[#174F73] pb-2 mb-4">
              {locale === "gu" ? "સંબંધિત સમાચાર" : "More in This Section"}
            </h2>
            <div className="space-y-4">
              {relatedArticles.slice(0, 3).map((rel) => (
                <NewsCard
                  key={rel.id}
                  article={rel}
                  lang={locale}
                  readInEpaperLabel={dict.home.readInEpaper}
                  compact
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
