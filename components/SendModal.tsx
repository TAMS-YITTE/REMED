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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">⚠️</div>
          <h3 className="text-lg font-bold mb-2">Fonctionnalité désactivée</h3>
          <p className="text-gray-500 mb-6">L'envoi de fonds est temporairement désactivé sur cet environnement.</p>
          <button onClick={onClose} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200">Fermer</button>
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
          chainId: 11155111,
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">Envoyer des cryptos</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            ✕
          </button>
        </div>

        {step === 1 ? (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Réseau</label>
              <select 
                value={chain} 
                onChange={(e) => setChain(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ethereum">Ethereum (Testnet)</option>
                <option value="solana">Solana (Devnet)</option>
              </select>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Destinataire</label>
                {savedWallets.length > 0 && (
                  <select 
                    className="text-xs bg-gray-50 border border-gray-200 rounded p-1 text-indigo-600 outline-none"
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
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
              />
              
              {!savedWallets.find(w => w.address === address) && address.length > 10 && (
                <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isSavingWallet}
                      onChange={(e) => setIsSavingWallet(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">Sauvegarder dans mon carnet</span>
                  </label>
                  {isSavingWallet && (
                    <input 
                      type="text" 
                      placeholder="Nom (ex: Mon Ledger)" 
                      value={walletLabel}
                      onChange={(e) => setWalletLabel(e.target.value)}
                      className="mt-2 w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-medium text-gray-700">Montant</label>
                <span className="text-xs text-gray-500">
                  Solde: {chain === 'ethereum' ? balances.eth || '0' : balances.sol || '0'} {chain === 'ethereum' ? 'ETH' : 'SOL'}
                </span>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span className="text-gray-500 font-medium text-sm uppercase">{chain === 'ethereum' ? 'ETH' : 'SOL'}</span>
                </div>
              </div>
            </div>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

            <button 
              onClick={handleNext}
              className="w-full bg-[#534AB7] text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              Continuer
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              <p className="text-center text-sm text-gray-500 mb-1">Vous allez envoyer</p>
              <p className="text-center text-3xl font-bold text-gray-900 mb-6">
                {amount} <span className="text-xl text-gray-500 uppercase">{chain === 'ethereum' ? 'ETH' : 'SOL'}</span>
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">De (Réseau)</span>
                  <span className="font-medium text-gray-900 capitalize">{chain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vers</span>
                  <span className="font-medium text-gray-900 font-mono text-xs w-32 truncate" title={address}>
                    {address.substring(0, 8)}...{address.substring(address.length - 6)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-200">
                  <span className="text-gray-500">Frais réseau estimés</span>
                  <span className="font-medium text-gray-900">~ 0.0001 {chain === 'ethereum' ? 'ETH' : 'SOL'}</span>
                </div>
              </div>
            </div>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

            <div className="flex gap-3">
              <button 
                onClick={() => setStep(1)}
                disabled={isSending}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
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

