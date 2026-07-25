import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSavedWallets, saveWallet } from '@/app/actions/database';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  balances: {
    eth: string;
    sol: string;
  };
}

export function SendModal({ isOpen, onClose, balances }: SendModalProps) {
  const { sendTransaction, user } = useAuth();
  const privyId = user?.id;

  const [step, setStep] = useState<1 | 2>(1);
  const [chain, setChain] = useState<'ethereum' | 'solana'>('ethereum');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Address Book state
  const [savedWallets, setSavedWallets] = useState<any[]>([]);
  const [isSavingWallet, setIsSavingWallet] = useState(false);
  const [walletLabel, setWalletLabel] = useState('');

  const isSendEnabled = process.env.NEXT_PUBLIC_ENABLE_SEND === 'true';

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

    if (chain === 'ethereum' && !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("L'adresse Ethereum n'est pas valide.");
      return;
    }
    if (chain === 'solana' && address.length < 32) {
      setError("L'adresse Solana n'est pas valide.");
      return;
    }

    const currentBalance = chain === 'ethereum' ? balances.eth : balances.sol;
    if (Number(amount) > Number(currentBalance)) {
      setError('Solde insuffisant.');
      return;
    }

    // Save wallet to address book if requested
    if (isSavingWallet && walletLabel && privyId) {
      try {
        await saveWallet(privyId, address, chain, walletLabel);
      } catch (err) {
        console.error('Failed to save wallet:', err);
      }
    }

    setStep(2);
  };

  const handleSend = async () => {
    setIsSending(true);
    setError('');

    try {
      if (chain === 'ethereum') {
        const weiAmount = BigInt(Math.floor(Number(amount) * 1e18));
        const hexAmount = '0x' + weiAmount.toString(16);

        const txConfig = {
          to: address,
          value: hexAmount,
          chainId: 1, // Ethereum mainnet — cohérent avec les soldes affichés
        };

        const txReceipt = await sendTransaction(txConfig);
        console.log('Transaction envoyée :', txReceipt);

        onClose();
        setStep(1);
        setAddress('');
        setAmount('');
        setIsSavingWallet(false);
        setWalletLabel('');
      } else {
        setError("L'envoi Solana est en cours d'intégration.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Erreur lors de l'envoi de la transaction.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSelectSavedWallet = (savedAddr: string, savedChain: string) => {
    setAddress(savedAddr);
    setChain(savedChain as 'ethereum' | 'solana');
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Réseau</label>
              <select
                value={chain}
                onChange={(e) => setChain(e.target.value as any)}
                className="w-full bg-[#1a1c2e] border border-white/15 text-white rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ethereum">Ethereum</option>
                <option value="solana" disabled>Solana (bientôt)</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-300">Destinataire</label>
                {savedWallets.length > 0 && (
                  <select
                    className="text-xs bg-[#1a1c2e] border border-white/15 rounded p-1 text-indigo-300 outline-none"
                    onChange={(e) => {
                      if(e.target.value) {
                        const w = savedWallets.find(sw => sw.address === e.target.value);
                        if(w) handleSelectSavedWallet(w.address, w.network);
                      }
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
                placeholder="0x..."
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
                  Solde: {chain === 'ethereum' ? balances.eth || '0' : balances.sol || '0'} {chain === 'ethereum' ? 'ETH' : 'SOL'}
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
                  <span className="text-gray-400 font-medium text-sm uppercase">{chain === 'ethereum' ? 'ETH' : 'SOL'}</span>
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
                {amount} <span className="text-xl text-gray-400 uppercase">{chain === 'ethereum' ? 'ETH' : 'SOL'}</span>
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">De (Réseau)</span>
                  <span className="font-medium text-white capitalize">{chain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Vers</span>
                  <span className="font-medium text-white font-mono text-xs w-32 truncate" title={address}>
                    {address.substring(0, 8)}...{address.substring(address.length - 6)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-gray-400">Frais réseau estimés</span>
                  <span className="font-medium text-white">~ 0.0001 {chain === 'ethereum' ? 'ETH' : 'SOL'}</span>
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
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Envoi...</>
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
