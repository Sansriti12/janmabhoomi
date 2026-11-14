"use client";

import React from "react";
import Link from "next/navigation";
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
  ExternalLink,
  Image as ImageIcon,
  Tags,
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
      title: isGu ? "વિહંગાવલોકન" : "Overview",
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
      title: isGu ? "સામગ્રી સંચાલન" : "Content Management",
      items: [
        {
          name: isGu ? "સમાચાર લેખો" : "News Articles",
          href: "/articles",
          icon: FileText,
          adminOnly: false,
        },
        {
          name: isGu ? "મીડિયા લાઇબ્રેરી" : "Media Library",
          href: "/media",
          icon: ImageIcon,
          adminOnly: false,
        },
        {
          name: isGu ? "કેટેગરીઝ" : "Categories",
          href: "/categories",
          icon: Tags,
          adminOnly: true,
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
      ],
    },
    {
      title: isGu ? "પ્રકાશનો અને વ્યાપાર" : "Publications & Business",
      items: [
        {
          name: isGu ? "પ્રકાશનો (૨)" : "Publications (2)",
          href: "/publications",
          icon: Building2,
          adminOnly: false,
        },
        {
          name: isGu ? "સબ્સ્ક્રાઇબર્સ" : "Subscribers",
          href: "/subscribers",
          icon: Users,
          adminOnly: true,
        },
        {
          name: isGu ? "પેમેન્ટ અને ઓર્ડર્સ" : "Payments & Invoices",
          href: "/payments",
          icon: CreditCard,
          adminOnly: true,
        },
      ],
    },
    {
      title: isGu ? "પૂછપરછ" : "Enquiries",
      items: [
        {
          name: isGu ? "આર્કાઇવ પૂછપરછ" : "Archive Enquiries",
          href: "/enquiries/archive",
          icon: Archive,
          adminOnly: true,
        },
        {
          name: isGu ? "સંપર્ક સંદેશાઓ" : "Contact Enquiries",
          href: "/enquiries/contact",
          icon: Mail,
          adminOnly: true,
        },
      ],
    },
    {
      title: isGu ? "વહીવટ" : "Administration",
      items: [
        {
          name: isGu ? "સ્ટાફ એકાઉન્ટ્સ" : "Staff Management",
          href: "/staff",
          icon: ShieldCheck,
          adminOnly: true,
        },
        {
          name: isGu ? "પ્રવૃત્તિ લૉગ્સ" : "Activity Logs",
          href: "/audit",
          icon: History,
          adminOnly: true,
        },
        {
          name: isGu ? "સિસ્ટમ સેટિંગ્સ" : "Settings",
          href: "/settings",
          icon: Settings,
          adminOnly: true,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/40">
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#016BB7] flex items-center justify-center font-bold text-white text-base shadow-sm">
                JB
              </div>
              <div className="leading-tight">
                <span className="font-bold text-white text-sm tracking-wide block">
                  JANMABHOOMI
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase block">
                  Newsroom Admin
                </span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mx-auto w-8 h-8 rounded-lg bg-[#016BB7] flex items-center justify-center font-bold text-white text-sm shadow-sm">
              JB
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* 2-Publication Scope Badge */}
        {!isCollapsed && (
          <div className="mx-3 my-3 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-[#38bdf8] mb-1">
              <span className="w-2 h-2 rounded-full bg-[#016BB7] animate-pulse"></span>
              <span>Scope: 2 Newspapers</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Janmabhoomi • Janmabhoomi Pravasi
            </p>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 scrollbar-thin">
          {navSections.map((section, idx) => {
            // Filter out items that require Admin if user is not Admin
            const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);
            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-1">
                {!isCollapsed && (
                  <h4 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    {section.title}
                  </h4>
                )}
                {visibleItems.map((item, itemIdx) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  const targetUrl = `/${lang}/admin${item.href}`;

                  return (
                    <a
                      key={itemIdx}
                      href={targetUrl}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group ${
                        active
                          ? "bg-[#016BB7] text-white shadow-sm font-semibold"
                          : "text-slate-300 hover:text-white hover:bg-slate-800"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon
                        size={19}
                        className={active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}
                      />
                      {!isCollapsed && <span>{item.name}</span>}
                      {!isCollapsed && item.adminOnly && (
                        <span className="ml-auto text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-400 font-semibold border border-amber-500/20">
                          Admin
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer Profile & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-2 py-1.5">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs border border-slate-600">
                  {user?.fullName?.charAt(0) || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        user?.role === "Admin"
                          ? "bg-blue-900/60 text-blue-300 border border-blue-700/50"
                          : "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50"
                      }`}
                    >
                      {user?.role}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                <a
                  href={`/${lang}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Public Site</span>
                </a>
                <button
                  onClick={logout}
                  className="flex items-center justify-center gap-1 text-xs px-2.5 py-1.5 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-rose-100 transition-colors border border-rose-800/40"
                  title="Sign out of newsroom session"
                >
                  <LogOut size={13} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={logout}
                className="p-2 rounded-lg text-rose-400 hover:bg-rose-950 hover:text-rose-200 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
