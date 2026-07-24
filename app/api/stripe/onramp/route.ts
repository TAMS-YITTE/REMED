import { NextResponse } from 'next/server';

// Cryptos que Stripe onramp sert réellement aux acheteurs France/EU en EUR
// (vérifié dans la doc Stripe le 2026-07-24). AVAX, LINK, POL, SHIB et UNI ne
// sont PAS servis par Stripe en zone EU : ils restent chez MoonPay uniquement.
// USDC n'est livrable en EU que sur Ethereum ou Stellar — on utilise Ethereum,
// c'est-à-dire l'adresse du wallet ETH de l'utilisateur.
const STRIPE_ONRAMP: Record<string, { currency: string; network: string }> = {
  btc:  { currency: 'btc',  network: 'bitcoin' },
  eth:  { currency: 'eth',  network: 'ethereum' },
  sol:  { currency: 'sol',  network: 'solana' },
  usdc: { currency: 'usdc', network: 'ethereum' },
};

const MIN_AMOUNT_EUR = 30;

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('Stripe onramp: STRIPE_SECRET_KEY non configurée.');
    return NextResponse.json({ error: 'Paiement Stripe indisponible.' }, { status: 500 });
  }

  let body: { crypto?: string; amount?: string; walletAddress?: string; privyId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const crypto = (body.crypto || '').toLowerCase();
  const mapping = STRIPE_ONRAMP[crypto];
  if (!mapping) {
    // On ne laisse jamais partir une crypto que Stripe ne servira pas en EU :
    // l'utilisateur se retrouverait sinon bloqué sur la page Stripe.
    return NextResponse.json(
      { error: `Le paiement Stripe n'est pas disponible pour ${crypto.toUpperCase()}.` },
      { status: 400 }
    );
  }

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress) {
    return NextResponse.json({ error: 'Adresse de portefeuille manquante.' }, { status: 400 });
  }

  const amount = Math.max(Number(body.amount) || MIN_AMOUNT_EUR, MIN_AMOUNT_EUR);

  // customer_ip_address aide Stripe à filtrer les régions non supportées et la
  // fraude. On prend la première IP de la chaîne x-forwarded-for (celle du client).
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const customerIp = forwardedFor.split(',')[0].trim();

  const params = new URLSearchParams();
  params.set('source_currency', 'eur');
  params.set('source_amount', amount.toFixed(2));
  params.set('destination_currency', mapping.currency);
  params.set('destination_network', mapping.network);
  params.set(`wallet_addresses[${mapping.network}]`, walletAddress);
  params.set('lock_wallet_address', 'true');
  if (customerIp) params.set('customer_ip_address', customerIp);
  if (body.privyId) params.set('metadata[privy_id]', body.privyId);
  params.set('metadata[crypto]', crypto);

  try {
    const res = await fetch('https://api.stripe.com/v1/crypto/onramp_sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await res.json();

    if (!res.ok || !data?.redirect_url) {
      // Stripe renvoie 400 notamment quand la région n'est pas supportée.
      console.error('Stripe onramp: échec création de session', data?.error || data);
      const message =
        data?.error?.message ||
        "Impossible d'initialiser le paiement Stripe pour cette crypto ou cette région.";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    return NextResponse.json({ url: data.redirect_url });
  } catch (err) {
    console.error('Stripe onramp: erreur réseau', err);
    return NextResponse.json({ error: 'Erreur réseau lors du paiement Stripe.' }, { status: 502 });
  }
}
