"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Zap, Tag, ArrowRight } from "lucide-react";

type Annonce = { id: string; titre: string; description: string; categorie: string; etat: string; prix: number; ville: string; region: string; marque?: string; urgent: boolean; createdAt: string };

const CATEGORIES = ["Imagerie & Radiologie", "Dentisterie", "Kinésithérapie & Rééducation", "Chirurgie & Bloc", "Consultation & Diagnostic", "Ophtalmologie", "Cardiologie", "Mobilier médical", "Stérilisation", "Autre"];
const REGIONS = ["Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur", "Occitanie", "Nouvelle-Aquitaine", "Grand Est", "Hauts-de-France", "Bretagne", "Normandie", "Pays de la Loire", "Bourgogne-Franche-Comté", "Centre-Val de Loire", "Corse"];
const ETATS = ["Neuf (jamais utilisé)", "Très bon état", "Bon état", "État correct", "Pour pièces"];

const ETAT_COLOR: Record<string, string> = {
  "Neuf (jamais utilisé)": "bg-green-50 text-green-700",
  "Très bon état": "bg-blue-50 text-blue-700",
  "Bon état": "bg-yellow-50 text-yellow-700",
  "État correct": "bg-orange-50 text-orange-700",
  "Pour pièces": "bg-red-50 text-red-700",
};

function AnnoncesContent() {
  const searchParams = useSearchParams();
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [categorie, setCategorie] = useState(searchParams.get("categorie") ?? "");
  const [region, setRegion] = useState("");
  const [etat, setEtat] = useState("");
  const [prixMax, setPrixMax] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categorie) params.set("categorie", categorie);
    if (region) params.set("region", region);
    if (etat) params.set("etat", etat);
    if (prixMax) params.set("prixMax", prixMax);
    fetch(`/api/annonces?${params}`).then((r) => r.json()).then((d) => { setAnnonces(d); setLoading(false); });
  }, [q, categorie, region, etat, prixMax]);

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  return (
    <div className="min-h-screen">
      {/* Filtres */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sticky top-16 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher..." className="text-sm outline-none w-full text-gray-700 placeholder-gray-400" />
          </div>
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none bg-white">
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none bg-white">
            <option value="">Toutes régions</option>
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select value={etat} onChange={(e) => setEtat(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none bg-white">
            <option value="">Tous états</option>
            {ETATS.map((e) => <option key={e}>{e}</option>)}
          </select>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <input value={prixMax} onChange={(e) => setPrixMax(e.target.value)} placeholder="Prix max €" type="number" className="w-24 text-sm outline-none text-gray-700 placeholder-gray-400" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-400">{loading ? "Chargement..." : `${annonces.length} annonce${annonces.length > 1 ? "s" : ""}`}</p>
          <Link href="/deposer" className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            + Déposer une annonce
          </Link>
        </div>

        {annonces.length === 0 && !loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm mb-3">Aucune annonce trouvée</p>
            <Link href="/deposer" className="text-cyan-600 text-sm font-medium hover:underline">Soyez le premier à publier</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {annonces.map((a) => (
              <Link key={a.id} href={`/annonces/${a.id}`}
                className="bg-white border border-gray-100 hover:border-cyan-200 hover:shadow-sm rounded-2xl p-5 transition-all block">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs bg-gray-50 text-gray-500 px-2 py-1 rounded-lg">{a.categorie}</span>
                  {a.urgent && (
                    <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                      <Zap className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{a.titre}</h3>
                {a.marque && <p className="text-xs text-gray-400 mb-2">{a.marque}</p>}
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{a.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-cyan-700">{fmt(a.prix)} €</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ETAT_COLOR[a.etat] ?? "bg-gray-50 text-gray-500"}`}>{a.etat}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                  <MapPin className="w-3 h-3" /> {a.ville} · {fmtDate(a.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Medlease */}
        {!loading && (
          <div className="mt-10 bg-blue-950 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Vous ne trouvez pas ce qu&apos;il vous faut ?</p>
              <p className="text-blue-300 text-sm mt-0.5">Optez pour du neuf avec Medlease — leasing médical sans apport</p>
            </div>
            <Link href="mailto:socktamsir@gmail.com?subject=Demande%20d'offre%20Medlease"
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap">
              Découvrir Medlease <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnnoncesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Chargement...</div>}>
      <AnnoncesContent />
    </Suspense>
  );
}
