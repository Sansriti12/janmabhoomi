"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default function NewArticlePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";

  return <ArticleEditor lang={lang} />;
}
