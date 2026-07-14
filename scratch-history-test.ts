import { GoogleGenAI } from "@google/genai";

async function main() {
  const ai = new GoogleGenAI({ apiKey: "fake-key-just-to-test-validation" });
  
  const history = [
    { role: "user", parts: [{ text: "Hello" }] },
    { role: "model", parts: [{ text: "Hi" }] }
  ];

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-pro",
      history: history
    });
    
    console.log("Creating chat passed validation. Sending message...");
    await chat.sendMessage({ message: "How are you?" } as any);
  } catch(e) {
    console.log("Error:", e.message);
  }
}

main();
