import { NextResponse } from "next/server";
import { Resend } from "resend";
import { authAdmin } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY || "re_123");
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    if (!authAdmin) {
      throw new Error("Firebase Admin non initialisé");
    }

    // 1. Generate the reset link using Firebase Admin
    const firebaseResetLink = await authAdmin.generatePasswordResetLink(email);

    // 2. Extract the oobCode from Firebase link and build our custom beautiful page URL
    const firebaseUrl = new URL(firebaseResetLink);
    const oobCode = firebaseUrl.searchParams.get("oobCode");
    const resetLink = `https://legtransdz.com/auth/reset-password?oobCode=${oobCode}`;

    // 2. The beautiful HTML Email Template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Réinitialisation de votre mot de passe</title>
</head>
<body style="background-color: #faf8f3; font-family: Arial, sans-serif; margin: 0; padding: 40px 10px; color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e5e3dc;">
    <tr>
      <td style="background-color: #0d6e4e; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 2px;">LegTrans DZ</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 20px;">Bonjour,</h2>
        <p style="color: #595959; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          Nous avons reçu une demande de réinitialisation de mot de passe pour le compte associé à l'adresse <strong>${email}</strong>.
        </p>
        <p style="color: #595959; font-size: 16px; line-height: 1.6; margin-bottom: 35px;">
          Pour créer un nouveau mot de passe et sécuriser votre compte, veuillez cliquer sur le bouton ci-dessous :
        </p>
        
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="${resetLink}" style="display: inline-block; background-color: #0d6e4e; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Réinitialiser mon mot de passe</a>
            </td>
          </tr>
        </table>
        
        <p style="color: #8a8a8a; font-size: 14px; line-height: 1.6; margin-top: 40px; border-top: 1px solid #f0ede8; padding-top: 25px;">
          Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel restera inchangé.
        </p>
        <p style="color: #8a8a8a; font-size: 14px; line-height: 1.6; margin-top: 10px;">
          Cordialement,<br>
          <strong>L'équipe LegTrans DZ</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #fafaf9; padding: 20px; text-align: center; border-top: 1px solid #e5e3dc;">
        <p style="margin: 0; color: #a8a8a8; font-size: 12px; line-height: 1.5;">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${resetLink}" style="color: #0d6e4e; word-break: break-all; margin-top: 8px; display: inline-block;">${resetLink}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // 3. Send email via Resend
    const data = await resend.emails.send({
      from: 'LegTrans DZ <contact@legtransdz.com>',
      to: email,
      subject: 'Réinitialisation de votre mot de passe - LegTrans DZ',
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error sending reset password email:", error);
    // Return success to avoid email enumeration attacks
    return NextResponse.json({ success: true });
  }
}
