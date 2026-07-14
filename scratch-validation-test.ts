import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

async function main() {
  const ai = new GoogleGenAI({ apiKey: "fake-key-just-to-test-validation" });
  
  const chat = ai.chats.create({
    model: "gemini-2.5-pro",
  });
  
  try {
    console.log("Testing string...");
    await chat.sendMessage("How are you?");
    console.log("String passed validation (or failed later)");
  } catch(e) {
    console.log("String error:", e.message);
  }

  try {
    console.log("\nTesting { message: string }...");
    await chat.sendMessage({ message: "How are you?" } as any);
    console.log("Object message passed validation");
  } catch(e) {
    console.log("Object message error:", e.message);
  }

  try {
    console.log("\nTesting { parts: [{text: string}] }...");
    await chat.sendMessage({ parts: [{ text: "How are you?" }] } as any);
    console.log("Parts passed validation");
  } catch(e) {
    console.log("Parts error:", e.message);
  }
}

main();
