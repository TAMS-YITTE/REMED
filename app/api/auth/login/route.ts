import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/storage";
import { signToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const user = await getUserByEmail(email);
  if (!user) return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
  const token = await signToken({ userId: user.id });
  await setSessionCookie(token);
  const { passwordHash: _, ...publicUser } = user;
  return NextResponse.json(publicUser);
}
