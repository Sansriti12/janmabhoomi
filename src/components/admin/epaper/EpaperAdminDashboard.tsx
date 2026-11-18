"use client";

import React, { useState, useEffect } from "react";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Newspaper,
  Upload,
  Plus,
  RefreshCw,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  FileText,
  Search,
  Filter,
  Eye,
  Calendar,
  X,
  Lock,
} from "lucide-react";
import { PageHotspotEditor, EpaperPageData, HotspotItem } from "./PageHotspotEditor";

export interface EditionSummary {
  id: string;
  publicationId: string;
  editionDate: string;
  editionCity: string;
  editionNameEn: string;
  editionNameGu: string;
  volumeYear?: number;
  issueNumber?: number;
  quarter?: string;
  totalPageCount: number;
  fileSizeBytes?: string;
  status: "DRAFT" | "UPLOADED" | "PROCESSING" | "READY" | "PUBLISHED" | "FAILED" | "ARCHIVED";
  processingError?: string;
  createdAt: string;
  publication?: {
    id: string;
    code: string;
    nameEn: string;
    nameGu: string;
  };
  _count?: {
    pages: number;
  };
}

const ALL_PUBLICATIONS = [
  { id: "pub-janmabhoomi", name: "Janmabhoomi (જન્મભૂમિ)", code: "JB" },
  { id: "pub-pravasi", name: "Janmabhoomi Pravasi (પ્રવાસી)", code: "JP" },
  { id: "pub-purti", name: "Janmabhoomi Purti (પૂર્તિ)", code: "PURTI" },
];

