import { getSolanaWalletData } from '@/app/actions/solana';

const ADDRESS = '5rG9tfJs5xLmPqAoW3Zc1nHkPQY2iuVbLuMfBqQ9m7Bt';
const OTHER = 'JuPvqPZ9nZ1nGkS4b8kQFqmHZ1sAWq5vKq3xTdmwYzYb';

function signature(sig: string, blockTime = 1786000000) {
  return { signature: sig, blockTime, err: null };
}

// Réponse getTransaction minimale : seuls accountKeys / pre / postBalances
// sont lus par l'action.
function txResult(id: number, keys: string[], pre: number[], post: number[]) {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      transaction: { message: { accountKeys: keys.map((pubkey) => ({ pubkey })) } },
      meta: { preBalances: pre, postBalances: post }
    }
  };
}

function mockFetch(handler: (body: any) => any) {
  global.fetch = jest.fn(async (_url: any, options: any) => ({
    ok: true,
    json: async () => handler(JSON.parse(options.body))
  })) as any;
}

describe('getSolanaWalletData - montant réel des transactions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('lit le montant reçu dans la variation de solde, au lieu de renvoyer 0', async () => {
    mockFetch((body) => {
      if (Array.isArray(body)) {
        // Batch getTransaction
        return [txResult(0, [OTHER, ADDRESS], [5_000_000_000, 0], [4_750_000_000, 250_000_000])];
      }
      if (body.method === 'getBalance') return { result: { value: 250_000_000 } };
      if (body.method === 'getSignaturesForAddress') return { result: [signature('sig-in')] };
      return {};
    });

    const data = await getSolanaWalletData(ADDRESS);

    expect(data.balanceSol).toBe('0.2500');
    expect(data.transactions).toHaveLength(1);
    expect(data.transactions[0].value).toBe('250000000'); // lamports = 0.25 SOL
    expect(data.transactions[0].direction).toBe('in');
  });

  it('marque un envoi comme sortant avec son montant absolu', async () => {
    mockFetch((body) => {
      if (Array.isArray(body)) {
        return [txResult(0, [ADDRESS, OTHER], [1_000_000_000, 0], [899_995_000, 100_000_000])];
      }
      if (body.method === 'getBalance') return { result: { value: 899_995_000 } };
      if (body.method === 'getSignaturesForAddress') return { result: [signature('sig-out')] };
      return {};
    });

    const data = await getSolanaWalletData(ADDRESS);

    expect(data.transactions[0].direction).toBe('out');
    expect(data.transactions[0].value).toBe('100005000'); // 0.1 SOL + frais
  });

  it('renvoie null (jamais 0) quand le RPC ne fournit pas les soldes', async () => {
    mockFetch((body) => {
      if (Array.isArray(body)) return { error: { code: 429, message: 'Too many requests' } };
      if (body.method === 'getBalance') return { result: { value: 250_000_000 } };
      if (body.method === 'getSignaturesForAddress') return { result: [signature('sig-unknown')] };
      return {};
    });

    const data = await getSolanaWalletData(ADDRESS);

    expect(data.transactions[0].value).toBeNull();
    expect(data.transactions[0].direction).toBe('unknown');
  });

  it('associe chaque montant à sa signature même si le RPC renvoie le batch désordonné', async () => {
    mockFetch((body) => {
      if (Array.isArray(body)) {
        return [
          txResult(1, [OTHER, ADDRESS], [0, 0], [0, 2_000_000_000]),
          txResult(0, [OTHER, ADDRESS], [0, 0], [0, 1_000_000_000])
        ];
      }
      if (body.method === 'getBalance') return { result: { value: 3_000_000_000 } };
      if (body.method === 'getSignaturesForAddress') {
        return { result: [signature('sig-a'), signature('sig-b')] };
      }
      return {};
    });

    const data = await getSolanaWalletData(ADDRESS);

    expect(data.transactions.find((tx) => tx.hash === 'sig-a')?.value).toBe('1000000000');
    expect(data.transactions.find((tx) => tx.hash === 'sig-b')?.value).toBe('2000000000');
  });
});
