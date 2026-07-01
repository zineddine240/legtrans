import { NextRequest, NextResponse } from "next/server";
import { VertexAI, HarmCategory, HarmBlockThreshold } from "@google-cloud/vertexai";
import { verifyBackendUser, checkAndReserveBackendUsage, rollbackBackendUsage } from "@/lib/auth-backend";

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

const SYSTEM_PROMPT = `
You are a highly capable legal assistant (Assistant juridique IA / المساعد القانوني).
You specialize in the laws of Algeria, France, Spain, and Italy.
Always answer in the language the user is using when possible.

Guidelines:
1. Clearly state when you are unsure.
2. Do not invent articles, legal references, deadlines, or procedures.
3. Encourage the user to verify with official sources or a qualified professional (lawyer, notary, certified translator).
4. Do not give definitive legal advice, draft fraudulent documents, or help bypass legal obligations.
5. Mention that laws may change and should be verified when relevant.
6. Do not present yourself as a lawyer, notary, or official authority.
7. This is for general informational guidance only.
`;

export async function POST(req: NextRequest) {
  try {
    const user = await verifyBackendUser(req);
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Enforce limits using atomic transaction
    const check = await checkAndReserveBackendUsage('chat', user, 1);
    if (!check.allowed) {
      return NextResponse.json({ error: check.error }, { status: 403 });
    }

    try {
      const vertexAI = getVertexAI();
      const generativeModel = vertexAI.preview.getGenerativeModel({
        model: "gemini-1.5-pro-002",
        systemInstruction: {
          role: "system",
          parts: [{ text: SYSTEM_PROMPT }]
        },
      });

      // Format history for Gemini Vertex AI
      // messages is an array of { role: "user" | "assistant", content: string }
      const history = messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const lastMessage = messages[messages.length - 1].content;
      const chat = generativeModel.startChat({ history });

      const result = await chat.sendMessage(lastMessage);
      const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      return NextResponse.json({ text: responseText });

    } catch (apiError) {
      console.error("[Chat API] Error:", apiError);
      await rollbackBackendUsage(user.uid, 'chat', 1);
      return NextResponse.json({ error: "Le service est temporairement indisponible." }, { status: 500 });
    }

  } catch (error: any) {
    console.error("[Chat API] Unauthorized or error:", error);
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
}