export function EpaperAdminDashboard({ lang }: { lang: string }) {
  const isGu = lang === "gu";
  const { token } = useStaffAuth();

  const getAuthHeaders = (extra?: Record<string, string>): Record<string, string> => {
    const headers: Record<string, string> = {
      "x-staff-role": "EDITOR",
      ...extra,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const [editions, setEditions] = useState<EditionSummary[]>([]);
  const [selectedPublication, setSelectedPublication] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Edition Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newPubId, setNewPubId] = useState("pub-janmabhoomi");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newCity, setNewCity] = useState("Mumbai");
  const [newNameEn, setNewNameEn] = useState("Janmabhoomi Daily Evening Edition");
  const [newIssueNumber, setNewIssueNumber] = useState<number>(1);
  const [newFreePreviewLimit, setNewFreePreviewLimit] = useState<number>(2);
  const [newEditionFile, setNewEditionFile] = useState<File | null>(null);

  // Upload Modal State
  const [uploadTargetEdition, setUploadTargetEdition] = useState<EditionSummary | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const pdfFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Hotspot Editor Modal State
  const [activeEditorEdition, setActiveEditorEdition] = useState<any | null>(null);
  const [activeEditorPageIdx, setActiveEditorPageIdx] = useState<number>(0);

  const fetchEditions = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    try {
      let url = `${baseUrl}/api/v1/epaper/admin/editions?`;
      if (selectedPublication !== "all") url += `publicationId=${selectedPublication}&`;
      if (selectedStatus !== "all") url += `status=${selectedStatus}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setEditions(data.editions || []);
      } else {
        // Fallback demo editions when database is in standby mode
        setEditions(getDemoEditions());
      }
    } catch {
      // Offline fallback
      setEditions(getDemoEditions());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions();
  }, [selectedPublication, selectedStatus]);

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${baseUrl}/api/v1/epaper/admin/editions`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          publicationId: newPubId,
          editionDate: newDate,
          editionCity: newCity,
          editionNameEn: newNameEn,
          editionNameGu: newNameEn,
          issueNumber: newIssueNumber,
          freePreviewPageLimit: newFreePreviewLimit,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create e-paper edition.");
      }

      const createdId = data.edition?.id || data.data?.id;

      // If PDF file was selected directly in the modal, upload it immediately!
      if (newEditionFile && createdId) {
        const formData = new FormData();
        formData.append("file", newEditionFile);
        const upRes = await fetch(`${baseUrl}/api/v1/epaper/admin/editions/${createdId}/upload`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok || !upData.success) {
          setErrorMessage("Edition created, but PDF upload failed: " + (upData.error || "Unknown error"));
        }
      }

      setIsNewModalOpen(false);
      setNewEditionFile(null);
      fetchEditions();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Error creating edition");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTargetEdition || !selectedFile) return;

    setIsUploading(true);
    setUploadSuccess(null);
    setErrorMessage(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${baseUrl}/api/v1/epaper/admin/editions/${uploadTargetEdition.id}/upload`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadSuccess(isGu ? "પીડીએફ સફળતાપૂર્વક અપલોડ અને પ્રોસેસ થઈ ગયું છે!" : "PDF successfully uploaded and processed into broadsheet pages!");
        setTimeout(() => {
          setUploadTargetEdition(null);
          setSelectedFile(null);
          fetchEditions();
        }, 1500);
      } else {
        setErrorMessage(data.error || "Upload failed");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "PDF upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTogglePublish = async (edition: EditionSummary) => {
    const nextStatus = edition.status === "PUBLISHED" ? "READY" : "PUBLISHED";
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

    try {
      const res = await fetch(`${baseUrl}/api/v1/epaper/admin/editions/${edition.id}/status`, {
        method: "PATCH",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchEditions();
    } catch {
      // Toggle locally
      setEditions((prev) =>
        prev.map((e) => (e.id === edition.id ? { ...e, status: nextStatus } : e))
      );
    }
  };

  const handleDeleteEdition = async (id: string) => {
    if (!confirm(isGu ? "શું તમે ખરેખર આ આવૃત્તિ કાઢી નાખવા માંગો છો?" : "Are you sure you want to delete this edition and its page files?")) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${baseUrl}/api/v1/epaper/admin/editions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders({ "x-staff-role": "ADMIN" }),
      });
      if (res.ok) fetchEditions();
    } catch {
      setEditions((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleOpenHotspotEditor = async (edition: EditionSummary) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${baseUrl}/api/v1/epaper/admin/editions/${edition.id}/editor`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveEditorEdition(data.edition);
        setActiveEditorPageIdx(0);
      } else {
        // Fallback mock editor pages
        setActiveEditorEdition({
          ...edition,
          pages: Array.from({ length: edition.totalPageCount || 8 }, (_, i) => ({
            id: `page-${i + 1}`,
            pageNumber: i + 1,
            labelEn: `Page ${i + 1} — Broadsheet`,
            labelGu: `પાનું ${i + 1} — મુખ્ય પૃષ્ઠ`,
            imageHighresKey: `editions/${edition.id}/pages/page_${i + 1}.png`,
            imageThumbnailKey: `editions/${edition.id}/pages/thumb_${i + 1}.png`,
            widthPx: 1200,
            heightPx: 1800,
            isFreePreview: i < 2,
            hotspots: [],
          })),
        });
        setActiveEditorPageIdx(0);
      }
    } catch {
      setActiveEditorEdition({
        ...edition,
        pages: [
          {
            id: "page-1",
            pageNumber: 1,
            labelEn: "Page 1 — Front Page",
            labelGu: "પાનું ૧ — મુખ્ય પ્રથમ પાનું",
            imageHighresKey: "mock-page-1.png",
            imageThumbnailKey: "mock-thumb-1.png",
            widthPx: 1200,
            heightPx: 1800,
            isFreePreview: true,
            hotspots: [],
          },
        ],
      });
      setActiveEditorPageIdx(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-xl border border-[#016BB7]/20 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#016BB7] font-bold text-xs uppercase tracking-wider mb-1">
            <Newspaper className="h-4 w-4" />
            <span>{isGu ? "સૌરાષ્ટ્ર ટ્રસ્ટ ન્યૂઝરૂમ સીએમએસ" : "Saurashtra Trust Newsroom CMS"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]">
            {isGu ? "ઈ-પેપર એડિશન મેનેજમેન્ટ પોર્ટલ" : "E-Paper Edition & Hotspot Management"}
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            {isGu
              ? "જન્મભૂમિ અને જન્મભૂમિ પ્રવાસી અખબાર આવૃત્તિઓ, પૂર્તિ સામયિકો, પીડીએફ પ્રોસેસિંગ અને હોટસ્પોટ્સનું સંચાલન."
              : "Manage Janmabhoomi & Janmabhoomi Pravasi broadsheet editions, Purti supplements, PDF pages, and interactive hotspots."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchEditions}
            className="p-2 rounded-lg border border-neutral-300 hover:bg-neutral-50 text-neutral-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#016BB7] px-4 py-2 text-xs font-bold text-white hover:bg-[#016BB7]/90 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>{isGu ? "નવું ઇ-પેપર ઉમેરો" : "New E-Paper"}</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-neutral-200">
        <div>
          <label className="block text-[11px] font-bold text-neutral-600 mb-1">
            {isGu ? "પ્રકાશન પસંદ કરો" : "Filter Publication"}
          </label>
          <select
            value={selectedPublication}
            onChange={(e) => setSelectedPublication(e.target.value)}
            className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 bg-white focus:outline-none focus:border-[#016BB7]"
          >
            <option value="all">{isGu ? "તમામ પ્રકાશનો" : "All Publications"}</option>
            {ALL_PUBLICATIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 mb-1">
            {isGu ? "સ્થિતિ" : "Status"}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 bg-white focus:outline-none focus:border-[#016BB7]"
          >
            <option value="all">{isGu ? "તમામ સ્થિતિઓ" : "All Statuses"}</option>
            <option value="DRAFT">Draft</option>
            <option value="UPLOADED">Uploaded</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="PUBLISHED">Published</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-neutral-600 mb-1">
            {isGu ? "શોધો" : "Search"}
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isGu ? "આવૃત્તિનું નામ અથવા શહેર..." : "Edition name or city..."}
              className="w-full text-xs rounded-lg border border-neutral-300 pl-8 pr-3 py-2 focus:outline-none focus:border-[#016BB7]"
            />
            <Search className="h-3.5 w-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {/* 3. Editions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-700">
            <thead className="bg-[#FAF8F3] text-neutral-600 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3">{isGu ? "પ્રકાશન / આવૃત્તિ" : "Publication & Edition"}</th>
                <th className="px-4 py-3">{isGu ? "તારીખ / શહેર" : "Date & City"}</th>
                <th className="px-4 py-3">{isGu ? "પાના" : "Pages"}</th>
                <th className="px-4 py-3">{isGu ? "સ્થિતિ" : "Status"}</th>
                <th className="px-4 py-3 text-right">{isGu ? "ક્રિયાઓ" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {editions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-neutral-400">
                    {isLoading
                      ? (isGu ? "લોડ થઈ રહ્યું છે..." : "Loading editions...")
                      : (isGu ? "કોઈ આવૃત્તિઓ મળી નથી." : "No E-Paper editions found.")}
                  </td>
                </tr>
              ) : (
                editions.map((ed) => {
                  const statusColors: Record<string, string> = {
                    PUBLISHED: "bg-emerald-100 text-emerald-800 border-emerald-300",
                    READY: "bg-blue-100 text-blue-800 border-blue-300",
                    PROCESSING: "bg-amber-100 text-amber-800 border-amber-300 animate-pulse",
                    UPLOADED: "bg-indigo-100 text-indigo-800 border-indigo-300",
                    DRAFT: "bg-neutral-100 text-neutral-700 border-neutral-300",
                    FAILED: "bg-red-100 text-red-800 border-red-300",
                  };

                  return (
                    <tr key={ed.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <span>{isGu ? ed.editionNameGu : ed.editionNameEn}</span>
                          {(ed.editionNameEn?.toLowerCase().includes("purti") || ed.editionNameGu?.includes("પૂર્તિ")) && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200 text-[9px]">
                              Purti / પૂર્તિ
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500">
                          {ed.publication?.nameEn || ed.publicationId} • {ed.quarter ? `Quarter: ${ed.quarter}` : `Issue: ${ed.issueNumber || 1}`}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3 w-3 text-[#016BB7]" />
                          <span>{ed.editionDate.split("T")[0]}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{ed.editionCity}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Layers className="h-3 w-3 text-neutral-400" />
                          <span>{ed.totalPageCount || ed._count?.pages || 0} Pages</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                            statusColors[ed.status] || "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {ed.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {/* Upload / Replace PDF Action */}
                        <button
                          type="button"
                          onClick={() => {
                            setUploadTargetEdition(ed);
                            setSelectedFile(null);
                            setUploadSuccess(null);
                            setErrorMessage(null);
                          }}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700 hover:text-[#016BB7] transition-colors"
                          title={
                            ed.totalPageCount > 0 || ed.status !== "DRAFT"
                              ? isGu
                                ? "પીડીએફ બદલો / ફરી અપલોડ કરો (Replace PDF)"
                                : "Re-upload / Replace PDF"
                              : isGu
                              ? "પીડીએફ અપલોડ કરો"
                              : "Upload PDF"
                          }
                        >
                          <Upload className="h-4 w-4" />
                        </button>

                        {/* Open Hotspot Editor */}
                        <button
                          type="button"
                          onClick={() => handleOpenHotspotEditor(ed)}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700 hover:text-emerald-600 transition-colors"
                          title="Edit Hotspots"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        {/* Publish / Unpublish Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(ed)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-colors ${
                            ed.status === "PUBLISHED"
                              ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {ed.status === "PUBLISHED" ? (isGu ? "અપ્રકાશિત કરો" : "Unpublish") : (isGu ? "પ્રકાશિત કરો" : "Publish")}
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteEdition(ed.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                          title="Delete Edition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: Create New Edition */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-neutral-800">
                {isGu ? "નવું ઇ-પેપર બનાવો" : "Create New E-Paper"}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEdition} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {isGu ? "પ્રકાશન (સમાચારપત્ર / પૂર્તિ) *" : "Publication *"}
                </label>
                <select
                  value={newPubId}
                  onChange={(e) => {
                    const pub = e.target.value;
                    setNewPubId(pub);
                    if (pub === "pub-purti") {
                      setNewNameEn("Janmabhoomi Purti Supplement");
                    } else if (pub === "pub-pravasi") {
                      setNewNameEn("Janmabhoomi Pravasi Weekly Edition");
                    } else {
                      setNewNameEn("Janmabhoomi Daily Evening Edition");
                    }
                  }}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-white text-slate-800 font-medium"
                >
                  {ALL_PUBLICATIONS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isGu ? "તારીખ *" : "Edition Date *"}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isGu ? "શહેર *" : "City *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {isGu ? "આવૃત્તિનું નામ (Edition Title) *" : "Edition Title *"}
                </label>
                <input
                  type="text"
                  required
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {isGu
                    ? "અખબાર PDF ફાઇલ (વૈકલ્પિક — પછી પણ અપલોડ કરી શકાય છે)"
                    : "Newspaper PDF File (Optional — can also be uploaded later)"}
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNewEditionFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#016BB7] hover:file:bg-blue-100 border border-slate-300 rounded-lg px-2 py-1.5 bg-white cursor-pointer"
                />
                {newEditionFile ? (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">
                    ✓ {newEditionFile.name} ({(newEditionFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                ) : (
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    {isGu
                      ? "જો તમારી પાસે PDF તૈયાર હોય તો અત્યારે જ પસંદ કરો, અથવા આવૃત્તિ બનાવ્યા પછી ગમે ત્યારે અપલોડ કરી શકો છો (Max 100 MB)."
                      : "Select the PDF now for instant processing, or leave blank to upload later (Max 100 MB)."}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {isGu ? "મફત પ્રીવ્યૂ પાના મર્યાદા" : "Free Preview Pages Limit"}
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={newFreePreviewLimit}
                  onChange={(e) => setNewFreePreviewLimit(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 bg-white"
                />
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  {isGu ? "પ્રથમ કેટલા પાના જાહેરમાં વાંચવા મળશે. ત્યારપછી સબ્સ્ક્રિપ્શન જરૂરી રહેશે." : "Number of pages available without login. Remaining pages require an active subscription."}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded text-neutral-600 hover:bg-neutral-100"
                >
                  {isGu ? "રદ કરો" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded bg-[#016BB7] text-white font-bold hover:bg-[#016BB7]/90 cursor-pointer"
                >
                  {isLoading ? (isGu ? "બનાવી રહ્યું છે..." : "Creating...") : (isGu ? "ઇ-પેપર બનાવો" : "Create E-Paper")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: PDF Upload Dropzone */}
      {uploadTargetEdition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-800">
                  {uploadTargetEdition.totalPageCount > 0
                    ? isGu
                      ? "પીડીએફ બદલો / ફરી અપલોડ કરો"
                      : "Replace / Re-upload Edition PDF"
                    : isGu
                    ? "પીડીએફ ફાઇલ અપલોડ કરો"
                    : "Upload Edition PDF"}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {uploadTargetEdition.editionNameEn} ({uploadTargetEdition.editionDate.split("T")[0]})
                </p>
                {uploadTargetEdition.totalPageCount > 0 && (
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                    {isGu
                      ? `(હાલમાં ${uploadTargetEdition.totalPageCount} પાના પ્રોસેસ થયેલા છે. નવી PDF અપલોડ કરવાથી જૂના પાના બદલાઈ જશે)`
                      : `(Currently has ${uploadTargetEdition.totalPageCount} pages. Uploading a new PDF will replace existing pages)`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setUploadTargetEdition(null)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
                    setFileValidationError(
                      isGu
                        ? "અમાન્ય ફાઇલ પ્રકાર. કૃપા કરીને પીડીએફ (.pdf) ફાઇલ પસંદ કરો."
                        : "Invalid file type. Please upload a PDF file (.pdf)."
                    );
                    return;
                  }
                  if (file.size > 100 * 1024 * 1024) {
                    setFileValidationError(
                      isGu
                        ? "ફાઇલનું કદ ૧૦૦ MB કરતાં વધુ છે. કૃપા કરીને ૧૦૦ MB થી નાની ફાઇલ પસંદ કરો."
                        : "File size exceeds 100 MB limit."
                    );
                    return;
                  }
                  setFileValidationError(null);
                  setSelectedFile(file);
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                  isDragOver
                    ? "border-[#016BB7] bg-blue-50/50 scale-[1.01]"
                    : "border-slate-300 hover:border-[#016BB7] bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <Upload className="h-9 w-9 mx-auto text-[#016BB7] mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  {isGu ? "બ્રોડશીટ પીડીએફ અહીં ડ્રેગ કરો અથવા બ્રાઉઝ કરો" : "Drag and drop broadsheet PDF or browse files"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  MIME: application/pdf (Max limit: 100 MB)
                </p>

                {/* Hidden native file input */}
                <input
                  ref={pdfFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
                      setFileValidationError(
                        isGu
                          ? "અમાન્ય ફાઇલ પ્રકાર. કૃપા કરીને પીડીએફ (.pdf) ફાઇલ પસંદ કરો."
                          : "Invalid file type. Please upload a PDF file (.pdf)."
                      );
                      return;
                    }
                    if (file.size > 100 * 1024 * 1024) {
                      setFileValidationError(
                        isGu ? "ફાઇલનું કદ ૧૦૦ MB કરતાં વધુ છે." : "File size exceeds 100 MB limit."
                      );
                      return;
                    }
                    setFileValidationError(null);
                    setSelectedFile(file);
                  }}
                />

                {/* Prominent Browse Files / Choose PDF Button */}
                <button
                  type="button"
                  onClick={() => pdfFileInputRef.current?.click()}
                  className="mt-3 px-4 py-2 rounded-lg bg-[#016BB7] text-white text-xs font-semibold hover:bg-[#015896] transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isGu ? "પીડીએફ ફાઇલ પસંદ કરો (Choose PDF)" : "Choose PDF / Browse Files"}</span>
                </button>
              </div>

              {fileValidationError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{fileValidationError}</span>
                </div>
              )}

              {selectedFile && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="h-5 w-5 text-[#016BB7] shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                      <p className="font-mono text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • application/pdf
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => pdfFileInputRef.current?.click()}
                      className="px-2 py-1 rounded border border-slate-300 text-slate-700 text-[11px] font-medium hover:bg-slate-100 disabled:opacity-50"
                    >
                      {isGu ? "બદલો" : "Replace"}
                    </button>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => {
                        setSelectedFile(null);
                        if (pdfFileInputRef.current) pdfFileInputRef.current.value = "";
                      }}
                      className="text-rose-600 hover:text-rose-800 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {isUploading && (
                <div className="space-y-1.5 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-[#016BB7]">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{isGu ? "પ્રોસેસિંગ અને પાના રેન્ડર થઈ રહ્યા છે..." : "Uploading & processing pages..."}</span>
                    <span className="font-mono animate-pulse">Rasterizing PDF...</span>
                  </div>
                  <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#016BB7] rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {isGu
                      ? "મોટી બ્રોડશીટ પીડીએફ પ્રોસેસ થવામાં થોડી સેકન્ડ્સ લાગી શકે છે."
                      : "Large broadsheets may take a few moments to generate high-resolution page spreads."}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => setUploadTargetEdition(null)}
                  className="px-4 py-2 rounded text-neutral-600 text-xs hover:bg-neutral-100 disabled:opacity-50"
                >
                  {isGu ? "રદ કરો" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 rounded bg-[#016BB7] text-white text-xs font-bold hover:bg-[#016BB7]/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>
                    {isUploading
                      ? isGu
                        ? "પ્રોસેસ થઈ રહ્યું છે..."
                        : "Processing Pages..."
                      : uploadTargetEdition.totalPageCount > 0
                      ? isGu
                        ? "પીડીએફ બદલો અને પ્રોસેસ કરો"
                        : "Replace & Process PDF"
                      : isGu
                      ? "અપલોડ શરૂ કરો"
                      : "Start Processing"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: Hotspot Editor Fullscreen / Overlay */}
      {activeEditorEdition && (
        <div className="fixed inset-0 z-50 flex flex-col bg-neutral-900/80 p-2 sm:p-6 backdrop-blur-xs">
          <div className="flex-1 max-w-6xl w-full mx-auto bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <PageHotspotEditor
              page={activeEditorEdition.pages[activeEditorPageIdx]}
              totalPages={activeEditorEdition.pages.length}
              lang={lang}
              onNavigatePage={(pageNo) => {
                const idx = activeEditorEdition.pages.findIndex(
                  (p: any) => p.pageNumber === pageNo
                );
                if (idx !== -1) setActiveEditorPageIdx(idx);
              }}
              onClose={() => setActiveEditorEdition(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Fallback demo editions when PostgreSQL is in standby mode
function getDemoEditions(): EditionSummary[] {
  return [
    {
      id: "demo-jb-today",
      publicationId: "pub-janmabhoomi",
      editionDate: "2026-11-11T00:00:00.000Z",
      editionCity: "Mumbai",
      editionNameEn: "Janmabhoomi Daily Evening Broadsheet",
      editionNameGu: "જન્મભૂમિ દૈનિક સાંધ્ય સમાચારપત્ર",
      totalPageCount: 16,
      status: "PUBLISHED",
      createdAt: "2026-11-11T06:00:00.000Z",
      publication: { id: "pub-janmabhoomi", code: "JB", nameEn: "Janmabhoomi", nameGu: "જન્મભૂમિ" },
      _count: { pages: 16 },
    },
    {
      id: "demo-km-today",
      publicationId: "pub-kutchmitra",
      editionDate: "2026-11-11T00:00:00.000Z",
      editionCity: "Bhuj",
      editionNameEn: "Kutchmitra Daily Morning Edition",
      editionNameGu: "કચ્છમિત્ર દૈનિક પ્રભાત",
      totalPageCount: 12,
      status: "READY",
      createdAt: "2026-11-11T05:30:00.000Z",
      publication: { id: "pub-kutchmitra", code: "KM", nameEn: "Kutchmitra", nameGu: "કચ્છમિત્ર" },
      _count: { pages: 12 },
    },
    {
      id: "demo-kavita-q4",
      publicationId: "pub-kavita",
      editionDate: "2026-10-01T00:00:00.000Z",
      editionCity: "Mumbai",
      editionNameEn: "Kavita Quarterly Poetry Journal (Q4 2026)",
      editionNameGu: "કવિતા ત્રિમાસિક કાવ્ય સામયિક",
      quarter: "Q4",
      issueNumber: 284,
      totalPageCount: 64,
      status: "PUBLISHED",
      createdAt: "2026-10-01T00:00:00.000Z",
      publication: { id: "pub-kavita", code: "KAV", nameEn: "Kavita", nameGu: "કવિતા" },
      _count: { pages: 64 },
    },
  ];
}
