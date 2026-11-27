"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import { useAdminPublication } from "@/lib/context/AdminPublicationContext";
import {
  Save,
  Send,
  Eye,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Trash2,
  Search,
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
}

interface ArticleEditorProps {
  lang: string;
  articleId?: string; // If provided, edit mode; otherwise, create mode
}

const PUBLICATIONS = [
  { id: "pub-janmabhoomi", name: "Janmabhoomi — જન્મભૂમિ (દૈનિક સાંજ)" },
  { id: "pub-pravasi", name: "Janmabhoomi Pravasi — જન્મભૂમિ પ્રવાસી (રવિવારીય)" },
  { id: "pub-purti", name: "Janmabhoomi Purti — જન્મભૂમિ પૂર્તિ" },
];

export function ArticleEditor({ lang, articleId }: ArticleEditorProps) {
  const router = useRouter();
  const isGu = lang === "gu";
  const { token } = useStaffAuth();
  const { selectedPublication: globalSelectedPub } = useAdminPublication();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  // Helper to resolve media URLs (serves via relative Next.js proxy route, fallback in onError)
  const getMediaUrl = (url: string | null | undefined): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return url.startsWith("/") ? url : `/${url}`;
  };

  // Form State
  const [publicationId, setPublicationId] = useState<string>(
    !articleId && globalSelectedPub && globalSelectedPub !== "all"
      ? globalSelectedPub
      : "pub-janmabhoomi"
  );
  const [categoryId, setCategoryId] = useState<string>("national");
  const [headlineGu, setHeadlineGu] = useState<string>("");
  const [summaryGu, setSummaryGu] = useState<string>("");
  const [contentHtmlGu, setContentHtmlGu] = useState<string>("");
  const [isBreaking, setIsBreaking] = useState<boolean>(false);
  const [isLeadStory, setIsLeadStory] = useState<boolean>(false);
  const [isSubLead, setIsSubLead] = useState<boolean>(false);
  const [isPaywalled, setIsPaywalled] = useState<boolean>(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>("");
  const [epaperPageNumber, setEpaperPageNumber] = useState<number | "">("");

  // Status & Scheduling
  const [articleStatus, setArticleStatus] = useState<string>("DRAFT");
  const [sourceVersion, setSourceVersion] = useState<number>(1);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [scheduledFor, setScheduledFor] = useState<string>("");

  // Modals & UI
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewImageError, setPreviewImageError] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [articleHistory, setArticleHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState<boolean>(articleId ? true : false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Direct Image Upload & Media Picker Modal
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState<boolean>(false);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetOption[]>([]);
  const [mediaLoading, setMediaLoading] = useState<boolean>(false);
  const [mediaSearch, setMediaSearch] = useState<string>("");

  // Load Categories on mount
  useEffect(() => {
    if (!token) return;
    const fallbackCategories: CategoryOption[] = [
      { id: "cat-national", slug: "national", nameGu: "રાષ્ટ્રીય", nameEn: "National" },
      { id: "cat-city", slug: "city", nameGu: "શહેર", nameEn: "City" },
      { id: "cat-business", slug: "business", nameGu: "વેપાર", nameEn: "Business" },
      { id: "cat-sports", slug: "sports", nameGu: "રમતગમત", nameEn: "Sports" },
      { id: "cat-entertainment", slug: "entertainment", nameGu: "મનોરંજન", nameEn: "Entertainment" },
      { id: "cat-editorial", slug: "editorial", nameGu: "સંપાદકીય", nameEn: "Editorial" },
    ];

    fetch(`${baseUrl}/api/v1/admin/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
          if (!articleId && data.data.length > 0) {
            setCategoryId(data.data[0].id);
          }
        } else {
          setCategories(fallbackCategories);
          if (!articleId) setCategoryId(fallbackCategories[0].id);
        }
      })
      .catch(() => {
        setCategories(fallbackCategories);
        if (!articleId) setCategoryId(fallbackCategories[0].id);
      });
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
        setPublicationId(art.publicationId || "pub-janmabhoomi");
        setCategoryId(art.categoryId);
        setArticleStatus(art.status);
        setSourceVersion(art.sourceVersion || 1);
        setIsBreaking(art.isBreaking);
        setIsLeadStory(art.isLeadStory);
        setIsSubLead(art.isSubLead);
        setIsPaywalled(art.isPaywalled);
        setFeaturedImageUrl(art.featuredImageUrl || "");
        setEpaperPageNumber(art.epaperPageNumber || "");
        setPublishedAt(art.publishedAt);

        if (art.gujarati) {
          setHeadlineGu(art.gujarati.headline || "");
          setSummaryGu(art.gujarati.summary || "");
          setContentHtmlGu(art.gujarati.contentHtml || "");
        }
      })
      .catch(() => {
        // Fallback demo content if offline
        setPublicationId("pub-janmabhoomi");
        setCategoryId("cat-national");
        setArticleStatus("PUBLISHED");
        setHeadlineGu("કેન્દ્ર સરકારે શરૂ કરી નવી રાષ્ટ્રીય ગ્રામીણ જળ સંરક્ષણ યોજના");
        setSummaryGu("આ યોજના અંતર્ગત ગુજરાતના ૨૦ જિલ્લાઓને પીવાનું શુદ્ધ પાણી મળશે.");
        setContentHtmlGu("<p>અમદાવાદ: કેન્દ્ર સરકારે ગ્રામીણ જળ સંરક્ષણ માટે ૧૦,૦૦૦ કરોડની નવી યોજના જાહેર કરી છે.</p>");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [articleId, baseUrl, token]);

  // Fetch Media Library Assets
  const fetchMediaLibrary = async () => {
    if (!token) return;
    setMediaLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/media?limit=40`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMediaAssets(
          json.data.map((item: any) => ({
            id: item.id,
            filename: item.originalFilename || item.filename,
            publicUrl: item.publicUrl,
          }))
        );
      }
    } catch {
      // Ignore
    } finally {
      setMediaLoading(false);
    }
  };

  const openMediaPicker = () => {
    setShowMediaPicker(true);
    fetchMediaLibrary();
  };

  // Direct Image File Upload Handler
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setImageUploadError(isGu ? "માત્ર JPEG, PNG અથવા WebP ફાઇલ જ મંજૂર છે." : "Only JPEG, PNG, or WebP images are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageUploadError(isGu ? "છબીનું કદ ૧૦ MB કરતાં ઓછું હોવું જોઈએ." : "Image file size must be under 10 MB.");
      return;
    }

    setImageUploading(true);
    setImageUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${baseUrl}/api/v1/media/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Image upload failed.");
      }

      setFeaturedImageUrl(json.data.publicUrl);
      setSuccessMsg(isGu ? "છબી સફળતાપૂર્વક અપલોડ થઈ." : "Image uploaded successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setImageUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = "";
      }
    }
  };

  // Open Revision History Modal
  const openHistoryModal = async () => {
    if (!articleId || !token) return;
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/articles/${articleId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setArticleHistory(json.data);
      }
    } catch {
      setArticleHistory([
        {
          id: "hist-1",
          action: "Article Created (Draft)",
          actor: "Admin Desk",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Save / Publish Handler
  const handleSave = async (publishImmediately: boolean = false, redirectToArticles: boolean = true) => {
    setError(null);
    setSuccessMsg(null);

    // Validation
    if (!headlineGu.trim()) {
      setError(isGu ? "ગુજરાતી શીર્ષક આવશ્યક છે." : "Gujarati headline is required.");
      return;
    }
    if (!summaryGu.trim()) {
      setError(isGu ? "ગુજરાતી સારાંશ આવશ્યક છે." : "Gujarati summary is required.");
      return;
    }
    if (!contentHtmlGu.trim()) {
      setError(isGu ? "સમાચાર વિષયવસ્તુ આવશ્યક છે." : "Article content body is required.");
      return;
    }

    setSaving(true);
    try {
      const tags = publicationId === "pub-purti" ? ["Purti", "Janmabhoomi Purti"] : [];

      if (!articleId) {
        // Create Mode
        const payload = {
          publicationId,
          categoryId,
          headlineGu: headlineGu.trim(),
          summaryGu: summaryGu.trim(),
          contentHtmlGu: contentHtmlGu.trim(),
          isBreaking,
          isLeadStory,
          isSubLead,
          isPaywalled,
          featuredImageUrl: featuredImageUrl.trim() || undefined,
          epaperPageNumber: epaperPageNumber ? Number(epaperPageNumber) : undefined,
          publishImmediately,
          tags,
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
          throw new Error(json.error?.message || json.errors?.[0]?.message || "Failed to create article.");
        }

        setSuccessMsg(
          publishImmediately
            ? isGu ? "સમાચાર લેખ સફળતાપૂર્વક પ્રકાશિત થયો!" : "News article published successfully!"
            : isGu ? "ડ્રાફ્ટ સફળતાપૂર્વક સાચવવામાં આવ્યો!" : "Article draft saved successfully!"
        );

        if (redirectToArticles) {
          setTimeout(() => router.push(`/${lang}/admin/articles`), 800);
        } else {
          setTimeout(() => router.push(`/${lang}/admin/articles/${json.data.id}`), 800);
        }
      } else {
        // Edit Mode: Update Article
        const payload = {
          publicationId,
          categoryId,
          headlineGu: headlineGu.trim(),
          summaryGu: summaryGu.trim(),
          contentHtmlGu: contentHtmlGu.trim(),
          isBreaking,
          isLeadStory,
          isSubLead,
          isPaywalled,
          featuredImageUrl: featuredImageUrl.trim() || null,
          epaperPageNumber: epaperPageNumber ? Number(epaperPageNumber) : null,
          tags,
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
          throw new Error(json.error?.message || json.errors?.[0]?.message || "Failed to update article.");
        }

        // If publish requested on existing draft
        if (publishImmediately && articleStatus !== "PUBLISHED") {
          await fetch(`${baseUrl}/api/v1/admin/articles/${articleId}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: "PUBLISHED" }),
          });
          setArticleStatus("PUBLISHED");
        }

        setSuccessMsg(
          publishImmediately
            ? isGu ? "લેખ પ્રકાશિત થયો!" : "Article published successfully!"
            : isGu ? "સુધારા સાચવવામાં આવ્યા!" : "Changes saved successfully!"
        );

        if (redirectToArticles) {
          setTimeout(() => router.push(`/${lang}/admin/articles`), 800);
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // Schedule Publication
  const handleSchedulePublication = async () => {
    if (!articleId || !scheduledFor) return;
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
        throw new Error(json.error?.message || "Failed to schedule article.");
      }
      setArticleStatus("SCHEDULED");
      setSuccessMsg(isGu ? "લેખ શેડ્યૂલ કરવામાં આવ્યો!" : "Article scheduled successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-[#016BB7] mb-3" />
        <p className="text-sm font-semibold">{isGu ? "સમાચાર લેખ લોડ થઈ રહ્યો છે..." : "Loading news article..."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${lang}/admin/articles`)}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors"
            title={isGu ? "પાછા જાઓ" : "Go Back"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">
                {articleId
                  ? isGu ? "સમાચાર લેખ સંપાદન" : "Edit News Article"
                  : isGu ? "નવો સમાચાર લેખ બનાવો" : "Create News Article"}
              </h1>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  articleStatus === "PUBLISHED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : articleStatus === "SCHEDULED"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {articleStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isGu
                ? "જન્મભૂમિ, પ્રવાસી અને પૂર્તિ માટે એકીકૃત ગુજરાતી પબ્લિશિંગ ડેસ્ક"
                : "Newsroom Editorial Desk • Clean Gujarati Publishing Desk"}
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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{saving ? (isGu ? "સાચવી રહ્યા છે..." : "Saving...") : isGu ? "ડ્રાફ્ટ સાચવો" : "Save Draft"}</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(true, true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
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

      {/* Publication, Category & Priority Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Publication Selector: All 3 Options */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isGu ? "પ્રકાશન (સમાચારપત્ર / પૂર્તિ) *" : "Publication *"}
            </label>
            <select
              value={publicationId}
              onChange={(e) => setPublicationId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900 font-medium"
            >
              {PUBLICATIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector: Clean display without duplicate slug */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isGu ? "સમાચાર કેટેગરી *" : "Category *"}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900 font-medium"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isGu ? c.nameGu : c.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* E-Paper Page # */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
        </div>

        {/* Priority & Scheduling Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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

            <label
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                isPaywalled
                  ? "bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <input
                type="checkbox"
                checked={isPaywalled}
                onChange={(e) => setIsPaywalled(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span>{isGu ? "🔒 પ્રીમિયમ સબ્સ્ક્રાઇબર (Paywalled)" : "🔒 Subscriber Only"}</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">
              {isGu ? "શેડ્યૂલ:" : "Schedule:"}
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
            />
            {articleId && articleStatus !== "PUBLISHED" && (
              <button
                type="button"
                onClick={handleSchedulePublication}
                disabled={saving || !scheduledFor}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 shrink-0 cursor-pointer"
              >
                {isGu ? "શેડ્યૂલ" : "Schedule"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header News Image Panel (Clean image upload & picker, captions removed) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#016BB7]" />
              <span>{isGu ? "મુખ્ય સમાચાર છબી (Header Image)" : "Header News Image"}</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {isGu
                ? "લેખ માટે તસવીર અપલોડ કરો અથવા મીડિયા લાઇબ્રેરીમાંથી પસંદ કરો."
                : "Upload a press photograph (JPEG, PNG, WebP) or choose from the Media Library."}
            </p>
          </div>

          {featuredImageUrl && (
            <button
              type="button"
              onClick={() => setFeaturedImageUrl("")}
              className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isGu ? "છબી દૂર કરો" : "Remove Image"}</span>
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={imageFileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageFileUpload}
        />

        {imageUploadError && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{imageUploadError}</span>
          </div>
        )}

        {!featuredImageUrl ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
            {/* Option A: Upload New Image */}
            <div
              onClick={() => imageFileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#016BB7] hover:bg-blue-50/30 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#016BB7] group-hover:bg-[#016BB7] group-hover:text-white flex items-center justify-center transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-[#016BB7]">
                  {imageUploading
                    ? isGu ? "અપલોડ થઈ રહ્યું છે..." : "Uploading image..."
                    : isGu ? "નવી છબી અપલોડ કરો (Upload File)" : "Upload New Image"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  JPEG, PNG, WebP (Max 10 MB)
                </p>
              </div>
            </div>

            {/* Option B: Choose from Media Library */}
            <div
              onClick={openMediaPicker}
              className="border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50/50 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white flex items-center justify-center transition-colors">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-[#016BB7]">
                  {isGu ? "મીડિયા લાઇબ્રેરીમાંથી પસંદ કરો" : "Select from Media Library"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {isGu ? "પહેલેથી અપલોડ કરેલી પ્રેસ તસવીરો બ્રાઉઝ કરો" : "Browse existing press photo archive"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Image Preview */
          <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="w-full sm:w-56 h-36 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative bg-slate-200 shadow-2xs group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getMediaUrl(featuredImageUrl)}
                alt="Featured News Photograph"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (featuredImageUrl && !target.src.includes("127.0.0.1:4000") && !target.src.includes("localhost:4000")) {
                    target.src = `http://127.0.0.1:4000${featuredImageUrl.startsWith("/") ? "" : "/"}${featuredImageUrl}`;
                  }
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-white text-slate-900 text-xs font-bold shadow hover:bg-slate-100 cursor-pointer"
                >
                  {isGu ? "બદલો" : "Replace"}
                </button>
                <button
                  type="button"
                  onClick={openMediaPicker}
                  className="px-2.5 py-1 rounded bg-white text-slate-900 text-xs font-bold shadow hover:bg-slate-100 cursor-pointer"
                >
                  {isGu ? "લાઇબ્રેરી" : "Library"}
                </button>
              </div>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ {isGu ? "છબી સેટ કરેલ છે" : "Active Header Image"}
                </span>
                <span className="text-[11px] text-slate-400 font-mono truncate max-w-sm">
                  {featuredImageUrl}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isGu
                  ? "આ તસવીર અખબારના હોમપેજ, કેટેગરી પેજ અને લેખના મુખ્ય મથાળે દર્શાવવામાં આવશે."
                  : "This image will be displayed on the homepage hero, category feed, and at the top of the article."}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {isGu ? "નવી છબી અપલોડ કરો" : "Change Image"}
                </button>
                <button
                  type="button"
                  onClick={openMediaPicker}
                  className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  {isGu ? "લાઇબ્રેરીમાંથી પસંદ કરો" : "Choose from Library"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SINGLE-PANE CLEAN GUJARATI EDITORIAL WORKSPACE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 md:p-6 space-y-5">
          {/* Gujarati Headline */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {isGu ? "ગુજરાતી સમાચાર શીર્ષક (Headline) *" : "Gujarati Headline *"}
            </label>
            <input
              type="text"
              placeholder={isGu ? "અહીં મુખ્ય આકર્ષક શીર્ષક લખો..." : "Enter headline in Gujarati..."}
              value={headlineGu}
              onChange={(e) => setHeadlineGu(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base sm:text-lg font-bold border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900"
            />
          </div>

          {/* Gujarati Summary */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {isGu ? "સમાચાર સંક્ષિપ્ત સારાંશ (Summary / Teaser) *" : "Gujarati Summary *"}
            </label>
            <textarea
              rows={3}
              placeholder={isGu ? "સમાચારનો સંક્ષિપ્ત સારાંશ લખો..." : "Enter lead summary..."}
              value={summaryGu}
              onChange={(e) => setSummaryGu(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900 leading-relaxed"
            />
          </div>

          {/* Gujarati Complete Article Body */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              {isGu ? "સંપૂર્ણ સમાચાર વિગત (Complete Article Body) *" : "Gujarati Article Body *"}
            </label>
            <textarea
              rows={14}
              placeholder={isGu ? "અહીં સંપૂર્ણ સમાચાર પેરાગ્રાફ લખો (દરેક પેરાગ્રાફ વચ્ચે એક ખાલી લાઈન છોડો)..." : "Enter complete article content..."}
              value={contentHtmlGu}
              onChange={(e) => setContentHtmlGu(e.target.value)}
              className="w-full px-3.5 py-3 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900 font-serif leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {isGu
                ? "પેરાગ્રાફ વચ્ચે એક ખાલી લાઈન છોડો. વાચકો વેબસાઇટ હેડરમાં આપેલા અંગ્રેજી સ્વિચ બટનથી આ લેખ અંગ્રેજીમાં પણ સરળતાથી વાંચી શકશે."
                : "Separate paragraphs with a blank line. Readers can switch to English translation anytime via the public header button."}
            </p>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isGu ? "મીડિયા લાઇબ્રેરીમાંથી છબી પસંદ કરો" : "Select Image from Media Library"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isGu ? "લેખમાં જોડવા માટે છબી પર ક્લિક કરો" : "Click any photo to attach it as the header image"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={isGu ? "ફાઇલનામ શોધો..." : "Search media filename..."}
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowMediaPicker(false);
                  imageFileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#016BB7] text-white text-xs font-semibold hover:bg-[#015896] transition-colors shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isGu ? "નવી છબી અપલોડ" : "Upload New"}</span>
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {mediaLoading ? (
                <div className="p-12 text-center text-slate-500">
                  <Clock className="w-6 h-6 animate-spin mx-auto mb-2 text-[#016BB7]" />
                  <span>Loading images...</span>
                </div>
              ) : mediaAssets.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>{isGu ? "કોઈ છબીઓ ઉપલબ્ધ નથી." : "No images found in library."}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaAssets
                    .filter((asset) => {
                      if (!mediaSearch.trim()) return true;
                      const q = mediaSearch.toLowerCase();
                      return asset.filename.toLowerCase().includes(q);
                    })
                    .map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => {
                          setFeaturedImageUrl(asset.publicUrl);
                          setShowMediaPicker(false);
                        }}
                        className="group cursor-pointer rounded-lg border border-slate-200 hover:border-[#016BB7] overflow-hidden relative aspect-video bg-slate-100 flex flex-col justify-end transition-all shadow-2xs hover:shadow-xs"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getMediaUrl(asset.publicUrl)}
                          alt={asset.filename}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes("127.0.0.1:4000") && !target.src.includes("localhost:4000")) {
                              target.src = `http://127.0.0.1:4000${asset.publicUrl.startsWith("/") ? "" : "/"}${asset.publicUrl}`;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-white">
                          <p className="text-[10px] font-semibold truncate">{asset.filename}</p>
                          <span className="text-[9px] text-blue-200 font-bold uppercase mt-0.5">Click to Select</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Authentic Newspaper Article Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="font-bold text-sm text-slate-800">
                  {isGu ? "સમાચાર પૂર્વાવલોકન (Newspaper Preview)" : "Article Public Preview"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close Preview"
              >
                ✕
              </button>
            </div>

            {/* Article Content: Public Website Layout */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Category, Publication & Priority Badges */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
                <span className="px-2.5 py-0.5 rounded-sm bg-[#016BB7] text-white text-xs font-bold uppercase tracking-wider">
                  {categories.find((c) => c.id === categoryId)?.nameGu || "સમાચાર"}
                </span>
                <span className="px-2.5 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-xs font-semibold">
                  {PUBLICATIONS.find((p) => p.id === publicationId)?.name || publicationId}
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
                {headlineGu || (isGu ? "શીર્ષક વગર" : "Untitled Headline")}
              </h1>

              {/* Featured Image */}
              {featuredImageUrl ? (
                <div className="relative aspect-video max-h-[440px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getMediaUrl(featuredImageUrl)}
                    alt={headlineGu || "Featured news asset"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("127.0.0.1:4000") && !target.src.includes("localhost:4000")) {
                        target.src = `http://127.0.0.1:4000${featuredImageUrl.startsWith("/") ? "" : "/"}${featuredImageUrl}`;
                      }
                    }}
                  />
                </div>
              ) : null}

              {/* Lead Summary */}
              <div className="p-4 bg-blue-50/40 border-l-4 border-[#016BB7] rounded-r-xl text-base sm:text-lg font-serif text-slate-800 leading-relaxed italic">
                {summaryGu || (isGu ? "કોઈ સારાંશ દાખલ કરેલ નથી." : "No summary provided.")}
              </div>

              {/* Full Article Body */}
              <div className="space-y-4 font-serif text-base sm:text-lg text-slate-800 leading-relaxed">
                {contentHtmlGu ? (
                  contentHtmlGu
                    .split(/\n\s*\n/)
                    .map((para, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {para.replace(/<[^>]*>/g, "")}
                      </p>
                    ))
                ) : (
                  <p className="text-slate-400 italic">
                    {isGu ? "કોઈ સામગ્રી દાખલ કરેલ નથી." : "No body text entered yet."}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-slate-300 bg-white rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                {isGu ? "બંધ કરો" : "Close"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowPreviewModal(false);
                  handleSave(true, true);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-colors cursor-pointer"
              >
                {isGu ? "હવે પ્રકાશિત કરો" : "Publish Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision History Modal */}
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
                className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {historyLoading ? (
                <div className="p-8 text-center text-slate-500">
                  <Clock className="w-5 h-5 animate-spin mx-auto mb-2 text-[#016BB7]" />
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
