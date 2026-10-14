import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { homeFor, ROLE_LABELS } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";
export const metadata = { title: "No access" };

export default async function DeniedPage() {
  const user = await getSession();

  return (
    <div className="card grid place-items-center gap-4 p-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--danger-soft)] text-[var(--danger)]">
        <ShieldAlert size={24} />
      </span>
      <h1 className="text-xl font-bold">That page isn&apos;t part of your role</h1>
      <p className="max-w-sm text-sm text-muted">
        {user
          ? `You're signed in as ${user.name} (${ROLE_LABELS[user.role]}). Ask the owner if you need wider access.`
          : "Sign in to continue."}
      </p>
      <Link href={user ? homeFor(user.role) : "/login"} className="btn btn-primary btn-sm">
        Back to my workspace
      </Link>
    </div>
  );
}
