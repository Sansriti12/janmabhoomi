"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Link as LinkIcon,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Eye,
  Check,
  AlertCircle,
  X,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export interface HotspotItem {
  id?: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  headlineText?: string;
  articleId?: string;
  externalUrl?: string;
  targetType: "article" | "external" | "zoom";
}

export interface EpaperPageData {
  id: string;
  pageNumber: number;
  labelEn: string;
  labelGu: string;
  imageHighresKey: string;
  imageThumbnailKey: string;
  widthPx: number;
  heightPx: number;
  isFreePreview: boolean;
  hotspots?: HotspotItem[];
}

interface PageHotspotEditorProps {
  page: EpaperPageData;
  totalPages: number;
  lang: string;
  onSaveHotspots?: (pageId: string, hotspots: HotspotItem[]) => Promise<void>;
  onNavigatePage?: (pageNumber: number) => void;
  onClose?: () => void;
}

export function PageHotspotEditor({
  page,
  totalPages,
  lang,
  onSaveHotspots,
  onNavigatePage,
  onClose,
}: PageHotspotEditorProps) {
  const isGu = lang === "gu";
  const [hotspots, setHotspots] = useState<HotspotItem[]>(page.hotspots || []);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync internal state if page prop changes
  useEffect(() => {
    setHotspots(page.hotspots || []);
    setSelectedIdx(null);
    setCurrentBox(null);
  }, [page]);

  // Handle Mouse Down to start drawing a hotspot box
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentBox({ x, y, w: 0, h: 0 });
    setSelectedIdx(null);
  };

  // Handle Mouse Move during drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const currentY = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    const x = Math.min(startPoint.x, currentX);
    const y = Math.min(startPoint.y, currentY);
    const w = Math.abs(currentX - startPoint.x);
    const h = Math.abs(currentY - startPoint.y);

    setCurrentBox({ x, y, w, h });
  };

  // Handle Mouse Up to finish drawing
  const handleMouseUp = () => {
    if (!isDrawing || !currentBox || !containerRef.current) {
      setIsDrawing(false);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    // Ignore tiny accidental clicks (less than 20px)
    if (currentBox.w > 20 && currentBox.h > 20) {
      const xPercent = Number(((currentBox.x / rect.width) * 100).toFixed(2));
      const yPercent = Number(((currentBox.y / rect.height) * 100).toFixed(2));
      const widthPercent = Number(((currentBox.w / rect.width) * 100).toFixed(2));
      const heightPercent = Number(((currentBox.h / rect.height) * 100).toFixed(2));

      // Clamp to prevent out-of-bounds
      const safeWidth = Math.min(widthPercent, 100 - xPercent);
      const safeHeight = Math.min(heightPercent, 100 - yPercent);

      const newHotspot: HotspotItem = {
        xPercent,
        yPercent,
        widthPercent: safeWidth,
        heightPercent: safeHeight,
        headlineText: `Article ${hotspots.length + 1}`,
        targetType: "article",
      };

      const updated = [...hotspots, newHotspot];
      setHotspots(updated);
      setSelectedIdx(updated.length - 1);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
  };

  const handleUpdateSelected = (field: keyof HotspotItem, val: any) => {
    if (selectedIdx === null || !hotspots[selectedIdx]) return;
    const updated = [...hotspots];
    updated[selectedIdx] = {
      ...updated[selectedIdx],
      [field]: val,
    };
    setHotspots(updated);
  };

  const handleDeleteSelected = () => {
    if (selectedIdx === null) return;
    const updated = hotspots.filter((_, idx) => idx !== selectedIdx);
    setHotspots(updated);
    setSelectedIdx(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      if (onSaveHotspots) {
        await onSaveHotspots(page.id, hotspots);
      } else {
        // Direct API call fallback
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
        for (const h of hotspots) {
          if (!h.id) {
            await fetch(`${baseUrl}/api/v1/epaper/admin/pages/${page.id}/hotspots`, {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-staff-role": "EDITOR" },
              body: JSON.stringify(h),
            });
          }
        }
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save hotspots");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedHotspot = selectedIdx !== null ? hotspots[selectedIdx] : null;

  return (
    <div className="flex flex-col h-full bg-[#FAF8F3] border border-[#016BB7]/30 rounded-xl overflow-hidden shadow-lg">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#016BB7] text-white gap-3">
        <div className="flex items-center gap-3">
          <Layers className="h-5 w-5 text-white/90" />
          <div>
            <h3 className="text-sm font-bold tracking-wide">
              {isGu ? "ઇન્ટરેક્ટિવ હોટસ્પોટ એડિટર" : "Interactive Hotspot Page Editor"}
            </h3>
            <p className="text-[11px] text-white/80">
              {isGu ? page.labelGu : page.labelEn} (Page {page.pageNumber} / {totalPages})
            </p>
          </div>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page.pageNumber <= 1}
            onClick={() => onNavigatePage && onNavigatePage(page.pageNumber - 1)}
            className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold px-2">
            {page.pageNumber} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page.pageNumber >= totalPages}
            onClick={() => onNavigatePage && onNavigatePage(page.pageNumber + 1)}
            className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? (isGu ? "સાચવી રહ્યું છે..." : "Saving...") : (isGu ? "હોટસ્પોટ્સ સાચવો" : "Save Hotspots")}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Save alerts */}
      {saveSuccess && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{isGu ? "હોટસ્પોટ્સ સફળતાપૂર્વક સાચવવામાં આવ્યા છે." : "Hotspots saved successfully."}</span>
        </div>
      )}
      {errorMessage && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Main Work Area: Canvas on Left, Inspector on Right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Visual Drawing Canvas */}
        <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-neutral-100">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative select-none shadow-md border border-neutral-300 bg-white cursor-crosshair max-w-full"
            style={{
              aspectRatio: `${page.widthPx} / ${page.heightPx}`,
              width: "100%",
              maxWidth: "680px",
            }}
          >
            {/* Visual Simulated Page Graphic */}
            <div className="w-full h-full p-4 flex flex-col justify-between pointer-events-none">
              <div className="border-b-2 border-[#016BB7] pb-2 text-center">
                <p className="text-xs font-black tracking-widest text-[#016BB7] uppercase">
                  JANMABHOOMI GROUP BROADSHEET REPLICA
                </p>
                <p className="text-[10px] text-neutral-600">
                  {page.labelEn} • Click and drag to create article hotspot boxes
                </p>
              </div>

              {/* Broadsheet Columns Simulation */}
              <div className="grid grid-cols-3 gap-2 flex-1 my-3 opacity-60">
                <div className="border-r border-dashed border-neutral-300 pr-2 space-y-2">
                  <div className="h-4 bg-[#016BB7]/30 rounded"></div>
                  <div className="h-16 bg-neutral-200 rounded"></div>
                  <div className="h-24 bg-neutral-100 rounded"></div>
                </div>
                <div className="border-r border-dashed border-neutral-300 pr-2 space-y-2">
                  <div className="h-4 bg-[#016BB7]/20 rounded"></div>
                  <div className="h-28 bg-neutral-100 rounded"></div>
                  <div className="h-12 bg-neutral-200 rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-[#016BB7]/20 rounded"></div>
                  <div className="h-14 bg-neutral-100 rounded"></div>
                  <div className="h-20 bg-neutral-200 rounded"></div>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-1 text-[9px] text-center text-neutral-400">
                Page {page.pageNumber} • Normalized Coordinates Overlay
              </div>
            </div>

            {/* Saved Hotspots Overlay */}
            {hotspots.map((h, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIdx(idx);
                  }}
                  className={`absolute rounded border transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-600 bg-emerald-500/25 ring-2 ring-emerald-500 z-20"
                      : "border-[#016BB7] bg-[#016BB7]/20 hover:bg-[#016BB7]/30 z-10"
                  }`}
                  style={{
                    left: `${h.xPercent}%`,
                    top: `${h.yPercent}%`,
                    width: `${h.widthPercent}%`,
                    height: `${h.heightPercent}%`,
                  }}
                >
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#016BB7] text-white shadow-xs">
                    #{idx + 1}
                  </span>
                  {h.headlineText && (
                    <span className="absolute bottom-1 left-1 right-1 truncate px-1 py-0.5 rounded text-[9px] font-semibold bg-white/90 text-[#1F2937] shadow-xs">
                      {h.headlineText}
                    </span>
                  )}
                </div>
              );
            })}

            {/* In-Progress Drawing Box */}
            {isDrawing && currentBox && (
              <div
                className="absolute border-2 border-dashed border-emerald-600 bg-emerald-500/30 pointer-events-none z-30"
                style={{
                  left: `${currentBox.x}px`,
                  top: `${currentBox.y}px`,
                  width: `${currentBox.w}px`,
                  height: `${currentBox.h}px`,
                }}
              />
            )}
          </div>
        </div>

        {/* 3. Hotspot Inspector & Sidebar */}
        <div className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-neutral-200 p-4 flex flex-col space-y-4 overflow-y-auto">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              {isGu ? "હોટસ્પોટ યાદી" : "Hotspot List"} ({hotspots.length})
            </h4>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              {isGu
                ? "પાના પર નવો લેખ લિંક કરવા માઉસ વડે લંબચોરસ બોક્સ દોરો."
                : "Click and drag on the page canvas to define clickable article areas."}
            </p>
          </div>

          {/* Quick Selection Pills */}
          <div className="flex flex-wrap gap-1.5">
            {hotspots.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedIdx === idx
                    ? "bg-[#016BB7] text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                #{idx + 1}
              </button>
            ))}
          </div>

          {/* Selected Hotspot Details Form */}
          {selectedHotspot !== null && selectedIdx !== null ? (
            <div className="space-y-3 pt-3 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#016BB7]">
                  {isGu ? `હોટસ્પોટ #${selectedIdx + 1} વિગતો` : `Hotspot #${selectedIdx + 1} Details`}
                </span>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 text-xs flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isGu ? "કાઢી નાખો" : "Delete"}</span>
                </button>
              </div>

              {/* Title / Headline */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isGu ? "લેખનું શીર્ષક / હેડલાઇન" : "Article Headline / Title"}
                </label>
                <input
                  type="text"
                  value={selectedHotspot.headlineText || ""}
                  onChange={(e) => handleUpdateSelected("headlineText", e.target.value)}
                  placeholder="e.g. Western Maritime Corridor"
                  className="w-full text-xs rounded border border-neutral-300 px-2.5 py-1.5 focus:border-[#016BB7] focus:outline-none"
                />
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isGu ? "લિંક પ્રકાર" : "Target Type"}
                </label>
                <select
                  value={selectedHotspot.targetType}
                  onChange={(e) => handleUpdateSelected("targetType", e.target.value)}
                  className="w-full text-xs rounded border border-neutral-300 px-2.5 py-1.5 focus:border-[#016BB7] focus:outline-none bg-white"
                >
                  <option value="article">{isGu ? "વેબસાઇટ લેખ સાથે લિંક" : "Janmabhoomi News Article"}</option>
                  <option value="external">{isGu ? "બાહ્ય વેબસાઇટ URL" : "External URL Link"}</option>
                  <option value="zoom">{isGu ? "ફક્ત લેખ ઝૂમ / કટઆઉટ" : "Article Zoom Only"}</option>
                </select>
              </div>

              {/* External URL if selected */}
              {selectedHotspot.targetType === "external" && (
                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    {isGu ? "બાહ્ય URL (http/https)" : "External URL"}
                  </label>
                  <input
                    type="url"
                    value={selectedHotspot.externalUrl || ""}
                    onChange={(e) => handleUpdateSelected("externalUrl", e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs rounded border border-neutral-300 px-2.5 py-1.5 focus:border-[#016BB7] focus:outline-none"
                  />
                </div>
              )}

              {/* Coordinates Preview (Read-only normalized percentages) */}
              <div className="bg-neutral-50 rounded p-2.5 text-[10px] space-y-1 text-neutral-600 border border-neutral-200">
                <p className="font-bold text-neutral-800">
                  {isGu ? "માપદંડ નિર્દેશાંક (ટકાવારી):" : "Normalized Coordinates:"}
                </p>
                <div className="grid grid-cols-2 gap-1 font-mono">
                  <span>X: {selectedHotspot.xPercent}%</span>
                  <span>Y: {selectedHotspot.yPercent}%</span>
                  <span>W: {selectedHotspot.widthPercent}%</span>
                  <span>H: {selectedHotspot.heightPercent}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400 text-xs">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>{isGu ? "કોઈ હોટસ્પોટ પસંદ કરેલ નથી." : "No hotspot selected."}</p>
              <p className="text-[10px] text-neutral-500 mt-1">
                {isGu ? "સંપાદિત કરવા માટે બોક્સ પર ક્લિક કરો." : "Click a box on the canvas to inspect."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
