import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

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

  // On ne réagit qu'à la fin réelle de la livraison des cryptos.
  // L'onramp crypto est en beta : son type d'event n'est pas encore dans
  // l'union typée du SDK Stripe, d'où la comparaison via une string.
  const eventType: string = event.type;
  if (eventType === 'crypto.onramp_session.updated') {
    const session = (event.data as any).object as any;

    if (session.status === 'fulfillment_complete') {
      const details = session.transaction_details || {};
      const privyId = session.metadata?.privy_id;

      let userId: string | null = null;
      if (privyId) {
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('privy_id', privyId)
          .single();
        if (user) userId = user.id;
      }

      // Idempotence : Stripe peut renvoyer le même event plusieurs fois.
      // On n'insère pas deux fois la même session.
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('provider_reference_id', session.id)
        .maybeSingle();

      if (!existing) {
        const { error: insertError } = await supabase.from('transactions').insert([
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

        if (insertError) {
          // On NE renvoie PAS 200 en cas d'échec d'écriture : sinon Stripe
          // considère l'event livré et ne le rejoue jamais, et l'achat
          // disparaît silencieusement du suivi (déjà le défaut du webhook
          // MoonPay). Le 500 force Stripe à réessayer.
          console.error('Stripe webhook: échec insertion transaction', insertError);
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
