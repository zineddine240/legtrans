import { authAdmin, dbAdmin } from "./firebase-admin";
import { TIER_LIMITS, getAccessTier, getAlgeriaDateKey } from "./trial";
import { PDFDocument } from "pdf-lib";

export interface BackendUser {
  uid: string;
  profile: any;
  tier: 'admin' | 'pro' | 'plus' | 'trial' | 'free';
}

/**
 * Parses and verifies the Firebase ID Token from the request authorization headers.
 * Retrieves the user profile from Firestore.
 */
export async function verifyBackendUser(req: Request): Promise<BackendUser> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Non autorisé : Token d'accès manquant. Veuillez vous connecter.");
  }

  const token = authHeader.substring(7);
  if (!authAdmin) {
    throw new Error("Erreur serveur : Service Auth non initialisé.");
  }

  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    const uid = decodedToken.uid;

    if (!dbAdmin) {
      throw new Error("Erreur serveur : Base de données non initialisée.");
    }

    const profileSnap = await dbAdmin.collection("profiles").doc(uid).get();
    if (!profileSnap.exists) {
      throw new Error("Profil utilisateur introuvable.");
    }

    const profile = profileSnap.data();
    const tier = getServerAccessTier(profile);

    return { uid, profile, tier };
  } catch (err: any) {
    throw new Error(`Non autorisé : Session invalide ou expirée (${err.message}).`);
  }
}

/**
 * Determine the user's access tier on the server side using the Firestore profile.
 */
function getServerAccessTier(profile: any): 'admin' | 'pro' | 'plus' | 'trial' | 'free' {
  if (profile.is_admin) return 'admin';

  const tier = profile.subscription_tier || profile.plan;
  if (tier === 'pro') return 'pro';
  if (tier === 'plus') return 'plus';

  // Check trial expiration timestamp in Firestore
  const trialExpires = profile.trial_expires_at;
  if (trialExpires) {
    const expiryDate = trialExpires.toDate ? trialExpires.toDate() : new Date(trialExpires);
    // Trial duration is now 7 days, but trialExpires might have been set to 14 days in the past.
    // To strictly enforce 7 days from signup, we should ideally check created_at.
    // However, if we assume trialExpires was set to `created_at + 14 days`, we can check if `trialExpires - 7 days` has passed.
    // Actually, `trialExpires` is exactly the expiration date. Since the policy changed globally to 7 days, 
    // a simple robust way is: if `profile.created_at` exists, check if it's within 7 days.
    const createdAt = profile.created_at || profile.createdAt;
    if (createdAt) {
      const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      if (Date.now() - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
        return 'trial';
      } else {
        return 'free'; // Expired 7-day trial
      }
    }
    
    // Fallback if no created_at
    if (expiryDate.getTime() > Date.now()) {
      return 'trial';
    }
  }

  return 'free';
}

/**
 * Atomically checks user limits and reserves usage within a Firestore transaction.
 */
