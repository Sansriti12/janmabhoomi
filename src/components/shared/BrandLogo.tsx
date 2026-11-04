import React from "react";

interface BrandLogoProps {
  compact?: boolean;
}

/**
 * Official Janmabhoomi Logo Container
 * Matches the pill-framed crest from the approved header reference:
 * - Shield & Bird crest above "જન્મભૂમિ કાર્યાલય"
 * - Clearly marked asset container ready for swap with the master SVG/PNG file at `/public/assets/logos/janmabhoomi-logo.png`
 */
export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl border border-[#292725]/15 bg-[#F2EFE9] shadow-2xs select-none overflow-hidden shrink-0 ${
        compact ? "h-11 w-24 px-2" : "h-14 w-32 sm:w-36 px-3"
      }`}
      title="Official Janmabhoomi Crest (Replace /public/assets/logos/janmabhoomi-logo.svg with master vector)"
    >
      {/* Subtle vertical side-panel framing as seen in the reference screenshot */}
      <div className="absolute inset-y-0 left-0 w-3.5 bg-[#E6E2D8]/80 border-r border-[#292725]/8" />
      <div className="absolute inset-y-0 right-0 w-3.5 bg-[#E6E2D8]/80 border-l border-[#292725]/8" />

      <div className="relative z-10 flex flex-col items-center justify-center leading-none py-1">
        {/* Traditional Crest Shield & Rising Bird Emblem from Reference */}
        <svg
          viewBox="0 0 64 32"
          className={compact ? "h-4 w-9" : "h-5 w-11"}
          aria-hidden="true"
        >
          {/* Shield outline */}
          <path
            d="M22 4 H42 V16 C42 23 32 28 32 28 C32 28 22 23 22 16 Z"
            fill="#FFFFFF"
            stroke="#292725"
            strokeWidth="1.8"
          />
          {/* Sunburst / Horizon waves inside crest */}
          <path
            d="M24 17 Q32 14 40 17 M25 20 Q32 18 39 20"
            stroke="#174F73"
            strokeWidth="1.4"
            fill="none"
          />
          {/* Soaring bird silhouette */}
          <path
            d="M27 12 C30 9 33 8 38 6 C36 10 35 12 39 13 C34 13 31 14 27 12 Z"
            fill="#292725"
          />
        </svg>

        {/* Gujarati "જન્મભૂમિ" Script Logotype in Primary Blue */}
        <span
          className={`font-gujarati font-extrabold tracking-tight text-[#0D63A5] ${
            compact ? "text-[13px] mt-0.5" : "text-[16px] sm:text-[17px] mt-0.5"
          }`}
        >
          જન્મભૂમિ
        </span>
        <span
          className={`font-gujarati font-semibold text-[#292725]/85 ${
            compact ? "text-[7px]" : "text-[8.5px]"
          }`}
        >
          કાર્યાલય
        </span>
      </div>
    </div>
  );
}
