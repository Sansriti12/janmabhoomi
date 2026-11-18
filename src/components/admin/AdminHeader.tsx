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
  { id: "all", nameEn: "All Publications (3)", nameGu: "તમામ પ્રકાશનો (૩)" },
  { id: "pub-janmabhoomi", nameEn: "Janmabhoomi (Daily)", nameGu: "જન્મભૂમિ (દૈનિક)" },
  { id: "pub-pravasi", nameEn: "Janmabhoomi Pravasi (Weekly)", nameGu: "જન્મભૂમિ પ્રવાસી (સાપ્તાહિક)" },
  { id: "pub-purti", nameEn: "Janmabhoomi Purti (Special)", nameGu: "જન્મભૂમિ પૂર્તિ (વિશેષ)" },
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

  // Derive current page title & breadcrumb based on pathname
  const getPageInfo = () => {
    const p = pathname.replace(`/${lang}/admin`, "");
    if (p === "" || p === "/") return { title: isGu ? "ન્યૂઝરૂમ ડેશબોર્ડ" : "Newsroom Dashboard", breadcrumb: isGu ? "ડેશબોર્ડ" : "Dashboard" };
    if (p.startsWith("/articles/new")) return { title: isGu ? "નવો સમાચાર લેખ ઉમેરો" : "Add News Article", breadcrumb: isGu ? "સમાચાર / નવો લેખ" : "News / Add Article" };
    if (p.startsWith("/articles/")) return { title: isGu ? "લેખ સંપાદન" : "Edit News Article", breadcrumb: isGu ? "સમાચાર / સંપાદન" : "News / Edit Article" };
    if (p.startsWith("/articles")) return { title: isGu ? "સમાચાર લેખોનું સંચાલન" : "Manage News Articles", breadcrumb: isGu ? "સમાચાર લેખો" : "News Articles" };
    if (p.startsWith("/categories")) return { title: isGu ? "કેટેગરીઝ સંચાલન" : "Manage Categories", breadcrumb: isGu ? "કેટેગરીઝ" : "Categories" };
    if (p.startsWith("/news-types")) return { title: isGu ? "સમાચાર પ્રકારોનું સંચાલન" : "Manage News Types", breadcrumb: isGu ? "સમાચાર પ્રકારો" : "News Types" };
    if (p.startsWith("/budget")) return { title: isGu ? "બજેટ ૨૦૨૬ લાઈવ અપડેટ્સ" : "Budget 2026 Live Updates", breadcrumb: isGu ? "વિશેષ કવરેજ / બજેટ" : "Special Coverage / Budget" };
    if (p.startsWith("/panchang-subscriptions")) return { title: isGu ? "પંચાંગ સબ્સ્ક્રિપ્શન સંચાલન" : "Manage Panchang Subscriptions", breadcrumb: isGu ? "પંચાંગ સબ્સ્ક્રિપ્શન" : "Panchang Subscriptions" };
    if (p.startsWith("/subscribers")) return { title: isGu ? "સબ્સ્ક્રાઇબર કાઉન્ટ અને એકાઉન્ટ્સ" : "Subscribers Count & Directory", breadcrumb: isGu ? "સબ્સ્ક્રાઇબર્સ" : "Subscribers" };
    if (p.startsWith("/payments")) return { title: isGu ? "પેમેન્ટ અને ટ્રાન્ઝેક્શન્સ" : "Payments & Transactions", breadcrumb: isGu ? "પેમેન્ટ્સ" : "Payments" };
    if (p.startsWith("/epaper")) return { title: isGu ? "ઇ-પેપર આવૃત્તિ સંચાલન" : "E-Paper Editions Management", breadcrumb: isGu ? "ઇ-પેપર" : "E-Paper" };
    if (p.startsWith("/media")) return { title: isGu ? "મીડિયા લાઇબ્રેરી" : "Newsroom Media Library", breadcrumb: isGu ? "મીડિયા" : "Media" };
    if (p.startsWith("/editorials")) return { title: isGu ? "દૈનિક અગ્રલેખો" : "Daily Editorials", breadcrumb: isGu ? "અગ્રલેખો" : "Editorials" };
    if (p.startsWith("/publications")) return { title: isGu ? "સમાચારપત્રો અને પૂર્તિ" : "Publications & Supplements", breadcrumb: isGu ? "પ્રકાશનો" : "Publications" };
    if (p.startsWith("/audit")) return { title: isGu ? "પ્રવૃત્તિ લૉગ્સ અને ઑડિટ" : "Editorial Activity Logs", breadcrumb: isGu ? "વહીવટ / ઑડિટ" : "Admin / Audit" };
    if (p.startsWith("/settings")) return { title: isGu ? "સિસ્ટમ સેટિંગ્સ" : "Newsroom Settings", breadcrumb: isGu ? "વહીવટ / સેટિંગ્સ" : "Admin / Settings" };
    return { title: isGu ? "ન્યૂઝરૂમ એડમિન" : "Newsroom Admin", breadcrumb: isGu ? "એડમિન" : "Admin" };
  };

  const pageInfo = getPageInfo();

  const toggleLanguage = () => {
    const newLang = isGu ? "en" : "gu";
    const newPath = pathname.replace(`/${lang}`, `/${newLang}`);
    router.push(newPath);
  };

  const currentPub =
    PERMITTED_PUBLICATIONS_FRONTEND.find((p) => p.id === selectedPublication) ||
    PERMITTED_PUBLICATIONS_FRONTEND[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 shadow-2xs">
      {/* Left side: Hamburger + Page Breadcrumb + Publication Pill */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Page Title & Breadcrumb */}
        <div className="hidden md:block">
          <div className="text-[11px] font-medium text-slate-400">
            {pageInfo.breadcrumb}
          </div>
          <h1 className="text-sm font-bold text-slate-900 leading-tight">
            {pageInfo.title}
          </h1>
        </div>

        <div className="hidden md:block h-6 w-px bg-slate-200 mx-1"></div>

        {/* Publication Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPubDropdownOpen(!pubDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50 hover:bg-white text-xs font-medium text-slate-700 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#016BB7]"></span>
            <span className="font-semibold text-slate-900 max-w-[150px] sm:max-w-none truncate">
              {isGu ? currentPub.nameGu : currentPub.nameEn}
            </span>
            <ChevronDown size={13} className="text-slate-400" />
          </button>

          {pubDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setPubDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-64 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-30">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
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
