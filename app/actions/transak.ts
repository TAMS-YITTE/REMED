'use server';

import { headers } from 'next/headers';
import * as Sentry from '@sentry/nextjs';

const TRANSAK_API_KEY = process.env.NEXT_PUBLIC_TRANSAK_KEY || '';
const TRANSAK_API_SECRET = process.env.TRANSAK_API_SECRET || '';
const IS_STAGING =
  process.env.NEXT_PUBLIC_TRANSAK_ENVIRONMENT === 'STAGING' || TRANSAK_API_KEY.includes('STAGING');

const REFRESH_TOKEN_URL = IS_STAGING
  ? 'https://api-stg.transak.com/partners/api/v2/refresh-token'
  : 'https://api.transak.com/partners/api/v2/refresh-token';

const SESSION_URL = IS_STAGING
  ? 'https://api-gateway-stg.transak.com/api/v2/auth/session'
  : 'https://api-gateway.transak.com/api/v2/auth/session';

interface CreateWidgetUrlParams {
  walletAddress: string;
  crypto: string;
}

// Migration obligatoire Transak (juillet 2026) : l'ancienne methode (construire
// l'URL du widget cote client avec l'apiKey en clair) n'est plus supportee.
// Il faut maintenant : 1) recuperer un Partner Access Token via l'API Secret
// (jamais expose cote client), 2) appeler leur API "Create Widget URL" avec ce
// token pour obtenir une widgetUrl a usage unique (valide 5 min).
export async function getTransakWidgetUrl({
  walletAddress,
  crypto,
}: CreateWidgetUrlParams): Promise<string | null> {
  if (!TRANSAK_API_KEY || !TRANSAK_API_SECRET) {
    return null;
  }

  try {
    // Etape 1 : Partner Access Token.
    // Headers et endpoint confirmes via la doc officielle Transak
    // (docs.transak.com/reference/refresh-access-token) : x-api-key ET
    // api-secret sont tous les deux requis en en-tete, apiKey est aussi
    // repete dans le corps de la requete.
    const refreshRes = await fetch(REFRESH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-secret': TRANSAK_API_SECRET,
        'x-api-key': TRANSAK_API_KEY,
      },
      body: JSON.stringify({ apiKey: TRANSAK_API_KEY }),
      cache: 'no-store',
    });

    if (!refreshRes.ok) {
      const errorBody = await refreshRes.text();
      console.error('Transak refresh-token failed:', refreshRes.status, errorBody);
      Sentry.captureException(new Error(`Transak refresh-token failed: ${refreshRes.status}`), {
        tags: { context: 'getTransakWidgetUrl' },
        extra: { errorBody },
      });
      return null;
    }

    const refreshData = await refreshRes.json();
    const accessToken: string | undefined = refreshData?.data?.accessToken || refreshData?.accessToken;

    if (!accessToken) {
      console.error('Transak refresh-token: no accessToken in response', refreshData);
      Sentry.captureException(new Error('Transak refresh-token: no accessToken in response'), {
        tags: { context: 'getTransakWidgetUrl' },
      });
      return null;
    }

    // Etape 2 : Create Widget URL (en-tetes confirmes via la doc Transak).
    const headersList = await headers();
    const userIp =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      '127.0.0.1';

    const sessionRes = await fetch(SESSION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access-token': accessToken,
        'x-api-key': TRANSAK_API_KEY,
        'x-user-ip': userIp,
      },
      body: JSON.stringify({
        widgetParams: {
          apiKey: TRANSAK_API_KEY,
          referrerDomain: 'remedly.fr',
          walletAddress,
          cryptoCurrencyCode: crypto.toUpperCase(),
          fiatCurrency: 'EUR',
          themeColor: '534AB7',
          hideMenu: 'true',
        },
      }),
      cache: 'no-store',
    });

    if (!sessionRes.ok) {
      const errorBody = await sessionRes.text();
      console.error('Transak create-widget-url failed:', sessionRes.status, errorBody);
      Sentry.captureException(new Error(`Transak create-widget-url failed: ${sessionRes.status}`), {
        tags: { context: 'getTransakWidgetUrl' },
        extra: { errorBody },
      });
      return null;
    }

    const sessionData = await sessionRes.json();
    return sessionData?.data?.widgetUrl || null;
  } catch (error) {
    console.error('Error creating Transak widget URL:', error);
    Sentry.captureException(error, { tags: { context: 'getTransakWidgetUrl' } });
    return null;
  }
}
