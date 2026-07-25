// Tokens ERC-20 envoyables depuis le wallet Ethereum (mainnet, chainId 1).
// Mêmes contrats que ceux lus dans app/actions/wallet.ts (getErc20Balances).
// AVAX est exclu volontairement : il est natif sur Avalanche C-Chain (autre
// chaîne), pas un ERC-20 sur Ethereum — son envoi demanderait un autre chainId.

export interface Erc20Token {
  symbol: string;
  contract: string;
  decimals: number;
}

export const ERC20_TOKENS: Erc20Token[] = [
  { symbol: 'USDC', contract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
  { symbol: 'LINK', contract: '0x514910771af9ca656af840dff83e8264ecf986ca', decimals: 18 },
  { symbol: 'SHIB', contract: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce', decimals: 18 },
  { symbol: 'UNI',  contract: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', decimals: 18 },
  { symbol: 'POL',  contract: '0x455e53c3ee1528c586b7215de5f832f05929a6b2', decimals: 18 },
];

export function getErc20Token(symbol: string): Erc20Token | undefined {
  return ERC20_TOKENS.find((t) => t.symbol === symbol.toUpperCase());
}

// Convertit un montant décimal (string) en unités de base entières (BigInt),
// SANS passer par un flottant (Number perd la précision au-delà de ~15
// chiffres — critique pour un token à 18 décimales). Les décimales en trop
// sont tronquées.
export function parseUnits(value: string, decimals: number): bigint {
  const cleaned = (value || '0').trim().replace(',', '.');
  const [intPart = '0', fracPart = ''] = cleaned.split('.');
  const fracPadded = (fracPart + '0'.repeat(decimals)).slice(0, decimals);
  const int = BigInt(intPart || '0');
  const frac = BigInt(fracPadded || '0');
  return int * BigInt(10) ** BigInt(decimals) + frac;
}

// Encode l'appel ERC-20 transfer(address to, uint256 amount) en calldata hex.
// Sélecteur 0xa9059cbb + adresse (32 octets) + montant (32 octets).
export function encodeErc20Transfer(to: string, amountBaseUnits: bigint): string {
  const selector = 'a9059cbb';
  const addr = to.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const amount = amountBaseUnits.toString(16).padStart(64, '0');
  return '0x' + selector + addr + amount;
}
