"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Trash2,
  Save,
  Check,
  AlertCircle,
  X,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Move,
  Languages,
  Loader2,
} from "lucide-react";

export interface HotspotItem {
  id?: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  headlineText?: string;
  subHeadlineText?: string;
  bodyText?: string;
  headlineEn?: string;
  subHeadlineEn?: string;
  bodyTextEn?: string;
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
  onHotspotsSynced?: (pageId: string, hotspots: HotspotItem[]) => void;
  onNavigatePage?: (pageNumber: number) => void;
  onClose?: () => void;
}

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type DragAction =
  | {
      mode: "move";
      idx: number;
      startClientX: number;
      startClientY: number;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
    }
  | {
      mode: "resize";
      idx: number;
      handle: ResizeHandle;
      startClientX: number;
      startClientY: number;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
    };

export function PageHotspotEditor({
  page,
  totalPages,
  lang,
  onSaveHotspots,
  onHotspotsSynced,
  onNavigatePage,
  onClose,
}: PageHotspotEditorProps) {
  const isGu = lang === "gu";
  const [hotspots, setHotspots] = useState<HotspotItem[]>(
    (page.hotspots || []).map((h) => ({
      ...h,
      xPercent: Number(h.xPercent),
      yPercent: Number(h.yPercent),
      widthPercent: Number(h.widthPercent),
      heightPercent: Number(h.heightPercent),
    }))
  );
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [canvasZoom, setCanvasZoom] = useState<number>(1);

  // Drawing a brand new box
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Moving or resizing an existing hotspot box (like resizing an image)
  const dragActionRef = useRef<DragAction | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editorLangTab, setEditorLangTab] = useState<"gu" | "en">("gu");
  const [isTranslating, setIsTranslating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHotspots(
      (page.hotspots || []).map((h) => ({
        ...h,
        xPercent: Number(h.xPercent),
        yPercent: Number(h.yPercent),
        widthPercent: Number(h.widthPercent),
        heightPercent: Number(h.heightPercent),
      }))
    );
    setDeletedIds([]);
    setSelectedIdx(null);
    setCurrentBox(null);
    dragActionRef.current = null;
  }, [page]);

  // Global window pointer listeners for smooth move & corner/edge resize
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      const action = dragActionRef.current;
      if (!action || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const dxPct = ((e.clientX - action.startClientX) / rect.width) * 100;
      const dyPct = ((e.clientY - action.startClientY) / rect.height) * 100;

      setHotspots((prev) => {
        const target = prev[action.idx];
        if (!target) return prev;
        const next = [...prev];

        if (action.mode === "move") {
          const nx = Math.max(0, Math.min(100 - action.origW, action.origX + dxPct));
          const ny = Math.max(0, Math.min(100 - action.origH, action.origY + dyPct));
          next[action.idx] = {
            ...target,
            xPercent: Number(nx.toFixed(2)),
            yPercent: Number(ny.toFixed(2)),
          };
          return next;
        }

        // Resize from any of the 8 handles (nw, n, ne, e, se, s, sw, w)
        let x = action.origX;
        let y = action.origY;
        let w = action.origW;
        let h = action.origH;
        const minSize = 3;

        if (action.handle.includes("e")) {
          w = Math.max(minSize, Math.min(100 - x, action.origW + dxPct));
        }
        if (action.handle.includes("s")) {
          h = Math.max(minSize, Math.min(100 - y, action.origH + dyPct));
        }
        if (action.handle.includes("w")) {
          const maxLeftDelta = action.origW - minSize;
          const clampedDx = Math.max(-action.origX, Math.min(maxLeftDelta, dxPct));
          x = action.origX + clampedDx;
          w = action.origW - clampedDx;
        }
        if (action.handle.includes("n")) {
          const maxTopDelta = action.origH - minSize;
          const clampedDy = Math.max(-action.origY, Math.min(maxTopDelta, dyPct));
          y = action.origY + clampedDy;
          h = action.origH - clampedDy;
        }

        next[action.idx] = {
          ...target,
          xPercent: Number(x.toFixed(2)),
          yPercent: Number(y.toFixed(2)),
          widthPercent: Number(w.toFixed(2)),
          heightPercent: Number(h.toFixed(2)),
        };
        return next;
      });
    };

    const handleWindowMouseUp = () => {
      dragActionRef.current = null;
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, []);

  // Draw new hotspot box on empty canvas
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragActionRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentBox({ x, y, w: 0, h: 0 });
    setSelectedIdx(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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

  const handleCanvasMouseUp = () => {
    if (!isDrawing || !currentBox || !containerRef.current) {
      setIsDrawing(false);
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    if (currentBox.w > 18 && currentBox.h > 18) {
      const xPercent = Number(((currentBox.x / rect.width) * 100).toFixed(2));
      const yPercent = Number(((currentBox.y / rect.height) * 100).toFixed(2));
      const widthPercent = Number(Math.min((currentBox.w / rect.width) * 100, 100 - xPercent).toFixed(2));
      const heightPercent = Number(Math.min((currentBox.h / rect.height) * 100, 100 - yPercent).toFixed(2));

      const newHotspot: HotspotItem = {
        xPercent,
        yPercent,
        widthPercent,
        heightPercent,
        headlineText: "",
        subHeadlineText: "",
        bodyText: "",
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

  const startMoveBox = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    const h = hotspots[idx];
    if (!h) return;
    setSelectedIdx(idx);
    dragActionRef.current = {
      mode: "move",
      idx,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: Number(h.xPercent),
      origY: Number(h.yPercent),
      origW: Number(h.widthPercent),
      origH: Number(h.heightPercent),
    };
  };

  const startResizeBox = (e: React.MouseEvent, idx: number, handle: ResizeHandle) => {
    e.stopPropagation();
    const h = hotspots[idx];
    if (!h) return;
    setSelectedIdx(idx);
    dragActionRef.current = {
      mode: "resize",
      idx,
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: Number(h.xPercent),
      origY: Number(h.yPercent),
      origW: Number(h.widthPercent),
      origH: Number(h.heightPercent),
    };
  };

  const handleUpdateSelected = (field: keyof HotspotItem, val: any) => {
    if (selectedIdx === null || !hotspots[selectedIdx]) return;
    setHotspots((prev) => {
      const updated = [...prev];
      updated[selectedIdx] = { ...updated[selectedIdx], [field]: val };
      return updated;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIdx === null) return;
    const removed = hotspots[selectedIdx];
    if (removed?.id) {
      setDeletedIds((prev) => [...prev, removed.id!]);
    }
    setHotspots((prev) => prev.filter((_, idx) => idx !== selectedIdx));
    setSelectedIdx(null);
  };

  const handleAutoTranslateToEnglish = async () => {
    if (selectedIdx === null || !hotspots[selectedIdx]) return;
    const h = hotspots[selectedIdx];
    if (!h.headlineText?.trim() && !h.bodyText?.trim()) {
      setErrorMessage(
        isGu
          ? "અનુવાદ કરતા પહેલા ગુજરાતી શીર્ષક અથવા લેખ લખાણ દાખલ કરો."
          : "Please enter Gujarati Headline or Full Article Text before translating."
      );
      return;
    }

    setIsTranslating(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/v1/epaper/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headlineGu: h.headlineText || "",
          subHeadlineGu: h.subHeadlineText || "",
          bodyTextGu: h.bodyText || "",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Translation failed");
      }
      setHotspots((prev) => {
        const updated = [...prev];
        updated[selectedIdx] = {
          ...updated[selectedIdx],
          headlineEn: data.headlineEn || updated[selectedIdx].headlineEn || "",
          subHeadlineEn: data.subHeadlineEn || updated[selectedIdx].subHeadlineEn || "",
          bodyTextEn: data.bodyTextEn || updated[selectedIdx].bodyTextEn || "",
        };
        return updated;
      });
      setEditorLangTab("en");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Auto-translation failed");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      if (onSaveHotspots) {
        await onSaveHotspots(page.id, hotspots);
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
        const staffToken =
          typeof window !== "undefined" ? localStorage.getItem("janmabhoomi_staff_token") : null;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-staff-role": "EDITOR",
          ...(staffToken ? { Authorization: `Bearer ${staffToken}` } : {}),
        };

        // 1. Delete removed hotspots
        for (const delId of deletedIds) {
          await fetch(`${baseUrl}/api/v1/epaper/admin/hotspots/${delId}`, {
            method: "DELETE",
            headers,
          });
        }

        // 2. Create new & update existing hotspots
        const syncedHotspots: HotspotItem[] = [];
        for (const h of hotspots) {
          const payload = {
            xPercent: Number(h.xPercent),
            yPercent: Number(h.yPercent),
            widthPercent: Number(h.widthPercent),
            heightPercent: Number(h.heightPercent),
            headlineText: (h.headlineText || "").trim() || undefined,
            subHeadlineText: (h.subHeadlineText || "").trim() || null,
            bodyText: (h.bodyText || "").trim() || null,
            headlineEn: (h.headlineEn || "").trim() || null,
            subHeadlineEn: (h.subHeadlineEn || "").trim() || null,
            bodyTextEn: (h.bodyTextEn || "").trim() || null,
            articleId: h.articleId || null,
            externalUrl: h.targetType === "external" && h.externalUrl ? h.externalUrl : null,
            targetType: h.targetType || "article",
          };

          if (!h.id) {
            const res = await fetch(`${baseUrl}/api/v1/epaper/admin/pages/${page.id}/hotspots`, {
              method: "POST",
              headers,
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              throw new Error(data.error || "Failed to save new hotspot");
            }
            syncedHotspots.push({
              ...h,
              id: data.hotspot?.id,
            });
          } else {
            const res = await fetch(`${baseUrl}/api/v1/epaper/admin/hotspots/${h.id}`, {
              method: "PUT",
              headers,
              body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
              throw new Error(data.error || "Failed to update hotspot");
            }
            syncedHotspots.push(h);
          }
        }
        setHotspots(syncedHotspots);
        setDeletedIds([]);
        if (onHotspotsSynced) {
          onHotspotsSynced(page.id, syncedHotspots);
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

  const HANDLES: Array<{ pos: ResizeHandle; cls: string }> = [
    { pos: "nw", cls: "-top-1.5 -left-1.5 cursor-nwse-resize" },
    { pos: "n", cls: "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
    { pos: "ne", cls: "-top-1.5 -right-1.5 cursor-nesw-resize" },
    { pos: "e", cls: "top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize" },
    { pos: "se", cls: "-bottom-1.5 -right-1.5 cursor-nwse-resize" },
    { pos: "s", cls: "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize" },
    { pos: "sw", cls: "-bottom-1.5 -left-1.5 cursor-nesw-resize" },
    { pos: "w", cls: "top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAF8F3] border border-[#016BB7]/30 rounded-xl overflow-hidden shadow-lg">
      {/* 1. Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[#016BB7] text-white gap-3 shrink-0">
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

        {/* Page Switcher + Canvas Zoom */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/10 rounded-lg px-1.5 py-0.5">
            <button
              type="button"
              disabled={canvasZoom <= 1}
              onClick={() => setCanvasZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
              className="p-1 rounded hover:bg-white/20 disabled:opacity-40 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] font-bold px-1 tabular-nums">{Math.round(canvasZoom * 100)}%</span>
            <button
              type="button"
              disabled={canvasZoom >= 2}
              onClick={() => setCanvasZoom((z) => Math.min(2, Number((z + 0.25).toFixed(2))))}
              className="p-1 rounded hover:bg-white/20 disabled:opacity-40 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page.pageNumber <= 1}
              onClick={() => onNavigatePage && onNavigatePage(page.pageNumber - 1)}
              className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold px-1.5">
              {page.pageNumber} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page.pageNumber >= totalPages}
              onClick={() => onNavigatePage && onNavigatePage(page.pageNumber + 1)}
              className="p-1 rounded bg-white/10 hover:bg-white/20 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>
              {isSaving
                ? isGu
                  ? "સાચવી રહ્યું છે..."
                  : "Saving..."
                : isGu
                ? "હોટસ્પોટ્સ સાચવો"
                : "Save Hotspots"}
            </span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Save alerts */}
      {saveSuccess && (
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shrink-0">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>
            {isGu
              ? "હોટસ્પોટ્સ અને સંપૂર્ણ લેખ ટેક્સ્ટ સફળતાપૂર્વક સાચવાયા!"
              : "Hotspots & full article text saved successfully!"}
          </span>
        </div>
      )}
      {errorMessage && (
        <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-800 text-xs flex items-center gap-2 shrink-0">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Main Work Area: Scrollable Canvas on Left, Scrollable Inspector on Right */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Visual Drawing Canvas */}
        <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-neutral-200/80">
          <div
            ref={containerRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="relative select-none shadow-xl border border-neutral-300 bg-white cursor-crosshair shrink-0"
            style={{
              aspectRatio: `${page.widthPx} / ${page.heightPx}`,
              width: `${Math.round(760 * canvasZoom)}px`,
            }}
          >
            {/* Real Uploaded Broadsheet Page Image (Full 3.0x HD for ALL pages 1..N) */}
            <img
              key={`hotspot-editor-page-${page.id}`}
              src={`/api/v1/epaper/pages/${page.id}/image?adminPreview=1&token=${encodeURIComponent(
                typeof window !== "undefined"
                  ? localStorage.getItem("janmabhoomi_staff_token") ||
                      localStorage.getItem("janmabhoomi_subscriber_token") ||
                      "dev-staff-preview"
                  : "dev-staff-preview"
              )}`}
              alt={`${page.labelEn} (Page ${page.pageNumber})`}
              draggable={false}
              className="w-full h-full object-contain block select-none pointer-events-none"
            />

            {/* Saved & Interactive Resizable Hotspot Boxes */}
            {hotspots.map((h, idx) => {
              const isSelected = selectedIdx === idx;
              return (
                <div
                  key={h.id || `new-${idx}`}
                  onMouseDown={(e) => startMoveBox(e, idx)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIdx(idx);
                  }}
                  className={`absolute rounded border-2 transition-colors ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/20 ring-2 ring-emerald-400/60 z-20 cursor-move"
                      : "border-[#016BB7] bg-[#016BB7]/15 hover:bg-[#016BB7]/25 z-10 cursor-pointer"
                  }`}
                  style={{
                    left: `${h.xPercent}%`,
                    top: `${h.yPercent}%`,
                    width: `${h.widthPercent}%`,
                    height: `${h.heightPercent}%`,
                  }}
                >
                  <span
                    className={`absolute top-1 left-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs pointer-events-none ${
                      isSelected ? "bg-emerald-600 text-white" : "bg-[#016BB7] text-white"
                    }`}
                  >
                    <Move className="h-2.5 w-2.5" />
                    <span>#{idx + 1}</span>
                  </span>

                  {/* 8 Image-Style Resize Handles (Corners + Edges) when selected */}
                  {isSelected &&
                    HANDLES.map((handle) => (
                      <div
                        key={handle.pos}
                        onMouseDown={(e) => startResizeBox(e, idx, handle.pos)}
                        className={`absolute w-3 h-3 bg-white border-2 border-emerald-600 rounded-xs shadow-sm z-30 ${handle.cls}`}
                      />
                    ))}
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

        {/* 3. Scrollable Hotspot Inspector & Long Article Text Sidebar */}
        <div className="w-full lg:w-96 shrink-0 bg-white border-t lg:border-t-0 lg:border-l border-neutral-200 p-4 flex flex-col space-y-4 overflow-y-auto max-h-[45vh] lg:max-h-full">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
              {isGu ? "હોટસ્પોટ યાદી" : "Hotspot List"} ({hotspots.length})
            </h4>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              {isGu
                ? "પાના પર બોક્સ દોરો, ખસેડો અથવા ખૂણા ખેંચીને ઇમેજની જેમ માપ બદલો. નીચે સંપૂર્ણ લેખ પેસ્ટ કરો."
                : "Draw a box on the page, drag to move it, or drag any corner/edge handle to resize it like an image."}
            </p>
          </div>

          {/* Quick Selection Pills */}
          <div className="flex flex-wrap gap-1.5">
            {hotspots.map((h, idx) => (
              <button
                key={h.id || idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
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
            <div className="space-y-3.5 pt-3 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#016BB7]">
                  {isGu ? `હોટસ્પોટ #${selectedIdx + 1} વિગતો` : `Hotspot #${selectedIdx + 1} Details`}
                </span>
                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{isGu ? "કાઢી નાખો" : "Delete"}</span>
                </button>
              </div>

              {/* Bilingual Toggle (Gujarati / English) + 1-Click Auto-Translate to English */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="inline-flex rounded-md bg-white border border-slate-200 p-0.5 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setEditorLangTab("gu")}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      editorLangTab === "gu"
                        ? "bg-[#016BB7] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ગુજરાતી (GU)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorLangTab("en")}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      editorLangTab === "en"
                        ? "bg-[#016BB7] text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    English (EN)
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isTranslating}
                  onClick={handleAutoTranslateToEnglish}
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer"
                  title="Auto-translate Gujarati headline, sub-headline, and article text to English"
                >
                  {isTranslating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Languages className="h-3 w-3" />
                  )}
                  <span>
                    {isTranslating
                      ? isGu
                        ? "અનુવાદ..."
                        : "Translating..."
                      : isGu
                      ? "અંગ્રેજીમાં અનુવાદ કરો"
                      : "Convert to English"}
                  </span>
                </button>
              </div>

              {editorLangTab === "gu" ? (
                <>
                  {/* Gujarati Headline */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isGu ? "લેખનું શીર્ષક / હેડલાઇન (ગુજરાતી)" : "Article Headline (Gujarati)"}
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.headlineText || ""}
                      onChange={(e) => handleUpdateSelected("headlineText", e.target.value)}
                      placeholder={isGu ? "દા.ત. ખ્રિસ્તીઓની વસ્તીમાં ઘટાડો..." : "Paste Gujarati headline..."}
                      className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-slate-900 focus:border-[#016BB7] focus:outline-none font-gujarati"
                    />
                  </div>

                  {/* Gujarati Optional Sub-Headline */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isGu ? "ઉપ-શીર્ષક / સબ-હેડલાઇન (વૈકલ્પિક)" : "Sub-Headline (Optional, Gujarati)"}
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.subHeadlineText || ""}
                      onChange={(e) => handleUpdateSelected("subHeadlineText", e.target.value)}
                      placeholder={
                        isGu
                          ? "દા.ત. લેખકનું નામ અથવા ટૂંકી ઉપ-હેડલાઇન..."
                          : "Optional deck / sub-headline or author byline..."
                      }
                      className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-slate-900 focus:border-[#016BB7] focus:outline-none font-gujarati"
                    />
                  </div>

                  {/* Gujarati Full Article Body Text */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isGu
                        ? "સંપૂર્ણ લેખનું લખાણ (ગુજરાતી વાંચન અને ઓડિયો માટે)"
                        : "Full Article Text (Gujarati Reading & Audio)"}
                    </label>
                    <textarea
                      rows={8}
                      value={selectedHotspot.bodyText || ""}
                      onChange={(e) => handleUpdateSelected("bodyText", e.target.value)}
                      placeholder={
                        isGu
                          ? "અહીં આખો ગુજરાતી લેખ પેસ્ટ કરો. ઓડિયો બટન આ સંપૂર્ણ લેખ વાંચશે..."
                          : "Paste the complete Gujarati article paragraphs here..."
                      }
                      className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-slate-900 focus:border-[#016BB7] focus:outline-none resize-y min-h-[140px] max-h-[380px] overflow-y-auto leading-relaxed font-gujarati"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {(selectedHotspot.bodyText || "").length}{" "}
                      {isGu ? "અક્ષરો • અંગ્રેજી માટે ઉપર 'અંગ્રેજીમાં અનુવાદ કરો' ક્લિક કરો." : "chars • Click 'Convert to English' above to auto-generate English audio & text."}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* English Headline */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isGu ? "અંગ્રેજી શીર્ષક (English Headline)" : "Article Headline (English)"}
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.headlineEn || ""}
                      onChange={(e) => handleUpdateSelected("headlineEn", e.target.value)}
                      placeholder="English headline (click 'Convert to English' to auto-fill)..."
                      className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-slate-900 focus:border-[#016BB7] focus:outline-none"
                    />
                  </div>

                  {/* English Optional Sub-Headline */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isGu ? "અંગ્રેજી ઉપ-શીર્ષક (વૈકલ્પિક)" : "Sub-Headline (Optional, English)"}
                    </label>
                    <input
                      type="text"
                      value={selectedHotspot.subHeadlineEn || ""}
                      onChange={(e) => handleUpdateSelected("subHeadlineEn", e.target.value)}
                      placeholder="Optional English sub-headline..."
                      className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-slate-900 focus:border-[#016BB7] focus:outline-none"
                    />
                  </div>

                  {/* English Full Article Body Text */}
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      {isGu
                        ? "સંપૂર્ણ અંગ્રેજી લેખ (English Audio Listen માટે)"
                        : "Full Article Text (For English Reading & English Audio Listen)"}
                    </label>
                    <textarea
                      rows={8}
                      value={selectedHotspot.bodyTextEn || ""}
                      onChange={(e) => handleUpdateSelected("bodyTextEn", e.target.value)}
                      placeholder="English translation appears here after clicking 'Convert to English'..."
                      className="w-full text-xs rounded-lg border border-neutral-300 px-3 py-2 text-slate-900 focus:border-[#016BB7] focus:outline-none resize-y min-h-[140px] max-h-[380px] overflow-y-auto leading-relaxed"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">
                      {(selectedHotspot.bodyTextEn || "").length}{" "}
                      {isGu ? "અક્ષરો • સેવ કર્યા પછી વાચકો અંગ્રેજીમાં પણ સાંભળી શકશે." : "chars • Once saved, readers can read & listen in English."}
                    </p>
                  </div>
                </>
              )}

              {/* Target Type */}
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                  {isGu ? "લિંક પ્રકાર" : "Target Type"}
                </label>
                <select
                  value={selectedHotspot.targetType}
                  onChange={(e) => handleUpdateSelected("targetType", e.target.value)}
                  className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-2 text-slate-900 focus:border-[#016BB7] focus:outline-none bg-white"
                >
                  <option value="article">{isGu ? "લેખ વાંચન અને ઓડિયો મોડ" : "Article Reading & Audio Mode"}</option>
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
                    className="w-full text-xs rounded-lg border border-neutral-300 px-2.5 py-1.5 text-slate-900 focus:border-[#016BB7] focus:outline-none"
                  />
                </div>
              )}

              {/* Coordinates Preview */}
              <div className="bg-neutral-50 rounded-lg p-2.5 text-[10px] space-y-1 text-neutral-600 border border-neutral-200">
                <p className="font-bold text-neutral-800">
                  {isGu ? "માપદંડ નિર્દેશાંક (ટકાવારી):" : "Box Position & Size (%):"}
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
                {isGu
                  ? "નવું બોક્સ દોરો અથવા સંપાદિત કરવા માટે બોક્સ પર ક્લિક કરો."
                  : "Draw a new box or click an existing box to move, resize, or add article text."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
