"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  Building2,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface SubscriberItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  publicationId: string;
  publicationName: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  amountPaid: number;
}

// Data matching Screenshot media_1794810030671_01d78d76.jpg
const PUBLICATION_ACTIVE_COUNTS = [
  { name: "Janmabhoomi", nameGu: "જન્મભૂમિ (દૈનિક)", count: 82, code: "JB" },
  { name: "Vyapar Gujarati", nameGu: "વ્યાપાર ગુજરાતી", count: 128, code: "VG" },
  { name: "Vyapar Hindi", nameGu: "વ્યાપાર હિન્દી", count: 50, code: "VH" },
  { name: "Phulchhab", nameGu: "ફૂલછાબ", count: 72, code: "PC" },
  { name: "Kutchmitra", nameGu: "કચ્છમિત્ર", count: 1176, code: "KM" },
];

const SAMPLE_SUBSCRIBERS: SubscriberItem[] = [
  { id: "sub-101", name: "Bhupendra K. Vora", email: "vora.bhupendra@gmail.com", phone: "+91 98201 12345", publicationId: "pub-janmabhoomi", publicationName: "Janmabhoomi", planName: "Annual Digital + E-Paper", startDate: "2026-01-15", endDate: "2027-01-14", status: "ACTIVE", amountPaid: 1499 },
  { id: "sub-102", name: "Dinesh C. Shah", email: "dcshah.mumbai@yahoo.com", phone: "+91 98190 54321", publicationId: "pub-pravasi", publicationName: "Janmabhoomi Pravasi", planName: "Annual Print + E-Paper", startDate: "2025-11-01", endDate: "2026-10-31", status: "ACTIVE", amountPaid: 1800 },
  { id: "sub-103", name: "Kirit Govindlal Patel", email: "kiritpatel.ahd@gmail.com", phone: "+91 98980 98765", publicationId: "pub-janmabhoomi", publicationName: "Janmabhoomi", planName: "Half-Yearly E-Paper", startDate: "2026-03-01", endDate: "2026-08-31", status: "ACTIVE", amountPaid: 799 },
  { id: "sub-104", name: "Rameshchandra Mehta", email: "rcmehta@rediffmail.com", phone: "+91 94260 11223", publicationId: "pub-janmabhoomi", publicationName: "Janmabhoomi", planName: "Quarterly Access", startDate: "2026-04-10", endDate: "2026-07-09", status: "ACTIVE", amountPaid: 450 },
  { id: "sub-105", name: "Kantilal G. Sanghavi", email: "sanghavikg@gmail.com", phone: "+91 93222 44556", publicationId: "pub-pravasi", publicationName: "Janmabhoomi Pravasi", planName: "Annual Digital + E-Paper", startDate: "2025-08-15", endDate: "2026-08-14", status: "ACTIVE", amountPaid: 1499 },
  { id: "sub-106", name: "Hasmukhbhai Zaveri", email: "hzaveri.jewels@gmail.com", phone: "+91 98210 77889", publicationId: "pub-janmabhoomi", publicationName: "Janmabhoomi", planName: "Lifetime Patron", startDate: "2024-01-01", endDate: "2034-01-01", status: "ACTIVE", amountPaid: 15000 },
];

