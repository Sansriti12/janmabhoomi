import React from "react";

interface BrandLogoProps {
  compact?: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * Official Janmabhoomi Full Logo Component
 * Displays the complete official brand identity:
 * - Janmabhoomi Group Heritage Emblem (Open Book / Pen & Rays)
 * - Gujarati "જન્મભૂમિ" bold logotype in official heritage blue (#016BB7)
 * - Sanskrit motto: "॥ जननी जन्मभूमिश्च स्वर्गादपि गरीયસી ॥"
 * - Sub-masthead bar: "સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશન"
 */
export function BrandLogo({
  compact = false,
  priority = true,
  className = "",
}: BrandLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-start shrink-0 ${
        compact ? "h-8 sm:h-10" : "h-9 sm:h-12 md:h-14"
      } ${className}`}
    >
      <img
        src="/assets/logos/janmabhoomi-full-logo.svg"
        alt="જન્મભૂમિ - Janmabhoomi Group | સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશન"
        className={`w-auto object-contain transition-all duration-200 select-none ${
          compact ? "h-8 sm:h-10" : "h-10 sm:h-12 md:h-14 max-h-[58px]"
        }`}
        loading={priority ? "eager" : "lazy"}
      />
    </div>
  );
}
