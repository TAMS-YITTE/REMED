import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Verifie la signature MoonPay (header Moonpay-Signature-V2 : "t=<timestamp>,s=<signature>").
// Algorithme confirme via la doc officielle dev.moonpay.com/reference/reference-webhooks-signature :
// HMAC-SHA256(webhookSecret, `${timestamp}.${rawBody}`), encode en hexadecimal.
function verifyMoonPaySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [key, value] = p.split('=');
      return [key, value];
    })
  );

  const timestamp = parts['t'];
  const signature = parts['s'];
  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

  const signatureBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSignature, 'hex');

  if (signatureBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}

export async function POST(request: Request) {
  try {
    // Le corps brut (avant parsing JSON) est indispensable pour verifier la
    // signature - toute transformation (whitespace, ordre des champs) la casse.
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('moonpay-signature-v2');
    const webhookSecret = process.env.MOONPAY_WEBHOOK_KEY;

    if (!webhookSecret) {
      console.error('MoonPay Webhook: MOONPAY_WEBHOOK_KEY non configuree.');
      return NextResponse.json({ status: 'error', message: 'Webhook not configured' }, { status: 500 });
    }

    if (!signatureHeader || !verifyMoonPaySignature(rawBody, signatureHeader, webhookSecret)) {
      console.error('MoonPay Webhook: signature invalide ou manquante.');
      return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // MoonPay Webhook Types: transaction_created, transaction_updated
    if (payload.type === 'transaction_updated' && payload.data.status === 'completed') {
      const orderData = payload.data;

      const fiatAmount = orderData.baseCurrencyAmount;
      const fiatCurrency = orderData.baseCurrency?.code?.toUpperCase() || 'EUR';
      const cryptoAmount = orderData.quoteCurrencyAmount;
      const cryptoCurrency = orderData.currency?.code?.toUpperCase() || 'ETH';
      const walletAddress = orderData.walletAddress;
      const externalCustomerId = orderData.externalCustomerId; // Optionnel : à passer au widget si on veut matcher

      let userId = null;
      if (externalCustomerId) {
        const { data: user } = await supabase.from('users').select('id').eq('privy_id', externalCustomerId).single();
        if (user) userId = user.id;
      }

      await supabase.from('transactions').insert([
        {
          user_id: userId,
          provider: 'moonpay',
          fiat_amount: fiatAmount,
          fiat_currency: fiatCurrency,
          crypto_amount: cryptoAmount,
          crypto_currency: cryptoCurrency,
          wallet_address: walletAddress,
          status: 'completed',
          provider_reference_id: orderData.id,
        }
      ]);
    }

    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('MoonPay Webhook Error:', error);
    return NextResponse.json({ status: 'error', message: 'Webhook processing failed' }, { status: 500 });
  }
}