export default function SubscribersAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";
  const { user } = useStaffAuth();

  const [activeTab, setActiveTab] = useState<"count" | "directory">("count");
  const [selectedPublication, setSelectedPublication] = useState("all");
  const [startDate, setStartDate] = useState("01-11-2026");
  const [endDate, setEndDate] = useState("16-11-2026");
  const [queryResultCount, setQueryResultCount] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const handleGetCount = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPublication === "all") {
      setQueryResultCount(PUBLICATION_ACTIVE_COUNTS.reduce((acc, p) => acc + p.count, 0));
    } else {
      const match = PUBLICATION_ACTIVE_COUNTS.find(
        (p) => p.name.toLowerCase() === selectedPublication.toLowerCase()
      );
      setQueryResultCount(match ? match.count : 82);
    }
  };

  const filteredSubs = SAMPLE_SUBSCRIBERS.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.publicationName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {isGu ? "સબ્સ્ક્રાઇબર કાઉન્ટ અને ડિરેક્ટરી" : "Subscriber Count & Directory"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "અખબારવાર સક્રિય વાંચકોની સંખ્યા અને સબ્સ્ક્રિપ્શન પ્લાન સંચાલન"
              : "Active subscriber counts, date queries, and subscriber management across publications."}
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-md self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("count")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "count"
                ? "bg-white text-[#016BB7] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isGu ? "સબ્સ્ક્રાઇબર કાઉન્ટ (Count)" : "Active Counts"}
          </button>
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "directory"
                ? "bg-white text-[#016BB7] shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isGu ? "સબ્સ્ક્રાઇબર ડિરેક્ટરી" : "Subscriber Accounts"}
          </button>
        </div>
      </div>

      {activeTab === "count" ? (
        /* Tab 1: Exact layout matching Screenshot media_1794810030671_01d78d76.jpg */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Active Subscribers Count Card */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs self-start">
            <h3 className="text-sm font-bold text-slate-900 font-serif mb-3.5 border-b border-slate-100 pb-2">
              {isGu ? "સક્રિય સબ્સ્ક્રાઇબર્સની સંખ્યા (Active Subscribers Count)" : "Active Subscribers Count"}
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-800">
              {PUBLICATION_ACTIVE_COUNTS.map((pub) => (
                <li key={pub.name} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#016BB7]"></span>
                    <span className="font-semibold text-slate-900">{pub.name}</span>
                    <span className="text-[11px] text-slate-500">({pub.nameGu})</span>
                  </div>
                  <span className="font-bold font-mono text-[#016BB7] text-sm">
                    {pub.count.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
              <span>{isGu ? "કુલ સક્રિય સબ્સ્ક્રાઇબર્સ:" : "Total Active Readers:"}</span>
              <span className="text-emerald-700 font-mono text-base">
                {PUBLICATION_ACTIVE_COUNTS.reduce((acc, p) => acc + p.count, 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Date Query Form matching Screenshot */}
          <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 font-serif mb-3.5 border-b border-slate-100 pb-2">
              {isGu ? "તારીખ અનુસાર સબ્સ્ક્રાઇબર કાઉન્ટ તપાસો" : "Query Subscribers By Date & Publication"}
            </h3>

            <form onSubmit={handleGetCount} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Publication *
                </label>
                <select
                  value={selectedPublication}
                  onChange={(e) => setSelectedPublication(e.target.value)}
                  className="w-full max-w-md px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
                >
                  <option value="all">{isGu ? "તમામ પ્રકાશનો (All Publications)" : "All Publications"}</option>
                  <option value="Janmabhoomi">Janmabhoomi (જન્મભૂમિ દૈનિક)</option>
                  <option value="Vyapar Gujarati">Vyapar Gujarati (વ્યાપાર ગુજરાતી)</option>
                  <option value="Vyapar Hindi">Vyapar Hindi (વ્યાપાર હિન્દી)</option>
                  <option value="Phulchhab">Phulchhab (ફૂલછાબ)</option>
                  <option value="Kutchmitra">Kutchmitra (કચ્છમિત્ર)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Start Date *
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select End Date *
                  </label>
                  <input
                    type="text"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="DD-MM-YYYY"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] focus:outline-none bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded text-xs font-semibold bg-[#016BB7] text-white hover:bg-[#015896] shadow-2xs transition-colors cursor-pointer"
                >
                  {isGu ? "ગણતરી મેળવો (Get Count)" : "Get Count"}
                </button>
              </div>
            </form>

            {queryResultCount !== null && (
              <div className="mt-5 p-4 rounded bg-blue-50/70 border border-blue-200/80 text-xs">
                <span className="text-slate-600 block">
                  {selectedPublication === "all" ? "All Trust Publications" : selectedPublication} Active Subscribers ({startDate} to {endDate}):
                </span>
                <span className="text-2xl font-bold font-mono text-[#016BB7] mt-1 block">
                  {queryResultCount.toLocaleString()} Subscribers
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Subscriber Accounts Table (Section 10) */
        <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative max-w-sm w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={isGu ? "નામ, ઇમેઇલ અથવા ફોન શોધો..." : "Search subscriber name, email or phone..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#016BB7] bg-white text-slate-900"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredSubs.length} active subscriber records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Subscriber</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">Publication</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      <div>{s.email}</div>
                      <div className="text-[10px] text-slate-400">{s.phone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium">{s.publicationName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.planName}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{s.startDate}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{s.endDate}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}