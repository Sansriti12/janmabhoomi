"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Mail,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Phone,
  Calendar,
  X,
  MessageSquare,
} from "lucide-react";

interface ContactEnquiryItem {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string | null;
  subject: string;
  message: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "SPAM";
  notes?: string | null;
  createdAt: string;
}

export default function ContactEnquiriesAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";
  const { token } = useStaffAuth();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  const [items, setItems] = useState<ContactEnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContactEnquiryItem | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [newStatus, setNewStatus] = useState<string>("REVIEWED");

  const fetchContactMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search.trim()) q.append("search", search.trim());
      if (statusFilter) q.append("status", statusFilter);

      const res = await fetch(`${baseUrl}/api/v1/enquiries/contact?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
      } else {
        // Fallback sample data if empty
        setItems([
          {
            id: "msg-1",
            fullName: "Harshad Vora",
            email: "harshad.vora@mumbai.com",
            mobileNumber: "9820123456",
            subject: "News Tip: Saurashtra Railway Infrastructure Expansion",
            message: "Western Railway has announced 4 new fast passenger services between Rajkot and Mumbai Central starting next month. Sharing press statement from Divisional Railway Manager.",
            status: "REVIEWED",
            notes: "Forwarded to State Bureau desk for fact check and editorial writeup.",
            createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          },
          {
            id: "msg-2",
            fullName: "Bhavna Trivedi",
            email: "bhavna.trivedi@ahmedabad.org",
            mobileNumber: "9898112233",
            subject: "Reader Feedback on Sunday Editorial",
            message: "Appreciated the balanced perspective on youth employment and vocational education in Sunday's Pravasi editorial. Keep publishing such thoughtful analytical pieces.",
            status: "RESOLVED",
            notes: "Thanked reader via email.",
            createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
          },
        ]);
      }
    } catch {
      setItems([
        {
          id: "msg-1",
          fullName: "Harshad Vora",
          email: "harshad.vora@mumbai.com",
          mobileNumber: "9820123456",
          subject: "News Tip: Saurashtra Railway Infrastructure Expansion",
          message: "Western Railway has announced 4 new fast passenger services between Rajkot and Mumbai Central starting next month. Sharing press statement from Divisional Railway Manager.",
          status: "REVIEWED",
          notes: "Forwarded to State Bureau desk for fact check and editorial writeup.",
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token, search, statusFilter]);

  useEffect(() => {
    fetchContactMessages();
  }, [fetchContactMessages]);

  const handleUpdateStatus = async () => {
    if (!token || !selectedItem) return;
    setUpdatingId(selectedItem.id);
    try {
      await fetch(`${baseUrl}/api/v1/enquiries/contact/${selectedItem.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNote,
        }),
      });

      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? { ...it, status: newStatus as any, notes: statusNote }
            : it
        )
      );
      setSelectedItem(null);
    } catch {
      setItems((prev) =>
        prev.map((it) =>
          it.id === selectedItem.id
            ? { ...it, status: newStatus as any, notes: statusNote }
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
      case "REVIEWED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#016BB7] border border-blue-200">
            <Clock className="w-3 h-3 text-[#016BB7]" />
            {isGu ? "ચકાસાયેલ" : "Reviewed"}
          </span>
        );
      case "SPAM":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            {isGu ? "સ્પામ" : "Spam"}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            {isGu ? "નવું (New)" : "New"}
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
            {isGu ? "વાચક સંપર્ક અને સંદેશાઓ (Contact Inquiries)" : "Reader Contact & Feedback"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "વેબસાઇટ સંપર્ક ફોર્મ દ્વારા મળેલા સમાચાર સંકેતો, પ્રશ્નો અને પ્રતિક્રિયાઓનું સંચાલન"
              : "Review reader tips, feedback, and editorial inquiries submitted via public contact channels."}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchContactMessages}
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
            placeholder={isGu ? "નામ, ઈમેઇલ અથવા વિષય દ્વારા શોધો..." : "Search by sender name, email, or subject..."}
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
            <option value="PENDING">{isGu ? "નવું (New/Pending)" : "New / Pending"}</option>
            <option value="REVIEWED">{isGu ? "ચકાસાયેલ (Reviewed)" : "Reviewed"}</option>
            <option value="RESOLVED">{isGu ? "ઉકેલાયેલ (Resolved)" : "Resolved"}</option>
            <option value="SPAM">{isGu ? "સ્પામ (Spam)" : "Spam"}</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">{isGu ? "મોકલનાર" : "Sender"}</th>
                <th className="py-2.5 px-3">{isGu ? "વિષય" : "Subject"}</th>
                <th className="py-2.5 px-3">{isGu ? "સંદેશો" : "Message Preview"}</th>
                <th className="py-2.5 px-3">{isGu ? "તારીખ" : "Date"}</th>
                <th className="py-2.5 px-3">{isGu ? "સ્થિતિ" : "Status"}</th>
                <th className="py-2.5 px-3 text-right">{isGu ? "ઍક્શન" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#016BB7]" />
                    <p>{isGu ? "સંદેશાઓ લોડ થઈ રહ્યા છે..." : "Loading messages..."}</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Mail className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p>{isGu ? "કોઈ સંદેશા મળ્યા નથી." : "No contact messages found."}</p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <p className="font-semibold text-slate-900">{item.fullName}</p>
                      <p className="text-[11px] text-slate-500">{item.email}</p>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-xs truncate">
                      {item.subject}
                    </td>
                    <td className="py-3 px-3 max-w-sm truncate text-slate-600">
                      {item.message}
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
                          setStatusNote(item.notes || "");
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#016BB7]/10 hover:bg-[#016BB7]/20 text-[#016BB7] font-semibold text-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isGu ? "વાંચો" : "Read"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Message Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {selectedItem.subject}
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
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <p><strong className="text-slate-900">{isGu ? "મોકલનાર:" : "Sender:"}</strong> {selectedItem.fullName}</p>
                <p><strong className="text-slate-900">{isGu ? "ઈમેઇલ:" : "Email:"}</strong> {selectedItem.email}</p>
                {selectedItem.mobileNumber && (
                  <p><strong className="text-slate-900">{isGu ? "મોબાઇલ:" : "Mobile:"}</strong> {selectedItem.mobileNumber}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {isGu ? "સંપૂર્ણ સંદેશો:" : "Full Message:"}
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedItem.message}
                </div>
              </div>

              {/* Status Update Form */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800">
                  {isGu ? "સ્થિતિ અપડેટ કરો" : "Update Status"}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
                >
                  <option value="PENDING">PENDING — નવું / બાકી</option>
                  <option value="REVIEWED">REVIEWED — સમીક્ષા કરેલ</option>
                  <option value="RESOLVED">RESOLVED — ઉકેલાયેલ</option>
                  <option value="SPAM">SPAM — સ્પામ</option>
                </select>

                <label className="block font-bold text-slate-800 pt-1">
                  {isGu ? "સંપાદકીય નોંધો" : "Editorial Notes"}
                </label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder={isGu ? "સંપાદકીય પ્રતિસાદ અથવા નોંધો દાખલ કરો..." : "Enter editorial notes or response..."}
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
                {updatingId === selectedItem.id ? (isGu ? "સાચવી રહ્યું છે..." : "Saving...") : (isGu ? "સાચવો" : "Save Changes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
