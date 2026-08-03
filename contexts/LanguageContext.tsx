'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Language = 'fr' | 'en';
export type Currency = 'EUR' | 'USD';

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  fr: {
    // Nav
    'nav.home': 'Accueil',
    'nav.buy': 'Acheter',
    'nav.blog': 'Blog',
    'nav.quiz': 'Quiz',
    'nav.pro': 'Remedly Pro',
    'nav.fiscal': 'Relevé fiscal',
    // Simulator
    'sim.title': 'Simulateur Rapide',
    'sim.pay': 'Vous payez',
    'sim.receive': 'Vous recevez (estimatif)',
    'sim.buy': 'Acheter maintenant',
    'sim.minAmount': "Montant minimum d'achat recommandé : 30",
    'sim.live': 'Live',
    'sim.loading': 'Chargement...',
    'sim.search': 'Rechercher (ex: SOL, Ethereum)...',
    'sim.favorites': 'Favoris & Top Cryptos',
    'sim.topCryptos': 'Top Cryptos',
    'sim.comingSoon': 'Bientôt',
    'sim.noResults': 'Aucune crypto trouvée',
    'sim.feeLabel': 'Frais transparents (~1.99%)',
    'sim.rateEstimate': 'Taux estimé',
    'sim.paymentMethods': 'Moyens de paiement acceptés',
    'sim.transferRecommended': 'Virement (Recommandé)',
    // Hero
    'hero.title1': 'La crypto,',
    'hero.title2': 'simplement.',
    'hero.subtitle': 'Achetez Bitcoin, Ethereum, Solana et plus encore en 3 clics. Sans phrase de récupération complexe, avec une sécurité bancaire.',
    // Info bar
    'info.securedBy': 'Sécurisé par',
    // Innovation block
    'innovation.badge': 'Innovation Remedly',
    'innovation.title': "Le portefeuille invisible, la sécurité absolue.",
    'innovation.desc': "L'absence de \"Seed Phrase\" (les 24 mots complexes à mémoriser) est notre plus grande force. Votre portefeuille est 100% non-custodial et auto-hébergé : il n'appartient qu'à vous.",
    'innovation.point1': 'Récupérable via un simple e-mail sécurisé',
    'innovation.point2': "Nous n'avons jamais accès à vos fonds",
    'innovation.point3': 'Protégé par une cryptographie de pointe (Privy)',
    'innovation.cta': 'Comprendre notre technologie',
    // Features
    'features.title': 'Acheter sans compromis',
    'features.subtitle': "Une expérience pensée pour être accessible à tous, tout en respectant les standards bancaires les plus stricts.",
    'features.security': 'Sécurité Bancaire',
    'features.securityDesc': 'Votre portefeuille non-custodial est créé automatiquement. Vous êtes le seul maître de vos fonds.',
    'features.instant': 'Instantané',
    'features.instantDesc': 'Achetez par carte bancaire ou Apple Pay en moins de 2 minutes. Vos cryptos arrivent directement sur votre compte.',
    'features.fees': 'Frais Transparents',
    'features.feesDesc': 'Privilégiez le virement SEPA pour réduire considérablement vos frais par rapport à la carte bancaire. Pas de spread caché.',
    'features.learnMore': 'En savoir plus',
    // FAQ
    'faq.title': 'Questions fréquentes',
    'faq.subtitle': 'Tout ce que vous devez savoir avant de vous lancer.',
    'faq.otherQuestions': "Vous avez d'autres questions ?",
    'faq.consult': 'Consultez notre',
    'faq.orContact': 'ou contactez notre support.',
    // FAQ questions/answers
    'faq.q1': 'Mes fonds sont-ils en sécurité ?',
    'faq.a1': "Oui. Nous utilisons la technologie 'Embedded Wallet' (fournie par Privy). Vos portefeuilles sont 100% non-custodial, ce qui signifie que vous seul y avez accès. Nous ne détenons jamais vos cryptos ni vos clés privées.",
    'faq.q2': 'Comment acheter par virement sans aucun frais de carte ?',
    'faq.a2': "Pour éviter les frais de carte (2 à 4 %), cliquez sur 'Payer avec MoonPay' puis sur le menu déroulant des moyens de paiement et choisissez 'MoonPay Balance'. Cliquez sur 'Top up', puis sur la roue crantée (⚙️) ➔ Payment methods ➔ Add new ➔ Easy Bank Transfers. Sélectionnez votre banque (BoursoBank, BNP Paribas, Caisse d'Épargne...) et validez votre virement instantané sans aucun frais de carte !",
    'faq.q3': 'Combien de temps prend un achat ?',
    'faq.a3': "Avec l'Apple Pay ou la carte bancaire, l'achat est instantané. Avec le virement bancaire classique, cela peut prendre de 1 à 3 jours ouvrés selon votre banque.",
    'faq.q4': "Quel est le montant minimum d'achat ?",
    'faq.a4': 'Vous pouvez commencer à investir à partir de 30€ seulement. Idéal pour tester notre plateforme sans engagement.',
    'faq.q5': 'Comment récupérer mon compte si je change de téléphone ?',
    'faq.a5': "Votre compte est lié à votre adresse e-mail ou compte Google. Il n'y a aucune 'phrase de récupération' (seed phrase) complexe à mémoriser. Il vous suffit de vous reconnecter avec le même e-mail.",
    // Footer
    'footer.desc': "L'interface la plus simple pour accéder à l'écosystème crypto.",
    'footer.legal': 'Mentions Légales',
    'footer.cgu': 'CGU',
    'footer.privacy': 'Confidentialité',
    'footer.contact': 'Contact',
    'footer.rights': 'Tous droits réservés.',
    // MICA disclaimer
    'mica.disclaimer': "L'investissement en crypto-actifs est risqué. Vous pouvez perdre votre capital.",
    // Mobile CTA
    'mobile.cta': 'Acheter des cryptos maintenant',
    // Menu
    'menu.title': 'Menu',
    // Slogan
    'slogan': 'Remède contre la complexité',
    // Pro pricing
    'pro.price': '4,99 €/mois',
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.buy': 'Buy',
    'nav.blog': 'Blog',
    'nav.quiz': 'Quiz',
    'nav.pro': 'Remedly Pro',
    'nav.fiscal': 'Tax Statement',
    // Simulator
    'sim.title': 'Quick Simulator',
    'sim.pay': 'You pay',
    'sim.receive': 'You get (estimated)',
    'sim.buy': 'Buy now',
    'sim.minAmount': 'Minimum recommended purchase amount: 30',
    'sim.live': 'Live',
    'sim.loading': 'Loading...',
    'sim.search': 'Search (e.g. SOL, Ethereum)...',
    'sim.favorites': 'Favorites & Top Cryptos',
    'sim.topCryptos': 'Top Cryptos',
    'sim.comingSoon': 'Coming soon',
    'sim.noResults': 'No crypto found',
    'sim.feeLabel': 'Transparent fees (~1.99%)',
    'sim.rateEstimate': 'Estimated rate',
    'sim.paymentMethods': 'Accepted payment methods',
    'sim.transferRecommended': 'Bank Transfer (Recommended)',
    // Hero
    'hero.title1': 'Crypto,',
    'hero.title2': 'made simple.',
    'hero.subtitle': 'Buy Bitcoin, Ethereum, Solana and more in 3 clicks. No complex recovery phrase, with banking-grade security.',
    // Info bar
    'info.securedBy': 'Secured by',
    // Innovation block
    'innovation.badge': 'Remedly Innovation',
    'innovation.title': 'The invisible wallet, absolute security.',
    'innovation.desc': 'The absence of a "Seed Phrase" (those 24 complex words to memorize) is our greatest strength. Your wallet is 100% non-custodial and self-hosted: it belongs to you alone.',
    'innovation.point1': 'Recoverable via a simple secure email',
    'innovation.point2': 'We never have access to your funds',
    'innovation.point3': 'Protected by state-of-the-art cryptography (Privy)',
    'innovation.cta': 'Understand our technology',
    // Features
    'features.title': 'Buy without compromise',
    'features.subtitle': 'An experience designed to be accessible to everyone, while meeting the strictest banking standards.',
    'features.security': 'Banking Security',
    'features.securityDesc': 'Your non-custodial wallet is created automatically. You are the sole owner of your funds.',
    'features.instant': 'Instant',
    'features.instantDesc': 'Buy by credit card or Apple Pay in under 2 minutes. Your crypto arrives directly in your account.',
    'features.fees': 'Transparent Fees',
    'features.feesDesc': 'Use SEPA bank transfer to significantly reduce your fees compared to credit cards. No hidden spread.',
    'features.learnMore': 'Learn more',
    // FAQ
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Everything you need to know before getting started.',
    'faq.otherQuestions': 'Have more questions?',
    'faq.consult': 'Check out our',
    'faq.orContact': 'or contact our support.',
    // FAQ questions/answers
    'faq.q1': 'Are my funds safe?',
    'faq.a1': "Yes. We use 'Embedded Wallet' technology (provided by Privy). Your wallets are 100% non-custodial, meaning only you have access. We never hold your crypto or private keys.",
    'faq.q2': 'How to buy by bank transfer with no card fees?',
    'faq.a2': "To avoid card fees (2 to 4%), click 'Pay with MoonPay' then on the payment method dropdown and select 'MoonPay Balance'. Click 'Top up', then the gear icon (⚙️) → Payment methods → Add new → Easy Bank Transfers. Select your bank and validate your instant transfer with zero card fees!",
    'faq.q3': 'How long does a purchase take?',
    'faq.a3': 'With Apple Pay or credit card, the purchase is instant. With a regular bank transfer, it can take 1 to 3 business days depending on your bank.',
    'faq.q4': 'What is the minimum purchase amount?',
    'faq.a4': 'You can start investing from just $30. Perfect for testing our platform without commitment.',
    'faq.q5': 'How do I recover my account if I change phones?',
    'faq.a5': "Your account is linked to your email address or Google account. There is no complex 'seed phrase' to memorize. Simply log back in with the same email.",
    // Footer
    'footer.desc': 'The simplest interface to access the crypto ecosystem.',
    'footer.legal': 'Legal Notice',
    'footer.cgu': 'Terms of Service',
    'footer.privacy': 'Privacy',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    // MICA disclaimer
    'mica.disclaimer': 'Investing in crypto-assets is risky. You may lose your capital.',
    // Mobile CTA
    'mobile.cta': 'Buy crypto now',
    // Menu
    'menu.title': 'Menu',
    // Slogan
    'slogan': 'The cure for complexity',
    // Pro pricing
    'pro.price': '$4.99/month',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (cur: Currency) => void;
  currencySymbol: string;
  convertAmount: (eurAmount: number) => number;
  formatAmount: (eurAmount: number) => string;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  currency: 'EUR',
  setCurrency: () => {},
  currencySymbol: '€',
  convertAmount: (n) => n,
  formatAmount: (n) => `${n.toFixed(2)} €`,
  t: (key: string) => key,
});

