import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const secret = body.secret;
    const paths: string[] = body.paths || [];

    const expectedSecret =
      process.env.REVALIDATION_SECRET || "jb_secret_revalidate_token_2026";

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Invalid revalidation secret token" },
        { status: 401 }
      );
    }

    const revalidated: string[] = [];
    for (const p of paths) {
      if (typeof p === "string" && p.startsWith("/")) {
        revalidatePath(p);
        revalidated.push(p);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Revalidated ${revalidated.length} path(s)`,
      paths: revalidated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to revalidate" },
      { status: 400 }
    );
  }
}
