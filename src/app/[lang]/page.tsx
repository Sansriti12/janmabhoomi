import React from "react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { CategorySlug } from "@/lib/data/types";
import { BreakingNewsTicker } from "@/components/home/BreakingNewsTicker";
import { LeadStoryHero } from "@/components/home/LeadStoryHero";
import { AdPlacement } from "@/components/home/AdPlacement";
import { CategorySection } from "@/components/home/CategorySection";
import { SpecialCoverageSection } from "@/components/home/SpecialCoverageSection";
import { EditorialSection } from "@/components/home/EditorialSection";
import { PanchangWidget } from "@/components/home/PanchangWidget";
import { PublicationsSection } from "@/components/home/PublicationsSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
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
    specialCoverageData,
    editorialsData,
    panchangData,
    sisterPublications,
  ] = await Promise.all([
    newsDataProvider.getBreakingNews(),
    newsDataProvider.getHomepageHeroData(),
    newsDataProvider.getAdvertisementSlot("homepagePrimaryHorizontal"),
    newsDataProvider.getArticlesByCategory("national", 3),
    newsDataProvider.getArticlesByCategory("city", 3),
    newsDataProvider.getArticlesByCategory("business", 3),
    newsDataProvider.getArticlesByCategory("sports", 3),
    newsDataProvider.getArticlesByCategory("entertainment", 3),
    newsDataProvider.getSpecialCoverageAndEvents(),
    newsDataProvider.getEditorials(),
    newsDataProvider.getDailyPanchang(),
    newsDataProvider.getSisterPublications(),
  ]);

  const categoryBlocks: Array<{
    slug: CategorySlug;
    title: string;
    articles: typeof nationalArticles;
  }> = [
    {
      slug: "national",
      title: dict.nav.national,
      articles: nationalArticles,
    },
    {
      slug: "city",
      title: dict.nav.city,
      articles: cityArticles,
    },
    {
      slug: "business",
      title: dict.nav.business,
      articles: businessArticles,
    },
    {
      slug: "sports",
      title: dict.nav.sports,
      articles: sportsArticles,
    },
    {
      slug: "entertainment",
      title: dict.nav.entertainment,
      articles: entertainmentArticles,
    },
  ];

  return (
    <div>
      {/* SECTION 1 – Breaking News Ticker */}
      <BreakingNewsTicker
        articles={breakingNews}
        lang={locale}
        label={dict.home.breakingNews}
      />

      {/* SECTION 2 – Main Lead Story (1 Large Lead + 2 Visual Stories + Compact Headline List) */}
      <LeadStoryHero
        leadStory={heroData.leadStory}
        subLeadStories={heroData.subLeadStories}
        headlineBriefs={heroData.headlineBriefs}
        lang={locale}
        dict={dict}
      />

      {/* SECTION 3 – Advertisement Placement (Defined Horizontal Ad Area) */}
      <AdPlacement
        slot={primaryAd}
        lang={locale}
        label={dict.home.advertisementLabel}
      />

      {/* SECTION 4 – Category News Sections (National, City, Business, Sports, Entertainment) */}
      {categoryBlocks.map((block) => (
        <CategorySection
          key={block.slug}
          slug={block.slug}
          title={block.title}
          articles={block.articles}
          lang={locale}
          viewAllLabel={`${dict.home.viewAll} ${block.title}`}
          readInEpaperLabel={dict.home.readInEpaper}
        />
      ))}

      {/* SECTION 5 – Special Coverage and Events */}
      <SpecialCoverageSection
        featuredCoverage={specialCoverageData.featuredCoverage}
        events={specialCoverageData.events}
        lang={locale}
        dict={dict}
      />

      {/* SECTION 6 – Editorial and Opinions (Retaining અગ્રલેખ identity) */}
      <EditorialSection
        todaysEditorial={editorialsData.todaysEditorial}
        previousEditorials={editorialsData.previousEditorials}
        lang={locale}
        dict={dict}
      />

      {/* SECTION 7 – Panchang (Clearly Labelled Sample Data) */}
      <PanchangWidget
        panchang={panchangData}
        lang={locale}
        dict={dict}
      />

      {/* SECTION 8 – E-Paper Promotion and Sister Publications with Logos */}
      <PublicationsSection
        publications={sisterPublications}
        lang={locale}
        dict={dict}
      />
    </div>
  );
}
