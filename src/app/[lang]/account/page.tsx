"use client";

import React, { useState, useEffect } from "react";
import { User, Shield, CreditCard, Clock, LogOut, CheckCircle, AlertCircle, Calendar, Newspaper, Key } from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";
import { SubscriberAuthModal } from "@/components/auth/SubscriberAuthModal";
import Link from "next/link";

export default function AccountPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const unwrappedParams = React.use(params);
  const lang = unwrappedParams.lang || "gu";
  const isGu = lang === "gu";

  const { subscriber, activeSubscriptions, token, isAuthenticated, isLoading, logout, openAuthModal, refreshProfile } =
    useSubscriberAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (token) {
      refreshProfile();
    }
  }, [token]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMessage(null);
    setPwdLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:4000/api/v1/subscriber/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPwdMessage({
          type: "success",
          text: isGu ? "પાસવર્ડ સફળતાપૂર્વક બદલાઈ ગયો છે." : "Password changed successfully.",
        });
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setPwdMessage({
          type: "error",
          text: data?.error?.message || (isGu ? "પાસવર્ડ બદલવામાં ભૂલ થઈ." : "Failed to change password."),
        });
      }
    } catch {
      setPwdMessage({
        type: "error",
        text: isGu ? "સર્વર સાથે કનેક્ટ થઈ શક્યું નથી." : "Unable to connect to server.",
      });
    } finally {
      setPwdLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F6FA]/50 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#016BB7] mx-auto mb-2" />
        <p className="text-xs text-gray-500">{isGu ? "ખાતું લોડ થઈ રહ્યું છે..." : "Loading account..."}</p>
      </div>
    );
  }

  if (!isAuthenticated || !subscriber) {
    return (
      <div className="min-h-screen bg-[#F0F6FA]/50 py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          <div className="p-3 bg-blue-50 text-[#016BB7] rounded-full inline-block mb-4">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isGu ? "વાચક લૉગિન જરૂરી છે" : "Subscriber Login Required"}
          </h2>
          <p className="text-xs text-gray-600 mb-6">
            {isGu
              ? "તમારા સબ્સ્ક્રિપ્શન્સ અને પ્રોફાઇલ જોવા માટે કૃપા કરીને તમારા ખાતામાં પ્રવેશ કરો."
              : "Please sign in to access your profile, view active subscriptions and invoice history."}
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="w-full bg-[#016BB7] hover:bg-[#015a99] text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            {isGu ? "પ્રવેશ કરો (Sign In)" : "Sign In"}
          </button>
        </div>
        <SubscriberAuthModal lang={lang} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F6FA]/50 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#016BB7]/10 text-[#016BB7] flex items-center justify-center font-bold text-2xl font-serif">
              {subscriber.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-serif">{subscriber.fullName}</h1>
              <p className="text-xs text-gray-500">{subscriber.email}</p>
              {subscriber.mobileNumber && (
                <p className="text-xs text-gray-400">📱 {subscriber.mobileNumber}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              ● {subscriber.status === "ACTIVE" ? (isGu ? "સક્રિય ખાતું" : "Active Account") : subscriber.status}
            </span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isGu ? "બહાર નીકળો" : "Sign Out"}</span>
            </button>
          </div>
        </div>

        {/* Section 1: Active Subscriptions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-[#016BB7]" />
                <span>{isGu ? "મારા સક્રિય સબ્સ્ક્રિપ્શન્સ" : "My Active Subscriptions"}</span>
              </h2>
              <p className="text-xs text-gray-500">
                {isGu ? "ઇ-પેપર અને ડિજિટલ આવૃત્તિઓનું એક્સેસ" : "Digital editions and e-paper broadsheet privileges"}
              </p>
            </div>
            <Link
              href={`/${lang}/subscribe`}
              className="text-xs font-bold text-[#016BB7] hover:underline"
            >
              + {isGu ? "નવો પ્લાન ઉમેરો" : "Browse More Plans"}
            </Link>
          </div>

          {activeSubscriptions.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
              <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">
                {isGu ? "કોઈ સક્રિય સબ્સ્ક્રિપ્શન મળ્યું નથી" : "No active subscription found"}
              </p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {isGu
                  ? "જન્મભૂમિ ઇ-પેપરના તમામ પાના વાંચવા માટે સબ્સ્ક્રાઇબ કરો."
                  : "Subscribe to enjoy unlimited digital broadsheet reading across all 8 publications."}
              </p>
              <Link
                href={`/${lang}/subscribe`}
                className="mt-4 inline-block bg-[#016BB7] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#015a99]"
              >
                {isGu ? "પ્લાન જુઓ અને સબ્સ્ક્રાઇબ કરો" : "View Plans & Subscribe"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-[#016BB7] uppercase tracking-wide">
                        {isGu ? sub.publicationNameGu : sub.publicationNameEn}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        {isGu ? `${sub.daysRemaining} દિવસ બાકી` : `${sub.daysRemaining} days left`}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">
                      {isGu ? sub.planNameGu : sub.planNameEn}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        {isGu ? "માન્યતા:" : "Expires on:"}{" "}
                        <strong className="text-gray-700">
                          {new Date(sub.expiresAt).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-blue-200/50 flex justify-between items-center">
                    <span className="text-[11px] text-gray-500">
                      {isGu ? "સ્થિતિ: સક્રિય" : "Status: Active Access"}
                    </span>
                    <Link
                      href={`/${lang}/epaper`}
                      className="text-xs font-bold text-[#016BB7] hover:underline"
                    >
                      {isGu ? "ઇ-પેપર વાંચો →" : "Read E-Paper →"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Security & Password Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-lg font-bold text-gray-900 font-serif flex items-center gap-2 mb-1">
            <Key className="h-5 w-5 text-[#016BB7]" />
            <span>{isGu ? "સુરક્ષા અને પાસવર્ડ સેટિંગ્સ" : "Security & Password Management"}</span>
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            {isGu ? "તમારા ખાતાનો પાસવર્ડ સુરક્ષિત રીતે બદલો" : "Update your password to keep your subscriber account secure"}
          </p>

          {pwdMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                pwdMessage.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {pwdMessage.type === "success" ? (
                <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              )}
              <span>{pwdMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isGu ? "હાલનો પાસવર્ડ" : "Current Password"}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {isGu ? "નવો પાસવર્ડ (ઓછામાં ઓછા 8 અક્ષરો)" : "New Password (Min 8 characters)"}
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="bg-[#016BB7] hover:bg-[#015a99] text-white font-bold py-2 px-5 rounded-lg text-xs transition-colors disabled:opacity-60"
            >
              {pwdLoading
                ? isGu ? "અપડેટ થઈ રહ્યું છે..." : "Updating..."
                : isGu ? "પાસવર્ડ બદલો" : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
