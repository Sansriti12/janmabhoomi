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
  User,
  Compass,
  Archive,
  Calendar,
  BookMarked,
} from "lucide-react";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";
import { ReaderComfortControls } from "@/components/layout/ReaderComfortControls";
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
  const { isAuthenticated, subscriber, openAuthModal } = useSubscriberAuth();
  const [formattedDate, setFormattedDate] = useState<string>("");
  const [currentSearch, setCurrentSearch] = useState<string>("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [publicationsOpen, setPublicationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const moreRef = useRef<HTMLDivElement>(null);
  const publicationsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const publications = getAllPublications();

  // Track query string for context-aware bilingual switching
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentSearch(window.location.search || "");
    }
  }, [pathname]);

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

  // Preserve equivalent page route & query parameters when switching between /en and /gu
  const getSwitchedLocaleHref = (targetLocale: Locale) => {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/");
    let nextPath = `/${targetLocale}`;
    if (segments.length > 1 && (segments[1] === "en" || segments[1] === "gu")) {
      segments[1] = targetLocale;
      nextPath = segments.join("/") || `/${targetLocale}`;
    } else {
      nextPath = `/${targetLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
    }
    return `${nextPath}${currentSearch}`;
  };

  // Decluttered Primary Navigation: 8 Core Editorial Desks
  const primaryNav = [
    { label: dict.nav.home, href: `/${lang}`, exact: true },
    { label: dict.nav.latest, href: `/${lang}/latest` },
    { label: dict.nav.national, href: `/${lang}/category/national` },
    { label: dict.nav.city, href: `/${lang}/category/city` },
    { label: dict.nav.business, href: `/${lang}/category/business` },
    { label: dict.nav.sports, href: `/${lang}/category/sports` },
    { label: dict.nav.entertainment, href: `/${lang}/category/entertainment` },
    {
      label: lang === "gu" ? "અગ્રલેખ" : "Editorial (અગ્રલેખ)",
      href: `/${lang}/editorial`,
    },
  ];

  // Utility & Community links grouped in "Reader Services" dropdown
  const readerServicesNav = [
    {
      label: dict.nav.panchang,
      desc: lang === "gu" ? "દૈનિક તિથિ, ચોઘડિયા અને મુહૂર્ત" : "Daily Tithi, Choghadiya & Muhurat",
      href: `/${lang}/panchang`,
      icon: <Compass className="h-4 w-4 text-[#016BB7]" />,
    },
    {
      label: dict.nav.maran,
      desc: lang === "gu" ? "મરણ નોંધ અને બેસણું શોધો" : "Search Obituaries & Besanu Notices",
      href: `/${lang}/category/maran`,
      icon: <BookMarked className="h-4 w-4 text-[#016BB7]" />,
    },
    {
      label: dict.nav.archiveEnquiry,
      desc: lang === "gu" ? "૧૯૩૪થી ઐતિહાસિક અંકોની પૂછપરછ" : "Historical Edition Requests (1934–2026)",
      href: `/${lang}/archive-enquiry`,
      icon: <Archive className="h-4 w-4 text-[#016BB7]" />,
    },
    {
      label: lang === "gu" ? "વિશેષ આયોજનો અને સંવાદ" : "Conclaves & Events",
      desc: lang === "gu" ? "સૌરાષ્ટ્ર ટ્રસ્ટ પરિષદો અને કાર્યક્રમો" : "Saurashtra Trust Forums & Assemblies",
      href: `/${lang}/events`,
      icon: <Calendar className="h-4 w-4 text-[#016BB7]" />,
    },
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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#016BB7]/20 shadow-xs">
      {/* ROW 1 – TOP INFORMATION BAR (Exact Janmabhoomi Brand Blue #016BB7) */}
      <div
        style={{ backgroundColor: "#016BB7" }}
        className="bg-[#016BB7] border-b border-white/20 text-white text-xs"
      >
        <div className="container-wide min-h-7 py-0.5 flex items-center justify-between gap-2">
          {/* Left: Automatically generated current date & day */}
          <div className="flex items-center gap-2 font-medium truncate">
            <span className="font-semibold text-white tracking-wide text-[11px]">
              {formattedDate || "મંગળવાર, ૩ નવેમ્બર ૨૦૨૬"}
            </span>
          </div>

          {/* Right: Reader Comfort Controls + Single Context-Aware Bilingual Toggle + Utility Links + Socials */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            {/* Reader Comfort Accessibility Toolbar (A-/A/A+ & Light/Sepia/Dark) */}
            <ReaderComfortControls lang={lang} />

            <span className="h-3 w-px bg-white/25" />

            {/* Single Context-Aware Bilingual Toggle (ગુજરાતી / EN) in Top Utility Bar */}
            <div
              className="inline-flex items-center gap-0.5 rounded bg-white/15 border border-white/25 p-0.5 text-[11px] font-bold"
              aria-label="Language switcher"
            >
              <Link
                href={getSwitchedLocaleHref("gu")}
                className={`font-gujarati transition-colors px-1.5 py-0.5 rounded-xs ${
                  lang === "gu"
                    ? "bg-white text-[#016BB7] shadow-2xs"
                    : "text-white/90 hover:bg-white/20"
                }`}
              >
                ગુજરાતી
              </Link>
              <Link
                href={getSwitchedLocaleHref("en")}
                className={`transition-colors px-1.5 py-0.5 rounded-xs ${
                  lang === "en"
                    ? "bg-white text-[#016BB7] shadow-2xs"
                    : "text-white/90 hover:bg-white/20"
                }`}
              >
                EN
              </Link>
            </div>

            <nav
              aria-label="Top utility links"
              className="hidden xl:flex items-center gap-3.5 font-semibold text-white/95"
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

            <span className="hidden lg:inline-block h-3.5 w-px bg-white/25" />

            {/* Official Social Media Channels: @janmabhoomigroup */}
            <div className="hidden lg:flex items-center gap-2.5 text-white/95">
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

      {/* ROW 2 – MAIN BRANDING HEADER (Logo placed cleanly on the LEFT per Modern Redesign) */}
      <div className="bg-white overflow-hidden sm:overflow-visible">
        <div className="container-wide py-1.5 sm:py-2 flex items-center justify-between gap-3">
          {/* Left: Official Blue Janmabhoomi Logo */}
          <div className="flex items-center shrink-0">
            <Link
              href={`/${lang}`}
              className="group flex items-center select-none"
              title="Janmabhoomi - જન્મભૂમિ"
            >
              <BrandLogo priority compact className="hover:opacity-95 transition-opacity" />
            </Link>
          </div>

          {/* Right: Clean Action Cluster (E-PAPER + Subscribe + Sign In/Account + Mobile Search & Menu) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile-only Search Trigger (Desktop Search sits at far right of category nav) */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="lg:hidden inline-flex items-center justify-center rounded-lg border border-[#016BB7]/25 bg-white p-1.5 text-[#016BB7] hover:bg-[#F0F6FA] transition-all cursor-pointer"
              aria-label={dict.header.searchButton}
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Prominent E-PAPER CTA Button */}
            <Link
              href={`/${lang}/epaper`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#016BB7] hover:bg-[#016BB7]/90 active:bg-[#015a99] px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold tracking-wide text-white transition-colors shadow-xs shrink-0"
            >
              <Newspaper className="h-3.5 w-3.5 hidden sm:inline" />
              <span>{dict.header.epaperCta}</span>
            </Link>

            {/* Subscriber Actions: Account or Subscribe / Login */}
            {isAuthenticated ? (
              <Link
                href={`/${lang}/account`}
                className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-[#016BB7]/30 hover:border-[#016BB7] hover:bg-blue-50/50 px-2.5 py-1.5 text-xs font-semibold text-[#016BB7] transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span>{lang === "gu" ? "મારું ખાતું" : "My Account"}</span>
              </Link>
            ) : (
              <div className="hidden lg:flex items-center gap-1.5">
                <Link
                  href={`/${lang}/subscribe`}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#016BB7]/30 hover:border-[#016BB7] hover:bg-blue-50/50 px-2.5 py-1.5 text-xs font-semibold text-[#016BB7] transition-colors"
                >
                  <span>{lang === "gu" ? "સબ્સ્ક્રાઇબ" : "Subscribe"}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="inline-flex items-center gap-1 rounded-lg text-gray-700 hover:text-[#016BB7] px-2 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>{lang === "gu" ? "લૉગિન" : "Sign In"}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Button on the RIGHT */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center rounded-lg p-1.5 sm:p-2 text-[#016BB7] hover:bg-[#F0F6FA] border border-[#016BB7]/25 shrink-0 cursor-pointer"
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
                className="w-full rounded-md border border-[#016BB7]/30 bg-white pl-10 pr-10 py-2.5 text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none shadow-xs"
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

      {/* ROW 3 – DESKTOP CATEGORY NAVIGATION (Evenly balanced across full container width) */}
      <div className="hidden lg:block bg-white border-t border-b border-[#016BB7]/20 shadow-2xs">
        <div className="container-wide">
          <nav
            aria-label="Main category navigation"
            className="flex items-center justify-between w-full h-9 text-[13px] xl:text-[14px] font-semibold tracking-normal"
          >
            {primaryNav.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={active ? { color: "#016BB7" } : undefined}
                  className={`relative h-full flex items-center justify-center px-1.5 xl:px-2.5 2xl:px-3 transition-colors duration-150 whitespace-nowrap group ${
                    active
                      ? "text-[#016BB7] font-bold"
                      : "text-[#1F2937] hover:text-[#016BB7]"
                  }`}
                >
                  <span className="group-hover:translate-y-[-0.5px] transition-transform">{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#016BB7] rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Reader Services Dropdown (Panchang, Obituaries, Archive Enquiry, Conclaves) */}
            <div className="relative h-full shrink-0" ref={moreRef}>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(!moreOpen);
                  setPublicationsOpen(false);
                }}
                className={`relative group h-full flex items-center justify-center gap-1.5 px-2.5 xl:px-3.5 transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                  moreOpen
                    ? "text-[#016BB7] font-bold"
                    : "text-[#1F2937] hover:text-[#016BB7]"
                }`}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                <span>{lang === "gu" ? "વાચક સેવાઓ" : "Reader Services"}</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                    moreOpen ? "rotate-180 text-[#016BB7]" : "text-[#1F2937] group-hover:text-[#016BB7]"
                  }`}
                />
                {moreOpen && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#016BB7]" />
                )}
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 w-72 rounded-xl border border-[#016BB7]/25 bg-white py-2 shadow-2xl z-50 text-left overflow-hidden">
                  <div className="px-3.5 py-1.5 border-b border-[#016BB7]/10 mb-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#016BB7]">
                      {lang === "gu" ? "વાચક અને સમુદાય સેવાઓ" : "Reader & Community Services"}
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {readerServicesNav.map((service) => (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-[#F0F6FA] group transition-colors"
                      >
                        <span className="mt-0.5 shrink-0 rounded-md bg-blue-50 p-1.5 group-hover:bg-white transition-colors">
                          {service.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#1F2937] group-hover:text-[#016BB7]">
                            {service.label}
                          </p>
                          <p className="text-[11px] text-[#1F2937]/70 line-clamp-1">
                            {service.desc}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Trigger moved to far right of Primary Category Navigation */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setMoreOpen(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                searchOpen
                  ? "bg-[#016BB7] text-white"
                  : "text-[#016BB7] hover:bg-[#F0F6FA]"
              }`}
              aria-label={dict.header.searchButton}
              aria-expanded={searchOpen}
            >
              <Search className="h-3.5 w-3.5" />
              <span>{dict.header.searchButton}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* MOBILE NAVIGATION DRAWER (Sliding from Right side) */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex justify-end"
        >
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#016BB7]/20">
            <div>
              <div className="flex items-center justify-between p-4 border-b border-[#016BB7]/15 bg-[#F0F6FA]">
                <BrandLogo compact />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1.5 text-[#1F2937] hover:bg-white border border-[#016BB7]/20 cursor-pointer"
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

                {/* Mobile Reader Services Section */}
                <div className="py-2">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#016BB7] mb-1">
                    {lang === "gu" ? "વાચક સેવાઓ" : "Reader Services"}
                  </p>
                  {readerServicesNav.map((service) => (
                    <Link
                      key={`mob-srv-${service.href}`}
                      href={service.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
                        isActive(service.href)
                          ? "bg-[#016BB7] text-white"
                          : "text-[#1F2937] hover:bg-[#F0F6FA] hover:text-[#016BB7]"
                      }`}
                    >
                      {service.icon}
                      <span>{service.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Mobile All Publications Section */}
                <div className="py-2 border-t border-slate-100">
                  <div className="flex items-center justify-between px-3 mb-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#016BB7]">
                      {lang === "gu" ? "સૌરાષ્ટ્ર ટ્રસ્ટના તમામ પ્રકાશનો" : "All 8 Publications"}
                    </p>
                    <Link
                      href={`/${lang}/publications`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[10px] font-bold text-[#016BB7] underline"
                    >
                      {lang === "gu" ? "બધા જુઓ" : "View All"}
                    </Link>
                  </div>
                  {publications.map((pub) => {
                    const isJanmabhoomi = pub.id === "pub-janmabhoomi";
                    const isExternal = pub.websiteUrl.startsWith("http");
                    const href = isJanmabhoomi
                      ? `/${lang}`
                      : isExternal
                      ? pub.websiteUrl
                      : pub.slug === "panchang"
                      ? `/${lang}/panchang`
                      : pub.slug === "kavita"
                      ? `/${lang}/about#kavita`
                      : `/${lang}/epaper?publication=${pub.id}`;
                    return (
                      <a
                        key={`mob-${pub.id}`}
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-1.5 text-xs text-[#1F2937] hover:text-[#016BB7] hover:bg-[#F0F6FA] rounded ${
                          isJanmabhoomi ? "bg-blue-50/60 font-bold text-[#016BB7]" : ""
                        }`}
                      >
                        <span className="font-semibold">{pub.name[lang] || pub.name.gu}</span>
                        {isJanmabhoomi ? (
                          <span className="text-[9px] bg-[#016BB7] text-white px-1.5 py-0.2 rounded font-bold">
                            {lang === "gu" ? "મુખ્ય" : "Main"}
                          </span>
                        ) : isExternal ? (
                          <ExternalLink className="h-3 w-3 text-[#016BB7]" />
                        ) : (
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                        )}
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
        </div>
      )}
    </header>
  );
}
