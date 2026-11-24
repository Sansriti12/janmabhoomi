import { NextRequest, NextResponse } from "next/server";

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

async function translateLongTextGuToEn(fullText: string): Promise<string> {
  if (!fullText.trim()) return "";
  const paragraphs = fullText.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const translated: string[] = [];

  for (const para of paragraphs) {
    if (para.length <= 1400) {
      translated.push(await translateChunkGuToEn(para));
    } else {
      // Split very long paragraph into ~1200-char sentence chunks
      const sentences = para.split(/(?<=[.!?।])\s+/);
      let buf = "";
      const outParts: string[] = [];
      for (const s of sentences) {
        if ((buf + " " + s).length > 1200 && buf) {
          outParts.push(await translateChunkGuToEn(buf));
          buf = s;
        } else {
          buf = buf ? `${buf} ${s}` : s;
        }
      }
      if (buf) outParts.push(await translateChunkGuToEn(buf));
      translated.push(outParts.join(" "));
    }
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
      headlineGu ? translateChunkGuToEn(headlineGu) : Promise.resolve(""),
      subHeadlineGu ? translateChunkGuToEn(subHeadlineGu) : Promise.resolve(""),
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
