import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/storage";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null);
  const user = await getUserById(session.userId);
  if (!user) return NextResponse.json(null);
  const { passwordHash: _, ...publicUser } = user;
  return NextResponse.json(publicUser);
}
