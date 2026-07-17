export interface CryptoItem {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  supported: boolean;
}

// `supported: false` = le wallet Ethereum/Solana/Bitcoin de Privy ne peut pas
// recevoir cet actif (réseau natif incompatible, confirmé via l'API publique
// MoonPay https://api.moonpay.com/v3/currencies : format d'adresse et/ou tag
// de destination différents). Reste visible dans le sélecteur mais désactivé
// tant qu'aucun wallet compatible n'existe côté Privy. Voir lib/cryptoChains.ts.
export const cryptoList: CryptoItem[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '/btc.svg', supported: true },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: '/eth.svg', supported: true },
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '/sol.svg', supported: true },
  { id: 'usdc', name: 'USDC', symbol: 'USDC', icon: '/usdc.svg', supported: true },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', icon: '/avax.svg', supported: true },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', icon: '/link.svg', supported: true },
  { id: 'pol', name: 'Polygon', symbol: 'POL', icon: '/matic.svg', supported: true },
  { id: 'shib', name: 'Shiba Inu', symbol: 'SHIB', icon: '/shib.svg', supported: true },
  { id: 'uni', name: 'Uniswap', symbol: 'UNI', icon: '/uni.svg', supported: true },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP', icon: '/xrp.svg', supported: false },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', icon: '/ada.svg', supported: false },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', icon: '/dot.png', supported: false },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: '/doge.svg', supported: false },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: '/ltc.svg', supported: false },
  { id: 'atom', name: 'Cosmos', symbol: 'ATOM', icon: '/atom.svg', supported: false }
];
