import { NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai-client";

export async function GET() {
  try {
    const hasApiKey = !!process.env.GEMINI_API_KEY;
    const hasJsonEnv = !!process.env.GOOGLE_CREDENTIALS_JSON;
    const jsonLength = process.env.GOOGLE_CREDENTIALS_JSON?.length || 0;

    const ai = getAIClient();
    
    // Test a quick generation
    const interaction = await ai.interactions.create({
      model: "gemini-3.7-flash",
      input: "Say OK",
    });

    return NextResponse.json({
      status: "SUCCESS",
      hasApiKey,
      hasJsonEnv,
      jsonLength,
      result: interaction.output_text,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: "ERROR",
      errorMessage: error?.message || String(error),
      errorStack: error?.stack,
      hasApiKey: !!process.env.GEMINI_API_KEY,
      hasJsonEnv: !!process.env.GOOGLE_CREDENTIALS_JSON,
      jsonLength: process.env.GOOGLE_CREDENTIALS_JSON?.length || 0,
    }, { status: 500 });
  }
}
