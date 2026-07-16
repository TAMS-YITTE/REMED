'use client';

import { useState, useEffect } from 'react';
import { AuthButton } from '@/components/AuthButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  const [eurAmount, setEurAmount] = useState<string>('100');
  const ethPrice = 3100; // Mock price for UI
  const feeRate = 0.0199; // 1.99%
  const feeAmount = Number(eurAmount) * feeRate;
  const netAmount = Number(eurAmount) - feeAmount;
  const cryptoAmount = netAmount > 0 ? (netAmount / ethPrice).toFixed(4) : '0.0000';

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Mes fonds sont-ils en sécurité ?",
      a: "Oui. Nous utilisons la technologie 'Embedded Wallet' (fournie par Privy). Vos portefeuilles sont 100% non-custodial, ce qui signifie que vous seul y avez accès. Nous ne détenons jamais vos cryptos ni vos clés privées."
    },
    {
      q: "Combien de temps prend un achat ?",
      a: "Avec l'Apple Pay ou la carte bancaire, l'achat est instantané. Avec le virement bancaire classique, cela peut prendre de 1 à 3 jours ouvrés selon votre banque."
    },
    {
      q: "Quel est le montant minimum d'achat ?",
      a: "Vous pouvez commencer à investir à partir de 30€ seulement. Idéal pour tester notre plateforme sans engagement."
    },
    {
      q: "Comment récupérer mon compte si je change de téléphone ?",
      a: "Votre compte est lié à votre adresse e-mail ou compte Google. Il n'y a aucune 'phrase de récupération' (seed phrase) complexe à mémoriser. Il vous suffit de vous reconnecter avec le même e-mail."
    }
  ];

  return (
    <main className="bg-[#fafafa] text-gray-900 min-h-screen flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* NAVIGATION */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-gray-200/50 sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tighter text-gray-900 no-underline">
            rem<span className="text-indigo-600">e</span>dly
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-indigo-600">Accueil</Link>
            <Link href="/apprendre" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Apprendre</Link>
            <Link href="/acheter" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Acheter</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </nav>

      {/* Bandeau MiCA */}
      <div className="bg-[#FFF3CD] border-l-4 border-[#F7931A] px-4 py-2.5 text-[12px] md:text-[13px] text-gray-700 font-medium flex items-center justify-center gap-2">
        <span>⚠️ Les crypto-actifs sont très volatils. Vous pouvez perdre votre capital.</span>
      </div>

      {/* HERO SECTION PREMIUM */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-transparent rounded-[100%] blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* TEXT BLOCK */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Disponible en France
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-gray-900 mb-6">
              La crypto,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                simplement.
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
              Achetez Bitcoin, Ethereum et plus encore en 3 clics. Sans phrase de récupération complexe, avec une sécurité bancaire.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/acheter" className="flex items-center justify-center gap-2 bg-indigo-600 text-white border-none px-6 py-4 rounded-xl text-base font-semibold shadow-[0_8px_20px_rgb(79,70,229,0.3)] hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200">
                Acheter maintenant
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
              <Link href="/apprendre" className="flex items-center justify-center bg-white text-gray-700 border border-gray-200 px-6 py-4 rounded-xl text-base font-semibold hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                Découvrir la plateforme
              </Link>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
              <div className="flex -space-x-2">
                <img className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="User" />
                <img className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" src="https://api.dicebear.com/7.x/notionists/svg?seed=Aneka" alt="User" />
                <img className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" src="https://api.dicebear.com/7.x/notionists/svg?seed=Leo" alt="User" />
              </div>
              <p>Rejoignez plus de <strong className="text-gray-900">10 000</strong> utilisateurs</p>
            </div>
          </motion.div>

          {/* SIMULATOR BLOCK */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-md mx-auto lg:ml-auto relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20 transform rotate-3"></div>
            
            <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl p-8 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">Simulateur Rapide</h3>
                <span className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Live
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/50 hover:border-indigo-300 transition-colors">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Vous payez</label>
                  <div className="flex items-center justify-between">
                    <input 
                      type="number" 
                      value={eurAmount}
                      onChange={(e) => setEurAmount(e.target.value)}
                      className="bg-transparent text-3xl font-bold text-gray-900 w-full outline-none"
                      placeholder="0"
                    />
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm font-semibold text-gray-900">
                      🇪🇺 EUR
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                  <div className="bg-white p-1 rounded-full border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 text-gray-400 p-2 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Vous recevez</label>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-indigo-900 truncate pr-4">
                      {cryptoAmount}
                    </div>
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm font-semibold text-gray-900 shrink-0">
                      <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025" alt="ETH" className="w-5 h-5" />
                      ETH
                    </div>
                  </div>
                </div>
              </div>

              {/* Encadrement des frais mis en avant */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Taux estimé</span>
                  <span className="font-medium">1 ETH = {ethPrice} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frais transparents (~1.99%)</span>
                  <span className="font-medium">{feeAmount > 0 ? feeAmount.toFixed(2) : '0.00'} €</span>
                </div>
              </div>

              <Link 
                href={`/acheter?crypto=eth`}
                className="w-full mt-6 bg-gray-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
              >
                Continuer l'achat
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PARTNERS / SOCIAL PROOF */}
      <section className="py-10 border-y border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Ils sécurisent vos transactions
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mastercard_logo.svg/1200px-Mastercard_logo.svg.png" alt="Mastercard" className="h-8 object-contain" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 object-contain" />
            <span className="text-xl font-black text-gray-800">Transak</span>
            <span className="text-xl font-black text-gray-800 tracking-tighter">MoonPay</span>
            <span className="text-xl font-bold text-gray-800">Privy</span>
          </div>
        </div>
      </section>

      {/* FEATURES PREMIUM */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Pourquoi choisir Remedly ?</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Nous avons repensé l'expérience d'achat pour la rendre accessible à tous, sans compromis sur la sécurité.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-blue-100">🛡️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité Bancaire</h3>
            <p className="text-gray-600 leading-relaxed">
              Votre portefeuille non-custodial est créé automatiquement. Vous êtes le seul maître de vos fonds, sans avoir à gérer de clés complexes.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-purple-100">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Instantané</h3>
            <p className="text-gray-600 leading-relaxed">
              Achetez par carte bancaire ou Apple Pay en moins de 2 minutes. Vos cryptos arrivent directement sur votre portefeuille personnel.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-green-100">💶</div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Frais Transparents</h3>
            <p className="text-gray-600 leading-relaxed">
              Pas de spread caché ni de mauvaises surprises. Nos partenaires réglementés appliquent des frais transparents d'environ 1.99%.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions fréquentes</h2>
            <p className="text-gray-500">Tout ce que vous devez savoir avant de vous lancer.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <span className={`text-indigo-600 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm">
              Vous avez d'autres questions ? <br/> Consultez notre <Link href="/apprendre" className="text-indigo-600 font-semibold hover:underline">Espace Apprendre</Link> ou contactez notre support.
            </p>
          </div>
        </div>
      </section>

      {/* CTA BAS */}
      <div className="bg-gray-900 py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 to-transparent"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">Prêt à sécuriser votre avenir ?</h2>
          <p className="text-gray-300 mb-10 text-lg">Rejoignez la révolution financière en quelques clics. Inscription gratuite.</p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/acheter" className="bg-indigo-600 text-white border-none px-8 py-4 rounded-xl text-base font-semibold hover:bg-indigo-500 hover:-translate-y-0.5 transition-all duration-200 shadow-lg">
              Créer mon compte
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
