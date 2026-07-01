import { NextRequest, NextResponse } from "next/server";
import { runCustomProcessor, extractWithDatalab } from "@/lib/datalab";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyBackendUser, checkAndReserveBackendUsage, rollbackBackendUsage, getPageCountFromBuffer } from "@/lib/auth-backend";

export const maxDuration = 180; // 3 minutes max for complex document processing

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await verifyBackendUser(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const mode = formData.get("mode") as "handwriting" | "table" | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    if (!mode || (mode !== "handwriting" && mode !== "table")) {
      return NextResponse.json(
        { error: "Mode d'extraction invalide. Choisissez 'handwriting' ou 'table'." },
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
    
    // 2. Pre-estimate page count (to check limits before calling Datalab API)
    const incomingPages = await getPageCountFromBuffer(buffer, file.type);

    // 3. Verify and Reserve backend limits atomically
    const check = await checkAndReserveBackendUsage(mode, user, incomingPages);
    if (!check.allowed) {
      return NextResponse.json(
        { error: check.error },
        { status: 403 }
      );
    }

    // 4. Run custom processor or Marker extraction
    let result;
    try {
      if (mode === "handwriting") {
        console.log("[OCR Routing] mode=", mode);
        console.log("[OCR Routing] endpoint=/api/v1/custom-processor");
        console.log("[OCR Routing] pipeline_id=handwriting-detection");
        console.log("[OCR Routing] file=", file.name, file.type, file.size);
        
        const ocrResult = await runCustomProcessor(buffer, file.name, file.type, "handwriting-detection");
        result = {
          markdown: ocrResult.markdown,
          html: ocrResult.html,
          json: ocrResult.json,
          results: ocrResult.results,
          pageCount: incomingPages,
          costCents: ocrResult.costCents,
        };
      } else {
        // mode === "table" -> Use Datalab Convert internally for table extraction
        console.log("[OCR Custom] Table mode - file:", file.name, "type:", file.type, "size:", file.size);
        const markerResult = await extractWithDatalab(buffer, file.name, file.type, "accurate");
        result = {
          markdown: markerResult.markdown,
          html: "", // Marker doesn't return HTML natively, will be compiled by markdownToHtml in preview
          json: null,
          results: null,
          pageCount: incomingPages,
          costCents: markerResult.costCents,
        };
      }
    } catch (apiError) {
      // Rollback on Datalab failure
      console.error("[OCR Custom] API Error, rolling back usage:", apiError);
      await rollbackBackendUsage(user.uid, mode, incomingPages);
      throw apiError;
    }

    // Check if result is empty to protect quota and validate success
    const isEmpty = !result.markdown?.trim() && !result.html?.trim() && (!result.json || Object.keys(result.json).length === 0);
    if (isEmpty) {
      console.warn(`[OCR Custom] Empty result from Datalab. Mode: ${mode}, User: ${user.uid}`);
      await rollbackBackendUsage(user.uid, mode, incomingPages);
      return NextResponse.json(
        { error: "Le document n'a pas pu être traité correctement. Veuillez vérifier que le fichier contient du texte lisible." },
        { status: 422 }
      );
    }

    // 5. Usage is already reserved in step 3. No need to increment here anymore.

    // 6. Supabase storage
    const document_id = crypto.randomUUID();
    const saveToSupabase = async () => {
      try {
        console.log(`[Supabase OCR] Starting storage for document`, document_id);
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
          console.warn("[Supabase OCR] Missing environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
        }

        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const folder = mode === "table" ? "tables" : "handwriting";
        const filePath = `pending-review/${folder}/${document_id}-${safeName}`;
        
        console.log(`[Supabase OCR] Uploading file to`, filePath);
        const { error: uploadError } = await supabaseAdmin.storage
          .from('training-dataset')
          .upload(filePath, buffer, {
            contentType: file.type,
            upsert: true
          });

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }
        console.log(`[Supabase OCR] File uploaded successfully`, filePath);

        console.log(`[Supabase OCR] Inserting OCR row`, document_id);
        let originalText = "";
        const r = result as any;
        if (mode === "table") {
          originalText = r.markdown || r.text || "";
        } else {
          originalText = r.markdown || r.text || r.html || "";
        }

        const payload = {
          user_id: user.uid,
          document_id: document_id,
          mode: mode,
          original_file_path: filePath,
          original_file_name: file.name,
          original_mime_type: file.type,
          page_count: incomingPages,
          original_text: originalText,
          corrected_text: null,
          html_output: result.html || "",
          json_output: r.json || null,
          table_detected: mode === "table",
          was_edited: false,
          status: 'pending',
          stored_for_review: true,
          used_for_training: false,
          anonymized: false,
        };
        console.log("[Supabase OCR] Insert payload", JSON.stringify(payload, null, 2));
        const { data, error: dbError } = await supabaseAdmin.from('ocr_results').insert(payload).select();
        console.log("[Supabase OCR] Insert result", data);

        if (dbError) {
          console.error("[Supabase OCR Insert Error]", dbError);
          console.error("Payload keys:", Object.keys(payload));
          throw new Error(`DB Insert failed: ${dbError.message}`);
        }
        console.log(`[Supabase OCR] OCR row inserted successfully`, document_id);
      } catch (err: any) {
        console.error("[Supabase OCR Storage/Insert Error]", err);
      }
    };
    
    // Await execution for Vercel Serverless environment
    await saveToSupabase();

    return NextResponse.json({
      success: true,
      document_id: document_id,
      markdown: result.markdown,
      html: result.html,
      json: result.json,
      results: result.results,
      pageCount: incomingPages,
      costCents: result.costCents,
    });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`[OCR Custom Error]`, error);
    const status = message.includes("Non autorisé") ? 401 : message.includes("introuvable") ? 404 : 500;
    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
