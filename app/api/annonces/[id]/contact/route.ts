import { NextRequest, NextResponse } from "next/server";
import { getAnnonceById, saveMessage } from "@/lib/storage";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const annonce = await getAnnonceById(id);
  if (!annonce) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  const { fromEmail, fromNom, texte } = await req.json();
  if (!fromEmail || !fromNom || !texte) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  const message = await saveMessage({ annonceId: id, fromEmail, fromNom, texte });
  return NextResponse.json(message, { status: 201 });
}
