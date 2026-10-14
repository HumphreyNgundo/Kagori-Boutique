import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { read, write } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { can, type Permission } from "@/lib/auth/rbac";
import type { Role } from "@/lib/types";

const COOKIE = "kagorim_session";
const MAX_AGE = 60 * 60 * 8; // a trading day

/** Dev fallback keeps preview deployments working; set AUTH_SECRET in prod. */
const SECRET = process.env.AUTH_SECRET || "kagorim-dev-secret-change-me";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function seal(user: SessionUser): string {
  const body = Buffer.from(
    JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

function unseal(token: string): SessionUser | null {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as SessionUser & { exp: number };
    if (!parsed.exp || parsed.exp < Date.now()) return null;
    return { id: parsed.id, name: parsed.name, email: parsed.email, role: parsed.role };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? unseal(token) : null;
}

export async function signIn(email: string, password: string): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const db = await read();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
    // Same message either way — don't leak which emails exist.
    return { ok: false, error: "Wrong email or password." };
  }

  const session: SessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };
  (await cookies()).set(COOKIE, seal(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });

  await write((d) => {
    const row = d.users.find((u) => u.id === user.id);
    if (row) row.lastLoginAt = new Date().toISOString();
    d.audit.unshift({
      id: `aud_${Date.now().toString(36)}`,
      actorId: user.id,
      actorName: user.name,
      action: "auth.signin",
      entity: "user",
      entityId: user.id,
      meta: { role: user.role },
      createdAt: new Date().toISOString(),
    });
  });

  return { ok: true, user: session };
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/* ------------------------------------------------------------------ */
/* Guards — every admin page and mutation goes through these.          */
/* ------------------------------------------------------------------ */

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!can(user.role, permission)) redirect("/admin/denied");
  return user;
}

/** Non-redirecting variant for server actions, which return errors instead. */
export async function authorise(permission: Permission) {
  const user = await getSession();
  if (!user) return { ok: false as const, error: "Your session expired — sign in again." };
  if (!can(user.role, permission)) return { ok: false as const, error: "You don't have access to that." };
  return { ok: true as const, user };
}
