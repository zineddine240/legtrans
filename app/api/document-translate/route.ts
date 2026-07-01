import { NextRequest } from "next/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { verifyBackendUser, checkAndReserveBackendUsage, rollbackBackendUsage, getPageCountFromBuffer } from "@/lib/auth-backend";

export const maxDuration = 60;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const user = await verifyBackendUser(req);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sourceLanguage = (formData.get("sourceLanguage") as string) || "auto";
    const targetLanguage = (formData.get("targetLanguage") as string) || "ar";

    if (!file) {
      return new Response("Aucun fichier fourni", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");

    // 2. Pre-estimate page count of target PDF or image
    const incomingPages = await getPageCountFromBuffer(buffer, file.type);

    // 3. Verify and Reserve backend limits atomically
    const check = await checkAndReserveBackendUsage('doc', user, incomingPages);
    if (!check.allowed) {
      return new Response(check.error || "Limite dépassée", { status: 403 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: { temperature: 0.1 },
    });

    const sourceLangText =
      sourceLanguage === "auto"
        ? "Détecte automatiquement la langue d'origine du document"
        : `La langue d'origine du document est le code ISO: ${sourceLanguage}`;

    const prompt = `
Tu es un traducteur juridique expert assermenté.
Voici tes instructions obligatoires:
1. Analyse le document (image ou PDF) fourni.
2. ${sourceLangText}.
3. Traduis l'intégralité du contenu vers la langue cible correspondant au code ISO: ${targetLanguage}.
4. Conserve EXACTEMENT la structure originale, y compris tous les tableaux, colonnes, titres, et paragraphes.
5. Utilise le format Markdown pour représenter la structure de manière fidèle (utilise \`| |\` pour construire de vrais tableaux Markdown).
6. Ne génère aucun texte d'introduction (pas de "Voici la traduction"), retourne UNIQUEMENT le document traduit en Markdown pur.
`;

    const stream = new ReadableStream({
      async start(controller) {
        // Send immediate space chunk to flush HTTP headers and prevent gateway timeout
        controller.enqueue(new TextEncoder().encode(" "));

        let firstChunkReceived = false;

        // Send a space chunk every 1.5 seconds to keep the connection warm
        const heartbeat = setInterval(() => {
          if (!firstChunkReceived) {
            try {
              controller.enqueue(new TextEncoder().encode(" "));
            } catch (e) {
              clearInterval(heartbeat);
            }
          }
        }, 1500);

        try {
          const result = await model.generateContentStream([
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type || "application/pdf",
              },
            },
          ]);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              if (!firstChunkReceived) {
                firstChunkReceived = true;
                clearInterval(heartbeat);
              }
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          clearInterval(heartbeat);
          if (!firstChunkReceived) {
            console.warn(`[DocTranslate] Empty result from Gemini. User: ${user.uid}`);
            await rollbackBackendUsage(user.uid, 'doc', incomingPages);
          }
          controller.close();
        } catch (err) {
          clearInterval(heartbeat);
          console.error("Erreur durant le streaming Gemini:", err);
          await rollbackBackendUsage(user.uid, 'doc', incomingPages);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Erreur Document Translate:", error);
    return new Response(error.message || "Erreur lors de la traduction", { status: 500 });
  }
}
