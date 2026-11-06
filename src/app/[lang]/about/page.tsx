import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ArrowRight } from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { BrandLogo } from "@/components/shared/BrandLogo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  return {
    title: locale === "gu" ? "અમારા વિશે | જન્મભૂમિ ગ્રુપ" : "About Us | Janmabhoomi Group",
    description:
      locale === "gu"
        ? "પત્રકારિતા, જાહેર સેવા અને પ્રાદેશિક જોડાણની ૯૩+ વર્ષની પરંપરા. સૌરાષ્ટ્ર ટ્રસ્ટના નેજા હેઠળનું જન્મભૂમિ ગ્રુપ."
        : "A 93+ year tradition of journalism, public service, and regional engagement under Saurashtra Trust.",
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isGu = lang === "gu";
  const dict = getDictionary(isGu ? "gu" : "en");

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* HERO SECTION */}
        <div className="rounded-xl border border-[#016BB7]/20 bg-white p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#016BB7]/15">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#016BB7]">
                {isGu ? "સૌરાષ્ટ્ર ટ્રસ્ટ • સ્થાપના ૧૯૩૧" : "SAURASHTRA TRUST • EST. 1931"}
              </span>
              <h1 className="mt-1 text-2xl sm:text-4xl font-extrabold text-[#016BB7] tracking-tight leading-tight">
                {isGu ? "જન્મભૂમિ ગ્રુપ" : "Janmabhoomi Group"}
              </h1>
              <p className="mt-2 text-base sm:text-lg font-bold text-[#016BB7]">
                {isGu
                  ? "પત્રકારિતા, જાહેર સેવા અને પ્રાદેશિક જોડાણની ૯૩+ વર્ષની પરંપરા"
                  : "A 93+ Year Tradition of Journalism, Public Service, and Regional Engagement"}
              </p>
            </div>
            <div className="shrink-0 bg-[#F0F6FA] p-3 rounded-xl border border-[#016BB7]/15 self-start md:self-auto">
              <BrandLogo priority compact={false} />
            </div>
          </div>

          {/* MAIN NARRATIVE */}
          <div className="mt-6 space-y-4 text-sm sm:text-base text-[#1F2937]/90 leading-relaxed font-normal">
            <p>
              {isGu
                ? "૯૩ વર્ષથી વધુ સમયથી, Saurashtra Trustના નેજા હેઠળનું જન્મભૂમિ ગ્રુપ ગુજરાતી પત્રકારિતા, જાહેર સંચાર અને બિઝનેસ પબ્લિશિંગ ક્ષેત્રે એક પ્રતિષ્ઠિત સંસ્થા તરીકે કાર્યરત છે. સમાચારોની વિશ્વસનીયતા, સ્થાનિક સમજ અને સેવા કાર્યો દ્વારા સમાજની પડખે રહેવાની મજબૂત પરંપરા સાથે જન્મભૂમિ ગ્રુપે પેઢી દર પેઢી લાખો વાચકો સાથે વિશ્વાસપૂર્ણ અને મજબૂત સંબંધ સ્થાપિત કર્યો છે."
                : "For more than 93 years, under the aegis of Saurashtra Trust, the Janmabhoomi Group has operated as an esteemed institution in Gujarati journalism, public communication, and business publishing. With a robust tradition of journalistic credibility, nuanced local insight, and steadfast solidarity through public service, the Janmabhoomi Group has built an enduring relationship of trust with millions of readers across generations."}
            </p>
            <p>
              {isGu
                ? "Saurashtra Trustની સ્થાપના ૧૯૩૧માં પ્રતિષ્ઠિત સ્વાતંત્ર્ય સેનાની શ્રી અમૃતલાલ શેઠ દ્વારા કરવામાં આવી હતી. ૯ જૂન ૧૯૩૪ના રોજ ટ્રસ્ટે મુંબઈથી ગુજરાતી દૈનિક ‘જન્મભૂમિ’નું પ્રકાશન શરૂ કર્યું. ટ્રસ્ટની સ્થાપનાનો મુખ્ય ઉદ્દેશ અખબારો અને સામયિકોનું પ્રકાશન તથા સામાજિક સંસ્થાઓને તેમની કામગીરી અને સેવાકીય પ્રયાસોમાં સહયોગ આપવાનો રહ્યો છે."
                : "Saurashtra Trust was established in 1931 by veteran freedom fighter Shri Amritlal Sheth. On 9 June 1934, the Trust launched the Gujarati daily 'Janmabhoomi' from Mumbai. The foundational objective of the Trust has always been the publication of newspapers and periodicals, alongside actively partnering with social and public institutions in their philanthropic endeavors."}
            </p>
          </div>

          {/* STATS HIGHLIGHT BAR */}
          <div className="mt-8 rounded-lg bg-[#F0F6FA] border border-[#016BB7]/15 p-5 sm:p-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#016BB7] mb-3 text-center sm:text-left">
              {isGu ? "વિશ્વાસ પર નિર્મિત વારસો" : "A Heritage Built on Reader Trust"}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg border border-[#016BB7]/15">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#016BB7]">93+</p>
                <p className="text-xs font-bold text-[#1F2937]/80 mt-1">
                  {isGu ? "વર્ષનો વારસો" : "Years of Heritage"}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#016BB7]/15">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#016BB7]">5+</p>
                <p className="text-xs font-bold text-[#1F2937]/80 mt-1">
                  {isGu ? "મુખ્ય પ્રકાશનો" : "Core Publications"}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#016BB7]/15">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#016BB7]">5M+</p>
                <p className="text-xs font-bold text-[#1F2937]/80 mt-1">
                  {isGu ? "પ્રાદેશિક વાચકો" : "Regional Readership"}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#016BB7]/15">
                <p className="text-xl sm:text-2xl font-extrabold text-[#016BB7]">Print + Digital</p>
                <p className="text-xs font-bold text-[#1F2937]/80 mt-1">
                  {isGu ? "ગુજરાત અને મહારાષ્ટ્ર" : "Gujarat & Maharashtra"}
                </p>
              </div>
            </div>
            <p className="mt-3.5 text-xs sm:text-sm text-[#1F2937]/80 text-center leading-relaxed">
              {isGu
                ? "જન્મભૂમિ ગ્રુપની લાંબા સમયથી સ્થાપિત વિશ્વસનીયતા, પ્રાદેશિક પ્રભાવ અને વાચકો સાથેના મજબૂત જોડાણે તેને ગુજરાતી ભાષાના પત્રકારત્વ અને વ્યવસાયિક પ્રકાશન ક્ષેત્રે એક વિશિષ્ટ સંસ્થા બનાવી છે."
                : "The Janmabhoomi Group's long-established credibility, regional influence, and strong reader loyalty make it a distinctive benchmark in Gujarati journalism and commercial publishing."}
            </p>
          </div>
        </div>

        {/* SECTION 2 – OUR PUBLICATIONS */}
        <div className="rounded-xl border border-[#016BB7]/20 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-[#016BB7]/15 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#016BB7]">
              {isGu ? "અમારા પ્રકાશનો" : "Our Publications & Media Network"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/75">
              {isGu
                ? "જન્મભૂમિ ગ્રુપે વિવિધ પ્રદેશો, રસ અને વાચકવર્ગને સેવા આપતું વૈવિધ્યસભર પ્રકાશન તંત્ર વિકસાવ્યું છે."
                : "The Janmabhoomi Group has developed a comprehensive multi-title network serving diverse geographies, readerships, and commercial interests."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kutchmitra */}
            <div className="rounded-xl border border-[#016BB7]/20 bg-white p-5 flex flex-col justify-between hover:border-[#016BB7] hover:shadow-xs transition-all">
              <div>
                <h3 className="text-lg font-extrabold text-[#016BB7] mb-2">
                  {isGu ? "કચ્છમિત્ર" : "Kutchmitra"}
                </h3>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {isGu
                    ? "દાયકાઓથી કચ્છના લોકો સુધી સમાચાર પહોંચાડતું ‘કચ્છમિત્ર’ એક મજબૂત પ્રાદેશિક અવાજ અને કચ્છી સમાજ માટે માહિતીના મહત્વપૂર્ણ સ્ત્રોત તરીકે પોતાની આગવી ઓળખ ધરાવે છે. તેનું કવરેજ કચ્છની સામાજિક, આર્થિક અને વિકાસયાત્રાને પ્રતિબિંબિત કરે છે. કુદરતી આફતો અને જાહેર જરૂરિયાતના સમયમાં લોકો સાથે તેનું લાંબા સમયથી રહેલું જોડાણ વિશેષ નોંધપાત્ર રહ્યું છે."
                    : "For decades, 'Kutchmitra' has served as the authentic regional voice and premier source of news for the Kutch community. Its coverage reflects Kutch's social, economic, and developmental trajectory, distinguished particularly by its on-the-ground solidarity during natural calamities."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#016BB7]/15">
                <a
                  href="https://www.kutchmitradaily.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:text-[#016BB7]/80"
                >
                  <span>www.kutchmitradaily.com</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Phulchhab */}
            <div className="rounded-xl border border-[#016BB7]/20 bg-white p-5 flex flex-col justify-between hover:border-[#016BB7] hover:shadow-xs transition-all">
              <div>
                <h3 className="text-lg font-extrabold text-[#016BB7] mb-2">
                  {isGu ? "ફૂલછાબ" : "Phulchhab"}
                </h3>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {isGu
                    ? "સૌરાષ્ટ્રની સમૃદ્ધ પરંપરામાંથી વિકસેલું ‘ફૂલછાબ’ શતાબ્દી પાર કરી ગયું છે અને ગુજરાતના ઐતિહાસિક ગુજરાતી પ્રકાશનોમાંનું એક છે. તેની ઓળખ નિર્ભીક પત્રકારિતા, લોકલક્ષી અહેવાલો તથા સૌરાષ્ટ્રના સામાજિક, સાંસ્કૃતિક અને વિકાસલક્ષી જીવન સાથેના ગાઢ જોડાણ સાથે સંકળાયેલી છે. પ્રકાશને પ્રાદેશિક મુદ્દાઓ, કૃષિ, વિકાસ, વેપાર, ઉદ્યોગ, સામાજિક બાબતો અને જાહેર પ્રશ્નોને ઐતિહાસિક રીતે આવરી લીધા છે."
                    : "Born from Saurashtra's rich journalistic soil, 'Phulchhab' has crossed its centenary, standing as one of Gujarat's most historic newspapers. Renowned for fearless journalism and grassroots reporting, it chronicles Saurashtra's social, agricultural, trade, industrial, and developmental journey."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#016BB7]/15">
                <a
                  href="https://www.phulchhab.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:text-[#016BB7]/80"
                >
                  <span>www.phulchhab.com</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Vyapar Gujarati */}
            <div className="rounded-xl border border-[#016BB7]/20 bg-white p-5 flex flex-col justify-between hover:border-[#016BB7] hover:shadow-xs transition-all">
              <div>
                <h3 className="text-lg font-extrabold text-[#016BB7] mb-2">
                  {isGu ? "વ્યાપાર ગુજરાતી" : "Vyapar (Gujarati)"}
                </h3>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {isGu
                    ? "ગુજરાતી વાચકોમાં વેપાર, વાણિજ્ય અને ઉદ્યોગ સાથે જોડાયેલા લોકોની વધતી માહિતીની જરૂરિયાતને ધ્યાનમાં રાખીને ‘વ્યાપાર’ એક સમર્પિત કોમર્શિયલ પ્રકાશન તરીકે વિકસ્યું. વર્ષો દરમિયાન તેણે બિઝનેસ ન્યૂઝ, બજારો, આર્થિક વિકાસ, વ્યાપારી પ્રવાહો, નિયમો અને બિઝનેસ સમુદાયને અસર કરતા મુદ્દાઓ પર મજબૂત ઓળખ બનાવી છે."
                    : "Catering to traders, industrialists, and commercial professionals, 'Vyapar' evolved as India's dedicated financial newspaper in Gujarati. It has built an unmatched reputation for business intelligence, commodities, markets, and economic analysis."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#016BB7]/15">
                <a
                  href="https://vyapar.janmabhoominewspapers.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:text-[#016BB7]/80"
                >
                  <span>vyapar.janmabhoominewspapers.com</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Vyapar Hindi */}
            <div className="rounded-xl border border-[#016BB7]/20 bg-white p-5 flex flex-col justify-between hover:border-[#016BB7] hover:shadow-xs transition-all">
              <div>
                <h3 className="text-lg font-extrabold text-[#016BB7] mb-2">
                  {isGu ? "વ્યાપાર હિન્દી" : "Vyapar (Hindi)"}
                </h3>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {isGu
                    ? "‘વ્યાપાર હિન્દી’ હિન્દીભાષી વાચકો સુધી ગ્રુપના બિઝનેસ અને કોમર્શિયલ પબ્લિશિંગ ઈકોસિસ્ટમને વિસ્તારે છે અને બિઝનેસ માહિતી, બજારના વિકાસ તથા વ્યાપારી સમાચાર પ્રસ્તુત કરે છે. વ્યાપાર હિન્દી આવૃત્તિ ભારતના હિન્દી બેલ્ટમાં પણ મોટી રીડરશિપ ધરાવે છે."
                    : "'Vyapar Hindi' expands the Group's commercial publishing ecosystem to the national Hindi-speaking commercial hubs, providing authoritative commodity market insights, business analysis, and industrial trends."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#016BB7]/15">
                <a
                  href="https://vyaparhindi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:text-[#016BB7]/80"
                >
                  <span>www.vyaparhindi.com</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Janmabhoomi Pravasi */}
            <div className="rounded-xl border border-[#016BB7]/20 bg-white p-5 flex flex-col justify-between hover:border-[#016BB7] hover:shadow-xs transition-all">
              <div>
                <h3 className="text-lg font-extrabold text-[#016BB7] mb-2">
                  {isGu ? "જન્મભૂમિ પ્રવાસી" : "Janmabhoomi Pravasi"}
                </h3>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {isGu
                    ? "‘જન્મભૂમિ પ્રવાસી’ ગ્રુપના પ્રકાશન તંત્રમાં આગવું સ્થાન ધરાવે છે. તેમાં સમાચાર અને વિશ્લેષણ ઉપરાંત સમાજ, સંસ્કૃતિ, આરોગ્ય, વિજ્ઞાન, સાહિત્ય, મનોરંજન અને અન્ય સામાન્ય રસના વિષયો આવરી લેવામાં આવે છે. તેના વિશાળ સંપાદકીય ફોર્મેટે પરંપરાગત દૈનિક સમાચાર વાચનથી આગળ વધીને ગુજરાતી વાચકવર્ગ સાથે જોડાણ બનાવ્યું છે."
                    : "Occupying a special place in the Group's network, 'Janmabhoomi Pravasi' is the beloved Sunday flagship, presenting rich essays on culture, literature, science, health, society, and thoughtful geopolitical analysis."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#016BB7]/15">
                <a
                  href="https://pravasi.janmabhoominewspapers.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:text-[#016BB7]/80"
                >
                  <span>pravasi.janmabhoominewspapers.com</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Other Cultural Titles: Kavita & Panchang */}
            <div className="rounded-xl border border-[#016BB7]/20 bg-white p-5 flex flex-col justify-between hover:border-[#016BB7] hover:shadow-xs transition-all">
              <div>
                <h3 className="text-lg font-extrabold text-[#016BB7] mb-2">
                  {isGu ? "કવિતા અને જન્મભૂમિ પંચાંગ" : "Kavita & Janmabhoomi Panchang"}
                </h3>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {isGu
                    ? "જન્મભૂમિ ગ્રુપના વિશાળ પ્રકાશન વારસામાં ‘કવિતા’ (ત્રિમાસિક સાહિત્ય સામાયિક) અને ‘જન્મભૂમિ પંચાંગ’નો પણ સમાવેશ થાય છે, જે ગુજરાતી ભાષા, સાહિત્ય, સંસ્કૃતિ અને પરંપરાગત ખગોળ જ્ઞાન સાથેના તેના લાંબા સમયના જોડાણને પ્રતિબિંબિત કરે છે."
                    : "The Group's rich heritage also encompasses 'Kavita' (prestigious quarterly poetry journal) and the authentic 'Janmabhoomi Panchang', reflecting decades of stewardship over Gujarati literature, culture, and traditional astronomical science."}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#016BB7]/15 flex items-center gap-4 text-xs font-bold">
                <Link href={`/${lang}/panchang`} className="text-[#016BB7] hover:text-[#016BB7]/80">
                  {isGu ? "દૈનિક પંચાંગ જુઓ →" : "View Daily Panchang →"}
                </Link>
                <Link href={`/${lang}/epaper?publication=pub-kavita`} className="text-[#016BB7] hover:text-[#016BB7]/80">
                  {isGu ? "કવિતા સામયિક →" : "Kavita Journal →"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 – JOURNALISM WITH PUBLIC RESPONSIBILITY */}
        <div className="rounded-xl border border-[#016BB7]/20 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-[#016BB7]/15 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#016BB7]">
              {isGu ? "જવાબદારીની મજબૂત ભાવના સાથેની પત્રકારિતા" : "Journalism Rooted in Public Duty"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/75">
              {isGu
                ? "જન્મભૂમિ ગ્રુપ માટે પત્રકારિતા ઐતિહાસિક રીતે જાહેર સેવા અને સામાજિક જવાબદારી સાથે ગાઢ રીતે જોડાયેલી રહી છે."
                : "For the Janmabhoomi Group, journalism has historically been inseparable from public welfare and civic accountability."}
            </p>
          </div>

          <div className="space-y-4 text-sm sm:text-base text-[#1F2937]/90 leading-relaxed font-normal">
            <p>
              {isGu
                ? "ગ્રુપના પ્રકાશનોએ કુદરતી આફતો, સામાજિક પડકારો અને રાષ્ટ્રીય મહત્વની ઘટનાઓ દરમિયાન સતત સમાજ સાથે ઉભા રહીને કામગીરી કરી છે. તેમની સંસ્થાકીય વિચારધારામાં માત્ર ઘટનાઓનું રિપોર્ટિંગ જ નહીં, પરંતુ જનજાગૃતિ, સામાજિક કલ્યાણ અને રચનાત્મક સામુદાયિક પ્રયાસોમાં યોગદાન આપવાની ભાવનાનો પણ સમાવેશ થાય છે."
                : "Throughout history, the Group's publications have stood shoulder-to-shoulder with society through natural crises, social movements, and national milestones. Their institutional philosophy transcends mere event reporting, prioritizing constructive civic welfare and nationwide public advocacy."}
            </p>

            {/* Historic Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-[#F0F6FA] rounded-lg border border-[#016BB7]/15">
                <p className="font-extrabold text-[#016BB7] text-base mb-1.5">
                  {isGu ? "૧૯૯૯ કારગિલ રાહત ફંડ — ₹૮.૧૦ કરોડ" : "1999 Kargil Relief Fund — ₹8.10 Crore"}
                </p>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {isGu
                    ? "૧૯૯૯ના કારગિલ સંઘર્ષ દરમિયાન જન્મભૂમિ ગ્રુપે દેશભક્તિની ભાવનાથી ફંડ એકત્ર કરવાની પહેલ કરીને દેશભરમાં સૌથી વધુ-અંદાજે ₹૮.૧૦ કરોડ ફંડ એકત્ર કર્યું હતું, જેને જનતા તરફથી અભૂતપૂર્વ પ્રતિસાદ મળ્યો હતો."
                    : "During the 1999 Kargil conflict, the Janmabhoomi Group spearheaded a nationwide patriotic appeal, collecting approximately ₹8.10 crore—the single highest relief fund generated across the country by any newspaper organization."}
                </p>
              </div>

              <div className="p-4 bg-[#F0F6FA] rounded-lg border border-[#016BB7]/15">
                <p className="font-extrabold text-[#016BB7] text-base mb-1.5">
                  {isGu ? "૨૦૦૧ કચ્છ ભૂકંપ — ૫ ગામોનું પુનર્વસન" : "2001 Kutch Earthquake — 5 Villages Rebuilt"}
                </p>
                <p className="text-xs sm:text-sm text-[#1F2937]/85 leading-relaxed">
                  {isGu
                    ? "૨૦૦૧ના વિનાશક ભૂકંપ વખતે ‘કચ્છમિત્ર’એ સજાગ પત્રકારત્વ ધર્મ બજાવવાની સાથે કચ્છનાં ૫ અંતરિયાળ ગામોનું સંપૂર્ણ પુનર્વસન કરાવ્યું હતું, જે પત્રકારિતાથી આગળ વધીને સમુદાયના પુનઃનિર્માણની અનોખી પરંપરા દર્શાવે છે."
                    : "During the catastrophic 2001 Kutch earthquake, 'Kutchmitra' went far beyond news reporting, directly spearheading the complete physical rehabilitation of 5 remote rural villages in Kutch."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4 – CORE INSTITUTIONAL PILLARS */}
        <div className="rounded-xl border border-[#016BB7]/20 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="border-b border-[#016BB7]/15 pb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#016BB7]">
              {isGu ? "જાહેર હિતની પત્રકારિતાની પરંપરા" : "Tradition of Public-Interest Journalism"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/75">
              {isGu
                ? "જન્મભૂમિ ગ્રુપનો ઇતિહાસ ભારતના સ્વાતંત્ર્ય સંગ્રામ અને ગુજરાતી પત્રકારિતાના વિકાસ સાથે ગાઢ રીતે જોડાયેલો છે."
                : "The Janmabhoomi Group's chronicle is deeply intertwined with India's independence movement and the evolution of the regional free press."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {[
              { gu: "વિશ્વસનીય પત્રકારિતા", en: "Credible Journalism" },
              { gu: "જાહેર હિત", en: "Public Interest" },
              { gu: "જવાબદાર સંચાર", en: "Responsible Communication" },
              { gu: "પ્રાદેશિક જોડાણ", en: "Regional Connection" },
              { gu: "સામાજિક જવાબદારી", en: "Social Accountability" },
            ].map((pillar) => (
              <span
                key={pillar.en}
                className="inline-flex items-center rounded-md bg-[#F0F6FA] border border-[#016BB7]/20 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[#016BB7]"
              >
                <span>{isGu ? pillar.gu : pillar.en}</span>
              </span>
            ))}
          </div>

          <div className="space-y-4 text-sm sm:text-base text-[#1F2937]/90 leading-relaxed font-normal pt-2">
            <p>
              {isGu
                ? "જન્મભૂમિ ગ્રુપના મૂળ પ્રિન્ટ પત્રકારિતામાં મજબૂત રીતે સ્થાપિત છે, પરંતુ બદલાતી ટેકનોલોજી અને વાચકોની બદલાતી જરૂરિયાતો સાથે તેનું કોમ્યુનિકેશન ઈકોસિસ્ટમ પણ સતત વિકસ્યું છે. તેના પ્રકાશનો હવે ડિજિટલ પ્લેટફોર્મ્સ અને ઓનલાઈન ન્યૂઝ પોર્ટલ્સ દ્વારા પણ પોતાની હાજરી વિસ્તારી રહ્યા છે, જેના કારણે વાચકો વિવિધ ઉપકરણો અને ભૌગોલિક વિસ્તારોમાંથી સમાચાર તથા બિઝનેસ માહિતી મેળવી શકે છે."
                : "While rooted deeply in print journalism, the Janmabhoomi Group has continuously evolved alongside technological transformations. Through online news portals and digital E-Papers, readers across India and the diaspora can access verified news, analysis, and market updates."}
            </p>
            <p className="font-semibold text-[#016BB7] pt-2 border-t border-[#016BB7]/10">
              {isGu
                ? "પેઢીઓથી નિર્મિત એક વારસો • સમય સાથે વિકસતી એક મીડિયા ઈકોસિસ્ટમ • પત્રકારિતા, સમાજ અને જાહેર સેવા પ્રત્યેની સતત પ્રતિબદ્ધતા."
                : "A heritage built across generations • A media ecosystem evolving with time • An enduring commitment to journalism, society, and public service."}
            </p>
          </div>
        </div>

        {/* BOTTOM LINKS TO SEPARATE LEGAL PAGES */}
        <div className="rounded-xl border border-[#016BB7]/15 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-[#1F2937]/75 font-medium">
            {isGu
              ? "જન્મભૂમિ ડિજિટલ પોર્ટલ નીતિઓ અને કાનૂની દસ્તાવેજો:"
              : "Janmabhoomi Digital Platform Policies & Legal Documents:"}
          </span>
          <div className="flex items-center gap-4">
            <Link
              href={`/${lang}/privacy-policy`}
              className="font-bold text-[#016BB7] hover:text-[#016BB7]/80 inline-flex items-center gap-1"
            >
              <span>{dict.footer.privacyPolicy}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <span className="text-[#016BB7]/30">•</span>
            <Link
              href={`/${lang}/terms-conditions`}
              className="font-bold text-[#016BB7] hover:text-[#016BB7]/80 inline-flex items-center gap-1"
            >
              <span>{dict.footer.termsConditions}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
