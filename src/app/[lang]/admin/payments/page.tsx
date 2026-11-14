"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function PaymentsAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <ModulePlaceholder
      lang={lang}
      titleEn="Razorpay Payments & Transactions"
      titleGu="રેઝરપે પેમેન્ટ્સ અને વ્યવહારો"
      descriptionEn="Inspect payment orders, captured transactions, invoices, and financial audit logs."
      descriptionGu="પેમેન્ટ ઓર્ડર્સ, વ્યવહારો, ઇન્વૉઇસેસ અને ઓડિટ લૉગ્સની તપાસ કરો."
      adminOnly={true}
    />
  );
}