const STORAGE_KEY_LANG = 'remedly_language';
const STORAGE_KEY_CURRENCY = 'remedly_currency';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');
  const [currency, setCurrencyState] = useState<Currency>('EUR');
  const [eurToUsdRate, setEurToUsdRate] = useState<number>(1.08); // fallback
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG);
      if (savedLang === 'fr' || savedLang === 'en') setLanguageState(savedLang as Language);
      const savedCur = localStorage.getItem(STORAGE_KEY_CURRENCY);
      if (savedCur === 'EUR' || savedCur === 'USD') setCurrencyState(savedCur as Currency);
    } catch {
      // ignore localStorage errors
    }
  }, []);

  // Fetch EUR/USD live rate from CoinGecko (same API as crypto prices)
  useEffect(() => {
    let cancelled = false;
    async function fetchRate() {
      try {
        // CoinGecko exchange_rates: free, no API key needed
        const res = await fetch('https://api.coingecko.com/api/v3/exchange_rates');
        const data = await res.json();
        if (!cancelled && data?.rates?.eur?.value && data?.rates?.usd?.value) {
          // Both are vs BTC: rate = usd.value / eur.value
          setEurToUsdRate(data.rates.usd.value / data.rates.eur.value);
        }
      } catch {
        // Keep fallback 1.08 if fetch fails
      }
    }
    fetchRate();
    // Refresh every 30 minutes
    const interval = setInterval(fetchRate, 30 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY_LANG, lang); } catch {}
    // Auto-switch currency: FR → EUR, EN → USD
    const cur = lang === 'fr' ? 'EUR' : 'USD';
    setCurrencyState(cur);
    try { localStorage.setItem(STORAGE_KEY_CURRENCY, cur); } catch {}
  }, []);

  const setCurrency = useCallback((cur: Currency) => {
    setCurrencyState(cur);
    try { localStorage.setItem(STORAGE_KEY_CURRENCY, cur); } catch {}
    // Auto-switch language when currency changes manually
    const lang = cur === 'EUR' ? 'fr' : 'en';
    setLanguageState(lang);
    try { localStorage.setItem(STORAGE_KEY_LANG, lang); } catch {}
  }, []);

  const currencySymbol = currency === 'EUR' ? '€' : '$';

  const convertAmount = useCallback((eurAmount: number): number => {
    if (currency === 'EUR') return eurAmount;
    return eurAmount * eurToUsdRate;
  }, [currency, eurToUsdRate]);

  const formatAmount = useCallback((eurAmount: number): string => {
    const val = convertAmount(eurAmount);
    if (currency === 'EUR') {
      return `${val.toFixed(2)} €`;
    }
    return `$${val.toFixed(2)}`;
  }, [currency, convertAmount]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let text = dictionaries[language][key] || dictionaries['fr'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, String(v));
      });
    }
    return text;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    currency,
    setCurrency,
    currencySymbol,
    convertAmount,
    formatAmount,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);