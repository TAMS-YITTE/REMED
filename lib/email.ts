import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "ReMed <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "contact@medlease.fr";

export async function sendEmail(opts: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("⚠️ RESEND_API_KEY manquant — email non envoyé:", opts.subject);
    return { skipped: true };
  }
  try {
    const resend = new Resend(key);
    return await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo });
  } catch (err) {
    console.error("Email error:", err);
    return { error: err };
  }
}

export { ADMIN_EMAIL };

const wrap = (body: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,Arial,sans-serif;background:#f8fafc;padding:40px 20px;color:#0f172a;margin:0">
  <div style="max-width:560px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
    <div style="background:#0f2c4d;color:white;padding:24px 32px"><div style="font-size:20px;font-weight:bold">Re<span style="color:#67e8f9">Med</span></div></div>
    <div style="padding:32px">${body}</div>
    <div style="padding:16px 32px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8;text-align:center">ReMed · <a href="https://remedly.fr" style="color:#0891b2">remedly.fr</a></div>
  </div>
</body></html>`;

const eur = (n: number) => Math.round(n).toLocaleString("fr-FR") + " €";

export const templates = {
  contactVendeur: (data: { fromNom: string; fromEmail: string; texte: string; titre: string; prix: number; annonceId: string }) =>
    wrap(`
      <h1 style="font-size:20px;margin:0 0 16px">Nouveau message pour votre annonce</h1>
      <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:16px">
        <p style="font-size:13px;color:#64748b;margin:0 0 4px">Annonce concernée</p>
        <p style="margin:0;font-weight:600">${data.titre}</p>
        <p style="margin:4px 0 0;color:#0891b2;font-weight:bold">${eur(data.prix)}</p>
      </div>
      <div style="border-left:3px solid #0891b2;padding-left:16px;margin:16px 0">
        <p style="font-size:13px;color:#64748b;margin:0 0 4px">De : <strong style="color:#0f172a">${data.fromNom}</strong></p>
        <p style="font-size:13px;color:#64748b;margin:0 0 12px">Email : <a href="mailto:${data.fromEmail}" style="color:#0891b2">${data.fromEmail}</a></p>
        <p style="white-space:pre-wrap;color:#0f172a;line-height:1.5">${data.texte}</p>
      </div>
      <p style="text-align:center;margin-top:24px">
        <a href="mailto:${data.fromEmail}?subject=Re: ${encodeURIComponent(data.titre)}" style="display:inline-block;background:#0891b2;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600">Répondre directement →</a>
      </p>
      <p style="font-size:12px;color:#94a3b8;margin-top:24px;text-align:center">Répondez en utilisant simplement le bouton ci-dessus, le message ira directement à l'acheteur.</p>
    `),

  bienvenueVendeur: (data: { prenom: string }) =>
    wrap(`
      <h1 style="font-size:22px;margin:0 0 8px">Bienvenue ${data.prenom} 👋</h1>
      <p style="color:#64748b;margin:0 0 24px">Votre compte ReMed est créé. Vous pouvez maintenant déposer une annonce pour vendre votre matériel.</p>
      <a href="https://remedly.fr/deposer" style="display:inline-block;background:#0891b2;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600">Déposer une annonce →</a>
    `),
};
