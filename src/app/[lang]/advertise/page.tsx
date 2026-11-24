import React from "react";
import type { Metadata } from "next";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { AdvertisePortalClient } from "@/components/advertise/AdvertisePortalClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  return {
    title:
      locale === "gu"
        ? "જાહેરાત વિભાગ (Advertise With Us) | જન્મભૂમિ"
        : "Advertise With Us — Media Kit & Rate Card | Janmabhoomi",
    description:
      locale === "gu"
        ? "જન્મભૂમિ વેબસાઇટ, ઇ-પેપર અને સૌરાષ્ટ્ર ટ્રસ્ટના ૮ પ્રકાશનોમાં ડિસ્પ્લે, ક્લાસિફાઇડ, જાહેર નોટિસ અને બેસણું જાહેરાત બુક કરો."
        : "Advertise across Janmabhoomi digital, E-Paper, Audio Bulletin, Panchang, and 8 Saurashtra Trust publications.",
  };
}

export default async function AdvertisePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  return <AdvertisePortalClient lang={locale} />;
}
