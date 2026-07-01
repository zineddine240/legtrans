import { NextRequest, NextResponse } from "next/server";
import { VertexAI, HarmCategory, HarmBlockThreshold } from "@google-cloud/vertexai";
import { dbAdmin } from "@/lib/firebase-admin";

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
    const { text, sourceLanguage = "fr", targetLanguage = "ar" } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Aucun texte fourni" }, { status: 400 });
    }

    const vertexAI = getVertexAI();

    const model = vertexAI.preview.getGenerativeModel({
      model: "gemini-1.5-pro-002",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: { temperature: 0.1 },
    });

    const languageNames: Record<string, string> = {
      fr: "Français",
      ar: "Arabe",
      en: "Anglais",
      it: "Italien",
      es: "Espagnol",
    };

    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;
    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    const prompt = `
Tu es un traducteur juridique expert.
Traduis le texte suivant de manière extrêmement rigoureuse, professionnelle et fidèle, en conservant le style, la terminologie juridique appropriée, et les formules consacrées de la traduction professionnelle.

Langue source: ${sourceLangName}
Langue cible: ${targetLangName}

Texte à traduire :
"""
${text}
"""

Ne génère aucun commentaire d'introduction ni de conclusion, retourne UNIQUEMENT le texte traduit directement.
`;

    const request = {
      contents: [
        {
          role: "user" as const,
          parts: [{ text: prompt }],
        },
      ],
    };

    const resp = await model.generateContent(request);
    const translatedText = resp.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const cleanInput = text.trim();
    const cleanOutput = translatedText.trim();

    if (dbAdmin && cleanInput.length >= 20 && cleanOutput.length > 0) {
      try {
        const pairsRef = dbAdmin.collection("translation_pairs");

        const duplicateCheck = await pairsRef
          .where("inputText", "==", cleanInput)
          .where("outputText", "==", cleanOutput)
          .where("sourceLanguage", "==", sourceLanguage)
          .where("targetLanguage", "==", targetLanguage)
          .limit(1)
          .get();

        if (duplicateCheck.empty) {
          await pairsRef.add({
            inputText: cleanInput,
            outputText: cleanOutput,
            sourceLanguage,
            targetLanguage,
            createdAt: new Date(),
            reviewed: false,
            approved: false,
          });
        }
      } catch (logErr) {
        console.error("Failed to log translation pair:", logErr);
      }
    }

    return NextResponse.json({
      success: true,
      translation: cleanOutput,
    });
  } catch (error: any) {
    console.error("Erreur API Translate:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la traduction" },
      { status: 500 }
    );
  }
}
