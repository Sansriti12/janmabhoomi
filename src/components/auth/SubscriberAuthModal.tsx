"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, CheckCircle, AlertCircle, Loader2, UserCheck } from "lucide-react";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";
import { Locale } from "@/lib/i18n/config";

interface SubscriberAuthModalProps {
  lang: Locale;
}

function GoogleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export function SubscriberAuthModal({ lang }: SubscriberAuthModalProps) {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login } = useSubscriberAuth();

  const [tab, setTab] = useState<"login" | "register">(authModalTab);

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConsent, setRegConsent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Synchronize internal tab state when modal opens
  React.useEffect(() => {
    setTab(authModalTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const isGu = lang === "gu";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:4000/api/v1/subscriber/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(
          data?.error?.message ||
            (isGu ? "લૉગિન નિષ્ફળ રહ્યું. કૃપા કરીને વિગતો તપાસો." : "Login failed. Please check your credentials.")
        );
        return;
      }

      login(data.token, data.subscriber);
    } catch {
      setErrorMessage(
        isGu
          ? "સર્વર સાથે કનેક્ટ કરવામાં અસમર્થ. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો."
          : "Unable to connect to server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const googleSubscriber: any = {
        id: "sub-google-" + Date.now(),
        email: "subscriber@gmail.com",
        fullName: isGu ? "ગુગલ સબ્સ્ક્રાઇબર (Google User)" : "Google Subscriber",
        status: "ACTIVE",
        isEmailVerified: true,
        isMobileVerified: false,
        createdAt: new Date().toISOString(),
      };
      setSuccessMessage(
        isGu
          ? "Google એકાઉન્ટ સાથે સફળતાપૂર્વક પ્રવેશ કર્યો!"
          : "Signed in successfully with Google!"
      );
      setTimeout(() => {
        login("google-token-" + Date.now(), googleSubscriber);
        closeAuthModal();
      }, 600);
    } catch {
      setErrorMessage(
        isGu ? "Google સાઇન-ઇન નિષ્ફળ રહ્યું." : "Google sign in failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuestSignIn() {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const guestSubscriber: any = {
        id: "sub-guest-" + Date.now(),
        email: "guest.reader@janmabhoomi.in",
        fullName: isGu ? "મહેમાન વાચક (Guest User)" : "Guest User (Test Reader)",
        status: "ACTIVE",
        isEmailVerified: true,
        isMobileVerified: true,
        createdAt: new Date().toISOString(),
      };
      const demoSub = [
        {
          id: "sub-guest-all-access",
          planId: "plan-all-access",
          planNameEn: "Guest Reader All-Access Pass",
          planNameGu: "મહેમાન વાચક ઓલ-એક્સેસ પાસ",
          publicationNameEn: "Janmabhoomi Daily",
          publicationNameGu: "જન્મભૂમિ દૈનિક",
          publicationCode: "JB",
          startsAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
          daysRemaining: 30,
          autoRenew: false,
        },
      ];
      setSuccessMessage(
        isGu
          ? "મહેમાન વાચક તરીકે સફળતાપૂર્વક પ્રવેશ કર્યો! (ટેસ્ટ મોડ સક્રિય)"
          : "Logged in as Guest User! Website test mode active."
      );
      setTimeout(() => {
        login("guest-token-" + Date.now(), guestSubscriber, demoSub);
        closeAuthModal();
      }, 500);
    } catch {
      setErrorMessage(
        isGu ? "મહેમાન સાઇન-ઇન નિષ્ફળ રહ્યું." : "Guest sign in failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!regConsent) {
      setErrorMessage(
        isGu
          ? "કૃપા કરીને નિયમો અને શરતોનો સ્વીકાર કરો."
          : "Please agree to the terms and privacy policy to continue."
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:4000/api/v1/subscriber/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: regFullName,
          email: regEmail,
          mobileNumber: regMobile.trim() || undefined,
          password: regPassword,
          consent: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(
          data?.error?.message ||
            (isGu ? "નોંધણી નિષ્ફળ રહી. કૃપા કરીને વિગતો તપાસો." : "Registration failed. Please check your details.")
        );
        return;
      }

      setSuccessMessage(
        isGu ? "નોંધણી સફળ થઈ! લૉગિન થઈ રહ્યું છે..." : "Registration successful! Logging you in..."
      );
      setTimeout(() => {
        login(data.token, data.subscriber);
      }, 700);
    } catch {
      setErrorMessage(
        isGu
          ? "સર્વર સાથે કનેક્ટ કરવામાં અસમર્થ. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો."
          : "Unable to connect to server. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Header with Janmabhoomi Branding */}
        <div className="bg-[#016BB7] px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg font-serif tracking-tight">
              {isGu ? "જન્મભૂમિ વાચક પોર્ટલ" : "Janmabhoomi Subscriber Portal"}
            </h3>
            <p className="text-xs text-white/80">
              {isGu ? "ઇ-પેપર અને પ્રીમિયમ વાચન સુવિધા" : "Digital E-Paper & Premium Access"}
            </p>
          </div>
          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              openAuthModal("login");
            }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === "login"
                ? "border-[#016BB7] text-[#016BB7] bg-blue-50/30"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {isGu ? "પ્રવેશ કરો (Login)" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              openAuthModal("register");
            }}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              tab === "register"
                ? "border-[#016BB7] text-[#016BB7] bg-blue-50/30"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {isGu ? "નવું ખાતું બનાવો (Register)" : "Create Account"}
          </button>
        </div>

        <div className="p-6">
          {/* Status Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2 text-xs text-green-700">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-green-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isGu ? "ઇમેઇલ અથવા મોબાઇલ નંબર" : "Email or Mobile Number"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={isGu ? "તમારો ઇમેઇલ અથવા 10 અંકનો મોબાઇલ નંબર" : "name@example.com or 98200XXXXX"}
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isGu ? "પાસવર્ડ" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-lg bg-[#016BB7] hover:bg-[#015a99] text-white font-bold py-2.5 text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isGu ? "ચકાસણી ચાલુ છે..." : "Signing in..."}</span>
                  </>
                ) : (
                  <span>{isGu ? "પ્રવેશ કરો" : "Sign In"}</span>
                )}
              </button>

              {/* "Or continue with" Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-xs text-gray-500 font-medium whitespace-nowrap">
                  {isGu ? "અથવા આ રીતે આગળ વધો" : "Or continue with"}
                </span>
                <div className="border-t border-gray-200 w-full" />
              </div>

              {/* Quick Social & Guest Test Options */}
              <div className="space-y-2.5">
                {/* Continue with Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <GoogleIcon className="h-4 w-4 shrink-0" />
                  <span>{isGu ? "Google વડે પ્રવેશ" : "Continue with Google"}</span>
                </button>

                {/* Continue as Guest User (1-Click Test Access) */}
                <button
                  type="button"
                  onClick={handleGuestSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#016BB7]/30 bg-blue-50/60 hover:bg-[#016BB7] text-[#016BB7] hover:text-white font-bold py-2.5 text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                  title={isGu ? "કોઈપણ પાસવર્ડ વિના વેબસાઇટ ટેસ્ટ કરવા મહેમાન તરીકે લૉગિન કરો" : "Test website features instantly without entering a password"}
                >
                  <UserCheck className="h-4 w-4 shrink-0 text-[#016BB7] group-hover:text-white transition-colors" />
                  <span>{isGu ? "મહેમાન વાચક તરીકે આગળ વધો (Guest User)" : "Continue as Guest User (1-Click Test)"}</span>
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isGu ? "પૂરું નામ *" : "Full Name *"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={isGu ? "તમારું પૂરું નામ" : "e.g. Ramesh Patel"}
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isGu ? "ઇમેઇલ એડ્રેસ *" : "Email Address *"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isGu ? "મોબાઇલ નંબર (વૈકલ્પિક)" : "Mobile Number (Optional)"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    placeholder="9820012345"
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isGu ? "પાસવર્ડ (ઓછામાં ઓછા 8 અક્ષરો) *" : "Password (Min 8 characters) *"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-[#016BB7] focus:ring-1 focus:ring-[#016BB7] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="regConsent"
                  checked={regConsent}
                  onChange={(e) => setRegConsent(e.target.checked)}
                  className="mt-0.5 rounded text-[#016BB7] focus:ring-[#016BB7]"
                />
                <label htmlFor="regConsent" className="text-xs text-gray-600 leading-tight">
                  {isGu
                    ? "હું જન્મભૂમિ ટ્રસ્ટના નિયમો, શરતો અને ગોપનીયતા નીતિનો સ્વીકાર કરું છું."
                    : "I agree to the Janmabhoomi Trust terms of service and privacy policy."}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-lg bg-[#016BB7] hover:bg-[#015a99] text-white font-bold py-2.5 text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isGu ? "ખાતું બનાવવામાં આવી રહ્યું છે..." : "Creating account..."}</span>
                  </>
                ) : (
                  <span>{isGu ? "ખાતું બનાવો" : "Create Account"}</span>
                )}
              </button>

              {/* "Or continue with" Divider */}
              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-gray-200 w-full" />
                <span className="bg-white px-3 text-xs text-gray-500 font-medium whitespace-nowrap">
                  {isGu ? "અથવા આ રીતે આગળ વધો" : "Or continue with"}
                </span>
                <div className="border-t border-gray-200 w-full" />
              </div>

              {/* Quick Social & Guest Test Options */}
              <div className="space-y-2.5">
                {/* Continue with Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  <GoogleIcon className="h-4 w-4 shrink-0" />
                  <span>{isGu ? "Google વડે પ્રવેશ" : "Continue with Google"}</span>
                </button>

                {/* Continue as Guest User (1-Click Test Access) */}
                <button
                  type="button"
                  onClick={handleGuestSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#016BB7]/30 bg-blue-50/60 hover:bg-[#016BB7] text-[#016BB7] hover:text-white font-bold py-2.5 text-sm transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                  title={isGu ? "કોઈપણ પાસવર્ડ વિના વેબસાઇટ ટેસ્ટ કરવા મહેમાન તરીકે લૉગિન કરો" : "Test website features instantly without entering a password"}
                >
                  <UserCheck className="h-4 w-4 shrink-0 text-[#016BB7] group-hover:text-white transition-colors" />
                  <span>{isGu ? "મહેમાન વાચક તરીકે આગળ વધો (Guest User)" : "Continue as Guest User (1-Click Test)"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
