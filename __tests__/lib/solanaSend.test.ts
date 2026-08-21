import { solToLamports, isValidSolanaAddress, LAMPORTS_PER_SOL } from '@/lib/solanaSend';

describe('solToLamports - conversion sans perte de précision', () => {
  it('ne doit JAMAIS passer par un flottant (0.1 SOL doit donner exactement 100000000)', () => {
    // 0.1 * 1e9 en flottant donne 100000000.00000001
    expect(solToLamports('0.1')).toBe(BigInt(100000000));
    expect(solToLamports('0.3')).toBe(BigInt(300000000));
  });

  it('gère la virgule française et les montants entiers', () => {
    expect(solToLamports('1,5')).toBe(BigInt(1500000000));
    expect(solToLamports('2')).toBe(BigInt(2) * LAMPORTS_PER_SOL);
  });

  it('tronque au-delà de 9 décimales au lieu d\'arrondir vers le haut', () => {
    // Arrondir vers le haut ferait envoyer plus que le solde disponible.
    expect(solToLamports('0.9999999999')).toBe(BigInt(999999999));
  });

  it('traite une saisie vide comme zéro', () => {
    expect(solToLamports('')).toBe(BigInt(0));
  });
});

describe('isValidSolanaAddress - garde-fou avant un envoi irréversible', () => {
  it('accepte une vraie adresse Solana', () => {
    expect(isValidSolanaAddress('G9FJ4p4Jn3DQgyqksPhS5MuHi2VdTE9VGaTDwcFY2TeA')).toBe(true);
  });

  it('refuse une adresse Ethereum (envoi inter-chaînes = fonds perdus)', () => {
    expect(isValidSolanaAddress('0xA70B325B96Ba7837F49DC750fC6c72ea2C035F99')).toBe(false);
  });

  it('refuse une adresse Bitcoin et les chaînes trop courtes', () => {
    expect(isValidSolanaAddress('bc1ppmwm3xtdr89lrrff0lzsl8yplch6n6ct933u729guaww30rw5pks4984px')).toBe(false);
    expect(isValidSolanaAddress('abc')).toBe(false);
  });

  it('refuse les caractères absents du base58 (0, O, I, l)', () => {
    expect(isValidSolanaAddress('0OIl' + 'A'.repeat(32))).toBe(false);
  });
});
