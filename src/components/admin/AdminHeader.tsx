"use client";

import React, { useState } from "react";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import { Menu, Globe, User, LogOut, ChevronDown, Check, Shield } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface AdminHeaderProps {
  lang: string;
  onMenuClick: () => void;
  selectedPublication: string;
  onPublicationChange: (pubId: string) => void;
}

export const PERMITTED_PUBLICATIONS_FRONTEND = [
  { id: "all", nameEn: "All Permitted Newspapers (2)", nameGu: "બંને મંજૂર સમાચારપત્રો" },
  { id: "pub-janmabhoomi", nameEn: "Janmabhoomi (Daily)", nameGu: "જન્મભૂમિ (દૈનિક)" },
  { id: "pub-pravasi", nameEn: "Janmabhoomi Pravasi (Weekly)", nameGu: "જન્મભૂમિ પ્રવાસી (સાપ્તાહિક)" },
];

export function AdminHeader({
  lang,
  onMenuClick,
  selectedPublication,
  onPublicationChange,
}: AdminHeaderProps) {
  const { user, logout } = useStaffAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [pubDropdownOpen, setPubDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isGu = lang === "gu";

  const toggleLanguage = () => {
    const newLang = isGu ? "en" : "gu";
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  };

  const currentPub =
    PERMITTED_PUBLICATIONS_FRONTEND.find((p) => p.id === selectedPublication) ||
    PERMITTED_PUBLICATIONS_FRONTEND[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 shadow-xs">
      {/* Left side: Hamburger + Scope Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Publication Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPubDropdownOpen(!pubDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 transition-colors shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#016BB7]"></span>
            <span className="font-semibold text-slate-900">
              {isGu ? currentPub.nameGu : currentPub.nameEn}
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {pubDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setPubDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-64 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  {isGu ? "મંજૂર પ્રકાશનો ફિલ્ટર" : "Permitted Publications Filter"}
                </div>
                {PERMITTED_PUBLICATIONS_FRONTEND.map((pub) => (
                  <button
                    key={pub.id}
                    onClick={() => {
                      onPublicationChange(pub.id);
                      setPubDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      selectedPublication === pub.id
                        ? "text-[#016BB7] font-semibold bg-blue-50/50"
                        : "text-slate-700"
                    }`}
                  >
                    <span>{isGu ? pub.nameGu : pub.nameEn}</span>
                    {selectedPublication === pub.id && <Check size={14} className="text-[#016BB7]" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side: Language + User Profile */}
      <div className="flex items-center gap-3">
        {/* Language switch button */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors"
          title={isGu ? "Switch to English" : "ગુજરાતીમાં જુઓ"}
        >
          <Globe size={14} />
          <span>{isGu ? "English" : "ગુજરાતી"}</span>
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#016BB7] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="text-xs font-semibold text-slate-800 block">
                {user?.fullName || "Staff User"}
              </span>
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-wider ${
                  user?.role === "Admin" ? "text-[#016BB7]" : "text-emerald-700"
                }`}
              >
                {user?.role || "Staff"}
              </span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-30">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Shield size={12} className={user?.role === "Admin" ? "text-blue-600" : "text-emerald-600"} />
                    <span className="text-[11px] font-semibold text-slate-700">
                      Role: {user?.role}
                    </span>
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut size={14} />
                    <span>{isGu ? "લૉગ આઉટ કરો" : "Sign Out"}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
