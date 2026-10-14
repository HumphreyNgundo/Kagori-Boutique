import type { User } from "@/lib/types";
import { hashPassword } from "@/lib/auth/password";

/** Demo credentials are surfaced on the sign-in page so the client can poke around. */
export const DEMO_PASSWORD = "kagorim2026";

interface Seed {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: User["role"];
}

const SEEDS: Seed[] = [
  { id: "usr_owner", email: "owner@kagorim.co.ke", name: "Grace Kagorim", phone: "0712000001", role: "OWNER" },
  { id: "usr_manager", email: "manager@kagorim.co.ke", name: "Brian Otieno", phone: "0712000002", role: "MANAGER" },
  { id: "usr_sales", email: "sales@kagorim.co.ke", name: "Mercy Wanjiru", phone: "0712000003", role: "SALES" },
  { id: "usr_fulfil", email: "store@kagorim.co.ke", name: "Dennis Mwangi", phone: "0712000004", role: "FULFILMENT" },
  { id: "usr_rider", email: "rider@kagorim.co.ke", name: "Kelvin Juma", phone: "0712000005", role: "RIDER" },
  { id: "usr_customer", email: "shopper@example.com", name: "Aisha Noor", phone: "0722111222", role: "CUSTOMER" },
];

export function buildUsers(): User[] {
  return SEEDS.map((s, i) => ({
    id: s.id,
    email: s.email,
    name: s.name,
    phone: s.phone,
    role: s.role,
    // Deterministic salt keeps the seed stable across cold starts.
    passwordHash: hashPassword(DEMO_PASSWORD, `seed${i}salt`),
    active: true,
    createdAt: "2026-01-05T08:00:00.000Z",
    lastLoginAt: null,
  }));
}

export const DEMO_ACCOUNTS = SEEDS.filter((s) => s.role !== "CUSTOMER").map((s) => ({
  email: s.email,
  role: s.role,
  name: s.name,
}));
