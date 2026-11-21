"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type ReaderTheme = "light" | "sepia" | "dark";
export type FontScaleStep = 0 | 1 | 2 | 3; // 0: 0.92, 1: 1.0 (default), 2: 1.12, 3: 1.24

const FONT_SCALE_VALUES: Record<FontScaleStep, number> = {
  0: 0.92,
  1: 1,
  2: 1.12,
  3: 1.24,
};

interface ReaderComfortContextValue {
  theme: ReaderTheme;
  setTheme: (theme: ReaderTheme) => void;
  fontStep: FontScaleStep;
  decreaseFont: () => void;
  resetFont: () => void;
  increaseFont: () => void;
}

const ReaderComfortContext = createContext<ReaderComfortContextValue>({
  theme: "light",
  setTheme: () => {},
  fontStep: 1,
  decreaseFont: () => {},
  resetFont: () => {},
  increaseFont: () => {},
});

const STORAGE_THEME_KEY = "janmabhoomi_reader_theme_v1";
const STORAGE_FONT_KEY = "janmabhoomi_reader_font_step_v1";

export function ReaderComfortProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ReaderTheme>("light");
  const [fontStep, setFontStepState] = useState<FontScaleStep>(1);

  // Hydrate saved preferences
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_THEME_KEY) as ReaderTheme | null;
      if (savedTheme === "light" || savedTheme === "sepia" || savedTheme === "dark") {
        setThemeState(savedTheme);
      }
      const savedFont = localStorage.getItem(STORAGE_FONT_KEY);
      if (savedFont !== null) {
        const parsed = Number(savedFont);
        if (parsed >= 0 && parsed <= 3) {
          setFontStepState(parsed as FontScaleStep);
        }
      }
    } catch {}
  }, []);

  // Apply to <html> element
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-reader-theme", theme);
    root.style.setProperty("--reader-font-scale", String(FONT_SCALE_VALUES[fontStep]));
    try {
      localStorage.setItem(STORAGE_THEME_KEY, theme);
      localStorage.setItem(STORAGE_FONT_KEY, String(fontStep));
    } catch {}
  }, [theme, fontStep]);

  const setTheme = useCallback((next: ReaderTheme) => {
    setThemeState(next);
  }, []);

  const decreaseFont = useCallback(() => {
    setFontStepState((prev) => (prev > 0 ? ((prev - 1) as FontScaleStep) : 0));
  }, []);

  const resetFont = useCallback(() => {
    setFontStepState(1);
  }, []);

  const increaseFont = useCallback(() => {
    setFontStepState((prev) => (prev < 3 ? ((prev + 1) as FontScaleStep) : 3));
  }, []);

  return (
    <ReaderComfortContext.Provider
      value={{
        theme,
        setTheme,
        fontStep,
        decreaseFont,
        resetFont,
        increaseFont,
      }}
    >
      {children}
    </ReaderComfortContext.Provider>
  );
}

export function useReaderComfort() {
  return useContext(ReaderComfortContext);
}
