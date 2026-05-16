"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowLeft, Zap, Phone, Mail, ArrowRight, Calendar, Package } from "lucide-react";

type Annonce = { id: string; titre: string; description: string; categorie: string; etat: string; prix: number; ville: string; region: string; marque?: string; modele?: string; annee?: number; contactEmail: string; contactTel?: string; urgent: boolean; createdAt: string };

const ETAT_COLOR: Record<string, string> = {
  "Neuf (jamais utilisé)": "bg-green-50 text-green-700 border-green-100",
  "Très bon état": "bg-blue-50 text-blue-700 border-blue-100",
  "Bon état": "bg-yellow-50 text-yellow-700 border-yellow-100",
  "État correct": "bg-orange-50 text-orange-700 border-orange-100",
  "Pour pièces": "bg-red-50 text-red-700 border-red-100",
};

export default function AnnoncePage() {
  const { id } = useParams<{ id: string }>();
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({ fromNom: "", fromEmail: "", texte: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(`/api/annonces/${id}`).then((r) => r.ok ? r.json() : null).then((d) => { setAnnonce(d); setLoading(false); });
  }, [id]);

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await fetch(`/api/annonces/${id}/contact`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contact) });
    setSending(false);
    setSent(true);
  };

  const fmt = (n: number) => n.toLocaleString("fr-FR");
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Chargement...</div>;
  if (!annonce) return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Annonce introuvable</div>;

  const leasingEstimate = Math.round(annonce.prix * 1.3 / 36);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/annonces" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour aux annonces
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Détails */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{annonce.categorie}</span>
                  {annonce.urgent && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
                      <Zap className="w-3 h-3" /> Urgent
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${ETAT_COLOR[annonce.etat] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                  {annonce.etat}
                </span>
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-2">{annonce.titre}</h1>
              <div className="text-3xl font-bold text-cyan-700 mb-4">{fmt(annonce.prix)} €</div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {annonce.marque && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span><strong>Marque :</strong> {annonce.marque}</span>
                  </div>
                )}
                {annonce.modele && (
                  <div className="text-sm text-gray-600"><strong>Modèle :</strong> {annonce.modele}</div>
                )}
                {annonce.annee && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span><strong>Année :</strong> {annonce.annee}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{annonce.ville}, {annonce.region}</span>
                </div>
              </div>

              <div className="border-t border-gray-50 pt-4">
                <h2 className="font-semibold text-gray-800 mb-2 text-sm">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{annonce.description}</p>
              </div>

              <p className="text-xs text-gray-400 mt-4">Publié le {fmtDate(annonce.createdAt)}</p>
            </div>

            {/* Encart Medlease */}
            <div className="bg-blue-950 text-white rounded-2xl p-5">
              <p className="text-blue-300 text-xs mb-1">Vous préférez du neuf ?</p>
              <h3 className="font-semibold mb-1">Un équipement similaire neuf avec Medlease</h3>
              <p className="text-blue-200 text-sm mb-3">
                Ce type de matériel neuf coûte environ <strong>{fmt(annonce.prix * 3)}–{fmt(annonce.prix * 5)} €</strong>.
                En leasing Medlease : à partir de <strong>~{leasingEstimate} €/mois</strong> sur 36 mois.
              </p>
              <Link href="https://medlease.fr" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                Obtenir une offre Medlease <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Contacter le vendeur</h2>
              {sent ? (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <p className="text-green-700 text-sm font-medium">✓ Message envoyé !</p>
                  <p className="text-green-600 text-xs mt-1">Le vendeur vous répondra par email.</p>
                </div>
              ) : (
                <form onSubmit={handleContact} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Votre nom</label>
                    <input required value={contact.fromNom} onChange={(e) => setContact((c) => ({ ...c, fromNom: e.target.value }))}
                      placeholder="Dr. Martin" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Votre email</label>
                    <input required type="email" value={contact.fromEmail} onChange={(e) => setContact((c) => ({ ...c, fromEmail: e.target.value }))}
                      placeholder="martin@cabinet.fr" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                    <textarea required value={contact.texte} onChange={(e) => setContact((c) => ({ ...c, texte: e.target.value }))}
                      rows={4} placeholder="Bonjour, je suis intéressé par cette annonce..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                    {sending ? "Envoi..." : "Envoyer un message"}
                  </button>
                </form>
              )}

              {annonce.contactTel && (
                <a href={`tel:${annonce.contactTel}`} className="flex items-center gap-2 text-sm text-blue-700 hover:underline mt-4">
                  <Phone className="w-4 h-4" /> {annonce.contactTel}
                </a>
              )}
              <a href={`mailto:${annonce.contactEmail}`} className="flex items-center gap-2 text-sm text-blue-700 hover:underline mt-2">
                <Mail className="w-4 h-4" /> Email direct
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
