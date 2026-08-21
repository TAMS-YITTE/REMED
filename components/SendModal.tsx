import { useState, useEffect } from 'react';
import { useSignAndSendTransaction, useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useAuth } from '@/hooks/useAuth';
import { getSavedWallets, saveWallet } from '@/app/actions/database';
import { getSolanaBlockhash } from '@/app/actions/solana';
import { ERC20_TOKENS, getErc20Token, parseUnits, encodeErc20Transfer } from '@/lib/erc20Tokens';
import { buildSolTransfer, isValidSolanaAddress, solToLamports } from '@/lib/solanaSend';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: {
    eth: string;
    sol: string;
  };
  erc20Balances?: Record<string, string>;
}

// Actifs envoyables : ETH natif + les ERC-20 mainnet (tous EVM, chainId 1,
// même format d'adresse 0x) et SOL natif, sur le réseau Solana.
// BTC reste désactivé : Privy ne diffuse pas les transactions Bitcoin, il
// faut composer et diffuser la transaction soi-même (voir CLAUDE.md).
// Identifiant CAIP-2 de la grappe Solana mainnet (hash de genèse tronqué).
const SOLANA_MAINNET = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' as const;

// Un envoi Solana confirme en quelques secondes ; au-delà, quelque chose
// est bloqué et il vaut mieux le dire que faire tourner un spinner.
const SEND_TIMEOUT_MS = 60_000;

// Le blockhash vient d'un simple appel RPC : au-delà de 20 s, il ne
// répondra pas. `fetch` n'ayant pas de délai maximal par défaut, sans ce
// garde-fou un RPC muet fige l'envoi avant même d'atteindre Privy.
const STEP_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

const EVM_ASSETS = ['ETH', ...ERC20_TOKENS.map((t) => t.symbol)];
const SENDABLE_ASSETS = [...EVM_ASSETS, 'SOL'];

