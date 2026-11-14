import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Building2, Send, CheckCircle2 } from "lucide-react";
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  TelegramIcon,
} from "@/components/shared/SocialIcons";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "gu";
  const dict = getDictionary(locale);
  return {
    title: `${dict.header.contact} | Janmabhoomi Group`,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isGu = lang === "gu";
  const dict = getDictionary(isGu ? "gu" : "en");

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b-2 border-[#016BB7] pb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#016BB7]">
            {dict.header.contact}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/75">
            {isGu
              ? "સંપાદકીય વિભાગ, પ્રકાશન કાર્યાલય અથવા ઈ-પેપર પૂછપરછ માટે સંપર્ક કરો."
              : "Connect with the Janmabhoomi Editorial Desk, Publishing Office, or E-Paper Department."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Office Information & Verified Channels */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-xl border border-[#016BB7]/20 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-[#016BB7] font-extrabold text-base">
                <Building2 className="h-5 w-5 text-[#016BB7]" />
                <h2>{isGu ? "જન્મભૂમિ ગ્રુપ (સૌરાષ્ટ્ર ટ્રસ્ટ)" : "Janmabhoomi Group (Saurashtra Trust)"}</h2>
              </div>

              <p className="text-xs sm:text-sm text-[#1F2937]/80 leading-relaxed">
                {isGu
                  ? "સત્તાવાર મુખ્ય કાર્યાલય સંપર્ક વિગતો અને સરનામું સંસ્થાકીય વેરિફિકેશન પ્રક્રિયા હેઠળ છે. કોઈપણ સંપાદકીય અથવા વ્યવસાયિક પૂછપરછ માટે કૃપા કરીને સામે આપેલ સંપર્ક ફોર્મ ભરો."
                  : "Official headquarters telephone and direct departmental contacts are undergoing institutional verification. For editorial dispatches, notices, or reader enquiries, please submit the form."}
              </p>

              <div className="pt-2 border-t border-[#016BB7]/15">
                <p className="text-xs font-bold text-[#016BB7] mb-2">
                  {isGu ? "સત્તાવાર સોશિયલ મીડિયા ચેનલ્સ" : "Official Social Channels (@janmabhoomigroup)"}
                </p>
                <div className="flex items-center gap-2 text-white">
                  <a
                    href="https://facebook.com/janmabhoomigroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#016BB7] p-2 hover:bg-[#016BB7]/90 transition-colors"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="h-4 w-4" />
                  </a>
                  <a
                    href="https://x.com/janmabhoomigroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#016BB7] p-2 hover:bg-[#016BB7]/90 transition-colors"
                    aria-label="X"
                  >
                    <TwitterIcon className="h-4 w-4" />
                  </a>
                  <a
                    href="https://instagram.com/janmabhoomigroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#016BB7] p-2 hover:bg-[#016BB7]/90 transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="h-4 w-4" />
                  </a>
                  <a
                    href="https://t.me/janmabhoomigroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#016BB7] p-2 hover:bg-[#016BB7]/90 transition-colors"
                    aria-label="Telegram"
                  >
                    <TelegramIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#016BB7]/20 bg-[#F0F6FA] p-5 text-xs space-y-2">
              <p className="font-bold text-[#016BB7] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#016BB7]" />
                <span>{isGu ? "ઈ-પેપર સબ્સ્ક્રિપ્શન" : "E-Paper Subscription"}</span>
              </p>
              <p className="text-[#1F2937]/80 leading-relaxed">
                {isGu
                  ? "ઈ-પેપર વાંચવા અથવા સબ્સ્ક્રિપ્શન સંબંધિત સહાયતા માટે વેબસાઇટ પર ઉપલબ્ધ E-PAPER બટનનો ઉપયોગ કરો."
                  : "To read daily digital editions or for subscription support, access the E-PAPER button from the main header."}
              </p>
            </div>

            <div className="rounded-xl border border-[#016BB7]/30 bg-white p-5 text-xs space-y-2.5 shadow-2xs">
              <p className="font-bold text-[#016BB7] uppercase tracking-wider">
                {isGu ? "જૂના અખબાર / આર્કાઇવ પૂછપરછ?" : "Looking for Old Newspapers / Archives?"}
              </p>
              <p className="text-[#1F2937]/80 leading-relaxed">
                {isGu
                  ? "૧૯૩૪થી આજ સુધીના જૂના અખબાર, લેખ કે ઐતિહાસિક સમાચાર માટે અમારી સમર્પિત આર્કાઇવ પૂછપરછ સુવિધાનો ઉપયોગ કરો."
                  : "Need historical newspaper articles, old notices, or archived editions dating back to 1934? Use our dedicated archive enquiry service."}
              </p>
              <div>
                <Link
                  href={`/${lang}/archive-enquiry`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#016BB7] hover:underline"
                >
                  <span>{isGu ? "આર્કાઇવ પૂછપરછ ફોર્મ ભરો →" : "Submit Archive Enquiry →"}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact / Enquiry Form */}
          <div className="lg:col-span-7 rounded-xl border border-[#016BB7]/20 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-extrabold text-[#016BB7] mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#016BB7]" />
              <span>{isGu ? "સંદેશ મોકલો" : "Send an Enquiry"}</span>
            </h2>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    {isGu ? "પૂરું નામ" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isGu ? "તમારું નામ" : "Your full name"}
                    className="w-full rounded-lg border border-[#016BB7]/25 px-3 py-2 text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    {isGu ? "ઈમેલ અથવા ફોન" : "Email or Phone"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isGu ? "સંપર્ક નંબર અથવા ઈમેલ" : "Contact phone or email"}
                    className="w-full rounded-lg border border-[#016BB7]/25 px-3 py-2 text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  {isGu ? "વિષય / વિભાગ" : "Subject / Department"}
                </label>
                <select className="w-full rounded-lg border border-[#016BB7]/25 px-3 py-2 text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none bg-white">
                  <option value="editorial">{isGu ? "સંપાદકીય વિભાગ (Editorial)" : "Editorial Desk"}</option>
                  <option value="circulation">{isGu ? "ઈ-પેપર અને વિતરણ (E-Paper & Circulation)" : "E-Paper & Circulation"}</option>
                  <option value="general">{isGu ? "સામાન્ય પૂછપરછ (General Enquiry)" : "General Enquiry"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  {isGu ? "સંદેશ" : "Message"}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={isGu ? "તમારો સંદેશ અહીં લખો..." : "Write your message here..."}
                  className="w-full rounded-lg border border-[#016BB7]/25 px-3 py-2 text-sm text-[#1F2937] focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#016BB7] hover:bg-[#016BB7]/90 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors shadow-2xs cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>{isGu ? "સંદેશ મોકલો" : "Submit Enquiry"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
