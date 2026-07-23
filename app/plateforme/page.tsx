'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function PlateformePage() {
  return (
    <main className="bg-[#252844] text-white min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <section className="pt-16 pb-12 px-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Comment fonctionne <span className="text-indigo-400">Remedly</span> ?
        </h1>
        <p className="text-lg text-gray-300">
          Nous avons repensé l'achat de cryptomonnaies pour le rendre aussi simple qu'un achat en ligne classique, sans compromis sur votre sécurité.
        </p>
      </section>

      {/* 1. Parcours d'achat en 4 étapes */}
      <section className="py-16 px-6 bg-[#2E3152] border-y border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Le parcours le plus rapide du marché</h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Ligne connectrice visible sur desktop */}
            <div className="hidden md:block absolute top-8 left-1/8 right-1/8 h-0.5 bg-indigo-500/30 z-0"></div>

            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto bg-[#252844] border-2 border-indigo-500/50 text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">1</div>
              <h3 className="font-bold text-lg mb-2">Choisir</h3>
              <p className="text-sm text-gray-300">Sélectionnez votre cryptomonnaie parmi celles disponibles et le montant en euros.</p>
            </div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto bg-[#252844] border-2 border-indigo-500/50 text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">2</div>
              <h3 className="font-bold text-lg mb-2">S'identifier</h3>
              <p className="text-sm text-gray-300">Entrez votre e-mail. Un portefeuille sécurisé est créé instantanément, sans mot de passe à retenir.</p>
            </div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto bg-[#252844] border-2 border-indigo-500/50 text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">3</div>
              <h3 className="font-bold text-lg mb-2">Payer</h3>
              <p className="text-sm text-gray-300">Optez pour le <strong>virement bancaire</strong> (recommandé pour réduire vos frais) ou payez instantanément par Carte Bancaire/Apple Pay.</p>
            </div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 mx-auto bg-[#252844] border-2 border-indigo-500/50 text-indigo-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4 shadow-sm">4</div>
              <h3 className="font-bold text-lg mb-2">Recevoir</h3>
              <p className="text-sm text-gray-300">Vos cryptos arrivent en quelques minutes directement dans votre portefeuille privé.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Section wallet non-custodial */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <div className="inline-block bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
                Sécurité Absolue
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">Le portefeuille invisible</h2>
              <p className="text-indigo-100/80 text-lg leading-relaxed mb-6">
                L'absence de "Seed Phrase" (les fameux 24 mots à noter sur un papier) est notre plus grande force. Votre portefeuille est 100% non-custodial et auto-hébergé : il n'appartient qu'à vous. 
              </p>
              <ul className="space-y-3 text-sm text-indigo-100/70">
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Récupérable via un simple e-mail sécurisé</li>
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Nous n'avons jamais accès à vos fonds</li>
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Infrastructure cryptographique certifiée (Privy)</li>
              </ul>
            </div>
            <div className="flex justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full animate-[spin_8s_linear_infinite] opacity-20 blur-xl"></div>
                <div className="absolute inset-4 bg-gray-900 rounded-full border border-indigo-500/30 flex items-center justify-center shadow-inner">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📩</div>
                    <div className="text-xs text-indigo-300 font-medium uppercase tracking-wider">Votre E-mail</div>
                    <div className="my-2 h-4 border-l-2 border-dashed border-indigo-500/50 mx-auto w-0"></div>
                    <div className="text-3xl">🔐</div>
                    <div className="text-xs text-indigo-300 font-medium uppercase tracking-wider mt-1">Votre Coffre</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Cryptos disponibles */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Une offre qui s'élargit, toujours vérifiée</h2>
          <p className="text-gray-400 mb-12">9 cryptomonnaies sont aujourd'hui disponibles à l'achat. Certaines, comme Bitcoin, Ethereum ou Solana, sont des valeurs établies de l'écosystème ; d'autres, comme Shiba Inu, sont bien plus spéculatives et volatiles — informez-vous avant d'investir.</p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/btc.svg" alt="Bitcoin" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">Bitcoin (BTC)</h3>
              <p className="text-sm text-gray-400 mt-2">L'or numérique. Idéal pour conserver de la valeur sur le long terme.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/eth.svg" alt="Ethereum" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">Ethereum (ETH)</h3>
              <p className="text-sm text-gray-400 mt-2">L'ordinateur mondial. L'infrastructure principale du Web3 et de la DeFi.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/sol.svg" alt="Solana" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">Solana (SOL)</h3>
              <p className="text-sm text-gray-400 mt-2">La vitesse pure. Des transactions instantanées pour des frais minimes.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/usdc.svg" alt="USDC" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">USD Coin (USDC)</h3>
              <p className="text-sm text-gray-400 mt-2">Un stablecoin adossé au dollar, utile pour se mettre à l'abri de la volatilité.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/avax.svg" alt="Avalanche" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">Avalanche (AVAX)</h3>
              <p className="text-sm text-gray-400 mt-2">Une blockchain rapide et peu coûteuse pour les applications décentralisées.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/link.svg" alt="Chainlink" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">Chainlink (LINK)</h3>
              <p className="text-sm text-gray-400 mt-2">Un réseau d'oracles qui connecte la blockchain aux données du monde réel.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/matic.svg" alt="Polygon" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">Polygon (MATIC)</h3>
              <p className="text-sm text-gray-400 mt-2">Un réseau conçu pour rendre Ethereum plus rapide et moins cher à utiliser.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/uni.svg" alt="Uniswap" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">Uniswap (UNI)</h3>
              <p className="text-sm text-gray-400 mt-2">Le jeton du plus grand échange décentralisé de cryptomonnaies.</p>
            </div>
            <div className="p-6 border border-white/10 rounded-2xl bg-[#2E3152] flex flex-col items-center">
              <img src="/shib.svg" alt="Shiba Inu" className="w-16 h-16 mb-4" />
              <h3 className="font-bold text-lg">Shiba Inu (SHIB)</h3>
              <p className="text-sm text-gray-400 mt-2">Un memecoin très populaire mais hautement spéculatif — pas un investissement de long terme.</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-10">
            Bientôt disponibles : Ripple (XRP), Cardano (ADA), Dogecoin (DOGE), Litecoin (LTC), Polkadot (DOT) et Cosmos (ATOM), le temps d'intégrer un portefeuille compatible avec leurs réseaux respectifs.
          </p>
        </div>
      </section>

      {/* 4. Comparatif */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">Pourquoi choisir Remedly ?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-gray-400 font-semibold w-1/3"></th>
                <th className="p-4 font-bold text-white w-1/3">Remedly</th>
                <th className="p-4 text-gray-500 font-semibold w-1/3">Exchange Classique</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-white/10">
                <td className="p-4 font-medium text-gray-300">Propriété des fonds</td>
                <td className="p-4 text-green-400 font-semibold flex items-center gap-2">✓ Vous seul (Non-custodial)</td>
                <td className="p-4 text-gray-500">✗ La plateforme (Custodial)</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-4 font-medium text-gray-300">Création du wallet</td>
                <td className="p-4 text-green-400 font-semibold flex items-center gap-2">✓ Automatique (E-mail)</td>
                <td className="p-4 text-gray-500">✗ Complexe ou Inexistant</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-4 font-medium text-gray-300">Complexité d'achat</td>
                <td className="p-4 text-green-400 font-semibold flex items-center gap-2">✓ 3 clics, interface épurée</td>
                <td className="p-4 text-gray-500">✗ Interface de trading complexe</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="p-4 font-medium text-gray-300">Frais d'achat par carte</td>
                <td className="p-4 text-white font-semibold">~1.99% (Transparents)</td>
                <td className="p-4 text-gray-500">De 1.5% à 4% (Frais cachés fréquents)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Statut réglementaire */}
      <section className="py-12 px-6 bg-[#2E3152] border-t border-white/10 text-sm text-gray-300">
        <div className="max-w-4xl mx-auto">
          <h3 className="font-bold text-white mb-3 text-center">Un cadre légal strict et transparent</h3>
          <p className="mb-4 text-justify">
            <strong>Statut Réglementaire :</strong> Remedly édite exclusivement une interface logicielle et agit en qualité d'apporteur d'affaires. Remedly n'est ni un Prestataire de Services sur Actifs Numériques (PSAN) au sens de l'AMF, ni un prestataire CASP au sens de MiCA. Remedly ne fournit aucun conseil en investissement, n'exécute pas d'ordres sur actifs numériques et ne conserve à aucun moment les fonds ou les clés privées de ses utilisateurs.
          </p>
          <p className="text-justify">
            La création et la sécurisation des portefeuilles non-hébergés (non-custodial wallets) sont opérées par <strong>Privy</strong>. Les services d'achat d'actifs numériques par carte bancaire ou virement sont exclusivement fournis par <strong></strong> et <strong>MoonPay</strong>, partenaires dûment enregistrés et réglementés pour fournir ces services dans les juridictions applicables.
          </p>
        </div>
      </section>

      {/* 6. CTA final */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">Prêt à investir simplement ?</h2>
        <Link href="/acheter" className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-[0_8px_20px_rgb(79,70,229,0.5)] hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200">
          Acheter mes premières cryptos
        </Link>
      </section>

      <Footer />
    </main>
  );
}
