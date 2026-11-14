"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function SubscribersAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <ModulePlaceholder
      lang={lang}
      titleEn="Subscriber Accounts & Access"
      titleGu="સબ્સ્ક્રાઇબર એકાઉન્ટ્સ અને એક્સેસ"
      descriptionEn="Manage subscriber accounts, subscription plans, and active reading privileges."
      descriptionGu="વાંચકોના સબ્સ્ક્રિપ્શન ખાતા, યોજનાઓ અને વાંચન અધિકારોનું સંચાલન કરો."
      adminOnly={true}
    />
  );
}
