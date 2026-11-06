import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { newsDataProvider } from "@/lib/data/provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SubscriptionPopup } from "@/components/layout/SubscriptionPopup";
import { HtmlLangSetter } from "@/components/shared/HtmlLangSetter";

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
      lang={lang}
      dir="ltr"
      className={
        lang === "gu"
          ? "font-gujarati min-h-screen flex flex-col"
          : "font-sans min-h-screen flex flex-col"
      }
    >
      {/* Immediate synchronous documentElement language synchronization */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang="${lang}";document.documentElement.dir="ltr";`,
        }}
      />
      <HtmlLangSetter lang={lang} />

      {/* Accessible Skip to Main Content Link (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-[#016BB7] focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#016BB7]"
      >
        {lang === "gu" ? "મુખ્ય સામગ્રી પર જાઓ" : "Skip to main content"}
      </a>

      <Header
        lang={lang}
        dict={dict}
        searchableArticles={latestArticles}
      />
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer lang={lang} dict={dict} />
      <SubscriptionPopup lang={lang} dict={dict} />
    </div>
  );
}
