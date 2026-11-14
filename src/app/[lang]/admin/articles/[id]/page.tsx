"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default function EditArticlePage() {
  const params = useParams();
  const lang = (params?.lang as string) || "en";
  const id = params?.id as string;

  return <ArticleEditor lang={lang} articleId={id} />;
}
