import { Resend } from 'resend';

// Client Resend côté serveur. Instancié seulement si la clé existe, pour ne
// pas casser le build quand RESEND_API_KEY n'est pas configurée.
const apiKey = process.env.RESEND_API_KEY;
export const resend = apiKey ? new Resend(apiKey) : null;

// Expéditeur : doit être un domaine vérifié dans Resend (ex. remedly.fr).
// Configurable via RESEND_FROM, avec un défaut raisonnable.
export const EMAIL_FROM = process.env.RESEND_FROM || 'Remedly <alertes@remedly.fr>';