export async function checkAndReserveBackendUsage(
  action: 'ocr' | 'doc' | 'handwriting' | 'table' | 'chat',
  user: BackendUser,
  incomingPages: number = 1
): Promise<{ allowed: boolean; error?: string; usage?: any }> {
  if (!dbAdmin) return { allowed: false, error: "Database not initialized" };
  const { uid, tier } = user;

  if (tier === 'admin') {
    return { allowed: true };
  }

  const limits = TIER_LIMITS[tier];
  const today = getAlgeriaDateKey();

  return await dbAdmin.runTransaction(async (transaction) => {
    const profileRef = dbAdmin!.collection("profiles").doc(uid);
    const profileSnap = await transaction.get(profileRef);

    if (!profileSnap.exists) {
      return { allowed: false, error: "Profil utilisateur introuvable." };
    }

    const profile = profileSnap.data()!;
    let usage = profile.daily_usage || {};
    
    // Reset usage if a new day has started
    if (!usage || !usage.date || usage.date !== today) {
      usage = {
        date: today,
        ocrCount: 0,
        ocrPagesCount: 0,
        docCount: 0,
        docPagesCount: 0,
        chatCount: 0,
        handwriting_mode_usage: null,
        table_mode_usage: null
      };
    }

    // CHECK LIMITS
    if (action === 'ocr') {
      if (usage.ocrCount >= limits.ocrPerDay) {
        return { allowed: false, error: `Limite journalière de requêtes OCR atteinte (${limits.ocrPerDay} requêtes/jour).` };
      }
      if (usage.ocrPagesCount + incomingPages > limits.maxOcrPagesPerDay) {
        return { allowed: false, error: `Limite journalière de pages OCR dépassée (${limits.maxOcrPagesPerDay} pages maximum par jour, traité aujourd'hui: ${usage.ocrPagesCount} pages).` };
      }
      if (incomingPages > limits.maxPages) {
        return { allowed: false, error: `Votre forfait ${tier.toUpperCase()} est limité à ${limits.maxPages} pages par document. Ce document contient ${incomingPages} pages.` };
      }
    }

    if (action === 'doc') {
      if (limits.docPerDay === 0) {
        return { allowed: false, error: "La traduction de documents par IA est désactivée pour votre forfait gratuit." };
      }
      if (usage.docCount >= limits.docPerDay) {
        return {
          allowed: false,
          error: `Limite journalière de documents traduits atteinte (${limits.docPerDay} documents/jour).`
        };
      }

      let maxPagesPerDoc = 5;
      let maxPagesPerDay = 5;
      if (tier === 'plus') { maxPagesPerDoc = 10; maxPagesPerDay = 50; } 
      else if (tier === 'trial') { maxPagesPerDoc = 5; maxPagesPerDay = 10; }

      if (incomingPages > maxPagesPerDoc) {
        return { allowed: false, error: `La traduction de document par IA est limitée à ${maxPagesPerDoc} pages par document pour votre forfait. Ce document contient ${incomingPages} pages.` };
      }
      if ((usage.docPagesCount || 0) + incomingPages > maxPagesPerDay) {
        return { allowed: false, error: `Limite journalière de pages traduites par IA dépassée (${maxPagesPerDay} pages maximum par jour, traité aujourd'hui: ${usage.docPagesCount || 0} pages).` };
      }
    }

    if (action === 'chat') {
      const chatLimit = limits.chatPerDay || 0;
      if (usage.chatCount >= chatLimit) {
        return { allowed: false, error: `Limite journalière de messages atteinte (${chatLimit} messages/jour). Passez à un forfait supérieur pour continuer.` };
      }
    }

    if (action === 'handwriting' || action === 'table') {
      let hwUsage = usage.handwriting_mode_usage || { requests: 0, pages: 0, date: today };
      if (hwUsage.date !== today) hwUsage = { requests: 0, pages: 0, date: today };

      let tableUsage = usage.table_mode_usage || { requests: 0, pages: 0, date: today };
      if (tableUsage.date !== today) tableUsage = { requests: 0, pages: 0, date: today };

      const totalPremiumPages = (hwUsage.pages || 0) + (tableUsage.pages || 0);
      const totalPremiumRequests = (hwUsage.requests || 0) + (tableUsage.requests || 0);

      if (tier === 'free') {
        if (totalPremiumRequests >= 1) return { allowed: false, error: "Vous avez utilisé votre OCR gratuit du jour. Passez à Pro pour continuer." };
        if (incomingPages > 1) return { allowed: false, error: "Le mode gratuit limité permet de traiter 1 page par jour. Passez à Pro pour traiter plus de documents." };
      } else {
        if (incomingPages > 5) return { allowed: false, error: "La limite est de 5 pages maximum par fichier." };
      }

      if (action === 'handwriting') {
        if (tier === 'trial') {
          if (hwUsage.requests >= 2) return { allowed: false, error: "Limite journalière d'essai atteinte : 2 requêtes maximum/jour." };
          if (totalPremiumPages + incomingPages > 15) return { allowed: false, error: "Limite journalière d'essai atteinte : 15 pages maximum/jour." };
        } else if (tier === 'pro') {
          if (hwUsage.requests >= 7) return { allowed: false, error: "Limite journalière atteinte : 7 requêtes/jour pour les documents manuscrits." };
          if (hwUsage.pages + incomingPages > 35) return { allowed: false, error: "Limite de pages quotidienne dépassée : 35 pages/jour maximum." };
        } else if (tier === 'plus') {
          if (hwUsage.requests >= 12) return { allowed: false, error: "Limite journalière atteinte : 12 requêtes/jour pour les documents manuscrits." };
          if (hwUsage.pages + incomingPages > 60) return { allowed: false, error: "Limite de pages quotidienne dépassée : 60 pages/jour maximum." };
        }
        usage.handwriting_mode_usage = hwUsage;
        usage.table_mode_usage = tableUsage;
      }

      if (action === 'table') {
        if (tier === 'trial') {
          if (tableUsage.requests >= 1) return { allowed: false, error: "Limite journalière d'essai atteinte : 1 requête maximum/jour." };
          if (totalPremiumPages + incomingPages > 15) return { allowed: false, error: "Limite journalière d'essai atteinte : 15 pages maximum/jour." };
        } else if (tier === 'pro') {
          if (tableUsage.requests >= 3) return { allowed: false, error: "Limite journalière atteinte : 3 requêtes/jour pour les tableaux." };
          if (tableUsage.pages + incomingPages > 15) return { allowed: false, error: "Limite de pages quotidienne dépassée : 15 pages/jour maximum." };
        } else if (tier === 'plus') {
          if (tableUsage.requests >= 6) return { allowed: false, error: "Limite journalière atteinte : 6 requêtes/jour pour les tableaux." };
          if (tableUsage.pages + incomingPages > 30) return { allowed: false, error: "Limite de pages quotidienne dépassée : 30 pages/jour maximum." };
        }
        usage.handwriting_mode_usage = hwUsage;
        usage.table_mode_usage = tableUsage;
      }
    }

    // IF ALLOWED, INCREMENT ATOMICALLY
    if (action === 'ocr') {
      usage.ocrCount = (usage.ocrCount || 0) + 1;
      usage.ocrPagesCount = (usage.ocrPagesCount || 0) + incomingPages;
    } else if (action === 'doc') {
      usage.docCount = (usage.docCount || 0) + 1;
      usage.docPagesCount = (usage.docPagesCount || 0) + incomingPages;
    } else if (action === 'chat') {
      usage.chatCount = (usage.chatCount || 0) + 1;
    } else if (action === 'handwriting') {
      usage.handwriting_mode_usage.requests += 1;
      usage.handwriting_mode_usage.pages += incomingPages;
      usage.handwriting_mode_usage.date = today;
    } else if (action === 'table') {
      usage.table_mode_usage.requests += 1;
      usage.table_mode_usage.pages += incomingPages;
      usage.table_mode_usage.date = today;
    }

    transaction.update(profileRef, { daily_usage: usage });
    console.log(`[Usage Reserved] User: ${uid}, Action: ${action}, Pages: ${incomingPages}`);
    return { allowed: true, usage };
  });
}

