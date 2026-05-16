import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "remed-local-secret-change-in-prod");
const COOKIE = "rm_session";

export async function signToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try { const { payload } = await jwtVerify(token, SECRET); return payload as { userId: string }; }
  catch { return null; }
}

export async function getSession(): Promise<{ userId: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}
