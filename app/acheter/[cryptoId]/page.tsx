import { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BuyWidget } from '@/components/BuyWidget';
import { CryptoChart } from '@/components/CryptoChart';
import Link from 'next/link';

// Mappage des informations basiques pour le SEO
const cryptoMap: Record<string, { name: string; symbol: string; description: string }> = {
  bitcoin: { name: 'Bitcoin', symbol: 'BTC', description: 'Achetez du Bitcoin (BTC) facilement, en toute sécurité et avec des frais réduits sur Remedly. Profitez de l\'actif crypto le plus populaire.' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', description: 'Investissez dans Ethereum (ETH) sur Remedly. Rejoignez le réseau de contrats intelligents le plus utilisé au monde.' },
  solana: { name: 'Solana', symbol: 'SOL', description: 'Achetez du Solana (SOL) rapidement. Profitez de transactions ultra-rapides et peu coûteuses avec Remedly.' },
  usdc: { name: 'USDC', symbol: 'USDC', description: 'Achetez des USDC sur Remedly pour vous protéger de la volatilité avec ce stablecoin adossé au dollar américain.' },
  // Par défaut
  default: { name: 'Cryptomonnaie', symbol: 'CRYPTO', description: 'Achetez vos cryptomonnaies préférées simplement et de façon sécurisée sur Remedly.' }
};

export async function generateMetadata({ params }: { params: { cryptoId: string } }): Promise<Metadata> {
  const id = params.cryptoId.toLowerCase();
  const cryptoInfo = cryptoMap[id] || { ...cryptoMap.default, name: id.toUpperCase(), symbol: id.toUpperCase() };

  return {
    title: `Acheter du ${cryptoInfo.name} (${cryptoInfo.symbol}) - Remedly`,
    description: cryptoInfo.description,
    openGraph: {
      title: `Acheter du ${cryptoInfo.name} (${cryptoInfo.symbol}) en toute simplicité`,
      description: cryptoInfo.description,
      type: 'website',
    }
  };
}

export default function AcheterCryptoPage({ params }: { params: { cryptoId: string } }) {
  const id = params.cryptoId.toLowerCase();
  const cryptoInfo = cryptoMap[id] || { ...cryptoMap.default, name: id.toUpperCase(), symbol: id.toUpperCase() };

  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />

      <main className="flex-1 py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white mb-6 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Acheter du <span className="text-indigo-400">{cryptoInfo.name}</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl">
            {cryptoInfo.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Colonne Graphique & Infos SEO */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            <CryptoChart 
              cryptoId={id === 'bitcoin' ? 'btc' : id === 'ethereum' ? 'eth' : id === 'solana' ? 'sol' : id}
              cryptoName={cryptoInfo.name}
              cryptoSymbol={cryptoInfo.symbol}
            />
            
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Pourquoi acheter du {cryptoInfo.name} ?</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  Sur Remedly, nous rendons l'achat de {cryptoInfo.name} accessible à tous. Notre plateforme utilise l'infrastructure MoonPay pour garantir des transactions ultra-rapides, avec vos propres clés privées grâce à l'intégration Privy.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Frais transparents et ultra compétitifs</li>
                  <li>Création de wallet magique en 1 clic (sans phrase de récupération compliquée)</li>
                  <li>Virement SEPA ou carte bancaire instantanée</li>
                  <li>Conservation directe (Non-custodial)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Colonne Achat */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="glass-panel rounded-3xl p-6 shadow-2xl border-t border-white/20">
              <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
                Investir maintenant
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </h3>
              <BuyWidget crypto={id === 'bitcoin' ? 'btc' : id === 'ethereum' ? 'eth' : id === 'solana' ? 'sol' : id} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
