import React from "react";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { PanchangWidget } from "@/components/home/PanchangWidget";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  return {
    title: `${dict.home.panchangTitle} (પંચાંગ)`,
  };
}

export default async function PanchangPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const panchang = await newsDataProvider.getDailyPanchang();

  return (
    <div className="py-6">
      <PanchangWidget panchang={panchang} lang={locale} dict={dict} />
    </div>
  );
}
