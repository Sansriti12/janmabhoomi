import React from "react";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";

interface NewsArticleJsonLdProps {
  article: NewsArticle;
  lang: Locale;
  siteUrl: string;
}

/**
 * NewsArticle Structured Data (JSON-LD)
 * Conforms to Google News and Schema.org standards for subscription-gated journalism:
 * - Declares `NewsArticle` with headline, image, published dates, and author
 * - Expresses `isAccessibleForFree: false` for the E-Paper gated portion
 */
export function NewsArticleJsonLd({
  article,
  lang,
  siteUrl,
}: NewsArticleJsonLdProps) {
  const headline = getLocalizedText(article.title, lang);
  const description = getLocalizedText(article.summary, lang);
  const authorName = getLocalizedText(article.author, lang);
  const canonicalUrl = `${siteUrl}/${lang}/article/${article.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    headline,
    description,
    image: [article.imageUrl],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    author: [
      {
        "@type": "Person",
        name: authorName,
      },
    ],
    publisher: {
      "@type": "NewsMediaOrganization",
      name: "Janmabhoomi (Saurashtra Trust)",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.svg`,
      },
    },
    inLanguage: lang === "gu" ? "gu-IN" : "en-GB",
    isAccessibleForFree: false,
    hasPart: {
      "@type": "WebPageElement",
      isAccessibleForFree: false,
      cssSelector: "#epaper-subscription-gate",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
