import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    console.warn("[EMAIL] SMTP non configuré — emails désactivés");
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

function baseTemplate(title: string, content: string) {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:Inter,Arial,sans-serif;background:#07091a;color:#f0eeff;margin:0;padding:40px 20px">
  <div style="max-width:560px;margin:0 auto;background:#0d1033;border:1px solid rgba(124,58,237,0.3);border-radius:16px;padding:32px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:24px;font-weight:800;color:#a855f7">EVENTIA</span>
      <div style="font-size:12px;color:#c4b5fd">by Nahid — Oran, Algérie</div>
    </div>
    <h1 style="color:#a855f7;font-size:22px;margin:0 0 16px">${title}</h1>
    ${content}
    <hr style="border:none;border-top:1px solid rgba(124,58,237,0.2);margin:24px 0">
    <p style="color:#8b8bae;font-size:12px;text-align:center">© EVENTIA — Plateforme de billetterie à Oran</p>
  </div>
</body></html>`;
}

async function send(to: string, subject: string, html: string) {
  const transport = getTransporter();
  if (!transport) return false;
  await transport.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  return true;
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  return send(to, "Bienvenue sur EVENTIA 🎫", baseTemplate(
    "Bienvenue !",
    `<p style="color:#8b8bae">Bonjour <strong style="color:#f0eeff">${firstName}</strong>,</p>
     <p style="color:#8b8bae">Votre compte EVENTIA a été créé avec succès. Découvrez les meilleurs événements à Oran !</p>
     <a href="${env.FRONTEND_URL}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;text-decoration:none;border-radius:12px;font-weight:600">Explorer les événements</a>`
  ));
}

export async function sendLoginNotificationEmail(
  to: string,
  firstName: string,
  meta: { ip: string; browser: string; date: string; time: string }
) {
  return send(to, "Nouvelle connexion à votre compte EVENTIA", baseTemplate(
    "Connexion détectée",
    `<p style="color:#8b8bae">Bonjour <strong style="color:#f0eeff">${firstName}</strong>,</p>
     <p style="color:#8b8bae">Une connexion à votre compte a été effectuée :</p>
     <table style="width:100%;margin:16px 0;color:#8b8bae;font-size:14px">
       <tr><td style="padding:8px 0;color:#c4b5fd">📅 Date</td><td>${meta.date}</td></tr>
       <tr><td style="padding:8px 0;color:#c4b5fd">🕐 Heure</td><td>${meta.time}</td></tr>
       <tr><td style="padding:8px 0;color:#c4b5fd">🌐 Adresse IP</td><td>${meta.ip}</td></tr>
       <tr><td style="padding:8px 0;color:#c4b5fd">💻 Navigateur</td><td>${meta.browser}</td></tr>
     </table>
     <p style="color:#ef4444;font-size:13px">Si ce n'était pas vous, changez votre mot de passe immédiatement.</p>`
  ));
}

export async function sendPurchaseEmail(to: string, firstName: string, eventTitle: string, quantity: number, total: number) {
  return send(to, `Confirmation d'achat — ${eventTitle}`, baseTemplate(
    "Achat confirmé ✅",
    `<p style="color:#8b8bae">Bonjour <strong style="color:#f0eeff">${firstName}</strong>,</p>
     <p style="color:#8b8bae">Votre achat pour <strong style="color:#a855f7">${eventTitle}</strong> est confirmé.</p>
     <div style="background:rgba(124,58,237,0.15);border-radius:12px;padding:16px;margin:16px 0">
       <p style="margin:0;color:#f0eeff">🎫 ${quantity} billet(s)</p>
       <p style="margin:8px 0 0;color:#a855f7;font-size:20px;font-weight:700">${total.toLocaleString("fr-DZ")} DA</p>
     </div>
     <p style="color:#8b8bae">Vos billets avec QR code sont disponibles dans votre espace personnel.</p>`
  ));
}

export async function sendCancellationEmail(to: string, firstName: string, eventTitle: string) {
  return send(to, `Annulation — ${eventTitle}`, baseTemplate(
    "Réservation annulée",
    `<p style="color:#8b8bae">Bonjour ${firstName},</p>
     <p style="color:#8b8bae">Votre réservation pour <strong>${eventTitle}</strong> a été annulée.</p>`
  ));
}

export async function sendEventCreatedEmail(to: string, firstName: string, eventTitle: string) {
  return send(to, `Événement publié — ${eventTitle}`, baseTemplate(
    "Événement créé",
    `<p style="color:#8b8bae">Bonjour ${firstName},</p>
     <p style="color:#8b8bae">L'événement <strong style="color:#a855f7">${eventTitle}</strong> a été enregistré sur EVENTIA.</p>`
  ));
}
