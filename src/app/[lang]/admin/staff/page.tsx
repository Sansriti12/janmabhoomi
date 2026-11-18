import { redirect } from "next/navigation";

export default async function StaffManagementPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  // Redirect away: Staff Management is managed directly at infrastructure/database level
  // and is completely removed from the visible editorial Admin UI.
  redirect(`/${lang || "en"}/admin`);
}
