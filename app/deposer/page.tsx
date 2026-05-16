"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

const CATEGORIES = ["Imagerie & Radiologie", "Dentisterie", "Kinésithérapie & Rééducation", "Chirurgie & Bloc", "Consultation & Diagnostic", "Ophtalmologie", "Cardiologie", "Mobilier médical", "Stérilisation", "Autre"];
const ETATS = ["Neuf (jamais utilisé)", "Très bon état", "Bon état", "État correct", "Pour pièces"];
const REGIONS = ["Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur", "Occitanie", "Nouvelle-Aquitaine", "Grand Est", "Hauts-de-France", "Bretagne", "Normandie", "Pays de la Loire", "Bourgogne-Franche-Comté", "Centre-Val de Loire", "Corse"];

const EMPTY = { titre: "", description: "", categorie: "Autre", etat: "Très bon état", prix: "", ville: "", region: "Île-de-France", marque: "", modele: "", annee: "", contactEmail: "", contactTel: "" };

export default function DeposerPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((u) => {
      setLoggedIn(!!u);
      if (u?.email) setForm((f) => ({ ...f, contactEmail: u.email }));
    }).catch(() => setLoggedIn(false));
  }, []);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedIn) { router.push("/inscription"); return; }
    setError(""); setLoading(true);
    const res = await fetch("/api/annonces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, prix: Number(form.prix), annee: form.annee ? Number(form.annee) : undefined }),
    });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error); return; }
    const data = await res.json();
    router.push(`/annonces/${data.id}`);
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-blue-950 mb-4">
            <RefreshCw className="w-5 h-5 text-cyan-600" />
            Re<span className="text-cyan-600">Med</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Déposer une annonce</h1>
          <p className="text-gray-500 text-sm mt-1">Vendez votre matériel médical à d&apos;autres professionnels de santé</p>
        </div>

        {!loggedIn && loggedIn !== null && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-center">
            <p className="text-sm text-blue-700 mb-2">Vous devez être connecté pour publier une annonce.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/inscription" className="bg-cyan-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-cyan-500">Créer un compte</Link>
              <Link href="/connexion" className="border border-blue-200 text-blue-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-100">Se connecter</Link>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l&apos;annonce</label>
              <input required value={form.titre} onChange={(e) => set("titre", e.target.value)} placeholder="Ex : Table de massage électrique Chattanooga" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={form.categorie} onChange={(e) => set("categorie", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
                <select value={form.etat} onChange={(e) => set("etat", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {ETATS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
                <input value={form.marque} onChange={(e) => set("marque", e.target.value)} placeholder="Ex : Siemens" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modèle</label>
                <input value={form.modele} onChange={(e) => set("modele", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
                <input value={form.annee} onChange={(e) => set("annee", e.target.value)} type="number" placeholder="2020" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="État détaillé, historique d'utilisation, raison de la vente, options incluses..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
              <input required type="number" value={form.prix} onChange={(e) => set("prix", e.target.value)} placeholder="Ex : 3500" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input required value={form.ville} onChange={(e) => set("ville", e.target.value)} placeholder="Lyon" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                <select value={form.region} onChange={(e) => set("region", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {REGIONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                <input required type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone (optionnel)</label>
                <input value={form.contactTel} onChange={(e) => set("contactTel", e.target.value)} placeholder="06 xx xx xx xx" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <button type="submit" disabled={loading || !loggedIn}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm disabled:opacity-60">
              {loading ? "Publication en cours..." : "Publier l'annonce"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
