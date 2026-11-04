"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ChevronDown,
  Menu,
  X,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import {
  FacebookIcon,
  TwitterIcon,
  YoutubeIcon,
  InstagramIcon,
} from "@/components/shared/SocialIcons";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
  searchableArticles: NewsArticle[];
}

export function Header({ lang, dict, searchableArticles }: HeaderProps) {
  const pathname = usePathname();
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const moreRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Automatically generate current date and day in the active locale
  useEffect(() => {
    const now = new Date();
    try {
      if (lang === "gu") {
        const guDate = new Intl.DateTimeFormat("gu-IN", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now);
        setFormattedDate(guDate);
      } else {
        const weekday = new Intl.DateTimeFormat("en-GB", {
          weekday: "long",
        }).format(now);
        const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now);
        setFormattedDate(`${weekday}, ${dayMonthYear}`);
      }
    } catch {
      setFormattedDate(now.toDateString());
    }
  }, [lang]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Preserve equivalent page route when switching between /en and /gu
  const getSwitchedLocaleHref = (targetLocale: Locale) => {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/");
    if (segments.length > 1 && (segments[1] === "en" || segments[1] === "gu")) {
      segments[1] = targetLocale;
      return segments.join("/") || `/${targetLocale}`;
    }
    return `/${targetLocale}`;
  };

  const primaryNav = [
    { label: dict.nav.home, href: `/${lang}`, exact: true },
    { label: dict.nav.latest, href: `/${lang}/latest` },
    { label: dict.nav.national, href: `/${lang}/category/national` },
    { label: dict.nav.city, href: `/${lang}/category/city` },
    { label: dict.nav.business, href: `/${lang}/category/business` },
    { label: dict.nav.sports, href: `/${lang}/category/sports` },
    { label: dict.nav.entertainment, href: `/${lang}/category/entertainment` },
    { label: dict.nav.editorial, href: `/${lang}/editorial` },
  ];

  const moreNav = [
    { label: dict.nav.international, href: `/${lang}/category/international` },
    { label: dict.nav.education, href: `/${lang}/category/education` },
    { label: dict.nav.religionCulture, href: `/${lang}/category/religion-culture` },
    { label: dict.nav.specialCoverage, href: `/${lang}/events` },
    { label: dict.nav.events, href: `/${lang}/events` },
    { label: dict.nav.panchang, href: `/${lang}/panchang` },
    { label: dict.nav.maran, href: `/${lang}/category/maran` },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const filteredSearchResults = searchQuery.trim()
    ? searchableArticles.filter((article) => {
        const q = searchQuery.toLowerCase();
        return (
          article.title.en.toLowerCase().includes(q) ||
          article.title.gu.toLowerCase().includes(q) ||
          article.summary.en.toLowerCase().includes(q) ||
          article.summary.gu.toLowerCase().includes(q)
        );
      })
    : searchableArticles.slice(0, 4);

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#292725]/12">
      {/* ROW 1 – TOP INFORMATION BAR */}
      <div className="bg-[#F2EFE8] border-b border-[#292725]/8 text-[#292725]/80 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          {/* Left: Automatically generated current date & day */}
          <div className="flex items-center gap-2.5 font-medium truncate">
            <span>{formattedDate || "Tuesday, 3 November 2026"}</span>
            <span className="hidden md:inline-block text-[#292725]/30">|</span>
            <span className="hidden md:inline-block text-[11px] font-semibold text-[#174F73]">
              {dict.header.demoModeNotice}
            </span>
          </div>

          {/* Right: About Us, Contact, Advertise + Social Media Icons */}
          <div className="flex items-center gap-4 sm:gap-5">
            <nav
              aria-label="Top utility links"
              className="hidden sm:flex items-center gap-4 font-medium"
            >
              <Link
                href={`/${lang}/about`}
                className="hover:text-[#174F73] transition-colors"
              >
                {dict.header.aboutUs}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="hover:text-[#174F73] transition-colors"
              >
                {dict.header.contact}
              </Link>
              <Link
                href={`/${lang}/contact?topic=advertise`}
                className="hover:text-[#174F73] transition-colors"
              >
                {dict.header.advertise}
              </Link>
            </nav>

            <span className="hidden sm:inline-block h-3 w-px bg-[#292725]/20" />

            {/* Social Media Icons (Placeholder Destinations) */}
            <div className="flex items-center gap-2.5 text-[#292725]/70">
              <a
                href="#social-facebook-placeholder"
                title="Facebook (Official URL Placeholder)"
                aria-label="Janmabhoomi on Facebook (Placeholder)"
                className="hover:text-[#174F73] transition-colors"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="#social-twitter-placeholder"
                title="X / Twitter (Official URL Placeholder)"
                aria-label="Janmabhoomi on X (Placeholder)"
                className="hover:text-[#174F73] transition-colors"
              >
                <TwitterIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="#social-youtube-placeholder"
                title="YouTube (Official URL Placeholder)"
                aria-label="Janmabhoomi on YouTube (Placeholder)"
                className="hover:text-[#174F73] transition-colors"
              >
                <YoutubeIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="#social-instagram-placeholder"
                title="Instagram (Official URL Placeholder)"
                aria-label="Janmabhoomi on Instagram (Placeholder)"
                className="hover:text-[#174F73] transition-colors"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 – MAIN BRANDING HEADER */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: Mobile Hamburger + Official Logo + JANMABHOOMI + Gujarati Tagline */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center rounded-md p-1.5 sm:p-2 text-[#292725] hover:bg-[#FAF8F3] border border-[#292725]/15 shrink-0"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link
              href={`/${lang}`}
              className="flex items-center gap-2 sm:gap-4 group min-w-0"
            >
              <div className="hidden sm:block">
                <BrandLogo />
              </div>
              <div className="sm:hidden">
                <BrandLogo compact />
              </div>

              <div className="flex flex-col justify-center min-w-0">
                <span className="text-base sm:text-2xl md:text-[26px] font-bold tracking-wide text-[#174F73] leading-tight truncate">
                  {dict.header.brandName}
                </span>
                <span className="font-gujarati text-[11px] sm:text-sm md:text-[15px] text-[#292725]/80 font-medium tracking-normal mt-0.5 truncate">
                  {dict.header.tagline}
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Compact Search Button + Prominent E-PAPER CTA + Gujarati | EN Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Compact Search Trigger matching reference screenshot */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#292725]/20 bg-white px-2 sm:px-3.5 py-2 text-xs sm:text-sm font-medium text-[#292725]/80 hover:border-[#174F73] hover:text-[#174F73] transition-colors cursor-pointer"
              aria-label={dict.header.searchButton}
            >
              <Search className="h-4 w-4 text-[#174F73]" />
              <span className="hidden sm:inline">{dict.header.searchButton}</span>
            </button>

            {/* Prominent E-PAPER Button (Strongest CTA) */}
            <Link
              href={`/${lang}/epaper`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#174F73] hover:bg-[#103A55] px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-bold tracking-wide text-white transition-colors"
            >
              <Newspaper className="h-4 w-4 hidden md:inline" />
              <span>{dict.header.epaperCta}</span>
            </Link>

            {/* Gujarati | EN Language Switcher */}
            <div
              className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold pl-0.5 sm:pl-1"
              aria-label="Language switcher"
            >
              <Link
                href={getSwitchedLocaleHref("gu")}
                className={`font-gujarati transition-colors ${
                  lang === "gu"
                    ? "text-[#174F73] font-bold underline underline-offset-4"
                    : "text-[#174F73]/75 hover:text-[#174F73]"
                }`}
              >
                ગુજરાતી
              </Link>
              <span className="text-[#174F73]/50">|</span>
              <Link
                href={getSwitchedLocaleHref("en")}
                className={`transition-colors ${
                  lang === "en"
                    ? "text-[#174F73] font-bold underline underline-offset-4"
                    : "text-[#174F73]/75 hover:text-[#174F73]"
                }`}
              >
                EN
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* EXPANDABLE COMPACT SEARCH BAR */}
      {searchOpen && (
        <div className="border-t border-[#292725]/10 bg-[#FAF8F3] px-4 py-3">
          <div className="mx-auto max-w-4xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-[#292725]/50" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.header.searchPlaceholder}
                className="w-full rounded-md border border-[#292725]/25 bg-white pl-10 pr-10 py-2 text-sm text-[#292725] focus:border-[#174F73] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="absolute right-2.5 p-1 text-[#292725]/60 hover:text-[#292725]"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Instant Search Results Preview or Empty State */}
            {filteredSearchResults.length > 0 ? (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredSearchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${lang}/article/${item.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-start justify-between gap-2 rounded border border-[#292725]/10 bg-white p-2.5 hover:border-[#174F73] transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase text-[#174F73]">
                        {getLocalizedText(item.categoryLabel, lang)}
                      </span>
                      <p className="text-xs font-semibold text-[#292725] line-clamp-1 mt-0.5">
                        {getLocalizedText(item.title, lang)}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#174F73] shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-2.5 rounded border border-[#292725]/10 bg-white p-3 text-center text-xs font-medium text-[#292725]/70">
                {dict.header.searchNoResults}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROW 3 – DESKTOP CATEGORY NAVIGATION */}
      <div className="hidden lg:block bg-white border-t border-[#292725]/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Main category navigation"
            className="flex items-center gap-6 xl:gap-7 h-10 text-[15px]"
          >
            {primaryNav.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative h-full inline-flex items-center transition-colors ${
                    active
                      ? "font-bold text-[#174F73] border-b-2 border-[#174F73]"
                      : "font-medium text-[#292725]/90 hover:text-[#174F73]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* More Dropdown */}
            <div className="relative h-full flex items-center" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(!moreOpen)}
                className="inline-flex items-center gap-1 font-medium text-[#292725]/90 hover:text-[#174F73] cursor-pointer"
                aria-expanded={moreOpen}
              >
                <span>{dict.nav.more}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    moreOpen ? "rotate-180 text-[#174F73]" : ""
                  }`}
                />
              </button>

              {moreOpen && (
                <div className="absolute left-0 top-full mt-0.5 w-56 rounded-md border border-[#292725]/15 bg-white py-1.5 shadow-md z-50">
                  {moreNav.map((sub) => (
                    <Link
                      key={sub.label + sub.href}
                      href={sub.href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm text-[#292725] hover:bg-[#FAF8F3] hover:text-[#174F73] font-medium"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#292725]/15 bg-white px-4 pt-3 pb-5 space-y-4">
          <div className="grid grid-cols-2 gap-1.5">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded px-3 py-2 text-sm ${
                  isActive(item.href, item.exact)
                    ? "bg-[#174F73] text-white font-semibold"
                    : "bg-[#FAF8F3] text-[#292725] font-medium hover:text-[#174F73]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-[#292725]/10 pt-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#292725]/50 mb-2">
              {dict.nav.more}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {moreNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded px-3 py-1.5 text-xs font-medium text-[#292725]/85 hover:bg-[#FAF8F3] hover:text-[#174F73]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-[#292725]/10 pt-3 flex items-center justify-between text-xs font-medium text-[#292725]/80">
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/about`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {dict.header.aboutUs}
              </Link>
              <Link
                href={`/${lang}/contact`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {dict.header.contact}
              </Link>
              <Link
                href={`/${lang}/contact?topic=advertise`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {dict.header.advertise}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
