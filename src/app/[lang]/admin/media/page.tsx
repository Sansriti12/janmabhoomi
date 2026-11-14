"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Edit,
  X,
  Plus,
} from "lucide-react";

interface MediaAsset {
  id: string;
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
  uploadedBy: string;
  createdAt: string;
}

export default function MediaAdminPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";
  const { token, isAuthenticated, isLoading: authLoading } = useStaffAuth();

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [captionGu, setCaptionGu] = useState("");
  const [captionEn, setCaptionEn] = useState("");
  const [altTextGu, setAltTextGu] = useState("");
  const [altTextEn, setAltTextEn] = useState("");
  const [photographer, setPhotographer] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  const fetchMedia = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    const query = new URLSearchParams({ limit: "40" });
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
    if (captionGu) formData.append("captionGu", captionGu);
    if (captionEn) formData.append("captionEn", captionEn);
    if (altTextGu) formData.append("altTextGu", altTextGu);
    if (altTextEn) formData.append("altTextEn", altTextEn);
    if (photographer) formData.append("photographer", photographer);

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
      setCaptionGu("");
      setCaptionEn("");
      setAltTextGu("");
      setAltTextEn("");
      setPhotographer("");
      fetchMedia();
    } catch (err: any) {
      alert(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isGu ? "શું તમે ખરેખર આ છબી કાઢી નાખવા માંગો છો?" : "Delete this media asset permanently?")) {
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
    const full = url.startsWith("http") ? url : `${baseUrl}${url}`;
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isGu ? "મીડિયા લાઇબ્રેરી" : "Media Library"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isGu
              ? "અખબાર અને લેખો માટે છબીઓ અપલોડ કરો, કેપ્શન મેનેજ કરો અને ઉપયોગ કરો."
              : "Upload and manage newspaper photography, illustrations, and featured assets."}
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#016BB7] hover:bg-[#015896] text-white font-medium text-sm shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>{isGu ? "છબી અપલોડ કરો" : "Upload Image"}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={isGu ? "ફાઇલનામ, કેપ્શન અથવા ફોટોગ્રાફર શોધો..." : "Search filename, caption, or photographer..."}
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
      ) : assets.length === 0 ? (
        <div className="p-16 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-slate-700 text-base">
            {isGu ? "કોઈ છબીઓ મળી નથી" : "No media assets found"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isGu ? "શરૂઆત કરવા માટે 'છબી અપલોડ કરો' પર ક્લિક કરો." : "Upload an image to start building your library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              <div className="aspect-video relative bg-slate-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${baseUrl}${asset.publicUrl}`}
                  alt={asset.captionGu || asset.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-semibold text-xs text-slate-900 truncate" title={asset.filename}>
                    {asset.filename}
                  </p>
                  {asset.captionGu && (
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">{asset.captionGu}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    {(asset.fileSizeBytes / 1024).toFixed(0)} KB •{" "}
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                  <button
                    onClick={() => handleCopyUrl(asset.publicUrl, asset.id)}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-[#016BB7]"
                    title="Copy Image URL"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(asset.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setUploadModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {isGu ? "નવી છબી અપલોડ કરો" : "Upload New Image"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Allowed formats: JPEG, PNG, WebP (Max 10MB)
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isGu ? "છબી ફાઇલ પસંદ કરો *" : "Select Image File *"}
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#016BB7] hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isGu ? "ગુજરાતી કેપ્શન" : "Gujarati Caption"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. મુંબઈ મ્યુનિસિપલ કોર્પોરેશન મુખ્યાલય"
                  value={captionGu}
                  onChange={(e) => setCaptionGu(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isGu ? "અંગ્રેજી કેપ્શન" : "English Caption"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. BMC Headquarters, Mumbai"
                  value={captionEn}
                  onChange={(e) => setCaptionEn(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isGu ? "ફોટોગ્રાફર / સ્રોત" : "Photographer / Credit"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Janmabhoomi Bureau / PTI"
                  value={photographer}
                  onChange={(e) => setPhotographer(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {isGu ? "રદ કરો" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 text-xs font-semibold bg-[#016BB7] hover:bg-[#015896] text-white rounded-lg disabled:opacity-50 inline-flex items-center gap-1.5"
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
