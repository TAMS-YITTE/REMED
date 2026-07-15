import { Footer } from '@/components/Footer';
import Link from 'next/link';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-200 sticky top-0 z-10">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900 no-underline">
          rem<span className="text-[#534AB7]">e</span>dly
        </Link>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-8">
          Politique de Confidentialité
        </h1>

        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-gray-700 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-500 italic">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Données collectées</h2>
            <p>
              Dans le cadre de votre utilisation de Remedly, nous pouvons être amenés à traiter votre adresse email, nécessaire pour la création et la sécurisation de votre portefeuille via notre partenaire Privy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Partage avec des tiers</h2>
            <p>
              Vos données ne sont jamais vendues. Elles sont partagées avec nos sous-traitants techniques strictement pour la fourniture du service :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Privy</strong> : gestion de l'authentification et du portefeuille cryptographique (wallet).</li>
              <li><strong>MoonPay / Transak</strong> : lors d'un achat, ces partenaires collectent directement vos informations de paiement et pièces d'identité (KYC). Remedly n'a pas accès à vos informations bancaires ni à vos documents d'identité.</li>
              <li><strong>PostHog</strong> : outil d'analyse d'audience anonymisée pour améliorer notre interface.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Vos droits (RGPD)</h2>
            <p>
              Conformément à la réglementation européenne (RGPD), vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données personnelles.
              Pour exercer ces droits, vous pouvez nous contacter à : <a href="mailto:contact@remedly.fr" className="text-[#534AB7] hover:underline">contact@remedly.fr</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies</h2>
            <p>
              L'interface web utilise des cookies techniques strictement nécessaires au maintien de votre session de connexion (via Privy) ainsi que des cookies de mesure d'audience (via PostHog). Vous pouvez configurer votre navigateur pour refuser ces cookies, ce qui pourrait cependant altérer le fonctionnement du service.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
