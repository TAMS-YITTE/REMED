import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export default function CGUPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#252844] text-white">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-8">
          Conditions Générales d'Utilisation
        </h1>

        <div className="glass-panel rounded-2xl p-8 text-gray-300 space-y-6 leading-relaxed">
          <p className="text-sm text-gray-500 italic">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'accès et l'utilisation de l'interface web Remedly (éditée par la société YITTE). Remedly est une simple interface logicielle permettant à l'Utilisateur d'accéder plus facilement à des services de création de portefeuilles cryptographiques et de paiement tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Rôle de Remedly</h2>
            <p>
              Remedly agit exclusivement comme apporteur d'affaires. <strong className="text-white">À aucun moment Remedly n'exécute de transactions financières, ne reçoit de fonds en euros, ni ne détient ou gère les cryptomonnaies de ses utilisateurs.</strong>
            </p>
            <p className="mt-3">
              La fourniture du portefeuille numérique (wallet) est assurée techniquement par notre partenaire Privy.
              L'achat d'actifs numériques par virement ou carte bancaire est exécuté de bout en bout par nos partenaires
              réglementés MoonPay.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Non-Custodial et Accès</h2>
            <p>
              Remedly ne conserve, ne gère et n'a jamais accès à vos fonds ou vos clés privées.
              Lors de l'inscription via une adresse email, un portefeuille numérique "Non-Custodial" (non hébergé) est automatiquement généré via Privy.
              L'Utilisateur est le seul et unique détenteur de l'accès à ce portefeuille via des mécanismes cryptographiques (Shamir's Secret Sharing).
              En cas de perte de ses accès (email), Remedly n'a aucun moyen technique de restaurer l'accès ou de récupérer les fonds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Dépôts, Transferts et Avertissements</h2>
            <p>
              Les fonctions de dépôt d'adresses (Deposit Address), le routage (Routing) et les ponts inter-chaînes (Bridging) sont fournis par des protocoles tiers (tels que Relay via Privy).
              <strong className="text-white"> Remedly et Privy ne contrôlent pas les délais d'exécution, la liquidité, les prix ou l'issue finale des transactions sur la blockchain.</strong>
            </p>
            <p className="mt-3">
              L'Utilisateur est seul responsable des fonds qu'il choisit d'envoyer vers son portefeuille Remedly. Toute erreur d'adresse, de réseau blockchain ou de devise lors d'un dépôt peut entraîner une perte définitive et irréversible des fonds, sans aucun recours possible contre Remedly ou ses partenaires.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Avertissement sur les risques financiers</h2>
            <p>
              L'investissement dans les cryptomonnaies présente un risque très élevé de perte en capital.
              La valeur des cryptomonnaies est extrêmement volatile. Remedly ne fournit aucun conseil d'investissement.
              L'Utilisateur agit de sa propre initiative et reconnaît comprendre les risques liés aux actifs numériques.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Limitation de Responsabilité</h2>
            <p>
              Remedly ne saurait être tenue pour responsable en cas de défaillance des services tiers (Privy, Stripe, MoonPay, Relay, etc.), en cas de perte de l'accès au portefeuille par l'Utilisateur, de perte de fonds lors d'un transfert externe vers ou depuis la plateforme, ou en cas de baisse de la valeur des actifs acquis via l'interface.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
