"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User, Plus, Trash2, Eye, Zap, CheckCircle } from "lucide-react";

type UserData = { id: string; prenom: string; nom: string; email: string };
type Annonce = { id: string; titre: string; prix: number; categorie: string; etat: string; statut: string; urgent: boolean; createdAt: string; ville: string };

export default function MonComptePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const me = await fetch("/api/auth/me").then((r) => r.json());
      if (!me) { router.push("/connexion"); return; }
      setUser(me);
      const all = await fetch("/api/annonces").then((r) => r.json());
      setAnnonces(all.filter((a: Annonce) => true));
      setLoading(false);
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/"); router.refresh();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/annonces/${id}`, { method: "DELETE" });
    if (res.ok) setAnnonces((a) => a.filter((x) => x.id !== id));
  };

  const handleMarkSold = async (id: string) => {
    const res = await fetch(`/api/annonces/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut: "vendue" }) });
    if (res.ok) setAnnonces((a) => a.map((x) => x.id === id ? { ...x, statut: "vendue" } : x));
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Chargement...</div>;

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-gray-900">Mon compte</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>

        {/* Profil */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.prenom} {user?.nom}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Mes annonces */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Mes annonces ({annonces.length})</h2>
            <Link href="/deposer" className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
              <Plus className="w-4 h-4" /> Nouvelle annonce
            </Link>
          </div>

          {annonces.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">Aucune annonce publiée</p>
              <Link href="/deposer" className="text-cyan-600 text-sm font-medium hover:underline mt-1 inline-block">Déposer ma première annonce</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {annonces.map((a) => (
                <div key={a.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${a.statut === "vendue" ? "border-green-100 bg-green-50" : "border-gray-100 hover:border-gray-200"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-gray-800 text-sm truncate">{a.titre}</p>
                      {a.urgent && <Zap className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
                      {a.statut === "vendue" && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex-shrink-0">Vendue</span>}
                    </div>
                    <p className="text-xs text-gray-400">{a.categorie} · {a.ville} · {fmtDate(a.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="font-semibold text-cyan-700 text-sm">{fmt(a.prix)} €</span>
                    <Link href={`/annonces/${a.id}`} className="text-gray-300 hover:text-blue-500 transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    {a.statut === "active" && (
                      <button onClick={() => handleMarkSold(a.id)} className="text-gray-300 hover:text-green-500 transition-colors" title="Marquer comme vendue">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(a.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
