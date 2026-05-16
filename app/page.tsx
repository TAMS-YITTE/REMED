import Link from "next/link";
import { RefreshCw, ArrowRight, ShieldCheck, Zap, TrendingDown, Search, Tag, Truck } from "lucide-react";

const CATEGORIES = [
  { label: "Imagerie & Radiologie", emoji: "🔬" },
  { label: "Dentisterie", emoji: "🦷" },
  { label: "Kinésithérapie & Rééducation", emoji: "💪" },
  { label: "Chirurgie & Bloc", emoji: "🔧" },
  { label: "Consultation & Diagnostic", emoji: "🩺" },
  { label: "Ophtalmologie", emoji: "👁" },
  { label: "Cardiologie", emoji: "❤️" },
  { label: "Mobilier médical", emoji: "🛏" },
];

const STEPS = [
  { icon: Tag, title: "Déposez votre annonce", desc: "Décrivez votre matériel, fixez votre prix, publiez en 2 minutes." },
  { icon: Search, title: "Un acheteur vous contacte", desc: "Les praticiens intéressés vous envoient un message directement." },
  { icon: Truck, title: "Concluez la vente", desc: "Organisez la livraison ou le retrait et encaissez." },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-blue-950 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-900 text-cyan-400 text-sm px-3 py-1 rounded-full mb-6">
            <RefreshCw className="w-4 h-4" />
            Marketplace médicale entre professionnels
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Le matériel médical d&apos;occasion,<br />
            <span className="text-cyan-400">entre praticiens.</span>
          </h1>
          <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto">
            Vendez votre équipement inutilisé. Achetez du matériel de qualité à prix réduit. 100% entre professionnels de santé.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/annonces"
              className="flex items-center justify-center gap-2 bg-white text-blue-950 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">
              <Search className="w-4 h-4" /> Parcourir les annonces
            </Link>
            <Link href="/deposer"
              className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Vendre mon matériel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-white border-b border-gray-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { icon: TrendingDown, title: "Jusqu'à -70%", desc: "par rapport au neuf" },
            { icon: ShieldCheck, title: "Entre pros", desc: "Vendeurs et acheteurs vérifiés" },
            { icon: Zap, title: "Et si vous préférez du neuf ?", desc: "Medlease vous propose du leasing" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <Icon className="w-7 h-7 text-cyan-600" />
              <p className="font-bold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catégories */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Parcourir par catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((c) => (
              <Link key={c.label} href={`/annonces?categorie=${encodeURIComponent(c.label)}`}
                className="bg-white border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50 rounded-xl px-4 py-4 text-center shadow-sm transition-all">
                <div className="text-2xl mb-1">{c.emoji}</div>
                <p className="text-xs font-medium text-gray-700">{c.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-14 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                  <s.icon className="w-6 h-6 text-cyan-600" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-950 text-white text-xs rounded-full flex items-center justify-center font-bold">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/deposer" className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              Déposer une annonce gratuitement <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Medlease */}
      <section className="py-12 px-4 bg-blue-950 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-blue-300 text-sm mb-2">Vous ne trouvez pas votre bonheur en occasion ?</p>
          <h2 className="text-2xl font-bold mb-3">Optez pour du neuf avec Medlease</h2>
          <p className="text-blue-200 mb-6">Financez votre matériel médical neuf en leasing. Loyer fixe, sans apport, sans surprise.</p>
          <Link href="mailto:remed-contact@equipmedly.com?subject=Demande%20d'offre%20Medlease"
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            Découvrir Medlease <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
