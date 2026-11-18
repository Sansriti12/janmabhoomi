"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Plus,
  Edit,
  Clock,
  Eye,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface EditorialRecord {
  id: string;
  titleGu: string;
  titleEn: string;
  author: string;
  publicationName: string;
  date: string;
  isToday: boolean;
  status: "PUBLISHED" | "DRAFT";
}

const SAMPLE_EDITORIALS: EditorialRecord[] = [
  {
    id: "ed-1",
    titleGu: "સૌરાષ્ટ્ર ટ્રસ્ટની પત્રકારત્વ પરંપરા: સત્ય, ન્યાય અને જનસેવાની અવિરત યાત્રા",
    titleEn: "The Journalism Heritage of Saurashtra Trust: An Unbroken Journey of Truth and Public Service",
    author: "તંત્રી મંડળ (Editorial Board)",
    publicationName: "Janmabhoomi",
    date: "16-11-2026",
    isToday: true,
    status: "PUBLISHED",
  },
  {
    id: "ed-2",
    titleGu: "દેશના અર્થતંત્રમાં ગ્રામીણ જળ સંરક્ષણ યોજનાનું દીર્ઘકાલીન મહત્વ",
    titleEn: "The Long-Term Significance of the National Rural Water Mission in India's Economy",
    author: "સંપાદકીય લેખક (Staff Editorial)",
    publicationName: "Janmabhoomi",
    date: "15-11-2026",
    isToday: false,
    status: "PUBLISHED",
  },
  {
    id: "ed-3",
    titleGu: "મુંબઈના વાણિજ્યિક ક્ષેત્ર અને દરિયાકાંઠાના માળખાગત પ્રોજેક્ટ્સની ગતિ",
    titleEn: "Momentum in Mumbai's Commercial Sphere and Coastal Infrastructure Projects",
    author: "તંત્રી મંડળ (Editorial Board)",
    publicationName: "Janmabhoomi Pravasi",
    date: "14-11-2026",
    isToday: false,
    status: "PUBLISHED",
  },
];

export default function EditorialsAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {isGu ? "દૈનિક અગ્રલેખો (Daily Editorials)" : "Daily Editorials"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "જન્મભૂમિ અને પ્રવાસી અખબારના મુખ્ય સંપાદકીય અગ્રલેખોનું સંચાલન"
              : "Lead editorial columns, opinions, and Chief Editor pieces across publications."}
          </p>
        </div>

        <a
          href={`/${lang}/admin/articles/new`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#016BB7] hover:bg-[#015896] text-white font-semibold text-xs shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isGu ? "નવો અગ્રલેખ લખો" : "New Editorial"}</span>
        </a>
      </div>

      {/* Today's Lead Editorial Highlight */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            {isGu ? "આજનો મુખ્ય અગ્રલેખ" : "Today's Lead Editorial"}
          </span>
          <span className="text-xs text-slate-400 font-mono">16 Nov 2026</span>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif leading-snug">
          {SAMPLE_EDITORIALS[0].titleGu}
        </h2>
        <p className="text-xs text-slate-600 italic mt-1 font-serif">
          {SAMPLE_EDITORIALS[0].titleEn}
        </p>

        <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span className="font-medium text-slate-700">{SAMPLE_EDITORIALS[0].author} • Janmabhoomi</span>
          <a
            href={`/${lang}/editorial`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#016BB7] font-semibold hover:underline flex items-center gap-1"
          >
            <span>{isGu ? "વેબસાઇટ પર જુઓ" : "View Live on Website"}</span>
            <Eye size={13} />
          </a>
        </div>
      </div>

      {/* Editorials Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-800">
          {isGu ? "તાજેતરના અગ્રલેખો (Recent Editorials Archive)" : "Recent Editorials Archive"}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-4">Editorial Headline</th>
                <th className="py-2.5 px-3">Publication</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SAMPLE_EDITORIALS.map((ed) => (
                <tr key={ed.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{ed.date}</td>
                  <td className="py-2.5 px-4 max-w-md">
                    <p className="font-semibold text-slate-900 line-clamp-1">{ed.titleGu}</p>
                    <p className="text-[11px] text-slate-500 italic line-clamp-1">{ed.titleEn}</p>
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">{ed.publicationName}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{ed.author}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ed.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <a
                      href={`/${lang}/editorial`}
                      className="text-[#016BB7] hover:underline font-semibold"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}