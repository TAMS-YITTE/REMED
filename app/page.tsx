'use client';

import { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { getCryptoPrices, CryptoPrices } from '@/app/actions/prices';
import { MarketTrends } from '@/components/MarketTrends';
import { CryptoChart } from '@/components/CryptoChart';

// `supported: false` = le wallet Ethereum/Solana/Bitcoin de Privy ne peut pas
// recevoir cet actif (réseau natif incompatible, confirmé via l'API publique
// MoonPay https://api.moonpay.com/v3/currencies : format d'adresse et/ou tag
// de destination différents). Reste visible dans le sélecteur mais désactivé
// tant qu'aucun wallet compatible n'existe côté Privy. Voir lib/cryptoChains.ts.
const cryptoList = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', icon: '/btc.svg', supported: true },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', icon: '/eth.svg', supported: true },
  { id: 'sol', name: 'Solana', symbol: 'SOL', icon: '/sol.svg', supported: true },
  { id: 'usdc', name: 'USDC', symbol: 'USDC', icon: '/usdc.svg', supported: true },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', icon: '/avax.svg', supported: true },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', icon: '/link.svg', supported: true },
  { id: 'pol', name: 'Polygon', symbol: 'POL', icon: '/matic.svg', supported: true },
  { id: 'shib', name: 'Shiba Inu', symbol: 'SHIB', icon: '/shib.svg', supported: true },
  { id: 'uni', name: 'Uniswap', symbol: 'UNI', icon: '/uni.svg', supported: true },
  { id: 'xrp', name: 'Ripple', symbol: 'XRP', icon: '/xrp.svg', supported: false },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', icon: '/ada.svg', supported: false },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', icon: '/dot.png', supported: false },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', icon: '/doge.svg', supported: false },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', icon: '/ltc.svg', supported: false },
  { id: 'atom', name: 'Cosmos', symbol: 'ATOM', icon: '/atom.svg', supported: false }
];

