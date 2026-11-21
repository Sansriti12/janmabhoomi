"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStaffAuth } from "@/lib/context/StaffAuthContext";
import {
  LayoutDashboard,
  Newspaper,
  FileText,
  BookOpen,
  Building2,
  Users,
  CreditCard,
  Mail,
  Archive,
  ShieldCheck,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Image as ImageIcon,
  Tags,
  Layers,
  Calendar,
  Compass,
  BookMarked,
  Flame,
  UserCheck,
} from "lucide-react";

interface AdminSidebarProps {
  lang: string;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function AdminSidebar({
  lang,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useStaffAuth();
  const isGu = lang === "gu";
  const isAdmin = user?.role === "Admin";

  const isActive = (path: string) => {
    const fullPath = `/${lang}/admin${path}`;
    if (path === "") {
      return pathname === `/${lang}/admin` || pathname === `/${lang}/admin/`;
    }
    return pathname.startsWith(fullPath);
  };

  const navSections = [
    {
      title: isGu ? "મુખ્ય" : "Main",
      items: [
        {
          name: isGu ? "ડેશબોર્ડ" : "Dashboard",
          href: "",
          icon: LayoutDashboard,
          adminOnly: false,
        },
      ],
    },
    {
      title: isGu ? "સંપાદકીય અને પ્રકાશન" : "Editorial & Publishing",
      items: [
        {
          name: isGu ? "સમાચાર લેખો" : "News Articles",
          href: "/articles",
          icon: FileText,
          adminOnly: false,
        },
        {
          name: isGu ? "કેટેગરીઝ" : "Categories",
          href: "/categories",
          icon: Tags,
          adminOnly: false,
        },
        {
          name: isGu ? "સમાચાર પ્રકારો" : "News Types",
          href: "/news-types",
          icon: Layers,
          adminOnly: false,
        },
        {
          name: isGu ? "બજેટ ૨૦૨૬ લાઈવ" : "Budget 2026",
          href: "/budget",
          icon: Flame,
          adminOnly: false,
        },
        {
          name: isGu ? "ઇ-પેપર આવૃત્તિઓ" : "E-Paper Editions",
          href: "/epaper",
          icon: Newspaper,
          adminOnly: false,
        },
        {
          name: isGu ? "અગ્રલેખો" : "Editorials",
          href: "/editorials",
          icon: BookOpen,
          adminOnly: false,
        },
        {
          name: isGu ? "દૈનિક પંચાંગ (૪ શહેરો)" : "Daily Panchang",
          href: "/panchang",
          icon: Compass,
          adminOnly: false,
        },
        {
          name: isGu ? "મરણ નોંધ / બેસણું" : "Maran / Obituaries",
          href: "/maran",
          icon: BookMarked,
          adminOnly: false,
        },
      ],
    },
    {
      title: isGu ? "વાંચકો અને સબ્સ્ક્રિપ્શન" : "Circulation & Readers",
      items: [
        {
          name: isGu ? "સબ્સ્ક્રાઇબર કાઉન્ટ" : "Subscribers Count",
          href: "/subscribers",
          icon: Users,
          adminOnly: false,
        },
        {
          name: isGu ? "પંચાંગ સબ્સ્ક્રિપ્શન" : "Panchang Subscriptions",
          href: "/panchang-subscriptions",
          icon: Calendar,
          adminOnly: false,
        },
        {
          name: isGu ? "પેમેન્ટ અને ઇનવોઇસ" : "Payments & Invoices",
          href: "/payments",
          icon: CreditCard,
          adminOnly: true,
        },
      ],
    },
    {
      title: isGu ? "મીડિયા અને સંપત્તિ" : "Media & Assets",
      items: [
        {
          name: isGu ? "મીડિયા લાઇબ્રેરી" : "Media Library",
          href: "/media",
          icon: ImageIcon,
          adminOnly: false,
        },
      ],
    },
    {
      title: isGu ? "વહીવટ" : "Administration",
      items: [
        {
          name: isGu ? "પ્રકાશનો" : "Publications",
          href: "/publications",
          icon: Building2,
          adminOnly: false,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0c192c] text-slate-200 border-r border-[#1a2d48] transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-68"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header — Full Official Janmabhoomi Brand Identity */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-[#1a2d48] bg-white">
          {!isCollapsed ? (
            <Link href={`/${lang}/admin`} className="flex items-center gap-2 overflow-hidden">
              <img
                src="/assets/logos/janmabhoomi-full-logo@2x.png"
                alt="Janmabhoomi Group"
                className="h-9 max-w-[190px] object-contain select-none"
              />
            </Link>
          ) : (
            <div className="mx-auto flex items-center justify-center">
              <img
                src="/assets/logos/janmabhoomi-emblem.png"
                alt="Janmabhoomi Group"
                className="h-8 w-auto object-contain select-none"
              />
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* 2-Newspaper Scoped Scope Indicator */}
        {!isCollapsed && (
          <div className="mx-3 mt-3 mb-2 px-3 py-2 rounded bg-[#10223b] border border-[#1b3458] text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Janmabhoomi Newsroom</span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              જન્મભૂમિ • જન્મભૂમિ પ્રવાસી
            </p>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-4 scrollbar-thin">
          {navSections.map((section, idx) => {
            const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-0.5">
                {!isCollapsed && (
                  <h4 className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {section.title}
                  </h4>
                )}
                {visibleItems.map((item, itemIdx) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  const targetUrl = `/${lang}/admin${item.href}`;

                  return (
                    <Link
                      key={itemIdx}
                      href={targetUrl}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all group ${
                        active
                          ? "bg-[#016BB7] text-white shadow-xs font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-[#132742]"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        size={17}
                        className={active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                      {!isCollapsed && item.adminOnly && (
                        <span className="ml-auto text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900/60 text-amber-300 font-semibold border border-amber-400/20">
                          Admin
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Staff Profile & Logout Footer */}
        <div className="p-3 border-t border-[#1a2d48] bg-[#091322]">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-2 py-1">
                <div className="w-7 h-7 rounded-full bg-[#1b3458] flex items-center justify-center font-bold text-white text-xs border border-[#264875]">
                  {user?.fullName?.charAt(0) || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user?.fullName || "Newsroom Staff"}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        user?.role === "Admin"
                          ? "bg-blue-900/70 text-blue-200 border border-blue-600/40"
                          : "bg-emerald-900/70 text-emerald-200 border border-emerald-600/40"
                      }`}
                    >
                      {user?.role || "Staff"}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 pt-1">
                <a
                  href={`/${lang}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-2.5 py-1.5 rounded text-[11px] font-medium text-slate-300 hover:text-white hover:bg-[#132742] transition-colors text-center border border-[#1b3458]"
                >
                  {isGu ? "મુખ્ય વેબસાઇટ" : "Public Website"}
                </a>
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 rounded text-[11px] font-medium text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors flex items-center gap-1 border border-rose-900/30"
                  title="Logout"
                >
                  <LogOut size={13} />
                  <span>{isGu ? "લૉગઆઉટ" : "Logout"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={logout}
                className="p-2 rounded text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
