import { CategorySlug } from "../types";

export type HomepageSectionType =
  | "breaking-news"
  | "hero-lead"
  | "advertisement-primary"
  | "category-block"
  | "special-coverage"
  | "editorial"
  | "panchang"
  | "epaper-banner"
  | "sister-publications";

export interface HomepageSectionConfig {
  id: string;
  type: HomepageSectionType;
  enabled: boolean;
  order: number;
  categorySlug?: CategorySlug;
  customOptions?: Record<string, unknown>;
}

export interface HomepageLayoutConfig {
  publicationId: string;
  sections: HomepageSectionConfig[];
  heroConfiguration: {
    leadStorySlot: string; // id or selector for main 6-col story
    subLeadSlots: string[]; // ids for 2 stacked 3-col stories
    headlineBriefCount: number; // count for right 3-col list
  };
  categoriesDisplayOrder: CategorySlug[];
}

/**
 * Canonical Default Homepage Layout
 * Matches the approved 9-section print-to-digital layout.
 * Can be overridden in future by an admin CMS API response without modifying React code.
 */
export const DEFAULT_HOMEPAGE_CONFIG: HomepageLayoutConfig = {
  publicationId: "pub-janmabhoomi",
  heroConfiguration: {
    leadStorySlot: "jb-lead-01",
    subLeadSlots: ["jb-sub-01", "jb-sub-02"],
    headlineBriefCount: 4,
  },
  categoriesDisplayOrder: [
    "national",
    "city",
    "business",
    "sports",
    "entertainment",
  ],
  sections: [
    { id: "sec-ticker", type: "breaking-news", enabled: true, order: 1 },
    { id: "sec-hero", type: "hero-lead", enabled: true, order: 2 },
    { id: "sec-ad-1", type: "advertisement-primary", enabled: true, order: 3 },
    { id: "sec-cat-national", type: "category-block", categorySlug: "national", enabled: true, order: 4 },
    { id: "sec-cat-city", type: "category-block", categorySlug: "city", enabled: true, order: 5 },
    { id: "sec-cat-business", type: "category-block", categorySlug: "business", enabled: true, order: 6 },
    { id: "sec-cat-sports", type: "category-block", categorySlug: "sports", enabled: true, order: 7 },
    { id: "sec-cat-entertainment", type: "category-block", categorySlug: "entertainment", enabled: true, order: 8 },
    { id: "sec-special", type: "special-coverage", enabled: true, order: 9 },
    { id: "sec-editorial", type: "editorial", enabled: true, order: 10 },
    { id: "sec-panchang", type: "panchang", enabled: true, order: 11 },
    { id: "sec-epaper", type: "epaper-banner", enabled: true, order: 12 },
    { id: "sec-publications", type: "sister-publications", enabled: true, order: 13 },
  ],
};
