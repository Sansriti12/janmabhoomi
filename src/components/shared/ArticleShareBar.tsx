"use client";

import React, { useState } from "react";
import { MessageCircle, Share2, Copy, Check } from "lucide-react";
import { Locale } from "@/lib/i18n/config";

interface ArticleShareBarProps {
  title: string;
  url: string;
  lang: Locale;
}

export function ArticleShareBar({ title, url, lang }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Clipboard fallback
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-[#292725]/10 text-xs">
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#016BB7]">
        <Share2 className="h-4 w-4" />
        <span>{lang === "gu" ? "શેર કરો" : "Share This Story"}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* WhatsApp */}
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366] text-[#128C7E] hover:text-white px-3 py-1.5 font-semibold transition-colors"
          title="Share on WhatsApp"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        {/* X (formerly Twitter) */}
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-black/5 hover:bg-black text-[#292725] hover:text-white px-3 py-1.5 font-semibold transition-colors"
          title="Share on X (Twitter)"
          aria-label="Share on X (Twitter)"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="hidden sm:inline">X</span>
        </a>

        {/* Facebook */}
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white px-3 py-1.5 font-semibold transition-colors"
          title="Share on Facebook"
          aria-label="Share on Facebook"
        >
          <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="hidden sm:inline">Facebook</span>
        </a>

        {/* Copy Link */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#292725]/20 hover:border-[#016BB7] hover:text-[#016BB7] px-3 py-1.5 font-semibold transition-colors cursor-pointer"
          title="Copy Article Link"
          aria-label="Copy Article Link"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-600 font-bold">
                {lang === "gu" ? "લિંક કોપી થઈ!" : "Copied!"}
              </span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>{lang === "gu" ? "લિંક કોપી" : "Copy Link"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
