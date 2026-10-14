import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { Wordmark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSession } from "@/lib/auth/session";
import { homeFor, ROLE_DESCRIPTIONS, ROLE_LABELS } from "@/lib/auth/rbac";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/seed/users";

export const dynamic = "force-dynamic";
export const metadata = { title: "Staff sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(homeFor(session.role));

  const accounts = DEMO_ACCOUNTS.map((a) => ({ ...a, role: ROLE_LABELS[a.role] }));

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2">
      <div className="aurora" />

      <div className="relative flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center justify-between">
            <Link href="/" className="btn btn-ghost btn-sm -ml-2">
              <ChevronLeft size={15} /> Storefront
            </Link>
            <ThemeToggle />
          </div>

          <div className="mt-10">
            <Wordmark />
            <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Back-office sign in</h1>
            <p className="mt-2 text-sm text-muted">
              What you can see and do depends on your role.
            </p>
          </div>

          <div className="mt-8">
            <LoginForm accounts={accounts} demoPassword={DEMO_PASSWORD} />
          </div>
        </div>
      </div>

      {/* Role cheat-sheet — the RBAC model, visible rather than documented. */}
      <aside className="relative hidden flex-col justify-center border-l border-line bg-surface px-12 lg:flex">
        <p className="eyebrow">Role-based access</p>
        <h2 className="mt-3 max-w-sm text-2xl font-bold tracking-tight">
          Six roles. Everyone sees exactly what their job needs.
        </h2>
        <ul className="mt-8 max-w-md space-y-4">
          {(Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[]).map((role) => (
            <li key={role} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
              <div>
                <p className="text-sm font-semibold">{ROLE_LABELS[role]}</p>
                <p className="text-xs leading-relaxed text-muted">{ROLE_DESCRIPTIONS[role]}</p>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
