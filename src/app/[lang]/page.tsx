import React from "react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { CategorySlug, NewsArticle } from "@/lib/data/types";
import { BreakingNewsTicker } from "@/components/home/BreakingNewsTicker";
import { AudioBulletinBar } from "@/components/home/AudioBulletinBar";
import { LeadStoryHero } from "@/components/home/LeadStoryHero";
import { AdPlacement } from "@/components/home/AdPlacement";
import { PanchangWidget } from "@/components/home/PanchangWidget";
import { MaranDirectoryWidget } from "@/components/home/MaranDirectoryWidget";
import { LatestEventsSection } from "@/components/home/LatestEventsSection";
import { CategoryCarousel, CategoryCardItem } from "@/components/home/CategoryCarousel";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const dict = getDictionary(locale);

  // Fetch all homepage sections through the Data Provider Abstraction
  const [
    breakingNews,
    heroData,
    primaryAd,
    nationalArticles,
    cityArticles,
    businessArticles,
    sportsArticles,
    entertainmentArticles,
    editorialArticles,
    maranArticles,
    specialCoverageData,
    dailyPanchang,
  ] = await Promise.all([
    newsDataProvider.getBreakingNews(),
    newsDataProvider.getHomepageHeroData(),
    newsDataProvider.getAdvertisementSlot("homepagePrimaryHorizontal"),
    newsDataProvider.getArticlesByCategory("national", 6),
    newsDataProvider.getArticlesByCategory("city", 6),
    newsDataProvider.getArticlesByCategory("business", 6),
    newsDataProvider.getArticlesByCategory("sports", 6),
    newsDataProvider.getArticlesByCategory("entertainment", 6),
    newsDataProvider.getArticlesByCategory("editorial", 6),
    newsDataProvider.getArticlesByCategory("maran", 6),
    newsDataProvider.getSpecialCoverageAndEvents(),
    newsDataProvider.getDailyPanchang(),
  ]);

  // Lead stories for the hero carousel (main lead + sub-leads)
  const leadStories = [heroData.leadStory, ...heroData.subLeadStories].filter(Boolean);

  // Build Audio Bulletin top 5 distinct headlines
  const bulletinArticles: NewsArticle[] = [];
  const bulletinSlugs = new Set<string>();
  for (const a of [...leadStories, ...breakingNews, ...heroData.headlineBriefs]) {
    if (a && !bulletinSlugs.has(a.slug)) {
      bulletinSlugs.add(a.slug);
      bulletinArticles.push(a);
    }
    if (bulletinArticles.length >= 5) break;
  }

  // Track slugs already featured in Lead Story Hero so Our News Coverage pulls distinct, non-overlapping articles
  const usedSlugs = new Set<string>(
    [...leadStories, ...heroData.headlineBriefs].filter(Boolean).map((a) => a.slug)
  );

  const pickDistinctArticle = (pool: NewsArticle[]): NewsArticle | undefined => {
    if (!pool || pool.length === 0) return undefined;
    const fresh = pool.find((a) => a && !usedSlugs.has(a.slug));
    const chosen = fresh || pool[0];
    if (chosen) usedSlugs.add(chosen.slug);
    return chosen;
  };

  const eventArticle: NewsArticle | undefined = specialCoverageData.events?.[0]
    ? {
        id: specialCoverageData.events[0].id,
        slug: specialCoverageData.events[0].id,
        category: "events" as CategorySlug,
        categoryLabel: { en: "Events & Forums", gu: "કાર્યક્રમો અને સંવાદ" },
        title: specialCoverageData.events[0].title,
        summary: specialCoverageData.events[0].description,
        teaserParagraphs: { en: [], gu: [] },
        imageUrl: specialCoverageData.events[0].imageUrl || "/assets/images/epaper-placeholder.jpg",
        imageCaption: { en: "Janmabhoomi Events", gu: "જન્મભૂમિ કાર્યક્રમો" },
        author: { en: "Janmabhoomi Desk", gu: "જન્મભૂમિ સંપાદકીય" },
        location: specialCoverageData.events[0].location,
        publishedAt: "2026-11-21T10:00:00+05:30",
        readTimeMinutes: 3,
        epaperPageNumber: 2,
        epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
        isDemonstrationData: true,
      }
    : undefined;

  // The 8 Distinct Editorial Desks for Our News Coverage Grid (non-overlapping articles)
  const categoryCarouselItems: CategoryCardItem[] = [
    {
      slug: "national",
      name: { en: "National", gu: "રાષ્ટ્રીય" },
      ctaText: { en: "Explore National News", gu: "રાષ્ટ્રીય સમાચાર જુઓ" },
      href: `/${locale}/category/national`,
      article: pickDistinctArticle(nationalArticles),
    },
    {
      slug: "city",
      name: { en: "City (Mumbai & Gujarat)", gu: "શહેર (મુંબઈ અને ગુજરાત)" },
      ctaText: { en: "Explore City News", gu: "શહેર સમાચાર જુઓ" },
      href: `/${locale}/category/city`,
      article: pickDistinctArticle(cityArticles),
    },
    {
      slug: "business",
      name: { en: "Business & Markets", gu: "વ્યાપાર અને બજાર" },
      ctaText: { en: "Explore Business News", gu: "વ્યાપાર સમાચાર જુઓ" },
      href: `/${locale}/category/business`,
      article: pickDistinctArticle(businessArticles),
    },
    {
      slug: "sports",
      name: { en: "Sports", gu: "રમતગમત" },
      ctaText: { en: "Explore Sports News", gu: "રમતગમત સમાચાર જુઓ" },
      href: `/${locale}/category/sports`,
      article: pickDistinctArticle(sportsArticles),
    },
    {
      slug: "entertainment",
      name: { en: "Entertainment & Arts", gu: "મનોરંજન અને કલા" },
      ctaText: { en: "Explore Entertainment News", gu: "મનોરંજન સમાચાર જુઓ" },
      href: `/${locale}/category/entertainment`,
      article: pickDistinctArticle(entertainmentArticles),
    },
    {
      slug: "editorial",
      name: { en: "Editorial (અગ્રલેખ)", gu: "અગ્રલેખ અને વિચાર" },
      ctaText: { en: "Explore Editorials", gu: "અગ્રલેખ વાંચો" },
      href: `/${locale}/editorial`,
      article: pickDistinctArticle(editorialArticles),
    },
    {
      slug: "maran",
      name: { en: "Maran (Obituaries)", gu: "મરણ નોંધ અને બેસણું" },
      ctaText: { en: "Explore Obituaries", gu: "મરણ નોંધ જુઓ" },
      href: `/${locale}/category/maran`,
      article: pickDistinctArticle(maranArticles),
    },
    {
      slug: "events",
      name: { en: "Conclaves & Forums", gu: "વિશેષ આયોજનો અને સંવાદ" },
      ctaText: { en: "Explore Forums & Events", gu: "સંવાદ અને આયોજનો જુઓ" },
      href: `/${locale}/events`,
      article: eventArticle,
      emptyStateText: {
        en: "Conclaves, literary awards, and civic assemblies organized by Saurashtra Trust.",
        gu: "સૌરાષ્ટ્ર ટ્રસ્ટ દ્વારા આયોજિત સાહિત્યિક અને નાગરિક સંવાદ કાર્યક્રમો.",
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* SECTION 1 – Breaking News Ticker */}
      <BreakingNewsTicker
        articles={breakingNews}
        lang={locale}
        label={dict.home.breakingNews}
      />

      {/* SECTION 2 – Commuter 2-Minute Audio Bulletin Bar */}
      <AudioBulletinBar articles={bulletinArticles} lang={locale} />

      {/* SECTION 3 – Main Lead Story Carousel & Headlines Panel */}
      <LeadStoryHero
        leadStories={leadStories}
        headlineBriefs={heroData.headlineBriefs}
        lang={locale}
        dict={dict}
      />

      {/* SECTION 4 – City-Switchable Live Daily Panchang */}
      <PanchangWidget
        panchang={dailyPanchang}
        lang={locale}
        dict={dict}
        showChoghadiya={true}
      />

      {/* SECTION 5 – Searchable Maran / Besanu (Obituaries) Directory */}
      <MaranDirectoryWidget lang={locale} />

      {/* SECTION 6 – Advertisement Placement */}
      <AdPlacement
        slot={primaryAd}
        lang={locale}
        label={dict.home.advertisementLabel}
      />

      {/* SECTION 7 – Conclaves & Civic Dialogue Forums */}
      <LatestEventsSection
        events={specialCoverageData.events}
        lang={locale}
      />

      {/* SECTION 8 – Deduplicated 8-Desk News Coverage Grid */}
      <CategoryCarousel
        categories={categoryCarouselItems}
        lang={locale}
        dict={dict}
      />
    </div>
  );
}
