import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 no-underline">
          rem<span className="text-[#534AB7]">e</span>dly
        </Link>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-8">
          Mentions Légales
        </h1>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-gray-700 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-500 italic">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Éditeur du site</h2>
            <p>
              Le site <strong>remedly.fr</strong> est édité par la société <strong>[Nom de votre Société]</strong>,<br />
              [Forme juridique, ex: SASU] au capital de [Montant] euros,<br />
              Immatriculée au Registre du Commerce et des Sociétés de [Ville] sous le numéro <strong>[SIREN]</strong>.<br />
              Siège social : [Adresse postale de la société].<br />
              Contact : <a href="mailto:contact@remedly.fr" className="text-[#534AB7] hover:underline">contact@remedly.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Directeur de la publication</h2>
            <p>
              Le Directeur de la publication est <strong>[Prénom Nom]</strong>, en sa qualité de [Fonction, ex: Président].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Hébergement</h2>
            <p>
              Le site est hébergé par la société <strong>Vercel Inc.</strong>,<br />
              340 S Lemon Ave #4133 Walnut, CA 91789, États-Unis.<br />
              Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#534AB7] hover:underline">https://vercel.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Avertissement réglementaire (Important)</h2>
            <p>
              Remedly édite exclusivement une interface logicielle et agit en qualité d'apporteur d'affaires. 
              Remedly ne fournit <strong>aucun service d'achat/vente d'actifs numériques contre de la monnaie ayant cours légal</strong> 
              et <strong>ne fournit aucun service de conservation d'actifs numériques pour le compte de tiers</strong>. 
              À ce titre, Remedly n'est ni enregistré en tant que Prestataire de Services sur Actifs Numériques (PSAN) 
              auprès de l'Autorité des Marchés Financiers (AMF), ni agréé CASP.
            </p>
            <p className="mt-3">
              Les transactions (achats de cryptomonnaies) sont opérées exclusivement par nos partenaires réglementés 
              (Transak et MoonPay). Les portefeuilles non-hébergés (non-custodial wallets) sont fournis et sécurisés 
              par l'infrastructure de Privy.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
