import { Check, Circle, PackageCheck, Truck, Wallet, X } from "lucide-react";
import { STATUS_LABELS } from "@/lib/order-status";
import type { OrderEvent, OrderStatus } from "@/lib/types";

const TONES: Record<OrderStatus, { bg: string; fg: string }> = {
  PENDING_PAYMENT: { bg: "var(--warning-soft)", fg: "var(--warning)" },
  CONFIRMED: { bg: "var(--accent-soft)", fg: "var(--accent)" },
  PACKED: { bg: "var(--brand-soft)", fg: "var(--brand)" },
  DISPATCHED: { bg: "var(--brand-soft)", fg: "var(--brand)" },
  READY_FOR_PICKUP: { bg: "var(--brand-soft)", fg: "var(--brand)" },
  DELIVERED: { bg: "var(--positive-soft)", fg: "var(--positive)" },
  CANCELLED: { bg: "var(--danger-soft)", fg: "var(--danger)" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const tone = TONES[status];
  return (
    <span className="badge" style={{ background: tone.bg, color: tone.fg }}>
      {status === "DELIVERED" && <Check size={12} />}
      {status === "CANCELLED" && <X size={12} />}
      {status === "DISPATCHED" && <Truck size={12} />}
      {status === "PENDING_PAYMENT" && <Wallet size={12} />}
      {STATUS_LABELS[status]}
    </span>
  );
}

/** The customer-facing journey. Cancelled orders drop out of the rail. */
const JOURNEY: { status: OrderStatus; label: string; blurb: string }[] = [
  { status: "PENDING_PAYMENT", label: "Order placed", blurb: "We have your order." },
  { status: "CONFIRMED", label: "Payment confirmed", blurb: "Payment received." },
  { status: "PACKED", label: "Packed", blurb: "Picked, checked and wrapped." },
  { status: "DISPATCHED", label: "On the way", blurb: "With the rider." },
  { status: "DELIVERED", label: "Delivered", blurb: "Enjoy!" },
];

export function TrackingRail({ status, fulfilment }: { status: OrderStatus; fulfilment: "DELIVERY" | "PICKUP" }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-[var(--danger-soft)] p-4 text-[var(--danger)]">
        <X size={18} />
        <div>
          <p className="text-sm font-bold">Order cancelled</p>
          <p className="text-xs">If this wasn&apos;t you, call us and we&apos;ll sort it out.</p>
        </div>
      </div>
    );
  }

  const steps = JOURNEY.map((s) =>
    s.status === "DISPATCHED" && fulfilment === "PICKUP"
      ? { status: "READY_FOR_PICKUP" as OrderStatus, label: "Ready for pickup", blurb: "Waiting at the shop." }
      : s,
  );
  const currentIndex = steps.findIndex((s) => s.status === status);

  return (
    <ol className="relative space-y-0">
      {steps.map((step, i) => {
        const done = i < currentIndex || status === "DELIVERED";
        const active = i === currentIndex;
        const colour = done || active ? "var(--brand)" : "var(--line-strong)";
        return (
          <li key={step.status} className="relative flex gap-4 pb-7 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className="absolute left-[11px] top-6 h-full w-0.5"
                style={{ background: done ? "var(--brand)" : "var(--line)" }}
              />
            )}
            <span
              className="relative z-10 grid h-6 w-6 shrink-0 place-items-center rounded-full"
              style={{
                background: done || active ? "var(--brand)" : "var(--card)",
                border: `2px solid ${colour}`,
                color: "var(--brand-contrast)",
              }}
            >
              {done ? <Check size={12} /> : active ? <Circle size={8} fill="currentColor" /> : null}
            </span>
            <div className={done || active ? "" : "opacity-50"}>
              <p className="text-sm font-semibold leading-6">{step.label}</p>
              <p className="text-xs text-muted">{step.blurb}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function EventLog({ events }: { events: OrderEvent[] }) {
  return (
    <ul className="space-y-3">
      {[...events].reverse().map((event) => (
        <li key={event.id} className="flex gap-3 text-sm">
          <PackageCheck size={14} className="mt-0.5 shrink-0 text-subtle" />
          <div className="min-w-0 flex-1">
            <p className="leading-snug">{event.note || STATUS_LABELS[event.status]}</p>
            <p className="mt-0.5 text-xs text-subtle">
              {new Date(event.createdAt).toLocaleString("en-KE", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {event.actorName}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
