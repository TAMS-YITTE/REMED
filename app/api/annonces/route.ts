import { NextRequest, NextResponse } from "next/server";
import { createAnnonce } from "@/lib/storage";
import { supabaseAdmin as db } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categorie = searchParams.get("categorie");
  const region = searchParams.get("region");
  const etat = searchParams.get("etat");
  const q = searchParams.get("q");
  const prixMax = searchParams.get("prixMax");

  let query = db.from("annonces").select("*").eq("statut", "active")
    .order("urgent", { ascending: false })
    .order("created_at", { ascending: false });
  if (categorie) query = query.eq("categorie", categorie);
  if (region) query = query.eq("region", region);
  if (etat) query = query.eq("etat", etat);
  if (prixMax) query = query.lte("prix", Number(prixMax));
  if (q) query = query.or(`titre.ilike.%${q}%,description.ilike.%${q}%,marque.ilike.%${q}%,modele.ilike.%${q}%,ville.ilike.%${q}%,categorie.ilike.%${q}%`);

  const { data } = await query;
  const mapped = (data ?? []).map((r: any) => ({
    id: r.id, userId: r.user_id, titre: r.titre, description: r.description,
    categorie: r.categorie, etat: r.etat, prix: Number(r.prix),
    ville: r.ville ?? "", region: r.region ?? "",
    marque: r.marque ?? undefined, modele: r.modele ?? undefined,
    annee: r.annee ?? undefined, statut: r.statut,
    urgent: !!r.urgent, contactEmail: r.contact_email,
    contactTel: r.contact_tel ?? undefined,
    createdAt: r.created_at, updatedAt: r.updated_at,
    is_seed: !!r.is_seed,
  }));
  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const body = await req.json();
  const annonce = await createAnnonce({ ...body, userId: session.userId });
  return NextResponse.json(annonce, { status: 201 });
}
