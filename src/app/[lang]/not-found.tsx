import React from "react";
import Link from "next/link";
import { Newspaper, Home, ArrowLeft } from "lucide-react";

export default function LocalizedNotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-lg border border-[#292725]/15 bg-white p-8 sm:p-12 shadow-xs">
        <span className="text-4xl sm:text-5xl font-black text-[#016BB7] tracking-tight">
          404
        </span>

        {/* Gujarati Notice */}
        <div className="mt-4 border-b border-[#292725]/10 pb-6">
          <h1 className="font-gujarati text-xl sm:text-2xl font-bold text-[#292725]">
            આ પાનું મળ્યું નથી
          </h1>
          <p className="font-gujarati text-sm text-[#292725]/75 mt-1.5 leading-relaxed">
            તમે જે સમાચાર અહેવાલ અથવા વિભાગ શોધી રહ્યા છો તે કદાચ ખસેડવામાં આવ્યો છે અથવા અસ્તિત્વમાં નથી.
          </p>
        </div>

        {/* English Notice */}
        <div className="mt-6">
          <h2 className="text-lg font-bold text-[#292725]">
            Page or Article Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#292725]/70 mt-1 leading-relaxed">
            The news article, editorial, or category you requested does not exist or may have been archived.
          </p>
        </div>

        {/* Navigation Recovery Options */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/gu"
            className="inline-flex items-center gap-2 rounded-md bg-[#016BB7] px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#016BB7]/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>હોમ પેજ (Home)</span>
          </Link>

          <Link
            href="/gu/latest"
            className="inline-flex items-center gap-2 rounded-md border border-[#016BB7] bg-[#FAF8F3] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#016BB7] hover:bg-[#016BB7]/10 transition-colors"
          >
            <span>તાજા સમાચાર (Latest)</span>
          </Link>

          <Link
            href="/gu/epaper"
            className="inline-flex items-center gap-2 rounded-md border border-[#292725]/20 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-[#292725] hover:border-[#016BB7] hover:text-[#016BB7] transition-colors"
          >
            <Newspaper className="h-4 w-4 text-[#C59B4B]" />
            <span>ઈ-પેપર (E-Paper)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
