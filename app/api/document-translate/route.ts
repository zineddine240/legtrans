import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { verifyBackendUser, checkAndReserveBackendUsage, rollbackBackendUsage, getPageCountFromBuffer } from "@/lib/auth-backend";

export const maxDuration = 60;

function getAIClient(): GoogleGenAI {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "rational-lambda-485021-e9";
  const location = process.env.GOOGLE_CLOUD_LOCATION || "global";

  return new GoogleGenAI({
    vertexai: {
      project: projectId,
      location: location,
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    // const user = await verifyBackendUser(req);

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
    // const check = await checkAndReserveBackendUsage('doc', user, incomingPages);
    // if (!check.allowed) {
    //   return new Response(check.error || "Limite dépassée", { status: 403 });
    // }

    // 4. Usage reserved in step 3.

    const ai = getAIClient();

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

    const request = {
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user" as const,
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: file.type || "application/pdf",
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      }
    };

    const stream = new ReadableStream({
      async start(controller) {
        // Send immediate space chunk to flush HTTP headers and prevent Vercel gateway timeout
        controller.enqueue(new TextEncoder().encode(" "));

        let firstChunkReceived = false;

        // Send a space chunk every 1.5 seconds to keep the connection warm while Gemini processes
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
          const streamingResp = await ai.models.generateContentStream(request);

          for await (const chunk of streamingResp) {
            const text = chunk.text ?? "";
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
            // Nothing was received, rollback
            // console.warn(`[DocTranslate] Empty result from Vertex. User: ${user.uid}`);
            // await rollbackBackendUsage(user.uid, 'doc', incomingPages);
          }
          controller.close();
        } catch (err: any) {
          clearInterval(heartbeat);
          console.error("Erreur durant le streaming Vertex AI:", err);
          
          let errorMessage = "Erreur inattendue du serveur.";
          if (err.status === 429 || err.message?.includes("429") || err.message?.includes("quota")) {
            errorMessage = "⚠️ **Quota dépassé** : Vous avez utilisé toutes vos requêtes gratuites pour ce modèle (Gemini 3.7 Flash). Veuillez patienter ou mettre à niveau votre compte Google AI Studio.";
          } else if (err.status === 503 || err.message?.includes("503")) {
            errorMessage = "⚠️ **Serveur surchargé** : Le serveur Google est actuellement très sollicité. Veuillez réessayer dans quelques instants.";
          } else {
            errorMessage = `⚠️ **Erreur lors de la traduction** : ${err.message || "Impossible de contacter l'IA"}`;
          }
          
          // Send the actual error message inside the document markdown so the user sees it!
          controller.enqueue(new TextEncoder().encode(`\n\n${errorMessage}\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    console.error("Erreur Vertex AI:", error);
    return new Response(error.message || "Erreur lors de la traduction", { status: 500 });
  }
}
