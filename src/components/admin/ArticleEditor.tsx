"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  ArrowLeft,
  Save,
  Send,
  Calendar,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Image as ImageIcon,
  Eye,
  FileText,
  Lock,
  Layers,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface CategoryOption {
  id: string;
  nameGu: string;
  nameEn: string;
  slug: string;
}

interface MediaAssetOption {
  id: string;
  filename: string;
  publicUrl: string;
  captionGu?: string;
  captionEn?: string;
}

interface ArticleEditorProps {
  lang: string;
  articleId?: string; // If provided, edit mode; otherwise, create mode
}

export function ArticleEditor({ lang, articleId }: ArticleEditorProps) {
  const router = useRouter();
  const isGu = lang === "gu";
  const { token } = useStaffAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  // Form State
  const [publicationId, setPublicationId] = useState<string>("pub-janmabhoomi");
  const [categoryId, setCategoryId] = useState<string>("national");
  const [headlineGu, setHeadlineGu] = useState<string>("");
  const [summaryGu, setSummaryGu] = useState<string>("");
  const [contentHtmlGu, setContentHtmlGu] = useState<string>("");
  const [isBreaking, setIsBreaking] = useState<boolean>(false);
  const [isLeadStory, setIsLeadStory] = useState<boolean>(false);
  const [isSubLead, setIsSubLead] = useState<boolean>(false);
  const [isPaywalled, setIsPaywalled] = useState<boolean>(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>("");
  const [imageCaptionGu, setImageCaptionGu] = useState<string>("");
  const [imageCaptionEn, setImageCaptionEn] = useState<string>("");
  const [epaperPageNumber, setEpaperPageNumber] = useState<number | "">("");

  // English Translation State
  const [headlineEn, setHeadlineEn] = useState<string>("");
  const [summaryEn, setSummaryEn] = useState<string>("");
  const [contentHtmlEn, setContentHtmlEn] = useState<string>("");
  const [translationStatus, setTranslationStatus] = useState<string>("NOT_REQUESTED");
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const [isManuallyEdited, setIsManuallyEdited] = useState<boolean>(false);
  const [previousEn, setPreviousEn] = useState<{ headline?: string; summary?: string; body?: string } | null>(null);
  const [showDiffModal, setShowDiffModal] = useState<boolean>(false);

  // Status & Metadata
  const [articleStatus, setArticleStatus] = useState<string>("DRAFT");
  const [sourceVersion, setSourceVersion] = useState<number>(1);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [scheduledFor, setScheduledFor] = useState<string>("");

  // Modals
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewLang, setPreviewLang] = useState<"gu" | "en">("gu");
  const [previewImageError, setPreviewImageError] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [articleHistory, setArticleHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // UI state
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState<boolean>(articleId ? true : false);
  const [saving, setSaving] = useState<boolean>(false);
  const [translating, setTranslating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Media Picker Modal
  const [showMediaPicker, setShowMediaPicker] = useState<boolean>(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetOption[]>([]);
  const [mediaLoading, setMediaLoading] = useState<boolean>(false);

  // Load Categories on mount
  useEffect(() => {
    if (!token) return;
    fetch(`${baseUrl}/api/v1/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.data);
          if (!articleId && data.data.length > 0) {
            setCategoryId(data.data[0].id);
          }
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, [baseUrl, token, articleId]);

  // Load Article if in Edit mode
  useEffect(() => {
    if (!articleId || !token) return;
    setLoading(true);

    fetch(`${baseUrl}/api/v1/admin/articles/${articleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.success || !json.data) {
          throw new Error(json.error?.message || "Failed to load article.");
        }
        const art = json.data;
        setPublicationId(art.publicationId);
        setCategoryId(art.categoryId);
        setArticleStatus(art.status);
        setSourceVersion(art.sourceVersion || 1);
        setIsBreaking(art.isBreaking);
        setIsLeadStory(art.isLeadStory);
        setIsSubLead(art.isSubLead);
        setIsPaywalled(art.isPaywalled);
        setFeaturedImageUrl(art.featuredImageUrl || "");
        setImageCaptionGu(art.imageCaptionGu || "");
        setImageCaptionEn(art.imageCaptionEn || "");
        setEpaperPageNumber(art.epaperPageNumber || "");
        setPublishedAt(art.publishedAt);

        if (art.gujarati) {
          setHeadlineGu(art.gujarati.headline || "");
          setSummaryGu(art.gujarati.summary || "");
          setContentHtmlGu(art.gujarati.contentHtml || "");
        }

        if (art.english) {
          setHeadlineEn(art.english.headline || "");
          setSummaryEn(art.english.summary || "");
          setContentHtmlEn(art.english.contentHtml || "");
          setTranslationStatus(art.english.translationStatus || "COMPLETED");
          setQualityWarnings(art.english.qualityWarnings || []);
          setIsManuallyEdited(art.english.isManuallyEdited || false);

          if (art.english.previousHeadline || art.english.previousSummary || art.english.previousContentHtml) {
            setPreviousEn({
              headline: art.english.previousHeadline,
              summary: art.english.previousSummary,
              body: art.english.previousContentHtml,
            });
          }
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [articleId, baseUrl, token]);

  // Open Media Library
  const openMediaPicker = () => {
    setShowMediaPicker(true);
    if (!token) return;
    setMediaLoading(true);
    fetch(`${baseUrl}/api/v1/media?limit=30`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setMediaAssets(json.data);
        }
      })
      .catch((err) => console.error("Media load error:", err))
      .finally(() => setMediaLoading(false));
  };

  // Open Revision History & Audit Trail
  const openHistoryModal = async () => {
    if (!articleId || !token) return;
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/articles/${articleId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setArticleHistory(json.data.history || []);
      }
    } catch (err) {
      console.error("Failed to load article history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Trigger or retry English translation
  const handleTriggerTranslation = async () => {
    if (!token) return;
    if (!headlineGu.trim() || !summaryGu.trim()) {
      alert(isGu ? "કૃપા કરીને પહેલા ગુજરાતી શીર્ષક અને સારાંશ દાખલ કરો." : "Please enter Gujarati headline and summary first.");
      return;
    }

    setTranslating(true);
    try {
      if (articleId) {
        const res = await fetch(`${baseUrl}/api/v1/admin/articles/${articleId}/translate`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Translation failed.");
        }
        setHeadlineEn(json.data.headlineEn);
        setSummaryEn(json.data.summaryEn);
        setContentHtmlEn(json.data.contentHtmlEn);
        setTranslationStatus(json.data.translationStatus);
        setQualityWarnings(json.data.qualityWarnings || []);
      } else {
        // In create mode, save as draft first then let backend auto-translate
        await handleSave(false, false);
      }
    } catch (err: any) {
      alert(err.message || "Translation failure.");
    } finally {
      setTranslating(false);
    }
  };

  // Save Gujarati & English changes
  const handleSave = async (publishImmediately = false, redirectToArticles = true) => {
    if (!token) return;
    setError(null);
    setSuccessMsg(null);

    if (!headlineGu.trim() || !summaryGu.trim() || !contentHtmlGu.trim()) {
      setError(
        isGu
          ? "ગુજરાતી શીર્ષક, સારાંશ અને વિષયવસ્તુ તમામ આવશ્યક છે."
          : "Gujarati headline, summary, and article body are all required."
      );
      return;
    }

    setSaving(true);
    try {
      if (!articleId) {
        // Create Mode
        const payload = {
          publicationId,
          categoryId,
          headlineGu,
          summaryGu,
          contentHtmlGu,
          isBreaking,
          isLeadStory,
          isSubLead,
          isPaywalled,
          featuredImageUrl: featuredImageUrl || undefined,
          imageCaptionGu: imageCaptionGu || undefined,
          imageCaptionEn: imageCaptionEn || undefined,
          epaperPageNumber: epaperPageNumber ? Number(epaperPageNumber) : undefined,
          publishImmediately,
        };

        const res = await fetch(`${baseUrl}/api/v1/admin/articles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to create article.");
        }

        const newId = json.data.id;
        if (redirectToArticles) {
          router.push(`/${lang}/admin/articles`);
        } else {
          router.push(`/${lang}/admin/articles/${newId}`);
        }
      } else {
        // Edit Mode: 1. Update Article & Gujarati
        const payload = {
          publicationId,
          categoryId,
          headlineGu,
          summaryGu,
          contentHtmlGu,
          isBreaking,
          isLeadStory,
          isSubLead,
          isPaywalled,
          featuredImageUrl: featuredImageUrl || null,
          imageCaptionGu: imageCaptionGu || null,
          imageCaptionEn: imageCaptionEn || null,
          epaperPageNumber: epaperPageNumber ? Number(epaperPageNumber) : null,
          retranslate: false, // Don't auto-overwrite without review
        };

        const res = await fetch(`${baseUrl}/api/v1/admin/articles/${articleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to update article.");
        }

        // 2. Save manual English translation edits if provided
        if (headlineEn.trim() && summaryEn.trim() && contentHtmlEn.trim()) {
          await fetch(`${baseUrl}/api/v1/admin/articles/${articleId}/translation/en`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              headlineEn,
              summaryEn,
              contentHtmlEn,
            }),
          });
        }

        // 3. Handle publish if requested
        if (publishImmediately) {
          const pubRes = await fetch(`${baseUrl}/api/v1/admin/articles/${articleId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "PUBLISHED" }),
          });
          const pubJson = await pubRes.json();
          if (!pubRes.ok || !pubJson.success) {
            throw new Error(pubJson.error?.message || "Failed to publish article.");
          }
          setArticleStatus("PUBLISHED");
        }

        setSuccessMsg(
          publishImmediately
            ? isGu
              ? "લેખ સફળતાપૂર્વક પ્રકાશિત થયો!"
              : "Article published successfully!"
            : isGu
            ? "ફેરફારો સફળતાપૂર્વક સાચવવામાં આવ્યા!"
            : "Changes saved successfully!"
        );

        if (redirectToArticles) {
          router.push(`/${lang}/admin/articles`);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Schedule Publication at specific datetime
  const handleSchedulePublication = async () => {
    if (!token || !articleId) return;
    if (!scheduledFor) {
      alert(
        isGu
          ? "કૃપા કરીને પ્રકાશન માટે તારીખ અને સમય પસંદ કરો."
          : "Please select date and time for scheduled publication."
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/articles/${articleId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "SCHEDULED",
          scheduledFor: new Date(scheduledFor).toISOString(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to schedule publication.");
      }
      setArticleStatus("SCHEDULED");
      setSuccessMsg(
        isGu
          ? "લેખ સફળતાપૂર્વક નિયત સમયે પ્રકાશિત કરવા માટે શેડ્યૂલ કરાયો!"
          : "Article scheduled for publication successfully!"
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#016BB7]" />
        <p className="text-sm">{isGu ? "લેખ લોડ થઈ રહ્યો છે..." : "Loading newsroom editor..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href={`/${lang}/admin/articles`}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {articleId
                  ? isGu
                    ? "સમાચાર સંપાદન"
                    : "Edit News Article"
                  : isGu
                  ? "નવો સમાચાર લેખ"
                  : "Create News Article"}
              </h1>
              {articleStatus === "PUBLISHED" ? (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {isGu ? "પ્રકાશિત" : "PUBLISHED"}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                  {isGu ? "ડ્રાફ્ટ" : "DRAFT"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isGu
                ? "ગુજરાતી મુખ્ય મૂળ ભાષા છે. અંગ્રેજી આપમેળે અનુવાદ થાય છે અને ચકાસી શકાય છે."
                : "Gujarati is the authoritative source. English is auto-translated & verified."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setPreviewImageError(false);
              setShowPreviewModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>{isGu ? "પૂર્વાવલોકન" : "Preview"}</span>
          </button>

          {articleId && (
            <button
              type="button"
              onClick={openHistoryModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{isGu ? "ઇતિહાસ" : "History"}</span>
            </button>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(false, false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{saving ? (isGu ? "સાચવી રહ્યા છે..." : "Saving...") : isGu ? "ડ્રાફ્ટ સાચવો" : "Save Draft"}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true, true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{saving ? (isGu ? "પ્રકાશિત થઈ રહ્યું છે..." : "Publishing...") : isGu ? "હવે પ્રકાશિત કરો" : "Publish Now"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metadata Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Publication Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isGu ? "પ્રકાશન (અખબાર)" : "Publication"}
          </label>
          <select
            value={publicationId}
            onChange={(e) => setPublicationId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
          >
            <option value="pub-janmabhoomi">Janmabhoomi — જન્મભૂમિ (દૈનિક સાંજ)</option>
            <option value="pub-pravasi">Janmabhoomi Pravasi — પ્રવાસી (રવિવારીય)</option>
          </select>
        </div>

        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isGu ? "સમાચાર કેટેગરી" : "Category"}
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isGu ? c.nameGu : c.nameEn} ({c.slug})
              </option>
            ))}
          </select>
        </div>

        {/* E-Paper Page */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isGu ? "ઇ-પેપર પાનું ક્રમાંક" : "E-Paper Page #"}
          </label>
          <input
            type="number"
            min="1"
            max="100"
            placeholder="e.g. 1, 4, 8"
            value={epaperPageNumber}
            onChange={(e) => setEpaperPageNumber(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
          />
        </div>

        {/* Scheduled Publication */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isGu ? "નિયત સમય પ્રકાશન (Schedule)" : "Schedule Publication"}
          </label>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
            />
            {articleId && articleStatus !== "PUBLISHED" && (
              <button
                type="button"
                onClick={handleSchedulePublication}
                disabled={saving || !scheduledFor}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 shrink-0"
              >
                {isGu ? "શેડ્યૂલ" : "Schedule"}
              </button>
            )}
          </div>
        </div>

        {/* Priority Toggles (Spanning Full Width) */}
        <div className="col-span-1 sm:col-span-2 lg:col-span-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isGu ? "સમાચાર અગ્રતા:" : "Editorial Priority:"}
          </span>

          <label
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              isLeadStory
                ? "bg-amber-50 border-amber-300 text-amber-900 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <input
              type="checkbox"
              checked={isLeadStory}
              onChange={(e) => setIsLeadStory(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
            />
            <span>{isGu ? "★ મુખ્ય સમાચાર (Lead Story)" : "★ Lead Story (Homepage Hero)"}</span>
          </label>

          <label
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
              isBreaking
                ? "bg-rose-50 border-rose-300 text-rose-900 shadow-2xs"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <input
              type="checkbox"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
            />
            <span>{isGu ? "● બ્રેકિંગ ન્યૂઝ (Breaking)" : "● Breaking News (Ticker)"}</span>
          </label>
        </div>
      </div>

      {/* Featured Image Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            {isGu ? "મુખ્ય છબી (Featured Image URL)" : "Featured Image URL"}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://... or select from Media Library"
              value={featuredImageUrl}
              onChange={(e) => setFeaturedImageUrl(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
            />
            <button
              type="button"
              onClick={openMediaPicker}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg inline-flex items-center gap-1.5 transition-colors shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isGu ? "મીડિયા લાઇબ્રેરી" : "Browse Media"}</span>
            </button>
          </div>
        </div>

        {featuredImageUrl && (
          <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featuredImageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* DUAL-PANE BILINGUAL EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: GUJARATI ORIGINAL (AUTHORITATIVE) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
              <h2 className="font-bold text-sm tracking-wide">
                {isGu ? "ગુજરાતી મૂળ સમાચાર (Authoritative Source)" : "Gujarati Original (Source)"}
              </h2>
            </div>
            <span className="text-[11px] bg-slate-800 text-blue-300 px-2 py-0.5 rounded font-mono">
              v{sourceVersion}
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* Gujarati Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isGu ? "સમાચાર શીર્ષક (Headline) *" : "Gujarati Headline *"}
              </label>
              <input
                type="text"
                placeholder={isGu ? "અહીં ગુજરાતી શીર્ષક લખો..." : "Enter Gujarati headline..."}
                value={headlineGu}
                onChange={(e) => setHeadlineGu(e.target.value)}
                className="w-full px-3 py-2.5 text-base font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900"
              />
            </div>

            {/* Gujarati Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isGu ? "સમાચાર સારાંશ (Summary / Teaser) *" : "Gujarati Summary *"}
              </label>
              <textarea
                rows={3}
                placeholder={isGu ? "સમાચારનો સંક્ષિપ્ત સારાંશ લખો..." : "Enter summary..."}
                value={summaryGu}
                onChange={(e) => setSummaryGu(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900"
              />
            </div>

            {/* Gujarati Article Body */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isGu ? "સંપૂર્ણ સમાચાર વિષયવસ્તુ (Complete Article Body) *" : "Gujarati Article Body *"}
              </label>
              <textarea
                rows={12}
                placeholder={isGu ? "અહીં સંપૂર્ણ સમાચાર પેરાગ્રાફ લખો..." : "Enter full article paragraphs..."}
                value={contentHtmlGu}
                onChange={(e) => setContentHtmlGu(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900 font-serif leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isGu
                  ? "પેરાગ્રાફ વચ્ચે એક ખાલી લાઈન છોડો. અંગ્રેજી અનુવાદમાં દરેક પેરાગ્રાફ સુરક્ષિત રહેશે."
                  : "Separate paragraphs with a blank line. Paragraphs are preserved during translation."}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ENGLISH TRANSLATION (AUTO & EDITABLE) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-sm tracking-wide">
                {isGu ? "અંગ્રેજી અનુવાદ (English Translation)" : "English Translation"}
              </h2>
              {/* Status Badge */}
              {translating ? (
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{isGu ? "પ્રક્રિયા ચાલુ..." : "Processing..."}</span>
                </span>
              ) : translationStatus === "COMPLETED" ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isGu ? "પૂર્ણ" : "Completed"}</span>
                </span>
              ) : translationStatus === "NEEDS_ATTENTION" ? (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{isGu ? "ધ્યાન આપો" : "Needs Attention"}</span>
                </span>
              ) : (
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-medium">
                  {isGu ? "બાકી" : "Pending"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isManuallyEdited && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-medium">
                  {isGu ? "સંપાદિત" : "Manually Edited"}
                </span>
              )}
              <button
                type="button"
                disabled={translating}
                onClick={handleTriggerTranslation}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${translating ? "animate-spin" : ""}`} />
                <span>{translating ? (isGu ? "અનુવાદ થાય છે..." : "Translating...") : isGu ? "ફરી અનુવાદ કરો" : "Re-translate"}</span>
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 flex-1">
            {/* Translation Status & Quality Alerts */}
            {translationStatus === "OUTDATED" && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">
                      {isGu ? "ગુજરાતી લખાણમાં ફેરફાર થયો છે" : "Source Gujarati Content Changed"}
                    </p>
                    <p className="mt-0.5 text-amber-700">
                      {isGu
                        ? "આ અંગ્રેજી અનુવાદ જૂના ગુજરાતી લખાણ પર આધારિત છે."
                        : "This English version is based on an older Gujarati draft."}
                    </p>
                  </div>
                </div>
                {previousEn && (
                  <button
                    type="button"
                    onClick={() => setShowDiffModal(true)}
                    className="px-2 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded font-medium text-[11px] shrink-0"
                  >
                    {isGu ? "તફાવત સરખાવો" : "Compare Versions"}
                  </button>
                )}
              </div>
            )}

            {qualityWarnings.length > 0 && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isGu ? "ગુણવત્તા અને સંવેદનશીલ ચેતવણીઓ:" : "Automated Quality & Sensitivity Alerts:"}</span>
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-800 text-[11px]">
                  {qualityWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* English Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isGu ? "અંગ્રેજી શીર્ષક (English Headline)" : "English Headline"}
              </label>
              <input
                type="text"
                placeholder={isGu ? "અંગ્રેજી શીર્ષક..." : "Enter or review English headline..."}
                value={headlineEn}
                onChange={(e) => {
                  setHeadlineEn(e.target.value);
                  setIsManuallyEdited(true);
                }}
                className="w-full px-3 py-2.5 text-base font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900"
              />
            </div>

            {/* English Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isGu ? "અંગ્રેજી સારાંશ (English Summary)" : "English Summary"}
              </label>
              <textarea
                rows={3}
                placeholder={isGu ? "અંગ્રેજી સારાંશ..." : "Enter or review English summary..."}
                value={summaryEn}
                onChange={(e) => {
                  setSummaryEn(e.target.value);
                  setIsManuallyEdited(true);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900"
              />
            </div>

            {/* English Article Body */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isGu ? "અંગ્રેજી વિષયવસ્તુ (English Article Content)" : "English Article Body"}
              </label>
              <textarea
                rows={12}
                placeholder={isGu ? "અંગ્રેજી લેખ વિષયવસ્તુ..." : "Enter or review English article content..."}
                value={contentHtmlEn}
                onChange={(e) => {
                  setContentHtmlEn(e.target.value);
                  setIsManuallyEdited(true);
                }}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 font-serif leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                {isGu
                  ? "તમે કોઈપણ અંગ્રેજી વાક્ય સીધું સંપાદિત કરી શકો છો. સાચવતાની સાથે ફેરફારો સુરક્ષિત રહેશે."
                  : "You can edit any English text directly. Manual edits are preserved upon save."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {isGu ? "મીડિયા લાઇબ્રેરીમાંથી છબી પસંદ કરો" : "Select Image from Media Library"}
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {mediaLoading ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#016BB7]" />
                  <span>Loading images...</span>
                </div>
              ) : mediaAssets.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p>No images uploaded yet.</p>
                  <Link
                    href={`/${lang}/admin/media`}
                    target="_blank"
                    className="mt-2 text-xs text-[#016BB7] underline inline-block"
                  >
                    Upload to Media Library
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setFeaturedImageUrl(asset.publicUrl);
                        if (asset.captionGu) setImageCaptionGu(asset.captionGu);
                        if (asset.captionEn) setImageCaptionEn(asset.captionEn);
                        setShowMediaPicker(false);
                      }}
                      className="group cursor-pointer rounded-lg border border-slate-200 hover:border-[#016BB7] overflow-hidden relative aspect-video bg-slate-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.publicUrl} alt={asset.filename} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        Select
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Compare Previous Version Modal */}
      {showDiffModal && previousEn && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {isGu ? "અગાઉના અને વર્તમાન અંગ્રેજી અનુવાદની સરખામણી" : "Compare Previous vs Current English Translation"}
              </h3>
              <button type="button" onClick={() => setShowDiffModal(false)} className="p-1 text-slate-500">
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="font-bold text-slate-600 mb-1">Previous English Translation:</p>
                  <p className="font-semibold text-slate-900">{previousEn.headline || "N/A"}</p>
                  <p className="text-slate-600 mt-2">{previousEn.summary || "N/A"}</p>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="font-bold text-emerald-800 mb-1">Current English Translation:</p>
                  <p className="font-semibold text-emerald-950">{headlineEn}</p>
                  <p className="text-emerald-900 mt-2">{summaryEn}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Article Preview Modal — Realistic Newspaper View */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header with Language Toggle */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-sm font-serif">
                  {isGu ? "સમાચાર પૂર્વાવલોકન" : "Article Preview"}
                </h3>
                {/* Language Switcher Pill */}
                <div className="inline-flex rounded-lg bg-slate-200 p-0.5 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewLang("gu")}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      previewLang === "gu"
                        ? "bg-white text-[#016BB7] shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ગુજરાતી (મૂળ)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLang("en")}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      previewLang === "en"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    English (Translation)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  {previewLang === "gu" ? "Authoritative Source" : "Bilingual Edition"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Close Preview"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Article Content: Mimics Public Website Layout */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Category, Publication & Priority Badges */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                <span className="px-2.5 py-0.5 rounded-sm bg-[#016BB7] text-white text-xs font-bold uppercase tracking-wider">
                  {categories.find((c) => c.id === categoryId)?.nameGu || "રાષ્ટ્રીય"}
                </span>
                <span className="px-2.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-xs font-semibold">
                  {publicationId === "pub-janmabhoomi" ? "Janmabhoomi (જન્મભૂમિ)" : "Janmabhoomi Pravasi (પ્રવાસી)"}
                </span>
                {isLeadStory && (
                  <span className="px-2 py-0.5 rounded-sm bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                    ★ LEAD STORY
                  </span>
                )}
                {isBreaking && (
                  <span className="px-2 py-0.5 rounded-sm bg-rose-600 text-white text-xs font-bold">
                    ● BREAKING
                  </span>
                )}
                <span className="text-xs text-slate-400 ml-auto">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-900 leading-tight">
                {previewLang === "gu"
                  ? headlineGu || (isGu ? "શીર્ષક વગર" : "Untitled Gujarati Headline")
                  : headlineEn || "Untitled English Headline"}
              </h1>

              {/* Featured Image with Graceful Fallback */}
              {featuredImageUrl && !previewImageError ? (
                <div className="space-y-1.5">
                  <div className="relative aspect-video max-h-[440px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={featuredImageUrl}
                      alt={headlineGu || "Featured news asset"}
                      onError={() => setPreviewImageError(true)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {(imageCaptionGu || imageCaptionEn) && (
                    <p className="text-xs text-slate-500 italic pl-1">
                      {previewLang === "gu" ? imageCaptionGu || imageCaptionEn : imageCaptionEn || imageCaptionGu}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-center gap-3 text-slate-400 text-xs">
                  <ImageIcon size={20} className="text-slate-400" />
                  <span>
                    {featuredImageUrl && previewImageError
                      ? isGu
                        ? "છબી URL અમાન્ય છે અથવા લોડ થઈ શકતી નથી (કૃપા કરીને માન્ય ઇમેજ URL વાપરો)"
                        : "Featured image failed to load from provided URL (clean fallback shown)"
                      : isGu
                      ? "કોઈ મુખ્ય છબી જોડાયેલ નથી"
                      : "No featured image attached to this article"}
                  </span>
                </div>
              )}

              {/* Lead Summary Paragraph */}
              <div className="p-4 bg-blue-50/40 border-l-4 border-[#016BB7] rounded-r-xl text-base sm:text-lg font-serif text-slate-800 leading-relaxed italic">
                {previewLang === "gu"
                  ? summaryGu || (isGu ? "કોઈ સારાંશ દાખલ કરેલ નથી." : "No summary provided.")
                  : summaryEn || "No English summary provided."}
              </div>

              {/* Full Article Body */}
              <div className="space-y-4 font-serif text-base sm:text-lg text-slate-800 leading-relaxed">
                {previewLang === "gu" ? (
                  contentHtmlGu ? (
                    <div
                      className="prose max-w-none text-slate-800 space-y-4"
                      dangerouslySetInnerHTML={{ __html: contentHtmlGu }}
                    />
                  ) : (
                    <p className="text-slate-400 italic">કોઈ વિષયવસ્તુ ઉપલબ્ધ નથી.</p>
                  )
                ) : contentHtmlEn ? (
                  <div
                    className="prose max-w-none text-slate-800 space-y-4"
                    dangerouslySetInnerHTML={{ __html: contentHtmlEn }}
                  />
                ) : (
                  <p className="text-slate-400 italic">English article body not generated or translated yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revision History & Audit Trail Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isGu ? "લેખ રિવિઝન ઇતિહાસ અને ઑડિટ લૉગ" : "Article Revision History & Audit Trail"}
                </h3>
                <p className="text-xs text-slate-500">Source Version: v{sourceVersion}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {historyLoading ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#016BB7]" />
                  <span>Loading history...</span>
                </div>
              ) : articleHistory.length === 0 ? (
                <p className="p-8 text-center text-slate-400 text-xs">No audit logs recorded yet.</p>
              ) : (
                articleHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{item.action}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.timestamp).toLocaleString(isGu ? "gu-IN" : "en-GB")}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      By: <span className="font-medium text-slate-800">{item.actor}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
