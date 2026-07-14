import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.vercel" }); // Try loading from local env file

const SYSTEM_PROMPT = `You are a test assistant.`;

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const history = [
      { role: "user", parts: [{ text: "Hello" }] }
    ];
    
    console.log("Creating chat...");
    const chat = ai.chats.create({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
      history: history,
    });
    
    console.log("Sending message...");
    const result = await chat.sendMessage({ message: "How are you?" });
    console.log("Result:", result.text);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