/**
 * Atomically rolls back user usage in case of failed API calls or empty results.
 */
export async function rollbackBackendUsage(
  uid: string,
  action: 'ocr' | 'doc' | 'handwriting' | 'table' | 'chat',
  incomingPages: number = 1
) {
  if (!dbAdmin) return;
  const today = new Date().toISOString().split('T')[0];

  try {
    await dbAdmin.runTransaction(async (transaction) => {
      const profileRef = dbAdmin!.collection("profiles").doc(uid);
      const profileSnap = await transaction.get(profileRef);
      
      if (!profileSnap.exists) return;

      const profile = profileSnap.data()!;
      let usage = profile.daily_usage;
      
      // If no usage tracking exists or the day flipped over, do not rollback
      if (!usage || usage.date !== today) return;

      let rolledBack = false;

      if (action === 'ocr' && usage.ocrCount > 0) {
        usage.ocrCount = Math.max(0, usage.ocrCount - 1);
        usage.ocrPagesCount = Math.max(0, (usage.ocrPagesCount || 0) - incomingPages);
        rolledBack = true;
      } else if (action === 'doc' && usage.docCount > 0) {
        usage.docCount = Math.max(0, usage.docCount - 1);
        usage.docPagesCount = Math.max(0, (usage.docPagesCount || 0) - incomingPages);
        rolledBack = true;
      } else if (action === 'chat' && usage.chatCount > 0) {
        usage.chatCount = Math.max(0, usage.chatCount - 1);
        rolledBack = true;
      } else if (action === 'handwriting' && usage.handwriting_mode_usage?.requests > 0) {
        usage.handwriting_mode_usage.requests = Math.max(0, usage.handwriting_mode_usage.requests - 1);
        usage.handwriting_mode_usage.pages = Math.max(0, usage.handwriting_mode_usage.pages - incomingPages);
        rolledBack = true;
      } else if (action === 'table' && usage.table_mode_usage?.requests > 0) {
        usage.table_mode_usage.requests = Math.max(0, usage.table_mode_usage.requests - 1);
        usage.table_mode_usage.pages = Math.max(0, usage.table_mode_usage.pages - incomingPages);
        rolledBack = true;
      }

      if (rolledBack) {
        transaction.update(profileRef, { daily_usage: usage });
        console.log(`[Usage Rollback Applied] User: ${uid}, Action: ${action}, Pages: ${incomingPages}`);
      } else {
        console.log(`[Usage Rollback Skipped] User: ${uid}, Action: ${action} - no valid usage to rollback.`);
      }
    });
  } catch (error) {
    console.error(`[Usage Rollback Failed] User: ${uid}, Action: ${action}`, error);
  }
}

/**
 * Lightweight helper to estimate or extract PDF page counts from its binary buffer using pdf-lib.
 */
export async function getPageCountFromBuffer(buffer: Buffer, mimeType: string): Promise<number> {
  if (mimeType === "application/pdf") {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      return pdfDoc.getPageCount();
    } catch (e) {
      console.warn("Failed to extract PDF page count:", e);
    }
  }
  return 1;
}
