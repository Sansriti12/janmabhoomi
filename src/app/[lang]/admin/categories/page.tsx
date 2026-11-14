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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isGu ? "સમાચાર કેટેગરીઝ અને ટેક્સોનોમી" : "News Categories & Taxonomy"}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isGu
              ? "અખબારના વિભાગો, દ્વિભાષી નામો અને નેવિગેશન ક્રમનું સંચાલન કરો."
              : "Manage news sections, bilingual naming, navigation ordering, and taxonomy."}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#016BB7] hover:bg-[#015896] text-white font-medium text-sm shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isGu ? "નવી કેટેગરી ઉમેરો" : "New Category"}</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#016BB7]" />
            <span>Loading taxonomy...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50">
            <p className="font-semibold">{error}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-xs tracking-wider uppercase">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">{isGu ? "ગુજરાતી નામ" : "Gujarati Name"}</th>
                  <th className="py-3 px-4">{isGu ? "અંગ્રેજી નામ" : "English Name"}</th>
                  <th className="py-3 px-4">Slug / ID</th>
                  <th className="py-3 px-4">{isGu ? "લેખો" : "Articles"}</th>
                  <th className="py-3 px-4">{isGu ? "સ્થિતિ" : "Status"}</th>
                  <th className="py-3 px-4 text-right">{isGu ? "સંપાદન" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-xs font-mono text-slate-500">{c.displayOrder}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{c.nameGu}</td>
                    <td className="py-3 px-4 text-slate-700">{c.nameEn}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">{c.slug}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        <FileText className="w-3 h-3" />
                        <span>{c.articleCount}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-slate-600 hover:text-[#016BB7] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
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
