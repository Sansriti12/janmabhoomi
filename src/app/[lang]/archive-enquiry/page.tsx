import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  BookOpen,
  Building2,
  Clock,
  HelpCircle,
  History,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { ArchiveEnquiryForm } from "@/components/archive/ArchiveEnquiryForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const dict = getDictionary(locale);
  return {
    title: `${dict.archiveEnquiry.pageTitle} | Janmabhoomi Group`,
    description: dict.archiveEnquiry.introText,
  };
}

export default async function ArchiveEnquiryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const isGu = locale === "gu";
  const dict = getDictionary(locale);
  const t = dict.archiveEnquiry;

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#1F2937]/70 flex items-center gap-1.5 font-medium">
          <Link href={`/${locale}`} className="hover:text-[#016BB7] transition-colors">
            {dict.nav.home}
          </Link>
          <span>/</span>
          <span className="text-[#016BB7] font-bold">{t.pageTitle}</span>
        </nav>

        {/* Hero Header Section */}
        <div className="rounded-2xl border border-[#016BB7]/20 bg-white p-6 sm:p-10 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#016BB7]/15 pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#016BB7]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#016BB7] mb-2">
                <History className="h-3.5 w-3.5" />
                <span>{t.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#016BB7] tracking-tight leading-tight">
                {t.pageTitle}
              </h1>
            </div>
            <div className="shrink-0 flex items-center gap-2 rounded-xl border border-[#016BB7]/20 bg-[#F0F6FA] p-3 text-xs text-[#016BB7] font-bold">
              <Building2 className="h-4 w-4" />
              <span>{isGu ? "સૌરાષ્ટ્ર ટ્રસ્ટ આર્કાઇવ વિભાગ" : "Saurashtra Trust Archives"}</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#1F2937]/85 max-w-4xl leading-relaxed">
            {t.introText}
          </p>

          <div className="rounded-xl border border-[#016BB7]/20 bg-[#F0F6FA] p-4 text-xs text-[#1F2937]/80 flex items-start gap-3 leading-relaxed">
            <HelpCircle className="h-4 w-4 shrink-0 text-[#016BB7] mt-0.5" />
            <p>{t.archiveNotice}</p>
          </div>
        </div>

        {/* Main Grid: Form + Informational Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Enquiry Form (7 Columns on Desktop) */}
          <div className="lg:col-span-8">
            <ArchiveEnquiryForm lang={locale} dict={dict} />
          </div>

          {/* Sidebar / Instructions & How It Works (4 Columns on Desktop) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* How It Works Card */}
            <div className="rounded-2xl border border-[#016BB7]/20 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#016BB7] font-extrabold text-base border-b border-[#016BB7]/15 pb-3">
                <Archive className="h-5 w-5 text-[#016BB7]" />
                <h2>{isGu ? "પ્રક્રિયા કેવી રીતે કાર્ય કરે છે?" : "How the Enquiry Works"}</h2>
              </div>

              <ol className="space-y-4 text-xs text-[#1F2937]/85">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#016BB7] text-white font-bold text-xs">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-[#1F2937] text-sm">
                      {isGu ? "પૂછપરછ સબમિટ કરો" : "Submit Your Enquiry"}
                    </p>
                    <p className="mt-0.5 leading-relaxed text-[#1F2937]/75">
                      {isGu
                        ? "પ્રકાશન, અંદાજિત વર્ષ અને જરૂરી માહિતીની વિગતો સાથે ફોર્મ ભરો."
                        : "Select the publication, year, and provide details of the article or notice."}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#016BB7] text-white font-bold text-xs">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-[#1F2937] text-sm">
                      {isGu ? "આર્કાઇવ વેરિફિકેશન" : "Archive Verification"}
                    </p>
                    <p className="mt-0.5 leading-relaxed text-[#1F2937]/75">
                      {isGu
                        ? "અમારી ટીમ ભૌતિક સંગ્રહ અને માઇક્રોફિલ્મ રેકોર્ડ્સમાં સંબંધિત અંકની તપાસ કરશે."
                        : "Our research staff inspects physical bound volumes and microfilm records."}
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#016BB7] text-white font-bold text-xs">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-[#1F2937] text-sm">
                      {isGu ? "સંપર્ક અને માહિતી આપવી" : "Direct Contact & Access"}
                    </p>
                    <p className="mt-0.5 leading-relaxed text-[#1F2937]/75">
                      {isGu
                        ? "માહિતીની ઉપલબ્ધતા અને પ્રાપ્તિ પ્રક્રિયા અંગે આપનો ફોન અથવા ઈમેલ દ્વારા સંપર્ક કરાશે."
                        : "Our team contacts you via your preferred channel with availability and retrieval details."}
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Covered Publications List */}
            <div className="rounded-2xl border border-[#016BB7]/20 bg-white p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#016BB7] font-extrabold text-sm border-b border-[#016BB7]/15 pb-2">
                <BookOpen className="h-4 w-4 text-[#016BB7]" />
                <h3>{isGu ? "આર્કાઇવ પ્રકાશનો યાદી" : "Covered Publications"}</h3>
              </div>
              <ul className="text-xs text-[#1F2937]/80 space-y-1.5 divide-y divide-[#016BB7]/10">
                <li className="pt-1.5 flex justify-between font-medium">
                  <span>{isGu ? "જન્મભૂમિ (દૈનિક સાંધ્ય)" : "Janmabhoomi (Daily)"}</span>
                  <span className="text-[#016BB7] font-bold">1934 – 2026</span>
                </li>
                <li className="pt-1.5 flex justify-between font-medium">
                  <span>{isGu ? "કચ્છમિત્ર" : "Kutchmitra"}</span>
                  <span className="text-[#016BB7] font-bold">1947 – 2026</span>
                </li>
                <li className="pt-1.5 flex justify-between font-medium">
                  <span>{isGu ? "ફૂલછાબ" : "Phulchhab"}</span>
                  <span className="text-[#016BB7] font-bold">1950 – 2026</span>
                </li>
                <li className="pt-1.5 flex justify-between font-medium">
                  <span>{isGu ? "વ્યાપાર (ગુજરાતી / હિન્દી)" : "Vyapar (Guj / Hindi)"}</span>
                  <span className="text-[#016BB7] font-bold">1949 / 1987 – 2026</span>
                </li>
                <li className="pt-1.5 flex justify-between font-medium">
                  <span>{isGu ? "જન્મભૂમિ પ્રવાસી" : "Janmabhoomi Pravasi"}</span>
                  <span className="text-[#016BB7] font-bold">1939 – 2026</span>
                </li>
                <li className="pt-1.5 flex justify-between font-medium">
                  <span>{isGu ? "પંચાંગ & કવિતા" : "Panchang & Kavita"}</span>
                  <span className="text-[#016BB7] font-bold">1939 / 1968 – 2026</span>
                </li>
              </ul>
            </div>

            {/* Need Urgent Legal / Research Help */}
            <div className="rounded-2xl border border-[#016BB7]/25 bg-[#F0F6FA] p-5 space-y-2 text-xs">
              <p className="font-bold text-[#016BB7] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#016BB7]" />
                <span>{isGu ? "સંશોધન અને કાનૂની પૂછપરછ" : "Legal & Scholarly Research"}</span>
              </p>
              <p className="text-[#1F2937]/80 leading-relaxed">
                {isGu
                  ? "અદાલતી કેસ, પીએચ.ડી. સંશોધન અથવા દસ્તાવેજી ચકાસણી માટે જન્મભૂમિ ભવન, ફોર્ટ, મુંબઈ ખાતે અમારા આર્કાઇવ વિભાગનો સીધો સંપર્ક કરી શકો છો."
                  : "For court records, academic research, or institutional documentation, you may also reach the Saurashtra Trust Archive Section at Janmabhoomi Bhavan, Fort, Mumbai."}
              </p>
              <div className="pt-1">
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-1 text-[#016BB7] font-bold hover:underline"
                >
                  <span>{dict.header.contact}</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

          </aside>
        </div>

      </div>
    </div>
  );
}
