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
  ExternalLink,
} from "lucide-react";
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  TelegramIcon,
} from "@/components/shared/SocialIcons";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";
import { getAllPublications } from "@/lib/data/config/publications";

interface HeaderProps {
  lang: Locale;
  dict: Dictionary;
  searchableArticles: NewsArticle[];
}

export function Header({ lang, dict, searchableArticles }: HeaderProps) {
  const pathname = usePathname();
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [publicationsOpen, setPublicationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const moreRef = useRef<HTMLDivElement>(null);
  const publicationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const publications = getAllPublications();
  const otherPublications = publications.filter((pub) => pub.id !== "pub-janmabhoomi");

  // Automatically generate current date and day in active locale
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

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreOpen(false);
      }
      if (
        publicationsRef.current &&
        !publicationsRef.current.contains(event.target as Node)
      ) {
        setPublicationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close open dropdowns and menus on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
        setPublicationsOpen(false);
        setSearchOpen(false);
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock background scroll when mobile navigation drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

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
  ];

  const moreNav = [
    { label: dict.nav.editorial, href: `/${lang}/editorial` },
    { label: dict.nav.international, href: `/${lang}/category/international` },
    { label: dict.nav.education, href: `/${lang}/category/education` },
    { label: dict.nav.religionCulture, href: `/${lang}/category/religion-culture` },
    { label: dict.nav.specialCoverage, href: `/${lang}/category/special-coverage` },
    { label: dict.nav.events, href: `/${lang}/events` },
    { label: dict.nav.panchang, href: `/${lang}/panchang` },
    { label: dict.nav.maran, href: `/${lang}/category/maran` },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (!pathname) return false;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isMoreActive = moreNav.some((sub) => isActive(sub.href));

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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#016BB7]/20 shadow-xs">
      {/* ROW 1 – TOP INFORMATION BAR (Exact Janmabhoomi Brand Blue #016BB7) */}
      <div
        style={{ backgroundColor: "#016BB7" }}
        className="bg-[#016BB7] border-b border-white/20 text-white text-xs"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          {/* Left: Automatically generated current date & day */}
          <div className="flex items-center gap-2.5 font-medium truncate">
            <span className="font-semibold text-white tracking-wide">{formattedDate || "મંગળવાર, ૩ નવેમ્બર ૨૦૨૬"}</span>
          </div>

          {/* Right: About Us, Contact + Official Social Handles */}
          <div className="flex items-center gap-4 sm:gap-6">
            <nav
              aria-label="Top utility links"
              className="hidden sm:flex items-center gap-4 font-semibold text-white/95"
            >
              <Link
                href={`/${lang}/about`}
                className="hover:text-white transition-colors"
              >
                {dict.header.aboutUs}
              </Link>
              <Link
                href={`/${lang}/contact`}
                className="hover:text-white transition-colors"
              >
                {dict.header.contact}
              </Link>
            </nav>

            <span className="hidden sm:inline-block h-3.5 w-px bg-white/25" />

            {/* Official Social Media Channels: @janmabhoomigroup */}
            <div className="flex items-center gap-3 text-white/95">
              <a
                href="https://facebook.com/janmabhoomigroup"
                target="_blank"
                rel="noopener noreferrer"
                title="Janmabhoomi on Facebook (@janmabhoomigroup)"
                aria-label="Janmabhoomi on Facebook"
                className="hover:text-white hover:scale-110 transition-all"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://x.com/janmabhoomigroup"
                target="_blank"
                rel="noopener noreferrer"
                title="Janmabhoomi on X / Twitter (@janmabhoomigroup)"
                aria-label="Janmabhoomi on X"
                className="hover:text-white hover:scale-110 transition-all"
              >
                <TwitterIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com/janmabhoomigroup"
                target="_blank"
                rel="noopener noreferrer"
                title="Janmabhoomi on Instagram (@janmabhoomigroup)"
                aria-label="Janmabhoomi on Instagram"
                className="hover:text-white hover:scale-110 transition-all"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://t.me/janmabhoomigroup"
                target="_blank"
                rel="noopener noreferrer"
                title="Janmabhoomi on Telegram (@janmabhoomigroup)"
                aria-label="Janmabhoomi on Telegram"
                className="hover:text-white hover:scale-110 transition-all"
              >
                <TelegramIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 – MAIN BRANDING HEADER (Prominently Centering the Official Blue Janmabhoomi Logo) */}
      <div className="bg-white overflow-hidden sm:overflow-visible">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-2 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* Left: Mobile Hamburger + Optional compact brand mark for small screens */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center rounded-lg p-1.5 sm:p-2 text-[#016BB7] hover:bg-[#F0F6FA] border border-[#016BB7]/25 shrink-0"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Centre: Official Blue Janmabhoomi Logo from Page 1 of PDF */}
          <div className="flex-1 flex justify-center items-center px-1 min-w-0">
            <Link
              href={`/${lang}`}
              className="group flex flex-col items-center text-center select-none"
              title="Janmabhoomi - જન્મભૂમિ"
            >
              <BrandLogo priority className="hover:opacity-95 transition-opacity" />
            </Link>
          </div>

          {/* Right: Search + Prominent E-PAPER CTA + Gujarati | EN Switcher */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#016BB7]/25 bg-white px-2 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#1F2937]/90 hover:border-[#016BB7] hover:text-[#016BB7] hover:bg-[#F0F6FA]/50 transition-colors cursor-pointer"
              aria-label={dict.header.searchButton}
            >
              <Search className="h-4 w-4 text-[#016BB7]" />
              <span className="hidden sm:inline">{dict.header.searchButton}</span>
            </button>

            {/* Prominent E-PAPER CTA Button */}
            <Link
              href={`/${lang}/epaper`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#016BB7] hover:bg-[#016BB7]/90 active:bg-[#015a99] px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold tracking-wide text-white transition-colors shadow-xs"
            >
              <Newspaper className="h-4 w-4 hidden md:inline" />
              <span>{dict.header.epaperCta}</span>
            </Link>

            {/* Gujarati | EN Language Switcher */}
            <div
              className="flex items-center gap-0.5 sm:gap-1.5 text-xs sm:text-sm font-bold pl-0.5 sm:pl-1"
              aria-label="Language switcher"
            >
              <Link
                href={getSwitchedLocaleHref("gu")}
                className={`font-gujarati transition-colors px-1 py-0.5 rounded ${
                  lang === "gu"
                    ? "bg-[#016BB7] text-white"
                    : "text-[#016BB7] hover:bg-[#F0F6FA]"
                }`}
              >
                ગુજરાતી
              </Link>
              <span className="text-[#016BB7]/40">/</span>
              <Link
                href={getSwitchedLocaleHref("en")}
                className={`transition-colors px-1 py-0.5 rounded ${
                  lang === "en"
                    ? "bg-[#016BB7] text-white"
                    : "text-[#016BB7] hover:bg-[#F0F6FA]"
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
        <div className="border-t border-[#016BB7]/15 bg-[#F0F6FA] px-4 py-3">
          <div className="mx-auto max-w-4xl">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-[#016BB7]" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.header.searchPlaceholder}
                className="w-full rounded-md border border-[#016BB7]/30 bg-white pl-10 pr-10 py-2 text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
                className="absolute right-2.5 p-1 text-[#1F2937]/60 hover:text-[#016BB7]"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Instant Search Results Preview */}
            {filteredSearchResults.length > 0 ? (
              <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredSearchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${lang}/article/${item.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-start justify-between gap-2 rounded border border-[#016BB7]/15 bg-white p-2.5 hover:border-[#016BB7] hover:shadow-2xs transition-all"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase text-[#016BB7]">
                        {getLocalizedText(item.categoryLabel, lang)}
                      </span>
                      <p className="text-xs font-semibold text-[#1F2937] line-clamp-1 mt-0.5">
                        {getLocalizedText(item.title, lang)}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-[#016BB7] shrink-0 mt-1" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-2.5 rounded border border-[#016BB7]/15 bg-white p-3 text-center text-xs font-medium text-[#1F2937]/70">
                {dict.header.searchNoResults}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROW 3 – DESKTOP CATEGORY NAVIGATION (Clean Text Links with Brand Blue Indicator & Hover) */}
      <div className="hidden lg:block bg-white border-t border-b border-[#016BB7]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Main category navigation"
            className="flex items-center justify-between w-full h-11 text-xs xl:text-sm font-semibold tracking-wide"
          >
            {primaryNav.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={active ? { color: "#016BB7" } : undefined}
                  className={`relative h-full flex items-center justify-center px-3 xl:px-4 transition-colors duration-150 whitespace-nowrap ${
                    active
                      ? "text-[#016BB7] font-bold"
                      : "text-[#1F2937] hover:text-[#016BB7]"
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#016BB7]" />
                  )}
                </Link>
              );
            })}

            {/* Publications Dropdown (Group's 7 other products) */}
            <div className="relative h-full" ref={publicationsRef}>
              <button
                type="button"
                onClick={() => {
                  setPublicationsOpen(!publicationsOpen);
                  setMoreOpen(false);
                }}
                className={`relative group h-full flex items-center justify-center gap-1.5 px-3 xl:px-4 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                  publicationsOpen
                    ? "text-[#016BB7] font-bold"
                    : "text-[#1F2937] hover:text-[#016BB7]"
                }`}
                aria-expanded={publicationsOpen}
                aria-haspopup="menu"
              >
                <span className="truncate">{dict.nav.publications || "Publications"}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                    publicationsOpen ? "rotate-180 text-[#016BB7]" : "text-[#1F2937] group-hover:text-[#016BB7]"
                  }`}
                />
                {publicationsOpen && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#016BB7]" />
                )}
              </button>

              {publicationsOpen && (
                <div className="absolute right-0 top-full mt-1 w-72 rounded-lg border border-[#016BB7]/20 bg-white py-2 shadow-xl z-50 text-left">
                  <div className="px-3.5 py-1.5 border-b border-[#016BB7]/10 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#016BB7]">
                      {lang === "gu" ? "સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશનો" : "Saurashtra Trust Publications"}
                    </p>
                  </div>
                  {otherPublications.map((pub) => {
                    const isExternal = pub.websiteUrl.startsWith("http");
                    const href = isExternal
                      ? pub.websiteUrl
                      : pub.slug === "panchang"
                      ? `/${lang}/panchang`
                      : pub.slug === "kavita"
                      ? `/${lang}/about#kavita`
                      : `/${lang}`;
                    return (
                      <a
                        key={pub.id}
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        onClick={() => setPublicationsOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2 hover:bg-[#F0F6FA] group transition-colors"
                      >
                        <div>
                          <p className="text-sm font-bold text-[#1F2937] group-hover:text-[#016BB7]">
                            {pub.name[lang] || pub.name.gu}
                          </p>
                          <p className="text-[11px] text-[#1F2937]/70 line-clamp-1">
                            {pub.frequency[lang] || pub.frequency.gu}
                          </p>
                        </div>
                        {isExternal && (
                          <ExternalLink className="h-3.5 w-3.5 text-[#016BB7]/60 group-hover:text-[#016BB7] shrink-0" />
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* More Dropdown */}
            <div className="relative h-full" ref={moreRef}>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(!moreOpen);
                  setPublicationsOpen(false);
                }}
                className={`relative group h-full flex items-center justify-center gap-1.5 px-3 xl:px-4 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                  moreOpen || isMoreActive
                    ? "text-[#016BB7] font-bold"
                    : "text-[#1F2937] hover:text-[#016BB7]"
                }`}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                <span className="truncate">{dict.nav.more}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                    moreOpen || isMoreActive
                      ? (moreOpen ? "rotate-180 text-[#016BB7]" : "text-[#016BB7]")
                      : "text-[#1F2937] group-hover:text-[#016BB7]"
                  }`}
                />
                {(moreOpen || isMoreActive) && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#016BB7]" />
                )}
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 w-60 rounded-lg border border-[#016BB7]/20 bg-white py-1.5 shadow-xl z-50 text-left">
                  {moreNav.map((sub) => (
                    <Link
                      key={sub.label + sub.href}
                      href={sub.href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm text-[#1F2937] hover:bg-[#F0F6FA] hover:text-[#016BB7] font-medium transition-colors"
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
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex"
        >
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between p-4 border-b border-[#016BB7]/15 bg-[#F0F6FA]">
                <BrandLogo compact />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1.5 text-[#1F2937] hover:bg-white border border-[#016BB7]/20"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-[#016BB7]" />
                </button>
              </div>

              {/* Mobile Primary Navigation */}
              <nav aria-label="Mobile primary navigation" className="p-3 divide-y divide-[#016BB7]/10">
                <div className="py-2">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#016BB7] mb-1">
                    {lang === "gu" ? "સમાચાર વિભાગો" : "News Categories"}
                  </p>
                  {primaryNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                        isActive(item.href, item.exact)
                          ? "bg-[#016BB7] text-white"
                          : "text-[#1F2937] hover:bg-[#F0F6FA] hover:text-[#016BB7]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="py-2">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#016BB7] mb-1">
                    {lang === "gu" ? "વધુ વિભાગો" : "More Sections"}
                  </p>
                  {moreNav.map((sub) => (
                    <Link
                      key={sub.label + sub.href}
                      href={sub.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-[#1F2937] hover:bg-[#F0F6FA] hover:text-[#016BB7]"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>

                {/* Mobile Other Publications Section */}
                <div className="py-2">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#016BB7] mb-1">
                    {dict.nav.publications || "Publications"}
                  </p>
                  {otherPublications.map((pub) => {
                    const isExternal = pub.websiteUrl.startsWith("http");
                    const href = isExternal
                      ? pub.websiteUrl
                      : pub.slug === "panchang"
                      ? `/${lang}/panchang`
                      : pub.slug === "kavita"
                      ? `/${lang}/about#kavita`
                      : `/${lang}`;
                    return (
                      <a
                        key={`mob-${pub.id}`}
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-1.5 text-xs text-[#1F2937] hover:text-[#016BB7] hover:bg-[#F0F6FA] rounded"
                      >
                        <span className="font-semibold">{pub.name[lang] || pub.name.gu}</span>
                        {isExternal && <ExternalLink className="h-3 w-3 text-[#016BB7]" />}
                      </a>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Mobile Footer Utility Links */}
            <div className="p-4 border-t border-[#016BB7]/15 bg-[#F0F6FA] space-y-3">
              <Link
                href={`/${lang}/epaper`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#016BB7] px-4 py-2.5 text-xs font-bold text-white shadow-xs"
              >
                <Newspaper className="h-4 w-4" />
                <span>{dict.header.epaperCta}</span>
              </Link>
              <div className="flex items-center justify-around text-xs font-semibold text-[#1F2937]">
                <Link
                  href={`/${lang}/about`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#016BB7]"
                >
                  {dict.header.aboutUs}
                </Link>
                <span>•</span>
                <Link
                  href={`/${lang}/contact`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#016BB7]"
                >
                  {dict.header.contact}
                </Link>
              </div>
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}
    </header>
  );
}
