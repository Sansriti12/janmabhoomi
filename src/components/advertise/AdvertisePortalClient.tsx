"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Megaphone,
  TrendingUp,
  Users,
  Globe,
  Newspaper,
  CheckCircle2,
  Phone,
  Mail,
  Calculator,
  Monitor,
  FileText,
  BookOpen,
  Compass,
  Headphones,
  ArrowRight,
  Printer,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  Send,
} from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import {
  AdInquiryCategory,
  AdSlotKey,
  DEFAULT_AD_CAMPAIGNS,
  addAdInquiry,
  loadAdCampaigns,
} from "@/lib/data/adStore";

interface AdvertisePortalClientProps {
  lang: Locale;
}

const SLOT_VISUALS: Array<{
  key: AdSlotKey;
  icon: React.ElementType;
  titleEn: string;
  titleGu: string;
  dims: string;
  rate30: number;
  impressions: string;
  bestForEn: string;
  bestForGu: string;
}> = [
  {
    key: "homepage_leaderboard",
    icon: Monitor,
    titleEn: "Homepage Primary Leaderboard",
    titleGu: "હોમપેજ પ્રાથમિક લીડરબોર્ડ",
    dims: "970 × 110 px",
    rate30: 45000,
    impressions: "4.5L+ / mo",
    bestForEn: "Jewellers, Real Estate, BFSI, Automobile & Corporate Brands",
    bestForGu: "જ્વેલર્સ, રિયલ એસ્ટેટ, બેંકિંગ, ઓટો અને કોર્પોરેટ બ્રાન્ડ્સ",
  },
  {
    key: "epaper_sponsor",
    icon: BookOpen,
    titleEn: "E-Paper Reader Top Sponsor",
    titleGu: "ઇ-પેપર રીડર ટોપ સ્પોન્સર",
    dims: "728 × 60 px (All 12 Pages)",
    rate30: 55000,
    impressions: "2.8L+ / mo (18 min avg)",
    bestForEn: "High-Net-Worth Subscribers, IPOs, Wealth & Luxury",
    bestForGu: "પ્રીમિયમ સબ્સ્ક્રાઇબર્સ, આઈપીઓ, ફાઇનાન્સ અને લક્ઝરી",
  },
  {
    key: "article_sidebar",
    icon: FileText,
    titleEn: "Article Sidebar Banner (Sticky)",
    titleGu: "લેખ સાઇડબાર સ્ટિકી જાહેરાત",
    dims: "300 × 250 px",
    rate30: 38000,
    impressions: "6.2L+ / mo",
    bestForEn: "Education, Healthcare, Retail & Direct Response Leads",
    bestForGu: "શિક્ષણ, આરોગ્ય, રિટેલ અને સીધા લીડ જનરેશન માટે",
  },
  {
    key: "panchang_sponsor",
    icon: Compass,
    titleEn: "Daily Panchang 'Powered By'",
    titleGu: "દૈનિક પંચાંગ 'પ્રસ્તુતકર્તા'",
    dims: "468 × 60 px + Brand Badge",
    rate30: 25000,
    impressions: "2.2L+ / mo",
    bestForEn: "Jewellery, Gold, Hospitality, Astrology & Trusts",
    bestForGu: "જ્વેલરી, સોનું-ચાંદી, હોસ્પિટાલિટી અને શુભ પ્રસંગો",
  },
  {
    key: "audio_sponsor",
    icon: Headphones,
    titleEn: "2-Min Audio Bulletin Sponsor",
    titleGu: "૨-મિનિટ ઓડિયો બુલેટિન સ્પોન્સર",
    dims: "Hero Card Sponsor Badge",
    rate30: 30000,
    impressions: "1.9L+ / mo",
    bestForEn: "Morning/Evening Commuters, Fintech, Travel & FMCG",
    bestForGu: "દૈનિક શ્રોતાઓ, ફિનટેક, ટ્રાવેલ અને એફએમસીજી બ્રાન્ડ્સ",
  },
];

