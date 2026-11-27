"use client";

import React, { useState, useEffect } from "react";
import { X, Newspaper, Volume2, Compass, Smartphone, CheckCircle2, Clock } from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import { BrandLogo } from "@/components/shared/BrandLogo";

export const GOOGLE_PLAY_APP_URL =
  "https://play.google.com/store/apps/details?id=com.janmabhoominewspapers.app";

const QR_IMAGE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=${encodeURIComponent(
  GOOGLE_PLAY_APP_URL
)}`;

/** Official 4-color Google Play Triangle Logo */
function OfficialGooglePlayLogo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M48 59.49v393a14.17 14.17 0 0 0 6.23 11.77L264.68 256 54.23 47.74A14.17 14.17 0 0 0 48 59.49z"
      />
      <path
        fill="#34A853"
        d="M337.9 182.8L76.33 33.42a16.06 16.06 0 0 0-22.1 14.32L264.68 256z"
      />
      <path
        fill="#FBBC04"
        d="M454.9 249.68l-117-66.88L264.68 256l73.22 73.2 117-66.88a14.31 14.31 0 0 0 0-12.64z"
      />
      <path
        fill="#EA4335"
        d="M54.23 464.26a16.06 16.06 0 0 0 22.1 14.32L337.9 329.2 264.68 256z"
      />
    </svg>
  );
}

function AppleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.72 1.4-.58.68-1.1 1.78-.96 2.84 1.04.08 2.09-.52 2.72-1.3z" />
    </svg>
  );
}

export function StoreDownloadButtons({
  lang,
  compact = false,
}: {
  lang: Locale;
  compact?: boolean;
}) {
  const isGu = lang === "gu";
  const btnPadding = compact ? "px-3.5 py-2" : "px-5 py-3";

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Official Google Play Button (Live Android App) */}
      <a
        href={GOOGLE_PLAY_APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          isGu
            ? "Google Play પરથી સત્તાવાર જન્મભૂમિ એપ ડાઉનલોડ કરો"
            : "Get the official Janmabhoomi App on Google Play"
        }
        className={`inline-flex items-center gap-3 rounded-xl bg-[#0F172A] hover:bg-[#016BB7] text-white ${btnPadding} transition-all shadow-md hover:shadow-lg border border-slate-800 hover:border-[#016BB7]`}
      >
        <OfficialGooglePlayLogo className={compact ? "h-5 w-5 shrink-0" : "h-6 w-6 shrink-0"} />
        <div className="text-left leading-tight">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/85">
            {isGu ? "મેળવો" : "GET IT ON"}
          </div>
          <div className={compact ? "text-xs sm:text-sm font-extrabold" : "text-base font-extrabold"}>
            Google Play
          </div>
        </div>
      </a>

      {/* Apple App Store — Coming Soon Badge */}
      <div
        role="status"
        aria-label={
          isGu
            ? "Apple App Store પર ટૂંક સમયમાં આવી રહ્યું છે"
            : "Apple App Store — Coming Soon"
        }
        className={`relative inline-flex items-center gap-2.5 rounded-xl bg-slate-100 text-slate-500 ${btnPadding} border border-dashed border-slate-300 select-none cursor-not-allowed`}
      >
        <AppleIcon className={compact ? "h-5 w-5 shrink-0 opacity-65" : "h-6 w-6 shrink-0 opacity-65"} />
        <div className="text-left leading-tight">
          <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-700">
            <Clock className="h-2.5 w-2.5" />
            <span className={isGu ? "font-gujarati" : ""}>
              {isGu ? "ટૂંક સમયમાં" : "Coming Soon"}
            </span>
          </div>
          <div className={compact ? "text-xs sm:text-sm font-bold text-slate-600" : "text-base font-bold text-slate-600"}>
            App Store
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PLACEMENT 1: Top Mobile Smart App Banner (< 768px only)
 * Dismissible with sessionStorage persistence.
 */
export function MobileAppSmartBanner({ lang }: { lang: Locale }) {
  const isGu = lang === "gu";
  const [dismissed, setDismissed] = useState<boolean>(true);

  useEffect(() => {
    try {
      const wasDismissed = sessionStorage.getItem("jb_mobile_app_banner_dismissed") === "1";
      setDismissed(wasDismissed);
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem("jb_mobile_app_banner_dismissed", "1");
    } catch {}
  };

  return (
    <div
      role="region"
      aria-label={isGu ? "જન્મભૂમિ મોબાઇલ એપ ડાઉનલોડ કરો" : "Download Janmabhoomi Mobile App"}
      className="md:hidden bg-[#EAF3FB] border-b border-[#016BB7]/25 text-[#0F172A]"
    >
      <div className="container-wide py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={isGu ? "એપ બેનર બંધ કરો" : "Dismiss app banner"}
            className="p-1 text-slate-500 hover:text-slate-800 rounded transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div
            className="h-9 w-9 rounded-lg bg-[#016BB7] text-white flex flex-col items-center justify-center shrink-0 shadow-xs border border-[#015593]"
            aria-hidden="true"
          >
            <span className="font-gujarati text-[11px] font-black leading-none">જ</span>
            <span className="text-[7px] font-bold uppercase tracking-tighter opacity-90 mt-0.5">
              APP
            </span>
          </div>

          <div className="min-w-0">
            <p className={`text-xs font-extrabold text-[#0F172A] truncate leading-tight ${isGu ? "font-gujarati" : ""}`}>
              {isGu ? "જન્મભૂમિ એપ" : "Janmabhoomi App"}
            </p>
            <p className={`text-[10px] text-slate-600 truncate leading-tight mt-0.5 ${isGu ? "font-gujarati" : ""}`}>
              {isGu
                ? "તાજા સમાચાર, ઈ-પેપર અને દૈનિક પંચાંગ"
                : "Fast news, E-Paper & Daily Panchang"}
            </p>
          </div>
        </div>

        <a
          href={GOOGLE_PLAY_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`shrink-0 rounded-md bg-[#016BB7] hover:bg-[#015696] text-white px-3 py-1.5 text-[11px] font-bold shadow-xs transition-colors ${isGu ? "font-gujarati" : ""}`}
        >
          {isGu ? "ડાઉનલોડ" : "Install"}
        </a>
      </div>
    </div>
  );
}

/**
 * PLACEMENT 2: Prominent Homepage High-Intent App Download Section
 * Elevated editorial card placed directly above Daily Panchang.
 */
export function HomepageAppDownloadSection({ lang }: { lang: Locale }) {
  const isGu = lang === "gu";

  const features = [
    {
      icon: Newspaper,
      text: isGu
        ? "દૈનિક ઈ-પેપર અને તમામ આવૃત્તિઓ"
        : "Daily E-Paper & all Saurashtra Trust editions",
    },
    {
      icon: Volume2,
      text: isGu
        ? "ઓડિયો બુલેટિન અને બ્રેકિંગ એલર્ટ્સ"
        : "Audio bulletins & instant breaking alerts",
    },
    {
      icon: Compass,
      text: isGu
        ? "દૈનિક પંચાંગ અને ચોઘડિયા"
        : "Daily Panchang & Choghadiya timings",
    },
  ];

  return (
    <section
      id="download-app"
      aria-labelledby="download-app-heading"
      className="container-wide scroll-mt-24 py-3"
    >
      <div className="rounded-2xl border border-[#016BB7]/35 border-t-4 border-t-[#016BB7] bg-gradient-to-br from-[#EBF4FC] via-white to-[#FDF8EE] shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center p-6 sm:p-8 lg:p-10">
          {/* Left Column: Prominent Editorial Copy, 3 Features, Official Store Badges */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#016BB7] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                <Smartphone className="h-3.5 w-3.5" />
                <span className={isGu ? "font-gujarati" : ""}>
                  {isGu ? "સત્તાવાર મોબાઇલ એપ" : "OFFICIAL MOBILE APP"}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className={isGu ? "font-gujarati" : ""}>
                  {isGu ? "Android પર ઉપલબ્ધ" : "Live on Android"}
                </span>
              </span>
            </div>

            <h2
              id="download-app-heading"
              className={`text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-[#0B2239] leading-tight tracking-tight ${
                isGu ? "font-gujarati" : "font-serif"
              }`}
            >
              {isGu
                ? "તમારા મોબાઇલમાં વાંચો જન્મભૂમિ — ગમે ત્યારે, ગમે ત્યાં"
                : "Read Janmabhoomi on Your Mobile — Anytime, Anywhere"}
            </h2>

            <ul className="space-y-2.5 pt-1">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <li
                    key={idx}
                    className={`flex items-start gap-3 text-sm sm:text-[15px] text-slate-800 font-semibold ${
                      isGu ? "font-gujarati" : ""
                    }`}
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#016BB7] text-white shadow-2xs">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{feat.text}</span>
                  </li>
                );
              })}
            </ul>

            <div className="pt-3">
              <StoreDownloadButtons lang={lang} />
            </div>
          </div>

          {/* Right Column: Minimalist Smartphone Mockup + Real Scannable Desktop QR Card */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end gap-5">
            <div
              className="w-[196px] sm:w-[210px] rounded-[26px] border-[5px] border-[#0F172A] bg-white shadow-xl overflow-hidden shrink-0"
              aria-hidden="true"
            >
              <div className="bg-[#0F172A] py-1.5 flex justify-center">
                <span className="h-1 w-11 rounded-full bg-slate-600" />
              </div>
              <div className="bg-[#016BB7] px-3 py-2 text-white flex items-center justify-between">
                <span className="font-gujarati text-xs font-extrabold tracking-wide">
                  જન્મભૂમિ
                </span>
                <span className="text-[8px] font-bold uppercase bg-white/20 px-1.5 py-0.5 rounded">
                  LIVE
                </span>
              </div>
              <div className="p-2.5 space-y-2 bg-[#F8FAFC]">
                <div className="rounded-md border border-[#016BB7]/25 bg-white p-2 shadow-2xs">
                  <div className="flex items-center justify-between text-[8px] font-bold text-[#016BB7] uppercase mb-1">
                    <span>{isGu ? "આજનું ઈ-પેપર" : "TODAY'S E-PAPER"}</span>
                    <CheckCircle2 className="h-2.5 w-2.5" />
                  </div>
                  <div className="h-14 rounded bg-[#EDF4FA] border border-[#016BB7]/15 p-1.5 flex flex-col justify-between">
                    <div className="h-2 w-4/5 rounded bg-[#016BB7]/35" />
                    <div className="grid grid-cols-3 gap-1">
                      <div className="col-span-2 h-7 rounded bg-slate-200" />
                      <div className="space-y-1">
                        <div className="h-1.5 rounded bg-slate-300" />
                        <div className="h-1.5 rounded bg-slate-300" />
                        <div className="h-1.5 rounded bg-slate-300" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-slate-200 bg-white p-2 space-y-1.5">
                  <span className="inline-block text-[8px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded">
                    {isGu ? "તાજા સમાચાર" : "BREAKING"}
                  </span>
                  <div className="h-2 w-full rounded bg-slate-800/80" />
                  <div className="h-2 w-3/4 rounded bg-slate-400/70" />
                </div>

                <div className="rounded-md border border-amber-200/80 bg-amber-50/70 px-2 py-1.5 flex items-center justify-between">
                  <span className="text-[8px] font-bold text-amber-900">
                    {isGu ? "દૈનિક પંચાંગ" : "Daily Panchang"}
                  </span>
                  <span className="text-[8px] font-semibold text-amber-800">
                    {isGu ? "શુભ ચોઘડિયા" : "Choghadiya"}
                  </span>
                </div>
              </div>
            </div>

            {/* Scannable Desktop QR Code Card */}
            <div className="hidden md:flex flex-col items-center rounded-xl border-2 border-[#016BB7]/25 bg-white p-4 shadow-md text-center w-[166px] shrink-0">
              <div className="rounded-lg border border-slate-200 p-1.5 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={QR_IMAGE_URL}
                  alt={isGu ? "જન્મભૂમિ Android એપ QR કોડ" : "Janmabhoomi Android App QR Code"}
                  width={112}
                  height={112}
                  loading="lazy"
                  className="h-28 w-28 object-contain"
                />
              </div>
              <p
                className={`mt-2.5 text-xs font-extrabold text-[#0B2239] leading-snug ${
                  isGu ? "font-gujarati" : ""
                }`}
              >
                {isGu ? "એપ ડાઉનલોડ કરવા સ્કેન કરો" : "Scan to Download App"}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-[#016BB7]">
                <OfficialGooglePlayLogo className="h-3 w-3" />
                <span>Google Play</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * PLACEMENT 3: Global Pre-Footer App Strip
 */
export function PreFooterAppStrip({ lang }: { lang: Locale }) {
  const isGu = lang === "gu";

  return (
    <div className="bg-[#EAF3FB] border-t-2 border-b border-[#016BB7]/25 text-[#0F172A]">
      <div className="container-wide py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="bg-white rounded-md px-2 py-1 border border-[#016BB7]/20 shadow-2xs shrink-0">
            <BrandLogo compact />
          </div>
          <p className={`text-xs sm:text-sm font-bold text-[#0B2239] ${isGu ? "font-gujarati" : ""}`}>
            {isGu
              ? "તાજા સમાચાર, દૈનિક ઈ-પેપર અને પંચાંગ માટે જન્મભૂમિ મોબાઇલ એપ ડાઉનલોડ કરો."
              : "Download the Janmabhoomi Mobile App for breaking news, daily E-Paper & Panchang."}
          </p>
        </div>

        <div className="shrink-0">
          <StoreDownloadButtons lang={lang} compact />
        </div>
      </div>
    </div>
  );
}
