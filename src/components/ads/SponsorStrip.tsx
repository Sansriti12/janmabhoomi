"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, ArrowUpRight } from "lucide-react";
import {
  ADS_UPDATED_EVENT,
  AdCampaignSlot,
  AdSlotKey,
  DEFAULT_AD_CAMPAIGNS,
  loadAdCampaigns,
  trackAdClick,
  trackAdImpression,
} from "@/lib/data/adStore";

interface SponsorStripProps {
  slotKey: AdSlotKey;
  lang: string;
  theme?: "light" | "dark";
  compact?: boolean;
}

/**
 * Compact "Presented By / Powered By" Sponsor Strip
 * Used inside Daily Panchang, 2-Minute Audio Bulletin, and E-Paper Reader.
 */
export function SponsorStrip({
  slotKey,
  lang,
  theme = "light",
  compact = false,
}: SponsorStripProps) {
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
  const ctaText = isGu ? campaign.ctaGu : campaign.ctaEn;

  const isDark = theme === "dark";

  const content = (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg border transition-all ${
        compact ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2 text-xs"
      } ${
        isDark
          ? "bg-[#016BB7]/30 border-[#7DD3FC]/35 text-blue-50 hover:bg-[#016BB7]/45"
          : "bg-[#EAF3FB] border-[#016BB7]/35 text-[#0B2239] hover:border-[#016BB7] shadow-2xs"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0 ${
            isDark
              ? "bg-white text-[#004E89]"
              : "bg-[#016BB7] text-white"
          }`}
        >
          <Megaphone className="h-2.5 w-2.5" />
          <span>{isGu ? "પ્રાયોજક" : "SPONSOR"}</span>
        </span>
        <span
          className={`font-bold truncate ${
            isDark ? "text-white" : "text-[#0B2239]"
          }`}
        >
          {campaign.isHouseAd ? headline : `${campaign.sponsorName} — ${headline}`}
        </span>
      </div>

      <span
        className={`inline-flex items-center gap-0.5 font-extrabold shrink-0 ${
          isDark ? "text-[#BAE6FD]" : "text-[#004E89]"
        }`}
      >
        <span>{ctaText}</span>
        <ArrowUpRight className="h-3 w-3" />
      </span>
    </div>
  );

  if (isExternal) {
    return (
      <a
        href={resolvedHref}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackAdClick(slotKey)}
        className="block"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={resolvedHref}
      onClick={() => trackAdClick(slotKey)}
      className="block"
    >
      {content}
    </Link>
  );
}
