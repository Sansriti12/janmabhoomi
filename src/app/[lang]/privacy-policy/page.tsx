import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

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
        ? "પ્રાઇવસી પોલિસી | જન્મભૂમિ ગ્રુપ"
        : "Privacy Policy | Janmabhoomi Group",
    description:
      locale === "gu"
        ? "જન્મભૂમિ ગ્રુપ (સૌરાષ્ટ્ર ટ્રસ્ટ) ડિજિટલ પોર્ટલ પ્રાઇવસી પોલિસી અને ડેટા સુરક્ષા નીતિ."
        : "Privacy Policy and data protection standards for the Janmabhoomi digital newspaper platform (Saurashtra Trust).",
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isGu = lang === "gu";
  const dict = getDictionary(isGu ? "gu" : "en");

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:text-[#016BB7]/80"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{isGu ? "મુખ્ય પાનાં પર પાછા ફરો" : "Back to Home"}</span>
          </Link>
        </div>

        {/* Content Card */}
        <div className="rounded-xl border border-[#016BB7]/20 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-[#016BB7]/15 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#016BB7]">
              {isGu ? "કાનૂની અને નીતિ વિષયક દસ્તાવેજ" : "LEGAL & POLICY DOCUMENT"}
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#016BB7]">
              {dict.footer.privacyPolicy}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-[#1F2937]/70">
              {isGu
                ? "છેલ્લી સુધારણા: નવેમ્બર ૨૦૨૬ • સૌરાષ્ટ્ર ટ્રસ્ટ / જન્મભૂમિ ગ્રુપ"
                : "Last Updated: November 2026 • Saurashtra Trust / Janmabhoomi Group"}
            </p>
          </div>

          <div className="space-y-6 text-sm sm:text-base text-[#1F2937]/90 leading-relaxed font-normal">
            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૧. પરિચય અને વચનબદ્ધતા" : "1. Introduction & Commitment"}
              </h2>
              <p>
                {isGu
                  ? "જન્મભૂમિ ગ્રુપ (સૌરાષ્ટ્ર ટ્રસ્ટ) વાચકો અને ગ્રાહકોની અંગત માહિતીની સુરક્ષા તથા ગોપનીયતાનો આદર કરે છે. ૯૩ વર્ષથી વધુ સમયથી સ્થાપિત વિશ્વાસ અને નૈતિક પત્રકારિતાની પરંપરાને અનુરૂપ, અમે અમારા ડિજિટલ પોર્ટલ, મોબાઇલ પ્લેટફોર્મ અને ઈ-પેપર સેવાનો ઉપયોગ કરતા તમામ વાચકોના ડેટાની કાયદાકીય મર્યાદામાં સુરક્ષા જાળવવા કટિબદ્ધ છીએ."
                  : "The Janmabhoomi Group (under Saurashtra Trust) values the trust and privacy of our readers and subscribers. In accordance with our 93+ year tradition of ethical public service, we are committed to safeguarding the personal data of all users engaging with our digital platforms, mobile interfaces, and digital E-Paper editions."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૨. માહિતી સંગ્રહ" : "2. Information We Collect"}
              </h2>
              <p>
                {isGu
                  ? "અમે વાચકોના અનુભવને સરળ અને વ્યક્તિગત બનાવવા માટે નીચે મુજબની સીમિત માહિતી એકત્રિત કરીએ છીએ:"
                  : "We collect minimal and purposeful information necessary to provide seamless services:"}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-[#1F2937]/85">
                <li>
                  {isGu
                    ? "બ્રાઉઝિંગ અને પસંદગીઓ: ભાષા પસંદગી (ગુજરાતી / English) અને પોપઅપ સેટિંગ્સ સ્થાનિક બ્રાઉઝર કુકીઝ દ્વારા સચવાય છે."
                    : "Browsing Preferences: Selected language (Gujarati / English) and alert preferences stored in client-side cookies/localStorage."}
                </li>
                <li>
                  {isGu
                    ? "સબ્સ્ક્રિપ્શન વિગતો: જ્યારે તમે ઈ-પેપર સબ્સ્ક્રાઇબ કરો છો, ત્યારે પ્રમાણીકરણ માટે જરૂરી નામ, ઈમેલ, ફોન નંબર અને પેમેન્ટ ટ્રાન્ઝેક્શન આઈડી સચવાય છે."
                    : "Subscription & Account Information: Name, verified email address, phone number, and transaction references for E-Paper access."}
                </li>
                <li>
                  {isGu
                    ? "ટેકનિકલ ડેટા: સાઇટની કાર્યક્ષમતા અને સુરક્ષા માટે અનામી આઈપી સરનામું અને બ્રાઉઝર પ્રકારનું લોગિંગ."
                    : "Technical Telemetry: Anonymized IP addresses, browser types, and access timestamps used strictly for platform diagnostics and security."}
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૩. માહિતીનો ઉપયોગ" : "3. How We Use Information"}
              </h2>
              <p>
                {isGu
                  ? "એકત્રિત કરાયેલ માહિતીનો ઉપયોગ માત્ર ડિજિટલ સમાચાર સેવાઓ પૂરી પાડવા, ઈ-પેપર એક્સેસ પ્રમાણિત કરવા, પેમેન્ટ પ્રોસેસ કરવા અને ગ્રાહક સેવા સહાય માટે જ કરવામાં આવે છે. અમે વાચકોની અંગત વિગતો કોઈપણ તૃતીય પક્ષને વ્યાપારી હેતુ માટે વેચતા કે ભાડે આપતા નથી."
                  : "Collected data is used solely to deliver news feeds, authenticate E-Paper subscriptions, process secure transactions, and provide customer support. We do not sell, rent, or trade reader data with commercial advertisers."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૪. પેમેન્ટ અને વ્યવહાર સુરક્ષા" : "4. Payment & Transaction Security"}
              </h2>
              <p>
                {isGu
                  ? "તમામ ઓનલાઇન પેમેન્ટ્સ આરબીઆઈ-પ્રમાણિત સુરક્ષિત પેમેન્ટ ગેટવે (જેમ કે PayU) મારફતે પ્રોસેસ થાય છે. જન્મભૂમિ સર્વર પર ક્યારેય ક્રેડિટ કાર્ડ, ડેબિટ કાર્ડ કે બેંક પાસવર્ડ સંગ્રહિત થતા નથી."
                  : "All subscription transactions are processed via RBI-authorized, encrypted payment gateways (e.g. PayU). Janmabhoomi servers never store full payment card credentials, PINs, or net banking passwords."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૫. સંપર્ક અને પ્રશ્નો" : "5. Contact & Privacy Inquiries"}
              </h2>
              <p>
                {isGu
                  ? "ગોપનીયતા નીતિ અથવા તમારા વ્યક્તિગત ડેટા સંબંધિત કોઈપણ પ્રશ્ન માટે, કૃપા કરીને અમારા સત્તાવાર સંપર્ક પેજ દ્વારા અમારો સંપર્ક કરો."
                  : "For inquiries regarding our privacy standards or to request account updates, please reach out via our official contact channels."}
              </p>
              <div className="pt-2">
                <Link
                  href={`/${lang}/contact`}
                  className="inline-flex items-center gap-1.5 font-bold text-[#016BB7] hover:text-[#016BB7]/80"
                >
                  <span>{dict.header.contact} →</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
