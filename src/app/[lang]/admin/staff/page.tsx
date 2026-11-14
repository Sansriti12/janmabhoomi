"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Key,
  Mail,
  User,
  Shield,
  X,
  Lock,
} from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  fullName: string;
  role: "Admin" | "Editor";
  status: "ACTIVE" | "DEACTIVATED" | "SUSPENDED";
  lastLoginAt: string | null;
  createdAt: string;
}

export default function StaffManagementPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const isGu = lang === "gu";

  const { user, token } = useStaffAuth();
  const isAdmin = user?.role === "Admin";

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Create Staff Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Editor">("Editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";

  const fetchStaff = async () => {
    if (!token || !isAdmin) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load staff list: HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStaffList(json.data);
      } else {
        throw new Error(json.error?.message || "Invalid response format");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load staff members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
    }
  }, [isAdmin, token]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/staff`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to create staff account.");
      }

      setSuccessMsg(
        isGu
          ? `${fullName} માટે સ્ટાફ એકાઉન્ટ સફળતાપૂર્વક બન્યું.`
          : `Staff account created successfully for ${fullName}.`
      );
      setIsModalOpen(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("Editor");
      fetchStaff();
    } catch (err: any) {
      setModalError(err.message || "Error creating staff account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/staff/${staffId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update staff status.");
      }

      setSuccessMsg(
        isGu
          ? `એકાઉન્ટ સ્થિતિ બદલાઈ: ${nextStatus}.`
          : `Staff account status updated to ${nextStatus}.`
      );
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to change account status.");
    }
  };

  const handleToggleRole = async (staffId: string, currentRole: "Admin" | "Editor") => {
    const nextRole = currentRole === "Admin" ? "Editor" : "Admin";
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${baseUrl}/api/v1/admin/staff/${staffId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: nextRole }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to update role.");
      }

      setSuccessMsg(
        isGu
          ? `ભૂમિકા અપડેટ થઈ: ${nextRole}.`
          : `Staff role updated to ${nextRole}.`
      );
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to update staff role.");
    }
  };

  // RBAC Access Restriction for Editors
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center max-w-lg mx-auto mt-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {isGu ? "ઍક્સેસ પ્રતિબંધિત" : "Access Restricted"}
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          {isGu
            ? "આ વિભાગ ફક્ત એડમિનિસ્ટ્રેટર્સ (Admin) માટે છે. એડિટર ભૂમિકા સ્ટાફ એકાઉન્ટ્સ અથવા ભૂમિકાઓ બદલી શકતી નથી."
            : "Staff account administration is restricted to the Administrator role. Editors cannot manage newsroom accounts or assign roles."}
        </p>
        <div className="mt-6">
          <a
            href={`/${lang}/admin`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            {isGu ? "ડેશબોર્ડ પર પાછા જાઓ" : "Return to Dashboard"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#016BB7] border border-blue-200/60 uppercase tracking-wider">
              {isGu ? "વહીવટી ડેસ્ક" : "Administration Desk"}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#016BB7] uppercase tracking-wider">
              Admin Only
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-serif">
            {isGu ? "સ્ટાફ અને ભૂમિકા વ્યવસ્થાપન" : "Staff & Role Management"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isGu
              ? "ન્યૂઝરૂમ સ્ટાફ એકાઉન્ટ્સ બનાવો, સક્રિય/નિષ્ક્રિય કરો અને એડમિન અથવા એડિટર ભૂમિકા સોંપો."
              : "Manage newsroom accounts, toggle active status, and assign Admin or Editor roles."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStaff}
            disabled={isLoading}
            className="p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#016BB7] hover:bg-[#015a99] rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus size={15} />
            <span>{isGu ? "નવો સ્ટાફ ઉમેરો" : "Add Staff Member"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X size={14} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Staff Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {isGu ? `કુલ સ્ટાફ સભ્યો (${staffList.length})` : `Registered Staff Accounts (${staffList.length})`}
          </h3>
          <span className="text-[11px] text-slate-500">
            {isGu ? "ભૂમિકાઓ: એડમિન અથવા એડિટર" : "Permitted Roles: Admin or Editor"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Staff Member</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5">Last Login</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading && staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[#016BB7]" />
                    <span>Loading staff members...</span>
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No staff members found.
                  </td>
                </tr>
              ) : (
                staffList.map((member) => {
                  const isSelf = member.id === user?.id;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{member.fullName}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-[#016BB7] font-bold border border-blue-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-slate-500 text-[11px]">{member.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            member.role === "Admin"
                              ? "bg-blue-50 text-[#016BB7] border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          <Shield size={12} />
                          <span>{member.role}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            member.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              member.status === "ACTIVE" ? "bg-emerald-600" : "bg-rose-600"
                            }`}
                          ></span>
                          <span>{member.status}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-[11px]">
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "Never"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Role Button */}
                          <button
                            onClick={() => handleToggleRole(member.id, member.role)}
                            disabled={isSelf}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                              isSelf
                                ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200"
                                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                            }`}
                            title={isSelf ? "You cannot modify your own role" : `Switch to ${member.role === "Admin" ? "Editor" : "Admin"}`}
                          >
                            Switch to {member.role === "Admin" ? "Editor" : "Admin"}
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleStatus(member.id, member.status)}
                            disabled={isSelf}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors border ${
                              isSelf
                                ? "opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200"
                                : member.status === "ACTIVE"
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                            }`}
                            title={isSelf ? "You cannot deactivate your own account" : member.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          >
                            {member.status === "ACTIVE" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#016BB7] flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isGu ? "નવો સ્ટાફ સભ્ય ઉમેરો" : "Add Staff Member"}
                </h3>
                <p className="text-xs text-slate-500">
                  {isGu ? "એડમિન અથવા એડિટર ભૂમિકા સોંપો" : "Assign Admin or Editor role"}
                </p>
              </div>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#016BB7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@janmabhoomi.in"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#016BB7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Temporary Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#016BB7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Role Assignment
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition-colors ${
                      role === "Editor"
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="Editor"
                      checked={role === "Editor"}
                      onChange={() => setRole("Editor")}
                      className="text-emerald-600"
                    />
                    <div>
                      <div className="font-bold">Editor</div>
                      <div className="text-[10px] text-slate-500 font-normal">Content & E-paper</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer text-xs transition-colors ${
                      role === "Admin"
                        ? "border-[#016BB7] bg-blue-50/50 text-blue-900 font-semibold"
                        : "border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="Admin"
                      checked={role === "Admin"}
                      onChange={() => setRole("Admin")}
                      className="text-[#016BB7]"
                    />
                    <div>
                      <div className="font-bold">Admin</div>
                      <div className="text-[10px] text-slate-500 font-normal">Full Console Access</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#016BB7] hover:bg-[#015a99] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Staff Member</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
