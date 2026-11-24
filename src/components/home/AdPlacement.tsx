"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { AdvertisementSlot } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import {
  ADS_UPDATED_EVENT,
  AdCampaignSlot,
  AdSlotKey,
  DEFAULT_AD_CAMPAIGNS,
  loadAdCampaigns,
  trackAdClick,
  trackAdImpression,
} from "@/lib/data/adStore";

interface AdPlacementProps {
  slot?: AdvertisementSlot;
  slotKey?: AdSlotKey;
  lang: Locale;
  label?: string;
  variant?: "leaderboard" | "sidebar";
}

/**
 * Dynamic Revenue Ad Placement
 * - Syncs live with `/[lang]/admin/ads` via adStore
 * - Renders custom creative image if configured by Admin
 * - Otherwise renders a high-converting executive house-ad banner linking to `/[lang]/advertise`
 * - Tracks session impressions & clicks automatically
 */
export function AdPlacement({
  slotKey = "homepage_leaderboard",
  lang,
  label,
  variant = "leaderboard",
}: AdPlacementProps) {
  const isGu = lang === "gu";
  const [campaign, setCampaign] = useState<AdCampaignSlot>(
    DEFAULT_AD_CAMPAIGNS[slotKey]
  );

  useEffect(() => {
    const sync = () => {
      const all = loadAdCampaigns();
      if (all[slotKey]) setCampaign(all[slotKey]);
    };
    sync();
    trackAdImpression(slotKey);
    window.addEventListener(ADS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ADS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [slotKey]);

  if (!campaign.active) return null;

  const isExternal = campaign.targetUrl.startsWith("http");
  const resolvedHref = isExternal
    ? campaign.targetUrl
    : `/${lang}${campaign.targetUrl.startsWith("/") ? campaign.targetUrl : `/${campaign.targetUrl}`}`;

  const headline = isGu ? campaign.headlineGu : campaign.headlineEn;
  const subtext = isGu ? campaign.subtextGu : campaign.subtextEn;
  const ctaText = isGu ? campaign.ctaGu : campaign.ctaEn;
  const badgeLabel =
    label || (isGu ? "જાહેરાત • SPONSORED" : "ADVERTISEMENT • SPONSORED");

  const handleClick = () => {
    trackAdClick(slotKey);
  };

  // SIDEBAR 300x250 MPU VARIANT (Article / Category Right Rail)
  if (variant === "sidebar") {
    return (
      <div className="rounded-xl overflow-hidden border border-[#016BB7]/25 bg-white shadow-xs">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span>{badgeLabel}</span>
          <span>{campaign.dimensionsLabel}</span>
        </div>

        {campaign.imageUrl ? (
          <a
            href={resolvedHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer sponsored" : undefined}
            onClick={handleClick}
            className="block group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.imageUrl}
              alt={headline}
              className="w-full h-auto object-cover group-hover:opacity-95 transition-opacity"
            />
          </a>
        ) : (
          <div className="bg-linear-to-br from-[#071F3A] via-[#0B3563] to-[#016BB7] text-white p-5 space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-300/35 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300">
              <Megaphone className="h-3 w-3" />
              <span>{campaign.sponsorName}</span>
            </div>
            <h3 className="text-base font-black leading-snug">{headline}</h3>
            <p className="text-xs text-blue-100/90 leading-relaxed">{subtext}</p>
            <div className="pt-1">
              <Link
                href={resolvedHref}
                onClick={handleClick}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#071F3A] px-4 py-2.5 text-xs font-black transition-colors shadow-sm"
              >
                <span>{ctaText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // HORIZONTAL LEADERBOARD VARIANT (Homepage / Mid-Feed)
  return (
    <section aria-label={badgeLabel} className="container-wide my-4">
      <div className="rounded-xl overflow-hidden border border-[#016BB7]/25 shadow-xs bg-white">
        <div className="flex items-center justify-between px-4 py-1 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <span>{badgeLabel}</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">{campaign.dimensionsLabel}</span>
            <Link
              href={`/${lang}/advertise?slot=${slotKey}`}
              className="text-[#016BB7] hover:underline font-extrabold"
            >
              {isGu ? "અહીં જાહેરાત આપો →" : "Advertise Here →"}
            </Link>
          </div>
        </div>

        {campaign.imageUrl ? (
          <a
            href={resolvedHref}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer sponsored" : undefined}
            onClick={handleClick}
            className="block w-full bg-slate-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={campaign.imageUrl}
              alt={headline}
              className="w-full max-h-[140px] object-cover"
            />
          </a>
        ) : (
          <div className="bg-linear-to-r from-[#071F3A] via-[#0B3563] to-[#016BB7] text-white px-5 py-4 sm:px-7 sm:py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 border border-amber-300/35 text-amber-300">
                  <Megaphone className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="rounded bg-amber-400 text-[#071F3A] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                      {campaign.isHouseAd
                        ? isGu
                          ? "જાહેરાત માટે ઉપલબ્ધ"
                          : "PRIME AD SLOT"
                        : campaign.sponsorName}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-200">
                      {campaign.monthlyEstImpressions}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-black text-white leading-snug">
                    {headline}
                  </p>
                  <p className="text-xs text-blue-100/85 mt-0.5 line-clamp-2">
                    {subtext}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {isExternal ? (
                  <a
                    href={resolvedHref}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    onClick={handleClick}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#071F3A] px-5 py-2.5 text-xs font-black shadow-md transition-all"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link
                    href={resolvedHref}
                    onClick={handleClick}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#071F3A] px-5 py-2.5 text-xs font-black shadow-md transition-all"
                  >
                    <span>{ctaText}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
