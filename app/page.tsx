'use client';

import { AuthButton } from '@/components/AuthButton';
import Link from 'next/link';
import { FormEvent, useState } from 'react';

export default function Home() {
  const [heroSuccess, setHeroSuccess] = useState(false);
  const [bottomSuccess, setBottomSuccess] = useState(false);

  const handleWaitlist = async (e: FormEvent<HTMLFormElement>, isHero: boolean) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const btn = form.querySelector('button');

    if (btn) {
      btn.textContent = '...';
      btn.disabled = true;
    }

    try {
      // Remplacer par un vrai endpoint
      await new Promise(r => setTimeout(r, 500));
      if (isHero) setHeroSuccess(true);
      else setBottomSuccess(true);
    } catch (e) {
      if (btn) {
        btn.textContent = 'Réessaie →';
        btn.disabled = false;
      }
    }
  };

  return (
    <main className="bg-white text-gray-900">
      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-200 sticky top-0 bg-white z-10">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 no-underline">
          rem<span className="text-[#534AB7]">e</span>dly
        </Link>
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </nav>

      {/* Bandeau MiCA */}
      <div className="bg-[#FFF3CD] border-l-4 border-[#F7931A] px-4 py-2.5 text-[13px] text-gray-700">
        Les crypto-actifs sont des investissements à risque élevé. Vous pouvez perdre tout ou partie des sommes investies. Remedly ne fournit pas de conseil en investissement.
      </div>

      {/* HERO */}
      <section className="pt-20 pb-16 px-6 text-center max-w-[620px] mx-auto">
        <div className="inline-block bg-[#EEEDFE] text-[#3C3489] text-xs font-medium px-3.5 py-1 rounded-full mb-6 tracking-wide">
          Bientôt disponible en France
        </div>
        <h1 className="text-[clamp(36px,7vw,52px)] font-semibold leading-tight tracking-tight text-gray-900 mb-5">
          La crypto,<br /><em className="not-italic text-[#534AB7]">simplement.</em>
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed mb-10">
          Achète Bitcoin, Ethereum et plus encore en quelques minutes. Sans jargon, sans prise de tête.
        </p>

        {!heroSuccess ? (
          <>
            <form className="flex flex-col sm:flex-row gap-2 max-w-[400px] mx-auto mb-3" onSubmit={(e) => handleWaitlist(e, true)}>
              <input type="email" name="email" placeholder="ton@email.com" required className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-[#534AB7] transition-colors" />
              <button type="submit" className="bg-[#534AB7] text-white border-none px-5 py-2.5 rounded-lg text-[15px] font-medium cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity">
                Je veux accéder →
              </button>
            </form>
            <p className="text-[13px] text-gray-400">Gratuit · Accès prioritaire au lancement</p>
          </>
        ) : (
          <div className="bg-[#EAF3DE] text-[#3B6D11] px-4 py-2.5 rounded-lg text-sm max-w-[400px] mx-auto">
            ✓ Tu es sur la liste ! On te prévient en premier dès le lancement.
          </div>
        )}
      </section>

      {/* ÉTAPES */}
      <div className="flex flex-wrap items-center justify-center gap-6 py-10 px-6 border-y border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EEEDFE] text-[#534AB7] flex items-center justify-center text-[13px] font-semibold shrink-0">1</div>
          <div className="text-sm text-gray-600 font-medium">Crée ton compte</div>
        </div>
        <div className="hidden sm:block text-gray-200 text-xl">→</div>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EEEDFE] text-[#534AB7] flex items-center justify-center text-[13px] font-semibold shrink-0">2</div>
          <div className="text-sm text-gray-600 font-medium">Choisis ta crypto</div>
        </div>
        <div className="hidden sm:block text-gray-200 text-xl">→</div>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EEEDFE] text-[#534AB7] flex items-center justify-center text-[13px] font-semibold shrink-0">3</div>
          <div className="text-sm text-gray-600 font-medium">Paie par CB ou virement</div>
        </div>
        <div className="hidden sm:block text-gray-200 text-xl">→</div>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#EEEDFE] text-[#534AB7] flex items-center justify-center text-[13px] font-semibold shrink-0">4</div>
          <div className="text-sm text-gray-600 font-medium">Reçois tes crypto</div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-gray-200">
        <div className="p-8 md:border-r border-b md:border-b-0 border-gray-200">
          <div className="w-9 h-9 bg-[#EEEDFE] rounded-lg flex items-center justify-center mb-4 text-lg">🔐</div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">Wallet automatique</h3>
          <p className="text-sm text-gray-600 leading-relaxed">Un wallet sécurisé est créé pour toi à l'inscription. Pas de seed phrase à noter, pas de configuration.</p>
        </div>
        <div className="p-8 md:border-r border-b md:border-b-0 border-gray-200">
          <div className="w-9 h-9 bg-[#EEEDFE] rounded-lg flex items-center justify-center mb-4 text-lg">💶</div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">Frais transparents</h3>
          <p className="text-sm text-gray-600 leading-relaxed">Tu vois exactement ce que tu paies avant de confirmer. Aucune surprise cachée dans le spread.</p>
        </div>
        <div className="p-8">
          <div className="w-9 h-9 bg-[#EEEDFE] rounded-lg flex items-center justify-center mb-4 text-lg">💬</div>
          <h3 className="text-[15px] font-semibold text-gray-900 mb-1.5">Support humain</h3>
          <p className="text-sm text-gray-600 leading-relaxed">Une question ? Une vraie personne te répond en moins d'une heure. Pas un bot, pas un ticket.</p>
        </div>
      </div>

      {/* TOKENS */}
      <div className="py-10 px-6 text-center border-b border-gray-200 bg-[#f9f9f8]">
        <p className="text-[13px] text-gray-400 mb-4 uppercase tracking-wider">Disponible au lancement</p>
        <div className="flex justify-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600">
            <div className="w-2 h-2 rounded-full bg-[#F7931A]"></div>Bitcoin
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600">
            <div className="w-2 h-2 rounded-full bg-[#627EEA]"></div>Ethereum
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600">
            <div className="w-2 h-2 rounded-full bg-[#9945FF]"></div>Solana
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600">
            <div className="w-2 h-2 rounded-full bg-[#534AB7]"></div>Monad
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>+ 20 autres
          </div>
        </div>
      </div>

      {/* SOCIAL PROOF */}
      <div className="py-12 px-6 text-center max-w-[560px] mx-auto">
        <blockquote className="text-lg text-gray-600 leading-relaxed italic mb-4">
          "J'avais peur de me lancer dans la crypto. Remedly m'a rendu ça aussi simple qu'un virement bancaire."
        </blockquote>
        <cite className="text-[13px] text-gray-400 not-italic">— Bêta-testeur, Lyon</cite>
      </div>

      {/* CTA BAS */}
      <div className="bg-[#534AB7] py-16 px-6 text-center">
        <h2 className="text-[28px] font-semibold text-white tracking-tight mb-3">Prêt à te lancer ?</h2>
        <p className="text-white/75 mb-8 text-base">Rejoins la liste d'attente et accède en premier dès le lancement.</p>
        
        {!bottomSuccess ? (
          <>
            <form className="flex flex-col sm:flex-row gap-2 max-w-[380px] mx-auto mb-3" onSubmit={(e) => handleWaitlist(e, false)}>
              <input type="email" name="email" placeholder="ton@email.com" required className="flex-1 px-3.5 py-2.5 bg-white/15 border border-white/30 rounded-lg text-[15px] text-white outline-none placeholder:text-white/50 focus:border-white transition-colors" />
              <button type="submit" className="bg-white text-[#534AB7] border-none px-5 py-2.5 rounded-lg text-[15px] font-medium cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity">
                Je veux accéder →
              </button>
            </form>
            <p className="text-[13px] text-white/50">Gratuit · Sans engagement</p>
          </>
        ) : (
          <div className="bg-white/15 text-white px-4 py-2.5 rounded-lg text-sm max-w-[380px] mx-auto">
            ✓ Tu es sur la liste !
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="py-6 px-8 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
        <Link href="/" className="text-[15px] font-semibold text-gray-900 no-underline">
          rem<span className="text-[#534AB7]">e</span>dly
        </Link>
        <p className="text-[13px] text-gray-400">© 2026 Remedly · remedly.fr · contact@remedly.fr</p>
      </footer>
    </main>
  );
}
