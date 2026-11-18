"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  X,
  Calendar,
  Layers,
} from "lucide-react";

interface MediaAsset {
  id: string;
  originalFilename?: string;
  filename: string;
  storageKey: string;
  publicUrl: string;
  mimeType: string;
  fileSizeBytes: number;
  captionEn: string | null;
  captionGu: string | null;
  altTextEn: string | null;
  altTextGu: string | null;
  photographer: string | null;
  tags?: string[];
  uploadedBy?: string;
  createdAt: string;
}

type MediaTab = "all" | "events-images" | "events-videos";

export default function MediaAdminPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";
  const { token, isAuthenticated, isLoading: authLoading } = useStaffAuth();

  const [activeTab, setActiveTab] = useState<MediaTab>("all");
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [captionGu, setCaptionGu] = useState("");
  const [photographer, setPhotographer] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  const getMediaUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const fetchMedia = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const query = new URLSearchParams({ limit: "60" });
    if (search.trim()) query.append("search", search.trim());

    try {
      const res = await fetch(`${baseUrl}/api/v1/media?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load media assets.");
      }
      setAssets(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load media assets.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token, search]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${lang}/admin/login`);
    } else if (token) {
      fetchMedia();
    }
  }, [authLoading, isAuthenticated, token, fetchMedia, lang, router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !token) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);

    // Build tags depending on tab and event context
    const tags: string[] = [];
    if (activeTab === "events-images" || uploadFile.type.startsWith("image/")) {
      if (activeTab === "events-images" || eventTitle) {
        tags.push("event", "event-image");
      }
    }
    if (activeTab === "events-videos" || uploadFile.type.startsWith("video/")) {
      tags.push("event", "event-video");
    }
    if (eventTitle.trim()) {
      tags.push(`event:${eventTitle.trim()}`);
    }
    if (eventDate) {
      tags.push(`date:${eventDate}`);
    }

    if (captionGu.trim() || eventTitle.trim()) {
      formData.append("captionGu", captionGu.trim() || eventTitle.trim());
    }
    if (photographer.trim()) {
      formData.append("photographer", photographer.trim());
    }
    if (tags.length > 0) {
      formData.append("tags", JSON.stringify(tags));
    }

    try {
      const res = await fetch(`${baseUrl}/api/v1/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Upload failed.");
      }

      setUploadModalOpen(false);
      setUploadFile(null);
      setEventTitle("");
      setEventDate("");
      setCaptionGu("");
      setPhotographer("");
      fetchMedia();
    } catch (err: any) {
      alert(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isGu ? "શું તમે ખરેખર આ મીડિયા ફાઇલ કાઢી નાખવા માંગો છો?" : "Delete this media asset permanently?")) {
      return;
    }
    if (!token) return;

    try {
      const res = await fetch(`${baseUrl}/api/v1/media/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to delete.");
      }
      fetchMedia();
    } catch (err: any) {
      alert(err.message || "Delete error.");
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    const full = getMediaUrl(url);
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter assets based on activeTab
  const filteredAssets = assets.filter((asset) => {
    const isVideo = asset.mimeType?.startsWith("video/") || asset.tags?.includes("event-video");
    const isEventImage =
      ((asset.tags && asset.tags.some((t) => t.toLowerCase().includes("event"))) ||
        (asset.captionGu?.toLowerCase().includes("event") ?? false) ||
        (asset.captionGu?.toLowerCase().includes("janmabhoomi") ?? false) ||
        (asset.filename?.toLowerCase().includes("event") ?? false)) &&
      !isVideo;

    if (activeTab === "events-images") {
      return isEventImage;
    }
    if (activeTab === "events-videos") {
      return isVideo;
    }
    return true; // All Media
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isGu ? "મીડિયા લાઇબ્રેરી અને ઇવેન્ટ્સ" : "Media Library & Events"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isGu
              ? "અખબાર, લેખો અને જન્મભૂમિ ઇવેન્ટ્સ માટે તસવીરો અને વિડીયોનું સંચાલન કરો."
              : "Upload and manage newspaper photography, event photos, and event video archives."}
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#016BB7] hover:bg-[#015896] text-white font-medium text-sm shadow-sm transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>
            {activeTab === "events-videos"
              ? isGu ? "ઇવેન્ટ વિડીયો અપલોડ કરો" : "Upload Event Video"
              : activeTab === "events-images"
              ? isGu ? "ઇવેન્ટ તસવીર અપલોડ કરો" : "Upload Event Image"
              : isGu ? "મીડિયા અપલોડ કરો" : "Upload Media"}
          </span>
        </button>
      </div>

      {/* Subsections / Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "all"
                ? "border-[#016BB7] text-[#016BB7]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isGu ? "તમામ મીડિયા (All Media)" : "All Media"}</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {assets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("events-images")}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "events-images"
                ? "border-[#016BB7] text-[#016BB7]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isGu ? "ઇવેન્ટ તસવીરો (Event Images)" : "Event Images"}</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[#016BB7] font-bold">
              {assets.filter((a) => !a.mimeType?.startsWith("video/") && ((a.tags && a.tags.some((t) => t.toLowerCase().includes("event"))) || (a.captionGu?.toLowerCase().includes("event") ?? false) || (a.captionGu?.toLowerCase().includes("janmabhoomi") ?? false))).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("events-videos")}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === "events-videos"
                ? "border-[#016BB7] text-[#016BB7]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <VideoIcon className="w-4 h-4" />
            <span>{isGu ? "ઇવેન્ટ વિડીયો (Event Videos)" : "Event Videos"}</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold">
              {assets.filter((a) => a.mimeType?.startsWith("video/") || a.tags?.includes("event-video")).length}
            </span>
          </button>
        </nav>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={
              isGu
                ? "ફાઇલનામ, ઇવેન્ટનું નામ અથવા વિગત શોધો..."
                : "Search filename, event name, or details..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#016BB7] bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#016BB7]" />
          <span>{isGu ? "મીડિયા લોડ થઈ રહ્યું છે..." : "Loading media gallery..."}</span>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          {activeTab === "events-videos" ? (
            <VideoIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          ) : (
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          )}
          <p className="font-semibold text-slate-700 text-base">
            {activeTab === "events-videos"
              ? isGu ? "કોઈ ઇવેન્ટ વિડીયો ઉપલબ્ધ નથી" : "No event videos found"
              : activeTab === "events-images"
              ? isGu ? "કોઈ ઇવેન્ટ તસવીરો ઉપલબ્ધ નથી" : "No event images found"
              : isGu ? "કોઈ મીડિયા મળ્યું નથી" : "No media assets found"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isGu
              ? "નવી ફાઇલ અપલોડ કરવા માટે ઉપર આપેલા બટન પર ક્લિક કરો."
              : "Click the upload button above to add new media to this section."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const isVideo = asset.mimeType?.startsWith("video/") || asset.tags?.includes("event-video");
            const isEvent =
              asset.tags?.includes("event") ||
              asset.tags?.some((t) => t.toLowerCase().includes("event")) ||
              (asset.captionGu?.toLowerCase().includes("event") ?? false) ||
              (asset.captionGu?.toLowerCase().includes("janmabhoomi") ?? false);
            const filename = asset.originalFilename || asset.filename;

            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
              >
                <div className="aspect-video relative bg-slate-900 overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <video
                      src={getMediaUrl(asset.publicUrl)}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={getMediaUrl(asset.publicUrl)}
                      alt={asset.captionGu || filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("127.0.0.1:4000") && !target.src.includes("localhost:4000")) {
                          target.src = `http://127.0.0.1:4000${asset.publicUrl.startsWith("/") ? "" : "/"}${asset.publicUrl}`;
                        }
                      }}
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    {isVideo && (
                      <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                        <VideoIcon className="w-3 h-3" />
                        Video
                      </span>
                    )}
                    {isEvent && (
                      <span className="px-2 py-0.5 rounded bg-[#016BB7] text-white text-[10px] font-bold tracking-wider flex items-center gap-1 shadow">
                        <Calendar className="w-3 h-3" />
                        Event
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-semibold text-xs text-slate-900 truncate" title={filename}>
                      {filename}
                    </p>
                    {asset.captionGu && (
                      <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-medium">{asset.captionGu}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {(asset.fileSizeBytes / (1024 * 1024) > 1
                        ? (asset.fileSizeBytes / (1024 * 1024)).toFixed(1) + " MB"
                        : (asset.fileSizeBytes / 1024).toFixed(0) + " KB")}{" "}
                      • {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-2.5">
                    <button
                      onClick={() => handleCopyUrl(asset.publicUrl, asset.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-[#016BB7] font-medium cursor-pointer"
                      title="Copy Media URL"
                    >
                      {copiedId === asset.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {activeTab === "events-videos"
                ? isGu ? "ઇવેન્ટ વિડીયો અપલોડ કરો" : "Upload Event Video"
                : activeTab === "events-images"
                ? isGu ? "ઇવેન્ટ તસવીર અપલોડ કરો" : "Upload Event Photograph"
                : isGu ? "નવી મીડિયા ફાઇલ અપલોડ કરો" : "Upload Media Asset"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {activeTab === "events-videos"
                ? "Allowed video formats: MP4, WebM, MOV (Max 50MB)"
                : "Allowed formats: JPEG, PNG, WebP (Max 10MB)"}
            </p>

            <form onSubmit={handleUpload} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {activeTab === "events-videos"
                    ? isGu ? "વિડીયો ફાઇલ પસંદ કરો *" : "Select Video File *"
                    : isGu ? "છબી ફાઇલ પસંદ કરો *" : "Select Image File *"}
                </label>
                <input
                  type="file"
                  accept={
                    activeTab === "events-videos"
                      ? "video/mp4,video/webm,video/quicktime"
                      : "image/jpeg,image/png,image/webp"
                  }
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#016BB7] hover:file:bg-blue-100 border border-slate-300 rounded-lg p-1.5 cursor-pointer"
                />
              </div>

              {(activeTab === "events-images" || activeTab === "events-videos") && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isGu ? "ઇવેન્ટનું નામ (Event Title)" : "Event Title"}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Janmabhoomi Annual Literary Festival"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {isGu ? "ઇવેન્ટ તારીખ (Event Date)" : "Event Date"}
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isGu ? "વિગત / કેપ્શન (Description)" : "Caption / Description"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Press conference at Mumbai press club"
                  value={captionGu}
                  onChange={(e) => setCaptionGu(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isGu ? "ફોટોગ્રાફર / સ્રોત (Credit)" : "Photographer / Source Credit"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Janmabhoomi Media Team"
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {isGu ? "રદ કરો" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 text-xs font-semibold bg-[#016BB7] hover:bg-[#015896] text-white rounded-lg disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{isGu ? "અપલોડ થઈ રહ્યું છે..." : "Uploading..."}</span>
                    </>
                  ) : (
                    <span>{isGu ? "અપલોડ કરો" : "Upload"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
