import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subpath = Array.isArray(path) ? path.join("/") : path;
  const backendBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:4000";
  const targetUrl = `${backendBase}/api/v1/media/${subpath}`;

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
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
  } catch (error) {
    return new NextResponse("Proxy Error", { status: 502 });
  }
}
