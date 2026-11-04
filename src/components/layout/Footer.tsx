"use client";

import React from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Newspaper,
  Sparkles,
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

interface FooterProps {
  lang: Locale;
  dict: Dictionary;
}

export function Footer({ lang, dict }: FooterProps) {
  const triggerPopupPreview = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("janmabhoomi:open-sub-popup"));
    }
  };

  return (
    <footer className="mt-12 border-t-4 border-[#174F73] bg-[#292725] text-[#FAF8F3]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/12">
          {/* Col 1 (4 Cols): About Janmabhoomi */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo compact />
              <div>
                <p className="text-lg font-extrabold tracking-wide text-white">
                  {dict.header.brandName}
                </p>
                <p className="font-gujarati text-xs text-[#C59B4B]">
                  {dict.header.tagline}
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#FAF8F3]/80 leading-relaxed">
              {dict.footer.aboutText}
            </p>

            {/* Social Media */}
            <div className="pt-1 flex items-center gap-3">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="rounded-full bg-white/10 p-2 hover:bg-[#174F73] transition-colors"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="#twitter"
                aria-label="X (Twitter)"
                className="rounded-full bg-white/10 p-2 hover:bg-[#174F73] transition-colors"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="rounded-full bg-white/10 p-2 hover:bg-[#174F73] transition-colors"
              >
                <YoutubeIcon className="h-4 w-4" />
              </a>
              <a
                href="#instagram"
                aria-label="Instagram"
                className="rounded-full bg-white/10 p-2 hover:bg-[#174F73] transition-colors"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2 (3 Cols): Editorial Sections */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#C59B4B]">
              {dict.footer.quickLinks}
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-xs sm:text-sm text-[#FAF8F3]/80">
              <li>
                <Link href={`/${lang}/latest`} className="hover:text-white">
                  {dict.nav.latest}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/category/national`}
                  className="hover:text-white"
                >
                  {dict.nav.national}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/category/city`}
                  className="hover:text-white"
                >
                  {dict.nav.city}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/category/business`}
                  className="hover:text-white"
                >
                  {dict.nav.business}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/category/sports`}
                  className="hover:text-white"
                >
                  {dict.nav.sports}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/category/entertainment`}
                  className="hover:text-white"
                >
                  {dict.nav.entertainment}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/editorial`} className="hover:text-white">
                  {dict.nav.editorial} (અગ્રલેખ)
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/panchang`} className="hover:text-white">
                  {dict.nav.panchang}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/category/maran`}
                  className="hover:text-white"
                >
                  {dict.nav.maran}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/events`} className="hover:text-white">
                  {dict.nav.events}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 (2 Cols): Important Links & Advertise */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#C59B4B]">
              {dict.footer.corporateLinks}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF8F3]/80">
              <li>
                <Link href={`/${lang}/epaper`} className="hover:text-white font-semibold text-[#C59B4B]">
                  {dict.header.epaperCta}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className="hover:text-white">
                  {dict.header.aboutUs}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/contact`} className="hover:text-white">
                  {dict.header.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/contact?topic=advertise`}
                  className="hover:text-white"
                >
                  {dict.header.advertise}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/editorial/archive`}
                  className="hover:text-white"
                >
                  {dict.home.editorialArchiveCta}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/about#privacy`}
                  className="hover:text-white"
                >
                  {dict.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about#terms`} className="hover:text-white">
                  {dict.footer.termsConditions}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 (3 Cols): Contact Details & Advertise Information */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#C59B4B]">
              {dict.footer.contactHeading}
            </h3>
            <div className="space-y-2.5 text-xs text-[#FAF8F3]/85">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#C59B4B] shrink-0 mt-0.5" />
                <span>{dict.footer.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#C59B4B] shrink-0" />
                <span>{dict.footer.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#C59B4B] shrink-0" />
                <span>{dict.footer.email}</span>
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/${lang}/contact?topic=advertise`}
                className="inline-flex items-center justify-center gap-1.5 rounded bg-[#174F73] px-3 py-2 text-xs font-bold text-white hover:bg-[#103A55] transition-colors"
              >
                <Newspaper className="h-3.5 w-3.5 text-[#C59B4B]" />
                <span>{dict.footer.advertiseCta}</span>
              </Link>

              <button
                type="button"
                onClick={triggerPopupPreview}
                className="inline-flex items-center justify-center gap-1.5 rounded border border-white/20 px-3 py-1.5 text-[11px] font-medium text-[#FAF8F3]/75 hover:border-[#C59B4B] hover:text-white transition-colors cursor-pointer"
              >
                <Sparkles className="h-3 w-3 text-[#C59B4B]" />
                <span>{dict.footer.triggerPopupDemo}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Policies */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F3]/65">
          <p>
            © {new Date().getFullYear()} {dict.footer.copyright}
          </p>
          <div className="flex items-center gap-5">
            <Link href={`/${lang}/about#privacy`} className="hover:text-white">
              {dict.footer.privacyPolicy}
            </Link>
            <Link href={`/${lang}/about#terms`} className="hover:text-white">
              {dict.footer.termsConditions}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
