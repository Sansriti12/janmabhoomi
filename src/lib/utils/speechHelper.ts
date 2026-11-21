/**
 * Cross-Browser Bulletproof Text-to-Speech Engine
 * Dual-Engine Architecture:
 * 1. High-Fidelity Streaming MP3 Audio via /api/v1/tts (works seamlessly on ALL browsers and OSs,
 *    including Windows without Gujarati Language Pack).
 * 2. Browser SpeechSynthesis (Web Speech API) fallback if offline.
 */

export interface SpeechOptions {
  lang?: "gu" | "en" | "hi";
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: unknown) => void;
}

let activeAudio: HTMLAudioElement | null = null;
let currentSessionId = 0;
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  } catch {}
}

/**
 * Halts any actively playing audio or speech synthesis
 */
export function stopSpeaking() {
  currentSessionId++;

  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.src = "";
    } catch {}
    activeAudio = null;
  }

  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Splits text into natural sentence/clause chunks under 150 characters for seamless audio streaming
 */
function splitIntoNaturalChunks(text: string, maxLen = 140): string[] {
  const clean = text
    .replace(/[#*`_~]/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return [];

  // Split at full stops, danda, question marks, exclamation marks, semicolons, and commas
  const sentences = clean.split(/(?<=[.।?!;\n])\s+/);
  const chunks: string[] = [];

  for (const sentence of sentences) {
    if (sentence.length <= maxLen) {
      if (sentence.trim()) chunks.push(sentence.trim());
    } else {
      // Split large sentence by commas or spaces
      const subParts = sentence.split(/(?<=[,])\s+/);
      let current = "";
      for (const part of subParts) {
        if ((current + " " + part).trim().length <= maxLen) {
          current = (current + " " + part).trim();
        } else {
          if (current) chunks.push(current);
          current = part.trim();
        }
      }
      if (current) chunks.push(current);
    }
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Fallback SpeechSynthesis for offline or restricted environments
 */
function speakWithSpeechSynthesis(
  text: string,
  targetLang: "gu" | "en" | "hi",
  options: SpeechOptions,
  sessionId: number
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 0.95;
    utterance.pitch = options.pitch ?? 1.0;

    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (targetLang === "gu") {
      selectedVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith("gu")) ||
        voices.find((v) => v.lang.toLowerCase().startsWith("hi") || v.lang.includes("IN")) ||
        null;
    } else {
      selectedVoice =
        voices.find((v) => v.lang.toLowerCase() === "en-in" || v.lang.toLowerCase().startsWith("en")) ||
        null;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      utterance.lang = targetLang === "gu" ? "hi-IN" : "en-IN";
    }

    utterance.onstart = () => {
      if (currentSessionId === sessionId && options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (currentSessionId === sessionId && options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      if (currentSessionId === sessionId) {
        if (options.onError) options.onError(e);
        if (options.onEnd) options.onEnd();
      }
    };

    // Chromium GC protection
    (window as unknown as { __activeTTSUtterance?: SpeechSynthesisUtterance }).__activeTTSUtterance = utterance;

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

/**
 * Plays chunks sequentially using HTML5 Audio stream
 */
function playAudioChunks(
  chunks: string[],
  targetLang: "gu" | "en" | "hi",
  options: SpeechOptions,
  sessionId: number
) {
  if (chunks.length === 0) {
    if (options.onEnd) options.onEnd();
    return;
  }

  let currentIndex = 0;
  let hasStarted = false;

  const playNext = () => {
    if (currentSessionId !== sessionId) return;

    if (currentIndex >= chunks.length) {
      activeAudio = null;
      if (options.onEnd) options.onEnd();
      return;
    }

    const chunk = chunks[currentIndex];
    currentIndex++;

    const audioUrl = `/api/v1/tts?text=${encodeURIComponent(chunk)}&lang=${targetLang}`;
    const audio = new Audio(audioUrl);
    if (options.rate) {
      audio.playbackRate = options.rate;
    }
    activeAudio = audio;

    // Preload the next chunk while this one is playing
    if (currentIndex < chunks.length) {
      const nextAudio = new Audio(`/api/v1/tts?text=${encodeURIComponent(chunks[currentIndex])}&lang=${targetLang}`);
      nextAudio.preload = "auto";
    }

    audio.onplay = () => {
      if (currentSessionId !== sessionId) {
        audio.pause();
        return;
      }
      if (!hasStarted) {
        hasStarted = true;
        if (options.onStart) options.onStart();
      }
    };

    audio.onended = () => {
      if (currentSessionId === sessionId) {
        playNext();
      }
    };

    audio.onerror = (err) => {
      console.warn("[TTS Audio Player error, attempting SpeechSynthesis fallback]:", err);
      // Fallback to SpeechSynthesis for remaining text
      const remainingText = chunks.slice(currentIndex - 1).join(" ");
      const fallbackSuccess = speakWithSpeechSynthesis(remainingText, targetLang, options, sessionId);
      if (!fallbackSuccess) {
        if (options.onError) options.onError(err);
        if (options.onEnd) options.onEnd();
      }
    };

    audio.play().catch((playErr) => {
      console.warn("[Audio play blocked, attempting SpeechSynthesis fallback]:", playErr);
      const remainingText = chunks.slice(currentIndex - 1).join(" ");
      const fallbackSuccess = speakWithSpeechSynthesis(remainingText, targetLang, options, sessionId);
      if (!fallbackSuccess) {
        if (options.onError) options.onError(playErr);
        if (options.onEnd) options.onEnd();
      }
    });
  };

  playNext();
}

/**
 * Universal text speaker:
 * Automatically detects language from script (Gujarati vs English),
 * streams high-fidelity audio chunks, and falls back gracefully.
 */
export function speakText(text: string, options: SpeechOptions = {}): boolean {
  if (typeof window === "undefined") return false;

  // 1. Halt existing audio
  stopSpeaking();

  const thisSessionId = ++currentSessionId;

  // 2. Detect actual script from text content
  const hasGujaratiChars = /[\u0A80-\u0AFF]/.test(text);
  const hasDevanagariChars = /[\u0900-\u097F]/.test(text);
  const detectedLang: "gu" | "en" | "hi" = hasGujaratiChars
    ? "gu"
    : hasDevanagariChars
    ? "hi"
    : options.lang === "gu"
    ? "gu"
    : "en";

  // 3. Split into natural speech chunks
  const chunks = splitIntoNaturalChunks(text);
  if (chunks.length === 0) return false;

  // 4. Begin audio streaming
  try {
    playAudioChunks(chunks, detectedLang, options, thisSessionId);
    return true;
  } catch (err) {
    console.error("[speakText failed]:", err);
    return speakWithSpeechSynthesis(text, detectedLang, options, thisSessionId);
  }
}
