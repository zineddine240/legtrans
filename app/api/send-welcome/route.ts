import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      console.error('RESEND_API_KEY is not defined in env variables');
      return NextResponse.json({ error: 'Service temporary unavailable' }, { status: 500 });
    }

    const resend = new Resend(apiKey);
    const { email, displayName, uid } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Direct activation link
    const activationLink = uid 
      ? `https://legtransdz.com/api/activate-account?uid=${uid}`
      : `https://legtransdz.com/auth/login`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Activez votre compte - LegTrans DZ</title>
</head>
<body style="background-color: #faf8f3; font-family: Arial, sans-serif; margin: 0; padding: 40px 10px; color: #1a1a1a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e5e3dc;">
    <tr>
      <td style="background-color: #0d6e4e; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 2px;">LegTrans DZ</h1>
        <p style="color: #a7f3d0; margin: 8px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Plateforme de Traduction</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin-top: 0; color: #1a1a1a; font-size: 20px;">Bonjour ${displayName || 'Cher Traducteur'},</h2>
        <p style="color: #595959; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
          Nous avons le plaisir de vous accueillir sur <strong>LegTrans DZ</strong>. Votre inscription a été enregistrée avec succès.
        </p>
        <p style="color: #595959; font-size: 15px; line-height: 1.6; margin-bottom: 35px;">
          Pour activer définitivement votre espace de travail professionnel et valider vos accès sécurisés, veuillez cliquer sur le bouton de confirmation ci-dessous :
        </p>
        
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center">
              <a href="${activationLink}" style="display: inline-block; background-color: #0d6e4e; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 15px; text-transform: uppercase; letter-spacing: 1px;">Confirmer et Activer mon Compte</a>
            </td>
          </tr>
        </table>

        <!-- Summary panel -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; margin: 35px 0; padding: 20px;">
          <tr>
            <td>
              <h3 style="margin: 0 0 10px 0; font-size: 13px; color: #065f46; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Récapitulatif de votre espace</h3>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #047857; line-height: 1.6;">
                <li><strong>Identifiant :</strong> ${email}</li>
                <li><strong>Statut initial :</strong> Période d'essai active (7 jours gratuits inclus)</li>
                <li><strong>Fonctionnalités :</strong> Traduction Juridique Assistée par IA &amp; Reconnaissance de Tableaux OCR</li>
              </ul>
            </td>
          </tr>
        </table>
        
        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.6; border-top: 1px solid #f0ede8; padding-top: 25px; margin-top: 30px;">
          * <strong>Note importante :</strong> Pour faire apparaître le badge vert officiel <strong>"Traducteur Assermenté"</strong> sur votre profil public, notre équipe administrative procédera à la vérification de vos justificatifs d'agrément dans les plus brefs délais. Vous pouvez suivre l'état de votre dossier directement depuis votre espace personnel.
        </p>
        <p style="color: #8a8a8a; font-size: 13px; line-height: 1.6; margin-top: 15px;">
          Cordialement,<br>
          <strong>L'équipe LegTrans DZ</strong>
        </p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #fafaf9; padding: 20px; text-align: center; border-top: 1px solid #e5e3dc;">
        <p style="margin: 0; color: #a8a8a8; font-size: 12px; line-height: 1.5;">
          Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
          <a href="${activationLink}" style="color: #0d6e4e; word-break: break-all; margin-top: 8px; display: inline-block;">${activationLink}</a>
        </p>
        <p style="margin: 12px 0 0 0; color: #a8a8a8; font-size: 11px;">
          © 2026 LegTrans DZ. Tous droits réservés.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'LegTrans DZ <contact@legtransdz.com>',
      to: [email],
      subject: 'Activez votre compte LegTrans DZ - Bienvenue !',
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Welcome Email Route Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
