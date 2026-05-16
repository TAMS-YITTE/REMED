import { NextRequest, NextResponse } from "next/server";
import { getAnnonceById, saveMessage } from "@/lib/storage";
import { sendEmail, templates } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const annonce = await getAnnonceById(id);
  if (!annonce) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  const { fromEmail, fromNom, texte } = await req.json();
  if (!fromEmail || !fromNom || !texte) return NextResponse.json({ error: "Champs manquants" }, { status: 400 });

  const message = await saveMessage({ annonceId: id, fromEmail, fromNom, texte });

  // Forward du message au vendeur (avec reply-to direct vers l'acheteur)
  await sendEmail({
    to: annonce.contactEmail,
    replyTo: fromEmail,
    subject: `[ReMed] Message pour "${annonce.titre}"`,
    html: templates.contactVendeur({
      fromNom, fromEmail, texte,
      titre: annonce.titre, prix: annonce.prix, annonceId: annonce.id,
    }),
  });

  return NextResponse.json(message, { status: 201 });
}
