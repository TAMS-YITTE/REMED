export type ChainFamily = 'ethereum' | 'solana' | 'bitcoin';

// Which wallet address format a given crypto needs, and whether Privy's
// embedded wallet can actually receive it today. Verified against MoonPay's
// public currency list (https://api.moonpay.com/v3/currencies) on 2026-07-17:
// each entry there exposes the real addressRegex/network for that ticker.
//
// - btc/eth/sol: native chains Privy already supports (ETH+SOL auto-created,
//   BTC Tier 2 on demand).
// - usdc/avax/link/matic/shib/uni: all use the same 0x/secp256k1 address
//   format as Ethereum (avax = Avalanche C-Chain, matic = Polygon, both
//   EVM-compatible), so the existing Ethereum wallet address is a valid
//   receive address for them.
// - xrp/ada/dot/doge/ltc/atom: native chains with their own address format
//   (Ripple base58 "r...", Cardano bech32, Polkadot SS58, Dogecoin/Litecoin
//   base58, Cosmos bech32) that Privy cannot generate a wallet for. xrp and
//   atom additionally require a destination tag/memo, which the Privy wallet
//   has no concept of. These MUST stay unsupported (no chain family) until a
//   compatible wallet exists — do not add a fallback that silently maps them
//   to 'ethereum'.
const CHAIN_BY_CRYPTO: Record<string, ChainFamily> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  usdc: 'ethereum',
  avax: 'ethereum',
  link: 'ethereum',
  pol: 'ethereum',
  shib: 'ethereum',
  uni: 'ethereum',
};

export function getChainFamily(crypto: string): ChainFamily | null {
  return CHAIN_BY_CRYPTO[crypto.toLowerCase()] ?? null;
}
