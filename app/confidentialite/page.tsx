import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-8">
          Politique de Confidentialité
        </h1>

        <div className="glass-panel rounded-2xl p-8 text-gray-300 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-500 italic">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Données collectées</h2>
            <p>
              Dans le cadre de votre utilisation de Remedly (service édité par la société YITTE), nous pouvons être amenés à traiter votre adresse email, nécessaire pour la création et la sécurisation de votre portefeuille via notre partenaire Privy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Partage avec des tiers</h2>
            <p>
              Vos données ne sont jamais vendues. Elles sont partagées avec nos sous-traitants techniques strictement pour la fourniture du service :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-white">Privy</strong> : gestion de l'authentification et du portefeuille cryptographique (wallet).</li>
              <li><strong className="text-white">MoonPay</strong> : lors d'un achat, ces partenaires collectent directement vos informations de paiement et pièces d'identité (KYC). Remedly n'a pas accès à vos informations bancaires ni à vos documents d'identité.</li>
              <li><strong className="text-white">PostHog</strong> : outil d'analyse d'audience anonymisée pour améliorer notre interface.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Vos droits (RGPD)</h2>
            <p>
              Conformément à la réglementation européenne (RGPD), vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données personnelles.
              Pour exercer ces droits, vous pouvez nous contacter à : <a href="mailto:contact@remedly.fr" className="text-indigo-400 hover:underline">contact@remedly.fr</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies</h2>
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
