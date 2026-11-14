"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Newspaper,
  FileText,
  Users,
  CreditCard,
  Archive,
  Mail,
  Building2,
  TrendingUp,
  Shield,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  BookOpen,
  Sparkles,
} from "lucide-react";

interface DashboardStats {
  role: "Admin" | "Editor";
  permittedPublications: string[];
  publicationsCount: number;
  content: {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    scheduledArticles?: number;
    totalEditions: number;
    byPublication?: {
      janmabhoomi: number;
      pravasi: number;
    };
    byCategory?: Array<{ categoryId: string; count: number }>;
    translation?: {
      completed: number;
      failed: number;
      needsAttention: number;
    };
    recentPublishedArticles?: Array<{
      id: string;
      publicationId: string;
      publicationName: string;
      category: string;
      headlineGu: string;
      headlineEn: string | null;
      publishedAt: string | null;
    }>;
  };
  enquiries: {
    archiveEnquiriesCount: number;
    contactEnquiriesCount: number;
  } | null;
  financial: {
    totalSubscribers: number;
    activeSubscriptions: number;
    totalRevenueInr: number;
    totalTransactions: number;
  } | null;
}

export default function AdminDashboardPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const { user, token } = useStaffAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedPublication, setSelectedPublication] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  const fetchStats = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const url = selectedPublication && selectedPublication !== "all"
        ? `${baseUrl}/api/v1/admin/dashboard/stats?publicationId=${selectedPublication}`
        : `${baseUrl}/api/v1/admin/dashboard/stats`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load stats: HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      } else {
        throw new Error(json.error?.message || "Invalid stats response");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token, selectedPublication]);

  const isAdmin = user?.role === "Admin";

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#016BB7] border border-blue-200/60 uppercase tracking-wider">
              {isGu ? "ન્યૂઝરૂમ પોર્ટલ" : "Newsroom Portal"}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-blue-100 text-[#016BB7]">
              Admin
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            {isGu ? "ન્યૂઝરૂમ ડેશબોર્ડ" : "Newsroom Dashboard"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isGu
              ? "સમાચાર લેખો, સંપાદકીય સામગ્રી અને ઇ-પેપર કામગીરીનું સંચાલન કરો."
              : "Manage news articles, editorial content and E-paper operations."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Publication Filter Selector */}
          <div className="relative">
            <select
              value={selectedPublication}
              onChange={(e) => setSelectedPublication(e.target.value)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#016BB7] cursor-pointer"
            >
              <option value="all">{isGu ? "બધા અખબારો (સંપૂર્ણ સ્કોપ)" : "All Newspapers (Both)"}</option>
              <option value="pub-janmabhoomi">Janmabhoomi (જન્મભૂમિ)</option>
              <option value="pub-pravasi">Janmabhoomi Pravasi (પ્રવાસી)</option>
            </select>
          </div>

          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>{isGu ? "તાજું કરો" : "Refresh Metrics"}</span>
          </button>
          <a
            href={`/${lang}/admin/articles/new`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#016BB7] hover:bg-[#015593] rounded-xl shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>{isGu ? "નવો લેખ" : "New Article"}</span>
          </a>
          <a
            href={`/${lang}/admin/epaper`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Newspaper size={15} />
            <span>{isGu ? "ઇ-પેપર" : "E-Paper"}</span>
          </a>
        </div>
      </div>

      {/* Operational Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Articles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isGu ? "કુલ લેખો" : "Total Articles"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#016BB7] flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
            {stats?.content.totalArticles ?? "—"}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isGu ? "ન્યૂઝરૂમમાં નોંધાયેલ" : "Across newsroom"}
          </p>
        </div>

        {/* Metric 2: Published Articles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isGu ? "પ્રકાશિત લેખો" : "Published"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-serif">
            {stats?.content.publishedArticles ?? "—"}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isGu ? "વેબસાઇટ પર લાઇવ" : "Live on websites"}
          </p>
        </div>

        {/* Metric 3: Draft Articles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isGu ? "ડ્રાફ્ટ લેખો" : "Drafts"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-serif">
            {stats?.content.draftArticles ?? "—"}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isGu ? "સંપાદન હેઠળ" : "Pending review"}
          </p>
        </div>

        {/* Metric 4: Scheduled Articles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isGu ? "શેડ્યૂલ લેખો" : "Scheduled"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-700 font-serif">
            {stats?.content.scheduledArticles ?? 0}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isGu ? "નિયત સમય માટે" : "Timed publication"}
          </p>
        </div>

        {/* Metric 5: E-Paper Editions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isGu ? "ઇ-પેપર આવૃત્તિઓ" : "E-Paper Editions"}
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Newspaper size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-700 font-serif">
            {stats?.content.totalEditions ?? "—"}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isGu ? "કુલ પ્રકાશિત અંકો" : "Archived editions"}
          </p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              {isGu ? "તાજેતરની પ્રવૃત્તિ (સમાચાર લેખો)" : "Recent Activity"}
            </h3>
            <p className="text-xs text-slate-500">
              {isGu
                ? "તાજેતરમાં પ્રકાશિત થયેલ અને સંપાદિત સમાચાર લેખો"
                : "Latest newsroom publications and editorial updates"}
            </p>
          </div>
          <a
            href={`/${lang}/admin/articles`}
            className="text-xs font-semibold text-[#016BB7] hover:underline flex items-center gap-1"
          >
            <span>{isGu ? "બધા લેખો જુઓ" : "View All Articles"}</span>
            <ArrowUpRight size={14} />
          </a>
        </div>

        {stats?.content.recentPublishedArticles && stats.content.recentPublishedArticles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">{isGu ? "શીર્ષક" : "Headline"}</th>
                  <th className="py-2.5 px-3">{isGu ? "અખબાર" : "Publication"}</th>
                  <th className="py-2.5 px-3">{isGu ? "કેટેગરી" : "Category"}</th>
                  <th className="py-2.5 px-3">{isGu ? "તારીખ" : "Date"}</th>
                  <th className="py-2.5 px-3 text-right">{isGu ? "ઍક્શન" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.content.recentPublishedArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 max-w-sm">
                      <p className="font-semibold text-slate-900 line-clamp-1">{art.headlineGu}</p>
                      {art.headlineEn && (
                        <p className="text-slate-500 text-[11px] line-clamp-1 italic mt-0.5">
                          {art.headlineEn}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                      {art.publicationId === "pub-janmabhoomi" ? "Janmabhoomi" : "Pravasi"}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {art.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <a
                        href={`/${lang}/admin/articles/${art.id}`}
                        className="text-[#016BB7] font-semibold hover:underline"
                      >
                        {isGu ? "સંપાદિત કરો" : "Edit"}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            <FileText size={28} className="mx-auto mb-2 text-slate-300" />
            <p>{isGu ? "હજુ સુધી કોઈ તાજેતરના લેખો ઉપલબ્ધ નથી." : "No recent articles published yet."}</p>
            <a
              href={`/${lang}/admin/articles/new`}
              className="mt-2.5 inline-flex items-center gap-1 text-xs text-[#016BB7] font-semibold hover:underline"
            >
              <Plus size={13} />
              <span>{isGu ? "પ્રથમ લેખ બનાવો" : "Create an article"}</span>
            </a>
          </div>
        )}
      </div>



      {/* Quick Navigation Cards */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          {isGu ? "ઝડપી ક્રિયાઓ અને શૉર્ટકટ્સ" : "Quick Actions & Newsroom Desks"}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href={`/${lang}/admin/articles`}
            className="p-4 rounded-xl border border-slate-200 hover:border-[#016BB7] hover:bg-blue-50/20 transition-all flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                {isGu ? "સમાચાર લેખો" : "News Articles Desk"}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isGu ? "નવા સમાચાર લખો, આપમેળે અનુવાદ કરો અને પ્રકાશિત કરો" : "Draft Gujarati stories, auto-translate, and publish."}
              </p>
            </div>
          </a>

          <a
            href={`/${lang}/admin/media`}
            className="p-4 rounded-xl border border-slate-200 hover:border-[#016BB7] hover:bg-blue-50/20 transition-all flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Sparkles size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700">
                {isGu ? "મીડિયા લાઇબ્રેરી" : "Media Library"}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isGu ? "અખબારની છબીઓ અને ફોટોગ્રાફી અપલોડ કરો" : "Upload photography, captions, and manage featured assets."}
              </p>
            </div>
          </a>

          {isAdmin && (
            <a
              href={`/${lang}/admin/categories`}
              className="p-4 rounded-xl border border-slate-200 hover:border-[#016BB7] hover:bg-blue-50/20 transition-all flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <BookOpen size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700">
                  {isGu ? "કેટેગરીઝ" : "Taxonomy & Categories"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isGu ? "અખબારના વિભાગો અને ક્રમનું સંચાલન કરો" : "Manage newspaper sections, display orders, and slugs."}
                </p>
              </div>
            </a>
          )}

          <a
            href={`/${lang}/admin/epaper`}
            className="p-4 rounded-xl border border-slate-200 hover:border-[#016BB7] hover:bg-blue-50/20 transition-all flex items-start gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#016BB7] group-hover:bg-[#016BB7] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Newspaper size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#016BB7]">
                {isGu ? "ઇ-પેપર મેનેજમેન્ટ" : "E-Paper Editions"}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {isGu ? "પીડીએફ અપલોડ કરો અને હોટસ્પોટ્સ સંપાદિત કરો" : "Upload PDFs, process broadsheet pages, and link hotspots."}
              </p>
            </div>
          </a>

          {isAdmin && (
            <a
              href={`/${lang}/admin/enquiries/archive`}
              className="p-4 rounded-xl border border-slate-200 hover:border-[#016BB7] hover:bg-blue-50/20 transition-all flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <Archive size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700">
                  {isGu ? "આર્કાઇવ પૂછપરછ" : "Archive Enquiries"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isGu ? "વાંચકોની જૂની આવૃત્તિની પૂછપરછનું સંચાલન કરો" : "Review reader requests for vintage historical editions."}
                </p>
              </div>
            </a>
          )}

          {isAdmin && (
            <a
              href={`/${lang}/admin/staff`}
              className="p-4 rounded-xl border border-slate-200 hover:border-[#016BB7] hover:bg-blue-50/20 transition-all flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                <Shield size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700">
                  {isGu ? "સ્ટાફ એકાઉન્ટ્સ" : "Staff Management"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isGu ? "નવા સ્ટાફ બનાવો અને એડમિન/એડિટર ભૂમિકાઓ સોંપો" : "Create staff, toggle status, and assign Admin or Editor roles."}
                </p>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
