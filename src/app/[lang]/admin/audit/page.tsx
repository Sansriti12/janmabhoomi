"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function AuditAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <ModulePlaceholder
      lang={lang}
      titleEn="Newsroom Activity & Audit Logs"
      titleGu="ન્યૂઝરૂમ પ્રવૃત્તિ અને ઓડિટ લૉગ્સ"
      descriptionEn="Immutable audit trail of staff actions, logins, publication releases, and system updates."
      descriptionGu="સ્ટાફ પ્રવૃત્તિઓ, લૉગિન અને ફેરફારોનો ઓડિટ રેકોર્ડ."
      adminOnly={true}
    />
  );
}
