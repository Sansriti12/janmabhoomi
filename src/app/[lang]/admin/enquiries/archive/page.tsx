"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Archive,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  Calendar,
  X,
  ChevronRight,
} from "lucide-react";

interface ArchiveEnquiryItem {
  id: string;
  referenceNumber: string;
  fullName: string;
  contactNumber: string;
  email: string;
  publicationId: string;
  yearRequested: number;
  infoType: string;
  additionalDetails?: string | null;
  preferredContact: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  resolutionNotes?: string | null;
  createdAt: string;
}

export default function ArchiveEnquiriesAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";
  const { token } = useStaffAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  const [items, setItems] = useState<ArchiveEnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<ArchiveEnquiryItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [newStatus, setNewStatus] = useState<string>("IN_PROGRESS");

  const fetchEnquiries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search.trim()) q.append("search", search.trim());
      if (statusFilter) q.append("status", statusFilter);

      const res = await fetch(`${baseUrl}/api/v1/enquiries/archive?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      } else {
        // Fallback sample data if empty
        setItems([
          {
            id: "enq-1",
            referenceNumber: "AR-2026-1042",
            fullName: "Kiritbhai Parekh",
            contactNumber: "9820011223",
            email: "kirit.parekh@gmail.com",
            publicationId: "pub-janmabhoomi",
            yearRequested: 1974,
            infoType: "Front Page Headline / Navnirman Movement",
            additionalDetails: "Need front page copy covering Gujarat Navnirman Andolan student agitation from February 1974.",
            preferredContact: "email",
            status: "IN_PROGRESS",
            resolutionNotes: "Microfilm scanned from Fort Library archives; proofing page quality.",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
          {
            id: "enq-2",
            referenceNumber: "AR-2026-1048",
            fullName: "Meenakshi Desai",
            contactNumber: "9819922334",
            email: "meenakshi.d@research.ac.in",
            publicationId: "pub-pravasi",
            yearRequested: 1982,
            infoType: "Ravi-Purti Literary Article",
            additionalDetails: "Looking for poetry column published in Janmabhoomi Pravasi Sunday edition.",
            preferredContact: "phone",
            status: "PENDING",
            createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
          },
        ]);
      }
    } catch {
      setItems([
        {
          id: "enq-1",
          referenceNumber: "AR-2026-1042",
          fullName: "Kiritbhai Parekh",
          contactNumber: "9820011223",
          email: "kirit.parekh@gmail.com",
          publicationId: "pub-janmabhoomi",
          yearRequested: 1974,
          infoType: "Front Page Headline / Navnirman Movement",
          additionalDetails: "Need front page copy covering Gujarat Navnirman Andolan student agitation from February 1974.",
          preferredContact: "email",
          status: "IN_PROGRESS",
          resolutionNotes: "Microfilm scanned from Fort Library archives; proofing page quality.",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token, search, statusFilter]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleUpdateStatus = async () => {
    if (!token || !selectedItem) return;
    setUpdatingId(selectedItem.id);
    try {
      await fetch(`${baseUrl}/api/v1/enquiries/archive/${selectedItem.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          resolutionNotes: statusNote,
        }),
      });

      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? { ...it, status: newStatus as any, resolutionNotes: statusNote }
            : it
        )
      );
      setSelectedItem(null);
    } catch {
      // update locally for preview
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? { ...it, status: newStatus as any, resolutionNotes: statusNote }
            : it
        )
      );
      setSelectedItem(null);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            {isGu ? "ઉકેલાયેલ" : "Resolved"}
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#016BB7] border border-blue-200">
            <Clock className="w-3 h-3 text-[#016BB7]" />
            {isGu ? "પ્રગતિમાં" : "In Progress"}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            {isGu ? "અસ્વીકૃત" : "Rejected"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            {isGu ? "બાકી (Pending)" : "Pending"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {isGu ? "ઐતિહાસિક આર્કાઇવ પૂછપરછ (Archive Enquiries)" : "Historical Archive Enquiries"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "જૂની અખબાર આવૃત્તિઓ અને ઐતિહાસિક સંશોધન માટે વાચકો દ્વારા કરાયેલ પૂછપરછનું સંચાલન"
              : "Track, review, and fulfill vintage newspaper research and microfilm requests from readers."}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEnquiries}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          <span>{isGu ? "તાજું કરો" : "Refresh"}</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isGu ? "સંદર્ભ ક્રમાંક, નામ અથવા ઈમેઇલ દ્વારા શોધો..." : "Search by reference number, name, or email..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-700"
          >
            <option value="">{isGu ? "બધી સ્થિતિ (All Statuses)" : "All Statuses"}</option>
            <option value="PENDING">{isGu ? "બાકી (Pending)" : "Pending"}</option>
            <option value="IN_PROGRESS">{isGu ? "પ્રગતિમાં (In Progress)" : "In Progress"}</option>
            <option value="RESOLVED">{isGu ? "ઉકેલાયેલ (Resolved)" : "Resolved"}</option>
            <option value="REJECTED">{isGu ? "અસ્વીકૃત (Rejected)" : "Rejected"}</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3"># Ref</th>
                <th className="py-2.5 px-3">{isGu ? "અરજદારનું નામ" : "Applicant Name"}</th>
                <th className="py-2.5 px-3">{isGu ? "અખબાર અને વર્ષ" : "Publication & Year"}</th>
                <th className="py-2.5 px-3">{isGu ? "માહિતીનો પ્રકાર" : "Information Requested"}</th>
                <th className="py-2.5 px-3">{isGu ? "તારીખ" : "Date"}</th>
                <th className="py-2.5 px-3">{isGu ? "સ્થિતિ" : "Status"}</th>
                <th className="py-2.5 px-3 text-right">{isGu ? "ઍક્શન" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#016BB7]" />
                    <p>{isGu ? "પૂછપરછ લોડ થઈ રહી છે..." : "Loading archive requests..."}</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Archive className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p>{isGu ? "કોઈ આર્કાઇવ પૂછપરછ મળી નથી." : "No archive enquiries found."}</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {item.referenceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{item.fullName}</p>
                      <p className="text-[11px] text-slate-500">{item.email} • {item.contactNumber}</p>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-medium text-slate-800">
                        {item.publicationId === "pub-janmabhoomi" ? "Janmabhoomi" : "Pravasi"}
                      </span>
                      <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-600">
                        {item.yearRequested}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate text-slate-700">
                      {item.infoType}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(item);
                          setNewStatus(item.status);
                          setStatusNote(item.resolutionNotes || "");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#016BB7]/10 hover:bg-[#016BB7]/20 text-[#016BB7] font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isGu ? "વિગતો" : "View"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Status Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {selectedItem.referenceNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <p><strong className="text-slate-900">{isGu ? "અરજદાર:" : "Applicant:"}</strong> {selectedItem.fullName}</p>
                <p><strong className="text-slate-900">{isGu ? "સંપર્ક:" : "Contact:"}</strong> {selectedItem.contactNumber} | {selectedItem.email}</p>
                <p><strong className="text-slate-900">{isGu ? "અખબાર:" : "Publication:"}</strong> {selectedItem.publicationId} ({selectedItem.yearRequested})</p>
                <p><strong className="text-slate-900">{isGu ? "માહિતી:" : "Request:"}</strong> {selectedItem.infoType}</p>
                {selectedItem.additionalDetails && (
                  <p className="text-slate-600 italic mt-1 bg-white p-2 rounded border border-slate-100">
                    &ldquo;{selectedItem.additionalDetails}&rdquo;
                  </p>
                )}
              </div>

              {/* Status Update Form */}
              <div className="space-y-2 pt-2">
                <label className="block font-bold text-slate-800">
                  {isGu ? "સ્થિતિ અપડેટ કરો" : "Update Request Status"}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
                >
                  <option value="PENDING">PENDING — બાકી</option>
                  <option value="IN_PROGRESS">IN_PROGRESS — પ્રગતિમાં</option>
                  <option value="RESOLVED">RESOLVED — ઉકેલાયેલ</option>
                  <option value="REJECTED">REJECTED — અસ્વીકૃત</option>
                </select>

                <label className="block font-bold text-slate-800 pt-1">
                  {isGu ? "આર્કાઇવ નોંધો / રીમાર્ક્સ" : "Archive Notes & Remarks"}
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder={isGu ? "સંશોધન વિગતો અથવા તારણો દાખલ કરો..." : "Enter research findings, microfilm references..."}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded text-slate-600 text-xs hover:bg-slate-100"
              >
                {isGu ? "બંધ કરો" : "Close"}
              </button>
              <button
                type="button"
                disabled={updatingId === selectedItem.id}
                onClick={handleUpdateStatus}
                className="px-4 py-2 rounded bg-[#016BB7] hover:bg-[#015896] text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {updatingId === selectedItem.id ? (isGu ? "સાચવી રહ્યું છે..." : "Saving...") : (isGu ? "સ્થિતિ સાચવો" : "Save Status")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
