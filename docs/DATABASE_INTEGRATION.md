# Janmabhoomi Multi-Publication Platform — Future Database & Backend Integration Guide

## 1. Current Phase 1 Architecture
In accordance with the Phase 1 implementation rules:
- **No production database or Supabase instance is installed.**
- **All UI components are strictly decoupled from mock content** via the `INewsDataProvider` interface in [`src/lib/data/provider.ts`](../src/lib/data/provider.ts).
- **TypeScript domain models** in [`src/lib/data/types.ts`](../src/lib/data/types.ts) define the canonical contract for articles, editorials (`અગ્રલેખ`), special coverage, Panchang, advertisements, and sister publications.

## 2. Centralised Multi-Publication Readiness
Because Janmabhoomi is the first publication in a centralised multi-publication newspaper platform (alongside *Phulchhab*, *Kutchmitra*, *Vyapar*, and *Janmabhoomi Pravasi*), the future database schema should include a top-level `publication_id` tenant key on all content tables:
- `publications` (`id`, `slug`, `name_en`, `name_gu`, `domain`, `epaper_config`)
- `articles` (`id`, `publication_id`, `slug`, `category_slug`, `title_en`, `title_gu`, `teaser_en`, `teaser_gu`, `full_body_encrypted`, `epaper_edition_id`, `epaper_page_number`, `is_breaking`, `hero_slot`, `published_at`)
- `editorials` (`id`, `publication_id`, `slug`, `tag`, `title_en`, `title_gu`, `excerpt_en`, `excerpt_gu`, `published_date`, `epaper_page_number`)
- `panchang_entries` (`id`, `entry_date`, `vikram_samvat`, `tithi_gu`, `tithi_en`, `nakshatra_gu`, `nakshatra_en`, `sunrise`, `sunset`, `rahu_kaal`)
- `subscriptions` (`id`, `user_id`, `plan_id`, `publication_scope`, `status`, `valid_until`)

## 3. Connecting the Production Database (Phase 2)
1. Implement `ApiOrDatabaseNewsProvider` conforming to `INewsDataProvider` in `src/lib/data/provider.ts`.
2. Enforce server-side entitlement checks on full article bodies so unauthenticated visitors only receive `teaserParagraphs`, preserving the paid E-Paper business model.
3. Connect the `SubscriptionPopup` component to the subscriber session state so active E-Paper subscribers never see promotional popups.
