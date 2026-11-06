"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocalizedError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log unexpected runtime error safely without exposing secrets
    console.error("Janmabhoomi UI Runtime Caught Error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-lg border border-[#B83232]/30 bg-white p-8 sm:p-12 shadow-xs">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#B83232]/10 text-[#B83232] mb-4">
          <AlertCircle className="h-6 w-6" />
        </div>

        {/* Gujarati Notice */}
        <div className="border-b border-[#292725]/10 pb-5">
          <h1 className="font-gujarati text-xl sm:text-2xl font-bold text-[#292725]">
            કંઈક ભૂલ થઈ છે
          </h1>
          <p className="font-gujarati text-sm text-[#292725]/75 mt-1 leading-relaxed">
            આ પાનું લોડ કરતી વખતે તકનીકી સમસ્યા આવી છે. કૃપા કરીને ફરી પ્રયાસ કરો અથવા હોમ પેજ પર પાછા ફરો.
          </p>
        </div>

        {/* English Notice */}
        <div className="mt-5">
          <h2 className="text-base sm:text-lg font-bold text-[#292725]">
            An unexpected error occurred
          </h2>
          <p className="text-xs sm:text-sm text-[#292725]/70 mt-1 leading-relaxed">
            We were unable to render this section. You can retry the operation or return to the main edition.
          </p>
        </div>

        {/* Recovery Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 rounded-md bg-[#016BB7] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#016BB7]/90 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>ફરી પ્રયાસ કરો (Try Again)</span>
          </button>

          <Link
            href="/gu"
            className="inline-flex items-center gap-2 rounded-md border border-[#292725]/20 bg-[#FAF8F3] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#292725] hover:border-[#016BB7] hover:text-[#016BB7] transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>હોમ પેજ (Homepage)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
