import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyBackendUser } from "@/lib/auth-backend";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user via Firebase
    const user = await verifyBackendUser(req);

    // 2. Query Supabase for this user's OCR results
    // We select needed fields. We might not need the full html/json to save bandwidth, 
    // but markdown is useful for immediate download. We'll fetch all.
    const { data, error } = await supabaseAdmin
      .from('ocr_results')
      .select('document_id, mode, original_file_name, original_mime_type, page_count, created_at, status, original_text, corrected_text, html_output, table_detected, was_edited, corrected_at')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[History API] Supabase error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      history: data || []
    });

  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`[History API Error]`, error);
    const status = message.includes("Non autorisé") ? 401 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
