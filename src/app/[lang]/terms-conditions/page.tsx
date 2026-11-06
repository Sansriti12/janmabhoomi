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
        ? "નિયમો અને શરતો | જન્મભૂમિ ગ્રુપ"
        : "Terms & Conditions | Janmabhoomi Group",
    description:
      locale === "gu"
        ? "જન્મભૂમિ ગ્રુપ (સૌરાષ્ટ્ર ટ્રસ્ટ) ડિજિટલ સમાચારપત્ર પોર્ટલના ઉપયોગ અંગેના નિયમો અને શરતો."
        : "Terms of service and digital subscription conditions governing access to Janmabhoomi digital publications (Saurashtra Trust).",
  };
}

export default async function TermsConditionsPage({
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
              {isGu ? "કાનૂની અને નિયમનકારી શરતો" : "LEGAL & REGULATORY TERMS"}
            </span>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#016BB7]">
              {dict.footer.termsConditions}
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
                {isGu ? "૧. પ્લેટફોર્મની સ્વીકૃતિ" : "1. Acceptance of Terms"}
              </h2>
              <p>
                {isGu
                  ? "જન્મભૂમિ (સૌરાષ્ટ્ર ટ્રસ્ટ) ડિજિટલ પોર્ટલ, વેબસાઇટ અથવા મોબાઇલ એપ્લિકેશનનો ઉપયોગ કરીને તમે આ નિયમો અને શરતો સાથે બંધાયેલા રહેવાની સંમતિ આપો છો. જો તમે આ શરતો સાથે અસહમત હોવ તો તમારે વેબસાઇટનો ઉપયોગ કરવો નહીં."
                  : "By accessing or using the Janmabhoomi digital newspaper platform, website, or associated mobile applications operated by Saurashtra Trust, you agree to be bound by these Terms and Conditions. If you do not accept these terms, you should discontinue use of the platform."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૨. બૌદ્ધિક સંપત્તિ અને કોપીરાઇટ" : "2. Intellectual Property & Copyright"}
              </h2>
              <p>
                {isGu
                  ? "વેબસાઇટ પર પ્રકાશિત તમામ સમાચારો, અહેવાલો, અગ્રલેખો, તસવીરો, માસ્ટહેડ, જન્મભૂમિ લોગો અને ઈ-પેપર પીડીએફ સામગ્રીના સર્વાધિકાર જન્મભૂમિ ગ્રુપ / સૌરાષ્ટ્ર ટ્રસ્ટ પાસે કાયદેસર રીતે સુરક્ષિત છે. લેખિત પૂર્વમંજૂરી વિના કોઈપણ સામગ્રીનું પુનઃપ્રકાશન, કોપિયિંગ અથવા વ્યાપારી હેતુ માટે વિતરણ સખત પ્રતિબંધિત છે."
                  : "All news dispatches, investigative articles, editorials, photographic works, publication mastheads, brand logos, and digital E-Paper edition pages are the exclusive intellectual property of the Janmabhoomi Group / Saurashtra Trust. Reproduction, archiving, scraping, or commercial dissemination without explicit written consent is strictly prohibited."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૩. ઈ-પેપર સબ્સ્ક્રિપ્શન અને ઉપયોગ" : "3. E-Paper Subscriptions & Access Rules"}
              </h2>
              <p>
                {isGu
                  ? "ડિજિટલ ઈ-પેપર સબ્સ્ક્રિપ્શન વ્યક્તિગત વાચક ઉપયોગ માટે છે. સબ્સ્ક્રિપ્શન લોગિન વિગતો અથવા ડાઉનલોડ કરેલા અખબારના પાના અન્ય વ્યક્તિઓ કે જૂથો સાથે વહેંચવા માન્ય નથી."
                  : "Digital E-Paper subscriptions are granted strictly for individual reader access. Sharing authentication credentials, redistributing page downloads across external messaging platforms, or public rebroadcasting without institutional licensing is not permitted."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૪. પેમેન્ટ્સ અને રિફંડ નીતિ" : "4. Subscription Payments & Refund Policy"}
              </h2>
              <p>
                {isGu
                  ? "ડિજિટલ સબ્સ્ક્રિપ્શન રકમ અગાઉથી ચૂકવવાની રહેશે. ટેકનિકલ ખામીના કિસ્સામાં સબ્સ્ક્રિપ્શન સપોર્ટ ટીમ દ્વારા તપાસ બાદ માન્ય સમાધાન કરવામાં આવશે."
                  : "All subscription fees are payable in advance via authorized digital payment gateways. In cases of verifiable payment processing failures or technical delivery disruption, inquiries will be reviewed promptly by our subscription support desk."}
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu ? "૫. ન્યાયક્ષેત્ર અને અધિકારક્ષેત્ર" : "5. Jurisdiction & Governance"}
              </h2>
              <p>
                {isGu
                  ? "આ શરતો અને કોઈપણ કાનૂની વિવાદ ભારતીય કાયદાઓ હેઠળ શાસિત થશે અને તેનો અધિકારક્ષેત્ર ફક્ત મુંબઈની અદાલતો હેઠળ રહેશે."
                  : "These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any legal disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Mumbai, Maharashtra."}
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
