"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Newspaper,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Layers,
  Calendar,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  RotateCcw,
  User,
} from "lucide-react";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";

export interface PublicHotspot {
  id: string;
  xPercent: number | string;
  yPercent: number | string;
  widthPercent: number | string;
  heightPercent: number | string;
  headlineText?: string;
  targetType: "article" | "external" | "zoom";
  externalUrl?: string;
  article?: {
    id: string;
    slug?: string;
    translations?: Array<{ slug: string; headline: string; summary: string }>;
  };
}

export interface PublicPageItem {
  id: string;
  pageNumber: number;
  labelEn: string;
  labelGu: string;
  widthPx: number;
  heightPx: number;
  isFreePreview: boolean;
  imageThumbnailKey: string;
  hotspots?: PublicHotspot[];
}

export interface PublicEdition {
  id: string;
  publicationId: string;
  editionDate: string;
  editionCity: string;
  editionNameEn: string;
  editionNameGu: string;
  totalPageCount: number;
  freePreviewPageLimit?: number;
  quarter?: string;
  pages: PublicPageItem[];
}

const PUBLICATIONS = [
  { id: "pub-janmabhoomi", nameEn: "Janmabhoomi", nameGu: "જન્મભૂમિ", freq: "Daily Evening" },
  { id: "pub-kutchmitra", nameEn: "Kutchmitra", nameGu: "કચ્છમિત્ર", freq: "Daily Morning" },
  { id: "pub-phulchhab", nameEn: "Phulchhab", nameGu: "ફૂલછાબ", freq: "Daily Morning" },
  { id: "pub-vyapar-gu", nameEn: "Vyapar Gujarati", nameGu: "વ્યાપાર (ગુજરાતી)", freq: "Bi-Weekly" },
  { id: "pub-vyapar-hi", nameEn: "Vyapar Hindi", nameGu: "વ્યાપાર (હિન્દી)", freq: "Weekly" },
  { id: "pub-pravasi", nameEn: "Janmabhoomi Pravasi", nameGu: "જન્મભૂમિ પ્રવાસી", freq: "Sunday Weekly" },
  { id: "pub-panchang", nameEn: "Panchang Almanac", nameGu: "જન્મભૂમિ પંચાંગ", freq: "Annual Almanac" },
  { id: "pub-kavita", nameEn: "Kavita Magazine", nameGu: "કવિતા સામાયિક", freq: "Quarterly" },
];

interface PublicEpaperReaderProps {
  initialEdition?: PublicEdition;
  lang: string;
}

