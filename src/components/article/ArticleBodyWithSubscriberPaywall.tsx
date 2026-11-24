"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  Newspaper,
  CheckCircle2,
  Volume2,
  Square as StopIcon,
  Play,
  ShieldCheck,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";
import { speakText, stopSpeaking } from "@/lib/utils/speechHelper";
import { getLocalizedText } from "@/lib/data/types";

interface ArticleBodyWithSubscriberPaywallProps {
  article: any;
  locale: Locale;
  dict: any;
  initialTeaserParagraphs: string[];
}

export function ArticleBodyWithSubscriberPaywall({
  article,
  locale,
  dict,
  initialTeaserParagraphs,
}: ArticleBodyWithSubscriberPaywallProps) {
  const isGu = locale === "gu";
  const {
    isAuthenticated,
    activeSubscriptions,
    token,
    hasSubscriptionFor,
    login,
  } = useSubscriberAuth();

  const [mounted, setMounted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      stopSpeaking();
    };
  }, [article?.slug]);

  // Determine if user has active subscriber privileges (real subscriber or test guest user)
  const localToken =
    typeof window !== "undefined"
      ? localStorage.getItem("janmabhoomi_subscriber_token")
      : null;
  const hasAccess =
    mounted &&
    (isAuthenticated || Boolean(localToken)) &&
    (activeSubscriptions.length > 0 ||
      hasSubscriptionFor("JB") ||
      Boolean(localToken?.startsWith("guest-token-")) ||
      Boolean(localToken?.startsWith("google-token-")));

  // Build paragraphs strictly from the clicked article itself (never hardcoded unrelated text)
  const articleSummary = getLocalizedText(article.summary, locale);
  const articleBodyParagraphs: string[] = Array.isArray(initialTeaserParagraphs)
    ? initialTeaserParagraphs.filter((p) => typeof p === "string" && p.trim().length > 0)
    : [];

  const allParagraphs =
    articleBodyParagraphs.length > 0
      ? articleBodyParagraphs
      : articleSummary
      ? [articleSummary]
      : [];

  const handleToggleAudio = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    stopSpeaking();

    const titleText = getLocalizedText(article.title, locale);
    const parts = [titleText];
    if (articleSummary && !allParagraphs.some((p) => p.includes(articleSummary.slice(0, 30)))) {
      parts.push(articleSummary);
    }
    parts.push(...allParagraphs);

    const fullText = parts.filter(Boolean).join(". ");
    const hasGujaratiScript = /[\u0A80-\u0AFF]/.test(fullText);

    const started = speakText(fullText, {
      lang: hasGujaratiScript ? "gu" : isGu ? "gu" : "en",
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });

    if (started) {
      setIsSpeaking(true);
    }
  };

  const handle1ClickGuestUnlock = () => {
    const guestSub = {
      id: "sub-guest-" + Date.now(),
      email: "guest.reader@janmabhoomi.in",
      fullName: isGu ? "મહેમાન વાચક (Guest Reader)" : "Guest Reader (Test Access)",
      status: "ACTIVE" as const,
      isEmailVerified: true,
      isMobileVerified: true,
      createdAt: new Date().toISOString(),
    };
    const demoSub = [
      {
        id: "sub-guest-all-access",
        planId: "plan-all-access",
        planNameEn: "Guest Reader All-Access Pass",
        planNameGu: "મહેમાન વાચક ઓલ-એક્સેસ પાસ",
        publicationNameEn: "Janmabhoomi Daily",
        publicationNameGu: "જન્મભૂમિ દૈનિક",
        publicationCode: "JB",
        startsAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        daysRemaining: 30,
        autoRenew: false,
      },
    ];
    login("guest-token-" + Date.now(), guestSub, demoSub);
  };

  return (
    <div className="space-y-6">
      {/* Audio Listen Mode Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#016BB7]/10 flex items-center justify-center text-[#016BB7]">
            <Volume2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              {isGu ? "ઓડિયો લિસન મોડ (Text-to-Speech)" : "Audio Listen Mode (Text-to-Speech)"}
            </div>
            <div className="text-[11px] text-slate-500">
              {isGu
                ? "સમગ્ર અહેવાલ અવાજમાં સાંભળો (Chrome / Edge / Safari સપોર્ટ)"
                : "Listen to the complete article hands-free"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleAudio}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isSpeaking
              ? "bg-rose-600 text-white animate-pulse"
              : "bg-[#016BB7] hover:bg-[#015593] text-white"
          }`}
        >
          {isSpeaking ? (
            <>
              <StopIcon className="h-3.5 w-3.5 fill-current" />
              <span>{isGu ? "ઓડિયો બંધ કરો" : "Stop Listening"}</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isGu ? "અહેવાલ સાંભળો" : "Listen to Story"}</span>
            </>
          )}
        </button>
      </div>

      {/* SUBSCRIBER UNLOCKED STATUS BANNER (Shown when signed in as subscriber/guest) */}
      {hasAccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span>
                  {isGu
                    ? "સબ્સ્ક્રાઇબર એક્સેસ સક્રિય: સંપૂર્ણ અહેવાલ ઉપલબ્ધ છે"
                    : "Subscriber Access Active: Full Article Unlocked"}
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-800">
                  {isGu ? "પ્રીમિયમ" : "PREMIUM"}
                </span>
              </div>
              <div className="text-[11px] text-emerald-700">
                {isGu
                  ? "તમે સબ્સ્ક્રાઇબર વિશેષાધિકાર સાથે સંપૂર્ણ વિશ્લેષણ અને આંકડા વાંચી રહ્યા છો."
                  : "You have unrestricted access to full investigative reports and official statements."}
              </div>
            </div>
          </div>

          <Link
            href={`/${locale}/epaper?page=${article.epaperPageNumber || 1}`}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#016BB7] hover:underline shrink-0"
          >
            <span>{isGu ? "ઈ-પેપર પાનું જુઓ" : "View in E-Paper"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Paragraphs Display */}
      <div className="space-y-4 text-base sm:text-lg text-[#292725]/90 leading-relaxed font-gujarati">
        {allParagraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* FOR SUBSCRIBERS: Clean Footer linking to Broadsheet Page (No Lock Box!) */}
      {hasAccess ? (
        <div className="mt-8 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#016BB7]/10 flex items-center justify-center text-[#016BB7] shrink-0">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {isGu
                  ? `આ અહેવાલ આજના ઈ-પેપરના પાના નં. ${article.epaperPageNumber || 1} પર છપાયો છે`
                  : `Published on Page ${article.epaperPageNumber || 1} of Today's Janmabhoomi Print Edition`}
              </div>
              <div className="text-xs text-slate-600">
                {isGu
                  ? "સંપૂર્ણ ૧૨ પાનાનું બ્રોડશીટ ડિજિટલ અખબાર વાંચવા ઈ-પેપર રીડર ખોલો."
                  : "Read the physical multi-column broadsheet replica layout in the E-Paper reader."}
              </div>
            </div>
          </div>

          <Link
            href={`/${locale}/epaper?page=${article.epaperPageNumber || 1}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#016BB7] hover:bg-[#015593] text-white px-5 py-2.5 text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Newspaper className="h-4 w-4" />
            <span>
              {isGu
                ? `પાનું ${article.epaperPageNumber || 1} ઈ-પેપરમાં વાંચો →`
                : `Open Page ${article.epaperPageNumber || 1} in E-Paper →`}
            </span>
          </Link>
        </div>
      ) : (
        /* FOR NON-SUBSCRIBERS: The Subscription Paywall Gate */
        <div className="relative mt-6 pt-4">
          <div className="select-none pointer-events-none blur-[3px] opacity-40 space-y-2 text-sm text-[#292725] mb-4">
            <p>
              {isGu
                ? `[સબ્સ્ક્રાઇબર ઈ-પેપર અનુસંધાન] આ અહેવાલની સંપૂર્ણ વિગતો, સત્તાવાર આંકડા અને વિશેષ વિશ્લેષણ આજના જન્મભૂમિ પ્રિન્ટ અને ડિજિટલ ઈ-પેપરના પાના નં. ${article.epaperPageNumber} પર ચાલુ...`
                : `[Subscriber E-Paper Continuation] Detailed statistical tables, official statements, and full multi-column regional ground reports continue on Page ${article.epaperPageNumber} of today's Janmabhoomi print and digital replica edition...`}
            </p>
          </div>

          <div
            id="epaper-subscription-gate"
            className="rounded-2xl border-2 border-[#016BB7] bg-[#FAF8F3] p-6 sm:p-8 shadow-sm"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#016BB7] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              <Lock className="h-3.5 w-3.5" />
              <span>{dict.paywall.badge}</span>
            </div>

            <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-[#016BB7]">
              {dict.paywall.title}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-[#292725]/80 leading-relaxed">
              {dict.paywall.description}
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-medium text-[#292725]/85">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#016BB7]" />
                <span>
                  {getLocalizedText(article.epaperEdition, locale)} —{" "}
                  {dict.paywall.editionReference} {article.epaperPageNumber}
                </span>
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#016BB7]" />
                <span>
                  {isGu
                    ? "સંપૂર્ણ ૧૨ પાનાનું દૈનિક ઈ-પેપર"
                    : "Full 12-Page Broadsheet Digital Edition"}
                </span>
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/epaper?page=${article.epaperPageNumber}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#016BB7] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#015593] transition-colors shadow-xs"
              >
                <Newspaper className="h-4 w-4" />
                <span>{dict.paywall.primaryCta}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
