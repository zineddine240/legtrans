import { NextRequest } from "next/server";
import { VertexAI, HarmCategory, HarmBlockThreshold } from "@google-cloud/vertexai";
import { verifyBackendUser, checkAndReserveBackendUsage, rollbackBackendUsage, getPageCountFromBuffer } from "@/lib/auth-backend";

export const maxDuration = 60;

function getVertexAI(): VertexAI {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS;
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_PROJECT_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  let credentialsObj: any = null;

  if (credentialsJson) {
    try {
      credentialsObj = JSON.parse(credentialsJson);
    } catch (e) {
      console.warn("GOOGLE_CREDENTIALS could not be parsed as JSON, attempting manual rebuild...");
    }
  }

  if (!credentialsObj && projectId && clientEmail && privateKey) {
    credentialsObj = {
      project_id: projectId,
      private_key: privateKey.replace(/\\n/g, "\n"),
      client_email: clientEmail,
    };
  }

  if (!credentialsObj || !credentialsObj.private_key || !credentialsObj.client_email) {
    throw new Error("Missing Google Cloud service account credentials.");
  }

  return new VertexAI({
    project: credentialsObj.project_id || projectId,
    location: "us-central1",
    googleAuthOptions: {
      credentials: {
        client_email: credentialsObj.client_email,
        private_key: credentialsObj.private_key,
      }
    }
  });
}

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

    // 4. Usage reserved in step 3.

    const vertexAI = getVertexAI();

    const model = vertexAI.preview.getGenerativeModel({
      model: "gemini-1.5-pro-002",
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

    const request = {
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
          const streamingResp = await model.generateContentStream(request);

          for await (const chunk of streamingResp.stream) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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
            console.warn(`[DocTranslate] Empty result from Vertex. User: ${user.uid}`);
            await rollbackBackendUsage(user.uid, 'doc', incomingPages);
          }
          controller.close();
        } catch (err) {
          clearInterval(heartbeat);
          console.error("Erreur durant le streaming Vertex AI:", err);
          await rollbackBackendUsage(user.uid, 'doc', incomingPages);
          controller.error(err);
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
