import { NextRequest, NextResponse } from "next/server";
import { getAnnonceById, updateAnnonce, deleteAnnonce, saveMessage } from "@/lib/storage";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await getAnnonceById(id);
  if (!a) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(a);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const updated = await updateAnnonce(id, session.userId, body);
  if (!updated) return NextResponse.json({ error: "Introuvable ou non autorisé" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  const { id } = await params;
  const ok = await deleteAnnonce(id, session.userId);
  if (!ok) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ success: true });
}
