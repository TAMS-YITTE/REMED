import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-8">
          Mentions Légales
        </h1>

        <div className="glass-panel rounded-2xl p-8 text-gray-300 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-500 italic">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Éditeur du site</h2>
            <p>
              Le site <strong className="text-white">remedly.fr</strong> est édité par la société <strong className="text-white">YITTE</strong>,<br />
              SASU au capital de 1 000 euros,<br />
              Immatriculée au Registre du Commerce et des Sociétés de Meaux sous le numéro <strong className="text-white">919 805 028</strong>.<br />
              Siège social : 65B Rue Alexandre Bickart, 77500 Chelles.<br />
              Contact : <a href="mailto:contact@remedly.fr" className="text-indigo-400 hover:underline">contact@remedly.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Directeur de la publication</h2>
            <p>
              Le Directeur de la publication est <strong className="text-white">Tamsir Sock</strong>, en sa qualité de Président.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Hébergement</h2>
            <p>
              Le site est hébergé par la société <strong className="text-white">Vercel Inc.</strong>,<br />
              340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.<br />
              Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">https://vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Avertissement réglementaire (Important)</h2>
            <p>
              Remedly édite exclusivement une interface logicielle et agit en qualité d'apporteur d'affaires.
              Remedly ne fournit <strong className="text-white">aucun service d'achat/vente d'actifs numériques contre de la monnaie ayant cours légal</strong>
              et <strong className="text-white">ne fournit aucun service de conservation d'actifs numériques pour le compte de tiers</strong>.
              À ce titre, Remedly n'est ni enregistré en tant que Prestataire de Services sur Actifs Numériques (PSAN)
              auprès de l'Autorité des Marchés Financiers (AMF), ni agréé CASP.
            </p>
            <p className="mt-3">
              Les transactions (achats de cryptomonnaies) sont opérées exclusivement par nos partenaires réglementés
              (MoonPay). Les portefeuilles non-hébergés (non-custodial wallets) sont fournis et sécurisés
              par l'infrastructure de Privy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
