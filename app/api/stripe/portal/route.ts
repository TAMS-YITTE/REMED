import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.remedly.fr';

// Ouvre le portail de gestion Stripe (résiliation, changement de carte, factures)
// pour l'abonné. Le customer_id est celui enregistré par le webhook.
export async function POST(request: Request) {
  if (!stripe) {
    console.error('Portal: STRIPE_SECRET_KEY non configurée.');
    return NextResponse.json({ error: 'Gestion de l\'abonnement indisponible.' }, { status: 500 });
  }

  let body: { privyId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const privyId = body.privyId?.trim();
  if (!privyId) {
    return NextResponse.json({ error: 'Utilisateur non authentifié.' }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('privy_id', privyId)
    .not('stripe_customer_id', 'is', null)
    .order('current_period_end', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement trouvé.' }, { status: 404 });
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${SITE_URL}/pro`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Portal: échec création session', err);
    return NextResponse.json({ error: 'Impossible d\'ouvrir la gestion de l\'abonnement.' }, { status: 502 });
  }
}
