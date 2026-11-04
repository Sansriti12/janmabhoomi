import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SubscriptionPopup } from "@/components/layout/SubscriptionPopup";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const validLang: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(validLang);

  return {
    title: dict.meta.siteTitle,
    description: dict.meta.siteDescription,
    alternates: {
      languages: {
        en: "/en",
        gu: "/gu",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  const dict = getDictionary(lang);
  const latestArticles = await newsDataProvider.getLatestArticles(10);

  return (
    <div
      className={
        lang === "gu"
          ? "font-gujarati min-h-screen flex flex-col"
          : "font-sans min-h-screen flex flex-col"
      }
    >
      <Header
        lang={lang}
        dict={dict}
        searchableArticles={latestArticles}
      />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} dict={dict} />
      <SubscriptionPopup lang={lang} dict={dict} />
    </div>
  );
}
