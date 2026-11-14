"use client";

import React from "react";
import { useParams } from "next/navigation";
import { EpaperAdminDashboard } from "@/components/admin/epaper/EpaperAdminDashboard";

export default function AdminEpaperPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return <EpaperAdminDashboard lang={lang} />;
}