export function SendModal({ isOpen, onClose, balances, erc20Balances }: SendModalProps) {
  const { sendTransaction, user, solanaWalletAddress } = useAuth();
  const privyId = user?.id;
  const { signAndSendTransaction } = useSignAndSendTransaction();
  const { wallets: solanaWallets } = useSolanaWallets();

  const [step, setStep] = useState<1 | 2>(1);
  const [asset, setAsset] = useState('ETH');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  // Étape courante de l'envoi, affichée à l'utilisateur : un blocage doit
  // indiquer où il se produit, pas se réduire à un spinner muet.
  const [status, setStatus] = useState('');

  // Address Book state
  const [savedWallets, setSavedWallets] = useState<any[]>([]);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletLabel, setWalletLabel] = useState('');

  const isSendEnabled = process.env.NEXT_PUBLIC_ENABLE_SEND === 'true';

  const isSolana = asset === 'SOL';
  const token = isSolana ? undefined : getErc20Token(asset); // undefined pour ETH natif
  const currentBalance = isSolana
    ? (balances.sol || '0')
    : asset === 'ETH'
      ? (balances.eth || '0')
      : (erc20Balances?.[asset] || '0');

  useEffect(() => {
    if (isOpen && privyId) {
      getSavedWallets(privyId).then(setSavedWallets);
    }
  }, [isOpen, privyId]);

  if (!isOpen) return null;

  if (!isSendEnabled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-[#252844] text-white border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
          <div className="w-12 h-12 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
          <h3 className="text-lg font-bold mb-2">Fonctionnalité désactivée</h3>
          <p className="text-gray-400 mb-6">L'envoi de fonds est temporairement désactivé sur cet environnement.</p>
          <button onClick={onClose} className="bg-white/10 text-gray-200 px-6 py-2 rounded-lg font-medium hover:bg-white/15 transition-colors">Fermer</button>
        </div>
      </div>
    );
  }

  const handleNext = async () => {
    setError('');
    if (!address) {
      setError('Veuillez entrer une adresse de destination.');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Veuillez entrer un montant valide.');
      return;
    }

    // Une adresse d'une chaîne envoyée sur une autre chaîne = fonds perdus
    // sans recours : on refuse avant d'aller plus loin.
    if (isSolana) {
      if (!isValidSolanaAddress(address)) {
        setError("L'adresse Solana n'est pas valide.");
        return;
      }
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("L'adresse Ethereum n'est pas valide.");
      return;
    }

    if (Number(amount) > Number(currentBalance)) {
      setError('Solde insuffisant.');
      return;
    }

    if (isSavingWallet && walletLabel && privyId) {
      try {
        await saveWallet(privyId, address, isSolana ? 'solana' : 'ethereum', walletLabel);
      } catch (err) {
        console.error('Failed to save wallet:', err);
      }
    }

    setStep(2);
  };

  const resetAndClose = () => {
    onClose();
    setStep(1);
    setAddress('');
    setAmount('');
    setIsSavingWallet(false);
    setWalletLabel('');
  };

  const handleSend = async () => {
    setIsSending(true);
    setError('');

    try {
      if (isSolana) {
        // Chaque étape est affichée : un envoi qui bloque doit dire OÙ il
        // bloque, sinon il ne reste qu'un spinner muet à interpréter.
        setStatus('1/3 — Recherche du portefeuille…');
        const wallet = solanaWallets.find((w) => w.address === solanaWalletAddress);
        if (!wallet) {
          setError(
            `Portefeuille Solana introuvable (${solanaWallets.length} portefeuille(s) Solana détecté(s)). Reconnectez-vous et réessayez.`
          );
          return;
        }

        // Un blockhash périmé fait rejeter la transaction par le réseau :
        // on le prend juste avant de signer, pas à l'ouverture du modal.
        // `fetch` n'a pas de délai maximal par défaut : sans garde-fou, un
        // RPC qui ne répond jamais fige l'envoi avant même d'atteindre Privy.
        setStatus('2/3 — Préparation de la transaction…');
        const recent = await withTimeout(
          getSolanaBlockhash(),
          STEP_TIMEOUT_MS,
          "Le réseau Solana n'a pas répondu (préparation de la transaction). Rien n'a été envoyé."
        );
        if (!recent) {
          setError("Réseau Solana injoignable. Réessayez dans un instant.");
          return;
        }

        setStatus('3/3 — Signature et diffusion…');
        const transaction = buildSolTransfer({
          from: wallet.address,
          to: address,
          lamports: solToLamports(amount),
          blockhash: recent.blockhash,
          lastValidBlockHeight: BigInt(recent.lastValidBlockHeight),
        });

        // Sans `chain`, Privy choisit son réseau par défaut : la transaction
        // part alors avec un blockhash mainnet sur une autre grappe, n'est
        // jamais confirmée, et l'interface tourne indéfiniment.
        // Le délai maximal évite qu'un blocage se traduise par un spinner
        // muet : l'utilisateur doit savoir que rien n'est parti.
        const { signature } = await withTimeout(
          signAndSendTransaction({ transaction, wallet, chain: SOLANA_MAINNET }),
          SEND_TIMEOUT_MS,
          "L'envoi n'a pas abouti dans le délai imparti. Vérifiez votre solde avant de réessayer : si la transaction a été diffusée, elle apparaîtra dans votre historique."
        );
        console.log('Transaction Solana envoyée :', signature);
        resetAndClose();
        return;
      }

      let txConfig;
      if (asset === 'ETH') {
        // Envoi natif ETH (chemin validé en réel).
        const value = '0x' + parseUnits(amount, 18).toString(16);
        txConfig = { to: address, value, chainId: 1 };
      } else if (token) {
        // Envoi ERC-20 : appel transfer(destinataire, montant) du contrat.
        const data = encodeErc20Transfer(address, parseUnits(amount, token.decimals));
        txConfig = { to: token.contract, value: '0x0', data, chainId: 1 };
      } else {
        setError("Actif non pris en charge pour l'envoi.");
        return;
      }

      const txReceipt = await sendTransaction(txConfig);
      console.log('Transaction envoyée :', txReceipt);
      resetAndClose();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors de l'envoi de la transaction.");
    } finally {
      setIsSending(false);
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#252844] text-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-bold text-lg text-white">Envoyer des cryptos</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {step === 1 ? (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1">Actif</label>
              <select
                value={asset}
                onChange={(e) => {
                  const next = e.target.value;
                  // Changer de famille de chaîne rend l'adresse saisie
                  // invalide : on la vide plutôt que de risquer un envoi
                  // vers une adresse de l'autre réseau.
                  if ((next === 'SOL') !== isSolana) {
                    setAddress('');
                    setError('');
                  }
                  setAsset(next);
                }}
                className="w-full bg-[#1a1c2e] border border-white/15 text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {SENDABLE_ASSETS.map((sym) => (
                  <option key={sym} value={sym}>
                    {sym === 'ETH' ? 'Ethereum (ETH)' : sym === 'SOL' ? 'Solana (SOL)' : sym}
                  </option>
                ))}
                <option value="BTC" disabled>Bitcoin (bientôt)</option>
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                {isSolana
                  ? 'Réseau Solana. Envoyez uniquement vers une adresse Solana.'
                  : 'Réseau Ethereum. Envoyez uniquement vers une adresse Ethereum (0x…).'}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-300">Destinataire</label>
                {savedWallets.length > 0 && (
                  <select
                    className="text-xs bg-[#1a1c2e] border border-white/15 rounded p-1 text-indigo-300 outline-none"
                    onChange={(e) => {
                      if(e.target.value) setAddress(e.target.value);
                    }}
                  >
                    <option value="">Carnet d'adresses...</option>
                    {savedWallets.map((w, i) => (
                      <option key={i} value={w.address}>{w.label} ({w.network})</option>
                    ))}
                  </select>
                )}
              </div>
              <input
                type="text"
                placeholder={isSolana ? 'Adresse Solana...' : '0x...'}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#1a1c2e] border border-white/15 text-white placeholder-gray-500 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />

              {!savedWallets.find(w => w.address === address) && address.length > 10 && (
                <div className="mt-2 bg-white/5 p-3 rounded-lg border border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSavingWallet}
                      onChange={(e) => setIsSavingWallet(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Sauvegarder dans mon carnet</span>
                  </label>
                  {isSavingWallet && (
                    <input
                      type="text"
                      placeholder="Nom (ex: Mon Ledger)"
                      value={walletLabel}
                      onChange={(e) => setWalletLabel(e.target.value)}
                      className="mt-2 w-full bg-[#1a1c2e] border border-white/15 text-white placeholder-gray-500 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-300">Montant</label>
                <span className="text-xs text-gray-400">
                  Solde: {currentBalance} {asset}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#1a1c2e] border border-white/15 text-white placeholder-gray-500 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-400 font-medium text-sm uppercase">{asset}</span>
                </div>
              </div>
            </div>

            {error && <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">{error}</div>}

            <button
              onClick={handleNext}
              className="w-full bg-[#534AB7] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Continuer
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-[#2d3152] p-4 rounded-xl border border-white/10 mb-6">
              <p className="text-center text-sm text-gray-400 mb-1">Vous allez envoyer</p>
              <p className="text-center text-3xl font-bold text-white mb-6">
                {amount} <span className="text-xl text-gray-400 uppercase">{asset}</span>
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Réseau</span>
                  <span className="font-medium text-white">{isSolana ? 'Solana' : 'Ethereum'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vers</span>
                  <span className="font-medium text-white font-mono text-xs w-32 truncate" title={address}>
                    {address.substring(0, 8)}...{address.substring(address.length - 6)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-gray-400">Frais réseau</span>
                  <span className="font-medium text-white">payés en {isSolana ? 'SOL' : 'ETH'}</span>
                </div>
              </div>
            </div>

            <div className="mb-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg p-3 text-xs">
              <span className="text-sm shrink-0">⚠️</span>
              <span>
                <strong>Transaction irréversible.</strong> Vérifiez l'adresse et le réseau : un envoi
                vers une mauvaise adresse ou un réseau incompatible est <strong>définitivement perdu</strong>.
                Remedly ne peut ni annuler ni rembourser un envoi.
              </span>
            </div>

            {error && <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">{error}</div>}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={isSending}
                className="flex-1 bg-white/10 text-gray-200 py-3 rounded-xl font-medium hover:bg-white/15 transition-colors disabled:opacity-50"
              >
                Retour
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="flex-1 bg-[#534AB7] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSending ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> {status || 'Envoi...'}</>
                ) : (
                  'Confirmer'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
