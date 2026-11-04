import React from "react";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Building2 } from "lucide-react";
import { isValidLocale, Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  return {
    title: `${dict.header.contact} & ${dict.header.advertise}`,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6 border-b-2 border-[#174F73] pb-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#174F73]">
          {dict.header.contact} & {dict.header.advertise}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#292725]/75">
          {locale === "gu"
            ? "સંપાદકીય, જાહેરાત અને ઈ-પેપર સબ્સ્ક્રિપ્શન વિભાગ સાથે સંપર્ક કરો"
            : "Connect with the Janmabhoomi Editorial Desk, Advertising Department, or Circulation Office."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Office Details */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-md border border-[#292725]/15 bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#174F73] font-extrabold text-base">
              <Building2 className="h-5 w-5 text-[#C59B4B]" />
              <h2>{dict.footer.contactHeading}</h2>
            </div>

            <div className="space-y-3 text-sm text-[#292725]/85">
              <p className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#174F73] shrink-0 mt-1" />
                <span>{dict.footer.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#174F73] shrink-0" />
                <span>{dict.footer.phone}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#174F73] shrink-0" />
                <span>{dict.footer.email}</span>
              </p>
            </div>
          </div>

          <div className="rounded-md border border-[#C59B4B]/50 bg-[#FAF8F3] p-5 text-xs space-y-2">
            <h3 className="font-bold text-[#174F73] uppercase tracking-wider">
              {dict.header.advertise}
            </h3>
            <p className="text-[#292725]/80 leading-relaxed">
              {locale === "gu"
                ? "જન્મભૂમિ જૂથના અખબારોમાં ડિસ્પ્લે જાહેરાત, જાહેર નોટિસ, ટેન્ડર અને મરણ નોંધ (બેસણું) પ્રકાશિત કરવા માટે ફોર્મમાં 'જાહેરાત અને મીડિયા કિટ' વિકલ્પ પસંદ કરો."
                : "For display advertisements, public notices, tender publications, and Maran (obituary) insertions across Janmabhoomi Group newspapers, please select \"Advertising & Media Kit\" in the enquiry form."}
            </p>
          </div>
        </div>

        {/* Contact / Advertise Form (First-Cut UI Ready for Backend API) */}
        <div className="lg:col-span-7 rounded-md border border-[#292725]/15 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-extrabold text-[#292725] mb-4">
            {locale === "gu" ? "સંદેશ મોકલો" : "Send an Enquiry"}
          </h2>

          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#292725] mb-1">
                  {locale === "gu" ? "પૂરું નામ" : "Full Name"}
                </label>
                <input
                  type="text"
                  placeholder={locale === "gu" ? "તમારું નામ" : "Your full name"}
                  className="w-full rounded border border-[#292725]/25 px-3 py-2 text-sm focus:border-[#174F73] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#292725] mb-1">
                  {locale === "gu" ? "ઈમેલ / ફોન" : "Email or Phone"}
                </label>
                <input
                  type="text"
                  placeholder="name@company.com"
                  className="w-full rounded border border-[#292725]/25 px-3 py-2 text-sm focus:border-[#174F73] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292725] mb-1">
                {locale === "gu" ? "વિભાગ પસંદ કરો" : "Department"}
              </label>
              <select className="w-full rounded border border-[#292725]/25 bg-white px-3 py-2 text-sm focus:border-[#174F73] focus:outline-none">
                <option>
                  {locale === "gu"
                    ? "ઈ-પેપર સબ્સ્ક્રિપ્શન સહાય"
                    : "E-Paper Subscription Support"}
                </option>
                <option>
                  {locale === "gu"
                    ? "જાહેરાત અને મીડિયા કિટ પૂછપરછ"
                    : "Advertising & Media Kit Enquiry"}
                </option>
                <option>
                  {locale === "gu"
                    ? "સંપાદકીય વિભાગ / તંત્રીને પત્ર"
                    : "Editorial Desk / Letter to Editor"}
                </option>
                <option>
                  {locale === "gu"
                    ? "મરણ નોંધ / બેસણું જાહેરાત બુકિંગ"
                    : "Maran (Obituary) Notice Booking"}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#292725] mb-1">
                {locale === "gu" ? "સંદેશ" : "Message"}
              </label>
              <textarea
                rows={4}
                placeholder={
                  locale === "gu"
                    ? "તમારી વિગતો અહીં લખો..."
                    : "Write your enquiry details..."
                }
                className="w-full rounded border border-[#292725]/25 px-3 py-2 text-sm focus:border-[#174F73] focus:outline-none"
              />
            </div>

            <button
              type="button"
              className="rounded bg-[#174F73] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#103A55] transition-colors cursor-pointer"
            >
              {locale === "gu" ? "સંદેશ મોકલો (ડેમો)" : "Submit Enquiry (Demo)"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
