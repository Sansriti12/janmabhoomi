"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Globe2, Sparkles } from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import { getAllPublications } from "@/lib/data/config/publications";

interface PublicationStripProps {
  lang: Locale;
}

/**
 * Interactive Sister Publications Switcher Strip
 * Sleek, horizontally scrollable pill/logo bar below the masthead featuring
 * all 8 Saurashtra Trust publications for effortless edition switching.
 */
export function PublicationStrip({ lang }: PublicationStripProps) {
  const pathname = usePathname();
  const isGu = lang === "gu";
  const publications = getAllPublications();

  return (
    <div
      aria-label={isGu ? "સૌરાષ્ટ્ર ટ્રસ્ટના પ્રકાશનો" : "Saurashtra Trust Publications Network"}
      className="w-full bg-[#F0F6FA] border-b border-[#016BB7]/15"
    >
      <div className="container-wide py-1.5 flex items-center gap-3">
        {/* Left Network Label */}
        <Link
          href={`/${lang}/publications`}
          className="hidden md:inline-flex items-center gap-1.5 shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-[#016BB7] pr-3 border-r border-[#016BB7]/20 hover:underline"
        >
          <Globe2 className="h-3.5 w-3.5" />
          <span>{isGu ? "સૌરાષ્ટ્ર ટ્રસ્ટ" : "Saurashtra Trust"}</span>
        </Link>

        {/* Scrollable Horizontal Pill Strip with Snap */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory py-0.5 flex-1">
          {publications.map((pub) => {
            const isMain = pub.id === "pub-janmabhoomi";
            const isExternal = pub.websiteUrl.startsWith("http");
            const isPanchang = pub.slug === "panchang";
            const isKavita = pub.slug === "kavita";

            const href = isMain
              ? `/${lang}`
              : isPanchang
              ? `/${lang}/panchang`
              : isKavita
              ? `/${lang}/about#kavita`
              : isExternal
              ? pub.websiteUrl
              : `/${lang}/epaper?publication=${pub.id}`;

            const isActive =
              (isMain && (pathname === `/${lang}` || pathname === `/${lang}/`)) ||
              (isPanchang && pathname?.startsWith(`/${lang}/panchang`));

            const displayLabel = isMain
              ? isGu
                ? "જન્મભૂમિ મુખ્ય"
                : "Janmabhoomi Main"
              : pub.name[lang] || pub.name.gu;

            const pillClass = `snap-start shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold transition-all border ${
              isActive || isMain
                ? "bg-[#016BB7] text-white border-[#016BB7] shadow-2xs"
                : "bg-white text-[#1F2937] border-[#016BB7]/20 hover:border-[#016BB7] hover:text-[#016BB7] hover:bg-blue-50/40"
            }`;

            if (isExternal) {
              return (
                <a
                  key={`strip-${pub.id}`}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillClass}
                  title={`${displayLabel} — ${pub.tagline[lang] || pub.tagline.gu}`}
                >
                  <span>{displayLabel}</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-65 shrink-0" />
                </a>
              );
            }

            return (
              <Link
                key={`strip-${pub.id}`}
                href={href}
                className={pillClass}
                title={`${displayLabel} — ${pub.tagline[lang] || pub.tagline.gu}`}
              >
                {isMain && <Sparkles className="h-3 w-3 text-sky-200 shrink-0" />}
                <span>{displayLabel}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
