"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import { useSubscriberAuth } from "@/lib/context/SubscriberAuthContext";
import { Locale } from "@/lib/i18n/config";
import Link from "next/link";

export interface PlanItem {
  id: string;
  nameEn: string;
  nameGu: string;
  publicationNameEn: string;
  publicationNameGu: string;
  priceInr: number;
  durationDays: number;
}

interface RazorpayCheckoutModalProps {
  plan: PlanItem | null;
  lang: Locale;
  onClose: () => void;
}

export function RazorpayCheckoutModal({ plan, lang, onClose }: RazorpayCheckoutModalProps) {
  const { token, subscriber, refreshProfile, openAuthModal } = useSubscriberAuth();
  const [status, setStatus] = useState<"idle" | "creating_order" | "awaiting_payment" | "verifying" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedDetails, setVerifiedDetails] = useState<any>(null);

  if (!plan) return null;

  const isGu = lang === "gu";

  // Dynamically load Razorpay checkout script
  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function startCheckout() {
    if (!token || !subscriber) {
      onClose();
      openAuthModal("login");
      return;
    }

    setErrorMessage(null);
    setStatus("creating_order");

    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setStatus("error");
      setErrorMessage(
        isGu
          ? "રેઝરપે પેમેન્ટ ગેટવે લોડ થઈ શક્યો નથી. કૃપા કરીને તમારું ઇન્ટરનેટ તપાસો."
          : "Failed to load Razorpay checkout SDK. Please check your internet connection."
      );
      return;
    }

    try {
      // 1. Create order on Fastify backend
      const res = await fetch("http://127.0.0.1:4000/api/v1/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: plan?.id }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.success) {
        setStatus("error");
        setErrorMessage(orderData?.error?.message || "Failed to create payment order.");
        return;
      }

      const { razorpayOrderId, amountPaise, currency, keyId } = orderData.order;

      // 2. Launch Razorpay Standard Checkout Drawer
      setStatus("awaiting_payment");

      const options = {
        key: keyId,
        amount: amountPaise,
        currency,
        name: "Janmabhoomi Digital",
        description: `${plan?.nameEn} (${plan?.durationDays} Days)`,
        image: "/assets/logos/janmabhoomi-logo.svg",
        order_id: razorpayOrderId,
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          // 3. Verify payment signature on backend
          setStatus("verifying");
          try {
            const verifyRes = await fetch("http://127.0.0.1:4000/api/v1/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setVerifiedDetails(verifyData.subscription);
              setStatus("success");
              await refreshProfile();
            } else {
              setStatus("error");
              setErrorMessage(
                verifyData?.error?.message || "Payment signature verification failed."
              );
            }
          } catch {
            setStatus("error");
            setErrorMessage("Network error during payment verification.");
          }
        },
        prefill: {
          name: subscriber.fullName,
          email: subscriber.email,
          contact: subscriber.mobileNumber || "",
        },
        theme: {
          color: "#016BB7",
        },
        modal: {
          ondismiss: function () {
            if (status !== "success" && status !== "verifying") {
              setStatus("idle");
            }
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.on("payment.failed", function (failResponse: any) {
        setStatus("error");
        setErrorMessage(
          failResponse.error?.description || "Payment was declined or failed by bank."
        );
      });

      razorpayInstance.open();
    } catch {
      setStatus("error");
      setErrorMessage("Unable to connect to payment server.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="bg-[#016BB7] px-6 py-4 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg font-serif">
              {isGu ? "સબ્સ્ક્રિપ્શન ચેકઆઉટ" : "Subscription Checkout"}
            </h3>
            <p className="text-xs text-white/80">
              {isGu ? plan.publicationNameGu : plan.publicationNameEn}
            </p>
          </div>
          {status !== "verifying" && (
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-6">
          {/* SUCCESS STATE */}
          {status === "success" && (
            <div className="text-center py-4">
              <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 mb-3">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-1">
                {isGu ? "ચુકવણી સફળ રહી!" : "Payment Verified Successfully!"}
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {isGu
                  ? `તમારું ${plan.nameGu} સબ્સ્ક્રિપ્શન સક્રિય થઈ ગયું છે. હવે તમે તમામ ઇ-પેપર પાના વાંચી શકો છો.`
                  : `Your ${plan.nameEn} subscription is now active. You have full access to all e-paper editions.`}
              </p>

              {verifiedDetails && (
                <div className="bg-blue-50/60 rounded-xl p-4 text-left text-xs mb-6 border border-[#016BB7]/15">
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{isGu ? "પ્રકાશન:" : "Publication:"}</span>
                    <span className="font-bold text-gray-800">{isGu ? plan.publicationNameGu : plan.publicationNameEn}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{isGu ? "માન્યતા સમય:" : "Valid Until:"}</span>
                    <span className="font-bold text-gray-800">{new Date(verifiedDetails.expiresAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{isGu ? "સ્થિતિ:" : "Status:"}</span>
                    <span className="font-bold text-green-600">{isGu ? "સક્રિય (Active)" : "Active"}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                <Link
                  href={`/${lang}/epaper`}
                  onClick={onClose}
                  className="rounded-lg bg-[#016BB7] text-white px-5 py-2.5 text-sm font-bold hover:bg-[#015a99] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>{isGu ? "ઇ-પેપર વાંચો" : "Read E-Paper Now"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/${lang}/account`}
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 text-gray-700 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  {isGu ? "મારું ખાતું" : "My Account"}
                </Link>
              </div>
            </div>
          )}

          {/* VERIFYING STATE */}
          {status === "verifying" && (
            <div className="text-center py-8">
              <Loader2 className="h-10 w-10 text-[#016BB7] animate-spin mx-auto mb-3" />
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                {isGu ? "ચુકવણી ચકાસણી ચાલુ છે..." : "Verifying Payment Signature..."}
              </h4>
              <p className="text-xs text-gray-500">
                {isGu
                  ? "સર્વર સાથે ક્રિપ્ટોગ્રાફિક સહી ચકાસવામાં આવી રહી છે. કૃપા કરીને રાહ જુઓ."
                  : "Communicating with secure payment server. Please do not refresh."}
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {status === "error" && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
              <div className="flex items-start gap-2 text-red-700 text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage || "An unexpected error occurred."}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-3 text-xs font-bold text-red-700 underline"
              >
                {isGu ? "ફરી પ્રયાસ કરો" : "Try Again"}
              </button>
            </div>
          )}

          {/* CHECKOUT SUMMARY (Idle / Ready) */}
          {(status === "idle" || status === "creating_order" || status === "awaiting_payment") && (
            <div>
              {/* Order summary box */}
              <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">
                      {isGu ? plan.nameGu : plan.nameEn}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {isGu ? `${plan.durationDays} દિવસનું અમર્યાદિત વાચન` : `${plan.durationDays} Days Unlimited Access`}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#016BB7]">₹{plan.priceInr}</span>
                    <span className="block text-[10px] text-gray-400">INR</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-2 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>{isGu ? "વાચક:" : "Subscriber:"}</span>
                    <span className="font-semibold text-gray-800">{subscriber?.fullName || "Guest"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isGu ? "ઇમેઇલ:" : "Email:"}</span>
                    <span className="font-semibold text-gray-800">{subscriber?.email || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isGu ? "પેમેન્ટ મોડ:" : "Payment Mode:"}</span>
                    <span className="font-semibold text-[#016BB7]">Razorpay (UPI / Card / Netbanking)</span>
                  </div>
                </div>
              </div>

              {/* Pay button */}
              <button
                type="button"
                onClick={startCheckout}
                disabled={status === "creating_order" || status === "awaiting_payment"}
                className="w-full rounded-xl bg-[#016BB7] hover:bg-[#015a99] text-white font-bold py-3 text-sm transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {status === "creating_order" || status === "awaiting_payment" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isGu ? "ગેટવે લોડ થઈ રહ્યું છે..." : "Opening Payment Gateway..."}</span>
                  </>
                ) : (
                  <span>{isGu ? `₹${plan.priceInr} ચૂકવો અને સબ્સ્ક્રાઇબ કરો` : `Pay ₹${plan.priceInr} & Subscribe`}</span>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center mt-3">
                🔒 {isGu ? "256-બીટ સુરક્ષિત SSL પેમેન્ટ્સ રેઝરપે દ્વારા" : "256-bit Secure SSL Payments powered by Razorpay"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
