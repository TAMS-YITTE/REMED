import { supabaseAdmin as db } from "./supabase";

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type Categorie =
  | "Imagerie & Radiologie" | "Dentisterie" | "Kinésithérapie & Rééducation"
  | "Chirurgie & Bloc" | "Consultation & Diagnostic" | "Ophtalmologie"
  | "Cardiologie" | "Mobilier médical" | "Stérilisation" | "Autre";

export type Etat = "Neuf (jamais utilisé)" | "Très bon état" | "Bon état" | "État correct" | "Pour pièces";
export type Statut = "active" | "vendue" | "archivée";

export type Annonce = {
  id: string;
  userId: string;
  titre: string;
  description: string;
  categorie: Categorie;
  etat: Etat;
  prix: number;
  ville: string;
  region: string;
  marque?: string;
  modele?: string;
  annee?: number;
  statut: Statut;
  urgent: boolean;
  contactEmail: string;
  contactTel?: string;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Message = {
  id: string;
  annonceId: string;
  fromEmail: string;
  fromNom: string;
  texte: string;
  createdAt: string;
};

// ═══════════════════════════════════════════════════════════════
// Mappers
// ═══════════════════════════════════════════════════════════════

const mapUser = (r: any): User => ({
  id: r.id, prenom: r.prenom, nom: r.nom, email: r.email,
  passwordHash: r.password_hash, createdAt: r.created_at,
});

const mapAnnonce = (r: any): Annonce => ({
  id: r.id, userId: r.user_id, titre: r.titre, description: r.description,
  categorie: r.categorie, etat: r.etat, prix: Number(r.prix),
  ville: r.ville ?? "", region: r.region ?? "",
  marque: r.marque ?? undefined, modele: r.modele ?? undefined,
  annee: r.annee ?? undefined, statut: r.statut,
  urgent: !!r.urgent, contactEmail: r.contact_email,
  contactTel: r.contact_tel ?? undefined,
  createdAt: r.created_at, updatedAt: r.updated_at,
});

const mapMessage = (r: any): Message => ({
  id: r.id, annonceId: r.annonce_id, fromEmail: r.from_email,
  fromNom: r.from_nom, texte: r.texte, createdAt: r.created_at,
});

// ═══════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════

export async function getUsers(): Promise<User[]> {
  const { data } = await db.from("users").select("*");
  return (data ?? []).map(mapUser);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data } = await db.from("users").select("*").eq("email", email).maybeSingle();
  return data ? mapUser(data) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await db.from("users").select("*").eq("id", id).maybeSingle();
  return data ? mapUser(data) : null;
}

export async function createUser(data: Omit<User, "id" | "createdAt">): Promise<User> {
  const { data: row, error } = await db.from("users").insert({
    prenom: data.prenom, nom: data.nom, email: data.email,
    password_hash: data.passwordHash,
  }).select().single();
  if (error) throw error;
  return mapUser(row);
}

// ═══════════════════════════════════════════════════════════════
// ANNONCES
// ═══════════════════════════════════════════════════════════════

export async function getAnnonces(): Promise<Annonce[]> {
  const { data } = await db.from("annonces").select("*")
    .order("urgent", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapAnnonce);
}

export async function getAnnonceById(id: string): Promise<Annonce | null> {
  const { data } = await db.from("annonces").select("*").eq("id", id).maybeSingle();
  return data ? mapAnnonce(data) : null;
}

export async function getAnnoncesByUser(userId: string): Promise<Annonce[]> {
  const { data } = await db.from("annonces").select("*").eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapAnnonce);
}

export async function createAnnonce(data: Omit<Annonce, "id" | "createdAt" | "updatedAt" | "statut" | "urgent">): Promise<Annonce> {
  const { data: row, error } = await db.from("annonces").insert({
    user_id: data.userId, titre: data.titre, description: data.description,
    categorie: data.categorie, etat: data.etat, prix: data.prix,
    ville: data.ville, region: data.region,
    marque: data.marque, modele: data.modele, annee: data.annee,
    contact_email: data.contactEmail, contact_tel: data.contactTel,
  }).select().single();
  if (error) throw error;
  return mapAnnonce(row);
}

export async function updateAnnonce(id: string, userId: string, data: Partial<Annonce>): Promise<Annonce | null> {
  const patch: any = { updated_at: new Date().toISOString() };
  if (data.titre !== undefined) patch.titre = data.titre;
  if (data.description !== undefined) patch.description = data.description;
  if (data.categorie !== undefined) patch.categorie = data.categorie;
  if (data.etat !== undefined) patch.etat = data.etat;
  if (data.prix !== undefined) patch.prix = data.prix;
  if (data.ville !== undefined) patch.ville = data.ville;
  if (data.region !== undefined) patch.region = data.region;
  if (data.marque !== undefined) patch.marque = data.marque;
  if (data.modele !== undefined) patch.modele = data.modele;
  if (data.annee !== undefined) patch.annee = data.annee;
  if (data.statut !== undefined) patch.statut = data.statut;
  if (data.urgent !== undefined) patch.urgent = data.urgent;
  if (data.contactEmail !== undefined) patch.contact_email = data.contactEmail;
  if (data.contactTel !== undefined) patch.contact_tel = data.contactTel;
  const { data: row, error } = await db.from("annonces").update(patch).eq("id", id).eq("user_id", userId).select().maybeSingle();
  if (error || !row) return null;
  return mapAnnonce(row);
}

export async function deleteAnnonce(id: string, userId: string): Promise<boolean> {
  const { error, count } = await db.from("annonces").delete({ count: "exact" }).eq("id", id).eq("user_id", userId);
  return !error && (count ?? 0) > 0;
}

// ═══════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════

export async function saveMessage(data: Omit<Message, "id" | "createdAt">): Promise<Message> {
  const { data: row, error } = await db.from("messages").insert({
    annonce_id: data.annonceId, from_email: data.fromEmail,
    from_nom: data.fromNom, texte: data.texte,
  }).select().single();
  if (error) throw error;
  return mapMessage(row);
}
