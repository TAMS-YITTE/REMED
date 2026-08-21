import { useState, useEffect } from 'react';
import { useSignTransaction, useWallets as useSolanaWallets } from '@privy-io/react-auth/solana';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { useAuth } from '@/hooks/useAuth';
import { getSavedWallets, saveWallet, deleteSavedWallet } from '@/app/actions/database';
import { getSolanaBlockhash, sendRawSolanaTransaction } from '@/app/actions/solana';
import { getBitcoinUtxos, getBitcoinFeeRates, broadcastBitcoinTransaction } from '@/app/actions/bitcoin';
import { ERC20_TOKENS, getErc20Token, parseUnits, encodeErc20Transfer } from '@/lib/erc20Tokens';
import { buildSolTransfer, isValidSolanaAddress, solToLamports } from '@/lib/solanaSend';
import { btcToSats, buildTransfer, finalizeTransfer, isValidBitcoinAddress } from '@/lib/bitcoinSend';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: {
    eth: string;
    sol: string;
    btc?: string;
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

// Le RPC Solana attend la transaction en base64 ; Privy la rend en octets.
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

// Les erreurs des bibliothèques réseau sont illisibles pour un utilisateur
// (corps de requête brut, hexadécimal, version de viem). On traduit les cas
// courants et on garde le texte d'origine en dernier recours.
function humanError(raw: string, symbol: string, isToken: boolean): string {
  const insufficient = raw.match(/have (\d+) want (\d+)/);
  if (insufficient) {
    // Les montants renvoyés par le réseau sont TOUJOURS en ETH (wei) : c'est
    // l'ETH qui paie le gaz, jamais le jeton transféré.
    const have = BigInt(insufficient[1]);
    const want = BigInt(insufficient[2]);
    const missing = Number(want - have) / 1e18;

    if (isToken) {
      // Réduire le montant de jetons ne change rien au gaz : le message
      // doit envoyer vers la seule action utile, approvisionner en ETH.
      return (
        `Pas assez d'ETH pour payer les frais de réseau : il manque ${missing.toFixed(8)} ETH. ` +
        `Les frais d'un envoi de ${symbol} se paient en ETH, pas en ${symbol} — ` +
        `réduire le montant de ${symbol} n'y changera rien. Envoyez un peu d'ETH sur votre adresse, puis réessayez.`
      );
    }

    return (
      `Solde insuffisant une fois les frais de réseau ajoutés : il manque ${missing.toFixed(8)} ETH. ` +
      `Sur Ethereum, les frais se paient EN PLUS du montant envoyé — réduisez le montant et réessayez.`
    );
  }
  if (/user rejected|denied/i.test(raw)) return 'Transaction annulée.';
  if (/nonce/i.test(raw)) return 'Une transaction précédente est encore en cours. Attendez quelques instants.';
  return raw;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

const EVM_ASSETS = ['ETH', ...ERC20_TOKENS.map((t) => t.symbol)];
const SENDABLE_ASSETS = [...EVM_ASSETS, 'SOL', 'BTC'];

export function SendModal({ isOpen, onClose, balances, erc20Balances }: SendModalProps) {
  const { sendTransaction, user, solanaWalletAddress, bitcoinWalletAddress } = useAuth();
  const privyId = user?.id;
  const { signTransaction } = useSignTransaction();
  const { signRawHash } = useSignRawHash();
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Priorite des frais Bitcoin : le reseau peut monter en quelques minutes,
  // l utilisateur doit pouvoir arbitrer entre cout et delai.
  const [btcPriority, setBtcPriority] = useState<'economique' | 'normal' | 'rapide'>('normal');

  const isSendEnabled = process.env.NEXT_PUBLIC_ENABLE_SEND === 'true';

  const isSolana = asset === 'SOL';
  const currentNetwork = asset === 'SOL' ? 'solana' : asset === 'BTC' ? 'bitcoin' : 'ethereum';
  const isBitcoin = asset === 'BTC';
  const token = isSolana || isBitcoin ? undefined : getErc20Token(asset); // undefined pour ETH natif
  const currentBalance = isSolana
    ? (balances.sol || '0')
    : isBitcoin
      ? (balances.btc || '0')
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
    } else if (isBitcoin) {
      if (!isValidBitcoinAddress(address)) {
        setError("L'adresse Bitcoin n'est pas valide.");
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
        await saveWallet(privyId, address, isSolana ? 'solana' : isBitcoin ? 'bitcoin' : 'ethereum', walletLabel);
      } catch (err) {
        console.error('Failed to save wallet:', err);
      }
    }

    setStep(2);
  };

  // Le carnet ne montre que les adresses de la chaîne sélectionnée : une
  // adresse Bitcoin proposée pour un envoi Ethereum invite à une perte.
  const handleDeleteWallet = async (walletId: string) => {
    setDeletingId(walletId);
    try {
      const result = await deleteSavedWallet(privyId!, walletId);
      if (result.ok) setSavedWallets((list) => list.filter((w) => w.id !== walletId));
      else setError(`Suppression impossible : ${result.error}`);
    } finally {
      setDeletingId(null);
    }
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
      if (isBitcoin) {
        if (!bitcoinWalletAddress) {
          setError('Adresse Bitcoin introuvable. Reconnectez-vous et réessayez.');
          return;
        }

        setStatus('1/4 — Lecture de vos fonds…');
        const [utxos, feeRates] = await withTimeout(
          Promise.all([getBitcoinUtxos(bitcoinWalletAddress), getBitcoinFeeRates()]),
          STEP_TIMEOUT_MS,
          "Le réseau Bitcoin n'a pas répondu. Rien n'a été envoyé."
        );
        if (utxos.length === 0) {
          setError('Aucun fonds confirmé disponible sur votre adresse Bitcoin.');
          return;
        }

        // Le plan (entrées, frais, monnaie) est vérifié avant toute
        // signature : une erreur de monnaie enverrait le solde aux mineurs.
        setStatus('2/4 — Préparation de la transaction…');
        const plan = buildTransfer({
          utxos,
          fromAddress: bitcoinWalletAddress,
          toAddress: address,
          amountSats: btcToSats(amount),
          feeRate: feeRates[btcPriority],
        });

        setStatus(`3/4 — Signature (${plan.sighashes.length} entrée(s))…`);
        const signatures: string[] = [];
        for (const sighash of plan.sighashes) {
          const { signature } = await withTimeout(
            signRawHash({
              address: bitcoinWalletAddress,
              chainType: 'bitcoin-taproot',
              hash: `0x${sighash}`,
            }),
            SEND_TIMEOUT_MS,
            "La signature n'a pas abouti dans le délai imparti. Rien n'a été envoyé."
          );
          signatures.push(signature);
        }

        setStatus('4/4 — Diffusion…');
        const result = await withTimeout(
          broadcastBitcoinTransaction(finalizeTransfer(plan, signatures)),
          STEP_TIMEOUT_MS,
          "Le réseau Bitcoin n'a pas répondu pendant la diffusion. Vérifiez votre historique avant de réessayer."
        );

        if ('error' in result) {
          setError(result.error);
          return;
        }

        console.log('Transaction Bitcoin envoyée :', result.txid);
        resetAndClose();
        return;
      }

      if (isSolana) {
        // Chaque étape est affichée : un envoi qui bloque doit dire OÙ il
        // bloque, sinon il ne reste qu'un spinner muet à interpréter.
        setStatus('1/4 — Recherche du portefeuille…');
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
        setStatus('2/4 — Préparation de la transaction…');
        const recent = await withTimeout(
          getSolanaBlockhash(),
          STEP_TIMEOUT_MS,
          "Le réseau Solana n'a pas répondu (préparation de la transaction). Rien n'a été envoyé."
        );
        if (!recent) {
          setError("Réseau Solana injoignable. Réessayez dans un instant.");
          return;
        }

        setStatus('3/4 — Signature…');
        const transaction = buildSolTransfer({
          from: wallet.address,
          to: address,
          lamports: solToLamports(amount),
          blockhash: recent.blockhash,
          lastValidBlockHeight: BigInt(recent.lastValidBlockHeight),
        });

        // On ne demande QUE la signature à Privy. Sa méthode
        // signAndSendTransaction diffuse puis attend la confirmation via une
        // souscription WebSocket qui ne se terminait jamais ici : l'envoi
        // restait bloqué indéfiniment sans qu'aucune transaction ne parte
        // (vérifié on-chain, solde inchangé). La diffusion est donc faite
        // par notre propre RPC, celui qui répond déjà à l'étape 2.
        const { signedTransaction } = await withTimeout(
          signTransaction({ transaction, wallet, chain: SOLANA_MAINNET }),
          SEND_TIMEOUT_MS,
          "La signature n'a pas abouti dans le délai imparti. Rien n'a été envoyé."
        );

        setStatus('4/4 — Diffusion…');
        const result = await withTimeout(
          sendRawSolanaTransaction(toBase64(signedTransaction)),
          STEP_TIMEOUT_MS,
          "Le réseau Solana n'a pas répondu pendant la diffusion. Vérifiez votre historique avant de réessayer."
        );

        if ('error' in result) {
          setError(result.error);
          return;
        }

        console.log('Transaction Solana envoyée :', result.signature);
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
      setError(humanError(e?.message || '', asset, Boolean(token)) || "Erreur lors de l'envoi de la transaction.");
    } finally {
      setIsSending(false);
      setStatus('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* La hauteur est bornée et le contenu défile : sur un écran court, ou
          quand un message d'erreur s'allonge, les boutons d'action sortaient
          de la fenêtre et devenaient inatteignables. */}
      <div className="bg-[#252844] text-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden border border-white/10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
          <h3 className="font-bold text-lg text-white">Envoyer des cryptos</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            ✕
          </button>
        </div>

        {step === 1 ? (
          <div className="p-6 overflow-y-auto">
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
                    {sym === 'ETH' ? 'Ethereum (ETH)' : sym === 'SOL' ? 'Solana (SOL)' : sym === 'BTC' ? 'Bitcoin (BTC)' : sym}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1">
                {isSolana
                  ? 'Réseau Solana. Envoyez uniquement vers une adresse Solana.'
                  : isBitcoin
                    ? 'Réseau Bitcoin. Envoyez uniquement vers une adresse Bitcoin.'
                    : 'Réseau Ethereum. Envoyez uniquement vers une adresse Ethereum (0x…).'}
              </p>

              {/* Le débit du réseau Bitcoin peut doubler en quelques minutes.
                  Sans ce choix, une transaction préparée au calme se
                  retrouve sous-payée et attend des heures. */}
              {isBitcoin && (
                <div className="mt-3">
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Priorité</label>
                  <div className="flex gap-1 bg-[#1a1c2e] border border-white/15 rounded-lg p-1">
                    {([
                      { key: 'economique', label: 'Économique', hint: '~1 h ou plus' },
                      { key: 'normal', label: 'Normal', hint: '~30 min' },
                      { key: 'rapide', label: 'Rapide', hint: 'prochain bloc' },
                    ] as const).map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => setBtcPriority(option.key)}
                        className={`flex-1 px-2 py-1.5 rounded text-[11px] font-medium transition-colors ${
                          btcPriority === option.key
                            ? 'bg-indigo-500 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                        title={option.hint}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Les frais réels dépendent du réseau au moment de l'envoi.
                  </p>
                </div>
              )}
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
                    {savedWallets
                      .filter((w) => w.network === currentNetwork)
                      .map((w, i) => (
                        <option key={i} value={w.address}>{w.label} ({w.network})</option>
                      ))}
                  </select>
                )}
              </div>

              {/* Le carnet se remplit à chaque envoi et finissait par
                  accumuler des doublons, sans aucun moyen de les retirer. */}
              {savedWallets.filter((w) => w.network === currentNetwork).length > 0 && (
                <div className="mb-2 flex flex-col gap-1">
                  {savedWallets
                    .filter((w) => w.network === currentNetwork)
                    .map((w) => (
                      <div key={w.id} className="flex items-center justify-between gap-2 text-[11px] bg-white/5 border border-white/10 rounded px-2 py-1">
                        <button
                          type="button"
                          onClick={() => setAddress(w.address)}
                          className="flex-1 text-left text-gray-300 hover:text-white truncate"
                          title={w.address}
                        >
                          {w.label} — {w.address.slice(0, 10)}…{w.address.slice(-6)}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWallet(w.id)}
                          disabled={deletingId === w.id}
                          className="shrink-0 text-red-300 hover:text-red-200 disabled:opacity-40 px-1"
                          title="Retirer du carnet"
                        >
                          {deletingId === w.id ? '…' : '✕'}
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <input
                type="text"
                placeholder={isSolana ? 'Adresse Solana...' : isBitcoin ? 'Adresse Bitcoin (bc1...)' : '0x...'}
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

            {error && <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3 rounded-lg max-h-32 overflow-y-auto break-words">{error}</div>}

            <button
              onClick={handleNext}
              className="w-full bg-[#534AB7] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Continuer
            </button>
          </div>
        ) : (
          <div className="p-6 overflow-y-auto">
            <div className="bg-[#2d3152] p-4 rounded-xl border border-white/10 mb-6">
              <p className="text-center text-sm text-gray-400 mb-1">Vous allez envoyer</p>
              <p className="text-center text-3xl font-bold text-white mb-6">
                {amount} <span className="text-xl text-gray-400 uppercase">{asset}</span>
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Réseau</span>
                  <span className="font-medium text-white">{isSolana ? 'Solana' : isBitcoin ? 'Bitcoin' : 'Ethereum'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vers</span>
                  <span className="font-medium text-white font-mono text-xs w-32 truncate" title={address}>
                    {address.substring(0, 8)}...{address.substring(address.length - 6)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-gray-400">Frais réseau</span>
                  <span className="font-medium text-white">payés en {isSolana ? 'SOL' : isBitcoin ? 'BTC' : 'ETH'}</span>
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

            {error && <div className="mb-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3 rounded-lg max-h-32 overflow-y-auto break-words">{error}</div>}

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
