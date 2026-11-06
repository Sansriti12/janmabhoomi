import type { MetadataRoute } from "next";
import { newsDataProvider } from "@/lib/data/provider";
import { i18nConfig } from "@/lib/i18n/config";
import { CategorySlug } from "@/lib/data/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.janmabhoomi.in";

  // Categories with dedicated canonical feed routes under /category/[slug]
  // Note: 'editorial' and 'events' have dedicated top-level routes (/editorial and /events)
  // and are excluded here to eliminate duplicate canonical URL generation (AUDIT-02 fix).
  const feedCategories: CategorySlug[] = [
    "national",
    "city",
    "business",
    "sports",
    "entertainment",
    "maran",
    "international",
    "education",
    "religion-culture",
    "special-coverage",
  ];

  const articles = await newsDataProvider.getLatestArticles(50);
  const staticSections = [
    "",
    "/latest",
    "/editorial",
    "/editorial/archive",
    "/epaper",
    "/events",
    "/panchang",
    "/about",
    "/contact",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of i18nConfig.locales) {
    const otherLocale = locale === "en" ? "gu" : "en";

    // 1. Static Pages
    for (const section of staticSections) {
      entries.push({
        url: `${baseUrl}/${locale}${section}`,
        lastModified: new Date(),
        changeFrequency:
          section === "" || section === "/latest" ? "hourly" : "daily",
        priority:
          section === ""
            ? 1.0
            : section === "/latest" || section === "/epaper"
            ? 0.9
            : 0.7,
        alternates: {
          languages: {
            [locale]: `${baseUrl}/${locale}${section}`,
            [otherLocale]: `${baseUrl}/${otherLocale}${section}`,
          },
        },
      });
    }

    // 2. Category Feeds (Only distinct feeds)
    for (const cat of feedCategories) {
      entries.push({
        url: `${baseUrl}/${locale}/category/${cat}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
        alternates: {
          languages: {
            [locale]: `${baseUrl}/${locale}/category/${cat}`,
            [otherLocale]: `${baseUrl}/${otherLocale}/category/${cat}`,
          },
        },
      });
    }

    // 3. News Articles (Only public previews indexed)
    for (const article of articles) {
      entries.push({
        url: `${baseUrl}/${locale}/article/${article.slug}`,
        lastModified: new Date(article.publishedAt),
        changeFrequency: "weekly",
        priority: article.isLeadStory ? 0.9 : 0.6,
        alternates: {
          languages: {
            [locale]: `${baseUrl}/${locale}/article/${article.slug}`,
            [otherLocale]: `${baseUrl}/${otherLocale}/article/${article.slug}`,
          },
        },
      });
    }
  }

  return entries;
}
