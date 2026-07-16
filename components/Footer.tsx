import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#252844] border-t border-white/10 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-8">
          <div className="text-center md:text-left">
            <Link href="/" className="inline-flex items-center justify-center md:justify-start gap-2.5 no-underline mb-4 group">
              <img src="/logo.png" alt="Remedly Logo" className="w-8 h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col text-left">
                <span className="text-xl font-bold tracking-tighter text-white leading-none">
                  rem<span className="text-indigo-400">e</span>dly
                </span>
                <span className="text-[10px] text-indigo-300/80 font-medium tracking-wider uppercase mt-1">
                  Remède contre la complexité
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm">
              L'interface la plus simple pour accéder à l'écosystème crypto.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-sm font-medium text-gray-300">
            <Link href="/mentions-legales" className="hover:text-indigo-400 transition-colors">
              Mentions Légales
            </Link>
            <Link href="/cgu" className="hover:text-indigo-400 transition-colors">
              CGU
            </Link>
            <Link href="/confidentialite" className="hover:text-indigo-400 transition-colors">
              Confidentialité
            </Link>
            <a href="mailto:contact@remedly.fr" className="hover:text-indigo-400 transition-colors">
              Contact
            </a>
          </div>
        </div>

        <div className="bg-[#2E3152] border border-white/10 rounded-xl p-5 mb-8 text-[11px] leading-relaxed text-gray-400">
          <strong>Statut Réglementaire :</strong> Remedly édite exclusivement une interface logicielle et agit en qualité d'apporteur d'affaires. Remedly n'est ni un Prestataire de Services sur Actifs Numériques (PSAN) au sens de l'AMF, ni un prestataire CASP au sens de MiCA. Remedly ne fournit aucun conseil en investissement, n'exécute pas d'ordres sur actifs numériques et ne conserve à aucun moment les fonds ou les clés privées de ses utilisateurs.
          <br /><br />
          La création et la sécurisation des portefeuilles non-hébergés (non-custodial wallets) sont opérées par <strong>Privy</strong>. Les services d'achat d'actifs numériques par carte bancaire ou virement sont exclusivement fournis par <strong>Transak</strong> et <strong>MoonPay</strong>, partenaires dûment enregistrés et réglementés pour fournir ces services dans les juridictions applicables.
        </div>

        <div className="text-center text-xs text-gray-500">
          &copy; {currentYear} Remedly. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
