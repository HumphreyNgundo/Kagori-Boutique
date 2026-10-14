"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary w-full !py-3" disabled={pending}>
      {pending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export function LoginForm({
  accounts,
  demoPassword,
}: {
  accounts: { email: string; role: string; name: string }[];
  demoPassword: string;
}) {
  const [state, action] = useActionState<LoginState, FormData>(loginAction, { error: null });
  const [email, setEmail] = useState(accounts[0]?.email ?? "");

  return (
    <div className="space-y-6">
      <form action={action} className="space-y-4">
        {state.error && (
          <p className="flex items-center gap-2 rounded-xl bg-[var(--danger-soft)] p-3 text-sm font-medium text-[var(--danger)]" role="alert">
            <AlertCircle size={15} /> {state.error}
          </p>
        )}
        <div>
          <label className="label" htmlFor="email">Work email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            defaultValue={demoPassword}
            className="input"
          />
        </div>
        <Submit />
      </form>

      <div className="rounded-2xl border border-dashed border-line-strong p-4">
        <p className="eyebrow">Demo accounts — tap to switch role</p>
        <ul className="mt-3 space-y-1.5">
          {accounts.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => setEmail(account.email)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-surface-2"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{account.name}</span>
                  <span className="block truncate text-xs text-subtle">{account.email}</span>
                </span>
                <span className="badge shrink-0 bg-[var(--brand-soft)] text-brand">{account.role}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-subtle">
          Password for every demo account: <strong className="text-ink">{demoPassword}</strong>
        </p>
      </div>
    </div>
  );
}
