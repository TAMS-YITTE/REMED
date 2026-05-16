import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/storage";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { prenom, nom, email, password } = await req.json();
  if (!prenom || !nom || !email || !password) return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Mot de passe trop court (8 caractères minimum)" }, { status: 400 });
  if (await getUserByEmail(email)) return NextResponse.json({ error: "Un compte existe déjà avec cet email" }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ prenom, nom, email, passwordHash });
  const token = await signToken({ userId: user.id });
  await setSessionCookie(token);
  const { passwordHash: _, ...publicUser } = user;
  return NextResponse.json(publicUser, { status: 201 });
}
