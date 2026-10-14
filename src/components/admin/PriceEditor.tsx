"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";
import {
  adjustStockAction,
  setPriceAction,
} from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/state";

function Save({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-outline btn-sm" disabled={pending}>
      {pending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      {label}
    </button>
  );
}

function Note({ state }: { state: ActionState }) {
  if (!state.error && !state.ok) return null;
  return (
    <p className="mt-1 text-xs font-medium" style={{ color: state.error ? "var(--danger)" : "var(--positive)" }}>
      {state.error ?? state.ok}
    </p>
  );
}

export function PriceField({ variantId, price }: { variantId: string; price: number }) {
  const [state, action] = useActionState<ActionState, FormData>(setPriceAction, IDLE);
  return (
    <div>
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="variantId" value={variantId} />
        <input
          name="price"
          type="number"
          min="0"
          step="1"
          defaultValue={price / 100}
          aria-label="Price in shillings"
          className="input !w-28 !py-1.5 text-sm tabular-nums"
        />
        <Save />
      </form>
      <Note state={state} />
    </div>
  );
}

export function StockAdjuster({ variantId }: { variantId: string }) {
  const [state, action] = useActionState<ActionState, FormData>(adjustStockAction, IDLE);
  return (
    <div>
      <form action={action} className="flex items-center gap-2">
        <input type="hidden" name="variantId" value={variantId} />
        <input
          name="delta"
          type="number"
          step="1"
          placeholder="+5"
          aria-label="Units to add or remove"
          className="input !w-24 !py-1.5 text-sm tabular-nums"
        />
        <Save label="Apply" />
      </form>
      <Note state={state} />
    </div>
  );
}
