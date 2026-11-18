"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  Search,
} from "lucide-react";

interface NewsTypeItem {
  id: string;
  name: string;
  nameGu: string;
  slug: string;
  description?: string;
}

const INITIAL_NEWS_TYPES: NewsTypeItem[] = [
  { id: "nt-1", name: "Top Headlines", nameGu: "ટોપ હેડલાઇન્સ", slug: "top-headlines" },
  { id: "nt-2", name: "Breaking News", nameGu: "બ્રેકિંગ ન્યૂઝ", slug: "breaking-news" },
  { id: "nt-3", name: "Vyapar", nameGu: "વ્યાપાર", slug: "vyapar" },
  { id: "nt-4", name: "Sports", nameGu: "સ્પોર્ટ્સ", slug: "sports" },
  { id: "nt-5", name: "Bollywood", nameGu: "બોલિવૂડ", slug: "bollywood" },
  { id: "nt-6", name: "Editorial", nameGu: "સંપાદકીય / અગ્રલેખ", slug: "editorial" },
  { id: "nt-7", name: "Obituary", nameGu: "મરણ નોંધ", slug: "obituary" },
  { id: "nt-8", name: "Jain", nameGu: "જૈન સમાચાર", slug: "jain" },
  { id: "nt-9", name: "Hindu", nameGu: "હિન્દુ ધાર્મિક", slug: "hindu" },
  { id: "nt-10", name: "National News", nameGu: "રાષ્ટ્રીય સમાચાર", slug: "national-news" },
  { id: "nt-11", name: "City News", nameGu: "શહેર સમાચાર", slug: "city-news" },
  { id: "nt-12", name: "Muslim Maran", nameGu: "મુસ્લિમ મરણ", slug: "muslim-maran" },
  { id: "nt-13", name: "Delhi Darbar", nameGu: "દિલ્હી દરબાર", slug: "delhi-darbar" },
];

export default function NewsTypesAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const [newsTypes, setNewsTypes] = useState<NewsTypeItem[]>(INITIAL_NEWS_TYPES);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsTypeItem | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameGu, setNameGu] = useState("");

  const filteredTypes = newsTypes.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.nameGu.includes(search) ||
      t.slug.includes(search.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingItem(null);
    setNameEn("");
    setNameGu("");
    setModalOpen(true);
  };

  const openEditModal = (item: NewsTypeItem) => {
    setEditingItem(item);
    setNameEn(item.name);
    setNameGu(item.nameGu);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(isGu ? "શું તમે ખરેખર આ સમાચાર પ્રકાર કાઢી નાખવા માંગો છો?" : "Delete this news type?")) {
      setNewsTypes((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) return;

    if (editingItem) {
      setNewsTypes((prev) =>
        prev.map((t) =>
          t.id === editingItem.id ? { ...t, name: nameEn, nameGu: nameGu || nameEn } : t
        )
      );
    } else {
      const slug = nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newItem: NewsTypeItem = {
        id: `nt-${Date.now()}`,
        name: nameEn,
        nameGu: nameGu || nameEn,
        slug,
      };
      setNewsTypes((prev) => [...prev, newItem]);
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {isGu ? "સમાચાર પ્રકારો (Manage News Type)" : "Manage News Type"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "અખબારમાં આવરી લેવાતા વિવિધ કન્ટેન્ટ અને ન્યૂઝ પ્રકારોનું વર્ગીકરણ"
              : "Content taxonomy and specific reporting types across newsroom publications."}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#016BB7] hover:bg-[#015896] text-white font-semibold text-xs shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isGu ? "પ્રકાર ઉમેરો (Add News Type)" : "Add News Type"}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={isGu ? "સમાચાર પ્રકાર શોધો..." : "Search news type..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#016BB7] bg-white text-slate-900"
          />
        </div>
      </div>

      {/* Table matching Screenshot media_1794810030690_dc01f39b.jpg */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden max-w-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#016BB7] text-white font-semibold text-xs uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12 text-center">#</th>
                <th className="py-2.5 px-4">{isGu ? "પ્રકાર (Type)" : "Type"}</th>
                <th className="py-2.5 px-4 text-right">{isGu ? "ક્રિયાઓ (Actions)" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTypes.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-2.5 px-4 text-slate-900 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        ({item.nameGu})
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-[#016BB7] hover:underline font-semibold cursor-pointer"
                      >
                        {isGu ? "જુઓ | સંપાદિત" : "View | Edit"}
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        {isGu ? "કાઢી નાખો" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-5 shadow-xl relative border border-slate-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-bold text-slate-900 mb-3.5 font-serif">
              {editingItem
                ? isGu ? "સમાચાર પ્રકાર સંપાદિત કરો" : "Edit News Type"
                : isGu ? "નવો સમાચાર પ્રકાર ઉમેરો" : "Add News Type"}
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type Name (English) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Politics"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type Name (ગુજરાતી)
                </label>
                <input
                  type="text"
                  placeholder="દા.ત. રાજ્ય રાજકારણ"
                  value={nameGu}
                  onChange={(e) => setNameGu(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded text-xs font-semibold bg-[#016BB7] text-white hover:bg-[#015896] shadow-2xs cursor-pointer"
                >
                  Save News Type
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}