import React from "react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { CategorySlug, NewsArticle } from "@/lib/data/types";
import { BreakingNewsTicker } from "@/components/home/BreakingNewsTicker";
import { LeadStoryHero } from "@/components/home/LeadStoryHero";
import { AdPlacement } from "@/components/home/AdPlacement";
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
  ] = await Promise.all([
    newsDataProvider.getBreakingNews(),
    newsDataProvider.getHomepageHeroData(),
    newsDataProvider.getAdvertisementSlot("homepagePrimaryHorizontal"),
    newsDataProvider.getArticlesByCategory("national", 1),
    newsDataProvider.getArticlesByCategory("city", 1),
    newsDataProvider.getArticlesByCategory("business", 1),
    newsDataProvider.getArticlesByCategory("sports", 1),
    newsDataProvider.getArticlesByCategory("entertainment", 1),
    newsDataProvider.getArticlesByCategory("editorial", 1),
    newsDataProvider.getArticlesByCategory("maran", 1),
    newsDataProvider.getSpecialCoverageAndEvents(),
  ]);

  // Lead stories for the hero carousel (main lead + sub-leads)
  const leadStories = [heroData.leadStory, ...heroData.subLeadStories];

  // Map special coverage to article contract for category carousel
  const specialCoverageArticle: NewsArticle | undefined = specialCoverageData.featuredCoverage
    ? {
        id: specialCoverageData.featuredCoverage.id,
        slug: specialCoverageData.featuredCoverage.id,
        category: "special-coverage" as CategorySlug,
        categoryLabel: { en: "Special Coverage", gu: "વિશેષ કવરેજ" },
        title: specialCoverageData.featuredCoverage.title,
        summary: specialCoverageData.featuredCoverage.description,
        teaserParagraphs: { en: [], gu: [] },
        imageUrl: specialCoverageData.featuredCoverage.imageUrl,
        imageCaption: { en: "Special Coverage", gu: "વિશેષ કવરેજ" },
        author: { en: "Janmabhoomi Bureau", gu: "જન્મભૂમિ બ્યુરો" },
        location: specialCoverageData.featuredCoverage.location,
        publishedAt: "2026-11-03T09:00:00+05:30",
        readTimeMinutes: 5,
        epaperPageNumber: 1,
        epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
        isDemonstrationData: true,
      }
    : undefined;

  const eventArticle: NewsArticle | undefined = specialCoverageData.events?.[0]
    ? {
        id: specialCoverageData.events[0].id,
        slug: specialCoverageData.events[0].id,
        category: "events" as CategorySlug,
        categoryLabel: { en: "Events", gu: "કાર્યક્રમો" },
        title: specialCoverageData.events[0].title,
        summary: specialCoverageData.events[0].description,
        teaserParagraphs: { en: [], gu: [] },
        imageUrl: specialCoverageData.events[0].imageUrl || "/assets/images/epaper-placeholder.jpg",
        imageCaption: { en: "Janmabhoomi Events", gu: "જન્મભૂમિ કાર્યક્રમો" },
        author: { en: "Janmabhoomi Desk", gu: "જન્મભૂમિ સંપાદકીય" },
        location: specialCoverageData.events[0].location,
        publishedAt: "2026-11-03T10:00:00+05:30",
        readTimeMinutes: 3,
        epaperPageNumber: 2,
        epaperEdition: { en: "Mumbai Main Edition", gu: "મુંબઈ મુખ્ય આવૃત્તિ" },
        isDemonstrationData: true,
      }
    : undefined;

  // The 12 Category Desks configured into 2 groups of 6 for the 10-second rotating carousel
  const categoryCarouselItems: CategoryCardItem[] = [
    // GROUP 1 (Items 1 to 6)
    {
      slug: "national",
      name: { en: "National", gu: "રાષ્ટ્રીય" },
      ctaText: { en: "Explore National News", gu: "રાષ્ટ્રીય સમાચાર જુઓ" },
      href: `/${locale}/category/national`,
      article: nationalArticles[0],
    },
    {
      slug: "city",
      name: { en: "City (Mumbai & Gujarat)", gu: "શહેર (મુંબઈ અને ગુજરાત)" },
      ctaText: { en: "Explore City News", gu: "શહેર સમાચાર જુઓ" },
      href: `/${locale}/category/city`,
      article: cityArticles[0],
    },
    {
      slug: "business",
      name: { en: "Business & Markets", gu: "વ્યાપાર અને બજાર" },
      ctaText: { en: "Explore Business News", gu: "વ્યાપાર સમાચાર જુઓ" },
      href: `/${locale}/category/business`,
      article: businessArticles[0],
    },
    {
      slug: "sports",
      name: { en: "Sports", gu: "રમતગમત" },
      ctaText: { en: "Explore Sports News", gu: "રમતગમત સમાચાર જુઓ" },
      href: `/${locale}/category/sports`,
      article: sportsArticles[0],
    },
    {
      slug: "entertainment",
      name: { en: "Entertainment & Arts", gu: "મનોરંજન અને કલા" },
      ctaText: { en: "Explore Entertainment News", gu: "મનોરંજન સમાચાર જુઓ" },
      href: `/${locale}/category/entertainment`,
      article: entertainmentArticles[0],
    },
    {
      slug: "editorial",
      name: { en: "Editorial (અગ્રલેખ)", gu: "અગ્રલેખ અને વિચાર" },
      ctaText: { en: "Explore Editorials", gu: "અગ્રલેખ વાંચો" },
      href: `/${locale}/editorial`,
      article: editorialArticles[0],
    },

    // GROUP 2 (Items 7 to 12)
    {
      slug: "maran",
      name: { en: "Maran (Obituaries)", gu: "મરણ નોંધ અને બેસણું" },
      ctaText: { en: "Explore Obituaries", gu: "મરણ નોંધ જુઓ" },
      href: `/${locale}/category/maran`,
      article: maranArticles[0],
    },
    {
      slug: "international",
      name: { en: "International", gu: "આંતરરાષ્ટ્રીય" },
      ctaText: { en: "Explore World News", gu: "આંતરરાષ્ટ્રીય સમાચાર જુઓ" },
      href: `/${locale}/category/international`,
      emptyStateText: {
        en: "Global diplomatic dispatches and diaspora reports published daily in print E-Paper.",
        gu: "વૈશ્વિક રાજદ્વારી અને વિદેશ કવરેજના સમાચારો દૈનિક ઈ-પેપરમાં ઉપલબ્ધ.",
      },
    },
    {
      slug: "education",
      name: { en: "Education & Youth", gu: "શિક્ષણ અને યુવા" },
      ctaText: { en: "Explore Education News", gu: "શિક્ષણ સમાચાર જુઓ" },
      href: `/${locale}/category/education`,
      emptyStateText: {
        en: "Board exam dossiers, university circulars, and youth career supplements in daily edition.",
        gu: "યુનિવર્સિટી, બોર્ડ પરીક્ષાઓ અને નવી શિક્ષણ નીતિ અંગેના સમાચાર દૈનિક અખબારમાં.",
      },
    },
    {
      slug: "religion-culture",
      name: { en: "Religion & Culture", gu: "ધર્મ અને સંસ્કૃતિ" },
      ctaText: { en: "Explore Culture News", gu: "ધર્મ-સંસ્કૃતિ સમાચાર જુઓ" },
      href: `/${locale}/category/religion-culture`,
      emptyStateText: {
        en: "Sacred heritage, festival almanac features, and cultural retrospectives.",
        gu: "ભારતીય સંસ્કૃતિ, તહેવારો, આધ્યાત્મિક ચિંતન અને વારસાના લેખો દૈનિક અખબારમાં.",
      },
    },
    {
      slug: "special-coverage",
      name: { en: "Special Coverage", gu: "વિશેષ કવરેજ" },
      ctaText: { en: "Explore Special Coverage", gu: "વિશેષ કવરેજ જુઓ" },
      href: `/${locale}/category/special-coverage`,
      article: specialCoverageArticle,
      emptyStateText: {
        en: "In-depth investigative reports curated by the Janmabhoomi editorial desk.",
        gu: "જન્મભૂમિ સંપાદકીય ટીમ દ્વારા તૈયાર કરાયેલ ગ્રાઉન્ડ રિપોર્ટ્સ.",
      },
    },
    {
      slug: "events",
      name: { en: "Events & Forums", gu: "કાર્યક્રમો અને સંવાદ" },
      ctaText: { en: "Explore Events & Forums", gu: "કાર્યક્રમો જુઓ" },
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

      {/* SECTION 2 – Main Lead Story Carousel & Headlines Panel */}
      <LeadStoryHero
        leadStories={leadStories}
        headlineBriefs={heroData.headlineBriefs}
        lang={locale}
        dict={dict}
      />

      {/* SECTION 3 – Advertisement Placement */}
      <AdPlacement
        slot={primaryAd}
        lang={locale}
        label={dict.home.advertisementLabel}
      />

      {/* SECTION 4 – Latest Events Section */}
      <LatestEventsSection
        events={specialCoverageData.events}
        lang={locale}
      />

      {/* SECTION 5 – Compact Category Carousel (6 Cards on Desktop with 10s Rotation) */}
      <CategoryCarousel
        categories={categoryCarouselItems}
        lang={locale}
        dict={dict}
      />
    </div>
  );
}
