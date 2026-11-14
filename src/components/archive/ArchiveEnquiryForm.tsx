"use client";

import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Phone,
  Mail,
  Copy,
  Check,
  Building,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import { Dictionary } from "@/lib/i18n/dictionaries";
import { submitArchiveEnquiry } from "@/lib/services/archiveEnquiryService";

interface ArchiveEnquiryFormProps {
  lang: Locale;
  dict: Dictionary;
}

export function ArchiveEnquiryForm({ lang, dict }: ArchiveEnquiryFormProps) {
  const isGu = lang === "gu";
  const t = dict.archiveEnquiry;

  // Form states
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [publication, setPublication] = useState("");
  const [year, setYear] = useState("");
  const [infoType, setInfoType] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [preferredContact, setPreferredContact] = useState<"phone" | "email" | "either">("either");
  const [consent, setConsent] = useState(false);

  // Submission & UI feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Field validation touched states
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Publications List (All 8 Saurashtra Trust Publications)
  const publications = [
    { id: "janmabhoomi", name: isGu ? "જન્મભૂમિ (દૈનિક સાંધ્ય)" : "Janmabhoomi (Daily Evening)" },
    { id: "kutchmitra", name: isGu ? "કચ્છમિત્ર (દૈનિક પ્રભાત)" : "Kutchmitra (Daily Morning)" },
    { id: "phulchhab", name: isGu ? "ફૂલછાબ (દૈનિક પ્રભાત)" : "Phulchhab (Daily Morning)" },
    { id: "vyapar-gujarati", name: isGu ? "વ્યાપાર ગુજરાતી (દ્વિ-સાપ્તાહિક)" : "Vyapar Gujarati (Bi-Weekly Financial)" },
    { id: "vyapar-hindi", name: isGu ? "વ્યાપાર હિન્દી (સાપ્તાહિક)" : "Vyapar Hindi (Weekly Financial)" },
    { id: "janmabhoomi-pravasi", name: isGu ? "જન્મભૂમિ પ્રવાસી (રવિવારીય)" : "Janmabhoomi Pravasi (Sunday Weekly)" },
    { id: "panchang", name: isGu ? "જન્મભૂમિ પંચાંગ (વાર્ષિક / દૈનિક)" : "Janmabhoomi Panchang (Annual Almanac)" },
    { id: "kavita", name: isGu ? "કવિતા (ત્રિમાસિક સાહિત્યિક)" : "Kavita (Quarterly Literary Magazine)" },
  ];

  // Years generation: Covering complete archival span from 1900 to current year
  const currentYear = new Date().getFullYear();
  const earliestYear = 1900;
  const years = Array.from({ length: currentYear - earliestYear + 1 }, (_, i) => currentYear - i);

  // Validate Indian Phone format (10 digits starting with 6,7,8,9)
  const isValidPhone = (val: string) => {
    const cleaned = val.replace(/[\s\-\(\)]/g, "");
    return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(cleaned);
  };

  // Validate Email
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all required inputs before submitting
    if (!fullName.trim() || fullName.trim().length < 3) {
      setError(isGu ? "કૃપા કરીને તમારું પૂરું નામ લખો (ઓછામાં ઓછા ૩ અક્ષર)." : "Please enter your full name (at least 3 characters).");
      return;
    }
    if (!isValidPhone(contactNumber)) {
      setError(isGu ? "કૃપા કરીને માન્ય ૧૦ અંકનો ભારતીય મોબાઇલ નંબર દાખલ કરો." : "Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!isValidEmail(email)) {
      setError(isGu ? "કૃપા કરીને માન્ય ઈમેલ એડ્રેસ દાખલ કરો." : "Please enter a valid email address.");
      return;
    }
    if (!publication) {
      setError(isGu ? "કૃપા કરીને પ્રકાશન પસંદ કરો." : "Please select a publication.");
      return;
    }
    if (!year) {
      setError(isGu ? "કૃપા કરીને આર્કાઇવનું વર્ષ પસંદ કરો." : "Please select the year of archived information.");
      return;
    }
    if (!infoType) {
      setError(isGu ? "કૃપા કરીને જરૂરી માહિતીનો પ્રકાર પસંદ કરો." : "Please select the type of information required.");
      return;
    }
    if (!consent) {
      setError(isGu ? "સંપર્ક માટેની સંમતિ આપવી ફરજિયાત છે." : "You must agree to the contact consent before submitting.");
      return;
    }

    setLoading(true);

    try {
      const result = await submitArchiveEnquiry({
        fullName: fullName.trim(),
        contactNumber: contactNumber.trim(),
        email: email.trim(),
        publication,
        year: parseInt(year, 10),
        infoType,
        additionalDetails: additionalDetails.trim(),
        preferredContact,
        consent,
      });

      if (result.success && result.referenceNumber) {
        setSuccessRef(result.referenceNumber);
        // Reset form
        setFullName("");
        setContactNumber("");
        setEmail("");
        setPublication("");
        setYear("");
        setInfoType("");
        setAdditionalDetails("");
        setPreferredContact("either");
        setConsent(false);
        setTouched({});
      } else if (result.backendPending) {
        setError(
          isGu
            ? dict.archiveEnquiry.backendPendingMessage
            : "Online archive enquiry submission is currently undergoing central backend integration. For immediate assistance, please contact the Saurashtra Trust Archive Section at Janmabhoomi Bhavan, Fort, Mumbai (Email: archives@janmabhoomi.in)."
        );
      } else {
        setError(result.error || t.errorMessage);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (successRef) {
      navigator.clipboard.writeText(successRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (successRef) {
    return (
      <div className="rounded-2xl border-2 border-[#016BB7]/30 bg-white p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F0F6FA] text-[#016BB7]">
          <CheckCircle2 className="h-10 w-10 text-[#016BB7]" />
        </div>

        <div className="space-y-2">
          <span className="inline-block rounded-full bg-[#016BB7]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#016BB7]">
            {t.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937]">
            {t.successTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#1F2937]/80 max-w-xl mx-auto leading-relaxed">
            {t.successMessage}
          </p>
        </div>

        {/* Reference Badge with Copy Button */}
        <div className="mx-auto max-w-md rounded-xl border border-[#016BB7]/25 bg-[#F0F6FA] p-4 text-left space-y-2">
          <p className="text-xs font-bold text-[#016BB7] uppercase tracking-wide">
            {t.refNumberPrefix}
          </p>
          <div className="flex items-center justify-between gap-3 bg-white rounded-lg px-4 py-2.5 border border-[#016BB7]/20">
            <span className="font-mono text-base sm:text-lg font-bold text-[#016BB7] tracking-wider">
              {successRef}
            </span>
            <button
              type="button"
              onClick={handleCopyRef}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#016BB7]/10 hover:bg-[#016BB7]/20 px-3 py-1 text-xs font-bold text-[#016BB7] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>{isGu ? "કોપી થયું!" : "Copied!"}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{isGu ? "કોપી કરો" : "Copy"}</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-[#1F2937]/70 leading-normal">
            {isGu
              ? "કૃપા કરીને આ સંદર્ભ ક્રમાંક સાચવી રાખો. અમારી ટીમ સંપર્ક કરે ત્યારે આ નંબર જણાવવો."
              : "Please save this reference number for all future communications regarding this request."}
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setSuccessRef(null)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#016BB7] text-[#016BB7] hover:bg-[#F0F6FA] px-5 py-2.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{isGu ? "અન્ય આર્કાઇવ પૂછપરછ સબમિટ કરો" : "Submit Another Archive Enquiry"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[#016BB7]/20 bg-white p-6 sm:p-10 shadow-xs space-y-6"
    >
      <div className="border-b border-[#016BB7]/15 pb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#016BB7]" />
          <h2 className="text-xl font-extrabold text-[#1F2937]">
            {t.formHeading}
          </h2>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-[#1F2937]/75">
          {isGu
            ? "બધા ફરજિયાત (*) ખાના ભરો જેથી અમારી આર્કાઇવ ટીમ આપની વિનંતી ઝડપથી ચકાસી શકે."
            : "Please fill in all mandatory (*) fields to assist our archival research desk."}
        </p>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-[#B83232]/30 bg-[#FDF2F2] p-4 text-xs sm:text-sm text-[#B83232]"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-[#B83232]" />
          <div className="space-y-1">
            <p className="font-bold">{t.errorTitle}</p>
            <p className="leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* ROW 1: Full Name & Contact Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="fullName" className="block text-xs font-bold text-[#1F2937] mb-1.5">
            {t.fullName} <span className="text-[#B83232]">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onBlur={() => handleBlur("fullName")}
            placeholder={t.fullNamePlaceholder}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1F2937] transition-all focus:outline-none ${
              touched.fullName && (!fullName.trim() || fullName.trim().length < 3)
                ? "border-[#B83232] focus:ring-1 focus:ring-[#B83232]"
                : "border-[#016BB7]/25 focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7]"
            }`}
          />
          {touched.fullName && (!fullName.trim() || fullName.trim().length < 3) && (
            <p className="mt-1 text-[11px] text-[#B83232]">
              {isGu ? "પૂરું નામ દાખલ કરવું જરૂરી છે (ન્યૂનતમ ૩ અક્ષર)." : "Full name is required (min 3 characters)."}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contactNumber" className="block text-xs font-bold text-[#1F2937] mb-1.5">
            {t.contactNumber} <span className="text-[#B83232]">*</span>
          </label>
          <div className="relative">
            <input
              id="contactNumber"
              type="tel"
              required
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              onBlur={() => handleBlur("contactNumber")}
              placeholder={t.contactNumberPlaceholder}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1F2937] transition-all focus:outline-none ${
                touched.contactNumber && !isValidPhone(contactNumber)
                  ? "border-[#B83232] focus:ring-1 focus:ring-[#B83232]"
                  : "border-[#016BB7]/25 focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7]"
              }`}
            />
          </div>
          {touched.contactNumber && !isValidPhone(contactNumber) && (
            <p className="mt-1 text-[11px] text-[#B83232]">
              {isGu ? "માન્ય ૧૦ અંકનો ભારતીય મોબાઇલ નંબર લખો (દા.ત. 9820012345)." : "Enter a valid 10-digit Indian mobile number."}
            </p>
          )}
        </div>
      </div>

      {/* ROW 2: Email Address & Preferred Publication */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className="block text-xs font-bold text-[#1F2937] mb-1.5">
            {t.emailAddress} <span className="text-[#B83232]">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder={t.emailPlaceholder}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1F2937] transition-all focus:outline-none ${
              touched.email && !isValidEmail(email)
                ? "border-[#B83232] focus:ring-1 focus:ring-[#B83232]"
                : "border-[#016BB7]/25 focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7]"
            }`}
          />
          {touched.email && !isValidEmail(email) && (
            <p className="mt-1 text-[11px] text-[#B83232]">
              {isGu ? "માન્ય ઈમેલ એડ્રેસ લખો." : "Please enter a valid email address."}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="publication" className="block text-xs font-bold text-[#1F2937] mb-1.5">
            {t.publication} <span className="text-[#B83232]">*</span>
          </label>
          <select
            id="publication"
            required
            value={publication}
            onChange={(e) => setPublication(e.target.value)}
            onBlur={() => handleBlur("publication")}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1F2937] bg-white transition-all focus:outline-none ${
              touched.publication && !publication
                ? "border-[#B83232] focus:ring-1 focus:ring-[#B83232]"
                : "border-[#016BB7]/25 focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7]"
            }`}
          >
            <option value="">{t.selectPublication}</option>
            {publications.map((pub) => (
              <option key={pub.id} value={pub.id}>
                {pub.name}
              </option>
            ))}
          </select>
          {touched.publication && !publication && (
            <p className="mt-1 text-[11px] text-[#B83232]">
              {isGu ? "પ્રકાશન પસંદ કરવું જરૂરી છે." : "Please select a publication."}
            </p>
          )}
        </div>
      </div>

      {/* ROW 3: Year of Archived Information & Type of Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="year" className="block text-xs font-bold text-[#1F2937]">
              {t.year} <span className="text-[#B83232]">*</span>
            </label>
            <span className="text-[10px] text-[#016BB7] font-semibold">{earliestYear} – {currentYear}</span>
          </div>
          <select
            id="year"
            required
            value={year}
            onChange={(e) => setYear(e.target.value)}
            onBlur={() => handleBlur("year")}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1F2937] bg-white transition-all focus:outline-none ${
              touched.year && !year
                ? "border-[#B83232] focus:ring-1 focus:ring-[#B83232]"
                : "border-[#016BB7]/25 focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7]"
            }`}
          >
            <option value="">{t.selectYear}</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-[#1F2937]/70">
            {t.yearNote}
          </p>
          {touched.year && !year && (
            <p className="mt-0.5 text-[11px] text-[#B83232]">
              {isGu ? "વર્ષ પસંદ કરવું જરૂરી છે." : "Please select the year."}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="infoType" className="block text-xs font-bold text-[#1F2937] mb-1.5">
            {t.infoType} <span className="text-[#B83232]">*</span>
          </label>
          <select
            id="infoType"
            required
            value={infoType}
            onChange={(e) => setInfoType(e.target.value)}
            onBlur={() => handleBlur("infoType")}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#1F2937] bg-white transition-all focus:outline-none ${
              touched.infoType && !infoType
                ? "border-[#B83232] focus:ring-1 focus:ring-[#B83232]"
                : "border-[#016BB7]/25 focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7]"
            }`}
          >
            <option value="">{t.selectInfoType}</option>
            <option value="article">{t.types.article}</option>
            <option value="historical">{t.types.historical}</option>
            <option value="advertisement">{t.types.advertisement}</option>
            <option value="obituary">{t.types.obituary}</option>
            <option value="magazine">{t.types.magazine}</option>
            <option value="other">{t.types.other}</option>
          </select>
          {touched.infoType && !infoType && (
            <p className="mt-1 text-[11px] text-[#B83232]">
              {isGu ? "માહિતીનો પ્રકાર પસંદ કરવો જરૂરી છે." : "Please select the information type."}
            </p>
          )}
        </div>
      </div>

      {/* ROW 4: Additional Details (Multiline) */}
      <div>
        <label htmlFor="additionalDetails" className="block text-xs font-bold text-[#1F2937] mb-1.5">
          {t.additionalDetails}
        </label>
        <textarea
          id="additionalDetails"
          rows={4}
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          placeholder={t.detailsPlaceholder}
          maxLength={1500}
          className="w-full rounded-lg border border-[#016BB7]/25 px-3.5 py-2.5 text-sm text-[#1F2937] transition-all focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
        />
        <div className="flex justify-between items-center mt-1 text-[11px] text-[#1F2937]/60">
          <span>{isGu ? "સંદર્ભ તારીખ, વિષય, વ્યક્તિ કે ઘટનાનું નામ લખો." : "Provide dates, subject names, or events to help locate the record."}</span>
          <span>{additionalDetails.length}/1500</span>
        </div>
      </div>

      {/* ROW 5: Preferred Contact Method */}
      <div>
        <label className="block text-xs font-bold text-[#1F2937] mb-2">
          {t.preferredContact}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label
            className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-all ${
              preferredContact === "phone"
                ? "border-[#016BB7] bg-[#F0F6FA] text-[#016BB7] font-bold"
                : "border-[#016BB7]/20 hover:border-[#016BB7]/40 text-[#1F2937]"
            }`}
          >
            <input
              type="radio"
              name="preferredContact"
              value="phone"
              checked={preferredContact === "phone"}
              onChange={() => setPreferredContact("phone")}
              className="text-[#016BB7] focus:ring-[#016BB7]"
            />
            <Phone className="h-4 w-4 shrink-0 text-[#016BB7]" />
            <span className="text-xs">{t.contactMethods.phone}</span>
          </label>

          <label
            className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-all ${
              preferredContact === "email"
                ? "border-[#016BB7] bg-[#F0F6FA] text-[#016BB7] font-bold"
                : "border-[#016BB7]/20 hover:border-[#016BB7]/40 text-[#1F2937]"
            }`}
          >
            <input
              type="radio"
              name="preferredContact"
              value="email"
              checked={preferredContact === "email"}
              onChange={() => setPreferredContact("email")}
              className="text-[#016BB7] focus:ring-[#016BB7]"
            />
            <Mail className="h-4 w-4 shrink-0 text-[#016BB7]" />
            <span className="text-xs">{t.contactMethods.email}</span>
          </label>

          <label
            className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-all ${
              preferredContact === "either"
                ? "border-[#016BB7] bg-[#F0F6FA] text-[#016BB7] font-bold"
                : "border-[#016BB7]/20 hover:border-[#016BB7]/40 text-[#1F2937]"
            }`}
          >
            <input
              type="radio"
              name="preferredContact"
              value="either"
              checked={preferredContact === "either"}
              onChange={() => setPreferredContact("either")}
              className="text-[#016BB7] focus:ring-[#016BB7]"
            />
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#016BB7]" />
            <span className="text-xs">{t.contactMethods.either}</span>
          </label>
        </div>
      </div>

      {/* ROW 6: Consent Checkbox */}
      <div className="pt-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#016BB7]/40 text-[#016BB7] focus:ring-[#016BB7]"
          />
          <span className="text-xs text-[#1F2937]/90 leading-relaxed font-medium">
            {t.consent} <span className="text-[#B83232]">*</span>
          </span>
        </label>
      </div>

      {/* ROW 7: Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#016BB7]/15">
        <p className="text-[11px] text-[#1F2937]/70 text-center sm:text-left">
          {isGu
            ? "તમારી માહિતી સુરક્ષિત રાખવામાં આવશે અને માત્ર પૂછપરછ સંદર્ભે જ ઉપયોગમાં લેવાશે."
            : "Your personal details will remain confidential and will only be used to respond to this request."}
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#016BB7] hover:bg-[#016BB7]/90 active:bg-[#015a99] px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all shadow-2xs shrink-0 w-full sm:w-auto cursor-pointer ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{t.submitting}</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span>{t.submitButton}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
