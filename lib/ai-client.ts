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
  // Google Auth expects a file path in GOOGLE_APPLICATION_CREDENTIALS.
  // So we write the JSON string from Vercel ENV to a temporary file.
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const tmpPath = path.join(os.tmpdir(), "gcp-sa.json");
    if (!fs.existsSync(tmpPath)) {
      try {
        fs.writeFileSync(tmpPath, process.env.GOOGLE_CREDENTIALS_JSON);
      } catch (err) {
        console.error("Failed to write GCP Service Account temp file:", err);
      }
    }
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath;
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT || "rational-lambda-485021-e9";
  // Vertex AI Gemini models are primarily hosted in us-central1
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  return new GoogleGenAI({
    vertexai: {
      project: projectId,
      location: location,
    },
  });
}
