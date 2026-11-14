"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function SettingsAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <ModulePlaceholder
      lang={lang}
      titleEn="Console & Security Settings"
      titleGu="કન્સોલ અને સુરક્ષા સેટિંગ્સ"
      descriptionEn="Configure newsroom parameters, rate-limiting rules, session timeouts, and security policies."
      descriptionGu="ન્યૂઝરૂમ સુરક્ષા નીતિઓ અને સેટિંગ્સ ગોઠવો."
      adminOnly={true}
    />
  );
}
