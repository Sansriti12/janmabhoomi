"use client";

import React from "react";
import { Clock, Database, ShieldCheck, ArrowLeft } from "lucide-react";

interface ModulePlaceholderProps {
  titleEn: string;
  titleGu: string;
  descriptionEn: string;
  descriptionGu: string;
  lang: string;
  adminOnly?: boolean;
}

export function ModulePlaceholder({
  titleEn,
  titleGu,
  descriptionEn,
  descriptionGu,
  lang,
  adminOnly = false,
}: ModulePlaceholderProps) {
  const isGu = lang === "gu";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#016BB7] border border-blue-200/60 uppercase tracking-wider">
              {isGu ? "ન્યૂઝરૂમ મોડ્યુલ" : "Newsroom Module"}
            </span>
            {adminOnly && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#016BB7] uppercase tracking-wider">
                Admin Only
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">
            {isGu ? titleGu : titleEn}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isGu ? descriptionGu : descriptionEn}
          </p>
        </div>

        <a
          href={`/${lang}/admin`}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
        >
          <ArrowLeft size={14} />
          <span>{isGu ? "ડેશબોર્ડ" : "Dashboard"}</span>
        </a>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-xs text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#016BB7] flex items-center justify-center mx-auto mb-4 border border-blue-200/60">
          <Clock size={32} />
        </div>

        <h3 className="text-lg font-bold text-slate-900 font-serif mb-2">
          {isGu ? `${titleGu} — ફેઝ ૫બીમાં નિર્ધારિત` : `${titleEn} — Scheduled for Phase 5B`}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
          {isGu
            ? "આ મોડ્યુલનો ડેટાબેઝ અને બેકએન્ડ API પાયો ફેઝ ૫એમાં સફળતાપૂર્વક ચકાસાયેલ છે. વિગતવાર યુઝર ઇન્ટરફેસ ફેઝ ૫બી રોડમેપમાં પૂર્ણ થશે."
            : "The database schema, Prisma ORM models, and backend Fastify endpoints for this module are active and verified. The complete dedicated newsroom management interface will be delivered in Phase 5B."}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Database size={14} className="text-emerald-600" />
            <span>PostgreSQL Database Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#016BB7]" />
            <span>Staff RBAC Enforced</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#016BB7]"></span>
            <span>Scoped to 2 Newspapers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
