"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import {
  advanceOrderAction,
  assignRiderAction,
  confirmPaymentAction,
} from "@/lib/actions/admin";
import { IDLE, type ActionState } from "@/lib/actions/state";
import { STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "@/lib/types";

function Feedback({ state }: { state: ActionState }) {
  if (!state.error && !state.ok) return null;
  const danger = Boolean(state.error);
  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-medium"
      style={{
        background: danger ? "var(--danger-soft)" : "var(--positive-soft)",
        color: danger ? "var(--danger)" : "var(--positive)",
      }}
    >
      {danger ? <AlertCircle size={13} /> : <Check size={13} />}
      {state.error ?? state.ok}
    </p>
  );
}

function Pending({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
      {pending && <Loader2 size={13} className="animate-spin" />}
      {label}
    </button>
  );
}

export function AdvanceOrder({
  orderId,
  options,
  canCancel,
}: {
  orderId: string;
  options: OrderStatus[];
  canCancel: boolean;
}) {
  const [state, action] = useActionState<ActionState, FormData>(advanceOrderAction, IDLE);
  const visible = options.filter((o) => o !== "CANCELLED" || canCancel);

  if (!visible.length) {
    return <p className="text-xs text-subtle">This order is closed — no further steps.</p>;
  }

  return (
    <div className="space-y-3">
      <Feedback state={state} />
      {visible.map((status) => (
        <form key={status} action={action} className="space-y-2 rounded-xl border border-line p-3">
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="status" value={status} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold">
              {status === "CANCELLED" ? "Cancel order" : `Mark as ${STATUS_LABELS[status].toLowerCase()}`}
            </span>
            <Pending label={status === "CANCELLED" ? "Cancel" : "Confirm"} />
          </div>
          <input
            name="note"
            placeholder={status === "CANCELLED" ? "Reason (shown to the customer)" : "Add a note — optional"}
            className="input !py-2 text-xs"
          />
        </form>
      ))}
    </div>
  );
}

export function ConfirmPayment({ code }: { code: string }) {
  const [state, action] = useActionState<ActionState, FormData>(confirmPaymentAction, IDLE);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="code" value={code} />
      <Feedback state={state} />
      <Pending label="Mark payment received" />
    </form>
  );
}

export function AssignRider({
  orderId,
  riders,
  currentRiderId,
}: {
  orderId: string;
  riders: { id: string; name: string }[];
  currentRiderId: string | null;
}) {
  const [state, action] = useActionState<ActionState, FormData>(assignRiderAction, IDLE);
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      <Feedback state={state} />
      <div className="flex gap-2">
        <select name="riderId" defaultValue={currentRiderId ?? ""} className="input !py-2 text-sm" required>
          <option value="" disabled>Choose a rider…</option>
          {riders.map((rider) => (
            <option key={rider.id} value={rider.id}>{rider.name}</option>
          ))}
        </select>
        <Pending label="Assign" />
      </div>
    </form>
  );
}
