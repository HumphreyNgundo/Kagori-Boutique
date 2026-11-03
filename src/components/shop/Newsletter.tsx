"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, Loader2, Send } from "lucide-react";
import { subscribeAction } from "@/lib/actions/shop";
import { IDLE, type ActionState } from "@/lib/actions/state";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm shrink-0" disabled={pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
      {pending ? "Joining…" : "Subscribe"}
    </button>
  );
}

export function Newsletter() {
  const [state, action] = useActionState<ActionState, FormData>(subscribeAction, IDLE);

  return (
    <div>
      <p className="eyebrow mb-3">Newsletter</p>
      <p className="mb-3 text-sm leading-relaxed text-muted">
        New arrivals, restocks and offers — straight to your inbox.
      </p>
      <form action={action} className="flex gap-2">
        <label className="sr-only" htmlFor="newsletter-email">Email address</label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="input !py-2 text-sm"
        />
        <Submit />
      </form>
      {(state.ok || state.error) && (
        <p
          role="status"
          className="mt-2 flex items-center gap-1.5 text-xs font-medium"
          style={{ color: state.error ? "var(--danger)" : "var(--positive)" }}
        >
          {state.error ? <AlertCircle size={12} /> : <Check size={12} />}
          {state.error ?? state.ok}
        </p>
      )}
    </div>
  );
}
