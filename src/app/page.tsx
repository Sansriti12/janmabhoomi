import { redirect } from "next/navigation";
import { i18nConfig } from "@/lib/i18n/config";

export default function RootRedirectPage() {
  redirect(`/${i18nConfig.defaultLocale}`);
}
