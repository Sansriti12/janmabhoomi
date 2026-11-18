"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Flame,
  Plus,
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface BudgetPost {
  id: string;
  content: string;
  timestamp: string;
  author?: string;
}

const INITIAL_BUDGET_POSTS: BudgetPost[] = [
  {
    id: "b-1",
    content: "નાણાકીય વર્ષ 24 માટે સુધારેલો ખર્ચ અંદાજ રૂ 44.90 લાખ કરોડ",
    timestamp: "01-02-24 12:23:16 pm",
  },
  {
    id: "b-2",
    content: "ચોખ્ખાં બજાર ધિરાણ રૂ. 11.75 લાખ કરોડ",
    timestamp: "01-02-24 12:22:58 pm",
  },
  {
    id: "b-3",
    content: "નાણાકીય વર્ષ 25 બજાર ધિરાણનું લક્ષ 14.13 લાખ કરોડ રૂપિયા",
    timestamp: "01-02-24 12:22:41 pm",
  },
  {
    id: "b-4",
    content: "નાણાકીય વર્ષ 25 માટે 5.1% નાણાં ખાધનું લક્ષ્ય",
    timestamp: "01-02-24 12:22:18 pm",
  },
  {
    id: "b-5",
    content: "નાણાં વર્ષ 2024 માટે નાણાં ખાધનો લક્ષ્યાંક જીડીપીના 5.9 ટકાથી સુધારીને 5.8 ટકા",
    timestamp: "01-02-24 12:22:02 pm",
  },
  {
    id: "b-6",
    content: "પીએમ આવાસ યોજના હેઠળ બે કરોડ ઘર બનાવાશે",
    timestamp: "01-02-24 12:21:40 pm",
  },
  {
    id: "b-7",
    content: "કેપેક્સ ખર્ચ જીડીપીના 3.4 ટકા",
    timestamp: "01-02-24 12:21:23 pm",
  },
  {
    id: "b-8",
    content: "રૂ. 11.11 લાખ કરોડનો મૂડીરોકાણ ખર્ચ, 11 ટકા વૃદ્ધિ",
    timestamp: "01-02-24 12:21:01 pm",
  },
];

export default function BudgetAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const [posts, setPosts] = useState<BudgetPost[]>(INITIAL_BUDGET_POSTS);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (editingId) {
      setPosts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, content } : p))
      );
      setEditingId(null);
    } else {
      const now = new Date();
      const dateFormatted = `${String(now.getDate()).padStart(2, "0")}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getFullYear()).slice(-2)}`;
      const timeFormatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).toLowerCase();

      const newPost: BudgetPost = {
        id: `b-${Date.now()}`,
        content,
        timestamp: `${dateFormatted} ${timeFormatted}`,
      };
      setPosts((prev) => [newPost, ...prev]);
    }

    setContent("");
  };

  const handleEdit = (post: BudgetPost) => {
    setEditingId(post.id);
    setContent(post.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    if (confirm(isGu ? "શું તમે આ અપડેટ કાઢી નાખવા માંગો છો?" : "Delete this update?")) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
            <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
              Live Coverage Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif mt-0.5">
            {isGu ? "કેન્દ્રીય બજેટ ૨૦૨૬ (Budget 2026 Live)" : "Budget 2026 Live Updates"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "કેન્દ્રીય બજેટનું લાઇવ પ્રસારણ અને તાજા સમાચાર અપડેટ્સ મેનેજમેન્ટ"
              : "Live-blog updates and real-time announcements for Union Budget coverage."}
          </p>
        </div>

        <a
          href={`/${lang}/events`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          <span>{isGu ? "લાઇવ પેજ જુઓ" : "View Live Page"}</span>
        </a>
      </div>

      {/* Two-column Layout matching Screenshot media_1794810030674_879220e9.jpg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Content Composer */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-slate-200 p-4 shadow-2xs self-start">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            {editingId
              ? isGu ? "અપડેટ સંપાદિત કરો" : "Edit Post"
              : isGu ? "નવો બજેટ મુદ્દો ઉમેરો" : "Post Live Update"}
          </h3>

          <form onSubmit={handleAddOrUpdate} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Content *
              </label>
              <textarea
                required
                rows={5}
                placeholder={isGu ? "બજેટની મહત્વની જાહેરાત અહીં લખો..." : "Enter budget announcement here..."}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2.5 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded text-xs font-semibold bg-[#016BB7] text-white hover:bg-[#015896] shadow-2xs transition-colors cursor-pointer"
              >
                {editingId ? (isGu ? "અપડેટ કરો" : "Update Post") : isGu ? "ઉમેરો (Add)" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setContent("");
                  }}
                  className="px-3 py-2 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right: All Posts Feed */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5">
            <h3 className="text-sm font-bold text-slate-900 font-serif">
              {isGu ? "તમામ પોસ્ટ્સ (All Posts)" : "All Posts"}
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              {posts.length} {isGu ? "મુદ્દા લાઇવ" : "updates"}
            </span>
          </div>

          <div className="divide-y divide-slate-100 space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="pt-3 first:pt-0 group">
                <p className="text-xs text-slate-900 font-medium leading-relaxed">
                  {post.content}
                </p>
                <div className="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <Clock size={11} className="text-slate-400" />
                    <span>{post.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(post)}
                      title="Edit post"
                      className="text-slate-500 hover:text-[#016BB7] cursor-pointer"
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      title="Delete post"
                      className="text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}