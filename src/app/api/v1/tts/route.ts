import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || "";
  const lang = searchParams.get("lang") || "gu";

  if (!text.trim()) {
    return new NextResponse("Text parameter is required", { status: 400 });
  }

  // Google TTS supports up to ~200 characters per request
  const cleanText = text.trim().slice(0, 200);
  const targetLang = lang === "en" ? "en" : "gu";
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    cleanText
  )}&tl=${targetLang}&client=tw-ob`;

  try {
    const upstream = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://translate.google.com/",
      },
      next: { revalidate: 86400 },
    });

    if (!upstream.ok) {
      return new NextResponse("Failed to fetch audio stream", { status: upstream.status });
    }

    const audioBuffer = await upstream.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error) {
    console.error("[TTS Proxy Error]:", error);
    return new NextResponse("Audio generation failed", { status: 502 });
  }
}