export function PublicEpaperReader({ initialEdition, lang }: PublicEpaperReaderProps) {
  const isGu = lang === "gu";

  const [selectedPubId, setSelectedPubId] = useState<string>(
    initialEdition?.publicationId || "pub-janmabhoomi"
  );
  const [currentEdition, setCurrentEdition] = useState<PublicEdition | null>(
    initialEdition || getFallbackEdition("pub-janmabhoomi")
  );
  const [activePageNum, setActivePageNum] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [selectedHotspot, setSelectedHotspot] = useState<PublicHotspot | null>(null);

  // Subscriber state & active privileges
  const { token, isAuthenticated, activeSubscriptions, openAuthModal } = useSubscriberAuth();
  const hasActiveAccess = activeSubscriptions.length > 0;
  const subscriberToken = hasActiveAccess ? token : null;
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // When publication changes, load latest edition
  const handleSelectPublication = (pubId: string) => {
    setSelectedPubId(pubId);
    setActivePageNum(1);
    setZoomScale(1);
    setSelectedHotspot(null);
    setCurrentEdition(getFallbackEdition(pubId));
  };

  const pages = currentEdition?.pages || [];
  const activePage = pages.find((p) => p.pageNumber === activePageNum) || pages[0];
  const freePreviewLimit = currentEdition?.freePreviewPageLimit ?? 2;
  const isRestrictedPage = activePage ? activePage.pageNumber > freePreviewLimit && !subscriberToken : false;

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  const handleZoomReset = () => setZoomScale(1);

  const handleNextPage = () => {
    if (activePageNum < pages.length) {
      setActivePageNum((prev) => prev + 1);
      setSelectedHotspot(null);
    }
  };

  const handlePrevPage = () => {
    if (activePageNum > 1) {
      setActivePageNum((prev) => prev - 1);
      setSelectedHotspot(null);
    }
  };

  const currentPub = PUBLICATIONS.find((p) => p.id === selectedPubId) || PUBLICATIONS[0];

  return (
    <div className="space-y-6">
      {/* 1. Publication Switcher Bar */}
      <div className="bg-white rounded-xl border border-[#016BB7]/20 p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            {isGu ? "સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશનોમાંથી પસંદ કરો" : "Select Saurashtra Trust Publication"}
          </span>
          <span className="text-[11px] font-semibold text-[#016BB7] bg-[#016BB7]/10 px-2.5 py-0.5 rounded-full">
            8 Publications Available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {PUBLICATIONS.map((pub) => {
            const isSelected = selectedPubId === pub.id;
            return (
              <button
                key={pub.id}
                type="button"
                onClick={() => handleSelectPublication(pub.id)}
                className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-start border ${
                  isSelected
                    ? "bg-[#016BB7] text-white border-[#016BB7] shadow-xs"
                    : "bg-[#FAF8F3] text-neutral-700 border-neutral-200 hover:border-[#016BB7]/40 hover:bg-neutral-100"
                }`}
              >
                <span>{isGu ? pub.nameGu : pub.nameEn}</span>
                <span className={`text-[10px] font-normal ${isSelected ? "text-white/80" : "text-neutral-500"}`}>
                  {pub.freq}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Reader Control & Information Bar */}
      <div className="flex flex-wrap items-center justify-between bg-white rounded-xl border border-neutral-200 px-4 py-3 gap-3 shadow-xs">
        {/* Edition Title & Date */}
        <div className="flex items-center gap-3">
          <Newspaper className="h-5 w-5 text-[#016BB7]" />
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              {isGu ? currentPub.nameGu : currentPub.nameEn} — {isGu ? "ડિજિટલ પ્રિન્ટ પ્રતિકૃતિ" : "Digital Broadsheet Replica"}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <Calendar className="h-3 w-3 text-[#016BB7]" />
              <span>{currentEdition?.editionDate || "Today's Edition"}</span>
              <span>•</span>
              <span>{currentEdition?.editionCity || "Mumbai"}</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">
                {isGu ? `મફત પ્રીવ્યૂ: પાના ૧–${freePreviewLimit}` : `Free Preview: Pages 1–${freePreviewLimit}`}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom Buttons */}
          <div className="flex items-center bg-neutral-100 rounded-lg p-1 space-x-1 border border-neutral-200">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-white text-neutral-700 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-neutral-600">
              {Math.round(zoomScale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-white text-neutral-700 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="p-1 rounded hover:bg-white text-neutral-700 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Page Navigator */}
          <div className="flex items-center gap-1.5 bg-[#016BB7] text-white rounded-lg px-2 py-1 text-xs">
            <button
              type="button"
              disabled={activePageNum <= 1}
              onClick={handlePrevPage}
              className="p-1 rounded hover:bg-white/20 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold px-1">
              {activePageNum} / {pages.length}
            </span>
            <button
              type="button"
              disabled={activePageNum >= pages.length}
              onClick={handleNextPage}
              className="p-1 rounded hover:bg-white/20 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Reading Area */}
      <div className="relative bg-neutral-900 rounded-2xl p-4 sm:p-8 flex justify-center items-start min-h-[620px] overflow-auto shadow-inner">
        {isRestrictedPage ? (
          /* ============================================================= */
          /* 4. SERVER-VERIFIED SUBSCRIBER PAYWALL GATE                     */
          /* ============================================================= */
          <div className="max-w-lg w-full my-auto bg-white rounded-2xl p-8 text-center space-y-6 shadow-2xl border-2 border-[#016BB7]">
            <div className="w-14 h-14 bg-amber-50 border-2 border-amber-300 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <Lock className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#016BB7] uppercase tracking-wider bg-[#016BB7]/10 px-3 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{isGu ? "સબ્સ્ક્રાઇબર પ્રિન્ટ પ્રતિકૃતિ પ્રવેશ" : "Subscriber Paywall Gate"}</span>
              </span>
              <h3 className="text-xl font-extrabold text-[#1F2937]">
                {isGu
                  ? `પાનું ${activePageNum} વાંચવા માટે સબ્સ્ક્રિપ્શન જરૂરી છે`
                  : `Page ${activePageNum} requires an active subscription`}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-md mx-auto">
                {isGu
                  ? `પ્રથમ ૨ પાના વિનામૂલ્યે ઉપલબ્ધ છે. સંપૂર્ણ ૧૬ પાનાનું બ્રોડશીટ, તમામ અગ્રલેખ, પૂર્તિઓ અને વ્યાપાર પાના વાંચવા માટે સબ્સ્ક્રાઇબ કરો.`
                  : `Pages 1–${freePreviewLimit} are provided as public previews. Continuous reading of full broadsheet pages, institutional editorials, and special supplements is reserved for subscribers.`}
              </p>
            </div>

            {/* Quick Subscription Plan Preview Card */}
            <div className="bg-[#FAF8F3] border border-[#016BB7]/30 rounded-xl p-4 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800">
                  {isGu ? "વાર્ષિક ડિજિટલ ઈ-પેપર પ્લાન" : "Annual Digital E-Paper Plan"}
                </span>
                <span className="text-sm font-extrabold text-[#016BB7]">₹500 / year</span>
              </div>
              <ul className="text-[11px] text-neutral-600 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isGu ? "તમામ ૮ પ્રકાશનોની સંપૂર્ણ આવૃત્તિઓ" : "Unlimited access to all 8 Saurashtra Trust publications"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isGu ? "સવારે ૫:૦૦ કલાકે દૈનિક ઈ-પેપર ઉપલબ્ધ" : "Early morning access from 5:00 AM"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isGu ? "મોબાઇલ, ટેબ્લેટ અને ડેસ્કટોપ સપોર્ટ" : "High-resolution desktop, tablet, and mobile reader"}</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${lang}/subscribe`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#016BB7] text-white text-xs font-bold hover:bg-[#015a99] transition-colors shadow-xs"
              >
                <span>{isGu ? "સબ્સ્ક્રિપ્શન પ્લાન જુઓ" : "Subscribe Now"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-[#016BB7]" />
                  <span>{isGu ? "ખાતામાં પ્રવેશ કરો (Sign In)" : "Sign In to Read"}</span>
                </button>
              ) : (
                <Link
                  href={`/${lang}/account`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
                >
                  <span>{isGu ? "મારું ખાતું જુઓ" : "Manage Account"}</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          /* ============================================================= */
          /* 5. INTERACTIVE BROADSHEET CANVAS WITH HOTSPOTS OVERLAY         */
          /* ============================================================= */
          <div
            ref={containerRef}
            className="relative select-none shadow-2xl rounded-lg bg-white overflow-hidden transition-transform duration-200"
            style={{
              aspectRatio: `${activePage.widthPx} / ${activePage.heightPx}`,
              width: "100%",
              maxWidth: "760px",
              transform: `scale(${zoomScale})`,
              transformOrigin: "top center",
            }}
          >
            {/* Broadsheet Page Simulation Graphic */}
            <div className="w-full h-full p-6 flex flex-col justify-between bg-[#FCFAF7] border-2 border-neutral-300">
              <div className="border-b-2 border-[#016BB7] pb-3 text-center">
                <div className="text-xl sm:text-2xl font-black text-[#016BB7] tracking-wider uppercase">
                  {isGu ? currentPub.nameGu : currentPub.nameEn}
                </div>
                <div className="text-[11px] text-neutral-600 mt-0.5">
                  {isGu ? activePage.labelGu : activePage.labelEn} • {currentEdition?.editionDate}
                </div>
              </div>

              {/* Broadsheet Columns Simulation */}
              <div className="grid grid-cols-3 gap-3 flex-1 my-4">
                <div className="border-r border-dashed border-neutral-200 pr-3 space-y-3">
                  <div className="p-2 bg-[#016BB7]/10 rounded border border-[#016BB7]/20">
                    <p className="text-[10px] font-bold text-[#016BB7] uppercase">LEAD STORY</p>
                    <p className="text-xs font-extrabold text-neutral-900 mt-0.5">
                      {isGu ? "વેસ્ટર્ન મેરિટાઇમ કોરિડોર પ્રોજેક્ટ" : "Western Maritime Corridor Project Approved"}
                    </p>
                    <p className="text-[9px] text-neutral-600 mt-1 leading-relaxed">
                      {isGu ? "રાજ્ય સરકાર અને બંદર સત્તાવાળાઓ વચ્ચે ઐતિહાસિક કરાર..." : "State cabinet clears landmark maritime connectivity initiative..."}
                    </p>
                  </div>
                  <div className="h-32 bg-neutral-100 rounded p-2 text-[9px] text-neutral-500">
                    City Civic Infrastructure Updates & Transport
                  </div>
                </div>

                <div className="border-r border-dashed border-neutral-200 pr-3 space-y-3">
                  <div className="p-2 bg-amber-50 rounded border border-amber-200">
                    <p className="text-[10px] font-bold text-amber-800 uppercase">COMMODITIES</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      {isGu ? "સોના-ચાંદીમાં નવી તેજી" : "Bullion & Commodity Rally"}
                    </p>
                  </div>
                  <div className="h-40 bg-neutral-100 rounded p-2 text-[9px] text-neutral-500">
                    Financial Analysis, Capital Market Indices
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-2 bg-neutral-100 rounded border border-neutral-200">
                    <p className="text-[10px] font-bold text-neutral-700 uppercase">EDITORIAL</p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">
                      {isGu ? "અગ્રલેખ: વિકાસની નવી દિશા" : "Editorial: Vision for Growth"}
                    </p>
                  </div>
                  <div className="h-36 bg-neutral-100 rounded p-2 text-[9px] text-neutral-500">
                    Regional dispatches and Saurashtra Trust cultural notices.
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-2 flex items-center justify-between text-[10px] text-neutral-500">
                <span>Page {activePage.pageNumber} of {pages.length}</span>
                <span>Click any highlighted story box to read full article</span>
                <span>Saurashtra Trust Janmabhoomi</span>
              </div>
            </div>

            {/* Clickable Hotspots Overlay */}
            {activePage.hotspots?.map((hotspot) => {
              const x = Number(hotspot.xPercent);
              const y = Number(hotspot.yPercent);
              const w = Number(hotspot.widthPercent);
              const h = Number(hotspot.heightPercent);

              return (
                <div
                  key={hotspot.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hotspot.targetType === "external" && hotspot.externalUrl) {
                      window.open(hotspot.externalUrl, "_blank");
                    } else {
                      setSelectedHotspot(hotspot);
                    }
                  }}
                  className="absolute rounded border-2 border-emerald-500/80 bg-emerald-500/15 hover:bg-emerald-500/35 transition-all cursor-pointer group z-10"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${w}%`,
                    height: `${h}%`,
                  }}
                  title={hotspot.headlineText || "Click to open article"}
                >
                  <span className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-700 text-white rounded p-1 shadow-xs">
                    <ExternalLink className="h-3 w-3" />
                  </span>
                  {hotspot.headlineText && (
                    <span className="absolute bottom-1 left-1 right-1 truncate px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/95 text-[#1F2937] shadow-xs">
                      {hotspot.headlineText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Page Thumbnails Filmstrip Carousel */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-neutral-700">
            {isGu ? "પાના ઇન્ડેક્સ (બધા પાના)" : "Page Filmstrip Navigation"} ({pages.length} Pages)
          </span>
          <span className="text-[11px] text-neutral-500">
            {isGu ? "કોઈપણ પાનું ખોલવા માટે ક્લિક કરો" : "Click any page thumbnail to navigate"}
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {pages.map((p) => {
            const isActive = p.pageNumber === activePageNum;
            const isFree = p.pageNumber <= freePreviewLimit || subscriberToken;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setActivePageNum(p.pageNumber);
                  setSelectedHotspot(null);
                }}
                className={`shrink-0 flex flex-col items-center p-2 rounded-lg border transition-all ${
                  isActive
                    ? "border-[#016BB7] ring-2 ring-[#016BB7] bg-[#016BB7]/5"
                    : "border-neutral-200 hover:border-[#016BB7]/40 bg-neutral-50"
                }`}
              >
                {/* Simulated Thumbnail Aspect Ratio */}
                <div className="relative w-16 h-22 rounded bg-white border border-neutral-300 flex flex-col justify-between p-1 shadow-xs overflow-hidden">
                  <div className="h-1.5 bg-[#016BB7] rounded-xs"></div>
                  <div className="space-y-0.5">
                    <div className="h-1 bg-neutral-200 rounded"></div>
                    <div className="h-1 bg-neutral-200 rounded w-3/4"></div>
                  </div>
                  {!isFree && (
                    <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center text-white">
                      <Lock className="h-4 w-4 text-amber-400" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-neutral-700 mt-1">
                  P. {p.pageNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. MODAL: Hotspot Article Preview */}
      {selectedHotspot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7]">
                <BookOpen className="h-4 w-4" />
                <span>{isGu ? "સમાચાર લેખ વિગત" : "Article Preview"}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedHotspot(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-neutral-900 leading-snug">
                {selectedHotspot.headlineText || (isGu ? "વેસ્ટર્ન મેરિટાઇમ કોરિડોર યોજના" : "Western Maritime Corridor Initiative")}
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {isGu
                  ? "રાજ્ય સરકારે દરિયાઈ વ્યાપાર અને લોજિસ્ટિક્સ ક્ષેત્રને વેગ આપવા માટે નવા ઈન્ફ્રાસ્ટ્રક્ચર પ્રોજેક્ટને સૈદ્ધાંતિક મંજૂરી આપી છે..."
                  : "State infrastructure authorities announced the expansion of deep-water port connectivity and dedicated trade lanes..."}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedHotspot(null)}
                className="px-4 py-2 rounded text-xs text-neutral-600 hover:bg-neutral-100"
              >
                {isGu ? "બંધ કરો" : "Close"}
              </button>
              <Link
                href={`/${lang}/article/${selectedHotspot.article?.translations?.[0]?.slug || "western-maritime-corridor"}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#016BB7] text-white text-xs font-bold hover:bg-[#016BB7]/90"
              >
                <span>{isGu ? "સંપૂર્ણ લેખ વાંચો" : "Read Full Story"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback edition generator for demonstration
function getFallbackEdition(pubId: string): PublicEdition {
  const isKavita = pubId === "pub-kavita";
  const isPanchang = pubId === "pub-panchang";
  const pageCount = isKavita ? 32 : isPanchang ? 24 : 16;

  return {
    id: `edition-${pubId}-current`,
    publicationId: pubId,
    editionDate: "2026-11-11",
    editionCity: pubId === "pub-kutchmitra" ? "Bhuj" : pubId === "pub-phulchhab" ? "Rajkot" : "Mumbai",
    editionNameEn: `${pubId.replace("pub-", "").toUpperCase()} Print Replica`,
    editionNameGu: "ડિજિટલ પ્રિન્ટ પ્રતિકૃતિ",
    totalPageCount: pageCount,
    freePreviewPageLimit: 2,
    quarter: isKavita ? "Q4" : undefined,
    pages: Array.from({ length: pageCount }, (_, i) => ({
      id: `p-${pubId}-${i + 1}`,
      pageNumber: i + 1,
      labelEn: `Page ${i + 1} — ${i === 0 ? "Front Page" : i === 7 ? "Editorial" : "Broadsheet"}`,
      labelGu: `પાનું ${i + 1} — ${i === 0 ? "મુખ્ય પ્રથમ પાનું" : i === 7 ? "અગ્રલેખ" : "મુખ્ય પૃષ્ઠ"}`,
      widthPx: 1200,
      heightPx: 1800,
      isFreePreview: i < 2,
      imageThumbnailKey: `thumb-${i + 1}.png`,
      hotspots:
        i === 0
          ? [
              {
                id: "hotspot-1",
                xPercent: 5.5,
                yPercent: 18.0,
                widthPercent: 42.0,
                heightPercent: 35.0,
                headlineText: "Western Maritime Corridor Project",
                targetType: "article" as const,
              },
              {
                id: "hotspot-2",
                xPercent: 52.0,
                yPercent: 18.0,
                widthPercent: 42.5,
                heightPercent: 28.0,
                headlineText: "Bullion & Commodity Markets Rally",
                targetType: "article" as const,
              },
            ]
          : [],
    })),
  };
}
