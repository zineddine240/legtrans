import { NextRequest, NextResponse } from "next/server";
import { extractWithDatalab } from "@/lib/datalab";
import { verifyBackendUser, checkAndReserveBackendUsage, rollbackBackendUsage, getPageCountFromBuffer } from "@/lib/auth-backend";

export const maxDuration = 120; // 2 minutes max

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await verifyBackendUser(req);

    const formData = await req.formData();
    const file = (formData.get("file") ?? formData.get("image")) as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (file.size > 200 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 200 MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 2. Pre-estimate page count (to check limits before calling marker API)
    const incomingPages = await getPageCountFromBuffer(buffer, file.type);

    // 3. Verify and Reserve backend limits atomically
    const check = await checkAndReserveBackendUsage('ocr', user, incomingPages);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.error },
        { status: 403 }
      );
    }

    const mode = formData.get("mode") as string | null;
    const finalMode = mode === "accurate" ? "accurate" : "fast";

    // Run extraction
    let result;
    try {
      result = await extractWithDatalab(buffer, file.name, file.type, finalMode);
    } catch (apiError) {
      // Rollback on Datalab failure
      console.error("[OCR] API Error, rolling back usage:", apiError);
      await rollbackBackendUsage(user.uid, 'ocr', incomingPages);
      throw apiError;
    }

    // Check if empty
    if (!result.markdown?.trim()) {
      console.warn(`[OCR] Empty result from Datalab. User: ${user.uid}`);
      await rollbackBackendUsage(user.uid, 'ocr', incomingPages);
      return NextResponse.json(
        { error: "Le document n'a pas pu être traité correctement." },
        { status: 422 }
      );
    }

    // 4. Usage already reserved.

    return NextResponse.json({
      success: true,
      markdown: result.markdown,
      pageCount: result.pageCount,
      page_count: result.pageCount,
      costCents: result.costCents,
      parse_quality_score: 0,
    });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    const status = message.includes("Non autorisé") ? 401 : message.includes("introuvable") ? 404 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
