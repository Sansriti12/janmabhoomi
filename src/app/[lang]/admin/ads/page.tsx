"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Megaphone,
  TrendingUp,
  MousePointerClick,
  Eye,
  IndianRupee,
  CheckCircle2,
  PauseCircle,
  Edit3,
  Save,
  RotateCcw,
  ExternalLink,
  Phone,
  Mail,
  Trash2,
  Upload,
  X,
  Inbox,
  LayoutGrid,
} from "lucide-react";
import {
  ADS_UPDATED_EVENT,
  AdCampaignSlot,
  AdInquiry,
  AdInquiryStatus,
  AdSlotKey,
  DEFAULT_AD_CAMPAIGNS,
  loadAdCampaigns,
  loadAdInquiries,
  saveAdCampaigns,
  saveAdInquiries,
} from "@/lib/data/adStore";

const SLOT_ORDER: AdSlotKey[] = [
  "homepage_leaderboard",
  "homepage_mid_banner",
  "article_sidebar",
  "epaper_sponsor",
  "panchang_sponsor",
  "audio_sponsor",
];

export default function AdminAdsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const [activeTab, setActiveTab] = useState<"slots" | "inquiries">("slots");
  const [campaigns, setCampaigns] = useState<Record<AdSlotKey, AdCampaignSlot>>(
    DEFAULT_AD_CAMPAIGNS
  );
  const [inquiries, setInquiries] = useState<AdInquiry[]>([]);
  const [editingSlotKey, setEditingSlotKey] = useState<AdSlotKey | null>(null);
  const [draftSlot, setDraftSlot] = useState<AdCampaignSlot | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setCampaigns(loadAdCampaigns());
      setInquiries(loadAdInquiries());
    };
    sync();
    window.addEventListener(ADS_UPDATED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ADS_UPDATED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const stats = useMemo(() => {
    const slots = SLOT_ORDER.map((k) => campaigns[k]).filter(Boolean);
    const activeCount = slots.filter((s) => s.active).length;
    const totalImpressions = slots.reduce((sum, s) => sum + (s.impressions || 0), 0);
    const totalClicks = slots.reduce((sum, s) => sum + (s.clicks || 0), 0);
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
    const pipelineValue = inquiries
      .filter((i) => i.status !== "archived")
      .reduce((sum, i) => sum + (i.estimatedBudgetInr || 0), 0);
    const newLeads = inquiries.filter((i) => i.status === "new").length;
    return { activeCount, totalImpressions, totalClicks, ctr, pipelineValue, newLeads };
  }, [campaigns, inquiries]);

  const handleToggleActive = (slotKey: AdSlotKey) => {
    const updated = {
      ...campaigns,
      [slotKey]: {
        ...campaigns[slotKey],
        active: !campaigns[slotKey].active,
      },
    };
    setCampaigns(updated);
    saveAdCampaigns(updated);
    showToast(
      updated[slotKey].active
        ? isGu
          ? "જાહેરાત સ્લોટ લાઇવ થયો"
          : "Ad slot activated on live website"
        : isGu
        ? "જાહેરાત સ્લોટ બંધ કરાયો"
        : "Ad slot paused"
    );
  };

  const openEditor = (slotKey: AdSlotKey) => {
    setEditingSlotKey(slotKey);
    setDraftSlot({ ...campaigns[slotKey] });
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlotKey || !draftSlot) return;
    const updated = {
      ...campaigns,
      [editingSlotKey]: draftSlot,
    };
    setCampaigns(updated);
    saveAdCampaigns(updated);
    setEditingSlotKey(null);
    setDraftSlot(null);
    showToast(
      isGu
        ? "જાહેરાત ફેરફારો લાઇવ વેબસાઇટ પર અપડેટ થયા!"
        : "Campaign updated & synced to live website!"
    );
  };

  const handleResetSlot = (slotKey: AdSlotKey) => {
    const updated = {
      ...campaigns,
      [slotKey]: { ...DEFAULT_AD_CAMPAIGNS[slotKey] },
    };
    setCampaigns(updated);
    saveAdCampaigns(updated);
    if (editingSlotKey === slotKey) {
      setDraftSlot({ ...DEFAULT_AD_CAMPAIGNS[slotKey] });
    }
    showToast(isGu ? "સ્લોટ ડિફોલ્ટ પર રીસેટ થયો" : "Slot reset to default");
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !draftSlot) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraftSlot({
          ...draftSlot,
          imageUrl: reader.result,
          isHouseAd: false,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateInquiryStatus = (id: string, status: AdInquiryStatus) => {
    const updated = inquiries.map((inq) =>
      inq.id === id ? { ...inq, status } : inq
    );
    setInquiries(updated);
    saveAdInquiries(updated);
    showToast(isGu ? "લીડ સ્ટેટસ અપડેટ થયું" : "Inquiry status updated");
  };

  const handleDeleteInquiry = (id: string) => {
    const updated = inquiries.filter((inq) => inq.id !== id);
    setInquiries(updated);
    saveAdInquiries(updated);
    showToast(isGu ? "પૂછપરછ દૂર કરાઈ" : "Inquiry deleted");
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 text-xs font-bold shadow-xl border border-white/15 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#016BB7] uppercase tracking-wider">
            <Megaphone className="h-4 w-4" />
            <span>{isGu ? "રેવન્યુ અને જાહેરાત મેનેજમેન્ટ" : "Revenue & Ad Operations"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {isGu ? "જાહેરાત કેમ્પેઇન અને લીડ મેનેજર" : "Ad Campaign & Advertiser Lead Manager"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "વેબસાઇટના તમામ ૬ જાહેરાત સ્લોટ્સ, બેનર ક્રિએટિવ્સ અને જાહેરાત પૂછપરછ અહીંથી મેનેજ કરો."
              : "Control all 6 live website ad placements, swap sponsor creatives, and manage incoming advertiser bookings."}
          </p>
        </div>

        <Link
          href={`/${lang}/advertise`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#016BB7] hover:bg-[#015696] text-white px-4 py-2.5 text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <span>{isGu ? "પબ્લિક જાહેરાત પેજ જુઓ" : "View Public Advertise Page"}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isGu ? "સક્રિય જાહેરાત સ્લોટ્સ" : "Active Ad Placements"}</span>
            <LayoutGrid className="h-4 w-4 text-[#016BB7]" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats.activeCount} <span className="text-sm font-semibold text-slate-400">/ {SLOT_ORDER.length}</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isGu ? "કુલ ઇમ્પ્રેશન્સ" : "Total Impressions"}</span>
            <Eye className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats.totalImpressions.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isGu ? "કુલ ક્લિક્સ અને CTR" : "Total Clicks & CTR"}</span>
            <MousePointerClick className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            {stats.totalClicks.toLocaleString("en-IN")}{" "}
            <span className="text-xs font-bold text-emerald-600">({stats.ctr}%)</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isGu ? "જાહેરાત પાઇપલાઇન" : "Lead Pipeline Value"}</span>
            <IndianRupee className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-[#016BB7] mt-2">
            ₹{stats.pipelineValue.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("slots")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "slots"
              ? "border-[#016BB7] text-[#016BB7]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>{isGu ? "લાઇવ જાહેરાત સ્લોટ્સ (૬)" : "Live Ad Slots (6)"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inquiries")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === "inquiries"
              ? "border-[#016BB7] text-[#016BB7]"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Inbox className="h-4 w-4" />
          <span>
            {isGu ? "જાહેરાત પૂછપરછ અને લીડ્સ" : "Advertiser Inquiries"} ({inquiries.length})
          </span>
          {stats.newLeads > 0 && (
            <span className="rounded-full bg-rose-600 text-white px-2 py-0.5 text-[10px] font-black">
              {stats.newLeads} {isGu ? "નવી" : "New"}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE AD SLOTS */}
      {activeTab === "slots" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {SLOT_ORDER.map((slotKey) => {
            const slot = campaigns[slotKey];
            if (!slot) return null;
            const slotCtr =
              slot.impressions > 0
                ? ((slot.clicks / slot.impressions) * 100).toFixed(2)
                : "0.00";
            return (
              <div
                key={slotKey}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                            slot.active
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {slot.active ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <PauseCircle className="h-3 w-3" />
                          )}
                          <span>{slot.active ? "Live" : "Paused"}</span>
                        </span>
                        <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold">
                          {slot.isHouseAd ? "House Ad CTA" : `Paid: ${slot.sponsorName}`}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {slot.dimensionsLabel}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                        {isGu ? slot.placementLabelGu : slot.placementLabelEn}
                      </h3>
                      <p className="text-xs text-slate-500">{slot.pageLocation}</p>
                    </div>

                    <span className="text-xs font-black text-[#016BB7] shrink-0">
                      ₹{slot.indicativeRateInr.toLocaleString("en-IN")}/mo
                    </span>
                  </div>

                  {slot.imageUrl && (
                    <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slot.imageUrl}
                        alt={slot.headlineEn}
                        className="w-full max-h-24 object-cover"
                      />
                    </div>
                  )}

                  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 text-xs space-y-1">
                    <p className="font-bold text-slate-800 line-clamp-1">
                      {isGu ? slot.headlineGu : slot.headlineEn}
                    </p>
                    <p className="text-slate-500 line-clamp-1">
                      {isGu ? slot.subtextGu : slot.subtextEn}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] text-slate-500 font-semibold">Impressions</p>
                      <p className="text-xs font-black text-slate-900">
                        {slot.impressions.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] text-slate-500 font-semibold">Clicks</p>
                      <p className="text-xs font-black text-slate-900">
                        {slot.clicks.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                      <p className="text-[10px] text-slate-500 font-semibold">CTR</p>
                      <p className="text-xs font-black text-emerald-700">{slotCtr}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slotKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      slot.active
                        ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {slot.active
                      ? isGu
                        ? "થોભાવો"
                        : "Pause Slot"
                      : isGu
                      ? "ચાલુ કરો"
                      : "Activate Slot"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleResetSlot(slotKey)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Reset to default"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditor(slotKey)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#016BB7] hover:bg-[#015696] text-white px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>{isGu ? "એડિટ / બેનર અપલોડ" : "Edit / Upload Banner"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TAB 2: ADVERTISER INQUIRIES */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {inquiries.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              {isGu ? "હાલ કોઈ જાહેરાત પૂછપરછ નથી." : "No advertiser inquiries yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3 font-bold">Advertiser / Company</th>
                    <th className="px-4 py-3 font-bold">Category & Format</th>
                    <th className="px-4 py-3 font-bold">Estimate</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-extrabold text-slate-900">{inq.name}</p>
                        <p className="text-slate-600 font-medium">{inq.company}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <a
                            href={`tel:${inq.phone}`}
                            className="inline-flex items-center gap-1 text-[#016BB7] hover:underline font-semibold"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{inq.phone}</span>
                          </a>
                          {inq.email && inq.email !== "—" && (
                            <a
                              href={`mailto:${inq.email}`}
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              <span>{inq.email}</span>
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <span className="inline-block rounded-full bg-[#016BB7]/10 text-[#016BB7] px-2 py-0.5 text-[10px] font-black uppercase">
                          {inq.category}
                        </span>
                        {inq.includePrintCombo && (
                          <span className="ml-1.5 inline-block rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold">
                            Print + Digital
                          </span>
                        )}
                        <p className="font-bold text-slate-800 mt-1">{inq.selectedFormat}</p>
                        {inq.notes && (
                          <p className="text-slate-500 mt-0.5 max-w-xs line-clamp-2">{inq.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <p className="font-black text-slate-900">
                          ₹{inq.estimatedBudgetInr.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {inq.durationDays} days • {inq.city}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            handleUpdateInquiryStatus(inq.id, e.target.value as AdInquiryStatus)
                          }
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold cursor-pointer ${
                            inq.status === "booked"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : inq.status === "contacted"
                              ? "bg-amber-50 border-amber-200 text-amber-800"
                              : inq.status === "archived"
                              ? "bg-slate-100 border-slate-200 text-slate-500"
                              : "bg-blue-50 border-blue-200 text-[#016BB7]"
                          }`}
                        >
                          <option value="new">New Lead</option>
                          <option value="contacted">Contacted</option>
                          <option value="booked">Booked / Won</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="px-4 py-3.5 align-top text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete inquiry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EDIT SLOT MODAL */}
      {editingSlotKey && draftSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <form
            onSubmit={handleSaveSlot}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-slate-200"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isGu ? draftSlot.placementLabelGu : draftSlot.placementLabelEn}
                </h2>
                <p className="text-xs text-slate-500">
                  {draftSlot.dimensionsLabel} • {draftSlot.pageLocation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingSlotKey(null);
                  setDraftSlot(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSlot.active}
                  onChange={(e) => setDraftSlot({ ...draftSlot, active: e.target.checked })}
                />
                <span>Slot Active on Website</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draftSlot.isHouseAd}
                  onChange={(e) => setDraftSlot({ ...draftSlot, isHouseAd: e.target.checked })}
                />
                <span>Show as House Ad (&quot;Advertise Here&quot;)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sponsor / Brand Name</label>
                <input
                  type="text"
                  value={draftSlot.sponsorName}
                  onChange={(e) => setDraftSlot({ ...draftSlot, sponsorName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Indicative Monthly Rate (₹)</label>
                <input
                  type="number"
                  value={draftSlot.indicativeRateInr}
                  onChange={(e) =>
                    setDraftSlot({ ...draftSlot, indicativeRateInr: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline (English)</label>
                <input
                  type="text"
                  value={draftSlot.headlineEn}
                  onChange={(e) => setDraftSlot({ ...draftSlot, headlineEn: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Headline (Gujarati)</label>
                <input
                  type="text"
                  value={draftSlot.headlineGu}
                  onChange={(e) => setDraftSlot({ ...draftSlot, headlineGu: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtext (English)</label>
                <input
                  type="text"
                  value={draftSlot.subtextEn}
                  onChange={(e) => setDraftSlot({ ...draftSlot, subtextEn: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtext (Gujarati)</label>
                <input
                  type="text"
                  value={draftSlot.subtextGu}
                  onChange={(e) => setDraftSlot({ ...draftSlot, subtextGu: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">CTA Label (English)</label>
                <input
                  type="text"
                  value={draftSlot.ctaEn}
                  onChange={(e) => setDraftSlot({ ...draftSlot, ctaEn: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">CTA Label (Gujarati)</label>
                <input
                  type="text"
                  value={draftSlot.ctaGu}
                  onChange={(e) => setDraftSlot({ ...draftSlot, ctaGu: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Target URL (Internal e.g. /advertise or External https://...)
                </label>
                <input
                  type="text"
                  value={draftSlot.targetUrl}
                  onChange={(e) => setDraftSlot({ ...draftSlot, targetUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="block font-bold text-slate-700">
                  Creative Banner Image (Optional — overrides text banner)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={draftSlot.imageUrl || ""}
                    onChange={(e) => setDraftSlot({ ...draftSlot, imageUrl: e.target.value })}
                    placeholder="Paste image URL or upload file..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                  <label className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-2 font-bold text-slate-800 cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </label>
                  {draftSlot.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setDraftSlot({ ...draftSlot, imageUrl: "" })}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-rose-600 font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setEditingSlotKey(null);
                  setDraftSlot(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#016BB7] hover:bg-[#015696] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save & Publish Live</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
