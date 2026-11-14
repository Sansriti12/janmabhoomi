"use client";

import React, { useState, useEffect } from "react";
import { Check, ShieldCheck, Newspaper, Sparkles, AlertCircle } from "lucide-react";
import { Locale } from "@/lib/i18n/config";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";
import { RazorpayCheckoutModal, PlanItem } from "@/components/subscription/RazorpayCheckoutModal";
import { SubscriberAuthModal } from "@/components/auth/SubscriberAuthModal";

export default function SubscribePage({ params }: { params: Promise<{ lang: Locale }> }) {
  const unwrappedParams = React.use(params);
  const lang = unwrappedParams.lang || "gu";
  const isGu = lang === "gu";

  const { isAuthenticated, openAuthModal } = useSubscriberAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PlanItem | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch("http://127.0.0.1:4000/api/v1/subscriptions/plans");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.plans.length > 0) {
            setPlans(data.plans);
            setIsLoading(false);
            return;
          }
        }
      } catch {}

      // Fallback default plans if backend is unreachable
      setPlans([
        {
          id: "jnb_epaper_monthly_sample",
          publicationId: "pub-janmabhoomi",
          publicationCode: "JB",
          publicationNameEn: "Janmabhoomi",
          publicationNameGu: "જન્મભૂમિ",
          nameEn: "Sample Monthly E-Paper",
          nameGu: "નમૂના માસિક ઇ-પેપર",
          priceInr: 75.0,
          billingInterval: "MONTHLY",
          durationDays: 30,
          featuresEn: ["30-day unlimited broadsheet access", "High-resolution page zoom", "All Mumbai editions", "Mobile & Desktop reader"],
          featuresGu: ["૩૦ દિવસ અમર્યાદિત બ્રોડશીટ એક્સેસ", "હાઇ-રિઝોલ્યુશન પેજ ઝૂમ સુવિધા", "મુંબઈ તમામ આવૃત્તિઓ", "મોબાઇલ અને કમ્પ્યુટર રીડર"],
        },
        {
          id: "jnb_epaper_annual_sample",
          publicationId: "pub-janmabhoomi",
          publicationCode: "JB",
          publicationNameEn: "Janmabhoomi",
          publicationNameGu: "જન્મભૂમિ",
          nameEn: "Sample Annual E-Paper",
          nameGu: "નમૂના વાર્ષિક ઇ-પેપર",
          priceInr: 600.0,
          billingInterval: "ANNUAL",
          durationDays: 365,
          featuresEn: ["365-day full edition access", "Historical archive access", "Early morning pre-press release", "Priority customer assistance"],
          featuresGu: ["૩૬૫ દિવસ સંપૂર્ણ આવૃત્તિ એક્સેસ", "ઐતિહાસિક જૂની આવૃત્તિઓનું આર્કાઇવ", "વહેલી સવારે દૈનિક ડિલિવરી", "અગ્રતા ગ્રાહક સેવા"],
        },
      ]);
      setIsLoading(false);
    }
    loadPlans();
  }, []);

  function handleSelectPlan(plan: any) {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    setSelectedPlan({
      id: plan.id,
      nameEn: plan.nameEn,
      nameGu: plan.nameGu,
      publicationNameEn: plan.publicationNameEn,
      publicationNameGu: plan.publicationNameGu,
      priceInr: plan.priceInr,
      durationDays: plan.durationDays,
    });
  }

  return (
    <div className="min-h-screen bg-[#F0F6FA]/50 py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Page Title & Mission Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#016BB7]/10 text-[#016BB7] text-xs font-bold mb-3 tracking-wide">
            <Sparkles className="h-4 w-4" />
            <span>{isGu ? "જન્મભૂમિ ટ્રસ્ટ ડિજિટલ સબ્સ્ક્રિપ્શન" : "Janmabhoomi Trust Digital Subscription"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] font-serif mb-3 tracking-tight">
            {isGu ? "નિષ્પક્ષ પત્રકારત્વ સાથે જોડાઓ" : "Subscribe to Unbiased Journalism"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            {isGu
              ? "જન્મભૂમિ ગ્રૂપના વિશ્વસનીય સમાચારપત્રો, દૈનિક સાંધ્ય આવૃત્તિઓ અને આર્કાઇવનો સીધો ડિજિટલ લાભ મેળવો."
              : "Read authentic broadsheets, daily evening editions, and institutional archives directly across all your digital devices."}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#016BB7] mx-auto mb-2" />
            <p className="text-xs text-gray-500">{isGu ? "પ્લાન લોડ થઈ રહ્યા છે..." : "Loading plans..."}</p>
          </div>
        )}

        {/* Subscription Plan Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {plans.map((p, idx) => {
              const isPopular = idx === 1; // Highlight annual plan
              return (
                <div
                  key={p.id}
                  className={`relative bg-white rounded-2xl shadow-lg border transition-all hover:shadow-xl flex flex-col justify-between ${
                    isPopular
                      ? "border-[#016BB7] ring-2 ring-[#016BB7]/20"
                      : "border-gray-200"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#016BB7] text-white px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-xs">
                      {isGu ? "સૌથી લોકપ્રિય (Best Value)" : "Most Popular"}
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#016BB7] mb-2 uppercase tracking-wide">
                      <Newspaper className="h-4 w-4" />
                      <span>{isGu ? p.publicationNameGu : p.publicationNameEn}</span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {isGu ? p.nameGu : p.nameEn}
                    </h3>

                    <div className="flex items-baseline gap-1 my-5">
                      <span className="text-4xl font-black text-[#016BB7]">₹{p.priceInr}</span>
                      <span className="text-sm font-semibold text-gray-500">
                        {p.billingInterval === "ANNUAL"
                          ? isGu ? "/ વાર્ષિક" : "/ year"
                          : isGu ? "/ માસિક" : "/ month"}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-5">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                        {isGu ? "સુવિધાઓ અને લાભ:" : "Included Features:"}
                      </p>
                      <ul className="space-y-2.5 text-xs text-gray-600">
                        {((isGu ? p.featuresGu : p.featuresEn) || []).map((feat: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 pt-0">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(p)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 ${
                        isPopular
                          ? "bg-[#016BB7] hover:bg-[#015a99] text-white"
                          : "bg-gray-100 hover:bg-[#016BB7] hover:text-white text-gray-800"
                      }`}
                    >
                      <span>{isGu ? "હવે સબ્સ્ક્રાઇબ કરો" : "Subscribe Now"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security & Trust Guarantee Badges */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-[#016BB7] shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-gray-900">
                {isGu ? "સુરક્ષિત રેઝરપે ચુકવણી" : "100% Secure Razorpay Checkout"}
              </h4>
              <p className="text-xs text-gray-500">
                {isGu ? "UPI, ક્રેડિટ/ડેબિટ કાર્ડ અને નેટબેન્કિંગ સપોર્ટ" : "Supports UPI, Cards, Netbanking & Wallets"}
              </p>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200 hidden sm:block" />
          <div className="text-xs text-gray-500 max-w-sm">
            {isGu
              ? "કોઈપણ પૂછપરછ અથવા સહાય માટે અમારા સબ્સ્ક્રાઇબર સપોર્ટ ડેસ્કનો સંપર્ક કરો."
              : "For subscription queries or assistance, contact our official support desk."}
          </div>
        </div>
      </div>

      {/* Checkout Drawer Modal */}
      <RazorpayCheckoutModal
        plan={selectedPlan}
        lang={lang}
        onClose={() => setSelectedPlan(null)}
      />

      {/* Subscriber Auth Modal (if unauthenticated) */}
      <SubscriberAuthModal lang={lang} />
    </div>
  );
}