export default function Home() {
  const [eurAmount, setEurAmount] = useState<string>('100');
  const [prices, setPrices] = useState<CryptoPrices | null>(null);
  const [selectedCryptoId, setSelectedCryptoId] = useState<string>('eth');
  
  // Custom Select State
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCryptoPrices().then(p => {
      if (p) setPrices(p);
    });

    // Close select on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCrypto = cryptoList.find(c => c.id === selectedCryptoId) || cryptoList[1];
  const currentPrice = prices ? prices[selectedCryptoId] : 3100; // Fallback
  const feeRate = 0.0199; // 1.99%
  const feeAmount = Number(eurAmount) * feeRate;
  const netAmount = Number(eurAmount) - feeAmount;
  const cryptoAmount = netAmount > 0 && currentPrice ? (netAmount / currentPrice).toFixed(selectedCryptoId === 'btc' ? 5 : 4) : '0.0000';

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredCryptos = cryptoList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 5 cryptos to show when search is empty
  const defaultList = cryptoList.slice(0, 5);
  const listToDisplay = searchQuery ? filteredCryptos : defaultList;

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <main className="bg-[#252844] text-white min-h-screen flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200 pb-20 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      {/* INFO BAR: PARTNERS + MARKET TRENDS */}
      <section className="py-4 border-y border-white/10 bg-[#252844] relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col xl:flex-row items-center justify-between gap-6 xl:gap-12">
          
          {/* Partners */}
          <div className="flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 text-white flex-shrink-0">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest hidden md:inline">
              Sécurisé par
            </span>
            <span className="text-sm font-black">Transak</span>
            <span className="text-sm font-black tracking-tighter">MoonPay</span>
            <span className="text-sm font-bold">Privy</span>
          </div>

          {/* Market Trends */}
          <div className="flex-1 w-full">
            <MarketTrends />
          </div>

        </div>
      </section>

      {/* HERO SECTION PREMIUM */}
      <section className="relative pt-16 pb-20 md:pt-20 md:pb-24 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-br from-indigo-100/40 via-purple-50/40 to-transparent rounded-[100%] blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* TEXT BLOCK */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-left"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Disponible en France
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-white mb-6">
              La crypto,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                simplement.
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-300 leading-relaxed mb-8 max-w-lg">
              Achetez Bitcoin, Ethereum et plus encore en 3 clics. Sans phrase de récupération complexe, avec une sécurité bancaire.
            </p>

            <div className="hidden md:flex flex-col sm:flex-row gap-4 mb-8">
              <Link href={`/acheter?crypto=${selectedCryptoId}`} className="flex items-center justify-center gap-2 bg-indigo-600 text-white border-none px-6 py-4 rounded-xl text-base font-semibold shadow-[0_8px_20px_rgb(79,70,229,0.3)] hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200">
                Acheter maintenant
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </Link>
              <Link href="/plateforme" className="flex items-center justify-center bg-[#2E3152] text-white border border-white/10 px-6 py-4 rounded-xl text-base font-semibold hover:bg-[#353866] hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
                Découvrir la plateforme
              </Link>
            </div>
            
            <div className="flex flex-col gap-2 mt-6 p-4 bg-[#2E3152]/50 border border-white/10 rounded-xl text-sm text-gray-400 font-medium max-w-lg">
              <p>🚀 Rejoignez-nous en <strong className="text-white">accès anticipé</strong> en attente de la mise en production.</p>
              <p>
                Donnez-nous votre avis anticipé en écrivant à :{' '}
                <a href="mailto:contact@remedly.fr" className="text-indigo-400 hover:text-white transition-colors underline">
                  contact@remedly.fr
                </a>
              </p>
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
            
            <div className="bg-[#2E3152]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white">Simulateur Rapide</h3>
                <span className="flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {prices ? 'Live' : 'Chargement...'}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-[#252844] rounded-2xl p-4 border border-white/10 hover:border-indigo-500/50 transition-colors">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Vous payez</label>
                  <div className="flex items-center justify-between">
                    <input 
                      type="number" 
                      value={eurAmount}
                      onChange={(e) => setEurAmount(e.target.value)}
                      className="bg-transparent text-3xl font-bold text-white w-full outline-none"
                      placeholder="0"
                    />
                    <div className="flex items-center gap-2 bg-[#2E3152] px-3 py-1.5 rounded-xl border border-white/10 shadow-sm font-semibold text-white">
                      🇪🇺 EUR
                    </div>
                  </div>
                </div>

                <div className="flex justify-center -my-3 relative z-10 pointer-events-none">
                  <div className="bg-[#2E3152] p-1 rounded-full border border-white/10 shadow-sm">
                    <div className="bg-[#252844] text-gray-400 p-2 rounded-full">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-500/10 rounded-2xl p-4 border border-indigo-500/20 relative">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">Vous recevez</label>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-indigo-300 truncate pr-4">
                      {cryptoAmount}
                    </div>
                    
                    {/* CUSTOM CRYPTO SELECTOR */}
                    <div className="relative" ref={selectRef}>
                      <button 
                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                        className="flex items-center gap-2 bg-[#2E3152] pl-3 pr-2 py-2 rounded-xl border border-white/10 shadow-sm font-semibold text-white cursor-pointer hover:bg-[#353866] transition-colors outline-none w-[110px]"
                      >
                        <img src={selectedCrypto.icon} alt={selectedCrypto.name} className="w-5 h-5 rounded-full" />
                        <span className="truncate">{selectedCrypto.symbol}</span>
                        <svg className="fill-current h-4 w-4 ml-auto text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </button>

                      <AnimatePresence>
                        {isSelectOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-2 w-64 bg-[#2E3152] border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden"
                          >
                            <div className="p-2 border-b border-white/10">
                              <input 
                                type="text" 
                                placeholder="Rechercher (ex: SOL, Ethereum)..." 
                                className="w-full bg-[#252844] border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                              {!searchQuery && (
                                <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Top Cryptos</div>
                              )}
                              {listToDisplay.length > 0 ? (
                                listToDisplay.map(c => (
                                  <button
                                    key={c.id}
                                    disabled={!c.supported}
                                    onClick={() => {
                                      if (!c.supported) return;
                                      setSelectedCryptoId(c.id);
                                      setIsSelectOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${!c.supported ? 'opacity-40 cursor-not-allowed' : selectedCryptoId === c.id ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-[#353866] text-gray-300'}`}
                                  >
                                    <img src={c.icon} alt={c.name} className="w-6 h-6 rounded-full" />
                                    <div className="flex flex-col">
                                      <span className="font-bold text-sm leading-tight">{c.symbol}</span>
                                      <span className="text-xs opacity-70 leading-tight">{c.name}</span>
                                    </div>
                                    {!c.supported ? (
                                      <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-gray-500">Bientôt</span>
                                    ) : prices && prices[c.id] && (
                                      <span className="ml-auto text-xs font-medium opacity-60">€{prices[c.id]}</span>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="text-center py-6 text-sm text-gray-500">Aucune crypto trouvée</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* Encadrement des frais mis en avant */}
              <div className="mt-6 bg-[#252844] rounded-xl p-4 text-sm border border-white/10">
                <div className="flex justify-between text-gray-400 mb-2">
                  <span>Taux estimé</span>
                  <span className="font-medium">1 {selectedCrypto.name} = {currentPrice ? currentPrice.toFixed(2) : '...'} €</span>
                </div>
                <div className="flex justify-between text-white font-semibold bg-[#2E3152] p-2 rounded-lg border border-white/10 shadow-sm">
                  <span>Frais transparents (~1.99%)</span>
                  <span>{feeAmount > 0 ? feeAmount.toFixed(2) : '0.00'} €</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-center text-xs text-gray-400 mb-3 font-medium">Moyens de paiement acceptés</p>
                <div className="flex justify-center items-center gap-4 opacity-80">
                  <span className="text-sm font-bold font-sans">Apple Pay</span>
                  <span className="text-sm font-bold font-sans italic">VISA</span>
                  <span className="text-sm font-bold font-sans text-indigo-400 border-b-2 border-indigo-500/30">Virement (Recommandé)</span>
                </div>
              </div>

              <Link 
                href={`/acheter?crypto=${selectedCryptoId}`}
                className="w-full mt-6 bg-indigo-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg hidden md:flex"
              >
                Continuer l'achat
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* GRAPH BLOCK */}
      <section className="px-6 max-w-5xl mx-auto -mt-6 mb-12 relative z-20">
        <CryptoChart 
          cryptoId={selectedCrypto.id} 
          cryptoName={selectedCrypto.name} 
          cryptoSymbol={selectedCrypto.symbol}
          currentPrice={prices?.[selectedCrypto.id]} 
        />
      </section>



      {/* BLOC SÉCURITÉ & WALLET MAGIQUE */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-[2rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <div className="inline-block bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
                Innovation Remedly
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Le portefeuille invisible,<br/>la sécurité absolue.</h2>
              <p className="text-indigo-100/80 text-lg leading-relaxed mb-6">
                L'absence de "Seed Phrase" (les 24 mots complexes à mémoriser) est notre plus grande force. Votre portefeuille est 100% non-custodial et auto-hébergé : il n'appartient qu'à vous. 
              </p>
              <ul className="space-y-3 text-sm text-indigo-100/70 mb-8">
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Récupérable via un simple e-mail sécurisé</li>
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Nous n'avons jamais accès à vos fonds</li>
                <li className="flex items-center gap-2"><svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Protégé par une cryptographie de pointe (Privy)</li>
              </ul>
              <Link href="/apprendre/qu-est-ce-qu-un-wallet-non-custodial" className="text-indigo-300 font-semibold hover:text-white transition-colors flex items-center gap-1">
                Comprendre notre technologie <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </Link>
            </div>
            
            <div className="flex justify-center">
              {/* Représentation visuelle abstraite du wallet */}
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

      {/* FEATURES PREMIUM */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Acheter sans compromis</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">Une expérience pensée pour être accessible à tous, tout en respectant les standards bancaires les plus stricts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#2E3152] p-8 rounded-[20px] border border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-indigo-500/30">🛡️</div>
            <h3 className="text-xl font-bold text-white mb-3">Sécurité Bancaire</h3>
            <p className="text-gray-300 leading-relaxed text-sm mb-4">
              Votre portefeuille non-custodial est créé automatiquement. Vous êtes le seul maître de vos fonds.
            </p>
            <Link href="/apprendre/qu-est-ce-qu-un-wallet-non-custodial" className="inline-flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              En savoir plus <span aria-hidden="true" className="ml-1">&rarr;</span>
            </Link>
          </div>
          
          <div className="bg-[#2E3152] p-8 rounded-[20px] border border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-indigo-500/30">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Instantané</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Achetez par carte bancaire ou Apple Pay en moins de 2 minutes. Vos cryptos arrivent directement sur votre compte.
            </p>
          </div>

          <div className="bg-[#2E3152] p-8 rounded-[20px] border border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.2)] hover:shadow-lg transition-shadow">
            <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mb-6 border border-indigo-500/30">💶</div>
            <h3 className="text-xl font-bold text-white mb-3">Frais Transparents</h3>
            <p className="text-gray-300 leading-relaxed text-sm">
              Privilégiez le virement SEPA pour réduire considérablement vos frais par rapport à la carte bancaire. Pas de spread caché.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Questions fréquentes</h2>
            <p className="text-gray-400">Tout ce que vous devez savoir avant de vous lancer.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-white/10 rounded-2xl overflow-hidden bg-[#2E3152]"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-semibold text-white">{faq.q}</span>
                  <span className={`text-indigo-400 transition-transform duration-200 ${openFaq === index ? 'rotate-180' : ''}`}>
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
                      <div className="px-6 pb-6 text-gray-300 leading-relaxed text-sm">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-400 text-sm">
              Vous avez d'autres questions ? <br/> Consultez notre <Link href="/apprendre" className="text-indigo-400 font-semibold hover:underline">Blog</Link> ou contactez notre support.
            </p>
          </div>
        </div>
      </section>

      {/* Bandeau MiCA Premium (Pill) - Moved to bottom */}
      <div className="flex justify-center py-8 px-4 relative z-20 border-t border-white/10 bg-[#252844]">
        <div className="inline-flex items-center gap-2.5 bg-[#2E3152]/80 backdrop-blur-md border border-white/10 shadow-sm px-4 py-2 rounded-full">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-gray-300">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <span className="text-[11px] md:text-[12px] text-gray-300 font-medium tracking-wide">
            L'investissement en crypto-actifs est risqué. Vous pouvez perdre votre capital.
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />

      {/* MOBILE STICKY CTA */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <Link href={`/acheter?crypto=${selectedCryptoId}`} className="block w-full bg-indigo-600 text-white text-center py-4 rounded-2xl font-bold shadow-[0_8px_30px_rgb(79,70,229,0.4)] active:scale-95 transition-transform">
          Acheter des cryptos maintenant
        </Link>
      </div>
    </main>
  );
}
