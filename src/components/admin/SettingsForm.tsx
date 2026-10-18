"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, ImagePlus, Loader2, RotateCcw } from "lucide-react";
import {
  resetDemoAction,
  saveSettingsAction,
} from "@/lib/actions/admin";
import { backfillPhotosAction } from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/state";
import type { StoreSettings } from "@/lib/types";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

function Reset() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-outline btn-sm" disabled={pending}>
      {pending ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
      {pending ? "Restoring…" : "Restore demo data"}
    </button>
  );
}

function Feedback({ state }: { state: ActionState }) {
  if (!state.error && !state.ok) return null;
  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium"
      style={{
        background: state.error ? "var(--danger-soft)" : "var(--positive-soft)",
        color: state.error ? "var(--danger)" : "var(--positive)",
      }}
    >
      {state.error ? <AlertCircle size={13} /> : <Check size={13} />}
      {state.error ?? state.ok}
    </p>
  );
}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettingsAction, IDLE);

  return (
    <form action={action} className="space-y-5">
      <Feedback state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="storeName">Store name</label>
          <input id="storeName" name="storeName" defaultValue={settings.storeName} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="supportPhone">Support phone</label>
          <input id="supportPhone" name="supportPhone" defaultValue={settings.supportPhone} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="whatsapp">WhatsApp number (international format)</label>
          <input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="freeDeliveryOver">Free delivery over (KES)</label>
          <input
            id="freeDeliveryOver"
            name="freeDeliveryOver"
            type="number"
            min="0"
            step="100"
            defaultValue={settings.freeDeliveryOver / 100}
            className="input tabular-nums"
          />
        </div>
      </div>

      <fieldset>
        <legend className="label">Payment methods offered at checkout</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {([
            ["mpesaEnabled", "M-Pesa", settings.mpesaEnabled],
            ["cardEnabled", "Card", settings.cardEnabled],
            ["codEnabled", "Pay on delivery", settings.codEnabled],
          ] as const).map(([name, label, checked]) => (
            <label key={name} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-line p-3 text-sm">
              <input type="checkbox" name={name} defaultChecked={checked} className="h-4 w-4 accent-[var(--brand)]" />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <Save />
    </form>
  );
}

export function ResetDemo() {
  const [state, action] = useActionState<ActionState, FormData>(
    async (prev: ActionState) => resetDemoAction(prev),
    IDLE,
  );
  return (
    <form action={action} className="space-y-3">
      <Feedback state={state} />
      <Reset />
    </form>
  );
}

export function BackfillPhotos({ importable }: { importable: number }) {
  const [state, action] = useActionState<ActionState, FormData>(
    async (prev: ActionState) => backfillPhotosAction(prev),
    IDLE,
  );
  return (
    <form action={action} className="space-y-3">
      <Feedback state={state} />
      <button type="submit" className="btn btn-primary btn-sm">
        <ImagePlus size={14} />
        {importable ? `Add photos to ${importable} products` : "Re-check product photos"}
      </button>
    </form>
  );
}
