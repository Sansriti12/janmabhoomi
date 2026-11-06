import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { CATEGORY_METADATA } from "@/lib/data/mock/dataset";
import { CategorySlug, getLocalizedText } from "@/lib/data/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  return {
    title:
      locale === "gu"
        ? "તમામ સમાચાર વિભાગો | જન્મભૂમિ"
        : "All News Categories | Janmabhoomi",
    description:
      locale === "gu"
        ? "જન્મભૂમિના તમામ સમાચાર વિભાગો: રાષ્ટ્રીય, મુંબઈ અને ગુજરાત શહેર સમાચાર, વ્યાપાર, રમતગમત, મનોરંજન અને અગ્રલેખ."
        : "Complete directory of news categories: National, City, Business, Sports, Entertainment, and Editorial.",
  };
}

export default async function AllCategoriesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const dict = getDictionary(locale);

  const categories = Object.entries(CATEGORY_METADATA).map(
    ([slug, meta]) => ({
      slug: slug as CategorySlug,
      title: getLocalizedText(meta.title, locale),
      description: getLocalizedText(meta.description, locale),
      href:
        slug === "editorial"
          ? `/${locale}/editorial`
          : slug === "events"
          ? `/${locale}/events`
          : `/${locale}/category/${slug}`,
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header */}
      <div className="border-b-2 border-[#016BB7] pb-4 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#016BB7]">
          {locale === "gu" ? "સમાચાર ડિરેક્ટરી" : "NEWS DIRECTORY"}
        </span>
        <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#016BB7]">
          {locale === "gu" ? "તમામ સમાચાર વિભાગો" : "All News Categories"}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#1F2937]/75 max-w-2xl">
          {locale === "gu"
            ? "જન્મભૂમિના તમામ સંપાદકીય વિભાગો, વિશેષ કવરેજ, વ્યાપારી સમાચારો અને અગ્રલેખ આર્કાઇવ્સ બ્રાઉઝ કરો."
            : "Browse all editorial sections, investigative coverage, market reports, and archival dispatches."}
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={cat.href}
            className="group flex flex-col justify-between rounded-xl border border-[#016BB7]/20 bg-white p-6 transition-all hover:border-[#016BB7] hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#F0F6FA] border border-[#016BB7]/20 px-2.5 py-1 text-xs font-bold text-[#016BB7]">
                  <Newspaper className="h-3.5 w-3.5" />
                  <span>{cat.slug.toUpperCase()}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-[#016BB7] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h2 className="text-lg font-bold text-[#1F2937] group-hover:text-[#016BB7] transition-colors">
                {cat.title}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-[#1F2937]/75 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#016BB7]/10 flex items-center justify-between text-xs font-bold text-[#016BB7]">
              <span>{locale === "gu" ? "વિભાગ જુઓ" : "View Section"}</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
