import React from "react";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { SpecialCoverageSection } from "@/components/home/SpecialCoverageSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  return {
    title: dict.home.specialCoverageTitle,
  };
}

export default async function EventsAndSpecialCoveragePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const specialData = await newsDataProvider.getSpecialCoverageAndEvents();

  return (
    <div className="py-4">
      <SpecialCoverageSection
        featuredCoverage={specialData.featuredCoverage}
        events={specialData.events}
        lang={locale}
        dict={dict}
      />
    </div>
  );
}
