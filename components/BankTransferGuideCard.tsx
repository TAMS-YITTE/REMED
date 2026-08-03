'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export function BankTransferGuideCard() {
  const [showGuide, setShowGuide] = useState(true);

  return (
    <div className="bg-[#2d3152] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowGuide(!showGuide)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              💡 Comment payer par virement sans aucun frais de carte ?
            </h3>
            <p className="text-xs text-gray-400">Guide pas-à-pas pour recharger MoonPay sans frais bancaires</p>
          </div>
        </div>
        <button type="button" className="text-indigo-300 hover:text-white p-2">
          {showGuide ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {showGuide && (
        <div className="mt-6 pt-5 border-t border-white/10 space-y-6 text-sm text-gray-300">
          <p className="text-gray-300 leading-relaxed">
            Pour éviter les frais de carte bancaire (généralement 2 à 4 %), vous pouvez alimenter votre <strong>MoonPay Balance</strong> par virement bancaire sans aucun frais de carte :
          </p>

          {/* IMAGE DÉBUT : SELECTION MOONPAY BALANCE */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#1e2038] p-3 text-center shadow-lg">
            <img
              src="/guide-moonpay-balance.png"
              alt="MoonPay Balance Top up"
              className="mx-auto max-h-64 rounded-xl object-contain"
            />
            <p className="text-xs text-indigo-300 mt-2.5 font-semibold">
              1. Choisissez <strong>MoonPay Balance</strong> et cliquez sur le bouton violet <strong>"Top up"</strong>
            </p>
          </div>

          {/* ÉTAPES PAS À PAS */}
          <ol className="space-y-3 list-decimal pl-5 text-xs text-gray-300 leading-relaxed font-medium">
            <li>Cliquez sur <strong>Payer avec MoonPay</strong> puis sur le menu déroulant du moyen de paiement.</li>
            <li>Dans la section <strong>MoonPay Balance</strong>, cliquez sur le bouton violet <strong>Top up</strong>.</li>
            <li>Cliquez sur la <strong>roue crantée ⚙️ (Settings)</strong> située en haut à droite.</li>
            <li>Allez dans <strong>Payment methods</strong> ➔ <strong>Add new</strong> ➔ sélectionnez <strong>Easy Bank Transfers</strong>.</li>
            <li>Sélectionnez votre banque et validez votre virement instantané sans aucun frais !</li>
          </ol>

          {/* IMAGE FIN : SELECTION BANQUE */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#1e2038] p-3 text-center shadow-lg">
            <img
              src="/guide-connect-bank.png"
              alt="Sélection Banque Française"
              className="mx-auto max-h-64 rounded-xl object-contain"
            />
            <p className="text-xs text-indigo-300 mt-2.5 font-semibold">
              2. Sélectionnez votre banque (BoursoBank, BNP Paribas, Caisse d'Épargne...)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
