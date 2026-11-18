"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  Tags,
  Plus,
  Edit,
  CheckCircle2,
  XCircle,
  RefreshCw,
  X,
  FileText,
  ArrowUpDown,
} from "lucide-react";

interface CategoryItem {
  id: string;
  slug: string;
  nameEn: string;
  nameGu: string;
  descriptionEn: string | null;
  descriptionGu: string | null;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  articleCount: number;
}

export default function CategoriesAdminPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";
  const { token, isAuthenticated, isLoading: authLoading } = useStaffAuth();

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [slug, setSlug] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [nameGu, setNameGu] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionGu, setDescriptionGu] = useState("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to load categories.");
      }
      setCategories(json.data);
    } catch (err: any) {
      setError(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/${lang}/admin/login`);
    } else if (token) {
      fetchCategories();
    }
  }, [authLoading, isAuthenticated, token, fetchCategories, lang, router]);

  const openCreateModal = () => {
    setIsEditing(false);
    setCategoryId("");
    setSlug("");
    setNameEn("");
    setNameGu("");
    setDescriptionEn("");
    setDescriptionGu("");
    setDisplayOrder(categories.length);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setIsEditing(true);
    setCategoryId(cat.id);
    setSlug(cat.slug);
    setNameEn(cat.nameEn);
    setNameGu(cat.nameGu);
    setDescriptionEn(cat.descriptionEn || "");
    setDescriptionGu(cat.descriptionGu || "");
    setDisplayOrder(cat.displayOrder);
    setIsActive(cat.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    try {
      if (isEditing) {
        const res = await fetch(`${baseUrl}/api/v1/admin/categories/${categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nameEn,
            nameGu,
            slug,
            descriptionEn: descriptionEn || null,
            descriptionGu: descriptionGu || null,
            displayOrder,
            isActive,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to update category.");
        }
      } else {
        const res = await fetch(`${baseUrl}/api/v1/admin/categories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: categoryId.toLowerCase().trim(),
            slug: slug.toLowerCase().trim(),
            nameEn,
            nameGu,
            descriptionEn: descriptionEn || null,
            descriptionGu: descriptionGu || null,
            displayOrder,
            isActive,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Failed to create category.");
        }
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
            {isGu ? "કેટેગરીઝ સંચાલન (Manage Categories)" : "Manage Categories"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isGu
              ? "અખબારના મુખ્ય વિભાગો, ગુજરાતી-અંગ્રેજી નામો અને ક્રમનું સંચાલન કરો"
              : "Organize newspaper editorial sections, bilingual names, and display order."}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#016BB7] hover:bg-[#015896] text-white font-semibold text-xs shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isGu ? "કેટેગરી ઉમેરો (Add Categories)" : "Add Categories"}</span>
        </button>
      </div>

      {/* Categories Table — Matching Legacy Newsroom Layout */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#016BB7]" />
            <span className="text-xs">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 bg-rose-50 text-xs">
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-4">{isGu ? "ગુજરાતીમાં કેટેગરી" : "Category in Gujarati"}</th>
                  <th className="py-2.5 px-4">{isGu ? "અંગ્રેજીમાં કેટેગરી" : "Category in English"}</th>
                  <th className="py-2.5 px-3 text-center">{isGu ? "ક્રમ" : "Order"}</th>
                  <th className="py-2.5 px-3 text-center">{isGu ? "સ્થિતિ" : "Status"}</th>
                  <th className="py-2.5 px-4 text-right">{isGu ? "ક્રિયાઓ" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c, index) => {
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 font-medium">{index + 1}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{c.nameGu}</td>
                      <td className="py-2.5 px-4 text-slate-700">{c.nameEn}</td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-mono text-[11px]">{c.displayOrder}</td>
                      <td className="py-2.5 px-3 text-center">
                        {c.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100 font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 text-xs">
                          <button
                            onClick={() => openEditModal(c)}
                            className="text-[#016BB7] hover:underline font-semibold"
                          >
                            {isGu ? "જુઓ | સંપાદિત" : "View | Edit"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {isEditing
                ? isGu
                  ? "કેટેગરી સંપાદિત કરો"
                  : "Edit Category"
                : isGu
                ? "નવી કેટેગરી ઉમેરો"
                : "Add New Category"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category ID * (lowercase-hyphens)
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  placeholder="e.g. technology"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    if (!isEditing) setSlug(e.target.value);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. technology"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isGu ? "ગુજરાતી નામ *" : "Gujarati Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ટેક્નોલોજી અને વિજ્ઞાન"
                  value={nameGu}
                  onChange={(e) => setNameGu(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isGu ? "અંગ્રેજી નામ *" : "English Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technology & Science"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-[#016BB7] focus:ring-[#016BB7] w-4 h-4"
                    />
                    <span>Active in Navigation</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-[#016BB7] hover:bg-[#015896] text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
