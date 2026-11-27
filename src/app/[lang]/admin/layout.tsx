"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { StaffAuthProvider, useStaffAuth } from "@/lib/context/StaffAuthContext";
import { AdminPublicationProvider, useAdminPublication } from "@/lib/context/AdminPublicationContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

function AdminLayoutInner({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useStaffAuth();
  const { selectedPublication, setSelectedPublication } = useAdminPublication();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname.includes("/admin/login");

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push(`/${lang}/admin/login`);
      } else if (isAuthenticated && isLoginPage) {
        router.push(`/${lang}/admin`);
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, lang, router]);

  // If on login page, render children directly without admin chrome
  if (isLoginPage) {
    return <div className="min-h-screen bg-slate-100">{children}</div>;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 size={36} className="text-[#016BB7] animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Verifying newsroom credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 flex">
      {/* Sidebar */}
      <AdminSidebar
        lang={lang}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? "lg:pl-20" : "lg:pl-68"
        }`}
      >
        <AdminHeader
          lang={lang}
          onMenuClick={() => setMobileOpen(true)}
          selectedPublication={selectedPublication}
          onPublicationChange={setSelectedPublication}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-7 max-w-7xl 2xl:max-w-[1680px] 3xl:max-w-[1920px] w-full mx-auto">
          {children}
        </main>

        <footer className="py-3.5 px-6 border-t border-slate-200 text-xs text-slate-500 bg-white flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">જન્મભૂમિ ન્યૂઝરૂમ એડમિન પોર્ટલ</span>
            <span className="text-slate-300">•</span>
            <span>સૌરાષ્ટ્ર ટ્રસ્ટ (Saurashtra Trust)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Janmabhoomi • Janmabhoomi Pravasi • Purti • Internal Editorial CMS
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const [resolvedParams, setResolvedParams] = useState<{ lang: string } | null>(null);

  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  if (!resolvedParams) {
    return null;
  }

  return (
    <StaffAuthProvider lang={resolvedParams.lang}>
      <AdminPublicationProvider>
        <AdminLayoutInner lang={resolvedParams.lang}>{children}</AdminLayoutInner>
      </AdminPublicationProvider>
    </StaffAuthProvider>
  );
}
