"use client";

import React, { useState, useEffect } from "react";
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
];

export function EpaperAdminDashboard({ lang }: { lang: string }) {
  const isGu = lang === "gu";
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
  const [newNameGu, setNewNameGu] = useState("જન્મભૂમિ દૈનિક સાંધ્ય આવૃત્તિ");
  const [newQuarter, setNewQuarter] = useState<string>("Q1");
  const [newIssueNumber, setNewIssueNumber] = useState<number>(1);
  const [newFreePreviewLimit, setNewFreePreviewLimit] = useState<number>(2);

  // Upload Modal State
  const [uploadTargetEdition, setUploadTargetEdition] = useState<EditionSummary | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

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
        headers: { "x-staff-role": "EDITOR" },
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

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
    try {
      const res = await fetch(`${baseUrl}/api/v1/epaper/admin/editions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-staff-role": "EDITOR",
        },
        body: JSON.stringify({
          publicationId: newPubId,
          editionDate: newDate,
          editionCity: newCity,
          editionNameEn: newNameEn,
          editionNameGu: newNameGu,
          quarter: newPubId === "pub-kavita" ? newQuarter : undefined,
          issueNumber: newIssueNumber,
          freePreviewPageLimit: newFreePreviewLimit,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsNewModalOpen(false);
        fetchEditions();
      } else {
        setErrorMessage(data.error || "Failed to create edition.");
      }
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
        headers: {
          "x-staff-role": "EDITOR",
        },
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
        headers: { "Content-Type": "application/json", "x-staff-role": "EDITOR" },
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
        headers: { "x-staff-role": "ADMIN" },
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
        headers: { "x-staff-role": "EDITOR" },
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
              ? "તમામ ૮ પ્રકાશનોની આવૃત્તિઓનું સંચાલન, પીડીએફ પ્રોસેસિંગ, હોટસ્પોટ લિંક્સ અને સબ્સ્ક્રાઇબર એક્સેસ નિયંત્રણ."
              : "Manage 8 publications, ingest PDF pages, configure interactive hotspots, and manage subscriber gates."}
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
            <span>{isGu ? "નવી આવૃત્તિ ઉમેરો" : "New Edition"}</span>
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
            <option value="all">{isGu ? "તમામ પ્રકાશનો (All 8)" : "All 8 Publications"}</option>
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
                        <div className="font-bold text-neutral-900">
                          {isGu ? ed.editionNameGu : ed.editionNameEn}
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
                        {/* Upload PDF Action */}
                        <button
                          type="button"
                          onClick={() => {
                            setUploadTargetEdition(ed);
                            setSelectedFile(null);
                            setUploadSuccess(null);
                            setErrorMessage(null);
                          }}
                          className="p-1.5 rounded hover:bg-neutral-100 text-neutral-700 hover:text-[#016BB7] transition-colors"
                          title="Upload PDF"
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
                {isGu ? "નવી ઈ-પેપર આવૃત્તિ બનાવો" : "Create New E-Paper Edition"}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEdition} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {isGu ? "પ્રકાશન (૮ પ્રકાશનોમાંથી પસંદ કરો)" : "Publication"}
                </label>
                <select
                  value={newPubId}
                  onChange={(e) => {
                    setNewPubId(e.target.value);
                    if (e.target.value === "pub-kavita") {
                      setNewNameEn("Kavita Quarterly Poetry Journal");
                      setNewNameGu("કવિતા ત્રિમાસિક કાવ્ય સામયિક");
                    } else if (e.target.value === "pub-panchang") {
                      setNewNameEn("Janmabhoomi Panchang Almanac");
                      setNewNameGu("જન્મભૂમિ પંચાંગ અને ગ્રહમાન");
                    }
                  }}
                  className="w-full rounded border border-neutral-300 px-3 py-2 bg-white"
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
                    {isGu ? "તારીખ" : "Edition Date"}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">
                    {isGu ? "શહેર" : "City"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
              </div>

              {/* Kavita Specific Fields */}
              {newPubId === "pub-kavita" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded border border-amber-200">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Quarter</label>
                    <select
                      value={newQuarter}
                      onChange={(e) => setNewQuarter(e.target.value)}
                      className="w-full rounded border border-amber-300 px-3 py-2 bg-white"
                    >
                      <option value="Q1">Q1 (Jan - Mar)</option>
                      <option value="Q2">Q2 (Apr - Jun)</option>
                      <option value="Q3">Q3 (Jul - Sep)</option>
                      <option value="Q4">Q4 (Oct - Dec)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Issue Number</label>
                    <input
                      type="number"
                      min={1}
                      value={newIssueNumber}
                      onChange={(e) => setNewIssueNumber(parseInt(e.target.value, 10))}
                      className="w-full rounded border border-amber-300 px-3 py-2 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {isGu ? "આવૃત્તિનું નામ (અંગ્રેજી)" : "Edition Name (English)"}
                </label>
                <input
                  type="text"
                  required
                  value={newNameEn}
                  onChange={(e) => setNewNameEn(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  {isGu ? "આવૃત્તિનું નામ (ગુજરાતી)" : "Edition Name (Gujarati)"}
                </label>
                <input
                  type="text"
                  required
                  value={newNameGu}
                  onChange={(e) => setNewNameGu(e.target.value)}
                  className="w-full rounded border border-neutral-300 px-3 py-2"
                />
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
                  className="w-full rounded border border-neutral-300 px-3 py-2"
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
                  className="px-4 py-2 rounded bg-[#016BB7] text-white font-bold hover:bg-[#016BB7]/90"
                >
                  {isLoading ? (isGu ? "બનાવી રહ્યું છે..." : "Creating...") : (isGu ? "આવૃત્તિ સાચવો" : "Create Edition")}
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
                  {isGu ? "પીડીએફ ફાઇલ અપલોડ કરો" : "Upload Edition PDF"}
                </h3>
                <p className="text-[11px] text-neutral-500">
                  {uploadTargetEdition.editionNameEn} ({uploadTargetEdition.editionDate.split("T")[0]})
                </p>
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
              <div className="border-2 border-dashed border-[#016BB7]/40 rounded-xl p-6 text-center bg-neutral-50 hover:bg-neutral-100 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-[#016BB7] mb-2" />
                <p className="text-xs font-semibold text-neutral-700">
                  {isGu ? "બ્રોડશીટ પીડીએફ ફાઇલ પસંદ કરો" : "Select or drag broadsheet PDF file"}
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">
                  MIME: application/pdf (Max 100 MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-3 block w-full text-xs text-neutral-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#016BB7] file:text-white hover:file:bg-[#016BB7]/90"
                />
              </div>

              {selectedFile && (
                <div className="text-xs bg-neutral-100 p-2.5 rounded text-neutral-700 flex justify-between">
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <span className="font-mono text-neutral-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setUploadTargetEdition(null)}
                  className="px-4 py-2 rounded text-neutral-600 text-xs hover:bg-neutral-100"
                >
                  {isGu ? "રદ કરો" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="px-4 py-2 rounded bg-[#016BB7] text-white text-xs font-bold hover:bg-[#016BB7]/90 disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{isUploading ? (isGu ? "પ્રોસેસ થઈ રહ્યું છે..." : "Processing Pages...") : (isGu ? "અપલોડ શરૂ કરો" : "Start Processing")}</span>
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
