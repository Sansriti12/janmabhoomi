import { NextRequest, NextResponse } from "next/server";

const MAX_GU_CHUNK_CHARS = 220; // Gujarati UTF-8 expands ~9x in URLs; 220 chars stays safely under ~2000 URL bytes

async function translateChunkGuToEn(text: string): Promise<string> {
  const clean = text.trim();
  if (!clean) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=gu&tl=en&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    });
    if (!res.ok) return clean;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0]
        .map((seg: unknown) => (Array.isArray(seg) && typeof seg[0] === "string" ? seg[0] : ""))
        .join("")
        .trim();
    }
    return clean;
  } catch {
    return clean;
  }
}

function splitIntoSafeChunks(text: string, maxChars = MAX_GU_CHUNK_CHARS): string[] {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= maxChars) return [clean];

  const sentences = clean.split(/(?<=[.!?।])\s+/);
  const chunks: string[] = [];
  let buf = "";

  for (const s of sentences) {
    if (s.length > maxChars) {
      if (buf) {
        chunks.push(buf);
        buf = "";
      }
      // Split overly long sentence by words
      const words = s.split(/\s+/);
      let wordBuf = "";
      for (const w of words) {
        if ((wordBuf + " " + w).trim().length > maxChars && wordBuf) {
          chunks.push(wordBuf.trim());
          wordBuf = w;
        } else {
          wordBuf = wordBuf ? `${wordBuf} ${w}` : w;
        }
      }
      if (wordBuf.trim()) chunks.push(wordBuf.trim());
    } else if ((buf + " " + s).trim().length > maxChars && buf) {
      chunks.push(buf.trim());
      buf = s;
    } else {
      buf = buf ? `${buf} ${s}` : s;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks;
}

async function translateLongTextGuToEn(fullText: string): Promise<string> {
  if (!fullText.trim()) return "";
  const paragraphs = fullText.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const translated: string[] = [];

  for (const para of paragraphs) {
    const chunks = splitIntoSafeChunks(para);
    const outParts: string[] = [];
    for (const chunk of chunks) {
      outParts.push(await translateChunkGuToEn(chunk));
    }
    translated.push(outParts.join(" "));
  }

  return translated.join("\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headlineGu = typeof body.headlineGu === "string" ? body.headlineGu : "";
    const subHeadlineGu = typeof body.subHeadlineGu === "string" ? body.subHeadlineGu : "";
    const bodyTextGu = typeof body.bodyTextGu === "string" ? body.bodyTextGu : "";

    const [headlineEn, subHeadlineEn, bodyTextEn] = await Promise.all([
      headlineGu ? translateLongTextGuToEn(headlineGu) : Promise.resolve(""),
      subHeadlineGu ? translateLongTextGuToEn(subHeadlineGu) : Promise.resolve(""),
      bodyTextGu ? translateLongTextGuToEn(bodyTextGu) : Promise.resolve(""),
    ]);

    return NextResponse.json({
      success: true,
      headlineEn,
      subHeadlineEn,
      bodyTextEn,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Translation failed" },
      { status: 500 }
    );
  }
}
