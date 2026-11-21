"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2, Headphones, RotateCcw } from "lucide-react";
import { NewsArticle, getLocalizedText } from "@/lib/data/types";
import { Locale } from "@/lib/i18n/config";
import { speakText, stopSpeaking } from "@/lib/utils/speechHelper";

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
 * Commuter "2-Minute Audio Bulletin" Bar
 * Slim, sticky-capable audio player directly below the Breaking News ticker
 * tailored for Mumbai and Gujarat commuters.
 */
export function AudioBulletinBar({ articles, lang }: AudioBulletinBarProps) {
  const isGu = lang === "gu";
  const topFive = articles.slice(0, 5);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.25>(1);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [currentHeadlineIdx, setCurrentHeadlineIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
          // Keep timer running gracefully even if browser audio is blocked
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
        Math.floor((startSec / TOTAL_DURATION_SEC) * topFive.length)
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
    <section
      aria-label={isGu ? "૨ મિનિટ ઓડિયો બુલેટિન" : "2-Minute Audio Bulletin"}
      className="sticky top-[92px] sm:top-[104px] lg:top-[144px] z-30 w-full bg-[#0B3558] text-white border-b border-white/15 shadow-sm"
    >
      <div className="container-wide py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
        {/* Left: Play/Pause + Title + Active Headline */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
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
            className="h-8 w-8 rounded-full bg-white text-[#016BB7] hover:bg-sky-100 flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-extrabold tracking-wide text-sky-200 uppercase">
                <Headphones className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {isGu
                    ? "મુખ્ય ૫ સમાચાર સાંભળો • ૨:૧૫"
                    : "Listen to Top 5 Headlines • 2:15"}
                </span>
              </span>
              {isPlaying && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                  <Volume2 className="h-2.5 w-2.5 animate-pulse" />
                  <span>{isGu ? "ચાલુ છે" : "Playing"}</span>
                </span>
              )}
            </div>
            {activeHeadline && (
              <p className="text-[11px] text-white/80 truncate mt-0.5">
                {currentHeadlineIdx + 1}/{topFive.length}: {activeHeadline}
              </p>
            )}
          </div>
        </div>

        {/* Right: Scrubber + Time + 1.25x Speed Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 md:w-[340px] lg:w-[400px]">
          <span className="text-[11px] font-mono text-sky-200 tabular-nums shrink-0">
            {formatTime(elapsedSec)}
          </span>

          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={TOTAL_DURATION_SEC}
              step={1}
              value={Math.floor(elapsedSec)}
              onChange={handleScrub}
              aria-label={isGu ? "ઓડિયો પ્રગતિ" : "Audio bulletin progress"}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-sky-300"
              style={{
                background: `linear-gradient(to right, #38bdf8 ${progressPercent}%, rgba(255,255,255,0.22) ${progressPercent}%)`,
              }}
            />
          </div>

          <span className="text-[11px] font-mono text-white/70 tabular-nums shrink-0">
            2:15
          </span>

          <button
            type="button"
            onClick={toggleSpeed}
            title={isGu ? "ઝડપ બદલો" : "Toggle playback speed"}
            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
              speed === 1.25
                ? "bg-sky-400 text-[#0B3558] border-sky-300"
                : "bg-white/10 text-white border-white/25 hover:bg-white/20"
            }`}
          >
            {speed === 1 ? "1x" : "1.25x"}
          </button>

          {elapsedSec > 0 && (
            <button
              type="button"
              onClick={handleReset}
              title={isGu ? "ફરીથી શરૂ કરો" : "Restart bulletin"}
              aria-label={isGu ? "ફરીથી શરૂ કરો" : "Restart bulletin"}
              className="p-1 rounded text-white/75 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
