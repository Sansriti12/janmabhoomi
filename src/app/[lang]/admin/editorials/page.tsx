"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ModulePlaceholder } from "@/components/admin/ModulePlaceholder";

export default function EditorialsAdminPage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return (
    <ModulePlaceholder
      lang={lang}
      titleEn="Editorials & Opinions"
      titleGu="અગ્રલેખ અને અભિપ્રાય"
      descriptionEn="Manage daily lead editorials and featured opinion pieces by accredited columnists."
      descriptionGu="દૈનિક મુખ્ય અગ્રલેખો અને અગ્રણી કટારલેખકોના લેખોનું સંચાલન કરો."
    />
  );
}
