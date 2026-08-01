import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export function getAIClient(): GoogleGenAI {
  // 1. If a standard Gemini API key is provided, use it.
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  // 2. If using Vertex AI on Vercel, we need to pass the Service Account JSON to Google Auth.
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    let rawJson = process.env.GOOGLE_CREDENTIALS_JSON.trim();
    
    // Strip surrounding quotes if the user included them in Vercel UI
    if ((rawJson.startsWith("'") && rawJson.endsWith("'")) || (rawJson.startsWith('"') && rawJson.endsWith('"'))) {
      rawJson = rawJson.slice(1, -1);
    }

    try {
      const parsed = JSON.parse(rawJson);
      const tmpPath = path.join(os.tmpdir(), "gcp-sa.json");
      fs.writeFileSync(tmpPath, JSON.stringify(parsed));
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
    } catch (err) {
      console.error("[ai-client] Failed to parse GOOGLE_CREDENTIALS_JSON:", err);
    }
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "rational-lambda-485021-e9";
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  return new GoogleGenAI({
    vertexai: {
      project: projectId,
      location: location,
    },
  });
}
