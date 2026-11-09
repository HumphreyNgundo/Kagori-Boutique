"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, ArrowRight, Check, Loader2 } from "lucide-react";
import { subscribeAction } from "@/lib/actions/shop";
import { IDLE, type ActionState } from "@/lib/actions/state";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Subscribe"
      className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-white transition hover:bg-white/15 disabled:opacity-60"
    >
      {pending ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={22} />}
    </button>
  );
}

/**
 * Full-width sign-up band that opens the footer. The band is always a deep
 * violet, in light and dark theme alike, so its text is fixed white.
 */
export function Newsletter() {
  const [state, action] = useActionState<ActionState, FormData>(subscribeAction, IDLE);

  return (
    <section className="bg-gradient-to-br from-[#2b1b4d] via-[#4a0f8f] to-[#6b0fd0] text-white">
      <div className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-6 sm:py-16">
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
          Subscribe to our emails
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/80">
          Be the first to know about new arrivals, restocks and special offers.
        </p>
        <form action={action} className="relative mx-auto mt-8 max-w-lg">
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="Email address"
            className="w-full rounded-full border border-white/70 bg-transparent py-4 pl-6 pr-16 text-base text-white placeholder:text-white/65 outline-none transition focus:border-white focus:ring-2 focus:ring-white/40"
          />
          <Submit />
        </form>
        {(state.ok || state.error) && (
          <p role="status" className="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-white">
            {state.error ? <AlertCircle size={14} /> : <Check size={14} />}
            {state.error ?? state.ok}
          </p>
        )}
      </div>
    </section>
  );
}
