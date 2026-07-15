import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function CGUPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 no-underline">
          rem<span className="text-[#534AB7]">e</span>dly
        </Link>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-8">
          Conditions Générales d'Utilisation
        </h1>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-gray-700 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-500 italic">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'accès et l'utilisation de l'interface web Remedly (éditée par la société YITTE). Remedly est une simple interface logicielle permettant à l'Utilisateur d'accéder plus facilement à des services de création de portefeuilles cryptographiques et de paiement tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Rôle de Remedly</h2>
            <p>
              Remedly agit exclusivement comme apporteur d'affaires. <strong>À aucun moment Remedly n'exécute de transactions financières, ne reçoit de fonds en euros, ni ne détient ou gère les cryptomonnaies de ses utilisateurs.</strong>
            </p>
            <p className="mt-3">
              La fourniture du portefeuille numérique (wallet) est assurée techniquement par notre partenaire Privy. 
              L'achat d'actifs numériques par virement ou carte bancaire est exécuté de bout en bout par nos partenaires 
              réglementés Transak et MoonPay.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Inscription et Portefeuille</h2>
            <p>
              Lors de l'inscription via une adresse email, un portefeuille numérique "Non-Custodial" (non hébergé) est automatiquement généré. L'Utilisateur est le seul et unique détenteur de l'accès à ce portefeuille. En cas de perte de ses accès (email), Remedly n'a aucun moyen technique de restaurer l'accès ou de récupérer les fonds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Avertissement sur les risques</h2>
            <p>
              L'investissement dans les cryptomonnaies présente un risque très élevé de perte en capital. 
              La valeur des cryptomonnaies est extrêmement volatile. Remedly ne fournit aucun conseil d'investissement. 
              L'Utilisateur agit de sa propre initiative et reconnaît comprendre les risques liés aux actifs numériques.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Responsabilité</h2>
            <p>
              Remedly ne saurait être tenue pour responsable en cas de défaillance des services tiers (Privy, MoonPay, Transak), en cas de perte de l'accès au portefeuille par l'Utilisateur, ou en cas de baisse de la valeur des actifs acquis via l'interface.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
