import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function resolveUserId(privyId?: string | null): Promise<string | null> {
  if (!privyId) return null;
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('privy_id', privyId)
    .maybeSingle();
  return user?.id ?? null;
}

// --- Onramp crypto : enregistre un achat abouti dans `transactions` ---------
async function handleOnrampCompleted(session: any): Promise<{ ok: boolean }> {
  const details = session.transaction_details || {};
  const userId = await resolveUserId(session.metadata?.privy_id);

  // Idempotence : Stripe peut renvoyer le même event plusieurs fois.
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('provider_reference_id', session.id)
    .maybeSingle();

  if (existing) return { ok: true };

  const { error } = await supabase.from('transactions').insert([
    {
      user_id: userId,
      provider: 'stripe',
      fiat_amount: details.source_amount,
      fiat_currency: (details.source_currency || 'eur').toUpperCase(),
      crypto_amount: details.destination_amount,
      crypto_currency: (details.destination_currency || '').toUpperCase(),
      wallet_address: details.wallet_address,
      status: 'completed',
      provider_reference_id: session.id,
    },
  ]);

  if (error) {
    console.error('Stripe webhook: échec insertion transaction', error);
    return { ok: false };
  }
  return { ok: true };
}

// --- Abonnement Remedly Pro : reflète l'état Stripe dans `subscriptions` -----
async function upsertSubscription(sub: Stripe.Subscription): Promise<{ ok: boolean }> {
  const privyId = (sub.metadata?.privy_id as string) || null;
  const userId = await resolveUserId(privyId);

  // `current_period_end` peut être absent selon l'event : on récupère la valeur
  // de façon défensive (l'API la place au niveau de l'abonnement).
  const periodEnd = (sub as any).current_period_end
    ? new Date((sub as any).current_period_end * 1000).toISOString()
    : null;

  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      privy_id: privyId,
      stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  );

  if (error) {
    console.error('Stripe webhook: échec upsert subscription', error);
    return { ok: false };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    console.error('Stripe webhook: STRIPE_SECRET_KEY ou STRIPE_WEBHOOK_SECRET non configurée.');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Le corps brut (avant tout parsing) est indispensable pour vérifier la
  // signature — la moindre transformation la casse.
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Stripe webhook: signature invalide.', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // On renvoie 500 sur tout échec d'écriture pour forcer Stripe à rejouer
  // l'event, au lieu de le perdre en silence.
  const eventType: string = event.type;

  try {
    // Onramp crypto (type d'event pas encore dans l'union typée du SDK beta).
    if (eventType === 'crypto.onramp_session.updated') {
      const session = (event.data as any).object as any;
      if (session.status === 'fulfillment_complete') {
        const { ok } = await handleOnrampCompleted(session);
        if (!ok) return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    // Abonnement : nouvelle souscription confirmée au checkout.
    else if (eventType === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);
        // Le privy_id vit sur la souscription ; on le complète depuis la session
        // au cas où (client_reference_id).
        if (!sub.metadata?.privy_id && session.client_reference_id) {
          sub.metadata = { ...sub.metadata, privy_id: session.client_reference_id };
        }
        const { ok } = await upsertSubscription(sub);
        if (!ok) return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }
    }

    // Abonnement : renouvellement, changement d'état, résiliation.
    else if (eventType === 'customer.subscription.updated' || eventType === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const { ok } = await upsertSubscription(sub);
      if (!ok) return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (err) {
    console.error('Stripe webhook: erreur de traitement', err);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
