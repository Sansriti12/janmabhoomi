"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  Layers,
  FileText,
  Newspaper,
  Archive,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  BookOpen,
} from "lucide-react";

interface PublicationDetail {
  id: string;
  code: string;
  slug: string;
  publicationType: string;
  nameEn: string;
  nameGu: string;
  taglineEn?: string;
  taglineGu?: string;
  frequencyEn: string;
  frequencyGu: string;
  establishedYear: number;
  primaryCity: string;
  websiteUrl: string;
  epaperUrl: string;
  status: "ACTIVE" | "PLANNED" | "ARCHIVED";
  _count?: {
    articles: number;
    epaperEditions: number;
    archiveEnquiries: number;
  };
}

export default function AdminPublicationsPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const { token } = useStaffAuth();
  const [publications, setPublications] = useState<PublicationDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  const fetchPublications = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/publications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load publications: HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPublications(json.data);
      } else {
        throw new Error(json.error?.message || "Invalid response format");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load publications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, [token]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#016BB7] border border-blue-200/60 uppercase tracking-wider">
              {isGu ? "સમાચારપત્ર સ્કોપ" : "Newspaper Scope"}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Strictly 2 Newspapers
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">
            {isGu ? "મંજૂર સમાચારપત્રોનું સંચાલન" : "Permitted Newspaper Scope"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isGu
              ? "આ પેનલ ફક્ત જન્મભૂમિ (દૈનિક) અને જન્મભૂમિ પ્રવાસી (સાપ્તાહિક રવિવારીય) નું સંચાલન કરે છે."
              : "This administrative console is strictly scoped to Janmabhoomi (Daily) and Janmabhoomi Pravasi (Sunday Weekly)."}
          </p>
        </div>

        <button
          onClick={fetchPublications}
          disabled={isLoading}
          className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Isolation Guarantee Banner */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 flex items-start gap-3">
        <Shield size={18} className="text-[#016BB7] shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-900">
            {isGu ? "કડક પ્રકાશન મર્યાદા સક્રિય (૨ સમાચારપત્રો)" : "Centralized Allowlist Enforced (2 Newspapers)"}
          </p>
          <p className="mt-0.5 text-slate-600 leading-relaxed">
            {isGu
              ? "અન્ય તમામ પ્રકાશનો (કચ્છમિત્ર, ફૂલછાબ, વ્યાપાર ગુજરાતી, વ્યાપાર હિન્દી, પંચાંગ, કવિતા) પોતાની સમર્પિત વેબસાઇટ્સ અને એડમિન પેનલ્સ ધરાવે છે અને આ કન્સોલમાંથી સંપૂર્ણપણે અલગ રાખવામાં આવ્યા છે."
              : "All other Saurashtra Trust titles (Kutchmitra, Phulchhab, Vyapar Gujarati, Vyapar Hindi, Panchang, Kavita) operate on their own dedicated platforms and are strictly rejected with HTTP 403 by this backend."}
          </p>
        </div>
      </div>

      {/* Publications Cards Grid */}
      {isLoading && publications.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 size={28} className="animate-spin mx-auto mb-2 text-[#016BB7]" />
          <span>Loading publications...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publications.map((pub) => {
            const isJanmabhoomi = pub.id === "pub-janmabhoomi";

            return (
              <div
                key={pub.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden hover:border-blue-300 transition-colors"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#016BB7] flex items-center justify-center font-bold text-lg font-serif">
                      {pub.code}
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        pub.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {pub.status}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 font-serif">
                    {pub.nameEn}
                  </h3>
                  <p className="text-sm font-semibold text-slate-600 mt-0.5">
                    {pub.nameGu}
                  </p>

                  {/* Historical Narrative */}
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100">
                    {isJanmabhoomi ? (
                      <p>
                        <strong>Established:</strong> 9 June 1934 by Founder <strong>Amrutlal Sheth</strong> under the Saurashtra Trust. Flagship Mumbai evening broadsheet featuring comprehensive regional, national, international, civic, and financial reportage.
                      </p>
                    ) : (
                      <p>
                        <strong>Historical Weekly:</strong> Introduced on <strong>22 October 1939</strong> as the weekly Sunday family broadsheet. Morning edition introduced in <strong>1979</strong>. On Sundays, morning and evening papers combine into a single comprehensive edition bundled with special supplements.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Database Type:</span>
                      <span className="font-semibold text-slate-800">{pub.publicationType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Frequency:</span>
                      <span className="font-semibold text-slate-800">{pub.frequencyEn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Historical Origin:</span>
                      <span className="font-semibold text-slate-800">{pub.establishedYear}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Primary Hub:</span>
                      <span className="font-semibold text-slate-800">{pub.primaryCity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">System ID:</span>
                      <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                        {pub.id}
                      </code>
                    </div>
                  </div>

                  {/* Related Counts */}
                  {pub._count && (
                    <div className="mt-5 grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <div className="text-base font-bold text-slate-900">
                          {pub._count.articles}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Articles</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50">
                        <div className="text-base font-bold text-slate-900">
                          {pub._count.epaperEditions}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Editions</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50">
                        <div className="text-base font-bold text-slate-900">
                          {pub._count.archiveEnquiries}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Enquiries</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`/${lang}/admin/epaper`}
                    className="text-xs font-semibold text-[#016BB7] hover:underline flex items-center gap-1"
                  >
                    <span>{isGu ? "ઇ-પેપર મેનેજ કરો" : "Manage E-Paper"}</span>
                    <ExternalLink size={13} />
                  </a>
                  <span className="text-[11px] text-slate-400 font-mono">
                    /{pub.slug}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Purti Supplement Architecture Deep Dive */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 uppercase tracking-wider">
                Supplement Model
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                Purti Architecture & Data Design
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">
              Understanding Purti (પૂર્તિ) in the Janmabhoomi Newspaper Architecture
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              In traditional Gujarati newspaper terminology, <strong>Purti (પૂર્તિ)</strong> signifies a special magazine-style supplement bundled directly with the core broadsheet edition. Purti is neither a separate legal newspaper nor an independent publication record. In the Janmabhoomi ecosystem, Purti supplements are especially celebrated as part of <strong>Janmabhoomi Pravasi&apos;s</strong> combined Sunday edition.
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-900 block font-serif">
                  Madhuvan (મધુવન)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Gujarati literature, short stories, serialized novels & poetry.
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-900 block font-serif">
                  Meghdhanush (મેઘધનુષ)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Cultural essays, Indian heritage, spirituality & arts.
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-900 block font-serif">
                  Madhurima (મધુરિમા)
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Family reading, health, lifestyle, book reviews & humor.
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Inherits parent newspaper publication & edition permissions</span>
              <span className="font-semibold text-slate-700">Additive E-Paper Page Classification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
