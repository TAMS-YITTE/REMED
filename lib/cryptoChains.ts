export type ChainFamily = 'ethereum' | 'solana' | 'bitcoin';

// Which wallet address format a given crypto needs. EVM-compatible chains
// (ETH, and Monad, which is EVM-compatible) all share the Ethereum (0x...)
// address; Solana has its own base58 address. Bitcoin has no matching
// address format available from either wallet, so it stays unsupported
// until a Bitcoin embedded wallet is wired up.
const CHAIN_BY_CRYPTO: Record<string, ChainFamily> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  usdc: 'ethereum',
  usdt: 'ethereum',
  monad: 'ethereum',
};

export function getChainFamily(crypto: string): ChainFamily {
  return CHAIN_BY_CRYPTO[crypto.toLowerCase()] ?? 'ethereum';
}
