import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remedly.fr';

// Crée une session Stripe Checkout en mode abonnement pour Remedly Pro.
export async function POST(request: Request) {
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!stripe || !priceId) {
    console.error('Checkout: STRIPE_SECRET_KEY ou STRIPE_PRICE_ID non configurée.');
    return NextResponse.json({ error: 'Abonnement indisponible.' }, { status: 500 });
  }

  let body: { privyId?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const privyId = body.privyId?.trim();
  if (!privyId) {
    return NextResponse.json({ error: 'Utilisateur non authentifié.' }, { status: 401 });
  }

  try {
    // On garantit l'existence d'une ligne users pour pouvoir rattacher
    // l'abonnement dès le retour du webhook (le webhook mappe via privy_id).
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('privy_id', privyId)
      .maybeSingle();

    if (!existingUser) {
      await supabase.from('users').insert([{ privy_id: privyId }]);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      // client_reference_id + metadata : deux moyens de retrouver l'utilisateur
      // côté webhook, l'un sur la session, l'autre propagé sur l'abonnement.
      client_reference_id: privyId,
      metadata: { privy_id: privyId },
      subscription_data: { metadata: { privy_id: privyId } },
      customer_email: body.email || undefined,
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/pro?success=1`,
      cancel_url: `${SITE_URL}/pro?canceled=1`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Impossible d'initialiser le paiement." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout: échec création de session', err);
    return NextResponse.json({ error: "Impossible d'initialiser l'abonnement." }, { status: 502 });
  }
}
