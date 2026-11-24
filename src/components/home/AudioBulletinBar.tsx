"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, Headphones, RotateCcw, SkipForward } from "lucide-react";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { speakText, stopSpeaking } from "@/lib/utils/speechHelper";
import { SponsorStrip } from "@/components/ads/SponsorStrip";

interface AudioBulletinBarProps {
  articles: NewsArticle[];
  lang: Locale;
}

const TOTAL_DURATION_SEC = 135; // 2:15 bulletin

function formatTime(seconds: number): string {
  const clamped = Math.max(0, Math.min(TOTAL_DURATION_SEC, Math.floor(seconds)));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Compact Commuter "2-Minute Audio Bulletin" Sidebar Card
 * - Sits cleanly at the top of the right-hand hero column directly above Other Important News.
 * - Preserves Play/Pause, live status badge, headline ticker, scrubber, 1x/1.25x speed, skip & replay.
 * - Automatically docks a slim floating mini-player at the bottom of the viewport if actively playing
 *   when the user scrolls past the hero section.
 */
export function AudioBulletinBar({ articles, lang }: AudioBulletinBarProps) {
  const isGu = lang === "gu";
  const topFive = articles.slice(0, 5);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.25>(1);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentHeadlineIdx, setCurrentHeadlineIdx] = useState(0);
  const [isCardOutOfView, setIsCardOutOfView] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Observe when the hero audio card scrolls out of view for bottom sticky mini-player
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCardOutOfView(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopSpeaking();
    };
  }, [clearTimer]);

  const startPlaybackFromIndex = useCallback(
    (startIdx: number, playbackRate: 1 | 1.25) => {
      if (topFive.length === 0) return;

      const safeIdx = Math.max(0, Math.min(topFive.length - 1, startIdx));
      setCurrentHeadlineIdx(safeIdx);
      setIsPlaying(true);

      const script = topFive
        .slice(safeIdx)
        .map((a, idx) => {
          const num = safeIdx + idx + 1;
          const title = getLocalizedText(a.title, lang);
          return isGu ? `સમાચાર ${num}: ${title}.` : `Headline ${num}: ${title}.`;
        })
        .join(" ");

      const intro =
        safeIdx === 0
          ? isGu
            ? "નમસ્કાર, જન્મભૂમિ ૨ મિનિટ ઓડિયો બુલેટિનમાં આપનું સ્વાગત છે. "
            : "Welcome to the Janmabhoomi 2-Minute Audio Bulletin. "
          : "";

      speakText(`${intro}${script}`, {
        lang: isGu ? "gu" : "en",
        rate: playbackRate,
        onEnd: () => {
          clearTimer();
          setIsPlaying(false);
          setElapsedSec(TOTAL_DURATION_SEC);
        },
        onError: () => {
          // Keep timer graceful if audio blocked
        },
      });

      clearTimer();
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => {
          const next = prev + playbackRate;
          if (next >= TOTAL_DURATION_SEC) {
            clearTimer();
            setIsPlaying(false);
            return TOTAL_DURATION_SEC;
          }
          const derivedIdx = Math.min(
            topFive.length - 1,
            Math.floor((next / TOTAL_DURATION_SEC) * topFive.length)
          );
          setCurrentHeadlineIdx(derivedIdx);
          return next;
        });
      }, 1000);
    },
    [topFive, lang, isGu, clearTimer]
  );

  const togglePlay = () => {
    if (isPlaying) {
      clearTimer();
      stopSpeaking();
      setIsPlaying(false);
    } else {
      const startSec = elapsedSec >= TOTAL_DURATION_SEC ? 0 : elapsedSec;
      if (elapsedSec >= TOTAL_DURATION_SEC) setElapsedSec(0);
      const startIdx = Math.min(
        Math.max(0, topFive.length - 1),
        Math.floor((startSec / TOTAL_DURATION_SEC) * Math.max(1, topFive.length))
      );
      startPlaybackFromIndex(startIdx, speed);
    }
  };

  const toggleSpeed = () => {
    const nextSpeed: 1 | 1.25 = speed === 1 ? 1.25 : 1;
    setSpeed(nextSpeed);
    if (isPlaying) {
      stopSpeaking();
      startPlaybackFromIndex(currentHeadlineIdx, nextSpeed);
    }
  };

  const handleSkipNext = () => {
    if (topFive.length === 0) return;
    const nextIdx = (currentHeadlineIdx + 1) % topFive.length;
    const nextSec = Math.floor((nextIdx / topFive.length) * TOTAL_DURATION_SEC);
    setElapsedSec(nextSec);
    setCurrentHeadlineIdx(nextIdx);
    if (isPlaying) {
      stopSpeaking();
      startPlaybackFromIndex(nextIdx, speed);
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextSec = Number(e.target.value);
    setElapsedSec(nextSec);
    const nextIdx = Math.min(
      Math.max(0, topFive.length - 1),
      Math.floor((nextSec / TOTAL_DURATION_SEC) * Math.max(1, topFive.length))
    );
    setCurrentHeadlineIdx(nextIdx);
    if (isPlaying) {
      stopSpeaking();
      startPlaybackFromIndex(nextIdx, speed);
    }
  };

  const handleReset = () => {
    clearTimer();
    stopSpeaking();
    setIsPlaying(false);
    setElapsedSec(0);
    setCurrentHeadlineIdx(0);
  };

  const activeHeadline = topFive[currentHeadlineIdx]
    ? getLocalizedText(topFive[currentHeadlineIdx].title, lang)
    : "";

  const progressPercent = (elapsedSec / TOTAL_DURATION_SEC) * 100;

  return (
    <>
      {/* COMPACT HERO SIDEBAR CARD */}
      <div
        ref={cardRef}
        aria-label={isGu ? "૨ મિનિટ ઓડિયો બુલેટિન" : "2-Minute Audio Bulletin"}
        className="rounded-xl bg-gradient-to-br from-[#0B3558] via-[#0E4370] to-[#016BB7] text-white p-3.5 shadow-sm border border-[#016BB7]/30 space-y-2.5"
      >
        {/* Top Row: Play Button + Title + Live Badge */}
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={
              isPlaying
                ? isGu
                  ? "બુલેટિન રોકો"
                  : "Pause audio bulletin"
                : isGu
                ? "બુલેટિન સાંભળો"
                : "Play audio bulletin"
            }
            className="h-9 w-9 rounded-full bg-white text-[#016BB7] hover:bg-sky-100 flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer mt-0.5"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold tracking-wide text-sky-200 uppercase truncate">
                <Headphones className="h-3.5 w-3.5 shrink-0" />
                <span>{isGu ? "મુખ્ય ૫ સમાચાર • ૨:૧૫" : "Top 5 Headlines • 2:15"}</span>
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-200 shrink-0">
                  <Volume2 className="h-2.5 w-2.5 animate-pulse" />
                  <span>{isGu ? "ચાલુ છે" : "Playing"}</span>
                </span>
              )}
            </div>
            {activeHeadline && (
              <p className="text-xs text-white/90 font-medium line-clamp-1 mt-0.5" title={activeHeadline}>
                {currentHeadlineIdx + 1}/{topFive.length}: {activeHeadline}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Row: Scrubber + Timestamps + Speed / Skip / Replay */}
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-[10px] font-mono text-sky-200 tabular-nums shrink-0">
            {formatTime(elapsedSec)}
          </span>

          <input
            type="range"
            min={0}
            max={TOTAL_DURATION_SEC}
            step={1}
            value={Math.floor(elapsedSec)}
            onChange={handleScrub}
            aria-label={isGu ? "ઓડિયો પ્રગતિ" : "Audio bulletin progress"}
            className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer accent-sky-300"
            style={{
              background: `linear-gradient(to right, #38bdf8 ${progressPercent}%, rgba(255,255,255,0.22) ${progressPercent}%)`,
            }}
          />

          <span className="text-[10px] font-mono text-white/70 tabular-nums shrink-0">
            2:15
          </span>

          <button
            type="button"
            onClick={toggleSpeed}
            title={isGu ? "ઝડપ બદલો" : "Toggle playback speed"}
            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer shrink-0 ${
              speed === 1.25
                ? "bg-sky-400 text-[#0B3558] border-sky-300"
                : "bg-white/10 text-white border-white/25 hover:bg-white/20"
            }`}
          >
            {speed === 1 ? "1x" : "1.25x"}
          </button>

          <button
            type="button"
            onClick={handleSkipNext}
            title={isGu ? "આગામી સમાચાર" : "Next headline"}
            aria-label={isGu ? "આગામી સમાચાર" : "Next headline"}
            className="p-1 rounded text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>

          {elapsedSec > 0 && (
            <button
              type="button"
              onClick={handleReset}
              title={isGu ? "ફરીથી શરૂ કરો" : "Replay bulletin"}
              aria-label={isGu ? "ફરીથી શરૂ કરો" : "Replay bulletin"}
              className="p-1 rounded text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Audio Bulletin 'Presented By' Sponsor Strip */}
        <div className="pt-1 border-t border-white/15">
          <SponsorStrip slotKey="audio_sponsor" lang={lang} theme="dark" compact />
        </div>
      </div>

      {/* DOCKED BOTTOM STICKY MINI-PLAYER (Appears only while playing & scrolled past hero) */}
      {isPlaying && isCardOutOfView && (
        <div
          role="region"
          aria-label={isGu ? "ચાલુ ઓડિયો બુલેટિન" : "Playing audio bulletin mini-player"}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-xl rounded-full bg-[#0B3558]/95 backdrop-blur-md text-white px-4 py-2 shadow-2xl border border-sky-400/30 flex items-center gap-3"
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isGu ? "બુલેટિન રોકો" : "Pause audio bulletin"}
            className="h-8 w-8 rounded-full bg-white text-[#016BB7] flex items-center justify-center shrink-0 cursor-pointer"
          >
            <Pause className="h-3.5 w-3.5 fill-current" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-200 uppercase">
              <Volume2 className="h-3 w-3 animate-pulse text-emerald-300" />
              <span>{isGu ? "ઓડિયો બુલેટિન" : "Audio Bulletin"}</span>
              <span className="text-white/60 font-mono">
                {formatTime(elapsedSec)} / 2:15
              </span>
            </div>
            <p className="text-xs text-white truncate">{activeHeadline}</p>
          </div>

          <button
            type="button"
            onClick={toggleSpeed}
            className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 border border-white/25 cursor-pointer shrink-0"
          >
            {speed === 1 ? "1x" : "1.25x"}
          </button>

          <button
            type="button"
            onClick={handleSkipNext}
            aria-label={isGu ? "આગામી સમાચાર" : "Next headline"}
            className="p-1.5 rounded-full hover:bg-white/15 cursor-pointer shrink-0"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
