import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbAdmin, authAdmin } from "@/lib/firebase-admin";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("signature");
    if (!signature) {
      console.warn("Webhook received without a signature header");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const bodyBuffer = Buffer.from(await req.arrayBuffer());
    const rawBody = bodyBuffer.toString("utf8");
    const rawSecret = process.env.CHARGILY_WEBHOOK_SECRET || process.env.CHARGILY_SECRET_KEY;
    const webhookSecret = rawSecret ? rawSecret.trim() : "";

    if (!webhookSecret) {
      console.error("Neither CHARGILY_WEBHOOK_SECRET nor CHARGILY_SECRET_KEY is configured");
      return NextResponse.json(
        { error: "Webhook secret configuration missing" },
        { status: 500 }
      );
    }

    // Verify signature using raw buffer bytes for byte-exact HMAC calculation
    const computedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyBuffer)
      .digest("hex");

    let isSignatureValid = false;
    try {
      const signatureBuffer = Buffer.from(signature, "hex");
      const computedBuffer = Buffer.from(computedSignature, "hex");
      if (signatureBuffer.length === computedBuffer.length) {
        isSignatureValid = crypto.timingSafeEqual(signatureBuffer, computedBuffer);
      }
    } catch (err) {
      console.error("Error comparing signature buffers:", err);
      isSignatureValid = false;
    }

    if (!isSignatureValid) {
      console.warn("Invalid webhook signature received");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    console.log(`Verified Chargily webhook event received: ${event.type}`);

    // We only process checkout.paid events where the status is paid
    if (event.type === "checkout.paid") {
      const checkout = event.data;
      
      if (checkout && checkout.status === "paid") {
        const metadata = checkout.metadata || {};
        const userId = metadata.user_id;
        const plan = metadata.plan;

        if (!userId || !plan) {
          console.warn("Received checkout.paid event but metadata lacks user_id or plan", metadata);
          return NextResponse.json(
            { error: "Missing metadata fields in checkout payload" },
            { status: 400 }
          );
        }

        if (plan !== "pro" && plan !== "plus") {
          console.warn(`Received checkout.paid event with invalid plan: ${plan}`);
          return NextResponse.json(
            { error: "Invalid plan in metadata" },
            { status: 400 }
          );
        }

        if (!dbAdmin) {
          console.error("Firebase Admin SDK is not initialized. Cannot update user document.");
          return NextResponse.json(
            { error: "Database connection error" },
            { status: 500 }
          );
        }

        // Calculate limits and expiration dates
        const dailyOcrLimit = plan === "pro" ? 30 : 60;
        const dailyAiDocumentLimit = plan === "pro" ? 1 : 5;

        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days subscription

        const userDocRef = dbAdmin.collection("profiles").doc(userId);

        // Update exact fields user requested, plus compatibility fields
        const updateData = {
          // Fields explicitly requested by the user
          plan: plan,
          subscriptionStatus: "active",
          subscriptionStartedAt: now,
          subscriptionExpiresAt: expiresAt,
          dailyOcrLimit: dailyOcrLimit,
          dailyAiDocumentLimit: dailyAiDocumentLimit,

          // Legacy / UI compatibility fields
          subscription_tier: plan,
          subscription_expires_at: expiresAt.toISOString(),
          status: "active"
        };

        await userDocRef.update(updateData);
        console.log(`Successfully updated Firestore profile for user ${userId} to plan ${plan}`);

        // 1. Create a payment history record
        const paymentData = {
          userId,
          plan,
          amount: checkout.amount,
          currency: "DZD",
          paymentReference: checkout.id,
          status: "paid",
          paidAt: now,
          subscriptionStart: now,
          subscriptionEnd: expiresAt,
          createdAt: now,
        };

        await dbAdmin.collection("payments").add(paymentData);
        console.log(`Created payment history record for checkout ${checkout.id}`);

        // 2. Send the confirmation email
        const apiKey = process.env.RESEND_API_KEY?.trim();
        if (apiKey && authAdmin) {
          try {
            const userRecord = await authAdmin.getUser(userId);
            if (userRecord.email) {
              const resend = new Resend(apiKey);
              const planName = plan === "pro" ? "Pro" : "Plus";
              const formattedDate = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(now);
              const formattedEnd = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long", year: "numeric" }).format(expiresAt);

              const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reçu de paiement - LegTrans DZ</title>
</head>
<body style="background-color: #faf8f3; font-family: Arial, sans-serif; margin: 0; padding: 40px 10px; color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e5e3dc;">
    <tr>
      <td style="background-color: #0d6e4e; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 2px;">LegTrans DZ</h1>
        <p style="color: #a7f3d0; margin: 8px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Confirmation de paiement</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 20px;">Bonjour,</h2>
        <p style="color: #595959; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
          Nous vous remercions pour votre confiance. Votre paiement a été traité avec succès et votre abonnement est maintenant actif.
        </p>

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin: 25px 0; padding: 20px;">
          <tr>
            <td>
              <h3 style="margin: 0 0 15px 0; font-size: 13px; color: #065f46; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Détails de la facturation</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #047857; line-height: 1.8;">
                <tr>
                  <td width="40%"><strong>Abonnement :</strong></td>
                  <td>LegTrans ${planName}</td>
                </tr>
                <tr>
                  <td><strong>Montant payé :</strong></td>
                  <td>${checkout.amount} DZD</td>
                </tr>
                <tr>
                  <td><strong>Date du paiement :</strong></td>
                  <td>${formattedDate}</td>
                </tr>
                <tr>
                  <td><strong>Référence :</strong></td>
                  <td style="font-family: monospace; font-size: 12px; color: #065f46;">${checkout.id}</td>
                </tr>
                <tr>
                  <td><strong>Période couverte :</strong></td>
                  <td>Jusqu'au ${formattedEnd}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.6; border-top: 1px solid #f0ede8; padding-top: 25px; margin-top: 30px;">
          Vous pouvez retrouver l'historique de vos paiements et le détail de votre abonnement directement depuis la page "Facturation" de votre espace personnel.
        </p>
        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.6; margin-top: 15px;">
          Cordialement,<br>
          <strong>L'équipe LegTrans DZ</strong><br>
          <a href="mailto:contact@legtransdz.com" style="color: #0d6e4e; text-decoration: none;">contact@legtransdz.com</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #fafaf9; padding: 20px; text-align: center; border-top: 1px solid #e5e3dc;">
        <p style="margin: 0; color: #a8a8a8; font-size: 11px;">
          © 2026 LegTrans DZ. Tous droits réservés.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
              `;

              await resend.emails.send({
                from: 'LegTrans DZ <contact@legtransdz.com>',
                to: [userRecord.email],
                subject: 'Votre reçu de paiement LegTrans DZ',
                html: emailHtml,
              });
              console.log(`Receipt email sent to ${userRecord.email}`);
            }
          } catch (err) {
            console.error("Error sending receipt email or fetching user:", err);
          }
        } else {
          console.log("Skipping receipt email: Resend API key or Auth Admin missing.");
        }
      } else {
        console.log(`Skipping event checkout status: ${checkout?.status}`);
      }
    }

    // Always respond with 200 OK to confirm receipt of webhook
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error processing Chargily webhook:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
