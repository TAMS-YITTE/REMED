import Stripe from 'stripe';

// Client Stripe côté serveur, utilisé uniquement pour vérifier la signature
// des webhooks (`stripe.webhooks.constructEvent`). La création des sessions
// onramp, elle, passe par un appel direct à l'API REST (voir
// app/api/stripe/onramp/route.ts) : l'onramp crypto est en beta et son
// exposition dans le SDK varie d'une version à l'autre, alors que l'endpoint
// REST /v1/crypto/onramp_sessions est stable et documenté.
//
// On n'instancie le client que si la clé existe, pour ne pas faire échouer le
// build quand STRIPE_SECRET_KEY n'est pas encore configurée dans un env donné.
const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey ? new Stripe(secretKey) : null;
