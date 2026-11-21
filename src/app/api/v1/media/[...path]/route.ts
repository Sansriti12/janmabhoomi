import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

async function servePlaceholderImage(): Promise<NextResponse> {
  try {
    const placeholderPath = path.join(
      process.cwd(),
      "public",
      "assets",
      "images",
      "epaper-placeholder.jpg"
    );
    const fallbackBuffer = await readFile(placeholderPath);
    return new NextResponse(fallbackBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    // 1x1 transparent PNG fallback if file is missing
    const emptyPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    return new NextResponse(emptyPng, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const subpath = Array.isArray(pathSegments) ? pathSegments.join("/") : pathSegments;
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
  const targetUrl = `${backendBase}/api/v1/media/${subpath}`;

  try {
    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) {
      return servePlaceholderImage();
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return servePlaceholderImage();
    }

    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return servePlaceholderImage();
  }
}
