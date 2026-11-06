import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  compact?: boolean;
  priority?: boolean;
  className?: string;
}

/**
 * Official Janmabhoomi Logo Component
 * Extracted directly from official ALL LOGO.pdf (Page 1) vector graphics:
 * - Authentic Gujarati "જન્મભૂમિ" bold logotype in official heritage blue (#016BB7)
 * - Sanskrit tagline: "|| જનની જન્મભૂમિશ્ચ સ્વર્ગાધપિ ગરીયસી ||"
 * - Sub-masthead bar: "સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશન"
 * - Perfectly preserved proportions and crisp vector rendering across desktop and mobile
 */
export function BrandLogo({
  compact = false,
  priority = true,
  className = "",
}: BrandLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${
        compact ? "h-9 sm:h-12 w-auto" : "h-9 sm:h-16 md:h-20 w-auto"
      } ${className}`}
    >
      <Image
        src="/assets/logos/janmabhoomi-logo.svg"
        alt="જન્મભૂમિ - Janmabhoomi | સૌરાષ્ટ્ર ટ્રસ્ટ પ્રકાશન"
        width={320}
        height={85}
        priority={priority}
        className={`w-auto object-contain transition-all duration-200 select-none ${
          compact ? "h-9 sm:h-12 max-w-[150px]" : "h-9 sm:h-16 md:h-20 max-w-[140px] sm:max-w-[340px] md:max-w-[420px]"
        }`}
      />
    </div>
  );
}
