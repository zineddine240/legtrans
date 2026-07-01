import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    // Try JSON service account first (most reliable for Vercel)
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback: individual env vars
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "legtransdz";
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.GOOGLE_CLIENT_EMAIL;
      const rawKey = process.env.FIREBASE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY || "";
      const privateKey = rawKey.replace(/"/g, "").replace(/\\n/g, "\n");
      if (clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        });
      }
    }
  } catch (err) {
    console.error("Failed to initialize Firebase Admin SDK:", err);
  }
}

export const dbAdmin = admin.apps.length ? admin.firestore() : null;
export const authAdmin = admin.apps.length ? admin.auth() : null;
