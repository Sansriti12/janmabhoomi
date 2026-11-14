"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  TelegramIcon,
} from "@/components/shared/SocialIcons";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { getAllPublications } from "@/lib/data/config/publications";

interface FooterProps {
  lang: Locale;
  dict: Dictionary;
}

/**
 * Compact Professional Footer (Revision 3 Specification)
 * 
 * - Occupies ~25% of previous vertical footprint without clipping.
 * - Solid official Janmabhoomi brand blue background (#016BB7).
 * - 4 Essential Columns:
 *   1. Janmabhoomi: Compact logo, single verified intro sentence, compact social links.
 *   2. Quick Links: Home, Latest, National, City, Business, Sports, Entertainment, Editorial, Panchang.
 *   3. Other Publications: Exactly 7 verified titles (Kutchmitra, Phulchhab, Vyapar Guj, Vyapar Hindi, Pravasi, Panchang, Kavita).
 *   4. Contact & Info: Verified Janmabhoomi Bhavan address, About Us, Contact, E-Paper, Privacy Policy, Terms & Conditions.
 * - Responsive, accessible, and clean typography matching official brand identity.
 */
export function Footer({ lang, dict }: FooterProps) {
  const isGu = lang === "gu";
  const publications = getAllPublications();
  const otherPublications = publications.filter((pub) => pub.id !== "pub-janmabhoomi");

  return (
    <footer
      style={{ backgroundColor: "#016BB7" }}
      className="mt-8 border-t-2 border-[#016BB7] bg-[#016BB7] text-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 pb-5 border-b border-white/20">
          {/* Col 1 (4 Cols): Janmabhoomi Brand, Verified Short Intro & Socials */}
          <div className="lg:col-span-4 space-y-2.5">
            <Link href={`/${lang}`} className="inline-block bg-white rounded-md px-2.5 py-1 shadow-2xs">
              <BrandLogo compact />
            </Link>

            <p className="text-xs text-white/90 leading-relaxed font-normal max-w-sm">
              {isGu
                ? "૧૯૩૧માં સ્થાપિત સૌરાષ્ટ્ર ટ્રસ્ટ હેઠળ ૧૯૩૪થી પ્રગટ થતું જન્મભૂમિ ૯૩+ વર્ષથી ગુજરાતી પત્રકારિતા અને જાહેર સેવાનું વિશ્વસનીય પ્રતીક છે."
                : "Established in 1934 under Saurashtra Trust (est. 1931), Janmabhoomi has championed credible journalism and public welfare for over 93 years."}
            </p>

            {/* Compact Official Social Media Channels */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://facebook.com/janmabhoomigroup"
                target="_blank"
                rel="noopener noreferrer"
                title="Janmabhoomi on Facebook (@janmabhoomigroup)"
                aria-label="Janmabhoomi on Facebook"
                className="rounded-full bg-white/15 p-1.5 hover:bg-white text-white hover:text-[#016BB7] transition-all hover:scale-105"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://x.com/janmabhoomigroup"
                target="_blank"
                rel="noopener noreferrer"
                title="Janmabhoomi on X (@janmabhoomigroup)"
                aria-label="Janmabhoomi on X"
                className="rounded-full bg-white/15 p-1.5 hover:bg-white text-white hover:text-[#016BB7] transition-all hover:scale-105"
              >
                <TwitterIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com/janmabhoomigroup"
                target="_blank"
                rel="noopener noreferrer"
                title="Janmabhoomi on Instagram (@janmabhoomigroup)"
                aria-label="Janmabhoomi on Instagram"
                className="rounded-full bg-white/15 p-1.5 hover:bg-white text-white hover:text-[#016BB7] transition-all hover:scale-105"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://t.me/janmabhoomigroup"
                target="_blank"
                rel="noopener noreferrer"
                title="Janmabhoomi on Telegram (@janmabhoomigroup)"
                aria-label="Janmabhoomi on Telegram"
                className="rounded-full bg-white/15 p-1.5 hover:bg-white text-white hover:text-[#016BB7] transition-all hover:scale-105"
              >
                <TelegramIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2 (3 Cols): Quick Links */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/25 pb-1 inline-block">
              {dict.footer.quickLinks}
            </h3>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-white/90 pt-1">
              <li>
                <Link href={`/${lang}`} className="hover:text-white transition-colors">
                  {dict.nav.home}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/latest`} className="hover:text-white transition-colors">
                  {dict.nav.latest}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/category/national`} className="hover:text-white transition-colors">
                  {dict.nav.national}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/category/city`} className="hover:text-white transition-colors">
                  {dict.nav.city}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/category/business`} className="hover:text-white transition-colors">
                  {dict.nav.business}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/category/sports`} className="hover:text-white transition-colors">
                  {dict.nav.sports}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/category/entertainment`} className="hover:text-white transition-colors">
                  {dict.nav.entertainment}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/editorial`} className="hover:text-white transition-colors">
                  {dict.nav.editorial} (અગ્રલેખ)
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/panchang`} className="hover:text-white transition-colors">
                  {dict.nav.panchang}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/category`} className="hover:text-white font-bold transition-colors">
                  {isGu ? "બધા વિભાગો →" : "All Categories →"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 (3 Cols): Other Publications (7 verified titles) */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/25 pb-1 inline-block">
              {dict.footer.otherPublications || "Other Publications"}
            </h3>
            <ul className="space-y-1 text-xs text-white/90 pt-1">
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
                  <li key={`footer-${pub.id}`}>
                    <a
                      href={href}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1 hover:text-white transition-colors"
                    >
                      <span className="truncate">{pub.name[lang] || pub.name.gu}</span>
                      {isExternal && (
                        <ExternalLink className="h-2.5 w-2.5 text-white/70 shrink-0" />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Col 4 (2 Cols): Contact & Information */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-white/25 pb-1 inline-block">
              {dict.footer.corporateLinks || "Contact & Info"}
            </h3>
            <div className="text-[11px] text-white/90 leading-snug pt-1">
              <p className="font-semibold text-white">Janmabhoomi Bhavan</p>
              <p>Fort, Mumbai 400001</p>
            </div>
            <ul className="space-y-1 text-xs text-white/90 pt-1">
              <li>
                <Link href={`/${lang}/about`} className="hover:text-white transition-colors">
                  {dict.header.aboutUs}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="hover:text-white transition-colors">
                  {dict.header.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/epaper`}
                  className="font-bold text-white hover:underline transition-colors"
                >
                  {dict.header.epaperCta}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/privacy-policy`} className="hover:text-white transition-colors">
                  {dict.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/archive-enquiry`} className="hover:text-white transition-colors">
                  {dict.footer.archiveEnquiry || (isGu ? "આર્કાઇવ પૂછપરછ" : "Archive Enquiry")}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/terms-conditions`} className="hover:text-white transition-colors">
                  {dict.footer.termsConditions}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/85">
          <p>
            © {new Date().getFullYear()} {dict.footer.copyright}
          </p>
          <div className="flex items-center gap-3">
            <Link href={`/${lang}/privacy-policy`} className="hover:text-white transition-colors">
              {dict.footer.privacyPolicy}
            </Link>
            <span>•</span>
            <Link href={`/${lang}/terms-conditions`} className="hover:text-white transition-colors">
              {dict.footer.termsConditions}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
