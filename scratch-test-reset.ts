// @ts-nocheck
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "legtransdz";
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

async function test() {
  try {
    const link = await getAuth().generatePasswordResetLink("kayiv71965@hilostar.com");
    console.log("SUCCESS, Link:", link);
  } catch (e) {
    console.error("ERROR:", e);
  }
}

test();
