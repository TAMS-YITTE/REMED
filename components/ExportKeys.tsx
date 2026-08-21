'use client';

import { useState } from 'react';
import { useExportWallet } from '@privy-io/react-auth';
import { useExportWallet as useExportSolanaWallet } from '@privy-io/react-auth/solana';
import { useExportWallet as useExportBitcoinWallet } from '@privy-io/react-auth/extended-chains';

interface ExportKeysProps {
  walletAddress?: string;
  solanaWalletAddress?: string;
  bitcoinWalletAddress?: string;
}

// Récupérer ses clés est le corollaire du "non-custodial" : sans ce bouton,
// l'utilisateur dépend entièrement de l'interface de Remedly pour disposer
// de ses fonds. La clé est affichée par Privy dans une iframe hébergée sur
// un autre domaine — le code de Remedly ne peut pas la lire.
export function ExportKeys({ walletAddress, solanaWalletAddress, bitcoinWalletAddress }: ExportKeysProps) {
  const { exportWallet: exportEvm } = useExportWallet();
  const { exportWallet: exportSolana } = useExportSolanaWallet();
  const { exportWallet: exportBitcoin } = useExportBitcoinWallet();

  const [error, setError] = useState('');
  const [pending, setPending] = useState('');

  const run = async (label: string, action: () => Promise<void>) => {
    setError('');
    setPending(label);
    try {
      await action();
    } catch (e: any) {
      // Un échec doit se voir : c'est exactement le symptôme qui a fait
      // perdre du temps sur l'envoi (fenêtre Privy qui n'aboutit pas).
      setError(e?.message || "L'export n'a pas pu s'ouvrir. Réessayez, ou depuis un autre navigateur.");
    } finally {
      setPending('');
    }
  };

  const rows = [
    { label: 'Ethereum / EVM', address: walletAddress, action: () => exportEvm({ address: walletAddress! }) },
    { label: 'Solana', address: solanaWalletAddress, action: () => exportSolana({ address: solanaWalletAddress! }) },
    { label: 'Bitcoin (Taproot)', address: bitcoinWalletAddress, action: () => exportBitcoin({ address: bitcoinWalletAddress! }) },
  ].filter((r) => Boolean(r.address));

  if (rows.length === 0) return null;

  return (
    <div className="bg-[#2E3152] border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Exporter mes clés privées</h3>
      <p className="text-sm text-gray-400 mb-4">
        Récupérez la clé d'une de vos adresses pour l'importer dans un autre portefeuille
        (Phantom, MetaMask, Sparrow…). Vos fonds vous appartiennent, et restent accessibles
        même sans Remedly.
      </p>

      <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg p-3 text-xs mb-4">
        <span className="text-sm shrink-0">⚠️</span>
        <span>
          <strong>Une clé privée ne se partage jamais.</strong> Quiconque l'obtient contrôle
          définitivement l'adresse et peut vider les fonds. Ne la saisissez que dans un
          portefeuille que vous installez vous-même, jamais sur un site qui vous la demande.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <button
            key={row.label}
            onClick={() => run(row.label, row.action)}
            disabled={Boolean(pending)}
            className="flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-lg p-3 text-left transition-colors"
          >
            <span className="text-sm text-white">{row.label}</span>
            <span className="text-xs text-indigo-300">
              {pending === row.label ? 'Ouverture…' : 'Exporter la clé'}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
