import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
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
