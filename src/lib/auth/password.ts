import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Demo-grade password hashing: salted SHA-256. Deliberately simple and
 * dependency-free. Swap for argon2id/bcrypt before taking real customer
 * passwords — the call sites below are the only two places to change.
 */
export function hashPassword(password: string, salt = randomBytes(12).toString("hex")): string {
  const digest = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  return `s1$${salt}$${digest}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, digest] = stored.split("$");
  if (scheme !== "s1" || !salt || !digest) return false;
  const candidate = createHash("sha256").update(`${salt}:${password}`).digest("hex");
  const a = Buffer.from(candidate, "hex");
  const b = Buffer.from(digest, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