export function AdvertisePortalClient({ lang }: AdvertisePortalClientProps) {
  const isGu = lang === "gu";
  const [campaigns, setCampaigns] = useState(DEFAULT_AD_CAMPAIGNS);
  const [activeVisualSlot, setActiveVisualSlot] = useState<AdSlotKey>("homepage_leaderboard");
  const [activeTab, setActiveTab] = useState<AdInquiryCategory>("display");

  // Rate Estimator & Form State
  const [selectedFormatKey, setSelectedFormatKey] = useState<AdSlotKey>("homepage_leaderboard");
  const [durationDays, setDurationDays] = useState<number>(15);
  const [editionScope, setEditionScope] = useState<"mumbai" | "gujarat" | "network">("mumbai");
  const [includePrintCombo, setIncludePrintCombo] = useState<boolean>(true);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [notes, setNotes] = useState("");
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    setCampaigns(loadAdCampaigns());
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as AdInquiryCategory | null;
      const slot = params.get("slot") as AdSlotKey | null;
      if (tab && ["display", "classified", "obituary", "sponsored"].includes(tab)) {
        setActiveTab(tab);
      }
      if (slot && slot in DEFAULT_AD_CAMPAIGNS) {
        setActiveVisualSlot(slot);
        setSelectedFormatKey(slot);
      }
    }
  }, []);

  const activeVisual =
    SLOT_VISUALS.find((s) => s.key === activeVisualSlot) || SLOT_VISUALS[0];

  // Dynamic Indicative Price Calculator
  const estimatedBudget = useMemo(() => {
    if (activeTab === "obituary") {
      const base = 3500;
      const scopeMult = editionScope === "network" ? 2.2 : editionScope === "gujarat" ? 1.5 : 1;
      return Math.round((base * scopeMult + (includePrintCombo ? 4500 : 0)) / 100) * 100;
    }
    if (activeTab === "classified") {
      const base = 6500;
      const scopeMult = editionScope === "network" ? 2.0 : editionScope === "gujarat" ? 1.4 : 1;
      return Math.round((base * scopeMult + (includePrintCombo ? 6000 : 0)) / 100) * 100;
    }
    if (activeTab === "sponsored") {
      const base = 35000;
      const scopeMult = editionScope === "network" ? 1.8 : editionScope === "gujarat" ? 1.3 : 1;
      return Math.round((base * scopeMult + (includePrintCombo ? 25000 : 0)) / 500) * 500;
    }

    // Display & Brand Ads
    const baseMonthly = campaigns[selectedFormatKey]?.indicativeRateInr || 35000;
    const durationFactor = durationDays === 7 ? 0.35 : durationDays === 15 ? 0.6 : 1;
    const scopeMult = editionScope === "network" ? 1.65 : editionScope === "gujarat" ? 1.25 : 1;
    const printAddon = includePrintCombo ? Math.round(baseMonthly * 0.45) : 0;
    return Math.round((baseMonthly * durationFactor * scopeMult + printAddon) / 500) * 500;
  }, [activeTab, campaigns, selectedFormatKey, durationDays, editionScope, includePrintCombo]);

  const handleSelectPackage = (
    tab: AdInquiryCategory,
    slotKey: AdSlotKey,
    days: number,
    scope: "mumbai" | "gujarat" | "network",
    printCombo: boolean
  ) => {
    setActiveTab(tab);
    setSelectedFormatKey(slotKey);
    setDurationDays(days);
    setEditionScope(scope);
    setIncludePrintCombo(printCombo);
    const el = document.getElementById("ad-booking-form");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const formatLabel =
      activeTab === "obituary"
        ? "Besanu / Shradhanjali Obituary Notice"
        : activeTab === "classified"
        ? "Classified / Public & Legal Notice"
        : activeTab === "sponsored"
        ? "Janmabhoomi Spotlight Sponsored Article"
        : campaigns[selectedFormatKey]?.placementLabelEn || "Display Banner";

    const created = addAdInquiry({
      category: activeTab,
      name: name.trim(),
      company: company.trim() || "Direct Advertiser",
      phone: phone.trim(),
      email: email.trim() || "—",
      city: city.trim() || "Mumbai",
      selectedFormat: `${formatLabel} (${editionScope.toUpperCase()})`,
      durationDays: activeTab === "obituary" || activeTab === "classified" ? 3 : durationDays,
      includePrintCombo,
      estimatedBudgetInr: estimatedBudget,
      notes: notes.trim(),
    });

    setSubmittedRef(created.id);
    setName("");
    setCompany("");
    setPhone("");
    setEmail("");
    setNotes("");
  };

  return (
    <div className="bg-[#FAF8F3] min-h-screen pb-14">
      {/* 1. AUTHORITY HERO BANNER */}
      <section className="bg-linear-to-br from-[#071F3A] via-[#0B3563] to-[#016BB7] text-white border-b-4 border-amber-400">
        <div className="container-wide py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-bold tracking-wide text-amber-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>
                  {isGu
                    ? "સૌરાષ્ટ્ર ટ્રસ્ટ (સ્થાપના ૧૯૩૧) • ૯૩+ વર્ષનો અતૂટ વિશ્વાસ"
                    : "Saurashtra Trust (Est. 1931) • 93+ Years of Trusted Reach"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                {isGu
                  ? "મુંબઈ, ગુજરાત અને વિદેશના વિશ્વસનીય વાચકો સુધી તમારી બ્રાન્ડ પહોંચાડો"
                  : "Grow Your Brand With Mumbai & Gujarat's Most Trusted News Network"}
              </h1>

              <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                {isGu
                  ? "જન્મભૂમિ વેબસાઇટ, ડિજિટલ ઇ-પેપર, ૨-મિનિટ ઓડિયો બુલેટિન અને દૈનિક પંચાંગ દ્વારા ઉચ્ચ-આવક ધરાવતા વ્યાપારી અને પરિવાર વાચકો સુધી સીધી પહોંચ."
                  : "High-impact digital display, E-Paper sponsorships, daily Panchang & Audio Bulletin integrations, and Print + Digital bundles."}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#ad-booking-form"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#071F3A] px-5 py-3 text-sm font-black shadow-lg transition-all"
                >
                  <Calculator className="h-4 w-4" />
                  <span>{isGu ? "જાહેરાત દર ગણો અને બુક કરો" : "Estimate Rate & Book Ad"}</span>
                </a>
                <a
                  href="#slot-visualizer"
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white px-5 py-3 text-sm font-bold transition-all"
                >
                  <Monitor className="h-4 w-4" />
                  <span>{isGu ? "જાહેરાત સ્લોટ્સ જુઓ" : "Preview Ad Slots"}</span>
                </a>
                <button
                  type="button"
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="inline-flex items-center gap-2 rounded-lg bg-transparent hover:bg-white/10 border border-white/20 text-blue-100 px-4 py-3 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>{isGu ? "રેટ કાર્ડ PDF ડાઉનલોડ કરો" : "Download Rate Card (PDF)"}</span>
                </button>
              </div>
            </div>

            {/* Right KPI Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                <Users className="h-5 w-5 text-amber-300 mb-2" />
                <p className="text-2xl sm:text-3xl font-black">10L+</p>
                <p className="text-xs text-blue-100/85 mt-0.5">
                  {isGu ? "માસિક સક્રિય વાચકો (પ્રિન્ટ + ડિજિટલ)" : "Monthly Active Readers (Print + Digital)"}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                <Newspaper className="h-5 w-5 text-amber-300 mb-2" />
                <p className="text-2xl sm:text-3xl font-black">8 Titles</p>
                <p className="text-xs text-blue-100/85 mt-0.5">
                  {isGu ? "જન્મભૂમિ, વ્યાપાર, કચ્છમિત્ર, ફૂલછાબ" : "Janmabhoomi, Vyapar, Kutchmitra, Phulchhab"}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                <Clock className="h-5 w-5 text-amber-300 mb-2" />
                <p className="text-2xl sm:text-3xl font-black">18+ Min</p>
                <p className="text-xs text-blue-100/85 mt-0.5">
                  {isGu ? "ઇ-પેપર સરેરાશ વાંચન સમય" : "Avg. E-Paper Session Duration"}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-4">
                <Globe className="h-5 w-5 text-amber-300 mb-2" />
                <p className="text-2xl sm:text-3xl font-black">NCCS A/B</p>
                <p className="text-xs text-blue-100/85 mt-0.5">
                  {isGu ? "મુંબઈ, ગુજરાત અને NRI વ્યાપારી વર્ગ" : "Mumbai, Gujarat & NRI Business Leaders"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE AD PLACEMENT VISUALIZER */}
      <section id="slot-visualizer" className="container-wide py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#016BB7]">
              {isGu ? "લાઇવ પ્લેસમેન્ટ પ્રિવ્યુ" : "Interactive Placement Visualizer"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B] mt-1">
              {isGu ? "તમારી જાહેરાત વેબસાઇટ પર ક્યાં દેખાશે?" : "See Exactly Where Your Brand Appears"}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            {isGu
              ? "દરેક સ્લોટ પર ક્લિક કરીને તેનું માપ, માસિક અંદાજિત વ્યુઝ અને સૂચક દર જુઓ."
              : "Click any format below to preview its live position, dimensions, monthly reach, and indicative pricing."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Slot Selector Tabs */}
          <div className="lg:col-span-5 space-y-2.5">
            {SLOT_VISUALS.map((slot) => {
              const Icon = slot.icon;
              const isSelected = activeVisualSlot === slot.key;
              return (
                <button
                  key={slot.key}
                  type="button"
                  onClick={() => setActiveVisualSlot(slot.key)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-[#016BB7] text-white border-[#016BB7] shadow-md"
                      : "bg-white text-slate-800 border-slate-200 hover:border-[#016BB7]/60"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? "bg-white/15 text-amber-300" : "bg-[#016BB7]/10 text-[#016BB7]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm truncate">
                        {isGu ? slot.titleGu : slot.titleEn}
                      </p>
                      <span
                        className={`text-[11px] font-extrabold shrink-0 ${
                          isSelected ? "text-amber-300" : "text-[#016BB7]"
                        }`}
                      >
                        ₹{(slot.rate30 / 1000).toFixed(0)}k/mo
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-0.5 ${
                        isSelected ? "text-blue-100" : "text-slate-500"
                      }`}
                    >
                      {slot.dims} • {slot.impressions}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Live Page Wireframe + Specs Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {isGu ? activeVisual.titleGu : activeVisual.titleEn}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isGu ? activeVisual.bestForGu : activeVisual.bestForEn}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold">
                  {activeVisual.impressions}
                </span>
              </div>

              {/* Clean Wireframe Visual Mockup */}
              <div className="my-5 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                {/* Mock Header */}
                <div className="h-4 rounded bg-[#071F3A] w-full flex items-center px-2 gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="h-1.5 w-16 rounded bg-white/40" />
                </div>

                {activeVisualSlot === "epaper_sponsor" ? (
                  <>
                    <div className="rounded-lg border-2 border-amber-400 bg-linear-to-r from-amber-100 to-amber-50 p-3 text-center">
                      <p className="text-xs font-black text-[#071F3A] uppercase tracking-wider">
                        ★ {isGu ? "તમારી બ્રાન્ડ — ઇ-પેપર ટોપ સ્પોન્સર (728 × 60)" : "YOUR BRAND — E-PAPER TOP SPONSOR (728 × 60)"} ★
                      </p>
                    </div>
                    <div className="grid grid-cols-12 gap-2 h-32">
                      <div className="col-span-2 rounded bg-slate-200/80" />
                      <div className="col-span-8 rounded bg-white border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-400">
                        12-Page Broadsheet E-Paper Viewer
                      </div>
                      <div className="col-span-2 rounded bg-slate-200/80" />
                    </div>
                  </>
                ) : activeVisualSlot === "article_sidebar" ? (
                  <div className="grid grid-cols-12 gap-3 h-40">
                    <div className="col-span-8 rounded bg-white border border-slate-200 p-3 space-y-2">
                      <div className="h-3 bg-slate-300 rounded w-3/4" />
                      <div className="h-16 bg-slate-200 rounded w-full" />
                      <div className="h-2 bg-slate-200 rounded w-full" />
                      <div className="h-2 bg-slate-200 rounded w-5/6" />
                    </div>
                    <div className="col-span-4 flex flex-col gap-2">
                      <div className="flex-1 rounded-lg border-2 border-amber-400 bg-linear-to-br from-amber-100 to-amber-50 p-2 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-[#071F3A] uppercase">
                          ★ YOUR AD ★
                        </span>
                        <span className="text-[10px] font-bold text-amber-900 mt-0.5">
                          Sticky 300 × 250
                        </span>
                      </div>
                      <div className="h-10 rounded bg-slate-200/80" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-12 gap-2.5 h-24">
                      <div className="col-span-8 rounded bg-white border border-slate-200 p-2 flex flex-col justify-between">
                        <div className="h-2.5 w-2/3 bg-slate-300 rounded" />
                        <div className="h-12 bg-slate-200 rounded" />
                      </div>
                      <div className="col-span-4 flex flex-col gap-1.5">
                        <div
                          className={`rounded p-2 text-center ${
                            activeVisualSlot === "audio_sponsor"
                              ? "border-2 border-amber-400 bg-amber-100 text-[#071F3A] font-black text-[10px]"
                              : "bg-slate-200 text-[10px] text-slate-500"
                          }`}
                        >
                          {activeVisualSlot === "audio_sponsor"
                            ? "★ AUDIO SPONSOR ★"
                            : "Audio Bulletin"}
                        </div>
                        <div className="flex-1 rounded bg-slate-200/70" />
                      </div>
                    </div>

                    <div
                      className={`rounded-lg p-2.5 text-center ${
                        activeVisualSlot === "homepage_leaderboard"
                          ? "border-2 border-amber-400 bg-linear-to-r from-amber-100 to-amber-50 text-[#071F3A] font-black text-xs"
                          : "bg-slate-200/70 text-[11px] text-slate-400"
                      }`}
                    >
                      {activeVisualSlot === "homepage_leaderboard"
                        ? "★ YOUR BRAND LEADERBOARD BANNER (970 × 110 px) ★"
                        : "Homepage Primary Leaderboard Slot"}
                    </div>

                    <div
                      className={`rounded-lg p-2 text-center ${
                        activeVisualSlot === "panchang_sponsor"
                          ? "border-2 border-amber-400 bg-amber-100 text-[#071F3A] font-black text-xs"
                          : "bg-slate-200/60 text-[10px] text-slate-400"
                      }`}
                    >
                      {activeVisualSlot === "panchang_sponsor"
                        ? "★ DAILY PANCHANG — POWERED BY YOUR BRAND ★"
                        : "Daily Panchang & News Coverage"}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">
                  {isGu ? "સૂચક માસિક દર:" : "Indicative Monthly Rate:"}
                </span>{" "}
                <span className="text-base font-black text-[#016BB7]">
                  ₹{activeVisual.rate30.toLocaleString("en-IN")}
                </span>{" "}
                <span className="text-slate-400">+ GST</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleSelectPackage("display", activeVisualSlot, 30, "mumbai", true)
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#016BB7] hover:bg-[#015696] text-white px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>{isGu ? "આ સ્લોટ પસંદ કરો" : "Select This Slot"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CURATED ADVERTISING PACKAGES */}
      <section className="container-wide py-6">
        <div className="mb-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#016BB7]">
            {isGu ? "લોકપ્રિય જાહેરાત પેકેજો" : "Advertising Packages & Solutions"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1E293B] mt-1">
            {isGu ? "તમારા વ્યવસાય માટે શ્રેષ્ઠ જાહેરાત વિકલ્પો" : "Flexible Plans for Every Business Goal"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              badgeEn: "SME Starter",
              badgeGu: "લોકલ બિઝનેસ",
              titleEn: "City Digital Booster",
              titleGu: "સિટી ડિજિટલ બૂસ્ટર",
              price: "₹18,000",
              unitEn: "/ 15 days",
              unitGu: "/ ૧૫ દિવસ",
              features: isGu
                ? ["આર્ટિકલ સાઇડબાર (300×250)", "દૈનિક પંચાંગ પ્રાયોજક બેજ", "મુંબઈ + ગુજરાત ડિજિટલ રીચ"]
                : ["Article Sticky Sidebar (300×250)", "Daily Panchang Sponsor Badge", "Mumbai + Gujarat Digital Reach"],
              featured: false,
              onSelect: () => handleSelectPackage("display", "article_sidebar", 15, "mumbai", false),
            },
            {
              badgeEn: "Most Popular",
              badgeGu: "સૌથી લોકપ્રિય",
              titleEn: "Homepage + E-Paper Takeover",
              titleGu: "હોમપેજ + ઇ-પેપર ટેકઓવર",
              price: "₹75,000",
              unitEn: "/ 30 days",
              unitGu: "/ ૩૦ દિવસ",
              features: isGu
                ? ["હોમપેજ લીડરબોર્ડ (970×110)", "૧૨-પાના ઇ-પેપર ટોપ સ્પોન્સર", "૧ બ્રાન્ડેડ સ્પોટલાઇટ લેખ", "લાઇવ ક્લિક અને વ્યુ રિપોર્ટ"]
                : ["Homepage Leaderboard (970×110)", "12-Page E-Paper Top Sponsor", "1 Branded Spotlight Article", "Live Click & Impression Report"],
              featured: true,
              onSelect: () => handleSelectPackage("display", "epaper_sponsor", 30, "gujarat", true),
            },
            {
              badgeEn: "Brand Storytelling",
              badgeGu: "બ્રાન્ડ સ્પોટલાઇટ",
              titleEn: "Sponsored Article + Audio Bulletin",
              titleGu: "સ્પોન્સર્ડ લેખ + ઓડિયો બુલેટિન",
              price: "₹45,000",
              unitEn: "/ campaign",
              unitGu: "/ કેમ્પેઇન",
              features: isGu
                ? ["ગુજરાતી અને અંગ્રેજીમાં બ્રાન્ડેડ ફીચર લેખ", "૨-મિનિટ ઓડિયો બુલેટિન પ્રાયોજક બેજ", "હોમપેજ પર ૧૫ દિવસ ફીચર્ડ પ્લેસમેન્ટ", "લોન્ચ, આરોગ્ય, શિક્ષણ અને રિયલ એસ્ટેટ માટે ઉત્તમ"]
                : ["Bilingual Branded Spotlight Article (GU + EN)", "2-Min Audio Bulletin Sponsor Badge", "15-Day Homepage Featured Placement", "Ideal for Launches, Healthcare, Education & Real Estate"],
              featured: false,
              onSelect: () => handleSelectPackage("sponsored", "audio_sponsor", 15, "gujarat", false),
            },
          ].map((pkg, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                pkg.featured
                  ? "bg-[#071F3A] text-white border-amber-400 shadow-xl ring-2 ring-amber-400/40"
                  : "bg-white text-slate-900 border-slate-200 shadow-xs hover:border-[#016BB7]"
              }`}
            >
              <div>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    pkg.featured
                      ? "bg-amber-400 text-[#071F3A]"
                      : "bg-[#016BB7]/10 text-[#016BB7]"
                  }`}
                >
                  {isGu ? pkg.badgeGu : pkg.badgeEn}
                </span>
                <h3 className="text-lg font-extrabold mt-3">
                  {isGu ? pkg.titleGu : pkg.titleEn}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span
                    className={`text-2xl font-black ${
                      pkg.featured ? "text-amber-300" : "text-[#016BB7]"
                    }`}
                  >
                    {pkg.price}
                  </span>
                  <span
                    className={`text-xs ${
                      pkg.featured ? "text-blue-200" : "text-slate-500"
                    }`}
                  >
                    {isGu ? pkg.unitGu : pkg.unitEn}
                  </span>
                </div>
                <ul className="mt-4 space-y-2 text-xs">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 mt-0.5 ${
                          pkg.featured ? "text-amber-300" : "text-emerald-600"
                        }`}
                      />
                      <span className={pkg.featured ? "text-blue-50" : "text-slate-600"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={pkg.onSelect}
                className={`mt-5 w-full rounded-xl py-2.5 text-xs font-extrabold transition-colors cursor-pointer ${
                  pkg.featured
                    ? "bg-amber-400 hover:bg-amber-300 text-[#071F3A]"
                    : "bg-[#016BB7] hover:bg-[#015696] text-white"
                }`}
              >
                {isGu ? "આ પેકેજ પસંદ કરો" : "Choose Package"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INTERACTIVE RATE CALCULATOR + SELF-SERVE BOOKING FORM */}
      <section id="ad-booking-form" className="container-wide py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Category Tabs */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 pt-5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-[#016BB7]" />
              <span>
                {isGu
                  ? "જાહેરાત દર અંદાજ અને ઓનલાઈન બુકિંગ પૂછપરછ"
                  : "Instant Rate Estimator & Ad Booking Desk"}
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "display", en: "Display & Brand Ads", gu: "ડિસ્પ્લે અને બ્રાન્ડ જાહેરાત" },
                  { id: "classified", en: "Classified & Legal Notice", gu: "ક્લાસિફાઇડ અને જાહેર નોટિસ" },
                  { id: "obituary", en: "Besanu / Shradhanjali", gu: "બેસણું / શ્રદ્ધાંજલિ" },
                  { id: "sponsored", en: "Sponsored Spotlight", gu: "સ્પોન્સર્ડ લેખ / ઇવેન્ટ" },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === t.id
                      ? "bg-white text-[#016BB7] border-[#016BB7]"
                      : "text-slate-600 border-transparent hover:text-slate-900"
                  }`}
                >
                  {isGu ? t.gu : t.en}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-5">
              {submittedRef && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-emerald-900">
                    <p className="font-extrabold">
                      {isGu
                        ? `તમારી જાહેરાત પૂછપરછ સફળતાપૂર્વક નોંધાઈ ગઈ છે! (Ref: ${submittedRef})`
                        : `Your advertising inquiry has been received! (Ref: ${submittedRef})`}
                    </p>
                    <p className="text-emerald-800/80 mt-0.5">
                      {isGu
                        ? "અમારી મુંબઈ એડ સેલ્સ ટીમ ૨ કલાકમાં તમારો સંપર્ક કરશે. આ પૂછપરછ એડમિન પેનલમાં પણ લાઇવ દેખાશે."
                        : "Our Mumbai Ad Sales Desk will reach out within 2 business hours with artwork specs & final rate sheet."}
                    </p>
                  </div>
                </div>
              )}

              {/* Configurator Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#FAF8F3] border border-[#016BB7]/15">
                {activeTab === "display" && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      {isGu ? "જાહેરાત સ્લોટ" : "Ad Format"}
                    </label>
                    <select
                      value={selectedFormatKey}
                      onChange={(e) => setSelectedFormatKey(e.target.value as AdSlotKey)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                    >
                      {SLOT_VISUALS.map((s) => (
                        <option key={s.key} value={s.key}>
                          {isGu ? s.titleGu : s.titleEn}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === "display" && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                      {isGu ? "સમયગાળો" : "Campaign Duration"}
                    </label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                    >
                      <option value={7}>{isGu ? "૭ દિવસ" : "7 Days"}</option>
                      <option value={15}>{isGu ? "૧૫ દિવસ (બચત ૧૫%)" : "15 Days (Save 15%)"}</option>
                      <option value={30}>{isGu ? "૩૦ દિવસ (શ્રેષ્ઠ મૂલ્ય)" : "30 Days (Best Value)"}</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    {isGu ? "આવૃત્તિ / વિસ્તાર" : "Target Geography"}
                  </label>
                  <select
                    value={editionScope}
                    onChange={(e) =>
                      setEditionScope(e.target.value as "mumbai" | "gujarat" | "network")
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="mumbai">{isGu ? "મુંબઈ આવૃત્તિ" : "Mumbai Edition"}</option>
                    <option value="gujarat">
                      {isGu ? "મુંબઈ + ગુજરાત + સૌરાષ્ટ્ર" : "Mumbai + Gujarat + Saurashtra"}
                    </option>
                    <option value="network">
                      {isGu ? "સમગ્ર સૌરાષ્ટ્ર ટ્રસ્ટ નેટવર્ક + NRI" : "All 8 Publications + NRI"}
                    </option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-center gap-2 pt-1">
                  <input
                    id="print-combo-toggle"
                    type="checkbox"
                    checked={includePrintCombo}
                    onChange={(e) => setIncludePrintCombo(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#016BB7]"
                  />
                  <label
                    htmlFor="print-combo-toggle"
                    className="text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    {isGu
                      ? "પ્રિન્ટ અખબાર + ડિજિટલ કોમ્બો ઉમેરો (વધુ ૩૫% બચત અને બમણી અસર)"
                      : "Include Print Broadsheet + Digital Combo (Save up to 35% vs standalone print)"}
                  </label>
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isGu ? "તમારું નામ *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isGu ? "દા.ત. કેતનભાઈ ઝવેરી" : "e.g. Ketan Zaveri"}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#016BB7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isGu ? "કંપની / બ્રાન્ડનું નામ" : "Company / Brand Name"}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={isGu ? "દા.ત. ઝવેરી જ્વેલર્સ" : "e.g. Zaveri Jewellers"}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#016BB7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isGu ? "મોબાઇલ / વોટ્સએપ નંબર *" : "Phone / WhatsApp *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 00000"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#016BB7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isGu ? "ઈમેલ સરનામું" : "Business Email"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marketing@company.in"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isGu ? "શહેર" : "City"}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#016BB7] focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isGu ? "જાહેરાતની વિગત / તારીખ" : "Campaign Brief / Preferred Publish Date"}
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      isGu
                        ? "તમારી જરૂરિયાત અથવા જાહેરાતનું લખાણ અહીં લખો..."
                        : "Share target launch date, creative notes, or special requirements..."
                    }
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#016BB7] hover:bg-[#015696] text-white px-6 py-3 text-sm font-extrabold shadow-sm transition-colors cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>
                  {isGu
                    ? "જાહેરાત પૂછપરછ સબમિટ કરો (ત્વરીત કોલબેક)"
                    : "Submit Ad Inquiry & Request Callback"}
                </span>
              </button>
            </form>

            {/* Right: Live Estimate Summary & Direct Mumbai Ad Desk */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-[#071F3A] text-white p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-blue-200">
                  <span className="font-bold uppercase tracking-wider">
                    {isGu ? "અંદાજિત રોકાણ" : "Indicative Estimate"}
                  </span>
                  <TrendingUp className="h-4 w-4 text-amber-300" />
                </div>
                <p className="text-3xl font-black text-amber-300">
                  ₹{estimatedBudget.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-blue-200 ml-1">+ GST</span>
                </p>
                <p className="text-xs text-blue-100/85 leading-relaxed">
                  {isGu
                    ? "આ અંદાજિત દર છે. લાંબા ગાળાના કેમ્પેઇન અને પ્રિન્ટ+ડિજિટલ કોમ્બો માટે અમારી ટીમ વિશેષ કોર્પોરેટ ડિસ્કાઉન્ટ આપે છે."
                    : "Indicative rate card estimate. Custom agency discounts and volume packages are available from our Mumbai Ad Desk."}
                </p>
                <div className="pt-3 border-t border-white/15 space-y-1.5 text-xs text-blue-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{isGu ? "૧૦૦% બ્રાન્ડ-સેફ એડિટોરિયલ વાતાવરણ" : "100% Brand-Safe Editorial Environment"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>{isGu ? "GST ઇન્વોઇસ અને લાઇવ પરફોર્મન્સ રિપોર્ટ" : "GST Invoice & Campaign CTR Report"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#FAF8F3] p-5 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  {isGu ? "સીધો જાહેરાત વિભાગ સંપર્ક" : "Direct Advertising Desk"}
                </h3>
                <div className="space-y-2 text-xs text-slate-700">
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-[#016BB7] shrink-0 mt-0.5" />
                    <span>Janmabhoomi Bhavan, Janmabhoomi Marg, Fort, Mumbai — 400001</span>
                  </p>
                  <p className="flex items-center gap-2 font-semibold">
                    <Phone className="h-4 w-4 text-[#016BB7] shrink-0" />
                    <span>+91 (022) 2287 0831 / 32 / 33</span>
                  </p>
                  <p className="flex items-center gap-2 font-semibold">
                    <Mail className="h-4 w-4 text-[#016BB7] shrink-0" />
                    <span>advt@janmabhoominewspapers.com</span>
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{isGu ? "સોમ – શનિ: સવારે ૧૦ થી સાંજે ૭" : "Mon – Sat: 10 AM – 7 PM IST"}</span>
                  <Link
                    href={`/${lang}/contact`}
                    className="font-bold text-[#016BB7] hover:underline"
                  >
                    {isGu ? "અન્ય શાખાઓ →" : "All Branches →"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
