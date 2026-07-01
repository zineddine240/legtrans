import { NextRequest, NextResponse } from "next/server";
import { verifyBackendUser } from "@/lib/auth-backend";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await verifyBackendUser(req);

    const body = await req.json();
    const { document_id, corrected_text } = body;

    if (!document_id || typeof corrected_text !== "string") {
      return NextResponse.json(
        { error: "Paramètres manquants ou invalides." },
        { status: 400 }
      );
    }

    // 2. Fetch the existing record to verify ownership and check diff
    const { data: existingRecord, error: fetchError } = await supabaseAdmin
      .from("ocr_results")
      .select("user_id, original_text")
      .eq("document_id", document_id)
      .single();

    if (fetchError || !existingRecord) {
      console.error("[Supabase Error] Record not found or fetch failed:", fetchError);
      return NextResponse.json(
        { error: "Document introuvable." },
        { status: 404 }
      );
    }

    // 3. Verify ownership
    if (existingRecord.user_id !== user.uid) {
      return NextResponse.json(
        { error: "Non autorisé à modifier ce document." },
        { status: 403 }
      );
    }

    // 4. Update the record
    const was_edited = existingRecord.original_text !== corrected_text;
    
    const { error: updateError } = await supabaseAdmin
      .from("ocr_results")
      .update({
        corrected_text: corrected_text,
        was_edited: was_edited,
        corrected_at: new Date().toISOString(),
      })
      .eq("document_id", document_id);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    return NextResponse.json({ success: true, was_edited });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`[OCR Corrections Error]`, error);
    const status = message.includes("Non autorisé") ? 401 : message.includes("introuvable") ? 404 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
